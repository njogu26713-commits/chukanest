import { Router } from "express";
import User from "../models/User.js";
import Hostel from "../models/Hostel.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

// GET /api/users — admin only
router.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select("-password").sort({ createdAt: 1 });
    const formatted = users.map((u) => ({
      id: u._id,
      name: u.name,
      email: u.email,
      role: u.role,
      joined: u.createdAt.toLocaleString("en-US", { month: "short", year: "numeric" }),
      bookmarks: u.bookmarks.length,
      status: u.status,
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/users/:id — admin only (suspend/unsuspend)
router.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const user = await User.findByIdAndUpdate(req.params.id, req.body, { new: true }).select("-password");
    if (!user) return res.status(404).json({ error: "Not found" });
    res.json(user);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// GET /api/users/me/bookmarks
router.get("/me/bookmarks", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).populate("bookmarks");
    res.json(user.bookmarks);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/users/me/bookmarks/:hostelId
router.post("/me/bookmarks/:hostelId", requireAuth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    const hid = req.params.hostelId;
    const idx = user.bookmarks.findIndex((b) => b.toString() === hid);
    let added;
    if (idx > -1) {
      user.bookmarks.splice(idx, 1);
      added = false;
    } else {
      user.bookmarks.push(hid);
      added = true;
    }
    await user.save();
    res.json({ bookmarks: user.bookmarks, added });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
