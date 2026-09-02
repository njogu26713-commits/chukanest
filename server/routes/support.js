import { Router } from "express";
import SupportSettings, { DEFAULT_SUPPORT_SETTINGS } from "../models/SupportSettings.js";
import ContactMessage from "../models/ContactMessage.js";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

async function getOrCreateSettings() {
  let settings = await SupportSettings.findOne({ key: "default" }).lean();
  if (!settings) {
    settings = await SupportSettings.create(DEFAULT_SUPPORT_SETTINGS);
    settings = settings.toObject();
  }
  return settings;
}

// GET /api/support — public support contacts and FAQs
router.get("/", async (_req, res) => {
  try {
    res.json(await getOrCreateSettings());
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/support/contact — public contact form submission
router.post("/contact", async (req, res) => {
  try {
    const { name, email, topic, message } = req.body || {};
    const allowedTopics = ["General question", "Hostel listing", "Review or report", "Account help", "Safety concern", "Other"];
    if (!String(name || "").trim() || !String(email || "").trim() || !String(topic || "").trim() || !String(message || "").trim()) {
      return res.status(400).json({ error: "Please complete all contact form fields" });
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(email).trim())) {
      return res.status(400).json({ error: "Please enter a valid email address" });
    }
    if (!allowedTopics.includes(topic)) return res.status(400).json({ error: "Please choose a valid topic" });
    const submission = await ContactMessage.create({ name, email, topic, message });
    res.status(201).json({ ok: true, id: submission._id });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// PATCH /api/support — admin-only support content management
router.patch("/", requireAuth, requireAdmin, async (req, res) => {
  try {
    const allowed = ["supportPhone", "whatsappNumber", "email", "officeHours", "faqs"];
    const updates = Object.fromEntries(Object.entries(req.body || {}).filter(([key]) => allowed.includes(key)));
    if (updates.faqs !== undefined) {
      if (!Array.isArray(updates.faqs)) return res.status(400).json({ error: "FAQs must be an array" });
      updates.faqs = updates.faqs
        .filter((faq) => faq && String(faq.question || "").trim() && String(faq.answer || "").trim())
        .map((faq) => ({ question: String(faq.question).trim(), answer: String(faq.answer).trim() }));
    }

    const settings = await SupportSettings.findOneAndUpdate(
      { key: "default" },
      { $set: updates, $setOnInsert: DEFAULT_SUPPORT_SETTINGS },
      { new: true, upsert: true, runValidators: true }
    );
    res.json(settings);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

export default router;
