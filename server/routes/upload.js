import { Router } from "express";
import multer from "multer";
import { v2 as cloudinary } from "cloudinary";
import { requireAuth, requireAdminOrOwner } from "../middleware/auth.js";

const router = Router();

const cloudinaryUrl = process.env.CLOUDINARY_URL?.trim();
const cloudinaryCredentials = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
};
const hasCloudinaryConfig = Boolean(
  cloudinaryUrl ||
  (cloudinaryCredentials.cloud_name &&
    cloudinaryCredentials.api_key &&
    cloudinaryCredentials.api_secret)
);

if (cloudinaryUrl) {
  cloudinary.config(cloudinaryUrl);
} else if (hasCloudinaryConfig) {
  cloudinary.config({ ...cloudinaryCredentials, secure: true });
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
router.post("/images", requireAuth, requireAdminOrOwner, upload.array("images", 10), async (req, res) => {
  if (!hasCloudinaryConfig) {
    return res.status(503).json({
      error: "Image storage is not configured. Set CLOUDINARY_URL or CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, and CLOUDINARY_API_SECRET on the backend, then redeploy.",
    });
  }
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ error: "No images uploaded" });
  }

  try {
    const urls = await Promise.all(req.files.map(uploadToCloudinary));
    res.json({ urls });
  } catch (err) {
    const providerMessage = err?.error?.message || err?.message;
    console.error("Cloudinary upload failed:", providerMessage || err);

    // Return a useful, non-secret diagnostic so deployment/configuration issues
    // can be corrected without exposing Cloudinary credentials.
    const error = providerMessage
      ? `Cloudinary upload failed: ${providerMessage}`
      : "Cloudinary upload failed. Check the server Cloudinary configuration.";
    res.status(502).json({ error });
  }
});

export default router;
