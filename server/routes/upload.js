import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { requireAuth, requireAdmin } from "../middleware/auth.js";

const router = Router();

const hasCloudinaryConfig = Boolean(
  process.env.CLOUDINARY_CLOUD_NAME &&
  process.env.CLOUDINARY_API_KEY &&
  process.env.CLOUDINARY_API_SECRET
);

if (hasCloudinaryConfig) {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// Keep files in memory briefly while Cloudinary stores them permanently.
const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 100 * 1024 * 1024 },
  fileFilter: (_req, file, cb) => {
    if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) cb(null, true);
    else cb(new Error("Only image and video files are allowed"));
  },
});

function uploadToCloudinary(file) {
  return new Promise((resolve, reject) => {
    const resourceType = file.mimetype.startsWith("video/") ? "video" : "image";
    const stream = cloudinary.uploader.upload_stream(
      { folder: "chukanest/hostels", resource_type: resourceType, use_filename: true, unique_filename: true },
      (error, result) => error ? reject(error) : resolve(result.secure_url)
    );
    stream.end(file.buffer);
  });
}

// POST /api/upload/images — upload up to 10 images/videos to durable cloud storage
router.post("/images", requireAuth, requireAdmin, upload.array("images", 10), async (req, res) => {
  if (!hasCloudinaryConfig) {
    return res.status(503).json({ error: "Image storage is not configured. Add the Cloudinary variables in Railway." });
  }
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No images uploaded" });
  }

  try {
    const urls = await Promise.all(req.files.map(uploadToCloudinary));
    res.json({ urls });
  } catch (err) {
    console.error("Cloudinary upload failed:", err.message);
    res.status(502).json({ error: "Could not store the uploaded media" });
  }
});

export default router;
