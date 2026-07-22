import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Home, Search, Heart, User, MapPin, Star, Wifi, Droplets, Zap, ShieldCheck,
  Car, Shirt, BookOpen, Camera, Phone, MessageCircle, Navigation, Bell, X, Check,
  ChevronLeft, ChevronRight, ChevronDown, Plus, Trash2, Pencil, LogOut, Mail, Lock,
  BarChart3, Users, LayoutDashboard, TrendingUp, AlertTriangle, CheckCircle2,
  SlidersHorizontal, ImagePlus, Building2, ArrowLeft, Eye, EyeOff, Flag, Clock,
  ThumbsUp, MoreVertical
} from "lucide-react";

/* ---------------------------------- THEME ---------------------------------- */
const C = {
  primary: "#1B6B45",
  primaryDark: "#0F4A30",
  primaryLight: "#2F8F5E",
  mint: "#E7F3EC",
  gold: "#C9A227",
  goldSoft: "#FBF3DC",
  bg: "#FAFAF6",
  surface: "#FFFFFF",
  ink: "#14251B",
  inkSoft: "#5C6B62",
  line: "#E4E9E3",
  danger: "#C1443A",
  dangerSoft: "#FBEAE8",
};

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&family=Roboto+Mono:wght@500;600&display=swap');`;

const fDisplay = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const fBody = { fontFamily: "'Inter', sans-serif" };
const fMono = { fontFamily: "'Roboto Mono', monospace" };

/* ---------------------------------- MOCK DATA ---------------------------------- */
const AMENITY_META = {
  wifi: { label: "Wi-Fi", icon: Wifi },
  water: { label: "Water 24/7", icon: Droplets },
  power: { label: "Electricity", icon: Zap },
  security: { label: "Security", icon: ShieldCheck },
  parking: { label: "Parking", icon: Car },
  laundry: { label: "Laundry", icon: Shirt },
  study: { label: "Study Room", icon: BookOpen },
  cctv: { label: "CCTV", icon: Camera },
};

const img = (seed, w = 800, h = 600) => `https://picsum.photos/seed/${seed}/${w}/${h}`;

const HOSTELS = [
  {
    id: "h1", name: "Greenview Annex", gender: "Female", roomType: "Bedsitter",
    price: 6500, distance: 0.4, rating: 4.7, reviewCount: 38, verified: true,
    availableRooms: 3, landlord: "Mama Njeri", phone: "+254712345001",
    images: [img("gv1"), img("gv2"), img("gv3")],
    amenities: ["wifi", "water", "power", "security", "cctv"],
    description: "A quiet, gated bedsitter block a 5-minute walk from the Chuka University main gate. Popular with second and third-year students for its reliable water supply and fast Wi-Fi.",
    rules: ["No visitors after 10 PM", "No loud music after 9 PM", "Rent due by the 5th of each month", "No subletting rooms"],
    latlng: [-0.3353, 37.6462],
  },
  {
    id: "h2", name: "Chuka Scholars Lodge", gender: "Mixed", roomType: "Single",
    price: 4800, distance: 0.9, rating: 4.3, reviewCount: 61, verified: true,
    availableRooms: 6, landlord: "Mr. Kirimi", phone: "+254712345002",
    images: [img("cs1"), img("cs2"), img("cs3")],
    amenities: ["wifi", "water", "power", "study", "parking"],
    description: "Budget-friendly single rooms with a shared study room, ideal for first-years. Close to matatu stage for easy access to town.",
    rules: ["Visitors sign in at the gate", "Quiet hours 10 PM–6 AM", "Garbage collected daily by 7 AM"],
    latlng: [-0.3248, 37.6578],
  },
  {
    id: "h3", name: "Fig Tree Hostels", gender: "Male", roomType: "Shared",
    price: 3500, distance: 1.6, rating: 4.0, reviewCount: 22, verified: false,
    availableRooms: 2, landlord: "John Mutuma", phone: "+254712345003",
    images: [img("ft1"), img("ft2"), img("ft3")],
    amenities: ["water", "power", "parking"],
    description: "Affordable shared rooms (2 per room) with basic amenities. A short boda ride from campus. Verification pending — proceed with normal caution and always view the room in person.",
    rules: ["No overnight guests", "Shared kitchen cleaning roster enforced"],
    latlng: [-0.3458, 37.6638],
  },
  {
    id: "h4", name: "Riverside Girls Residence", gender: "Female", roomType: "Bedsitter",
    price: 7200, distance: 0.6, rating: 4.9, reviewCount: 54, verified: true,
    availableRooms: 1, landlord: "Mrs. Kaburu", phone: "+254712345004",
    images: [img("rg1"), img("rg2"), img("rg3")],
    amenities: ["wifi", "water", "power", "security", "cctv", "laundry"],
    description: "Premium, fully-fenced residence exclusively for female students with 24-hour security and CCTV throughout the compound. Highly rated for safety.",
    rules: ["Strictly female residents only", "Gate closes at 11 PM", "ID required for all visitors"],
    latlng: [-0.3368, 37.6443],
  },
  {
    id: "h5", name: "Unity Hostel", gender: "Mixed", roomType: "Single",
    price: 5200, distance: 1.1, rating: 3.9, reviewCount: 17, verified: true,
    availableRooms: 4, landlord: "Peter Ntongai", phone: "+254712345005",
    images: [img("un1"), img("un2"), img("un3")],
    amenities: ["wifi", "water", "power", "security"],
    description: "Mid-range single rooms with dependable power backup during outages. Popular for its central location near the market.",
    rules: ["No cooking in rooms after 9 PM", "Rent paid termly for 5% discount"],
    latlng: [-0.3418, 37.6598],
  },
  {
    id: "h6", name: "Cedar Court", gender: "Male", roomType: "Bedsitter",
    price: 6000, distance: 2.0, rating: 4.4, reviewCount: 29, verified: false,
    availableRooms: 5, landlord: "Alex Kithinji", phone: "+254712345006",
    images: [img("cc1"), img("cc2"), img("cc3")],
    amenities: ["wifi", "water", "power", "parking", "study"],
    description: "Spacious bedsitters slightly further from campus, offering better value for money. Boda fare to campus averages KES 50.",
    rules: ["No pets", "Parking for residents only"],
    latlng: [-0.3148, 37.6678],
  },
  {
    id: "h7", name: "Chuka Elite Suites", gender: "Mixed", roomType: "Single",
    price: 8900, distance: 0.3, rating: 4.8, reviewCount: 45, verified: true,
    availableRooms: 2, landlord: "Diana Gatwiri", phone: "+254712345007",
    images: [img("ce1"), img("ce2"), img("ce3")],
    amenities: ["wifi", "water", "power", "security", "cctv", "laundry", "study", "parking"],
    description: "Top-tier furnished single rooms right opposite the main gate. All amenities included — the most fully-equipped listing on ChukaNest.",
    rules: ["No loud music", "Visitors register at reception", "No smoking indoors"],
    latlng: [-0.3292, 37.6518],
  },
];

