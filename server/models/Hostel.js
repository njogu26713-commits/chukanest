import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    gender: { type: String, enum: ["Female", "Male", "Mixed"], required: true },
    roomType: { type: String, enum: ["Bedsitter", "Single", "Shared"], required: true },
    price: { type: Number, required: true },
    distance: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "pending", "rejected"], default: "active" },
    availableRooms: { type: Number, default: 0 },
    landlord: { type: String, required: true },
    phone: { type: String, required: true },
    images: [String],
    amenities: [String],
    description: String,
    rules: [String],
    latlng: [Number], // [lat, lng]
  },
  { timestamps: true }
);

export default mongoose.model("Hostel", hostelSchema);
