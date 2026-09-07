import { Router } from "express";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import Hostel from "../models/Hostel.js";
import { requireAuth, requireAdmin, requireOwner } from "../middleware/auth.js";

const router = Router();
const PREMIUM_PRICE = 400;
const OWNER_PRICE = 999;
const SUBSCRIPTION_DAYS = 30;

function normalizePhone(value = "") {
  const raw = String(value).replace(/[^0-9+]/g, "");
  if (raw.startsWith("07") || raw.startsWith("01")) return `254${raw.slice(1)}`;
  if (raw.startsWith("+254")) return raw.slice(1);
  if (raw.startsWith("254")) return raw;
  return raw;
}

function darajaConfigured() {
  return process.env.MPESA_CONSUMER_KEY && process.env.MPESA_CONSUMER_SECRET && process.env.MPESA_SHORTCODE && process.env.MPESA_PASSKEY && process.env.MPESA_CALLBACK_URL;
}

function temporaryPaymentMode() {
  return process.env.MPESA_TEMPORARY_MODE !== "false";
}

async function darajaToken() {
  const auth = Buffer.from(`${process.env.MPESA_CONSUMER_KEY}:${process.env.MPESA_CONSUMER_SECRET}`).toString("base64");
  const response = await fetch(`${process.env.MPESA_ENV === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke"}/oauth/v1/generate?grant_type=client_credentials`, {
    headers: { Authorization: `Basic ${auth}` },
  });
  const data = await response.json();
  if (!response.ok || !data.access_token) throw new Error(data.errorMessage || "Could not authenticate with M-Pesa");
  return data.access_token;
}

function timestamp() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}${pad(d.getMonth() + 1)}${pad(d.getDate())}${pad(d.getHours())}${pad(d.getMinutes())}${pad(d.getSeconds())}`;
}

function extendFrom(currentUntil) {
  const current = currentUntil && new Date(currentUntil) > new Date() ? new Date(currentUntil) : new Date();
  return new Date(current.getTime() + SUBSCRIPTION_DAYS * 24 * 60 * 60 * 1000);
}

async function activateOwnerSubscription(userId, phone, expiresAt) {
  await User.findByIdAndUpdate(userId, { phone, ownerSubscriptionUntil: expiresAt });
  await Hostel.updateMany({ owner: userId }, { ownerVisibleUntil: expiresAt });
}

// GET /api/payments/status — current user's premium entitlement.
router.get("/status", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select("premiumUntil phone");
  const premiumUntil = user?.premiumUntil && new Date(user.premiumUntil) > new Date() ? user.premiumUntil : null;
  res.json({ active: !!premiumUntil, premiumUntil, phone: user?.phone || "" });
});

// GET /api/payments/owner-status — current owner's listing entitlement.
router.get("/owner-status", requireAuth, requireOwner, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("ownerSubscriptionUntil phone");
    const ownerSubscriptionUntil = user?.ownerSubscriptionUntil && new Date(user.ownerSubscriptionUntil) > new Date()
      ? user.ownerSubscriptionUntil
      : null;
    const listingCount = await Hostel.countDocuments({ owner: req.user.id });
    res.json({
      active: !!ownerSubscriptionUntil,
      ownerSubscriptionUntil,
      phone: user?.phone || "",
      amount: OWNER_PRICE,
      listingCount,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/payments/owner-stk — starts a KES 999, 30-day owner listing subscription.
router.post("/owner-stk", requireAuth, requireOwner, async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    if (!/^254(7|1)\d{8}$/.test(phone)) return res.status(400).json({ error: "Enter a valid Safaricom number, e.g. 0712345678" });

    if (!darajaConfigured() && temporaryPaymentMode()) {
      const user = await User.findById(req.user.id);
      const expiresAt = extendFrom(user?.ownerSubscriptionUntil);
      const payment = await Payment.create({
        user: req.user.id,
        phone,
        amount: OWNER_PRICE,
        type: "owner_subscription",
        status: "completed",
        paidAt: new Date(),
        expiresAt,
        resultDescription: "Temporary test owner subscription — no live M-Pesa charge",
      });
      await activateOwnerSubscription(req.user.id, phone, expiresAt);
      return res.json({ ok: true, temporary: true, paymentId: payment.id, expiresAt, message: "Temporary payment recorded. Your listings are visible for 30 days." });
    }
    if (!darajaConfigured()) return res.status(503).json({ error: "M-Pesa payments are not configured yet. Add the Daraja credentials and callback URL first." });

    const token = await darajaToken();
    const now = timestamp();
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${now}`).toString("base64");
    const base = process.env.MPESA_ENV === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
    const response = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: now,
        TransactionType: "CustomerPayBillOnline",
        Amount: OWNER_PRICE,
        PartyA: phone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: "ChukaNest Owner Listing",
        TransactionDesc: "ChukaNest 30-day owner listing visibility",
      }),
    });
    const data = await response.json();
    if (!response.ok || data.ResponseCode !== "0") return res.status(502).json({ error: data.errorMessage || data.ResponseDescription || "M-Pesa owner payment request failed" });

    const payment = await Payment.create({
      user: req.user.id,
      phone,
      amount: OWNER_PRICE,
      type: "owner_subscription",
      merchantRequestId: data.MerchantRequestID,
      checkoutRequestId: data.CheckoutRequestID,
    });
    await User.findByIdAndUpdate(req.user.id, { phone });
    res.json({ ok: true, paymentId: payment.id, checkoutRequestId: data.CheckoutRequestID, message: "Check your phone and enter your M-Pesa PIN." });
  } catch (err) {
    res.status(502).json({ error: err.message || "Could not start owner payment" });
  }
});