const INITIAL_REVIEWS = {
  h1: [
    { id: "r1", user: "Faith W.", rating: 5, text: "Water never runs out here, even during the dry season. Landlady is very responsive.", date: "2 weeks ago" },
    { id: "r2", user: "Brenda K.", rating: 4, text: "Good value, though the walk feels longer at night without streetlights.", date: "1 month ago" },
  ],
  h2: [{ id: "r3", user: "Mike O.", rating: 4, text: "Great for first-years. The study room got noisy during exam week though.", date: "3 weeks ago" }],
  h3: [{ id: "r4", user: "Dennis M.", rating: 3, text: "Cheap but the kitchen roster isn't really enforced.", date: "2 months ago" }],
  h4: [
    { id: "r5", user: "Purity N.", rating: 5, text: "Safest hostel I've lived in during my four years at Chuka. Worth every shilling.", date: "1 week ago" },
    { id: "r6", user: "Anne M.", rating: 5, text: "CCTV and the gate guard genuinely make a difference for peace of mind.", date: "3 weeks ago" },
  ],
  h5: [{ id: "r7", user: "Collins R.", rating: 4, text: "Power backup saved my project deadline during the last blackout.", date: "1 month ago" }],
  h6: [{ id: "r8", user: "Ian K.", rating: 4, text: "Bit far but boda guys at the stage know the place well.", date: "2 weeks ago" }],
  h7: [{ id: "r9", user: "Sharon A.", rating: 5, text: "Feels like a small apartment. Pricey but you get everything included.", date: "5 days ago" }],
};

const PENDING_VERIFICATIONS = [
  { id: "pv1", name: "Fig Tree Hostels", submitted: "2 days ago", landlord: "John Mutuma" },
  { id: "pv2", name: "Cedar Court", submitted: "5 days ago", landlord: "Alex Kithinji" },
  { id: "pv3", name: "Maple Annex (new)", submitted: "Today", landlord: "Grace Muthoni" },
];

const FLAGGED_REVIEWS = [
  { id: "fr1", hostel: "Unity Hostel", user: "Anonymous123", text: "Contains a suspicious external phone number and payment request outside the app.", flaggedBy: "System" },
  { id: "fr2", hostel: "Fig Tree Hostels", user: "user_882", text: "Reported by 3 students as potentially fake / competitor review.", flaggedBy: "3 students" },
];

/* ---------------------------------- SMALL UI PRIMITIVES ---------------------------------- */

function VerifiedSeal({ size = "md" }) {
  const dims = size === "sm" ? 22 : size === "lg" ? 40 : 28;
  const fontSize = size === "sm" ? 8 : size === "lg" ? 11 : 9;
  return (
    <div
      title="Verified by ChukaNest"
      style={{
        width: dims, height: dims, borderRadius: "50%",
        border: `2px dashed ${C.gold}`, background: C.surface,
        display: "flex", alignItems: "center", justifyContent: "center",
        flexShrink: 0, position: "relative", boxShadow: "0 1px 3px rgba(0,0,0,0.12)",
      }}
    >
      <div style={{
        width: dims - 8, height: dims - 8, borderRadius: "50%", background: C.gold,
        display: "flex", alignItems: "center", justifyContent: "center",
      }}>
        <Check size={fontSize + 4} color="#fff" strokeWidth={3} />
      </div>
    </div>
  );
}

function Chip({ active, onClick, children, icon: Icon }) {
  return (
    <button
      onClick={onClick}
      className="flex items-center gap-1.5 whitespace-nowrap rounded-full px-3.5 py-2 text-sm font-medium transition-all active:scale-95"
      style={{
        ...fBody,
        background: active ? C.primary : C.surface,
        color: active ? "#fff" : C.ink,
        border: `1px solid ${active ? C.primary : C.line}`,
      }}
    >
      {Icon && <Icon size={14} />}
      {children}
    </button>
  );
}

function Badge({ children, tone = "neutral" }) {
  const tones = {
    neutral: { bg: C.mint, color: C.primaryDark },
    gold: { bg: C.goldSoft, color: "#8A6D0C" },
    danger: { bg: C.dangerSoft, color: C.danger },
  };
  const t = tones[tone];
  return (
    <span
      className="inline-flex items-center rounded-full px-2 py-0.5 text-xs font-semibold"
      style={{ background: t.bg, color: t.color, ...fBody }}
    >
      {children}
    </span>
  );
}

