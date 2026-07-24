import { Router } from "express";
import Hostel from "../models/Hostel.js";
import Review from "../models/Review.js";

const router = Router();

const GROQ_URL = "https://api.groq.com/openai/v1/chat/completions";
const MODEL_FAST = "llama-3.1-8b-instant";
const MODEL_SMART = "llama-3.3-70b-versatile";

async function groq(model, messages, { json = false } = {}) {
  const res = await fetch(GROQ_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      temperature: 0.3,
      max_tokens: 512,
      ...(json ? { response_format: { type: "json_object" } } : {}),
    }),
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(`Groq API error: ${err}`);
  }
  const data = await res.json();
  const text = data.choices[0].message.content;
  if (json) {
    try { return JSON.parse(text); } catch { return { raw: text }; }
  }
  return text;
}

/* ─────────────────────────────────────────────────────────────
   POST /api/ai/search
   Body: { query: "quiet female hostel under 6k" }
   Returns structured filters + a human-readable interpretation
───────────────────────────────────────────────────────────── */
router.post("/search", async (req, res) => {
  try {
    const { query } = req.body;
    if (!query?.trim()) return res.status(400).json({ error: "query is required" });

    const result = await groq(
      MODEL_SMART,
      [
        {
          role: "system",
          content: `You are a search assistant for ChukaNest, a hostel-finder app for Chuka University students in Kenya.
Extract structured filters from the user's natural-language search query and return ONLY a JSON object with these fields:
- "gender": "Female" | "Male" | "Mixed" | null
- "roomType": "Bedsitter" | "Single" | "Shared" | null
- "maxPrice": number (KES per month) | null
- "minRating": number (1-5) | null
- "amenities": array of strings from ["wifi","water","power","security","parking","laundry","study","cctv"] | []
- "sortBy": "rating" | "price_asc" | "distance" | null
- "summary": short human-readable sentence explaining what you understood (max 15 words)

Examples:
- "quiet female bedsitter near gate" → {"gender":"Female","roomType":"Bedsitter","maxPrice":null,"minRating":null,"amenities":[],"sortBy":"distance","summary":"Female bedsitters, sorted by distance to campus"}
- "cheap wifi under 5000" → {"gender":null,"roomType":null,"maxPrice":5000,"minRating":null,"amenities":["wifi"],"sortBy":"price_asc","summary":"Hostels with Wi-Fi under KES 5,000"}
- "top rated with security and cctv" → {"gender":null,"roomType":null,"maxPrice":null,"minRating":4,"amenities":["security","cctv"],"sortBy":"rating","summary":"Highest-rated hostels with security and CCTV"}`,
        },
        { role: "user", content: query },
      ],
      { json: true }
    );

    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   POST /api/ai/summarize/:hostelId
   Summarises reviews for a hostel in 1-2 sentences
───────────────────────────────────────────────────────────── */
router.post("/summarize/:hostelId", async (req, res) => {
  try {
    const reviews = await Review.find({ hostelId: req.params.hostelId, flagged: false })
      .select("user rating text")
      .limit(20);

    if (reviews.length === 0) {
      return res.json({ summary: null, count: 0 });
    }

    const hostel = await Hostel.findById(req.params.hostelId).select("name");
    const reviewText = reviews
      .map((r) => `${r.user} (${r.rating}/5): "${r.text}"`)
      .join("\n");

    const summary = await groq(MODEL_FAST, [
      {
        role: "system",
        content: `You summarise student hostel reviews into 1-2 sentences. Be specific — mention what students liked AND any common complaints. Keep it under 40 words. Do not start with "Students say" or "Reviews say". Just write the summary directly.`,
      },
      {
        role: "user",
        content: `Hostel: ${hostel?.name || "Unknown"}\n\nReviews:\n${reviewText}`,
      },
    ]);

    res.json({ summary: summary.trim(), count: reviews.length });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   POST /api/ai/recommend
   Body: { bookmarkedIds: [...], budget: number | null, gender: string | null }
   Returns up to 3 recommended hostels with a reason each
───────────────────────────────────────────────────────────── */
router.post("/recommend", async (req, res) => {
  try {
    const { bookmarkedIds = [], budget = null, gender = null } = req.body;

    // Fetch all active hostels
    const allHostels = await Hostel.find({ status: "active" }).select(
      "name gender roomType price distance rating reviewCount verified amenities description"
    );

    if (allHostels.length === 0) return res.json({ recommendations: [] });

    // Build context
    const hostelList = allHostels
      .map((h) => {
        const isFav = bookmarkedIds.includes(h._id.toString());
        return `ID:${h._id} | ${h.name} | ${h.gender} | ${h.roomType} | KES ${h.price}/mo | ${h.distance}km | Rating:${h.rating} | ${h.verified ? "Verified" : "Unverified"} | Amenities:${h.amenities.join(",")}${isFav ? " | [BOOKMARKED]" : ""}`;
      })
      .join("\n");

    const userContext = [
      budget ? `Budget: up to KES ${budget}/month` : null,
      gender ? `Gender preference: ${gender}` : null,
      bookmarkedIds.length > 0 ? `User has bookmarked ${bookmarkedIds.length} hostel(s)` : "User has no bookmarks yet",
    ]
      .filter(Boolean)
      .join(". ");

    const result = await groq(
      MODEL_SMART,
      [
        {
          role: "system",
          content: `You are a hostel recommendation assistant for ChukaNest. Given a list of hostels and a student's preferences, pick the 3 best matches they have NOT already bookmarked. Return ONLY a JSON object:
{"recommendations": [{"id": "<hostel _id>", "reason": "<one specific sentence why this hostel suits this student, max 15 words>"}]}
Pick hostels that match the student's budget, gender preference, and are highly rated. Avoid already-bookmarked hostels.`,
        },
        {
          role: "user",
          content: `Student context: ${userContext || "No specific preferences"}\n\nAvailable hostels:\n${hostelList}`,
        },
      ],
      { json: true }
    );

    // Enrich with full hostel data
    const recs = (result.recommendations || []).slice(0, 3).map((r) => {
      const hostel = allHostels.find((h) => h._id.toString() === r.id);
      if (!hostel) return null;
      return { hostel: { ...hostel.toObject(), id: hostel._id }, reason: r.reason };
    }).filter(Boolean);

    res.json({ recommendations: recs });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

/* ─────────────────────────────────────────────────────────────
   POST /api/ai/chat
   Body: { messages: [{role, content}] }
   Streams an SSE response from Groq with hostel context injected
───────────────────────────────────────────────────────────── */
router.post("/chat", async (req, res) => {
  try {
    const { messages = [] } = req.body;

    const hostels = await Hostel.find({ status: "active" })
      .select("name gender roomType price distance rating amenities verified")
      .lean();

    const hostelList = hostels
      .map(
        (h) =>
          `• ${h.name} — ${h.gender}, ${h.roomType}, KES ${h.price?.toLocaleString()}/mo, ${h.distance}km from campus, ⭐${h.rating}, amenities: ${h.amenities?.join(", ")}`
      )
      .join("\n");

    const systemPrompt = `You are ChukaNest Assistant, a helpful and friendly AI for Chuka University students searching for hostels near campus in Kenya.

Currently available hostels:
${hostelList}

Your job:
- Help students find the right hostel based on their budget, gender, room type, or amenity preferences.
- When a student describes what they want, suggest specific hostels by name from the list above.
- Answer questions about hostel life, pricing, distance to campus, and amenities.
- Keep responses concise (under 100 words unless detail is clearly needed).
- Be warm, encouraging, and direct. Do not make up hostels not listed above.`;

    const groqRes = await fetch(GROQ_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: MODEL_FAST,
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        temperature: 0.65,
        max_tokens: 512,
        stream: true,
      }),
    });

    if (!groqRes.ok) {
      const err = await groqRes.text();
      return res.status(500).json({ error: err });
    }

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache");
    res.setHeader("Connection", "keep-alive");

    const reader = groqRes.body.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      res.write(decoder.decode(value, { stream: true }));
    }
    res.end();
  } catch (err) {
    if (!res.headersSent) res.status(500).json({ error: err.message });
  }
});

export default router;
