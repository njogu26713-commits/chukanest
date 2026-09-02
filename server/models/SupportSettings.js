import mongoose from "mongoose";

const faqSchema = new mongoose.Schema(
  {
    question: { type: String, required: true, trim: true },
    answer: { type: String, required: true, trim: true },
  },
  { _id: false }
);

const supportSettingsSchema = new mongoose.Schema(
  {
    key: { type: String, unique: true, default: "default" },
    supportPhone: { type: String, trim: true, default: "+254 700 000 000" },
    whatsappNumber: { type: String, trim: true, default: "+254 700 000 000" },
    email: { type: String, trim: true, default: "support@chukanest.co.ke" },
    officeHours: { type: String, trim: true, default: "Mon–Fri, 8:00 AM–5:00 PM" },
    faqs: { type: [faqSchema], default: [] },
  },
  { timestamps: true }
);

export default mongoose.model("SupportSettings", supportSettingsSchema);

export const DEFAULT_SUPPORT_SETTINGS = {
  key: "default",
  supportPhone: "+254 700 000 000",
  whatsappNumber: "+254 700 000 000",
  email: "support@chukanest.co.ke",
  officeHours: "Mon–Fri, 8:00 AM–5:00 PM",
  faqs: [
    {
      question: "How do I know a hostel is verified?",
      answer: "Look for the gold Verified badge. Our team checks the listing details before it is marked as verified.",
    },
    {
      question: "How do I report a problem with a listing?",
      answer: "Open the listing and contact the administrator using the support options below. Include the hostel name and what went wrong.",
    },
    {
      question: "Can I update or remove my review?",
      answer: "Contact the administrator with your account email and the review details. The support team will help you with the next step.",
    },
    {
      question: "How can I add my hostel?",
      answer: "Contact the administrator with the hostel name, location, room types, prices, available rooms, and clear photos.",
    },
    {
      question: "Is ChukaNest available outside Chuka University?",
      answer: "ChukaNest is currently focused on student housing around Chuka University and nearby areas.",
    },
  ],
};