function PrimaryButton({ children, onClick, icon: Icon, full, variant = "solid", disabled }) {
  const base = "flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50";
  const style =
    variant === "solid"
      ? { background: disabled ? "#9CB8A8" : C.primary, color: "#fff" }
      : variant === "outline"
      ? { background: "transparent", color: C.primary, border: `1.5px solid ${C.primary}` }
      : { background: C.mint, color: C.primaryDark };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${full ? "w-full" : ""}`} style={{ ...style, ...fBody }}>
      {Icon && <Icon size={17} />}
      {children}
    </button>
  );
}

function Toast({ toast }) {
  if (!toast) return null;
  return (
    <div
      className="fixed left-1/2 z-50 -translate-x-1/2 rounded-2xl px-4 py-3 text-sm font-medium shadow-lg transition-all"
      style={{ ...fBody, top: 70, background: C.ink, color: "#fff", maxWidth: 340 }}
    >
      {toast}
    </div>
  );
}

function StarRow({ rating, size = 13, onRate }) {
  return (
    <div className="flex gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <Star
          key={n}
          size={size}
          onClick={onRate ? () => onRate(n) : undefined}
          fill={n <= rating ? C.gold : "none"}
          color={n <= rating ? C.gold : C.line}
          style={onRate ? { cursor: "pointer" } : undefined}
        />
      ))}
    </div>
  );
}

function TopBar({ title, onBack, right }) {
  return (
    <div
      className="sticky top-0 z-20 flex items-center gap-3 px-4 py-3.5"
      style={{ background: C.surface, borderBottom: `1px solid ${C.line}` }}
    >
      {onBack && (
        <button onClick={onBack} className="rounded-full p-1.5 active:scale-90 transition-transform" style={{ background: C.mint }}>
          <ArrowLeft size={18} color={C.primaryDark} />
        </button>
      )}
      <div className="flex-1 truncate text-[17px] font-bold" style={{ ...fDisplay, color: C.ink }}>{title}</div>
      {right}
    </div>
  );
}

/* ---------------------------------- HOSTEL CARD ---------------------------------- */

function HostelCard({ hostel, isFav, onToggleFav, onOpen }) {
  return (
    <button
      onClick={() => onOpen(hostel.id)}
      className="w-full overflow-hidden rounded-3xl text-left transition-transform active:scale-[0.98]"
      style={{ background: C.surface, border: `1px solid ${C.line}`, boxShadow: "0 2px 10px rgba(20,37,27,0.05)" }}
    >
      <div className="relative">
        <img src={hostel.images[0]} alt={hostel.name} className="w-full object-cover" style={{ aspectRatio: "1 / 1" }} />
        <button
          onClick={(e) => { e.stopPropagation(); onToggleFav(hostel.id); }}
          className="absolute right-3 top-3 flex h-9 w-9 items-center justify-center rounded-full active:scale-90 transition-transform"
          style={{ background: "rgba(255,255,255,0.92)" }}
        >
          <Heart size={17} fill={isFav ? C.danger : "none"} color={isFav ? C.danger : C.ink} />
        </button>
        {hostel.verified && (
          <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full px-2.5 py-1" style={{ background: "rgba(255,255,255,0.95)" }}>
            <VerifiedSeal size="sm" />
            <span className="text-[11px] font-bold" style={{ ...fBody, color: "#8A6D0C" }}>Verified</span>
          </div>
        )}
        <div className="absolute bottom-3 right-3 rounded-full px-2.5 py-1 text-[11px] font-bold" style={{ background: C.ink, color: "#fff", ...fMono }}>
          {hostel.availableRooms} rooms left
        </div>
      </div>
      <div className="p-3.5">
        <div className="flex items-start justify-between gap-2">
          <div className="text-[15px] font-bold leading-tight" style={{ ...fDisplay, color: C.ink }}>{hostel.name}</div>
          <div className="flex shrink-0 items-center gap-1">
            <Star size={13} fill={C.gold} color={C.gold} />
            <span className="text-[13px] font-semibold" style={{ ...fBody, color: C.ink }}>{hostel.rating}</span>
          </div>
        </div>
        <div className="mt-1 flex items-center gap-1 text-[13px]" style={{ ...fBody, color: C.inkSoft }}>
          <MapPin size={12} /> {hostel.distance} km from Chuka University · {hostel.gender}
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <div style={{ ...fMono, color: C.primaryDark }} className="text-[16px] font-bold">
            KES {hostel.price.toLocaleString()}<span className="text-[11px] font-medium" style={{ color: C.inkSoft }}>/mo</span>
          </div>
          <Badge>{hostel.roomType}</Badge>
        </div>
      </div>
    </button>
  );
}

/* ---------------------------------- AUTH SCREEN ---------------------------------- */

function AuthScreen({ onAuthed, showToast }) {
  const [mode, setMode] = useState("login");
  const [showPw, setShowPw] = useState(false);

  const formPanel = (
    <div className="w-full max-w-sm mx-auto flex flex-col justify-center py-10 px-6 md:px-8">
      {/* Mobile-only logo */}
      <div className="mb-8 flex flex-col items-center md:hidden">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl" style={{ background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.18)" }}>
          <Building2 size={30} color={C.primary} />
        </div>
        <div className="text-2xl font-extrabold text-white" style={fDisplay}>ChukaNest</div>
        <div className="mt-1 text-[13px] font-medium text-white/85" style={fBody}>Verified student housing, zero scams.</div>
      </div>

      <div className="rounded-3xl p-5 md:p-6" style={{ background: C.surface, boxShadow: "0 10px 40px rgba(20,37,27,0.12)" }}>
        {/* Desktop-only heading inside form card */}
        <div className="hidden md:block mb-6">
          <div className="text-[22px] font-extrabold" style={{ ...fDisplay, color: C.ink }}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </div>
          <div className="mt-1 text-[13px]" style={{ ...fBody, color: C.inkSoft }}>
            {mode === "login" ? "Sign in to your ChukaNest account" : "Join thousands of Chuka students"}
          </div>
        </div>

        <div className="mb-5 flex rounded-2xl p-1" style={{ background: C.mint }}>
          {["login", "signup"].map((m) => (
            <button
              key={m}
              onClick={() => setMode(m)}
              className="flex-1 rounded-xl py-2 text-sm font-semibold transition-all"
              style={{ ...fBody, background: mode === m ? C.surface : "transparent", color: mode === m ? C.primaryDark : C.inkSoft, boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}
            >
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        <div className="space-y-3">
          {mode === "signup" && (
            <div className="flex items-center gap-2 rounded-2xl px-3.5 py-3" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
              <User size={16} color={C.inkSoft} />
              <input placeholder="Full name" className="w-full bg-transparent text-sm outline-none" style={fBody} />
            </div>
          )}
          <div className="flex items-center gap-2 rounded-2xl px-3.5 py-3" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
            <Mail size={16} color={C.inkSoft} />
            <input placeholder="you@students.chuka.ac.ke" className="w-full bg-transparent text-sm outline-none" style={fBody} />
          </div>
          <div className="flex items-center gap-2 rounded-2xl px-3.5 py-3" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
            <Lock size={16} color={C.inkSoft} />
            <input type={showPw ? "text" : "password"} placeholder="Password" className="w-full bg-transparent text-sm outline-none" style={fBody} />
            <button onClick={() => setShowPw((s) => !s)}>{showPw ? <EyeOff size={16} color={C.inkSoft} /> : <Eye size={16} color={C.inkSoft} />}</button>
          </div>
        </div>

        <div className="mt-5">
          <PrimaryButton full onClick={() => { showToast(mode === "login" ? "Welcome back! 🎉" : "Account created — welcome to ChukaNest!"); onAuthed("student"); }}>
            {mode === "login" ? "Log In" : "Create Account"}
          </PrimaryButton>
        </div>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: C.line }} />
          <span className="text-xs font-medium" style={{ ...fBody, color: C.inkSoft }}>or</span>
          <div className="h-px flex-1" style={{ background: C.line }} />
        </div>

        <button
          onClick={() => { showToast("Signed in with Google"); onAuthed("student"); }}
          className="flex w-full items-center justify-center gap-2.5 rounded-2xl border py-3.5 text-sm font-semibold active:scale-[0.98] transition-transform"
          style={{ ...fBody, borderColor: C.line, color: C.ink }}
        >
          <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.6 20.5H42V20H24v8h11.3C33.9 32.7 29.4 36 24 36c-6.6 0-12-5.4-12-12s5.4-12 12-12c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4 12.9 4 4 12.9 4 24s8.9 20 20 20 20-8.9 20-20c0-1.3-.1-2.7-.4-3.5z"/><path fill="#FF3D00" d="M6.3 14.7l6.6 4.8C14.5 16 18.9 13 24 13c3.1 0 5.8 1.1 8 3l5.7-5.7C34.6 6 29.6 4 24 4c-7.6 0-14.1 4.3-17.3 10.7z"/><path fill="#4CAF50" d="M24 44c5.4 0 10.3-1.9 14.1-5.1l-6.5-5.5C29.6 35.3 26.9 36 24 36c-5.3 0-9.8-3.3-11.4-8l-6.5 5C9.8 39.6 16.3 44 24 44z"/><path fill="#1976D2" d="M43.6 20.5H42V20H24v8h11.3c-.9 2.6-2.7 4.7-5 6.1l6.5 5.5C39.7 37 44 31 44 24c0-1.3-.1-2.7-.4-3.5z"/></svg>
          Continue with Google
        </button>

        <button onClick={() => { showToast("Continuing as guest"); onAuthed("guest"); }} className="mt-4 w-full text-center text-[13px] font-semibold" style={{ ...fBody, color: C.primaryDark }}>
          Continue as guest →
        </button>
      </div>

      <div className="mt-5 flex items-center justify-center gap-1.5 text-[12px]" style={{ ...fBody, color: C.inkSoft }}>
        <ShieldCheck size={12} />
        <span>Your data is safe with us · ChukaNest 2024</span>
      </div>
    </div>
  );

  return (
    <>
      {/* ── Mobile layout ── */}
      <div
        className="md:hidden flex h-full flex-col px-0 pb-0 pt-0"
        style={{ background: `linear-gradient(180deg, ${C.primaryDark} 0%, ${C.primary} 40%, ${C.bg} 40%)` }}
      >
        {formPanel}
      </div>

      {/* ── Desktop layout: two columns ── */}
      <div className="hidden md:flex h-full w-full">
        {/* Left — branding hero */}
        <div
          className="flex flex-col justify-between p-12 w-[55%] shrink-0"
          style={{ background: `linear-gradient(160deg, ${C.primaryDark} 0%, ${C.primaryLight} 100%)` }}
        >
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(255,255,255,0.15)" }}>
              <Building2 size={22} color="#fff" />
            </div>
            <span className="text-[20px] font-extrabold text-white" style={fDisplay}>ChukaNest</span>
          </div>

          {/* Hero text */}
          <div>
            <div className="text-[40px] font-extrabold text-white leading-tight mb-4" style={fDisplay}>
              Find your home<br />near campus.
            </div>
            <div className="text-[15px] text-white/80 mb-10 leading-relaxed" style={fBody}>
              Verified hostels, transparent pricing, and zero scams — built for Chuka University students.
            </div>

            {/* Feature bullets */}
            <div className="space-y-3">
              {[
                { icon: ShieldCheck, text: "Every listing is verified by our team" },
                { icon: Star, text: "Real reviews from fellow students" },
                { icon: MapPin, text: "Distance from campus on every listing" },
              ].map(({ icon: Icon, text }) => (
                <div key={text} className="flex items-center gap-3">
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
                    <Icon size={15} color="#fff" />
                  </div>
                  <span className="text-[14px] text-white/90 font-medium" style={fBody}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stat bar */}
          <div className="flex gap-8">
            {[["7+", "Verified hostels"], ["200+", "Student reviews"], ["0", "Scam reports"]].map(([val, label]) => (
              <div key={label}>
                <div className="text-[26px] font-extrabold text-white" style={fMono}>{val}</div>
                <div className="text-[12px] text-white/70" style={fBody}>{label}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Right — form */}
        <div className="flex flex-1 items-center justify-center overflow-y-auto" style={{ background: C.bg }}>
          {formPanel}
        </div>
      </div>
    </>
  );
}

/* ---------------------------------- HOME SCREEN ---------------------------------- */

function HomeScreen({ hostels, favs, onToggleFav, onOpen, showToast }) {
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("rating");

  const filtered = useMemo(() => {
    return hostels
      .filter((h) => {
        const q = search.toLowerCase();
        const matchSearch = !q || h.name.toLowerCase().includes(q) || h.roomType.toLowerCase().includes(q);
        const matchGender = genderFilter === "All" || h.gender === genderFilter;
        const matchType = typeFilter === "All" || h.roomType === typeFilter;
        return matchSearch && matchGender && matchType;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        if (sortBy === "distance") return a.distance - b.distance;
        return 0;
      });
  }, [hostels, search, genderFilter, typeFilter, sortBy]);

  return (
    <div className="flex h-full flex-col" style={{ background: C.bg }}>
      {/* Header */}
      <div className="px-4 pb-3 pt-5" style={{ background: C.surface, borderBottom: `1px solid ${C.line}` }}>
        <div className="mb-3 flex items-center justify-between">
          <div>
            <div className="text-[22px] font-extrabold leading-tight" style={{ ...fDisplay, color: C.ink }}>ChukaNest</div>
            <div className="text-[13px]" style={{ ...fBody, color: C.inkSoft }}>Find verified housing near Chuka University</div>
          </div>
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl" style={{ background: C.mint }}>
            <Bell size={18} color={C.primaryDark} />
          </div>
        </div>
        {/* Search */}
        <div className="flex items-center gap-2 rounded-2xl px-3.5 py-3" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
          <Search size={16} color={C.inkSoft} />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search hostels, room types…"
            className="w-full bg-transparent text-sm outline-none"
            style={fBody}
          />
          {search && <button onClick={() => setSearch("")}><X size={14} color={C.inkSoft} /></button>}
        </div>
        {/* Filter chips */}
        <div className="mt-2.5 flex gap-2 overflow-x-auto pb-1 no-scrollbar">
          {["All", "Female", "Male", "Mixed"].map((g) => (
            <Chip key={g} active={genderFilter === g} onClick={() => setGenderFilter(g)}>{g}</Chip>
          ))}
          <div className="h-6 w-px self-center" style={{ background: C.line }} />
          {["All", "Bedsitter", "Single", "Shared"].map((t) => (
            <Chip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>{t}</Chip>
          ))}
        </div>
      </div>

      {/* Sort bar */}
      <div className="flex items-center gap-2 px-4 py-2.5">
        <span className="text-[12px] font-medium" style={{ ...fBody, color: C.inkSoft }}>{filtered.length} listings · Sort:</span>
        {[["rating", "Top Rated"], ["price_asc", "Cheapest"], ["distance", "Nearest"]].map(([val, label]) => (
          <button
            key={val}
            onClick={() => setSortBy(val)}
            className="rounded-full px-2.5 py-1 text-[11px] font-semibold"
            style={{ background: sortBy === val ? C.primaryDark : C.line, color: sortBy === val ? "#fff" : C.inkSoft, ...fBody }}
          >
            {label}
          </button>
        ))}
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto px-4 pb-24 md:pb-6">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center py-16 text-center">
            <Search size={40} color={C.line} />
            <div className="mt-3 text-[15px] font-semibold" style={{ ...fDisplay, color: C.inkSoft }}>No hostels found</div>
            <div className="mt-1 text-[13px]" style={{ ...fBody, color: C.inkSoft }}>Try adjusting your filters</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3 pt-1">
            {filtered.map((h) => (
              <HostelCard key={h.id} hostel={h} isFav={favs.has(h.id)} onToggleFav={onToggleFav} onOpen={onOpen} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- DETAIL SCREEN ---------------------------------- */

function DetailScreen({ hostel, isFav, onToggleFav, onBack, reviews, onAddReview, showToast }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [tab, setTab] = useState("about");

  const handleSubmitReview = () => {
    if (!reviewText.trim()) return;
    onAddReview(hostel.id, { id: `r${Date.now()}`, user: "You", rating: reviewRating, text: reviewText, date: "Just now" });
    setReviewText("");
    showToast("Review submitted!");
  };

  return (
    <div className="flex h-full flex-col" style={{ background: C.bg }}>
      {/* Image carousel */}
      <div className="relative" style={{ height: 260, flexShrink: 0 }}>
        <img src={hostel.images[imgIdx]} alt="" className="h-full w-full object-cover" />
        <div className="absolute inset-0" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.3) 0%, transparent 40%)" }} />
        <button onClick={onBack} className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.9)" }}>
          <ArrowLeft size={18} color={C.ink} />
        </button>
        <button onClick={() => onToggleFav(hostel.id)} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.9)" }}>
          <Heart size={17} fill={isFav ? C.danger : "none"} color={isFav ? C.danger : C.ink} />
        </button>
        {/* Dots */}
        <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
          {hostel.images.map((_, i) => (
            <button key={i} onClick={() => setImgIdx(i)} className="h-1.5 rounded-full transition-all" style={{ width: i === imgIdx ? 20 : 6, background: i === imgIdx ? "#fff" : "rgba(255,255,255,0.5)" }} />
          ))}
        </div>
        {/* Prev/Next */}
        {imgIdx > 0 && (
          <button onClick={() => setImgIdx(i => i - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.85)" }}>
            <ChevronLeft size={16} color={C.ink} />
          </button>
        )}
        {imgIdx < hostel.images.length - 1 && (
          <button onClick={() => setImgIdx(i => i + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.85)" }}>
            <ChevronRight size={16} color={C.ink} />
          </button>
        )}
      </div>

      <div className="flex-1 overflow-y-auto pb-28">
        {/* Header info */}
        <div className="px-4 pt-4">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="text-[20px] font-extrabold leading-tight" style={{ ...fDisplay, color: C.ink }}>{hostel.name}</div>
                {hostel.verified && <VerifiedSeal size="sm" />}
              </div>
              <div className="mt-1 flex items-center gap-2 flex-wrap">
                <div className="flex items-center gap-1 text-[13px]" style={{ ...fBody, color: C.inkSoft }}>
                  <MapPin size={12} /> {hostel.distance} km from campus
                </div>
                <Badge>{hostel.gender}</Badge>
                <Badge>{hostel.roomType}</Badge>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[22px] font-bold" style={{ ...fMono, color: C.primaryDark }}>KES {hostel.price.toLocaleString()}</div>
              <div className="text-[11px]" style={{ ...fBody, color: C.inkSoft }}>per month</div>
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <StarRow rating={Math.round(hostel.rating)} />
            <span className="text-[13px] font-semibold" style={{ ...fBody, color: C.ink }}>{hostel.rating}</span>
            <span className="text-[13px]" style={{ ...fBody, color: C.inkSoft }}>({hostel.reviewCount} reviews)</span>
            {hostel.availableRooms <= 2 && (
              <Badge tone="danger">{hostel.availableRooms} room{hostel.availableRooms > 1 ? "s" : ""} left!</Badge>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="mt-4 flex gap-0 border-b px-4" style={{ borderColor: C.line }}>
          {["about", "amenities", "rules", "reviews"].map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              className="mr-4 pb-2.5 text-[13px] font-semibold capitalize transition-all"
              style={{ ...fBody, color: tab === t ? C.primary : C.inkSoft, borderBottom: tab === t ? `2px solid ${C.primary}` : "2px solid transparent" }}
            >
              {t}
            </button>
          ))}
        </div>

        <div className="px-4 pt-4">
          {tab === "about" && (
            <div>
              <p className="text-[14px] leading-relaxed" style={{ ...fBody, color: C.ink }}>{hostel.description}</p>
              <div className="mt-4 rounded-2xl p-3.5" style={{ background: C.mint }}>
                <div className="text-[13px] font-semibold mb-2" style={{ ...fBody, color: C.primaryDark }}>Landlord / Contact</div>
                <div className="text-[14px] font-semibold" style={{ ...fBody, color: C.ink }}>{hostel.landlord}</div>
                <div className="text-[13px]" style={{ ...fBody, color: C.inkSoft }}>{hostel.phone}</div>
              </div>
            </div>
          )}

          {tab === "amenities" && (
            <div className="grid grid-cols-2 gap-2.5">
              {hostel.amenities.map((key) => {
                const meta = AMENITY_META[key];
                if (!meta) return null;
                const Icon = meta.icon;
                return (
                  <div key={key} className="flex items-center gap-2.5 rounded-2xl px-3.5 py-3" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl" style={{ background: C.mint }}>
                      <Icon size={16} color={C.primaryDark} />
                    </div>
                    <span className="text-[13px] font-medium" style={{ ...fBody, color: C.ink }}>{meta.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {tab === "rules" && (
            <div className="space-y-2">
              {hostel.rules.map((rule, i) => (
                <div key={i} className="flex items-start gap-2.5 rounded-2xl px-3.5 py-3" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
                  <CheckCircle2 size={16} color={C.primary} className="mt-0.5 shrink-0" />
                  <span className="text-[13px]" style={{ ...fBody, color: C.ink }}>{rule}</span>
                </div>
              ))}
            </div>
          )}

          {tab === "reviews" && (
            <div>
              <div className="space-y-3 mb-5">
                {(reviews[hostel.id] || []).map((r) => (
                  <div key={r.id} className="rounded-2xl p-3.5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-semibold" style={{ ...fBody, color: C.ink }}>{r.user}</span>
                      <span className="text-[11px]" style={{ ...fBody, color: C.inkSoft }}>{r.date}</span>
                    </div>
                    <StarRow rating={r.rating} size={11} />
                    <p className="mt-1.5 text-[13px] leading-relaxed" style={{ ...fBody, color: C.ink }}>{r.text}</p>
                  </div>
                ))}
                {!(reviews[hostel.id] || []).length && (
                  <div className="py-6 text-center text-[13px]" style={{ ...fBody, color: C.inkSoft }}>No reviews yet. Be the first!</div>
                )}
              </div>
              {/* Add review */}
              <div className="rounded-2xl p-4" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
                <div className="text-[13px] font-semibold mb-2" style={{ ...fBody, color: C.ink }}>Leave a review</div>
                <StarRow rating={reviewRating} size={18} onRate={setReviewRating} />
                <textarea
                  value={reviewText}
                  onChange={(e) => setReviewText(e.target.value)}
                  placeholder="Share your experience…"
                  rows={3}
                  className="mt-2.5 w-full rounded-xl p-2.5 text-sm outline-none resize-none"
                  style={{ ...fBody, background: C.bg, border: `1px solid ${C.line}`, color: C.ink }}
                />
                <div className="mt-2">
                  <PrimaryButton onClick={handleSubmitReview} disabled={!reviewText.trim()}>Submit Review</PrimaryButton>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* CTA */}
      <div className="fixed bottom-16 md:bottom-0 left-0 right-0 md:left-[220px] flex gap-2.5 px-4 pb-2 pt-2" style={{ background: C.surface, borderTop: `1px solid ${C.line}`, zIndex: 20 }}>
        <PrimaryButton variant="ghost" icon={Phone} onClick={() => showToast(`Calling ${hostel.landlord}…`)}>Call</PrimaryButton>
        <PrimaryButton full icon={MessageCircle} onClick={() => showToast("Opening chat…")}>Contact Landlord</PrimaryButton>
      </div>
    </div>
  );
}

/* ---------------------------------- FAVOURITES SCREEN ---------------------------------- */

function FavouritesScreen({ hostels, favs, onToggleFav, onOpen }) {
  const favHostels = hostels.filter((h) => favs.has(h.id));
  return (
    <div className="flex h-full flex-col" style={{ background: C.bg }}>
      <TopBar title="Saved Hostels" />
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 md:pb-6">
        {favHostels.length === 0 ? (
          <div className="flex flex-col items-center py-20 text-center">
            <Heart size={48} color={C.line} />
            <div className="mt-4 text-[16px] font-semibold" style={{ ...fDisplay, color: C.inkSoft }}>No saved hostels yet</div>
            <div className="mt-1 text-[13px]" style={{ ...fBody, color: C.inkSoft }}>Tap the heart on any listing to save it here</div>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
            {favHostels.map((h) => (
              <HostelCard key={h.id} hostel={h} isFav={true} onToggleFav={onToggleFav} onOpen={onOpen} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- MAP SCREEN ---------------------------------- */

const CHUKA_UNIVERSITY = [-0.3317, 37.6500];

function MapScreen({ hostels, onOpen }) {
  const mapRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    if (!mapRef.current || mapInstanceRef.current) return;
    const L = window.L;
    if (!L) return;

    const map = L.map(mapRef.current, {
      zoomControl: true,
    });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // University marker — main anchor point
    const uniIcon = L.divIcon({
      className: "",
      html: `
        <div style="display:flex;flex-direction:column;align-items:center;">
          <div style="background:${C.primaryDark};color:#fff;font-family:'Inter',sans-serif;font-size:12px;font-weight:800;padding:7px 14px;border-radius:12px;white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,0.35);border:2px solid #fff;letter-spacing:0.01em;">
            🎓 Chuka University
          </div>
          <div style="width:2px;height:10px;background:${C.primaryDark};"></div>
          <div style="width:12px;height:12px;border-radius:50%;background:${C.primaryDark};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
        </div>`,
      iconAnchor: [70, 46],
      iconSize: [140, 46],
    });
    L.marker(CHUKA_UNIVERSITY, { icon: uniIcon }).addTo(map);

    // Hostel markers
    hostels.forEach((h) => {
      const icon = L.divIcon({
        className: "",
        html: `<div style="background:${h.verified ? C.primary : C.inkSoft};color:#fff;font-family:'Roboto Mono',monospace;font-size:11px;font-weight:700;padding:5px 9px;border-radius:10px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.22);cursor:pointer;">KES ${(h.price / 1000).toFixed(1)}k</div>`,
        iconAnchor: [30, 28],
      });
      const marker = L.marker(h.latlng, { icon }).addTo(map);
      marker.on("click", () => setSelected(h.id));
    });

    // Fit map to show university + all hostels
    const allPoints = [CHUKA_UNIVERSITY, ...hostels.map((h) => h.latlng)];
    map.fitBounds(allPoints, { padding: [48, 48] });

    mapInstanceRef.current = map;
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, []);

  // Pan to selected hostel
  useEffect(() => {
    if (!selected || !mapInstanceRef.current) return;
    const h = hostels.find((x) => x.id === selected);
    if (h) mapInstanceRef.current.panTo(h.latlng, { animate: true });
  }, [selected]);

  const selectedHostel = hostels.find((h) => h.id === selected);

  return (
    <div className="flex h-full flex-col" style={{ background: C.bg }}>
      <TopBar title="Map View" />
      <div className="flex-1 relative overflow-hidden">
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

      {/* Bottom sheet: selected hostel or horizontal list */}
      {selectedHostel ? (
        <div className="px-4 py-3 pb-24 md:pb-4" style={{ background: C.surface, borderTop: `1px solid ${C.line}` }}>
          <div className="flex gap-3 items-center">
            <img src={selectedHostel.images[0]} alt="" className="h-16 w-16 rounded-2xl object-cover shrink-0" style={{ aspectRatio: "1/1" }} />
            <div className="flex-1 min-w-0">
              <div className="text-[15px] font-bold truncate" style={{ ...fDisplay, color: C.ink }}>{selectedHostel.name}</div>
              <div className="text-[12px]" style={{ ...fBody, color: C.inkSoft }}>{selectedHostel.distance} km · {selectedHostel.gender} · {selectedHostel.roomType}</div>
              <div className="text-[14px] font-bold mt-0.5" style={{ ...fMono, color: C.primaryDark }}>KES {selectedHostel.price.toLocaleString()}/mo</div>
            </div>
            <div className="flex flex-col gap-1.5 shrink-0">
              <PrimaryButton onClick={() => onOpen(selectedHostel.id)}>View</PrimaryButton>
              <button onClick={() => setSelected(null)} className="text-[11px] text-center font-medium" style={{ ...fBody, color: C.inkSoft }}>Close</button>
            </div>
          </div>
        </div>
      ) : (
        <div className="px-4 py-3 pb-24 md:pb-4 overflow-x-auto" style={{ borderTop: `1px solid ${C.line}` }}>
          <div className="flex gap-2.5" style={{ width: "max-content" }}>
            {hostels.map((h) => (
              <button
                key={h.id}
                onClick={() => setSelected(h.id)}
                className="rounded-2xl p-3 text-left"
                style={{ background: C.surface, border: `1px solid ${C.line}`, width: 160 }}
              >
                <img src={h.images[0]} alt="" className="w-full rounded-xl object-cover mb-2" style={{ aspectRatio: "1/1" }} />
                <div className="text-[13px] font-bold truncate" style={{ ...fDisplay, color: C.ink }}>{h.name}</div>
                <div className="text-[12px] font-bold" style={{ ...fMono, color: C.primaryDark }}>KES {h.price.toLocaleString()}/mo</div>
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- PROFILE SCREEN ---------------------------------- */

function ProfileScreen({ role, onLogout, showToast }) {
  return (
    <div className="flex h-full flex-col" style={{ background: C.bg }}>
      <TopBar title="My Profile" />
      <div className="flex-1 overflow-y-auto pb-24 md:pb-6 px-4 pt-4 space-y-3">
        {/* Avatar */}
        <div className="flex flex-col items-center py-6 rounded-3xl" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl mb-3" style={{ background: C.mint }}>
            <User size={30} color={C.primaryDark} />
          </div>
          <div className="text-[17px] font-bold" style={{ ...fDisplay, color: C.ink }}>Student User</div>
          <div className="text-[13px]" style={{ ...fBody, color: C.inkSoft }}>you@students.chuka.ac.ke</div>
          <Badge tone="neutral" className="mt-2">{role === "admin" ? "Admin" : "Student"}</Badge>
        </div>

        {/* Menu items */}
        {[
          { label: "Notifications", icon: Bell },
          { label: "My Reviews", icon: Star },
          { label: "Help & Support", icon: MessageCircle },
          { label: "About ChukaNest", icon: Building2 },
        ].map(({ label, icon: Icon }) => (
          <button
            key={label}
            onClick={() => showToast(`Opening ${label}…`)}
            className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5"
            style={{ background: C.surface, border: `1px solid ${C.line}` }}
          >
            <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: C.mint }}>
              <Icon size={17} color={C.primaryDark} />
            </div>
            <span className="flex-1 text-left text-[14px] font-medium" style={{ ...fBody, color: C.ink }}>{label}</span>
            <ChevronRight size={16} color={C.inkSoft} />
          </button>
        ))}

        <button
          onClick={onLogout}
          className="flex w-full items-center gap-3 rounded-2xl px-4 py-3.5"
          style={{ background: C.dangerSoft, border: `1px solid ${C.danger}` }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: "#fff" }}>
            <LogOut size={17} color={C.danger} />
          </div>
          <span className="flex-1 text-left text-[14px] font-semibold" style={{ ...fBody, color: C.danger }}>Log Out</span>
        </button>
      </div>
    </div>
  );
}

/* ---------------------------------- ADMIN SCREEN ---------------------------------- */

function AdminScreen({ showToast }) {
  const [activeTab, setActiveTab] = useState("verifications");
  const [verifications, setVerifications] = useState(PENDING_VERIFICATIONS);
  const [flagged, setFlagged] = useState(FLAGGED_REVIEWS);

  const handleVerify = (id) => {
    setVerifications((v) => v.filter((x) => x.id !== id));
    showToast("Hostel verified ✓");
  };
  const handleRejectV = (id) => {
    setVerifications((v) => v.filter((x) => x.id !== id));
    showToast("Verification rejected");
  };
  const handleDismissFlag = (id) => {
    setFlagged((f) => f.filter((x) => x.id !== id));
    showToast("Review cleared");
  };
  const handleRemoveReview = (id) => {
    setFlagged((f) => f.filter((x) => x.id !== id));
    showToast("Review removed");
  };

  return (
    <div className="flex h-full flex-col" style={{ background: C.bg }}>
      <TopBar
        title="Admin Dashboard"
        right={<Badge tone="gold">Admin</Badge>}
      />

      {/* Stats */}
      <div className="grid grid-cols-3 gap-2 px-4 py-3">
        {[
          { label: "Listings", value: HOSTELS.length, icon: Building2 },
          { label: "Pending", value: verifications.length, icon: Clock },
          { label: "Flagged", value: flagged.length, icon: Flag },
        ].map(({ label, value, icon: Icon }) => (
          <div key={label} className="flex flex-col items-center rounded-2xl py-3" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
            <Icon size={18} color={C.primaryDark} />
            <div className="text-[18px] font-bold mt-1" style={{ ...fMono, color: C.ink }}>{value}</div>
            <div className="text-[11px]" style={{ ...fBody, color: C.inkSoft }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-0 border-b px-4" style={{ borderColor: C.line }}>
        {["verifications", "flagged"].map((t) => (
          <button
            key={t}
            onClick={() => setActiveTab(t)}
            className="mr-4 pb-2.5 text-[13px] font-semibold capitalize transition-all"
            style={{ ...fBody, color: activeTab === t ? C.primary : C.inkSoft, borderBottom: activeTab === t ? `2px solid ${C.primary}` : "2px solid transparent" }}
          >
            {t === "verifications" ? "Pending Verifications" : "Flagged Reviews"}
          </button>
        ))}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 md:pb-6 space-y-3">
        {activeTab === "verifications" && (
          verifications.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <CheckCircle2 size={40} color={C.primary} />
              <div className="mt-3 text-[15px] font-semibold" style={{ ...fDisplay, color: C.inkSoft }}>All clear!</div>
            </div>
          ) : verifications.map((v) => (
            <div key={v.id} className="rounded-2xl p-4" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
              <div className="flex items-start justify-between gap-2 mb-2">
                <div>
                  <div className="text-[14px] font-bold" style={{ ...fDisplay, color: C.ink }}>{v.name}</div>
                  <div className="text-[12px]" style={{ ...fBody, color: C.inkSoft }}>by {v.landlord} · submitted {v.submitted}</div>
                </div>
                <Badge tone="gold">Pending</Badge>
              </div>
              <div className="flex gap-2">
                <PrimaryButton onClick={() => handleVerify(v.id)} icon={Check}>Verify</PrimaryButton>
                <PrimaryButton variant="outline" onClick={() => handleRejectV(v.id)} icon={X}>Reject</PrimaryButton>
              </div>
            </div>
          ))
        )}

        {activeTab === "flagged" && (
          flagged.length === 0 ? (
            <div className="flex flex-col items-center py-16 text-center">
              <CheckCircle2 size={40} color={C.primary} />
              <div className="mt-3 text-[15px] font-semibold" style={{ ...fDisplay, color: C.inkSoft }}>No flagged reviews</div>
            </div>
          ) : flagged.map((f) => (
            <div key={f.id} className="rounded-2xl p-4" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
              <div className="flex items-start justify-between gap-2 mb-1">
                <div className="text-[13px] font-bold" style={{ ...fDisplay, color: C.ink }}>{f.hostel}</div>
                <Badge tone="danger">Flagged by {f.flaggedBy}</Badge>
              </div>
              <div className="text-[12px] mb-1" style={{ ...fBody, color: C.inkSoft }}>by {f.user}</div>
              <p className="text-[13px] mb-3 leading-relaxed" style={{ ...fBody, color: C.ink }}>{f.text}</p>
              <div className="flex gap-2">
                <PrimaryButton onClick={() => handleDismissFlag(f.id)} variant="ghost" icon={ThumbsUp}>Keep</PrimaryButton>
                <PrimaryButton onClick={() => handleRemoveReview(f.id)} icon={Trash2}>Remove</PrimaryButton>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- NAV (bottom mobile / sidebar desktop) ---------------------------------- */

function AppNav({ tab, setTab, role }) {
  const tabs = [
    { id: "home", label: "Home", icon: Home },
    { id: "map", label: "Map", icon: Navigation },
    { id: "favs", label: "Saved", icon: Heart },
    ...(role === "admin" ? [{ id: "admin", label: "Admin", icon: LayoutDashboard }] : []),
    { id: "profile", label: "Profile", icon: User },
  ];

  return (
    <>
      {/* Mobile bottom nav */}
      <div
        className="md:hidden fixed bottom-0 left-0 right-0 flex items-center justify-around px-2"
        style={{ background: C.surface, borderTop: `1px solid ${C.line}`, height: 64, zIndex: 30 }}
      >
        {tabs.map(({ id, label, icon: Icon }) => {
          const active = tab === id;
          return (
            <button
              key={id}
              onClick={() => setTab(id)}
              className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all"
              style={{ background: active ? C.mint : "transparent", minWidth: 56 }}
            >
              <Icon size={20} color={active ? C.primaryDark : C.inkSoft} strokeWidth={active ? 2.2 : 1.8} />
              <span className="text-[10px] font-semibold" style={{ ...fBody, color: active ? C.primaryDark : C.inkSoft }}>{label}</span>
            </button>
          );
        })}
      </div>

      {/* Desktop sidebar */}
      <div
        className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 py-6 px-3"
        style={{ width: 220, background: C.surface, borderRight: `1px solid ${C.line}`, zIndex: 30 }}
      >
        {/* Logo */}
        <div className="flex items-center gap-2.5 px-3 mb-8">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0" style={{ background: C.primary }}>
            <Building2 size={18} color="#fff" />
          </div>
          <span className="text-[17px] font-extrabold" style={{ ...fDisplay, color: C.ink }}>ChukaNest</span>
        </div>

        <div className="flex flex-col gap-1 flex-1">
          {tabs.map(({ id, label, icon: Icon }) => {
            const active = tab === id;
            return (
              <button
                key={id}
                onClick={() => setTab(id)}
                className="flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all text-left"
                style={{ background: active ? C.mint : "transparent" }}
              >
                <Icon size={18} color={active ? C.primaryDark : C.inkSoft} strokeWidth={active ? 2.2 : 1.8} />
                <span className="text-[14px] font-semibold" style={{ ...fBody, color: active ? C.primaryDark : C.inkSoft }}>{label}</span>
              </button>
            );
          })}
        </div>

        <div className="px-3 pt-4" style={{ borderTop: `1px solid ${C.line}` }}>
          <div className="text-[11px]" style={{ ...fBody, color: C.inkSoft }}>Verified student housing</div>
          <div className="text-[11px]" style={{ ...fBody, color: C.inkSoft }}>near Chuka University</div>
        </div>
      </div>
    </>
  );
}

/* ---------------------------------- APP ROOT ---------------------------------- */

export default function App() {
  const [role, setRole] = useState(null); // null = auth screen
  const [tab, setTab] = useState("home");
  const [openHostelId, setOpenHostelId] = useState(null);
  const [favs, setFavs] = useState(new Set(["h4", "h7"]));
  const [reviews, setReviews] = useState(INITIAL_REVIEWS);
  const [toast, setToast] = useState(null);
  const toastRef = useRef(null);

  // Inject Google Fonts
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = FONT_IMPORT;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2500);
  };

  const toggleFav = (id) => {
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); showToast("Removed from saved"); }
      else { next.add(id); showToast("Saved!"); }
      return next;
    });
  };

  const addReview = (hostelId, review) => {
    setReviews((prev) => ({ ...prev, [hostelId]: [review, ...(prev[hostelId] || [])] }));
  };

  const openHostel = HOSTELS.find((h) => h.id === openHostelId);

  if (!role) {
    return (
      <div className="h-screen w-full overflow-hidden" style={{ background: C.primaryDark }}>
        <Toast toast={toast} />
        {/* Mobile: scrollable centered card  |  Desktop: full-height two-column */}
        <div className="md:hidden h-full overflow-y-auto" style={{ background: `linear-gradient(180deg, ${C.primaryDark} 0%, ${C.primary} 40%, ${C.bg} 40%)` }}>
          <AuthScreen onAuthed={(r) => setRole(r)} showToast={showToast} />
        </div>
        <div className="hidden md:block h-full">
          <AuthScreen onAuthed={(r) => setRole(r)} showToast={showToast} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: C.bg }}>
      <Toast toast={toast} />
      <AppNav tab={tab} setTab={setTab} role={role} />
      {/* Content shifts right on desktop to make room for the sidebar */}
      <div className="flex-1 overflow-hidden md:ml-[220px]">
        {openHostel ? (
          <DetailScreen
            hostel={openHostel}
            isFav={favs.has(openHostel.id)}
            onToggleFav={toggleFav}
            onBack={() => setOpenHostelId(null)}
            reviews={reviews}
            onAddReview={addReview}
            showToast={showToast}
          />
        ) : (
          <div className="h-full">
            {tab === "home" && <HomeScreen hostels={HOSTELS} favs={favs} onToggleFav={toggleFav} onOpen={setOpenHostelId} showToast={showToast} />}
            {tab === "map" && <MapScreen hostels={HOSTELS} onOpen={(id) => { setOpenHostelId(id); }} />}
            {tab === "favs" && <FavouritesScreen hostels={HOSTELS} favs={favs} onToggleFav={toggleFav} onOpen={setOpenHostelId} />}
            {tab === "admin" && role === "admin" && <AdminScreen showToast={showToast} />}
            {tab === "profile" && <ProfileScreen role={role} onLogout={() => { setRole(null); setTab("home"); showToast("Logged out"); }} showToast={showToast} />}
          </div>
        )}
      </div>
    </div>
  );
}
