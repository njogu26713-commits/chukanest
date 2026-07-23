import { Router } from "express";
import Hostel from "../models/Hostel.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/hostels  — list active hostels (optional ?status=pending for admin)
router.get("/", async (req, res) => {
  try {
    const { status } = req.query;
    const filter = status ? { status } : { status: "active" };
    const hostels = await Hostel.find(filter).sort({ rating: -1 });
    res.json(hostels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/hostels/:id
router.get("/:id", async (req, res) => {
  try {
    const hostel = await Hostel.findById(req.params.id);
    if (!hostel) return res.status(404).json({ error: "Not found" });
    res.json(hostel);
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
    const hostel = await Hostel.findByIdAndUpdate(req.params.id, req.body, { new: true });
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
