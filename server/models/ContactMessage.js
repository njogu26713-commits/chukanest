import mongoose from "mongoose";

const contactMessageSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 180 },
    topic: { type: String, required: true, trim: true, enum: ["General question", "Hostel listing", "Review or report", "Account help", "Safety concern", "Other"] },
    message: { type: String, required: true, trim: true, maxlength: 3000 },
    status: { type: String, enum: ["new", "read", "resolved"], default: "new" },
  },
  { timestamps: true }
);

export default mongoose.model("ContactMessage", contactMessageSchema);