// POST /api/payments/stk — starts a KES 400, 30-day premium subscription request.
router.post("/stk", requireAuth, async (req, res) => {
  try {
    const phone = normalizePhone(req.body.phone);
    if (!/^254(7|1)\d{8}$/.test(phone)) return res.status(400).json({ error: "Enter a valid Safaricom number, e.g. 0712345678" });
    if (!darajaConfigured() && temporaryPaymentMode()) {
      const user = await User.findById(req.user.id);
      const start = user?.premiumUntil && new Date(user.premiumUntil) > new Date() ? new Date(user.premiumUntil) : new Date();
      const expiresAt = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
      const payment = await Payment.create({ user: req.user.id, phone, amount: PREMIUM_PRICE, status: "completed", paidAt: new Date(), expiresAt, resultDescription: "Temporary test payment — no live M-Pesa charge" });
      await User.findByIdAndUpdate(req.user.id, { phone, premiumUntil: expiresAt });
      return res.json({ ok: true, temporary: true, paymentId: payment.id, expiresAt, message: "Temporary payment recorded. Premium access is active for 30 days." });
    }
    if (!darajaConfigured()) return res.status(503).json({ error: "M-Pesa payments are not configured yet. Add the Daraja credentials and callback URL first." });

    const token = await darajaToken();
    const now = timestamp();
    const password = Buffer.from(`${process.env.MPESA_SHORTCODE}${process.env.MPESA_PASSKEY}${now}`).toString("base64");
    const base = process.env.MPESA_ENV === "production" ? "https://api.safaricom.co.ke" : "https://sandbox.safaricom.co.ke";
    const response = await fetch(`${base}/mpesa/stkpush/v1/processrequest`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        BusinessShortCode: process.env.MPESA_SHORTCODE,
        Password: password,
        Timestamp: now,
        TransactionType: "CustomerPayBillOnline",
        Amount: PREMIUM_PRICE,
        PartyA: phone,
        PartyB: process.env.MPESA_SHORTCODE,
        PhoneNumber: phone,
        CallBackURL: process.env.MPESA_CALLBACK_URL,
        AccountReference: "ChukaNest Premium",
        TransactionDesc: "ChukaNest 30-day premium access",
      }),
    });
    const data = await response.json();
    if (!response.ok || data.ResponseCode !== "0") return res.status(502).json({ error: data.errorMessage || data.ResponseDescription || "M-Pesa STK request failed" });

    const payment = await Payment.create({ user: req.user.id, phone, amount: PREMIUM_PRICE, merchantRequestId: data.MerchantRequestID, checkoutRequestId: data.CheckoutRequestID });
    await User.findByIdAndUpdate(req.user.id, { phone });
    res.json({ ok: true, paymentId: payment.id, checkoutRequestId: data.CheckoutRequestID, message: "Check your phone and enter your M-Pesa PIN." });
  } catch (err) {
    res.status(502).json({ error: err.message || "Could not start M-Pesa payment" });
  }
});

