import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Home, Search, Heart, User, MapPin, Star, Wifi, Droplets, Zap, ShieldCheck,
  Car, Shirt, BookOpen, Camera, Phone, MessageCircle, Navigation, Bell, X, Check,
  ChevronLeft, ChevronRight, ChevronDown, Plus, Trash2, Pencil, LogOut, Mail, Lock,
  BarChart3, Users, LayoutDashboard, TrendingUp, AlertTriangle, CheckCircle2,
  SlidersHorizontal, ImagePlus, Building2, ArrowLeft, Eye, EyeOff, Flag, Clock,
  ThumbsUp, MoreVertical, Sparkles, Loader2, Bot, Send
} from "lucide-react";
import { api, saveAuth, loadAuth, clearAuth } from "./api.js";

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

/* ---------------------------------- AMENITY META ---------------------------------- */
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
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setError("");
    if (!email.trim() || !password.trim()) {
      setError("Please fill in all fields");
      return;
    }
    if (mode === "signup" && !name.trim()) {
      setError("Please enter your name");
      return;
    }
    setLoading(true);
    try {
      const result = mode === "login"
        ? await api.login(email.trim(), password)
        : await api.signup(name.trim(), email.trim(), password);
      saveAuth(result.token, result.user);
      showToast(result.user.role === "admin" ? "Welcome, Admin 👋" : mode === "login" ? "Welcome back! 🎉" : "Account created — welcome to ChukaNest!");
      onAuthed(result.user.role, result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
              onClick={() => { setMode(m); setError(""); }}
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
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full bg-transparent text-sm outline-none" style={fBody} />
            </div>
          )}
          <div className="flex items-center gap-2 rounded-2xl px-3.5 py-3" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
            <Mail size={16} color={C.inkSoft} />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@students.chuka.ac.ke" className="w-full bg-transparent text-sm outline-none" style={fBody} />
          </div>
          <div className="flex items-center gap-2 rounded-2xl px-3.5 py-3" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
            <Lock size={16} color={C.inkSoft} />
            <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-transparent text-sm outline-none" style={fBody} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
            <button onClick={() => setShowPw((s) => !s)}>{showPw ? <EyeOff size={16} color={C.inkSoft} /> : <Eye size={16} color={C.inkSoft} />}</button>
          </div>
        </div>

        {error && (
          <div className="mt-3 rounded-xl px-3 py-2 text-[12px] font-medium" style={{ background: C.dangerSoft, color: C.danger, ...fBody }}>
            {error}
          </div>
        )}

        <div className="mt-5">
          <PrimaryButton full onClick={handleSubmit} disabled={loading}>
            {loading ? "Please wait…" : mode === "login" ? "Log In" : "Create Account"}
          </PrimaryButton>
        </div>

        <div className="my-4 flex items-center gap-3">
          <div className="h-px flex-1" style={{ background: C.line }} />
          <span className="text-[11px]" style={{ ...fBody, color: C.inkSoft }}>demo accounts</span>
          <div className="h-px flex-1" style={{ background: C.line }} />
        </div>

        <div className="space-y-2 text-[11px]" style={{ ...fBody, color: C.inkSoft }}>
          <div className="rounded-xl px-3 py-2" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
            <span className="font-semibold">Admin:</span> admin@chukanest.co.ke / Admin1234!
          </div>
          <div className="rounded-xl px-3 py-2" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
            <span className="font-semibold">Student:</span> faith@students.chuka.ac.ke / Student123!
          </div>
        </div>

        <button onClick={() => { showToast("Continuing as guest"); onAuthed("guest", null); }} className="mt-4 w-full text-center text-[13px] font-semibold" style={{ ...fBody, color: C.primaryDark }}>
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

