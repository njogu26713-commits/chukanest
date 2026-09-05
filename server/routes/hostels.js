import { Router } from "express";
import Hostel from "../models/Hostel.js";
import { requireAuth, requireAdmin, optionalAuth } from "../middleware/auth.js";

const router = Router();

function hasPremiumAccess(req) {
  return req.user?.role === "admin" || (req.user?.premiumUntil && new Date(req.user.premiumUntil) > new Date());
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

// GET /api/hostels — active hostels; premium listings remain visible as locked catalogue entries.
router.get("/", optionalAuth, async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : { status: "active" };
    const hostels = await Hostel.find(filter).sort({ rating: -1 });
    res.json(hostels.map((hostel) => present(hostel, hasPremiumAccess(req))));
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hostels/:id
router.get("/:id", optionalAuth, async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) return res.status(404).json({ error: "Not found" });
    res.json(present(hostel, hasPremiumAccess(req)));
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
