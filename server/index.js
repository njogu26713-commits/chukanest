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
app.get("/api/health", (_, res) => res.json({ ok: true }));

app.use(express.static(clientDist));
app.get("*", (req, res, next) => {
  if (req.path.startsWith("/api/")) return next();
  res.sendFile(path.join(clientDist, "index.html"), (err) => {
    if (err) next();
  });
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
