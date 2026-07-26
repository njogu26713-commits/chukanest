import { Router } from "express";
import multer from "multer";
import path from "node:path";
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const uploadDir = path.resolve(__dirname, "../../uploads");
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadDir),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${Date.now()}-${Math.random().toString(36).slice(2)}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 8 * 1024 * 1024 }, // 8 MB per file
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/")) cb(null, true);
    else cb(new Error("Only image files are allowed"));
  },
});

// POST /api/upload/images — upload up to 10 images, returns their URLs
router.post("/images", requireAuth, requireAdmin, upload.array("images", 10), (req, res) => {
  if (!req.files || req.files.length === 0)
    return res.status(400).json({ error: "No images uploaded" });

  const urls = req.files.map((f) => `/uploads/${f.filename}`);
  res.json({ urls });
});

export default router;
