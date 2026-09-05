import { Router } from "express";
import Hostel from "../models/Hostel.js";
import User from "../models/User.js";
import { requireAuth, requireAdmin, optionalAuth } from "../middleware/auth.js";

const router = Router();

async function hasPremiumAccess(req) {
  if (!req.user?.id) return false;
  const user = await User.findById(req.user.id).select("premiumUntil");
  return !!(user?.premiumUntil && new Date(user.premiumUntil) > new Date());
}

function present(hostel, unlocked) {
  const item = hostel.toObject ? hostel.toObject() : { ...hostel };
  const locked = item.accessLevel === "premium" && !unlocked;
  item.isLocked = locked;
  if (locked) {
    // Keep catalogue discovery useful, but do not expose contact details or the full media gallery.
    item.phone = "";
    item.description = "Upgrade to Premium to view the full listing, contact details and photos.";
    item.images = item.images?.slice(0, 1) || [];
    item.amenities = [];
    item.rules = [];
  }
  return item;
}

// GET /api/hostels — free listings for ordinary users; premium listings only after payment.
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const unlocked = await hasPremiumAccess(req);
    const adminView = status && req.user?.role === "admin";
    const filter = status
      ? { status, ...(adminView ? {} : { accessLevel: "free" }) }
      : { status: "active", ...(unlocked ? {} : { accessLevel: "free" }) };
    const hostels = await Hostel.find(filter).sort({ rating: -1 });
    res.json(hostels.map((hostel) => present(hostel, unlocked)));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Public count used only to show the upgrade prompt without exposing premium listings.
router.get("/premium-availability", async (_req, res) => {
  try {
    const count = await Hostel.countDocuments({ status: "active", accessLevel: "premium" });
    res.json({ count });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hostels/:id
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) return res.status(404).json({ error: "Not found" });
    const unlocked = await hasPremiumAccess(req);
    if (hostel.accessLevel === "premium" && !unlocked) return res.status(404).json({ error: "Not found" });
    res.json(present(hostel, unlocked));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/hostels — admin only
router.post("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const hostel = await Hostel.create(req.body);
    res.status(201).json(hostel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/hostels/:id — admin only
router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const hostel = await Hostel.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
    if (!hostel) return res.status(404).json({ error: "Not found" });
    res.json(hostel);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE /api/hostels/:id — admin only
router.delete("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    await Hostel.findByIdAndDelete(req.params.id);
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
