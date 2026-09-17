import crypto from "node:crypto";

const configuredSecret = process.env.SESSION_SECRET?.trim();
if (process.env.NODE_ENV === "production" && (!configuredSecret || configuredSecret.length < 32)) {
  throw new Error("SESSION_SECRET must be configured in production and be at least 32 characters long");
}

export const JWT_SECRET = configuredSecret || crypto.randomBytes(32).toString("hex");
