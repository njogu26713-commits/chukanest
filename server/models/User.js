import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true, lowercase: true },
    password: { type: String, default: null },          // null for Google-only accounts
    googleId: { type: String, sparse: true, default: null },
    provider: { type: String, enum: ["local", "google"], default: "local" },
    role: { type: String, enum: ["student", "admin"], default: "student" },
    bookmarks: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hostel" }],
    premiumUntil: { type: Date, default: null },
    phone: { type: String, default: "" },
    status: { type: String, enum: ["active", "flagged", "suspended"], default: "active" },
  },
  { timestamps: true }
);

userSchema.pre("save", async function (next) {
  if (!this.isModified("password") || !this.password) return next();
  this.password = await bcrypt.hash(this.password, 10);
  next();
});

userSchema.methods.comparePassword = function (plain) {
  if (!this.password) return Promise.resolve(false);
  return bcrypt.compare(plain, this.password);
};

export default mongoose.model("User", userSchema);
