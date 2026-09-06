import { Router } from "express";
import crypto from "node:crypto";
import Hostel from "../models/Hostel.js";
import User from "../models/User.js";
import { requireAuth, requireOwner } from "../middleware/auth.js";

const router = Router();

const LISTING_FIELDS = [
  "name",
  "location",
  "roomType",
  "price",
  "billingPeriod",
  "distance",
  "availableRooms",
  "contactRole",
  "phone",
  "images",
  "amenities",
  "description",
  "rules",
  "latlng",
];

function pickListing(body = {}) {
  const listing = {};
  for (const field of LISTING_FIELDS) {
    if (body[field] !== undefined) listing[field] = body[field];
  }

  if (listing.price !== undefined) listing.price = Number(listing.price);
  if (listing.distance !== undefined) listing.distance = Number(listing.distance);
  if (listing.availableRooms !== undefined) listing.availableRooms = Number(listing.availableRooms);
  if (listing.images !== undefined) listing.images = Array.isArray(listing.images) ? listing.images.filter(Boolean).map(String) : [];
  if (listing.amenities !== undefined) listing.amenities = Array.isArray(listing.amenities) ? listing.amenities.filter(Boolean).map(String) : [];
  if (listing.rules !== undefined) listing.rules = Array.isArray(listing.rules) ? listing.rules.filter(Boolean).map(String) : [];
  if (listing.latlng !== undefined) listing.latlng = Array.isArray(listing.latlng) ? listing.latlng.map(Number) : [];
  return listing;
}

function activeUntil(user) {
  return user?.ownerSubscriptionUntil && new Date(user.ownerSubscriptionUntil) > new Date()
    ? new Date(user.ownerSubscriptionUntil)
    : null;
}

async function generateOwnerToken() {
  for (let attempt = 0; attempt < 5; attempt += 1) {
    const token = `CN-${crypto.randomBytes(9).toString("base64url").replace(/[-_]/g, "").slice(0, 12).toUpperCase()}`;
    if (!(await Hostel.exists({ ownerToken: token }))) return token;
  }
  throw new Error("Could not generate a unique listing token");
}

// GET /api/owner/me
router.get("/me", requireAuth, requireOwner, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("name email phone ownerSubscriptionUntil");
    if (!user) return res.status(404).json({ error: "Owner account not found" });
    const until = activeUntil(user);
    res.json({
      user: { id: user._id, name: user.name, email: user.email, phone: user.phone || "" },
      active: !!until,
      ownerSubscriptionUntil: until,
      amount: 999,
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/owner/listings
router.get("/listings", requireAuth, requireOwner, async (req, res) => {
  try {
    const listings = await Hostel.find({ owner: req.user.id }).sort({ createdAt: -1 });
    res.json(listings);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/owner/listings — requires an active KSh 999 entitlement.
router.post("/listings", requireAuth, requireOwner, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("ownerSubscriptionUntil");
    const until = activeUntil(user);
    if (!until) {
      return res.status(402).json({ error: "Pay KSh 999 for 30 days of listing visibility before uploading a house." });
    }

    const data = pickListing(req.body);
    const ownerToken = await generateOwnerToken();
    const hostel = await Hostel.create({
      ...data,
      owner: req.user.id,
      ownerToken,
      ownerVisibleUntil: until,
      accessLevel: "free",
      status: "active",
      verified: false,
    });
    res.status(201).json(hostel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/owner/listings/:id — owners can edit only their own listings.
router.patch("/listings/:id", requireAuth, requireOwner, async (req, res) => {
  try {
    const existing = await Hostel.findOne({ _id: req.params.id, owner: req.user.id });
    if (!existing) return res.status(404).json({ error: "Listing not found" });

    const data = pickListing(req.body);
    Object.assign(existing, data);
    existing.accessLevel = "free";
    existing.owner = req.user.id;
    await existing.save();
    res.json(existing);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/owner/listings/:id
router.delete("/listings/:id", requireAuth, requireOwner, async (req, res) => {
  try {
    const deleted = await Hostel.findOneAndDelete({ _id: req.params.id, owner: req.user.id });
    if (!deleted) return res.status(404).json({ error: "Listing not found" });
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
