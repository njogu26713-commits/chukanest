import { Router } from "express";
import multer from "multer";
import { requireAuth, requireAdminOrOwner } from "../middleware/auth.js";

// The Cloudinary SDK validates CLOUDINARY_URL while it is imported. Railway
// deployments with a malformed value would therefore crash before Express
// could start. Remove the problematic variable for SDK initialization and
// configure it explicitly below, using either the URL or separate credentials.
const configuredCloudinaryUrl = process.env.CLOUDINARY_URL?.trim();
delete process.env.CLOUDINARY_URL;
const { v2: cloudinary } = await import("cloudinary");

const router = Router();

const cloudinaryUrl = configuredCloudinaryUrl;
const cloudinaryCredentials = {
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME?.trim(),
  api_key: process.env.CLOUDINARY_API_KEY?.trim(),
  api_secret: process.env.CLOUDINARY_API_SECRET?.trim(),
};
let hasCloudinaryConfig = false;
try {
  if (cloudinaryUrl) {
    // cloudinary.config() does not accept the URL as a positional argument.
    // Parse the standard CLOUDINARY_URL into the SDK's object format explicitly.
    const parsed = new URL(cloudinaryUrl);
    if (parsed.protocol !== "cloudinary:" || !parsed.hostname || !parsed.username || !parsed.password) {
      throw new Error("CLOUDINARY_URL must use cloudinary://API_KEY:API_SECRET@CLOUD_NAME");
    }
    cloudinary.config({
      cloud_name: parsed.hostname,
      api_key: decodeURIComponent(parsed.username),
      api_secret: decodeURIComponent(parsed.password),
      secure: true,
    });
    hasCloudinaryConfig = true;
  } else if (cloudinaryCredentials.cloud_name && cloudinaryCredentials.api_key && cloudinaryCredentials.api_secret) {
    cloudinary.config({ ...cloudinaryCredentials, secure: true });
    hasCloudinaryConfig = true;
  }
} catch (configError) {
  console.error("Invalid Cloudinary configuration:", configError.message);
  hasCloudinaryConfig = false;
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