// Safaricom calls this endpoint after the customer completes or cancels the STK prompt.
router.post("/callback", async (req, res) => {
  try {
    const callback = req.body?.Body?.stkCallback;
    if (!callback?.CheckoutRequestID) return res.json({ ResultCode: 0, ResultDesc: "Accepted" });
    const items = callback.CallbackMetadata?.Item || [];
    const value = (name) => items.find((item) => item.Name === name)?.Value;
    const payment = await Payment.findOne({ checkoutRequestId: callback.CheckoutRequestID });
    if (payment) {
      payment.status = Number(callback.ResultCode) === 0 ? "completed" : "failed";
      payment.resultCode = Number(callback.ResultCode);
      payment.resultDescription = callback.ResultDesc;
      payment.rawCallback = req.body;
      payment.mpesaReceiptNumber = value("MpesaReceiptNumber");
      if (payment.status === "completed") {
        const user = await User.findById(payment.user);
        const expiresAt = payment.type === "owner_subscription"
          ? extendFrom(user?.ownerSubscriptionUntil)
          : extendFrom(user?.premiumUntil);
        payment.paidAt = new Date();
        payment.expiresAt = expiresAt;
        if (payment.type === "owner_subscription") {
          await activateOwnerSubscription(payment.user, payment.phone, expiresAt);
        } else {
          await User.findByIdAndUpdate(payment.user, { premiumUntil: expiresAt });
        }
      }
      await payment.save();
    }
    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("M-Pesa callback error", err);
    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
});

// POST /api/payments/admin-owner-manual — records an offline owner payment.
// This is intentionally admin-only and activates the same entitlement as a
// successful owner M-Pesa payment.
router.post("/admin-owner-manual", requireAuth, requireAdmin, async (req, res) => {
  try {
    const ownerId = String(req.body.ownerId || "").trim();
    const amount = Number(req.body.amount);
    const days = Number(req.body.days || SUBSCRIPTION_DAYS);
    const phone = normalizePhone(req.body.phone || "");
    const transactionCode = String(req.body.transactionCode || req.body.receipt || "").trim().toUpperCase();
    const paidAt = req.body.paidAt ? new Date(req.body.paidAt) : new Date();
    const notes = String(req.body.notes || "").trim();

    if (!ownerId || !Number.isFinite(amount) || amount <= 0 || !transactionCode) {
      return res.status(400).json({ error: "Select an owner, enter a valid amount, and provide the M-Pesa transaction code." });
    }
    if (!Number.isInteger(days) || days < 1 || days > 365) {
      return res.status(400).json({ error: "Access duration must be a whole number between 1 and 365 days." });
    }
    if (phone && !/^254(7|1)\d{8}$/.test(phone)) {
      return res.status(400).json({ error: "Enter a valid phone number, e.g. 0712345678" });
    }
    if (Number.isNaN(paidAt.getTime())) {
      return res.status(400).json({ error: "Enter a valid payment date." });
    }

    const owner = await User.findOne({ _id: ownerId, role: "owner" });
    if (!owner) return res.status(404).json({ error: "Owner account not found" });
    const duplicate = await Payment.exists({ mpesaReceiptNumber: transactionCode });
    if (duplicate) return res.status(409).json({ error: "This M-Pesa transaction code has already been recorded." });

    const current = owner.ownerSubscriptionUntil && new Date(owner.ownerSubscriptionUntil) > new Date()
      ? new Date(owner.ownerSubscriptionUntil)
      : new Date();
    const expiresAt = new Date(current.getTime() + days * 24 * 60 * 60 * 1000);
    const payment = await Payment.create({
      user: owner._id,
      phone: phone || owner.phone || "",
      amount,
      type: "owner_subscription",
      status: "completed",
      paymentMethod: "manual",
      mpesaReceiptNumber: transactionCode,
      notes: notes || undefined,
      recordedBy: req.user.id,
      paidAt,
      expiresAt,
      resultDescription: "Recorded manually by an administrator",
    });

    await activateOwnerSubscription(owner._id, phone || owner.phone || "", expiresAt);
    const saved = await Payment.findById(payment._id)
      .populate("user", "name email phone")
      .populate("recordedBy", "name email");
    res.status(201).json(saved);
  } catch (err) {
    if (err.name === "CastError") return res.status(400).json({ error: "Invalid owner account" });
    res.status(400).json({ error: err.message || "Could not record manual payment" });
  }
});

// GET /api/payments — admin payment table.
router.get("/", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const payments = await Payment.find()
      .populate("user", "name email phone role")
      .populate("recordedBy", "name email")
      .sort({ createdAt: -1 })
      .limit(500);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