function HomeScreen({ hostels, favs, onToggleFav, onOpen, showToast, currentUser, favIds }) {
  const [search, setSearch] = useState("");
  const [genderFilter, setGenderFilter] = useState("All");
  const [typeFilter, setTypeFilter] = useState("All");
  const [sortBy, setSortBy] = useState("rating");

  // AI Smart Search
  const [aiMode, setAiMode] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiFilters, setAiFilters] = useState(null); // structured filters from AI
  const [aiHint, setAiHint] = useState(""); // human-readable interpretation

  // AI Recommendations
  const [recs, setRecs] = useState([]);
  const [recsLoading, setRecsLoading] = useState(false);
  const [recsLoaded, setRecsLoaded] = useState(false);

  // Load recommendations once on mount (only for logged-in users)
  useEffect(() => {
    if (!currentUser || recsLoaded) return;
    setRecsLoading(true);
    setRecsLoaded(true);
    api.aiRecommend({ bookmarkedIds: favIds ? [...favIds] : [], gender: null, budget: null })
      .then((data) => setRecs(data.recommendations || []))
      .catch(() => {})
      .finally(() => setRecsLoading(false));
  }, [currentUser]);

  const handleAiSearch = async () => {
    if (!search.trim()) return;
    setAiLoading(true);
    setAiFilters(null);
    setAiHint("");
    try {
      const result = await api.aiSearch(search.trim());
      setAiFilters(result);
      setAiHint(result.summary || "");
      // Apply AI-suggested sort
      if (result.sortBy) setSortBy(result.sortBy);
      // Apply AI-suggested gender/type filters
      if (result.gender) setGenderFilter(result.gender);
      if (result.roomType) setTypeFilter(result.roomType);
    } catch {
      showToast("AI search failed — try again");
    } finally {
      setAiLoading(false);
    }
  };

  const clearAiSearch = () => {
    setAiFilters(null);
    setAiHint("");
    setSearch("");
    setGenderFilter("All");
    setTypeFilter("All");
    setSortBy("rating");
  };

  const filtered = useMemo(() => {
    return hostels
      .filter((h) => {
        // Regular text search (when not in AI mode or AI hasn't run yet)
        const q = aiFilters ? "" : search.toLowerCase();
        const matchSearch = !q || h.name.toLowerCase().includes(q) || h.roomType.toLowerCase().includes(q);
        const matchGender = genderFilter === "All" || h.gender === genderFilter;
        const matchType = typeFilter === "All" || h.roomType === typeFilter;
        // AI filters (applied on top)
        const matchMaxPrice = !aiFilters?.maxPrice || h.price <= aiFilters.maxPrice;
        const matchMinRating = !aiFilters?.minRating || h.rating >= aiFilters.minRating;
        const matchAmenities = !aiFilters?.amenities?.length ||
          aiFilters.amenities.every((a) => h.amenities.includes(a));
        return matchSearch && matchGender && matchType && matchMaxPrice && matchMinRating && matchAmenities;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        if (sortBy === "distance") return a.distance - b.distance;
        return 0;
      });
  }, [hostels, search, genderFilter, typeFilter, sortBy, aiFilters]);

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
        <div
          className="flex items-center gap-2 rounded-2xl px-3.5 py-3"
          style={{ background: C.bg, border: `1.5px solid ${aiMode ? C.primary : C.line}`, transition: "border-color 0.2s" }}
        >
          {aiLoading
            ? <Loader2 size={16} color={C.primary} className="animate-spin shrink-0" />
            : aiMode
              ? <Sparkles size={16} color={C.primary} className="shrink-0" />
              : <Search size={16} color={C.inkSoft} className="shrink-0" />
          }
          <input
            value={search}
            onChange={(e) => { setSearch(e.target.value); if (aiFilters) clearAiSearch(); }}
            onKeyDown={(e) => { if (e.key === "Enter" && aiMode) handleAiSearch(); }}
            placeholder={aiMode ? "Describe what you're looking for…" : "Search hostels, room types…"}
            className="w-full bg-transparent text-sm outline-none"
            style={fBody}
          />
          {(search || aiFilters) && (
            <button onClick={clearAiSearch}><X size={14} color={C.inkSoft} /></button>
          )}
          {/* AI toggle */}
          <button
            onClick={() => { setAiMode((m) => !m); if (aiFilters) clearAiSearch(); }}
            className="shrink-0 flex items-center gap-1 rounded-full px-2 py-1 text-[11px] font-bold transition-all"
            style={{ background: aiMode ? C.primary : C.mint, color: aiMode ? "#fff" : C.primaryDark }}
            title={aiMode ? "Switch to regular search" : "Switch to AI search"}
          >
            <Sparkles size={11} />
            AI
          </button>
        </div>

        {/* AI mode hint */}
        {aiMode && !aiFilters && !aiLoading && (
          <div className="mt-1.5 text-[11px] px-1" style={{ ...fBody, color: C.inkSoft }}>
            Try: "quiet female hostel under 6k" or "wifi + security near gate" — press Enter
          </div>
        )}
        {aiHint && (
          <div className="mt-1.5 flex items-center gap-1.5 rounded-xl px-3 py-1.5" style={{ background: C.mint }}>
            <Sparkles size={11} color={C.primary} />
            <span className="text-[11px] font-semibold" style={{ ...fBody, color: C.primaryDark }}>{aiHint}</span>
          </div>
        )}

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

        {/* AI Recommendations strip */}
        {recs.length > 0 && !aiFilters && (
          <div className="mb-4 mt-2">
            <div className="flex items-center gap-1.5 mb-2">
              <Sparkles size={13} color={C.primary} />
              <span className="text-[12px] font-bold" style={{ ...fDisplay, color: C.ink }}>Recommended for you</span>
            </div>
            <div className="flex gap-3 overflow-x-auto pb-1 no-scrollbar">
              {recs.map(({ hostel: h, reason }) => (
                <button
                  key={h._id}
                  onClick={() => onOpen(h._id)}
                  className="shrink-0 rounded-2xl text-left overflow-hidden"
                  style={{ width: 200, background: C.surface, border: `1px solid ${C.line}`, boxShadow: "0 2px 8px rgba(20,37,27,0.06)" }}
                >
                  <img src={h.images?.[0]} alt={h.name} className="w-full object-cover" style={{ height: 110 }} />
                  <div className="p-2.5">
                    <div className="text-[13px] font-bold truncate" style={{ ...fDisplay, color: C.ink }}>{h.name}</div>
                    <div className="text-[11px] font-bold mt-0.5" style={{ ...fMono, color: C.primaryDark }}>KES {h.price?.toLocaleString()}/mo</div>
                    <div className="mt-1.5 rounded-lg px-2 py-1" style={{ background: C.mint }}>
                      <div className="flex items-start gap-1">
                        <Sparkles size={9} color={C.primary} className="mt-0.5 shrink-0" />
                        <span className="text-[10px] leading-snug" style={{ ...fBody, color: C.primaryDark }}>{reason}</span>
                      </div>
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
        {recsLoading && (
          <div className="flex items-center gap-1.5 mb-3 mt-2">
            <Loader2 size={12} color={C.primary} className="animate-spin" />
            <span className="text-[11px]" style={{ ...fBody, color: C.inkSoft }}>Finding recommendations…</span>
          </div>
        )}

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

function DetailScreen({ hostel, isFav, onToggleFav, onBack, reviews, onLoadReviews, onAddReview, showToast, currentUser }) {
  const [imgIdx, setImgIdx] = useState(0);
  const [reviewText, setReviewText] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [tab, setTab] = useState("about");
  const [submitting, setSubmitting] = useState(false);

  // AI review summary
  const [reviewSummary, setReviewSummary] = useState(null);
  const [summaryLoading, setSummaryLoading] = useState(false);
  const [summaryFetched, setSummaryFetched] = useState(false);

  // Load reviews + AI summary when switching to reviews tab
  useEffect(() => {
    if (tab !== "reviews") return;
    if (!reviews) onLoadReviews(hostel.id);
    if (!summaryFetched) {
      setSummaryFetched(true);
      setSummaryLoading(true);
      api.aiSummarize(hostel.id)
        .then((data) => setReviewSummary(data.summary || null))
        .catch(() => {})
        .finally(() => setSummaryLoading(false));
    }
  }, [tab]);

  const handleSubmitReview = async () => {
    if (!reviewText.trim()) return;
    if (!currentUser) { showToast("Please log in to leave a review"); return; }
    setSubmitting(true);
    try {
      await onAddReview(hostel.id, { rating: reviewRating, text: reviewText });
      setReviewText("");
      showToast("Review submitted!");
    } catch (err) {
      showToast("Failed to submit review");
    } finally {
      setSubmitting(false);
    }
  };

  const hostelReviews = reviews || [];

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
              {/* AI Summary Card */}
              {summaryLoading && (
                <div className="mb-4 flex items-center gap-2 rounded-2xl px-4 py-3" style={{ background: C.mint }}>
                  <Loader2 size={14} color={C.primary} className="animate-spin shrink-0" />
                  <span className="text-[12px]" style={{ ...fBody, color: C.primaryDark }}>Summarising reviews with AI…</span>
                </div>
              )}
              {reviewSummary && !summaryLoading && (
                <div className="mb-4 rounded-2xl px-4 py-3" style={{ background: C.mint, border: `1px solid ${C.primary}22` }}>
                  <div className="flex items-center gap-1.5 mb-1.5">
                    <Sparkles size={13} color={C.primary} />
                    <span className="text-[11px] font-bold" style={{ ...fBody, color: C.primaryDark }}>AI Summary</span>
                  </div>
                  <p className="text-[13px] leading-relaxed" style={{ ...fBody, color: C.ink }}>{reviewSummary}</p>
                </div>
              )}

              <div className="space-y-3 mb-5">
                {hostelReviews.map((r) => (
                  <div key={r.id} className="rounded-2xl p-3.5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[13px] font-semibold" style={{ ...fBody, color: C.ink }}>{r.user}</span>
                      <span className="text-[11px]" style={{ ...fBody, color: C.inkSoft }}>
                        {r.createdAt ? new Date(r.createdAt).toLocaleDateString("en-KE", { day: "numeric", month: "short" }) : ""}
                      </span>
                    </div>
                    <StarRow rating={r.rating} size={11} />
                    <p className="mt-1.5 text-[13px] leading-relaxed" style={{ ...fBody, color: C.ink }}>{r.text}</p>
                  </div>
                ))}
                {hostelReviews.length === 0 && (
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
                  <PrimaryButton onClick={handleSubmitReview} disabled={!reviewText.trim() || submitting}>
                    {submitting ? "Submitting…" : "Submit Review"}
                  </PrimaryButton>
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

    const map = L.map(mapRef.current, { zoomControl: true });

    L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
      attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
      maxZoom: 19,
    }).addTo(map);

    // University marker
    const uniIcon = L.divIcon({
      className: "",
      html: `<div style="display:flex;flex-direction:column;align-items:center;">
        <div style="background:${C.primaryDark};color:#fff;font-family:'Inter',sans-serif;font-size:12px;font-weight:800;padding:7px 14px;border-radius:12px;white-space:nowrap;box-shadow:0 4px 16px rgba(0,0,0,0.35);border:2px solid #fff;">🎓 Chuka University</div>
        <div style="width:2px;height:10px;background:${C.primaryDark};"></div>
        <div style="width:12px;height:12px;border-radius:50%;background:${C.primaryDark};border:2px solid #fff;box-shadow:0 2px 6px rgba(0,0,0,0.3);"></div>
      </div>`,
      iconAnchor: [70, 46],
      iconSize: [140, 46],
    });
    L.marker(CHUKA_UNIVERSITY, { icon: uniIcon }).addTo(map);

    hostels.forEach((h) => {
      if (!h.latlng || h.latlng.length < 2) return;
      const icon = L.divIcon({
        className: "",
        html: `<div style="background:${h.verified ? C.primary : C.inkSoft};color:#fff;font-family:'Roboto Mono',monospace;font-size:11px;font-weight:700;padding:5px 9px;border-radius:10px;white-space:nowrap;box-shadow:0 2px 8px rgba(0,0,0,0.22);cursor:pointer;">KES ${(h.price / 1000).toFixed(1)}k</div>`,
        iconAnchor: [30, 28],
      });
      const marker = L.marker(h.latlng, { icon }).addTo(map);
      marker.on("click", () => setSelected(h.id));
    });

    const allPoints = [CHUKA_UNIVERSITY, ...hostels.filter(h => h.latlng?.length >= 2).map((h) => h.latlng)];
    map.fitBounds(allPoints, { padding: [48, 48] });

    const [uLat, uLon] = CHUKA_UNIVERSITY;
    hostels.forEach((h) => {
      if (!h.latlng || h.latlng.length < 2) return;
      const [hLat, hLon] = h.latlng;
      const url = `https://router.project-osrm.org/route/v1/driving/${uLon},${uLat};${hLon},${hLat}?overview=full&geometries=geojson`;
      fetch(url)
        .then((r) => r.json())
        .then((data) => {
          if (!mapInstanceRef.current) return;
          const coords = data?.routes?.[0]?.geometry?.coordinates;
          if (!coords) return;
          const latLngs = coords.map(([lon, lat]) => [lat, lon]);
          L.polyline(latLngs, { color: "#3B82F6", weight: 4, opacity: 0.75 }).addTo(mapInstanceRef.current);
        })
        .catch(() => {});
    });

    mapInstanceRef.current = map;
    return () => {
      map.remove();
      mapInstanceRef.current = null;
    };
  }, [hostels]);

  useEffect(() => {
    if (!selected || !mapInstanceRef.current) return;
    const h = hostels.find((x) => x.id === selected);
    if (h?.latlng) mapInstanceRef.current.panTo(h.latlng, { animate: true });
  }, [selected]);

  const selectedHostel = hostels.find((h) => h.id === selected);

  return (
    <div className="flex h-full flex-col" style={{ background: C.bg }}>
      <TopBar title="Map View" />
      <div className="flex-1 relative overflow-hidden">
        <div ref={mapRef} style={{ width: "100%", height: "100%" }} />
      </div>

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

function ProfileScreen({ role, currentUser, onLogout, showToast, onOpenChat }) {
  const [open, setOpen] = useState(null); // which panel is expanded
  const [myReviews, setMyReviews] = useState(null);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const toggle = (id) => {
    const next = open === id ? null : id;
    setOpen(next);
    if (next === "reviews" && myReviews === null) {
      setReviewsLoading(true);
      api.getMyReviews()
        .then(setMyReviews)
        .catch(() => setMyReviews([]))
        .finally(() => setReviewsLoading(false));
    }
  };

  const NOTIFICATIONS = [
    { text: "Your review on Meru View Hostels was approved.", time: "2 days ago", icon: CheckCircle2, tone: C.primary },
    { text: "New hostel added near campus: Kianjagi Court.", time: "5 days ago", icon: Building2, tone: C.primaryDark },
    { text: "Welcome to ChukaNest! Find your home near campus.", time: "1 week ago", icon: Bell, tone: C.inkSoft },
  ];

  const StarRow = ({ n }) => (
    <div className="flex gap-0.5">
      {[1,2,3,4,5].map((i) => (
        <Star key={i} size={11} color={i <= n ? "#f59e0b" : C.line} fill={i <= n ? "#f59e0b" : "none"} />
      ))}
    </div>
  );

  const MenuItem = ({ id, label, icon: Icon, children, onClick }) => {
    const isOpen = open === id;
    return (
      <div className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
        <button
          onClick={onClick || (() => toggle(id))}
          className="flex w-full items-center gap-3 px-4 py-3.5"
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-xl shrink-0" style={{ background: C.mint }}>
            <Icon size={17} color={C.primaryDark} />
          </div>
          <span className="flex-1 text-left text-[14px] font-medium" style={{ ...fBody, color: C.ink }}>{label}</span>
          {children
            ? <ChevronDown size={16} color={C.inkSoft} style={{ transform: isOpen ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
            : <ChevronRight size={16} color={C.inkSoft} />
          }
        </button>
        {children && isOpen && (
          <div style={{ borderTop: `1px solid ${C.line}` }}>{children}</div>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-full flex-col" style={{ background: C.bg }}>
      <TopBar title="My Profile" />
      <div className="flex-1 overflow-y-auto pb-24 md:pb-6 px-4 pt-4 space-y-3">

        {/* Avatar card */}
        <div className="flex flex-col items-center py-6 rounded-3xl" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
          <div className="flex h-16 w-16 items-center justify-center rounded-2xl mb-3" style={{ background: C.mint }}>
            <User size={30} color={C.primaryDark} />
          </div>
          <div className="text-[17px] font-bold" style={{ ...fDisplay, color: C.ink }}>
            {currentUser?.name || "Guest"}
          </div>
          <div className="text-[13px]" style={{ ...fBody, color: C.inkSoft }}>
            {currentUser?.email || "Not signed in"}
          </div>
          <div className="mt-2">
            <Badge tone="neutral">{role === "admin" ? "Admin" : role === "guest" ? "Guest" : "Student"}</Badge>
          </div>
        </div>

        {/* Notifications */}
        <MenuItem id="notifications" label="Notifications" icon={Bell}>
          <div className="divide-y" style={{ borderColor: C.line }}>
            {NOTIFICATIONS.map((n, i) => (
              <div key={i} className="flex items-start gap-3 px-4 py-3">
                <div className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-full shrink-0" style={{ background: C.mint }}>
                  <n.icon size={13} color={n.tone} />
                </div>
                <div className="flex-1">
                  <div className="text-[13px] leading-snug" style={{ ...fBody, color: C.ink }}>{n.text}</div>
                  <div className="text-[11px] mt-0.5" style={{ ...fBody, color: C.inkSoft }}>{n.time}</div>
                </div>
              </div>
            ))}
          </div>
        </MenuItem>

        {/* My Reviews */}
        {role !== "guest" && (
          <MenuItem id="reviews" label="My Reviews" icon={Star}>
            <div className="px-4 py-3">
              {reviewsLoading && (
                <div className="flex items-center gap-2 py-2">
                  <Loader2 size={14} color={C.primary} className="animate-spin" />
                  <span className="text-[13px]" style={{ ...fBody, color: C.inkSoft }}>Loading your reviews…</span>
                </div>
              )}
              {myReviews && myReviews.length === 0 && (
                <div className="py-4 text-center">
                  <Star size={28} color={C.line} className="mx-auto mb-2" />
                  <div className="text-[13px]" style={{ ...fBody, color: C.inkSoft }}>You haven't reviewed any hostels yet.</div>
                </div>
              )}
              {myReviews && myReviews.length > 0 && (
                <div className="space-y-3">
                  {myReviews.map((r) => (
                    <div key={r.id} className="rounded-xl p-3" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        {r.hostelImage && (
                          <img src={r.hostelImage} alt="" className="h-8 w-8 rounded-lg object-cover shrink-0" />
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="text-[13px] font-semibold truncate" style={{ ...fDisplay, color: C.ink }}>{r.hostelName}</div>
                          <StarRow n={r.rating} />
                        </div>
                        <span className="text-[10px] shrink-0" style={{ ...fBody, color: C.inkSoft }}>{r.date}</span>
                      </div>
                      <p className="text-[12px] leading-relaxed" style={{ ...fBody, color: C.inkSoft }}>{r.text}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </MenuItem>
        )}

        {/* Help & Support → opens AI chat */}
        <MenuItem
          id="help"
          label="Help & Support"
          icon={MessageCircle}
          onClick={() => onOpenChat?.()}
        />

        {/* About ChukaNest */}
        <MenuItem id="about" label="About ChukaNest" icon={Building2}>
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl shrink-0" style={{ background: C.primary }}>
                <Building2 size={18} color="#fff" />
              </div>
              <div>
                <div className="text-[14px] font-bold" style={{ ...fDisplay, color: C.ink }}>ChukaNest</div>
                <div className="text-[12px]" style={{ ...fBody, color: C.inkSoft }}>Version 1.0 · Chuka, Kenya</div>
              </div>
            </div>
            <p className="text-[13px] leading-relaxed" style={{ ...fBody, color: C.inkSoft }}>
              ChukaNest helps Chuka University students find safe, verified, and affordable accommodation near campus — with real reviews, transparent pricing, and zero scams.
            </p>
            <div className="grid grid-cols-3 gap-2 pt-1">
              {[["7+", "Hostels"], ["200+", "Reviews"], ["0", "Scams"]].map(([val, lbl]) => (
                <div key={lbl} className="rounded-xl py-2.5 text-center" style={{ background: C.mint }}>
                  <div className="text-[16px] font-extrabold" style={{ ...fDisplay, color: C.primaryDark }}>{val}</div>
                  <div className="text-[10px]" style={{ ...fBody, color: C.inkSoft }}>{lbl}</div>
                </div>
              ))}
            </div>
            <div className="text-[11px] text-center pt-1" style={{ ...fBody, color: C.inkSoft }}>
              © 2024 ChukaNest · Built for students, by students
            </div>
          </div>
        </MenuItem>

        {/* Log out */}
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
  const [activeTab, setActiveTab] = useState("overview");
  const [listings, setListings] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      try {
        const [active, pending, flaggedRevs, userList] = await Promise.all([
          api.getHostels(),
          api.getHostels("pending"),
          api.getFlaggedReviews(),
          api.getUsers(),
        ]);
        setListings(active);
        setPendingVerifications(pending);
        setFlagged(flaggedRevs);
        setUsers(userList);
      } catch (err) {
        showToast("Failed to load admin data");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const verifiedCount = listings.filter((h) => h.verified).length;
  const totalRooms = listings.reduce((s, h) => s + h.availableRooms, 0);

  // Dummy enquiry data for chart (would be real in a full analytics implementation)
  const MONTHLY_ENQUIRIES = [
    { month: "Feb", count: 18 }, { month: "Mar", count: 27 },
    { month: "Apr", count: 35 }, { month: "May", count: 52 },
    { month: "Jun", count: 44 }, { month: "Jul", count: 61 },
  ];
  const maxEnquiry = Math.max(...MONTHLY_ENQUIRIES.map((m) => m.count));

  const TABS = [
    { id: "overview",      label: "Overview",  icon: LayoutDashboard },
    { id: "listings",      label: "Listings",  icon: Building2 },
    { id: "users",         label: "Users",     icon: Users },
    { id: "verifications", label: "Verify",    icon: Clock, badge: pendingVerifications.length },
    { id: "flagged",       label: "Flagged",   icon: Flag, badge: flagged.length },
  ];

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center" style={{ background: C.bg }}>
        <div className="text-[14px]" style={{ ...fBody, color: C.inkSoft }}>Loading…</div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col" style={{ background: C.bg }}>
      {/* Header */}
      <div className="px-4 pt-4 pb-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${C.line}` }}>
        <div>
          <div className="text-[18px] font-extrabold" style={{ ...fDisplay, color: C.ink }}>Admin Dashboard</div>
          <div className="text-[12px]" style={{ ...fBody, color: C.inkSoft }}>ChukaNest · {new Date().toLocaleString("en-US", { month: "long", year: "numeric" })}</div>
        </div>
        <Badge tone="gold">Admin</Badge>
      </div>

      {/* Tab bar */}
      <div className="flex overflow-x-auto gap-1 px-3 py-2 shrink-0" style={{ borderBottom: `1px solid ${C.line}` }}>
        {TABS.map(({ id, label, icon: Icon, badge }) => (
          <button
            key={id}
            onClick={() => setActiveTab(id)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[12px] font-semibold shrink-0 relative transition-all"
            style={{
              ...fBody,
              background: activeTab === id ? C.primaryDark : "transparent",
              color: activeTab === id ? "#fff" : C.inkSoft,
            }}
          >
            <Icon size={13} />
            {label}
            {!!badge && (
              <span className="ml-0.5 rounded-full px-1.5 py-0 text-[10px] font-bold" style={{ background: C.danger, color: "#fff" }}>{badge}</span>
            )}
          </button>
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto pb-24 md:pb-6">

        {/* ── OVERVIEW ── */}
        {activeTab === "overview" && (
          <div className="px-4 py-4 space-y-5">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {[
                { label: "Total Listings", value: listings.length, icon: Building2, color: C.primary },
                { label: "Verified", value: verifiedCount, icon: ShieldCheck, color: "#1B8A5A" },
                { label: "Registered Users", value: users.length, icon: Users, color: C.gold },
                { label: "Available Rooms", value: totalRooms, icon: Home, color: "#5B6DCD" },
              ].map(({ label, value, icon: Icon, color }) => (
                <div key={label} className="rounded-2xl p-4 flex items-center gap-3" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
                  <div className="rounded-xl p-2.5 shrink-0" style={{ background: color + "18" }}>
                    <Icon size={20} color={color} />
                  </div>
                  <div>
                    <div className="text-[22px] font-extrabold leading-none" style={{ ...fMono, color: C.ink }}>{value}</div>
                    <div className="text-[11px] mt-0.5" style={{ ...fBody, color: C.inkSoft }}>{label}</div>
                  </div>
                </div>
              ))}
            </div>

            {/* Enquiry chart */}
            <div className="rounded-2xl p-4" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
              <div className="text-[13px] font-bold mb-4" style={{ ...fDisplay, color: C.ink }}>Monthly Enquiries</div>
              <div className="flex items-end gap-2" style={{ height: 100 }}>
                {MONTHLY_ENQUIRIES.map(({ month, count }) => (
                  <div key={month} className="flex-1 flex flex-col items-center gap-1">
                    <div className="text-[10px] font-semibold" style={{ ...fMono, color: C.primary }}>{count}</div>
                    <div className="w-full rounded-t-lg transition-all" style={{ height: `${(count / maxEnquiry) * 80}px`, background: C.primary, opacity: 0.85 }} />
                    <div className="text-[10px]" style={{ ...fBody, color: C.inkSoft }}>{month}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick alerts */}
            <div className="space-y-2">
              <div className="text-[13px] font-bold mb-1" style={{ ...fDisplay, color: C.ink }}>Needs Attention</div>
              {pendingVerifications.length > 0 && (
                <button onClick={() => setActiveTab("verifications")} className="w-full flex items-center gap-3 rounded-2xl p-3.5 text-left" style={{ background: C.goldSoft, border: `1px solid ${C.gold}40` }}>
                  <Clock size={18} color={C.gold} />
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold" style={{ ...fBody, color: C.ink }}>{pendingVerifications.length} pending verifications</div>
                    <div className="text-[11px]" style={{ ...fBody, color: C.inkSoft }}>Review and approve new listings</div>
                  </div>
                  <ChevronRight size={16} color={C.inkSoft} />
                </button>
              )}
              {flagged.length > 0 && (
                <button onClick={() => setActiveTab("flagged")} className="w-full flex items-center gap-3 rounded-2xl p-3.5 text-left" style={{ background: C.dangerSoft, border: `1px solid ${C.danger}30` }}>
                  <Flag size={18} color={C.danger} />
                  <div className="flex-1">
                    <div className="text-[13px] font-semibold" style={{ ...fBody, color: C.ink }}>{flagged.length} flagged reviews</div>
                    <div className="text-[11px]" style={{ ...fBody, color: C.inkSoft }}>Moderate review content</div>
                  </div>
                  <ChevronRight size={16} color={C.inkSoft} />
                </button>
              )}
              {pendingVerifications.length === 0 && flagged.length === 0 && (
                <div className="flex items-center gap-3 rounded-2xl p-3.5" style={{ background: C.mint }}>
                  <CheckCircle2 size={18} color={C.primary} />
                  <div className="text-[13px] font-semibold" style={{ ...fBody, color: C.primary }}>Everything looks good — no pending actions</div>
                </div>
              )}
            </div>

            {/* Listing breakdown */}
            <div className="rounded-2xl overflow-hidden" style={{ border: `1px solid ${C.line}` }}>
              <div className="px-4 py-3" style={{ background: C.surface, borderBottom: `1px solid ${C.line}` }}>
                <div className="text-[13px] font-bold" style={{ ...fDisplay, color: C.ink }}>Listings by Gender</div>
              </div>
              {[
                { label: "Female only", count: listings.filter(h => h.gender === "Female").length, color: "#E879A0" },
                { label: "Male only",   count: listings.filter(h => h.gender === "Male").length,   color: "#5B6DCD" },
                { label: "Mixed",       count: listings.filter(h => h.gender === "Mixed").length,   color: C.primary },
              ].map(({ label, count, color }) => (
                <div key={label} className="flex items-center gap-3 px-4 py-3" style={{ background: C.surface, borderBottom: `1px solid ${C.line}` }}>
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: color }} />
                  <div className="flex-1 text-[13px]" style={{ ...fBody, color: C.ink }}>{label}</div>
                  <div className="text-[13px] font-bold" style={{ ...fMono, color: C.ink }}>{count}</div>
                  <div className="w-24 h-2 rounded-full overflow-hidden" style={{ background: C.line }}>
                    <div className="h-full rounded-full" style={{ width: listings.length ? `${(count / listings.length) * 100}%` : "0%", background: color }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ── LISTINGS ── */}
        {activeTab === "listings" && (
          <div className="px-4 py-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-[13px]" style={{ ...fBody, color: C.inkSoft }}>{listings.length} listings total</div>
              <button onClick={() => showToast("Add listing coming soon")} className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold" style={{ background: C.primary, color: "#fff", ...fBody }}>
                <Plus size={13} /> Add Listing
              </button>
            </div>
            {listings.map((h) => (
              <div key={h.id} className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
                <div className="flex items-center gap-3 p-3">
                  <img src={h.images[0]} alt="" className="w-14 h-14 rounded-xl object-cover shrink-0" style={{ aspectRatio: "1/1" }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <div className="text-[14px] font-bold truncate" style={{ ...fDisplay, color: C.ink }}>{h.name}</div>
                      {h.verified
                        ? <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: C.mint, color: C.primary }}>Verified</span>
                        : <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: C.goldSoft, color: C.gold }}>Unverified</span>
                      }
                    </div>
                    <div className="text-[12px]" style={{ ...fBody, color: C.inkSoft }}>{h.landlord} · {h.gender} · {h.roomType}</div>
                    <div className="text-[12px] font-semibold mt-0.5" style={{ ...fMono, color: C.primaryDark }}>KES {h.price.toLocaleString()}/mo · {h.availableRooms} rooms</div>
                  </div>
                </div>
                <div className="flex border-t" style={{ borderColor: C.line }}>
                  <button onClick={() => showToast(`Editing ${h.name}…`)} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-semibold" style={{ ...fBody, color: C.inkSoft }}>
                    <Pencil size={13} /> Edit
                  </button>
                  {!h.verified && (
                    <button
                      onClick={async () => {
                        try {
                          await api.updateHostel(h.id, { verified: true });
                          setListings((l) => l.map((x) => x.id === h.id ? { ...x, verified: true } : x));
                          showToast(`${h.name} verified ✓`);
                        } catch { showToast("Failed to verify"); }
                      }}
                      className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-semibold border-l"
                      style={{ ...fBody, color: C.primary, borderColor: C.line }}
                    >
                      <ShieldCheck size={13} /> Verify
                    </button>
                  )}
                  <button
                    onClick={async () => {
                      try {
                        await api.deleteHostel(h.id);
                        setListings((l) => l.filter((x) => x.id !== h.id));
                        showToast("Listing removed");
                      } catch { showToast("Failed to remove"); }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-semibold border-l"
                    style={{ ...fBody, color: C.danger, borderColor: C.line }}
                  >
                    <Trash2 size={13} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── USERS ── */}
        {activeTab === "users" && (
          <div className="px-4 py-4 space-y-2">
            <div className="text-[13px] mb-3" style={{ ...fBody, color: C.inkSoft }}>{users.length} registered accounts</div>
            {users.map((u) => (
              <div key={u.id} className="flex items-center gap-3 rounded-2xl p-3.5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
                <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0 text-[15px] font-bold" style={{ background: u.status === "flagged" ? C.dangerSoft : C.mint, color: u.status === "flagged" ? C.danger : C.primary }}>
                  {u.name?.charAt(0) ?? "?"}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <div className="text-[13px] font-bold truncate" style={{ ...fDisplay, color: C.ink }}>{u.name || u.email?.split("@")[0] || "Unknown"}</div>
                    {u.role === "admin" && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: C.goldSoft, color: C.gold }}>Admin</span>}
                    {u.status === "flagged" && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: C.dangerSoft, color: C.danger }}>Flagged</span>}
                    {u.status === "suspended" && <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md" style={{ background: C.dangerSoft, color: C.danger }}>Suspended</span>}
                  </div>
                  <div className="text-[11px] truncate" style={{ ...fBody, color: C.inkSoft }}>{u.email}</div>
                  <div className="text-[11px]" style={{ ...fBody, color: C.inkSoft }}>Joined {u.joined} · {u.bookmarks} saved</div>
                </div>
                {u.role !== "admin" && (
                  <button
                    onClick={async () => {
                      const newStatus = u.status === "suspended" ? "active" : "suspended";
                      try {
                        await api.updateUser(u.id, { status: newStatus });
                        setUsers((us) => us.map((x) => x.id === u.id ? { ...x, status: newStatus } : x));
                        showToast(`${u.name || u.email} ${newStatus === "suspended" ? "suspended" : "reactivated"}`);
                      } catch { showToast("Action failed"); }
                    }}
                    className="shrink-0 rounded-xl px-2.5 py-1.5 text-[11px] font-semibold"
                    style={{ ...fBody, background: C.dangerSoft, color: C.danger }}
                  >
                    {u.status === "suspended" ? "Reactivate" : "Suspend"}
                  </button>
                )}
              </div>
            ))}
          </div>
        )}

        {/* ── VERIFICATIONS ── */}
        {activeTab === "verifications" && (
          <div className="px-4 py-4 space-y-3">
            {pendingVerifications.length === 0 ? (
              <div className="flex flex-col items-center py-20">
                <CheckCircle2 size={44} color={C.primary} />
                <div className="mt-3 text-[15px] font-semibold" style={{ ...fDisplay, color: C.inkSoft }}>All caught up!</div>
                <div className="text-[13px] mt-1" style={{ ...fBody, color: C.inkSoft }}>No pending verifications</div>
              </div>
            ) : pendingVerifications.map((v) => (
              <div key={v.id} className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <div className="text-[15px] font-bold" style={{ ...fDisplay, color: C.ink }}>{v.name}</div>
                      <div className="text-[12px] mt-0.5" style={{ ...fBody, color: C.inkSoft }}>by {v.landlord} · {v.phone}</div>
                    </div>
                    <Badge tone="gold">Pending</Badge>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: "Rooms", value: v.availableRooms },
                      { label: "Price/mo", value: `KES ${v.price?.toLocaleString()}` },
                      { label: "Distance", value: `${v.distance} km` },
                    ].map(({ label, value }) => (
                      <div key={label} className="rounded-xl p-2 text-center" style={{ background: C.bg }}>
                        <div className="text-[12px] font-bold" style={{ ...fMono, color: C.ink }}>{value}</div>
                        <div className="text-[10px]" style={{ ...fBody, color: C.inkSoft }}>{label}</div>
                      </div>
                    ))}
                  </div>
                  <div className="text-[11px] mb-3" style={{ ...fBody, color: C.inkSoft }}>
                    Submitted {v.createdAt ? new Date(v.createdAt).toLocaleDateString("en-KE") : "recently"}
                  </div>
                </div>
                <div className="flex border-t" style={{ borderColor: C.line }}>
                  <button
                    onClick={async () => {
                      try {
                        await api.updateHostel(v.id, { status: "active", verified: true });
                        setPendingVerifications((vs) => vs.filter((x) => x.id !== v.id));
                        setListings((l) => [...l, { ...v, status: "active", verified: true }]);
                        showToast(`${v.name} verified ✓`);
                      } catch { showToast("Failed to approve"); }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-bold"
                    style={{ ...fBody, color: C.primary }}
                  >
                    <Check size={15} /> Approve
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await api.updateHostel(v.id, { status: "rejected" });
                        setPendingVerifications((vs) => vs.filter((x) => x.id !== v.id));
                        showToast("Verification rejected");
                      } catch { showToast("Failed to reject"); }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-bold border-l"
                    style={{ ...fBody, color: C.danger, borderColor: C.line }}
                  >
                    <X size={15} /> Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── FLAGGED REVIEWS ── */}
        {activeTab === "flagged" && (
          <div className="px-4 py-4 space-y-3">
            {flagged.length === 0 ? (
              <div className="flex flex-col items-center py-20">
                <CheckCircle2 size={44} color={C.primary} />
                <div className="mt-3 text-[15px] font-semibold" style={{ ...fDisplay, color: C.inkSoft }}>No flagged reviews</div>
              </div>
            ) : flagged.map((f) => (
              <div key={f.id} className="rounded-2xl overflow-hidden" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
                <div className="p-4">
                  <div className="flex items-start justify-between gap-2 mb-1">
                    <div className="text-[14px] font-bold" style={{ ...fDisplay, color: C.ink }}>{f.hostel}</div>
                    <div className="text-[10px] font-bold px-2 py-0.5 rounded-full" style={{ background: C.dangerSoft, color: C.danger }}>Flagged by {f.flaggedBy}</div>
                  </div>
                  <div className="text-[11px] mb-2" style={{ ...fBody, color: C.inkSoft }}>by {f.user} · {f.date}</div>
                  <p className="text-[13px] leading-relaxed rounded-xl p-3" style={{ ...fBody, color: C.ink, background: C.bg }}>{f.text}</p>
                </div>
                <div className="flex border-t" style={{ borderColor: C.line }}>
                  <button
                    onClick={async () => {
                      try {
                        await api.moderateReview(f.id, "keep");
                        setFlagged((fl) => fl.filter((x) => x.id !== f.id));
                        showToast("Review cleared — kept");
                      } catch { showToast("Action failed"); }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-bold"
                    style={{ ...fBody, color: C.primary }}
                  >
                    <ThumbsUp size={15} /> Keep
                  </button>
                  <button
                    onClick={async () => {
                      try {
                        await api.moderateReview(f.id, "remove");
                        setFlagged((fl) => fl.filter((x) => x.id !== f.id));
                        showToast("Review removed");
                      } catch { showToast("Action failed"); }
                    }}
                    className="flex-1 flex items-center justify-center gap-1.5 py-3 text-[13px] font-bold border-l"
                    style={{ ...fBody, color: C.danger, borderColor: C.line }}
                  >
                    <Trash2 size={15} /> Remove
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

/* ---------------------------------- NAV ---------------------------------- */

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

/* ────────────────────────── AI CHAT SIDEBAR ────────────────────────── */

function ChatSidebar({ onClose, role }) {
  const GREETING = "Hi! 👋 I'm your ChukaNest assistant. Tell me what you're looking for — budget, room type, gender preference — and I'll point you to the right hostel.";
  const [messages, setMessages] = useState([{ role: "assistant", content: GREETING }]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [streamText, setStreamText] = useState("");
  const bottomRef = useRef(null);
  const inputRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, streamText]);

  useEffect(() => { inputRef.current?.focus(); }, []);

  const send = async () => {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg = { role: "user", content: text };
    const nextMsgs = [...messages, userMsg];
    setMessages(nextMsgs);
    setInput("");
    setLoading(true);
    setStreamText("");

    try {
      const res = await fetch("/api/ai/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMsgs.map(({ role, content }) => ({ role, content })),
        }),
      });

      if (!res.ok) throw new Error("Request failed");

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let full = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split("\n");
        for (const line of lines) {
          if (!line.startsWith("data: ")) continue;
          const payload = line.slice(6).trim();
          if (payload === "[DONE]") break;
          try {
            const delta = JSON.parse(payload)?.choices?.[0]?.delta?.content || "";
            full += delta;
            setStreamText(full);
          } catch {}
        }
      }

      setMessages((prev) => [...prev, { role: "assistant", content: full }]);
      setStreamText("");
    } catch {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: "Sorry, I couldn't connect right now. Please try again!" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const quickPrompts = [
    "Female bedsitter under KES 5,000",
    "Closest hostel to campus",
    "Best rated with WiFi",
    "Mixed hostel with parking",
  ];

  return (
    /* Backdrop */
    <div className="fixed inset-0 z-40 flex justify-end" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      {/* Panel */}
      <div
        className="relative flex flex-col h-full w-full max-w-sm"
        style={{ background: C.bg, borderLeft: `1px solid ${C.line}`, boxShadow: "-6px 0 32px rgba(20,37,27,0.14)" }}
      >
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-3.5 shrink-0"
          style={{ background: C.primary, borderBottom: `1px solid ${C.line}` }}
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.18)" }}>
            <Bot size={16} color="#fff" />
          </div>
          <div className="flex-1">
            <div className="text-[14px] font-bold text-white" style={fDisplay}>ChukaNest AI</div>
            <div className="text-[11px] text-white/70" style={fBody}>Powered by Groq · llama-3.1</div>
          </div>
          <button
            onClick={onClose}
            className="flex h-7 w-7 items-center justify-center rounded-full transition-colors"
            style={{ background: "rgba(255,255,255,0.15)" }}
          >
            <X size={14} color="#fff" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.map((m, i) => (
            <div key={i} className={`flex gap-2.5 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
              {m.role === "assistant" && (
                <div className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center mt-0.5" style={{ background: C.mint }}>
                  <Bot size={13} color={C.primary} />
                </div>
              )}
              <div
                className="max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed"
                style={{
                  background: m.role === "user" ? C.primary : C.surface,
                  color: m.role === "user" ? "#fff" : C.ink,
                  borderRadius: m.role === "user" ? "18px 18px 4px 18px" : "18px 18px 18px 4px",
                  border: m.role === "user" ? "none" : `1px solid ${C.line}`,
                  ...fBody,
                }}
              >
                {m.content}
              </div>
            </div>
          ))}

          {/* Streaming bubble */}
          {streamText && (
            <div className="flex gap-2.5">
              <div className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center mt-0.5" style={{ background: C.mint }}>
                <Bot size={13} color={C.primary} />
              </div>
              <div
                className="max-w-[78%] rounded-2xl px-3.5 py-2.5 text-[13px] leading-relaxed"
                style={{ background: C.surface, color: C.ink, borderRadius: "18px 18px 18px 4px", border: `1px solid ${C.line}`, ...fBody }}
              >
                {streamText}
                <span className="inline-block w-1.5 h-3.5 ml-0.5 rounded-sm animate-pulse" style={{ background: C.primary, verticalAlign: "middle" }} />
              </div>
            </div>
          )}

          {/* Typing indicator (before first token) */}
          {loading && !streamText && (
            <div className="flex gap-2.5">
              <div className="shrink-0 h-7 w-7 rounded-full flex items-center justify-center" style={{ background: C.mint }}>
                <Bot size={13} color={C.primary} />
              </div>
              <div className="flex items-center gap-1 rounded-2xl px-4 py-3" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
                {[0, 1, 2].map((i) => (
                  <span key={i} className="block h-1.5 w-1.5 rounded-full animate-bounce" style={{ background: C.inkSoft, animationDelay: `${i * 0.15}s` }} />
                ))}
              </div>
            </div>
          )}

          {/* Quick prompts — only show when chat is fresh */}
          {messages.length === 1 && !loading && (
            <div className="pt-1 space-y-2">
              <div className="text-[11px] font-semibold px-1" style={{ ...fBody, color: C.inkSoft }}>Try asking:</div>
              {quickPrompts.map((p) => (
                <button
                  key={p}
                  onClick={() => { setInput(p); inputRef.current?.focus(); }}
                  className="block w-full text-left rounded-xl px-3 py-2 text-[12px] transition-colors"
                  style={{ background: C.mint, color: C.primaryDark, ...fBody, border: `1px solid ${C.primary}22` }}
                >
                  {p}
                </button>
              ))}
            </div>
          )}

          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="shrink-0 px-4 pb-6 pt-3" style={{ borderTop: `1px solid ${C.line}` }}>
          <div className="flex items-end gap-2 rounded-2xl px-3.5 py-2.5" style={{ background: C.surface, border: `1.5px solid ${C.line}` }}>
            <textarea
              ref={inputRef}
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); send(); } }}
              placeholder="Ask about hostels…"
              rows={1}
              className="flex-1 bg-transparent text-[13px] outline-none resize-none leading-relaxed"
              style={{ ...fBody, color: C.ink, maxHeight: 96, overflowY: "auto" }}
            />
            <button
              onClick={send}
              disabled={!input.trim() || loading}
              className="shrink-0 flex h-8 w-8 items-center justify-center rounded-xl transition-all"
              style={{ background: input.trim() && !loading ? C.primary : C.line }}
            >
              {loading
                ? <Loader2 size={14} color="#fff" className="animate-spin" />
                : <Send size={14} color={input.trim() ? "#fff" : C.inkSoft} />
              }
            </button>
          </div>
          <div className="mt-1.5 text-center text-[10px]" style={{ ...fBody, color: C.inkSoft }}>Enter to send · Shift+Enter for new line</div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- APP ROOT ---------------------------------- */

export default function App() {
  const [role, setRole] = useState(null);
  const [currentUser, setCurrentUser] = useState(null);
  const [tab, setTab] = useState("home");
  const [openHostelId, setOpenHostelId] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [favs, setFavs] = useState(new Set());
  const [reviews, setReviews] = useState({}); // { hostelId: Review[] }
  const [toast, setToast] = useState(null);
  const [hostelLoading, setHostelLoading] = useState(true);
  const [chatOpen, setChatOpen] = useState(false);
  const toastRef = useRef(null);

  // Inject Google Fonts
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = FONT_IMPORT;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
  }, []);

  // Restore auth from localStorage on mount
  useEffect(() => {
    const saved = loadAuth();
    if (saved) {
      setRole(saved.user.role);
      setCurrentUser(saved.user);
    }
  }, []);

  // Fetch hostels when authenticated
  useEffect(() => {
    if (role === null) return; // not yet authed
    setHostelLoading(true);
    api.getHostels()
      .then((data) => setHostels(data))
      .catch(() => showToast("Failed to load hostels"))
      .finally(() => setHostelLoading(false));

    // Load bookmarks for logged-in users
    if (role !== "guest") {
      api.getBookmarks()
        .then((bookmarked) => setFavs(new Set(bookmarked.map((h) => h._id || h.id))))
        .catch(() => {});
    }
  }, [role]);

  const showToast = (msg) => {
    setToast(msg);
    clearTimeout(toastRef.current);
    toastRef.current = setTimeout(() => setToast(null), 2500);
  };

  const handleAuthed = (userRole, user) => {
    setRole(userRole);
    setCurrentUser(user);
    setTab("home");
  };

  const handleLogout = () => {
    clearAuth();
    setRole(null);
    setCurrentUser(null);
    setTab("home");
    setHostels([]);
    setFavs(new Set());
    setReviews({});
    setOpenHostelId(null);
    showToast("Logged out");
  };

  const toggleFav = async (hostelId) => {
    if (role === "guest") { showToast("Please log in to save hostels"); return; }
    // Optimistic update
    setFavs((prev) => {
      const next = new Set(prev);
      if (next.has(hostelId)) { next.delete(hostelId); showToast("Removed from saved"); }
      else { next.add(hostelId); showToast("Saved!"); }
      return next;
    });
    try {
      await api.toggleBookmark(hostelId);
    } catch {
      // Revert on failure
      setFavs((prev) => {
        const next = new Set(prev);
        if (next.has(hostelId)) next.delete(hostelId);
        else next.add(hostelId);
        return next;
      });
      showToast("Failed to update saved");
    }
  };

  const loadReviews = async (hostelId) => {
    try {
      const data = await api.getReviews(hostelId);
      setReviews((prev) => ({ ...prev, [hostelId]: data }));
    } catch {
      showToast("Failed to load reviews");
    }
  };

  const addReview = async (hostelId, reviewData) => {
    const newReview = await api.addReview(hostelId, reviewData);
    setReviews((prev) => ({ ...prev, [hostelId]: [newReview, ...(prev[hostelId] || [])] }));
    // Refresh hostel to get updated rating
    try {
      const updated = await api.getHostel(hostelId);
      setHostels((prev) => prev.map((h) => h.id === hostelId ? { ...updated, id: updated._id || updated.id } : h));
    } catch {}
  };

  const openHostel = hostels.find((h) => h.id === openHostelId);

  if (!role) {
    return (
      <div className="h-screen w-full overflow-hidden" style={{ background: C.primaryDark }}>
        <Toast toast={toast} />
        <div className="md:hidden h-full overflow-y-auto" style={{ background: `linear-gradient(180deg, ${C.primaryDark} 0%, ${C.primary} 40%, ${C.bg} 40%)` }}>
          <AuthScreen onAuthed={handleAuthed} showToast={showToast} />
        </div>
        <div className="hidden md:block h-full">
          <AuthScreen onAuthed={handleAuthed} showToast={showToast} />
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-full overflow-hidden" style={{ background: C.bg }}>
      <Toast toast={toast} />
      <AppNav tab={tab} setTab={setTab} role={role} />

      {/* Floating AI chat button */}
      {!chatOpen && (
        <button
          onClick={() => setChatOpen(true)}
          className="fixed z-40 flex items-center gap-2 rounded-full px-4 py-3 shadow-lg transition-all hover:scale-105"
          style={{
            bottom: 82,
            right: 16,
            background: C.primary,
            boxShadow: "0 4px 20px rgba(20,100,60,0.35)",
          }}
          title="Ask AI Assistant"
        >
          <Bot size={18} color="#fff" />
          <span className="text-[13px] font-bold text-white hidden sm:inline" style={fDisplay}>Ask AI</span>
        </button>
      )}

      {/* AI Chat Sidebar */}
      {chatOpen && <ChatSidebar onClose={() => setChatOpen(false)} role={role} />}

      <div className="flex-1 overflow-hidden md:ml-[220px]">
        {openHostel ? (
          <DetailScreen
            hostel={openHostel}
            isFav={favs.has(openHostel.id)}
            onToggleFav={toggleFav}
            onBack={() => setOpenHostelId(null)}
            reviews={reviews[openHostel.id]}
            onLoadReviews={loadReviews}
            onAddReview={addReview}
            showToast={showToast}
            currentUser={currentUser}
          />
        ) : (
          <div className="h-full">
            {tab === "home" && (
              hostelLoading ? (
                <div className="flex h-full items-center justify-center">
                  <div className="text-[14px]" style={{ ...fBody, color: C.inkSoft }}>Loading hostels…</div>
                </div>
              ) : (
                <HomeScreen hostels={hostels} favs={favs} onToggleFav={toggleFav} onOpen={setOpenHostelId} showToast={showToast} currentUser={currentUser} favIds={[...favs]} />
              )
            )}
            {tab === "map" && <MapScreen hostels={hostels} onOpen={(id) => setOpenHostelId(id)} />}
            {tab === "favs" && <FavouritesScreen hostels={hostels} favs={favs} onToggleFav={toggleFav} onOpen={setOpenHostelId} />}
            {tab === "admin" && role === "admin" && <AdminScreen showToast={showToast} />}
            {tab === "profile" && <ProfileScreen role={role} currentUser={currentUser} onLogout={handleLogout} showToast={showToast} onOpenChat={() => setChatOpen(true)} />}
          </div>
        )}
      </div>
    </div>
  );
}
