import { Router } from "express";
import Payment from "../models/Payment.js";
import User from "../models/User.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();
const PREMIUM_PRICE = 400;

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

// GET /api/payments/status — current user's premium entitlement.
router.get("/status", requireAuth, async (req, res) => {
  const user = await User.findById(req.user.id).select("premiumUntil phone");
  const premiumUntil = user?.premiumUntil && new Date(user.premiumUntil) > new Date() ? user.premiumUntil : null;
  res.json({ active: !!premiumUntil, premiumUntil, phone: user?.phone || "" });
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
        const start = user?.premiumUntil && new Date(user.premiumUntil) > new Date() ? new Date(user.premiumUntil) : new Date();
        const expiresAt = new Date(start.getTime() + 30 * 24 * 60 * 60 * 1000);
        payment.paidAt = new Date();
        payment.expiresAt = expiresAt;
        await User.findByIdAndUpdate(payment.user, { premiumUntil: expiresAt });
      }
      await payment.save();
    }
    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  } catch (err) {
    console.error("M-Pesa callback error", err);
    res.json({ ResultCode: 0, ResultDesc: "Accepted" });
  }
});

// GET /api/payments — admin payment table.
router.get("/", requireAuth, requireAdmin, async (_req, res) => {
  try {
    const payments = await Payment.find().populate("user", "name email phone").sort({ createdAt: -1 }).limit(500);
    res.json(payments);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
