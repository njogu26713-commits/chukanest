import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { connectDB } from "./db.js";
import { seedIfEmpty } from "./seed.js";
import authRoutes from "./routes/auth.js";
import hostelRoutes from "./routes/hostels.js";
import reviewRoutes from "./routes/reviews.js";
import { flaggedRouter } from "./routes/reviews.js";
import userRoutes from "./routes/users.js";
import aiRoutes from "./routes/ai.js";
import uploadRoutes from "./routes/upload.js";
import supportRoutes from "./routes/support.js";
import paymentRoutes from "./routes/payments.js";
import ownerRoutes from "./routes/owners.js";

const app = express();
app.disable("x-powered-by");
app.set("trust proxy", 1);

const configuredOrigins = (process.env.CORS_ORIGINS || process.env.FRONTEND_ORIGIN || "")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(helmet({ contentSecurityPolicy: false }));
app.use((req, res, next) => {
  const sameOrigin = `${req.protocol}://${req.get("host")}`;
  cors({
    origin(origin, callback) {
      // Non-browser tools and same-origin server requests have no Origin header.
      if (!origin || origin === sameOrigin) return callback(null, true);
      if (configuredOrigins.includes(origin)) return callback(null, true);
      if (process.env.NODE_ENV !== "production" && /^https?:\/\/localhost(:\d+)?$/.test(origin)) {
        return callback(null, true);
      }
      callback(new Error("Origin is not allowed by CORS"));
    },
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })(req, res, next);
});
app.use(express.json({ limit: "1mb" }));
app.use(express.urlencoded({ extended: false, limit: "100kb" }));

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 300,
  standardHeaders: "draft-7",
  legacyHeaders: false,
  message: { error: "Too many requests. Please try again later." },
});
app.use("/api", apiLimiter);

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(__dirname, "../dist");
const uploadsDir = path.resolve(__dirname, "../uploads");

// Serve uploaded images
app.use("/uploads", express.static(uploadsDir));

app.use("/api/auth", authRoutes);
app.use("/api/hostels/:hostelId/reviews", reviewRoutes);
app.use("/api/hostels", hostelRoutes);
app.use("/api/reviews", flaggedRouter);
app.use("/api/users", userRoutes);
app.use("/api/ai", aiRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/support", supportRoutes);
app.use("/api/payments", paymentRoutes);
app.use("/api/owner", ownerRoutes);
app.get("/api/health", (_, res) => res.json({ ok: true }));

// Keep API failures machine-readable. Without this guard, Express can return
// its default HTML error page, which the frontend then cannot parse as JSON.
app.use("/api", (req, res) => {
  res.status(404).json({ error: `API route not found: ${req.method} ${req.originalUrl}` });
});

app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
});

// Multer and other route-level errors must also stay JSON for API callers.
app.use((err, req, res, next) => {
  if (!req.path.startsWith("/api/")) return next(err);

  console.error("API request failed:", err);
  const status = err.code === "LIMIT_FILE_SIZE" || err.type === "entity.too.large" ? 413 : 400;
  const error = err.code === "LIMIT_FILE_SIZE" || err.type === "entity.too.large"
    ? "The uploaded file is too large. Maximum size is 50 MB."
    : process.env.NODE_ENV === "production" ? "API request failed" : err.message || "API request failed";
  res.status(status).json({ error });
});

const PORT = process.env.PORT || process.env.API_PORT || 3001;

connectDB()
  .then(() => seedIfEmpty())
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 API server on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });
