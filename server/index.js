import express from "express";
import cors from "cors";
import { connectDB } from "./db.js";
import { seedIfEmpty } from "./seed.js";
import authRoutes from "./routes/auth.js";
import hostelRoutes from "./routes/hostels.js";
import reviewRoutes from "./routes/reviews.js";
import { flaggedRouter } from "./routes/reviews.js";
import userRoutes from "./routes/users.js";
import aiRoutes from "./routes/ai.js";

const app = express();
app.use(cors());
app.use(express.json());

app.use("/api/auth", authRoutes);
app.use("/api/hostels/:hostelId/reviews", reviewRoutes);
app.use("/api/hostels", hostelRoutes);
app.use("/api/reviews", flaggedRouter);
app.use("/api/users", userRoutes);

app.use("/api/ai", aiRoutes);
app.get("/api/health", (_, res) => res.json({ ok: true }));

const PORT = process.env.API_PORT || 3001;

connectDB()
  .then(() => seedIfEmpty())
  .then(() => {
    app.listen(PORT, () => console.log(`🚀 API server on port ${PORT}`));
  })
  .catch((err) => {
    console.error("Failed to start server:", err.message);
    process.exit(1);
  });
