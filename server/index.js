import express from "express";
import cors from "cors";
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

const app = express();
app.use(cors());
app.use(express.json());

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
  const status = err.code === "LIMIT_FILE_SIZE" ? 413 : 400;
  const error = err.code === "LIMIT_FILE_SIZE"
    ? "The uploaded file is too large. Maximum size is 100 MB."
    : err.message || "API request failed";
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
