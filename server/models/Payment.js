import mongoose from "mongoose";

const paymentSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    phone: { type: String, required: true },
    amount: { type: Number, required: true, default: 400 },
    type: { type: String, enum: ["premium_subscription"], default: "premium_subscription" },
    status: { type: String, enum: ["pending", "completed", "failed", "cancelled"], default: "pending" },
    merchantRequestId: String,
    checkoutRequestId: { type: String, index: true, sparse: true },
    mpesaReceiptNumber: String,
    resultCode: Number,
    resultDescription: String,
    rawCallback: mongoose.Schema.Types.Mixed,
    paidAt: Date,
    expiresAt: Date,
  },
  { timestamps: true }
);

export default mongoose.model("Payment", paymentSchema);
