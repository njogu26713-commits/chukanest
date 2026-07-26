import { Router } from "express";
import jwt from "jsonwebtoken";
import { OAuth2Client } from "google-auth-library";
import User from "../models/User.js";

const router = Router();
const JWT_SECRET = process.env.SESSION_SECRET || "dev-secret";

function signToken(user) {
  return jwt.sign(
    { id: user._id, email: user.email, role: user.role, name: user.name },
    JWT_SECRET,
    { expiresIn: "7d" }
  );
}

function userPayload(user) {
  return { id: user._id, name: user.name, email: user.email, role: user.role, provider: user.provider };
}

// GET /api/auth/config — tells the frontend which features are enabled
router.get("/config", (_req, res) => {
  res.json({
    googleClientId: process.env.GOOGLE_CLIENT_ID || null,
    adminCodeEnabled: !!process.env.ADMIN_INVITE_CODE,
  });
});

// POST /api/auth/signup
router.post("/signup", async (req, res) => {
  try {
    const { name, email, password, adminCode } = req.body;
    if (!name || !email || !password)
      return res.status(400).json({ error: "Name, email and password are required" });

    const existing = await User.findOne({ email: email.toLowerCase() });
    if (existing) return res.status(409).json({ error: "Email already registered" });

    // Determine role from admin invite code
    let role = "student";
    if (adminCode && adminCode.trim()) {
      const validCode = process.env.ADMIN_INVITE_CODE;
      if (!validCode) return res.status(400).json({ error: "Admin registration is not enabled" });
      if (adminCode.trim() !== validCode) return res.status(401).json({ error: "Invalid admin invite code" });
      role = "admin";
    }

    const user = await User.create({ name, email, password, role, provider: "local" });
    const token = signToken(user);
    res.json({ token, user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/login
router.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ error: "Email and password are required" });

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) return res.status(401).json({ error: "Invalid email or password" });

    if (user.provider === "google" && !user.password) {
      return res.status(401).json({ error: "This account uses Google sign-in. Please continue with Google." });
    }

    const ok = await user.comparePassword(password);
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    const token = signToken(user);
    res.json({ token, user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/auth/google — verify Google access token and sign in / create user
router.post("/google", async (req, res) => {
  try {
    const { credential, adminCode } = req.body;
    if (!credential) return res.status(400).json({ error: "Google credential is required" });

    const clientId = process.env.GOOGLE_CLIENT_ID;
    if (!clientId) return res.status(503).json({ error: "Google sign-in is not configured yet" });

    // Fetch user info from Google using the access token
    const googleRes = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
      headers: { Authorization: `Bearer ${credential}` },
    });
    if (!googleRes.ok) return res.status(401).json({ error: "Invalid Google token" });
    const payload = await googleRes.json();

    const { sub: googleId, email, name, picture } = payload;
    if (!email) return res.status(400).json({ error: "Google account has no email" });

    // Find existing user by googleId or email
    let user = await User.findOne({ $or: [{ googleId }, { email: email.toLowerCase() }] });

    if (user) {
      // Link Google to an existing local account if not already linked
      if (!user.googleId) {
        user.googleId = googleId;
        user.provider = "google";
        await user.save();
      }
    } else {
      // New user — determine role
      let role = "student";
      if (adminCode && adminCode.trim()) {
        const validCode = process.env.ADMIN_INVITE_CODE;
        if (!validCode) return res.status(400).json({ error: "Admin registration is not enabled" });
        if (adminCode.trim() !== validCode) return res.status(401).json({ error: "Invalid admin invite code" });
        role = "admin";
      }

      user = await User.create({
        name: name || email.split("@")[0],
        email: email.toLowerCase(),
        googleId,
        provider: "google",
        role,
      });
    }

    const token = signToken(user);
    res.json({ token, user: userPayload(user) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
