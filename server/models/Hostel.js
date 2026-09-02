import mongoose from "mongoose";

const hostelSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    location: { type: String, required: true, trim: true },
    roomType: { type: String, enum: ["Bedsitter", "Single", "Shared", "Studio", "1 Bedroom", "2 Bedroom"], required: true },
    price: { type: Number, required: true },
    billingPeriod: { type: String, enum: ["month", "semester"], default: "month" },
    distance: { type: Number, required: true },
    rating: { type: Number, default: 0 },
    reviewCount: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    status: { type: String, enum: ["active", "pending", "rejected"], default: "active" },
    availableRooms: { type: Number, default: 0 },
    contactRole: { type: String, enum: ["Landlord", "Caretaker"], required: true },
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
