import bcrypt from "bcryptjs";
import Hostel from "./models/Hostel.js";
import Review from "./models/Review.js";
import User from "./models/User.js";

const img = (seed, w = 800, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const HOSTELS_SEED = [
  {
    name: "Greenview Annex", gender: "Female", roomType: "Bedsitter",
    price: 6500, distance: 0.4, rating: 4.7, reviewCount: 2, verified: true, availableRooms: 3,
    landlord: "Mama Njeri", phone: "+254712345001",
    images: [img("gv1"), img("gv2"), img("gv3")],
    amenities: ["wifi", "water", "power", "security", "cctv"],
    description: "A quiet, gated bedsitter block a 5-minute walk from the Chuka University main gate. Popular with second and third-year students for its reliable water supply and fast Wi-Fi.",
    rules: ["No visitors after 10 PM", "No loud music after 9 PM", "Rent due by the 5th of each month", "No subletting rooms"],
    latlng: [-0.3353, 37.6462],
  },
  {
    name: "Chuka Scholars Lodge", gender: "Mixed", roomType: "Single",
    price: 4800, distance: 0.9, rating: 4.3, reviewCount: 1, verified: true, availableRooms: 6,
    landlord: "Mr. Kirimi", phone: "+254712345002",
    images: [img("cs1"), img("cs2"), img("cs3")],
    amenities: ["wifi", "water", "power", "study", "parking"],
    description: "Budget-friendly single rooms with a shared study room, ideal for first-years. Close to matatu stage for easy access to town.",
    rules: ["Visitors sign in at the gate", "Quiet hours 10 PM–6 AM", "Garbage collected daily by 7 AM"],
    latlng: [-0.3248, 37.6578],
  },
  {
    name: "Fig Tree Hostels", gender: "Male", roomType: "Shared",
    price: 3500, distance: 1.6, rating: 4.0, reviewCount: 1, verified: false, status: "pending", availableRooms: 2,
    landlord: "John Mutuma", phone: "+254712345003",
    images: [img("ft1"), img("ft2"), img("ft3")],
    amenities: ["water", "power", "parking"],
    description: "Affordable shared rooms (2 per room) with basic amenities. A short boda ride from campus. Verification pending — proceed with normal caution and always view the room in person.",
    rules: ["No overnight guests", "Shared kitchen cleaning roster enforced"],
    latlng: [-0.3458, 37.6638],
  },
  {
    name: "Riverside Girls Residence", gender: "Female", roomType: "Bedsitter",
    price: 7200, distance: 0.6, rating: 4.9, reviewCount: 2, verified: true, availableRooms: 1,
    landlord: "Mrs. Kaburu", phone: "+254712345004",
    images: [img("rg1"), img("rg2"), img("rg3")],
    amenities: ["wifi", "water", "power", "security", "cctv", "laundry"],
    description: "Premium, fully-fenced residence exclusively for female students with 24-hour security and CCTV throughout the compound. Highly rated for safety.",
    rules: ["Strictly female residents only", "Gate closes at 11 PM", "ID required for all visitors"],
    latlng: [-0.3368, 37.6443],
  },
  {
    name: "Unity Hostel", gender: "Mixed", roomType: "Single",
    price: 5200, distance: 1.1, rating: 3.9, reviewCount: 1, verified: true, availableRooms: 4,
    landlord: "Peter Ntongai", phone: "+254712345005",
    images: [img("un1"), img("un2"), img("un3")],
    amenities: ["wifi", "water", "power", "security"],
    description: "Mid-range single rooms with dependable power backup during outages. Popular for its central location near the market.",
    rules: ["No cooking in rooms after 9 PM", "Rent paid termly for 5% discount"],
    latlng: [-0.3418, 37.6598],
  },
  {
    name: "Cedar Court", gender: "Male", roomType: "Bedsitter",
    price: 6000, distance: 2.0, rating: 4.4, reviewCount: 1, verified: false, status: "pending", availableRooms: 5,
    landlord: "Alex Kithinji", phone: "+254712345006",
    images: [img("cc1"), img("cc2"), img("cc3")],
    amenities: ["wifi", "water", "power", "parking", "study"],
    description: "Spacious bedsitters slightly further from campus, offering better value for money. Boda fare to campus averages KES 50.",
    rules: ["No pets", "Parking for residents only"],
    latlng: [-0.3148, 37.6678],
  },
  {
    name: "Chuka Elite Suites", gender: "Mixed", roomType: "Single",
    price: 8900, distance: 0.3, rating: 4.8, reviewCount: 1, verified: true, availableRooms: 2,
    landlord: "Diana Gatwiri", phone: "+254712345007",
    images: [img("ce1"), img("ce2"), img("ce3")],
    amenities: ["wifi", "water", "power", "security", "cctv", "laundry", "study", "parking"],
    description: "Top-tier furnished single rooms right opposite the main gate. All amenities included — the most fully-equipped listing on ChukaNest.",
    rules: ["No loud music", "Visitors register at reception", "No smoking indoors"],
    latlng: [-0.3292, 37.6518],
  },
  // Additional pending verification
  {
    name: "Maple Annex", gender: "Mixed", roomType: "Single",
    price: 5500, distance: 0.7, rating: 0, reviewCount: 0, verified: false, status: "pending", availableRooms: 5,
    landlord: "Grace Muthoni", phone: "+254799001122",
    images: [img("ma1"), img("ma2"), img("ma3")],
    amenities: ["water", "power"],
    description: "New listing near campus awaiting verification.",
    rules: [],
    latlng: [-0.3300, 37.6520],
  },
];

async function seedReviews(hostels) {
  const byName = Object.fromEntries(hostels.map((h) => [h.name, h._id]));
  const reviews = [
    { hostelName: "Greenview Annex", user: "Faith W.", rating: 5, text: "Water never runs out here, even during the dry season. Landlady is very responsive." },
    { hostelName: "Greenview Annex", user: "Brenda K.", rating: 4, text: "Good value, though the walk feels longer at night without streetlights." },
    { hostelName: "Chuka Scholars Lodge", user: "Mike O.", rating: 4, text: "Great for first-years. The study room got noisy during exam week though." },
    { hostelName: "Fig Tree Hostels", user: "Dennis M.", rating: 3, text: "Cheap but the kitchen roster isn't really enforced.", flagged: true, flaggedBy: "3 students" },
    { hostelName: "Riverside Girls Residence", user: "Purity N.", rating: 5, text: "Safest hostel I've lived in during my four years at Chuka. Worth every shilling." },
    { hostelName: "Riverside Girls Residence", user: "Anne M.", rating: 5, text: "CCTV and the gate guard genuinely make a difference for peace of mind." },
    { hostelName: "Unity Hostel", user: "Collins R.", rating: 4, text: "Power backup saved my project deadline during the last blackout.", flagged: true, flaggedBy: "System" },
    { hostelName: "Cedar Court", user: "Ian K.", rating: 4, text: "Bit far but boda guys at the stage know the place well." },
    { hostelName: "Chuka Elite Suites", user: "Sharon A.", rating: 5, text: "Feels like a small apartment. Pricey but you get everything included." },
    { hostelName: "Chuka Scholars Lodge", user: "anon_55", rating: 2, text: "This review looks copied word-for-word from another listing.", flagged: true, flaggedBy: "System" },
  ];

  await Review.insertMany(
    reviews.map((r) => ({
      hostelId: byName[r.hostelName],
      user: r.user,
      rating: r.rating,
      text: r.text,
      flagged: r.flagged || false,
      flaggedBy: r.flaggedBy || "",
    }))
  );
}

async function seedUsers() {
  const raw = [
    { name: "Admin User", email: "admin@chukanest.co.ke", password: "Admin1234!", role: "admin" },
    { name: "Faith Wanjiru", email: "faith@students.chuka.ac.ke", password: "Student123!", role: "student" },
    { name: "Mike Otieno", email: "mike@students.chuka.ac.ke", password: "Student123!", role: "student" },
    { name: "Purity Nthiga", email: "purity@students.chuka.ac.ke", password: "Student123!", role: "student" },
  ];
  // Hash passwords manually then use collection.insertMany to bypass the
  // pre-save hook (which would double-hash an already-hashed password).
  const users = await Promise.all(
    raw.map(async (u) => ({ ...u, password: await bcrypt.hash(u.password, 10) }))
  );
  await User.collection.insertMany(users);
}

export async function seedIfEmpty() {
  const count = await Hostel.countDocuments();
  if (count > 0) {
    console.log(`ℹ️  DB already seeded (${count} hostels)`);
    return;
  }
  console.log("🌱 Seeding database...");
  const hostels = await Hostel.insertMany(HOSTELS_SEED);
  await seedReviews(hostels);
  await seedUsers();
  console.log("✅ Seeding complete");
}
