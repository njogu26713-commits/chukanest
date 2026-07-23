import { Router } from "express";
import Review from "../models/Review.js";
import Hostel from "../models/Hostel.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router({ mergeParams: true });

// GET /api/hostels/:hostelId/reviews
router.get("/", async (req, res) => {
  try {
    const reviews = await Review.find({ hostelId: req.params.hostelId, flagged: false }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/hostels/:hostelId/reviews
router.post("/", requireAuth, async (req, res) => {
  try {
    const { rating, text } = req.body;
    if (!rating || !text) return res.status(400).json({ error: "Rating and text are required" });

    const review = await Review.create({
      hostelId: req.params.hostelId,
      user: req.user.name,
      rating,
      text,
    });

    // Recalculate hostel rating
    const allReviews = await Review.find({ hostelId: req.params.hostelId, flagged: false });
    const avg = allReviews.reduce((s, r) => s + r.rating, 0) / allReviews.length;
    await Hostel.findByIdAndUpdate(req.params.hostelId, {
      rating: Math.round(avg * 10) / 10,
      reviewCount: allReviews.length,
    });

    res.status(201).json(review);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/reviews/flagged — admin only
const flaggedRouter = Router();
flaggedRouter.get("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const reviews = await Review.find({ flagged: true }).populate("hostelId", "name").sort({ updatedAt: -1 });
    const formatted = reviews.map((r) => ({
      id: r._id,
      hostel: r.hostelId?.name || "Unknown",
      user: r.user,
      text: r.text,
      flaggedBy: r.flaggedBy,
      date: timeAgo(r.updatedAt),
    }));
    res.json(formatted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PATCH /api/reviews/:id — keep or remove (admin)
flaggedRouter.patch("/:id", requireAuth, requireAdmin, async (req, res) => {
  try {
    const { action } = req.body; // "keep" or "remove"
    if (action === "remove") {
      await Review.findByIdAndDelete(req.params.id);
    } else {
      await Review.findByIdAndUpdate(req.params.id, { flagged: false, flaggedBy: "" });
    }
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

function timeAgo(date) {
  const diff = Date.now() - new Date(date).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return mins <= 1 ? "Just now" : `${mins} minutes ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} hour${hrs > 1 ? "s" : ""} ago`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} day${days > 1 ? "s" : ""} ago`;
  const weeks = Math.floor(days / 7);
  return `${weeks} week${weeks > 1 ? "s" : ""} ago`;
}

export { flaggedRouter };
export default router;
