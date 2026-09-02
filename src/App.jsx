import React, { useState, useMemo, useRef, useEffect } from "react";
import {
  Home, Search, Heart, User, MapPin, Star, Wifi, Droplets, Zap, ShieldCheck,
  Car, Shirt, BookOpen, Camera, Phone, MessageCircle, Navigation, Bell, X, Check,
  ChevronLeft, ChevronRight, ChevronDown, Plus, Trash2, Pencil, LogOut, Mail, Lock,
  BarChart3, Users, LayoutDashboard, TrendingUp, AlertTriangle, CheckCircle2,
  SlidersHorizontal, ImagePlus, Building2, ArrowLeft, Eye, EyeOff, Flag, Clock,
  ThumbsUp, MoreVertical, Sparkles, Loader2, Bot, Send, Moon, Sun, Bird
} from "lucide-react";
import { api, saveAuth, loadAuth, clearAuth } from "./api.js";

/* ---------------------------------- THEME ---------------------------------- */
const LIGHT_PALETTE = {
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
const DARK_PALETTE = {
  primary: "#2F8F5E",
  primaryDark: "#5BBF8A",
  primaryLight: "#4CAF7D",
  mint: "#0D2018",
  gold: "#F0C040",
  goldSoft: "#1E1A08",
  bg: "#0C1610",
  surface: "#141F18",
  ink: "#E0EDE5",
  inkSoft: "#7A9E87",
  line: "#1E3028",
  danger: "#E07070",
  dangerSoft: "#2A1010",
};
// Mutable reference — App reassigns before each render so all children see updated colors
let C = { ...LIGHT_PALETTE };

const FONT_IMPORT = `@import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@500;600;700;800&family=Inter:wght@400;500;600&family=Roboto+Mono:wght@500;600&display=swap');`;

const fDisplay = { fontFamily: "'Plus Jakarta Sans', sans-serif" };

const isVideo = (src = "") =>
  /\.(mp4|webm|ogg|mov|m4v|mkv)(\?.*)?$/i.test(src) ||
  src.startsWith("blob:") && src.includes("video");

const PLACEHOLDER = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300' viewBox='0 0 400 300'%3E%3Crect width='400' height='300' fill='%23E4E9E3'/%3E%3Crect x='160' y='110' width='80' height='60' rx='6' fill='%23C4CEBC'/%3E%3Ccircle cx='175' cy='125' r='8' fill='%23A8B8A0'/%3E%3Cpolygon points='155,170 200,130 230,155 260,135 295,170' fill='%23A8B8A0'/%3E%3C/svg%3E";

const SEMESTER_MONTHS = 4;
const billingPeriodLabel = (period = "month") => period === "semester" ? "semester" : "month";
const billingPeriodPreposition = (period = "month") => period === "semester" ? "per semester" : "per month";
const monthlyEquivalent = (price, period = "month") => {
  const amount = Number(price);
  if (!Number.isFinite(amount)) return 0;
  return period === "semester" ? Math.round(amount / SEMESTER_MONTHS) : amount;
};

function PriceSummary({ price, billingPeriod = "month", mainClassName = "", mainStyle = {}, subClassName = "", subStyle = {} }) {
  const amount = Number(price) || 0;
  const period = billingPeriodLabel(billingPeriod);
  return (
    <div>
      <div className={mainClassName} style={mainStyle}>
        KES {amount.toLocaleString()}<span className="text-[11px] font-medium" style={{ color: C.inkSoft }}>/{period}</span>
      </div>
      {period === "semester" && (
        <div className={subClassName} style={{ ...fBody, color: C.inkSoft, fontSize: 10, marginTop: 2, ...subStyle }}>
          ≈ KES {monthlyEquivalent(amount, billingPeriod).toLocaleString()}/month <span style={{ opacity: 0.8 }}>(4 months)</span>
        </div>
      )}
    </div>
  );
}

function MediaItem({ src, alt = "", style, className, controls = false }) {
  if (isVideo(src)) {
    const onLoaded = (e) => { try { e.target.currentTime = 0.001; } catch {} };
    const videoStyle = { ...style, display: "block" };
    return controls ? (
      <video src={src} style={videoStyle} className={className} controls playsInline preload="auto" onLoadedMetadata={onLoaded} />
    ) : (
      <video src={src} style={videoStyle} className={className} autoPlay muted loop playsInline preload="auto" onLoadedMetadata={onLoaded} />
    );
  }
  return (
    <img
      src={src}
      alt={alt}
      style={style}
      className={className}
      onError={(e) => { if (e.target.src !== PLACEHOLDER) e.target.src = PLACEHOLDER; }}
    />
  );
}
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
    gold: { bg: C.goldSoft, color: C.gold },
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

function PrimaryButton({ children, onClick, icon: Icon, full, variant = "solid", disabled, className = "" }) {
  const base = "flex items-center justify-center gap-2 rounded-2xl px-5 py-3.5 text-sm font-semibold transition-all active:scale-[0.98] disabled:opacity-50";
  const style =
    variant === "solid"
      ? { background: disabled ? "#9CB8A8" : C.primary, color: "#fff" }
      : variant === "outline"
      ? { background: "transparent", color: C.primary, border: `1.5px solid ${C.primary}` }
      : { background: C.mint, color: C.primaryDark };
  return (
    <button onClick={onClick} disabled={disabled} className={`${base} ${full ? "w-full" : ""} ${className}`} style={{ ...style, ...fBody }}>
      {Icon && <Icon size={17} />}
      {children}
    </button>
  );
}

function Spinner({ size = 32, color }) {
  const c = color || C.primary;
  const r = (size - 4) / 2;
  const circ = 2 * Math.PI * r;
  return (
    <svg
      width={size}
      height={size}
      viewBox={`0 0 ${size} ${size}`}
      style={{ animation: "cn-spin 0.9s linear infinite", display: "block", flexShrink: 0 }}
    >
      <style>{`@keyframes cn-spin{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}svg{transform-origin:center}`}</style>
      {/* Track */}
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={c} strokeOpacity={0.18} strokeWidth={3} />
      {/* Arc */}
      <circle
        cx={size/2} cy={size/2} r={r}
        fill="none" stroke={c} strokeWidth={3}
        strokeLinecap="round"
        strokeDasharray={`${circ * 0.72} ${circ * 0.28}`}
        strokeDashoffset={0}
      />
      {/* Arrowhead at arc tail */}
      <polygon
        points={`${size/2 + r},${size/2 - 5} ${size/2 + r + 5},${size/2} ${size/2 + r - 2},${size/2 + 4}`}
        fill={c}
        transform={`rotate(${360 * 0.72 * -1}, ${size/2}, ${size/2})`}
      />
    </svg>
  );
}

/* ---------------------------------- SKELETON ---------------------------------- */

function FlyingBirdSpinner({ label = "Signing you in…" }) {
  return (
    <span className="inline-flex items-center justify-center gap-2" role="status" aria-live="polite">
      <span className="relative inline-flex h-5 w-8 items-center justify-center">
        <span className="absolute left-0 top-1 h-px w-2 rounded-full" style={{ background: C.primary, opacity: 0.45, animation: "cn-bird-trail 1s ease-in-out infinite" }} />
        <Bird size={20} strokeWidth={2.5} color={C.primary} style={{ animation: "cn-bird-fly 1s ease-in-out infinite" }} />
      </span>
      {label}
    </span>
  );
}

function Sk({ w = "100%", h = 16, r = 10, className = "" }) {
  return (
    <div
      className={className}
      style={{
        width: w, height: h, borderRadius: r,
        background: `linear-gradient(90deg, ${C.line}55 25%, ${C.line}22 50%, ${C.line}55 75%)`,
        backgroundSize: "200% 100%",
        animation: "cn-shimmer 1.4s ease-in-out infinite",
        flexShrink: 0,
      }}
    />
  );
}

// Global shimmer keyframe — injected once into <head>
if (typeof document !== "undefined" && !document.getElementById("cn-skeleton-style")) {
  const s = document.createElement("style");
  s.id = "cn-skeleton-style";
  s.textContent = `@keyframes cn-shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}`;
  document.head.appendChild(s);
}

function HostelCardSkeleton() {
  const shimmer = {
    background: `linear-gradient(90deg, ${C.line}55 25%, ${C.line}22 50%, ${C.line}55 75%)`,
    backgroundSize: "200% 100%",
    animation: "cn-shimmer 1.4s ease-in-out infinite",
  };
  return (
    <div className="w-full overflow-hidden rounded-3xl" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
      {/* Square image placeholder */}
      <div style={{ aspectRatio: "1/1", width: "100%", ...shimmer }} />
      <div className="p-3.5 space-y-2.5">
        <div className="flex justify-between items-start gap-2">
          <Sk w="62%" h={15} r={8} />
          <Sk w={38} h={14} r={8} />
        </div>
        <Sk w="78%" h={12} r={7} />
        <div className="flex justify-between items-center pt-1">
          <Sk w={82} h={16} r={8} />
          <Sk w={62} h={22} r={11} />
        </div>
      </div>
    </div>
  );
}

function ReviewItemSkeleton() {
  return (
    <div className="rounded-xl p-3 space-y-2" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
      <div className="flex items-center gap-2">
        <Sk w={32} h={32} r={8} />
        <div className="flex-1 space-y-1.5">
          <Sk w="55%" h={12} r={6} />
          <Sk w={72} h={10} r={5} />
        </div>
        <Sk w={48} h={10} r={5} />
      </div>
      <Sk w="90%" h={11} r={5} />
      <Sk w="70%" h={11} r={5} />
    </div>
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

/* ---------------------------------- AVAILABILITY ---------------------------------- */

function AvailabilityBadge({ rooms, compact = false }) {
  const count = Math.max(0, Number(rooms) || 0);
  const isFull = count === 0;
  return (
    <div
      className="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold"
      style={{
        background: isFull ? C.dangerSoft : "rgba(255,255,255,0.94)",
        color: isFull ? C.danger : C.primaryDark,
        border: `1px solid ${isFull ? C.danger : C.primary}`,
        ...fMono,
      }}
    >
      {isFull ? (
        <><AlertTriangle size={12} /> Full!</>
      ) : (
        <><span style={{ width: 7, height: 7, borderRadius: "50%", background: C.primary, display: "inline-block" }} /> {count} room{count === 1 ? "" : "s"}</>
      )}
    </div>
  );
}

/* ---------------------------------- HOSTEL CARD ---------------------------------- */

function HostelCard({ hostel, isFav, onToggleFav, onOpen }) {
  const [imgIdx, setImgIdx] = useState(0);
  const touchStartX = useRef(null);
  const swiped = useRef(false);

  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; swiped.current = false; };
  const onTouchEnd = (e) => {
    if (touchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - touchStartX.current;
    if (Math.abs(dx) > 30) {
      swiped.current = true;
      if (dx < 0 && imgIdx < hostel.images.length - 1) setImgIdx(i => i + 1);
      if (dx > 0 && imgIdx > 0) setImgIdx(i => i - 1);
    }
    touchStartX.current = null;
  };

  return (
    <div
      className="w-full overflow-hidden rounded-3xl text-left"
      style={{ background: C.surface, border: `1px solid ${C.line}`, boxShadow: "0 2px 10px rgba(20,37,27,0.05)" }}
    >
      {/* Image slider */}
      <div
        className="relative overflow-hidden"
        style={{ aspectRatio: "1 / 1", cursor: "pointer" }}
        onTouchStart={onTouchStart}
        onTouchEnd={onTouchEnd}
        onClick={() => { if (!swiped.current) onOpen(hostel.id); }}
      >
        {/* Sliding track */}
        <div
          style={{
            display: "flex",
            width: `${hostel.images.length * 100}%`,
            height: "100%",
            transform: `translateX(-${(imgIdx / hostel.images.length) * 100}%)`,
            transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {hostel.images.map((src, i) => (
            <MediaItem
              key={i}
              src={src}
              alt={hostel.name}
              style={{ width: `${100 / hostel.images.length}%`, height: "100%", objectFit: "cover", flexShrink: 0 }}
            />
          ))}
        </div>

        {/* Fav button */}
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

        {/* Dot indicators */}
        {hostel.images.length > 1 && (
          <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex gap-1">
            {hostel.images.map((_, i) => (
              <span
                key={i}
                style={{
                  display: "block",
                  height: 5,
                  width: i === imgIdx ? 16 : 5,
                  borderRadius: 9,
                  background: i === imgIdx ? "#fff" : "rgba(255,255,255,0.55)",
                  transition: "width 0.25s, background 0.25s",
                }}
              />
            ))}
          </div>
        )}

        <div className="absolute bottom-3 right-3">
          <AvailabilityBadge rooms={hostel.availableRooms} />
        </div>
      </div>

      {/* Info — tapping here also opens the hostel */}
      <div className="p-3.5 cursor-pointer" onClick={() => onOpen(hostel.id)}>
        <div className="flex items-start justify-between gap-2">
          <div className="text-[15px] font-bold leading-tight" style={{ ...fDisplay, color: C.ink }}>{hostel.name}</div>
          <div className="flex shrink-0 items-center gap-1">
            <Star size={13} fill={C.gold} color={C.gold} />
            <span className="text-[13px] font-semibold" style={{ ...fBody, color: C.ink }}>{hostel.rating}</span>
          </div>
        </div>
        {hostel.location && (
          <div className="mt-1 flex min-w-0 items-center gap-1 text-[13px]" style={{ ...fBody, color: C.inkSoft }}>
            <MapPin size={12} className="shrink-0" />
            <span className="truncate">{hostel.location}</span>
          </div>
        )}
        <div className="mt-1 flex items-center gap-1 text-[12px]" style={{ ...fBody, color: C.inkSoft }}>
          <Navigation size={12} className="shrink-0" /> {hostel.distance} km from Chuka University
        </div>
        <div className="mt-2.5 flex items-center justify-between">
          <PriceSummary
            price={hostel.price}
            billingPeriod={hostel.billingPeriod}
            mainClassName="text-[16px] font-bold"
            mainStyle={{ ...fMono, color: C.primaryDark }}
          />
          <Badge>{hostel.roomType}</Badge>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- AUTH SCREEN ---------------------------------- */

const AUTH_ANIM_CSS = `
@keyframes cn-auth-up    { from { opacity:0; transform:translateY(32px);  } to { opacity:1; transform:translateY(0);  } }
@keyframes cn-auth-left  { from { opacity:0; transform:translateX(-28px); } to { opacity:1; transform:translateX(0); } }
@keyframes cn-auth-right { from { opacity:0; transform:translateX(28px);  } to { opacity:1; transform:translateX(0); } }
@keyframes cn-field-in   { from { opacity:0; transform:translateX(14px);  } to { opacity:1; transform:translateX(0); } }
@keyframes cn-float      { 0%,100%{transform:translateY(0);}  50%{transform:translateY(-14px);} }
@keyframes cn-orb-a      { 0%,100%{transform:scale(1)   translate(0,0);}    50%{transform:scale(1.12) translate(18px,-22px);} }
@keyframes cn-orb-b      { 0%,100%{transform:scale(1)   translate(0,0);}    50%{transform:scale(0.92) translate(-16px,18px);} }
@keyframes cn-orb-c      { 0%,100%{transform:scale(1)   translate(0,0);}    50%{transform:scale(1.06) translate(10px,14px);}  }
@keyframes cn-pulse-ring { 0%{box-shadow:0 0 0 0 rgba(47,143,94,0.4);} 70%{box-shadow:0 0 0 10px rgba(47,143,94,0);} 100%{box-shadow:0 0 0 0 rgba(47,143,94,0);} }
@keyframes cn-bird-fly { 0%,100%{transform:translate3d(-3px,2px,0) rotate(-8deg) scale(.92);} 50%{transform:translate3d(4px,-3px,0) rotate(7deg) scale(1.05);} }
@keyframes cn-bird-trail { 0%,100%{transform:translateX(0);opacity:.2;} 50%{transform:translateX(-3px);opacity:.7;} }
.cn-auth-input-wrap { transition: border-color 0.2s, box-shadow 0.2s; }
.cn-auth-input-wrap:focus-within { box-shadow: 0 0 0 3px rgba(47,143,94,0.18); }
.cn-auth-btn-primary:not(:disabled):hover { filter: brightness(1.08); transform: translateY(-1px); }
.cn-auth-btn-primary:not(:disabled):active { transform: translateY(0) scale(0.98); }
.cn-auth-btn-primary { transition: filter 0.15s, transform 0.15s; }
`;

function AuthScreen({ onAuthed, showToast }) {
  const [mode, setMode] = useState("login");
  const [showPw, setShowPw] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [adminCode, setAdminCode] = useState("");
  const [showAdminCode, setShowAdminCode] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [error, setError] = useState("");
  const [authConfig, setAuthConfig] = useState({ googleClientId: null, adminCodeEnabled: false });
  const googleBtnRef = useRef(null);

  useEffect(() => {
    if (document.getElementById("cn-auth-anim-style")) return;
    const s = document.createElement("style");
    s.id = "cn-auth-anim-style";
    s.textContent = AUTH_ANIM_CSS;
    document.head.appendChild(s);
  }, []);

  // Load auth config and initialise Google Identity Services (OAuth2 popup flow)
  const googleTokenClientRef = useRef(null);

  useEffect(() => {
    api.getAuthConfig().then((cfg) => {
      setAuthConfig(cfg);
      if (cfg.googleClientId) {
        const script = document.createElement("script");
        script.src = "https://accounts.google.com/gsi/client";
        script.async = true;
        script.defer = true;
        script.onload = () => {
          googleTokenClientRef.current = window.google.accounts.oauth2.initTokenClient({
            client_id: cfg.googleClientId,
            scope: "openid email profile",
            callback: handleGoogleAccessToken,
          });
        };
        document.head.appendChild(script);
      }
    }).catch(() => {});
  }, []);

  const handleGoogleAccessToken = async ({ access_token, error }) => {
    if (error || !access_token) {
      setGoogleLoading(false);
      if (error !== "access_denied") setError("Google sign-in failed. Please try again.");
      return;
    }
    setError("");
    try {
      const result = await api.googleLogin(access_token, adminCode || undefined);
      saveAuth(result.token, result.user);
      showToast(result.user.role === "admin" ? "Welcome, Admin 👋" : "Welcome to ChukaNest!");
      onAuthed(result.user.role, result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleGoogleClick = () => {
    if (!authConfig.googleClientId) {
      setError("Google sign-in is not configured yet. Use email and password for now.");
      return;
    }
    if (!googleTokenClientRef.current) {
      setError("Google sign-in is still loading. Please try again.");
      return;
    }
    setGoogleLoading(true);
    googleTokenClientRef.current.requestAccessToken({ prompt: "select_account" });
  };

  const handleSubmit = async () => {
    if (loading) return;
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
        : await api.signup(name.trim(), email.trim(), password, adminCode || undefined);
      saveAuth(result.token, result.user);
      showToast(result.user.role === "admin" ? "Welcome, Admin 👋" : mode === "login" ? "Welcome back! 🎉" : "Account created — welcome to ChukaNest!");
      onAuthed(result.user.role, result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Re-key fields when mode changes so they re-animate
  const fieldKey = mode;

  const formPanel = (
    <div className="w-full max-w-sm mx-auto flex flex-col justify-center py-10 px-6 md:px-8">
      {/* Mobile-only logo */}
      <div className="mb-8 flex flex-col items-center md:hidden" style={{ animation: "cn-auth-up 0.6s ease both" }}>
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: "#fff", boxShadow: "0 8px 24px rgba(0,0,0,0.18)", animation: "cn-float 5s ease-in-out infinite" }}
        >
          <Building2 size={30} color={C.primary} />
        </div>
        <div className="text-2xl font-extrabold text-white" style={fDisplay}>ChukaNest</div>
        <div className="mt-1 text-[13px] font-medium text-white/85" style={fBody}>Verified student housing, zero scams.</div>
      </div>

      <div className="rounded-3xl p-5 md:p-6" style={{ background: C.surface, boxShadow: "0 10px 40px rgba(20,37,27,0.12)", animation: "cn-auth-up 0.55s 0.05s ease both" }}>
        {/* Desktop-only heading inside form card */}
        <div className="hidden md:block mb-6" style={{ animation: "cn-auth-right 0.5s 0.2s ease both" }}>
          <div className="text-[22px] font-extrabold" style={{ ...fDisplay, color: C.ink }}>
            {mode === "login" ? "Welcome back" : "Create account"}
          </div>
          <div className="mt-1 text-[13px]" style={{ ...fBody, color: C.inkSoft }}>
            {mode === "login" ? "Sign in to your ChukaNest account" : "Join thousands of Chuka students"}
          </div>
        </div>

        <div className="mb-5 flex rounded-2xl p-1" style={{ background: C.mint, animation: "cn-auth-up 0.5s 0.25s ease both" }}>
          {["login", "signup"].map((m) => (
            <button
              key={m}
              onClick={() => { setMode(m); setError(""); setAdminCode(""); setShowAdminCode(false); }}
              className="flex-1 rounded-xl py-2 text-sm font-semibold transition-all"
              style={{ ...fBody, background: mode === m ? C.surface : "transparent", color: mode === m ? C.primaryDark : C.inkSoft, boxShadow: mode === m ? "0 1px 4px rgba(0,0,0,0.08)" : "none" }}
            >
              {m === "login" ? "Log In" : "Sign Up"}
            </button>
          ))}
        </div>

        {/* Google sign-in button */}
        <button
          onClick={handleGoogleClick}
          disabled={googleLoading}
          className="w-full flex items-center justify-center gap-2.5 rounded-2xl py-2.5 text-sm font-semibold border transition-all mb-4"
          style={{ background: C.surface, border: `1px solid ${C.line}`, color: C.ink, ...fBody, opacity: googleLoading ? 0.7 : 1, animation: "cn-auth-up 0.5s 0.32s ease both" }}
        >
          {googleLoading ? (
            <Spinner size={18} color={C.primary} />
          ) : (
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
              <path d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z" fill="#4285F4"/>
              <path d="M9 18c2.43 0 4.467-.806 5.956-2.18l-2.908-2.259c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332A8.997 8.997 0 009 18z" fill="#34A853"/>
              <path d="M3.964 10.71A5.41 5.41 0 013.682 9c0-.593.102-1.17.282-1.71V4.958H.957A8.996 8.996 0 000 9c0 1.452.348 2.827.957 4.042l3.007-2.332z" fill="#FBBC05"/>
              <path d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0A8.997 8.997 0 00.957 4.958L3.964 6.29C4.672 4.163 6.656 3.58 9 3.58z" fill="#EA4335"/>
            </svg>
          )}
          Continue with Google
        </button>

        <div className="mb-4 flex items-center gap-3" style={{ animation: "cn-auth-up 0.5s 0.38s ease both" }}>
          <div className="h-px flex-1" style={{ background: C.line }} />
          <span className="text-[11px]" style={{ ...fBody, color: C.inkSoft }}>or</span>
          <div className="h-px flex-1" style={{ background: C.line }} />
        </div>

        <div className="space-y-3" key={fieldKey}>
          {mode === "signup" && (
            <div className="cn-auth-input-wrap flex items-center gap-2 rounded-2xl px-3.5 py-3" style={{ background: C.bg, border: `1px solid ${C.line}`, animation: "cn-field-in 0.35s ease both" }}>
              <User size={16} color={C.inkSoft} />
              <input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full bg-transparent text-sm outline-none" style={{ ...fBody, color: C.ink }} />
            </div>
          )}
          <div className="cn-auth-input-wrap flex items-center gap-2 rounded-2xl px-3.5 py-3" style={{ background: C.bg, border: `1px solid ${C.line}`, animation: "cn-field-in 0.35s 0.06s ease both" }}>
            <Mail size={16} color={C.inkSoft} />
            <input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@students.chuka.ac.ke" className="w-full bg-transparent text-sm outline-none" style={{ ...fBody, color: C.ink }} />
          </div>
          <div className="cn-auth-input-wrap flex items-center gap-2 rounded-2xl px-3.5 py-3" style={{ background: C.bg, border: `1px solid ${C.line}`, animation: "cn-field-in 0.35s 0.12s ease both" }}>
            <Lock size={16} color={C.inkSoft} />
            <input type={showPw ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Password" className="w-full bg-transparent text-sm outline-none" style={{ ...fBody, color: C.ink }} onKeyDown={(e) => e.key === "Enter" && handleSubmit()} />
            <button onClick={() => setShowPw((s) => !s)}>{showPw ? <EyeOff size={16} color={C.inkSoft} /> : <Eye size={16} color={C.inkSoft} />}</button>
          </div>

          {/* Admin invite code — shown on signup when toggled */}
          {mode === "signup" && (
            <div style={{ animation: "cn-field-in 0.35s 0.18s ease both" }}>
              <button
                type="button"
                onClick={() => { setShowAdminCode((s) => !s); setAdminCode(""); }}
                className="text-[11px] font-medium"
                style={{ ...fBody, color: C.inkSoft }}
              >
                {showAdminCode ? "▲ Hide admin code" : "▾ Register as admin?"}
              </button>
              {showAdminCode && (
                <div className="cn-auth-input-wrap mt-2 flex items-center gap-2 rounded-2xl px-3.5 py-3" style={{ background: C.goldSoft, border: `1px solid ${C.gold}`, animation: "cn-field-in 0.3s ease both" }}>
                  <ShieldCheck size={16} color={C.gold} />
                  <input
                    value={adminCode}
                    onChange={(e) => setAdminCode(e.target.value)}
                    placeholder="Admin invite code"
                    className="w-full bg-transparent text-sm outline-none"
                    style={{ ...fBody, color: C.ink }}
                  />
                </div>
              )}
            </div>
          )}
        </div>

        {error && (
          <div className="mt-3 rounded-xl px-3 py-2 text-[12px] font-medium" style={{ background: C.dangerSoft, color: C.danger, ...fBody, animation: "cn-auth-up 0.3s ease both" }}>
            {error}
          </div>
        )}

        <div className="mt-5" style={{ animation: "cn-auth-up 0.5s 0.42s ease both" }}>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="cn-auth-btn-primary w-full rounded-2xl py-3 text-sm font-bold text-white"
            style={{ ...fBody, background: loading ? C.mint : C.primary, color: loading ? C.primaryDark : "#fff", opacity: loading ? 0.9 : 1 }}
          >
            {loading ? <FlyingBirdSpinner label={mode === "login" ? "Signing you in…" : "Creating account…"} /> : mode === "login" ? "Log In" : "Create Account"}
          </button>
        </div>

        <button onClick={() => { showToast("Continuing as guest"); onAuthed("guest", null); }} className="mt-4 w-full text-center text-[13px] font-semibold" style={{ ...fBody, color: C.primaryDark, animation: "cn-auth-up 0.5s 0.48s ease both" }}>
          Continue as guest →
        </button>
      </div>

      <div className="mt-5 flex items-center justify-center gap-1.5 text-[12px]" style={{ ...fBody, color: C.inkSoft, animation: "cn-auth-up 0.5s 0.55s ease both" }}>
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
          className="relative flex flex-col justify-between p-12 w-[55%] shrink-0 overflow-hidden"
          style={{ background: `linear-gradient(160deg, ${C.primaryDark} 0%, ${C.primaryLight} 100%)` }}
        >
          {/* Animated background orbs */}
          <div style={{ position: "absolute", inset: 0, pointerEvents: "none", overflow: "hidden" }}>
            <div style={{ position: "absolute", top: "-10%", left: "-8%",  width: 340, height: 340, borderRadius: "50%", background: "rgba(255,255,255,0.06)", animation: "cn-orb-a 12s ease-in-out infinite" }} />
            <div style={{ position: "absolute", bottom: "5%",  right: "-10%", width: 280, height: 280, borderRadius: "50%", background: "rgba(255,255,255,0.05)", animation: "cn-orb-b 15s ease-in-out infinite" }} />
            <div style={{ position: "absolute", top: "38%",  right: "12%",  width: 160, height: 160, borderRadius: "50%", background: "rgba(255,255,255,0.04)", animation: "cn-orb-c 9s  ease-in-out infinite" }} />
          </div>

          {/* Logo */}
          <div className="relative flex items-center gap-3" style={{ animation: "cn-auth-left 0.6s 0.1s ease both" }}>
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: "rgba(255,255,255,0.15)", animation: "cn-float 6s ease-in-out infinite" }}>
              <Building2 size={22} color="#fff" />
            </div>
            <span className="text-[20px] font-extrabold text-white" style={fDisplay}>ChukaNest</span>
          </div>

          {/* Hero text */}
          <div className="relative">
            <div className="text-[40px] font-extrabold text-white leading-tight mb-4" style={{ ...fDisplay, animation: "cn-auth-left 0.7s 0.2s ease both" }}>
              Find your home<br />near campus.
            </div>
            <div className="text-[15px] text-white/80 mb-10 leading-relaxed" style={{ ...fBody, animation: "cn-auth-left 0.7s 0.32s ease both" }}>
              Verified hostels, transparent pricing, and zero scams — built for Chuka University students.
            </div>

            {/* Feature bullets — staggered */}
            <div className="space-y-3">
              {[
                { icon: ShieldCheck, text: "Every listing is verified by our team" },
                { icon: Star,        text: "Real reviews from fellow students" },
                { icon: MapPin,      text: "Distance from campus on every listing" },
              ].map(({ icon: Icon, text }, i) => (
                <div key={text} className="flex items-center gap-3" style={{ animation: `cn-auth-left 0.6s ${0.42 + i * 0.1}s ease both` }}>
                  <div className="flex h-8 w-8 items-center justify-center rounded-xl shrink-0" style={{ background: "rgba(255,255,255,0.15)" }}>
                    <Icon size={15} color="#fff" />
                  </div>
                  <span className="text-[14px] text-white/90 font-medium" style={fBody}>{text}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Stat bar — staggered */}
          <div className="relative flex gap-8">
            {[["7+", "Verified hostels"], ["200+", "Student reviews"], ["0", "Scam reports"]].map(([val, label], i) => (
              <div key={label} style={{ animation: `cn-auth-up 0.6s ${0.55 + i * 0.1}s ease both` }}>
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
    api.aiRecommend({ bookmarkedIds: favIds ? [...favIds] : [], budget: null })
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
      // Apply AI-suggested type filter
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
    setTypeFilter("All");
    setSortBy("rating");
  };

  const filtered = useMemo(() => {
    return hostels
      .filter((h) => {
        // Regular text search (when not in AI mode or AI hasn't run yet)
        const q = aiFilters ? "" : search.toLowerCase();
        const matchSearch = !q || h.name.toLowerCase().includes(q) || h.roomType.toLowerCase().includes(q);
        const matchType = typeFilter === "All" || h.roomType === typeFilter;
        // AI filters (applied on top)
        const matchMaxPrice = !aiFilters?.maxPrice || h.price <= aiFilters.maxPrice;
        const matchMinRating = !aiFilters?.minRating || h.rating >= aiFilters.minRating;
        const matchAmenities = !aiFilters?.amenities?.length ||
          aiFilters.amenities.every((a) => h.amenities.includes(a));
        return matchSearch && matchType && matchMaxPrice && matchMinRating && matchAmenities;
      })
      .sort((a, b) => {
        if (sortBy === "rating") return b.rating - a.rating;
        if (sortBy === "price_asc") return a.price - b.price;
        if (sortBy === "price_desc") return b.price - a.price;
        if (sortBy === "distance") return a.distance - b.distance;
        return 0;
      });
  }, [hostels, search, typeFilter, sortBy, aiFilters]);

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
            ? <Spinner size={16} color={C.primary} />
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
            style={{ ...fBody, color: C.ink }}
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
          {["All", "Bedsitter", "Single", "Shared", "Studio", "1 Bedroom", "2 Bedroom"].map((t) => (
            <Chip key={t} active={typeFilter === t} onClick={() => setTypeFilter(t)}>{t}</Chip>
          ))}
        </div>
      </div>

      {/* Sort bar */}
      <div className="flex flex-wrap items-center gap-2 px-4 py-2.5">
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
                    <PriceSummary
                      price={h.price}
                      billingPeriod={h.billingPeriod}
                      mainClassName="text-[11px] font-bold mt-0.5"
                      mainStyle={{ ...fMono, color: C.primaryDark }}
                    />
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
            <Spinner size={14} color={C.primary} />
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

  const detailTouchStartX = useRef(null);

  const onDetailTouchStart = (e) => { detailTouchStartX.current = e.touches[0].clientX; };
  const onDetailTouchEnd = (e) => {
    if (detailTouchStartX.current === null) return;
    const dx = e.changedTouches[0].clientX - detailTouchStartX.current;
    if (dx < -40 && imgIdx < hostel.images.length - 1) setImgIdx(i => i + 1);
    if (dx > 40  && imgIdx > 0) setImgIdx(i => i - 1);
    detailTouchStartX.current = null;
  };

  return (
    <div className="flex h-full flex-col" style={{ background: C.bg }}>
      {/* Image carousel */}
      <div
        className="relative w-full overflow-hidden"
        style={{ height: "clamp(220px, 42vh, 480px)", flexShrink: 0 }}
        onTouchStart={onDetailTouchStart}
        onTouchEnd={onDetailTouchEnd}
      >
        {/* Sliding track */}
        <div
          style={{
            display: "flex",
            width: `${hostel.images.length * 100}%`,
            height: "100%",
            transform: `translateX(-${(imgIdx / hostel.images.length) * 100}%)`,
            transition: "transform 0.35s cubic-bezier(0.4,0,0.2,1)",
          }}
        >
          {hostel.images.map((src, i) => (
            <MediaItem
              key={i}
              src={src}
              alt=""
              style={{ width: `${100 / hostel.images.length}%`, height: "100%", objectFit: "cover", flexShrink: 0 }}
            />
          ))}
        </div>

        <div className="absolute inset-0 pointer-events-none" style={{ background: "linear-gradient(to bottom, rgba(0,0,0,0.32) 0%, transparent 38%)" }} />

        {/* Back + Fav */}
        <button onClick={onBack} className="absolute left-4 top-4 flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.9)" }}>
          <ArrowLeft size={18} color="#14251B" />
        </button>
        <button onClick={() => onToggleFav(hostel.id)} className="absolute right-4 top-4 flex h-9 w-9 items-center justify-center rounded-full" style={{ background: "rgba(255,255,255,0.9)" }}>
          <Heart size={17} fill={isFav ? C.danger : "none"} color={isFav ? C.danger : "#14251B"} />
        </button>

        {/* Counter badge */}
        <div className="absolute top-4 left-1/2 -translate-x-1/2 rounded-full px-3 py-1 text-[11px] font-semibold" style={{ background: "rgba(0,0,0,0.45)", color: "#fff", ...fBody }}>
          {imgIdx + 1} / {hostel.images.length}
        </div>

        {/* Prev/Next arrows */}
        {imgIdx > 0 && (
          <button onClick={() => setImgIdx(i => i - 1)} className="absolute left-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-90" style={{ background: "rgba(255,255,255,0.88)" }}>
            <ChevronLeft size={18} color="#14251B" />
          </button>
        )}
        {imgIdx < hostel.images.length - 1 && (
          <button onClick={() => setImgIdx(i => i + 1)} className="absolute right-3 top-1/2 -translate-y-1/2 flex h-9 w-9 items-center justify-center rounded-full transition-all active:scale-90" style={{ background: "rgba(255,255,255,0.88)" }}>
            <ChevronRight size={18} color="#14251B" />
          </button>
        )}

        {/* Dot indicators */}
        {hostel.images.length > 1 && (
          <div className="absolute bottom-3 left-1/2 flex -translate-x-1/2 gap-1.5">
            {hostel.images.map((_, i) => (
              <button
                key={i}
                onClick={() => setImgIdx(i)}
                style={{
                  height: 6,
                  width: i === imgIdx ? 22 : 6,
                  borderRadius: 9,
                  background: i === imgIdx ? "#fff" : "rgba(255,255,255,0.5)",
                  transition: "width 0.25s, background 0.25s",
                  border: "none",
                  padding: 0,
                  cursor: "pointer",
                }}
              />
            ))}
          </div>
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
                {hostel.location && (
                  <div className="flex min-w-0 items-center gap-1 text-[13px]" style={{ ...fBody, color: C.inkSoft }}>
                    <MapPin size={12} className="shrink-0" />
                    <span className="max-w-[230px] truncate">{hostel.location}</span>
                  </div>
                )}
                <div className="flex items-center gap-1 text-[13px]" style={{ ...fBody, color: C.inkSoft }}>
                  <Navigation size={12} className="shrink-0" /> {hostel.distance} km from campus
                </div>

                <Badge>{hostel.roomType}</Badge>
              </div>
            </div>
            <div className="text-right shrink-0">
              <PriceSummary
                price={hostel.price}
                billingPeriod={hostel.billingPeriod}
                mainClassName="text-[22px] font-bold"
                mainStyle={{ ...fMono, color: C.primaryDark }}
                subClassName="text-[11px]"
              />
            </div>
          </div>

          <div className="mt-2 flex items-center gap-2">
            <StarRow rating={Math.round(hostel.rating)} />
            <span className="text-[13px] font-semibold" style={{ ...fBody, color: C.ink }}>{hostel.rating}</span>
            <span className="text-[13px]" style={{ ...fBody, color: C.inkSoft }}>({hostel.reviewCount} reviews)</span>
            <AvailabilityBadge rooms={hostel.availableRooms} compact />
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
                <div className="text-[13px] font-semibold mb-2" style={{ ...fBody, color: C.primaryDark }}>{hostel.contactRole || "Landlord"}</div>
                <div className="text-[13px]" style={{ ...fBody, color: C.inkSoft }}>{hostel.phone}</div>
              </div>
            </div>
          )}

          {tab === "amenities" && (
            <div className="grid grid-cols-1 gap-2.5 sm:grid-cols-2">
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
                  <Spinner size={16} color={C.primary} />
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
      <div className="fixed bottom-16 left-0 right-0 flex gap-2 px-3 pb-2 pt-2 sm:px-4 md:bottom-0 md:left-[220px] md:flex-row" style={{ background: C.surface, borderTop: `1px solid ${C.line}`, zIndex: 20 }}>
        <PrimaryButton className="min-w-0 flex-1" variant="ghost" icon={Phone} onClick={() => window.open(`tel:${hostel.phone}`, "_self")}>Call</PrimaryButton>
        <PrimaryButton className="min-w-0 flex-1" full icon={MessageCircle} onClick={() => window.open(`https://wa.me/${hostel.phone.replace(/\D/g, "").replace(/^0/, "254")}`, "_blank")}>Contact {hostel.contactRole || "Landlord"}</PrimaryButton>
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

const getDistanceFromCampus = (latlng) => {
  if (!Array.isArray(latlng) || latlng.length < 2) return null;
  const [lat, lng] = latlng.map(Number);
  if (!Number.isFinite(lat) || !Number.isFinite(lng)) return null;
  const toRadians = (value) => (value * Math.PI) / 180;
  const earthRadiusKm = 6371;
  const deltaLat = toRadians(lat - CHUKA_UNIVERSITY[0]);
  const deltaLng = toRadians(lng - CHUKA_UNIVERSITY[1]);
  const a = Math.sin(deltaLat / 2) ** 2
    + Math.cos(toRadians(CHUKA_UNIVERSITY[0])) * Math.cos(toRadians(lat)) * Math.sin(deltaLng / 2) ** 2;
  const distance = earthRadiusKm * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return Number(distance.toFixed(1));
};

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
              <div className="text-[12px]" style={{ ...fBody, color: C.inkSoft }}>{selectedHostel.distance} km · {selectedHostel.roomType}</div>
                <PriceSummary
                  price={selectedHostel.price}
                  billingPeriod={selectedHostel.billingPeriod}
                  mainClassName="text-[14px] font-bold mt-0.5"
                  mainStyle={{ ...fMono, color: C.primaryDark }}
                />
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
                <PriceSummary
                  price={h.price}
                  billingPeriod={h.billingPeriod}
                  mainClassName="text-[12px] font-bold"
                  mainStyle={{ ...fMono, color: C.primaryDark }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

/* ---------------------------------- SUPPORT SCREEN ---------------------------------- */

const FALLBACK_SUPPORT_SETTINGS = {
  supportPhone: "+254 700 000 000",
  whatsappNumber: "+254 700 000 000",
  email: "support@chukanest.co.ke",
  officeHours: "Mon–Fri, 8:00 AM–5:00 PM",
  faqs: [
    { question: "How do I know a hostel is verified?", answer: "Look for the gold Verified badge. Our team checks the listing details before it is marked as verified." },
    { question: "How do I report a problem with a listing?", answer: "Open the listing and contact the administrator using the support options below. Include the hostel name and what went wrong." },
    { question: "Can I update or remove my review?", answer: "Contact the administrator with your account email and the review details. The support team will help you with the next step." },
    { question: "How can I add my hostel?", answer: "Contact the administrator with the hostel name, location, room types, prices, available rooms, and clear photos." },
    { question: "Is ChukaNest available outside Chuka University?", answer: "ChukaNest is currently focused on student housing around Chuka University and nearby areas." },
  ],
};

function normalizeSupportSettings(settings) {
  return {
    ...FALLBACK_SUPPORT_SETTINGS,
    ...(settings || {}),
    faqs: Array.isArray(settings?.faqs) && settings.faqs.length > 0 ? settings.faqs : FALLBACK_SUPPORT_SETTINGS.faqs,
  };
}

function formatWhatsAppNumber(value) {
  const digits = String(value || "").replace(/\D/g, "");
  return digits.startsWith("0") ? `254${digits.slice(1)}` : digits;
}

function SupportScreen({ showToast, onBack, currentUser }) {
  const [settings, setSettings] = useState(FALLBACK_SUPPORT_SETTINGS);
  const [openFaq, setOpenFaq] = useState(0);
  const [loading, setLoading] = useState(true);
  const [contact, setContact] = useState({ name: currentUser?.name || "", email: currentUser?.email || "", topic: "", message: "" });
  const [contactSending, setContactSending] = useState(false);
  const [contactSent, setContactSent] = useState(false);

  useEffect(() => {
    api.getSupport()
      .then((data) => setSettings(normalizeSupportSettings(data)))
      .catch(() => showToast("Showing default support details"))
      .finally(() => setLoading(false));
  }, []);

  const whatsappLink = `https://wa.me/${formatWhatsAppNumber(settings.whatsappNumber)}`;
  const updateContact = (key, value) => setContact((current) => ({ ...current, [key]: value }));
  const submitContact = async (event) => {
    event.preventDefault();
    setContactSending(true);
    try {
      await api.submitContact(contact);
      setContactSent(true);
      setContact((current) => ({ ...current, topic: "", message: "" }));
      showToast("Message sent successfully ✓");
    } catch (err) {
      showToast(err.message || "Could not send your message");
    } finally {
      setContactSending(false);
    }
  };
  const shareSupport = async () => {
    const supportUrl = new URL(window.location.href);
    supportUrl.searchParams.set("support", "1");
    const shareData = { title: "ChukaNest Help & Support", text: "Contact ChukaNest support", url: supportUrl.toString() };
    try {
      if (navigator.share) await navigator.share(shareData);
      else await navigator.clipboard.writeText(supportUrl.toString());
      showToast(navigator.share ? "Support page shared ✓" : "Support link copied ✓");
    } catch (err) {
      if (err?.name !== "AbortError") showToast("Could not share the support link");
    }
  };

  return (
    <div className="flex h-full flex-col" style={{ background: C.bg }}>
      <TopBar title="Help & Support" onBack={onBack} />
      <div className="flex-1 overflow-y-auto px-4 py-4 pb-24 md:pb-6">
        <div className="mx-auto max-w-3xl space-y-4">
          <div className="rounded-3xl p-5 md:p-7" style={{ background: `linear-gradient(135deg, ${C.primaryDark}, ${C.primary})`, color: "#fff" }}>
            <div className="flex items-start gap-3">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: "rgba(255,255,255,0.16)" }}>
                <MessageCircle size={22} color="#fff" />
              </div>
              <div>
                <div className="text-[20px] font-extrabold" style={fDisplay}>How can we help?</div>
                <p className="mt-1 max-w-xl text-[13px] leading-relaxed" style={{ ...fBody, color: "rgba(255,255,255,0.78)" }}>
                  Find quick answers or contact the ChukaNest administrator for help with listings, reviews, accounts, and safety concerns.
                </p>
              </div>
            </div>
          </div>

          <section>
            <div className="mb-2 px-1 text-[12px] font-bold uppercase tracking-[0.08em]" style={{ ...fBody, color: C.inkSoft }}>Contact administrator</div>
            <div className="grid gap-3 sm:grid-cols-3">
              <a href={`tel:${settings.supportPhone}`} className="rounded-2xl p-4 transition-transform active:scale-[0.98]" style={{ background: C.surface, border: `1px solid ${C.line}`, textDecoration: "none" }}>
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: C.mint }}><Phone size={17} color={C.primaryDark} /></div>
                <div className="text-[12px] font-semibold" style={{ ...fBody, color: C.inkSoft }}>Call us</div>
                <div className="mt-1 break-words text-[13px] font-bold" style={{ ...fMono, color: C.ink }}>{settings.supportPhone}</div>
              </a>
              <a href={whatsappLink} target="_blank" rel="noreferrer" className="rounded-2xl p-4 transition-transform active:scale-[0.98]" style={{ background: C.surface, border: `1px solid ${C.line}`, textDecoration: "none" }}>
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: C.mint }}><MessageCircle size={17} color={C.primaryDark} /></div>
                <div className="text-[12px] font-semibold" style={{ ...fBody, color: C.inkSoft }}>WhatsApp</div>
                <div className="mt-1 break-words text-[13px] font-bold" style={{ ...fMono, color: C.ink }}>{settings.whatsappNumber}</div>
              </a>
              <a href={`mailto:${settings.email}`} className="rounded-2xl p-4 transition-transform active:scale-[0.98]" style={{ background: C.surface, border: `1px solid ${C.line}`, textDecoration: "none" }}>
                <div className="mb-3 flex h-9 w-9 items-center justify-center rounded-xl" style={{ background: C.mint }}><Mail size={17} color={C.primaryDark} /></div>
                <div className="text-[12px] font-semibold" style={{ ...fBody, color: C.inkSoft }}>Email support</div>
                <div className="mt-1 break-words text-[13px] font-bold" style={{ ...fBody, color: C.ink }}>{settings.email}</div>
              </a>
            </div>
            <div className="mt-2 px-1 text-[11px]" style={{ ...fBody, color: C.inkSoft }}>Office hours: {settings.officeHours}</div>
          </section>

          <section className="rounded-2xl p-4 md:p-5" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="text-[15px] font-bold" style={{ ...fDisplay, color: C.ink }}>Send us a message</div>
                <div className="mt-1 text-[12px]" style={{ ...fBody, color: C.inkSoft }}>We’ll get back to you as soon as possible.</div>
              </div>
              <button type="button" onClick={shareSupport} className="flex shrink-0 items-center gap-1.5 rounded-xl px-3 py-2 text-[12px] font-semibold" style={{ ...fBody, background: C.mint, color: C.primaryDark }}>
                <Navigation size={14} /> Share
              </button>
            </div>
            {contactSent ? (
              <div className="mt-4 rounded-xl p-3 text-[13px]" style={{ ...fBody, background: C.mint, color: C.primaryDark }}>
                Thanks for contacting us. Your message has been received.
                <button type="button" onClick={() => setContactSent(false)} className="ml-2 font-bold underline">Send another</button>
              </div>
            ) : (
              <form onSubmit={submitContact} className="mt-4 space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  {[['name', 'Name', 'Your name', 'text'], ['email', 'Email', 'you@example.com', 'email']].map(([key, label, placeholder, type]) => (
                    <label key={key} className="block">
                      <span className="mb-1.5 block text-[12px] font-semibold" style={{ ...fBody, color: C.ink }}>{label}</span>
                      <input required type={type} value={contact[key]} onChange={(e) => updateContact(key, e.target.value)} placeholder={placeholder} className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none" style={{ ...fBody, background: C.bg, border: `1px solid ${C.line}`, color: C.ink }} />
                    </label>
                  ))}
                </div>
                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-semibold" style={{ ...fBody, color: C.ink }}>What is it about?</span>
                  <select required value={contact.topic} onChange={(e) => updateContact("topic", e.target.value)} className="w-full rounded-xl px-3 py-2.5 text-[13px] outline-none" style={{ ...fBody, background: C.bg, border: `1px solid ${C.line}`, color: C.ink }}>
                    <option value="">Choose a topic</option>
                    {['General question', 'Hostel listing', 'Review or report', 'Account help', 'Safety concern', 'Other'].map((topic) => <option key={topic} value={topic}>{topic}</option>)}
                  </select>
                </label>
                <label className="block">
                  <span className="mb-1.5 block text-[12px] font-semibold" style={{ ...fBody, color: C.ink }}>Message</span>
                  <textarea required minLength={10} maxLength={3000} rows={4} value={contact.message} onChange={(e) => updateContact("message", e.target.value)} placeholder="Tell us how we can help…" className="w-full resize-y rounded-xl px-3 py-2.5 text-[13px] outline-none" style={{ ...fBody, background: C.bg, border: `1px solid ${C.line}`, color: C.ink }} />
                </label>
                <PrimaryButton full type="submit" disabled={contactSending}>{contactSending ? "Sending…" : "Send message"}</PrimaryButton>
              </form>
            )}
          </section>
          <section>
            <div className="mb-2 px-1 text-[12px] font-bold uppercase tracking-[0.08em]" style={{ ...fBody, color: C.inkSoft }}>Frequently asked questions</div>
            <div className="overflow-hidden rounded-2xl" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
              {loading && <div className="px-4 py-5 text-[13px]" style={{ ...fBody, color: C.inkSoft }}>Loading support information…</div>}
              {!loading && settings.faqs.map((faq, index) => (
                <div key={`${faq.question}-${index}`} style={{ borderBottom: index < settings.faqs.length - 1 ? `1px solid ${C.line}` : "none" }}>
                  <button onClick={() => setOpenFaq(openFaq === index ? null : index)} className="flex w-full items-center gap-3 px-4 py-4 text-left">
                    <span className="flex-1 text-[13px] font-semibold" style={{ ...fBody, color: C.ink }}>{faq.question}</span>
                    <ChevronDown size={16} color={C.inkSoft} style={{ transform: openFaq === index ? "rotate(180deg)" : "none", transition: "transform 0.2s" }} />
                  </button>
                  {openFaq === index && <div className="px-4 pb-4 text-[13px] leading-relaxed" style={{ ...fBody, color: C.inkSoft }}>{faq.answer}</div>}
                </div>
              ))}
            </div>
          </section>

          <div className="rounded-2xl p-4" style={{ background: C.mint, border: `1px solid ${C.primary}22` }}>
            <div className="text-[13px] font-bold" style={{ ...fDisplay, color: C.primaryDark }}>Still need help?</div>
            <div className="mt-1 text-[12px] leading-relaxed" style={{ ...fBody, color: C.inkSoft }}>Contact the administrator and include as much detail as possible so we can respond quickly.</div>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------- PROFILE SCREEN ---------------------------------- */

function ProfileScreen({ role, currentUser, onLogout, showToast, onOpenSupport }) {
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
                <div className="space-y-3 py-1">
                  {Array.from({ length: 3 }).map((_, i) => <ReviewItemSkeleton key={i} />)}
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

        {/* Help & Support */}
        <MenuItem
          id="help"
          label="Help & Support"
          icon={MessageCircle}
          onClick={() => onOpenSupport?.()}
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

/* ---------------------------------- HOSTEL FORM MODAL ---------------------------------- */

const AMENITY_OPTIONS = [
  { key: "wifi", label: "Wi-Fi" },
  { key: "water", label: "Water" },
  { key: "power", label: "Power" },
  { key: "security", label: "Security" },
  { key: "parking", label: "Parking" },
  { key: "laundry", label: "Laundry" },
  { key: "study", label: "Study room" },
  { key: "cctv", label: "CCTV" },
];

function HostelFormModal({ hostel, onClose, onSaved, showToast }) {
  const isEdit = !!hostel;
  const empty = {
    name: "", location: "", contactRole: "Landlord", phone: "", roomType: "Bedsitter",
    price: "", billingPeriod: "month", distance: "", availableRooms: "", availability: "available", description: "",
    amenities: [], status: "active", latlng: [],
  };

  const toForm = (h) => ({
    name: h.name ?? "",
    location: h.location ?? "",
    contactRole: h.contactRole ?? (h.landlord === "Caretaker" ? "Caretaker" : "Landlord"),
    phone: h.phone ?? "",
    roomType: h.roomType ?? "Bedsitter",
    price: h.price ?? "",
    billingPeriod: h.billingPeriod === "semester" ? "semester" : "month",
    distance: h.distance ?? "",
    availableRooms: h.availableRooms ?? "",
    availability: Number(h.availableRooms) > 0 ? "available" : "full",
    description: h.description ?? "",
    amenities: h.amenities ?? [],
    status: h.status ?? "active",
    latlng: h.latlng ?? [],
  });

  const [form, setForm] = useState(isEdit ? toForm(hostel) : empty);
  // imageUrls: already-uploaded URLs (existing on edit, or newly uploaded)
  const [imageUrls, setImageUrls] = useState(isEdit ? (hostel.images ?? []) : []);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [urlInput, setUrlInput] = useState("");
  const [detectingLocation, setDetectingLocation] = useState(false);
  const fileInputRef = useRef(null);

  const addUrlInput = () => {
    const trimmed = urlInput.trim();
    if (!trimmed) return;
    setImageUrls((prev) => [...prev, trimmed]);
    setUrlInput("");
  };

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

  const detectArea = () => {
    if (!navigator.geolocation) {
      setError("GPS detection is not supported by this browser");
      return;
    }

    setDetectingLocation(true);
    setError("");
    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      const lat = Number(coords.latitude.toFixed(6));
      const lng = Number(coords.longitude.toFixed(6));
      const detectedLatLng = [lat, lng];
      set("latlng", detectedLatLng);
      set("distance", getDistanceFromCampus(detectedLatLng));

      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        if (!response.ok) throw new Error("Reverse geocoding failed");
        const data = await response.json();
        const address = data.address || {};
        const parts = [
          address.road,
          address.neighbourhood,
          address.suburb,
          address.village,
          address.town,
          address.city,
        ].filter(Boolean).filter((part, index, list) => list.indexOf(part) === index);
        set("location", parts.slice(0, 4).join(", ") || data.display_name || `GPS: ${lat}, ${lng}`);
      } catch {
        set("location", `GPS: ${lat}, ${lng}`);
      } finally {
        setDetectingLocation(false);
      }
    }, (geoError) => {
      setDetectingLocation(false);
      setError(geoError.code === 1 ? "Allow location access to detect the area" : "Unable to detect the area. Enter it manually.");
    }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 300000 });
  };

  const handleFileChange = async (e) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    setUploading(true);
    setError("");
    try {
      const urls = await api.uploadImages(files);
      setImageUrls((prev) => [...prev, ...urls]);
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
      e.target.value = "";
    }
  };

  const removeImage = (idx) => setImageUrls((prev) => prev.filter((_, i) => i !== idx));

  const toggleAmenity = (key) => {
    set("amenities", form.amenities.includes(key)
      ? form.amenities.filter((a) => a !== key)
      : [...form.amenities, key]);
  };

  const handleSave = async () => {
    const gpsDistance = getDistanceFromCampus(form.latlng);
    const manualDistance = form.distance === "" ? null : Number(form.distance);
    const distance = gpsDistance ?? manualDistance;

    if (!form.name.trim() || !form.location.trim() || !form.contactRole || !form.phone.trim()) {
      setError("Name, location, contact role and phone are required");
      return;
    }
    if (!form.price || distance === null || !Number.isFinite(distance) || distance < 0) {
      setError("Price and a valid distance are required");
      return;
    }
    if (form.availability === "available" && (!form.availableRooms || Number(form.availableRooms) < 1)) {
      setError("Enter the number of available rooms, or choose Full");
      return;
    }
    setSaving(true);
    setError("");
    try {
      const payload = {
        ...form,
        price: Number(form.price),
        billingPeriod: form.billingPeriod === "semester" ? "semester" : "month",
        distance,
        availableRooms: form.availability === "full" ? 0 : Number(form.availableRooms),
        images: imageUrls,
      };
      const saved = isEdit
        ? await api.updateHostel(hostel.id, payload)
        : await api.createHostel(payload);
      onSaved(saved, isEdit);
      showToast(isEdit ? `${saved.name} updated ✓` : `${saved.name} added ✓`);
      onClose();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  };

  const labelStyle = { ...fBody, color: C.inkSoft, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" };
  const inputStyle = { ...fBody, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 14, padding: "10px 14px", fontSize: 13, color: C.ink, width: "100%", outline: "none" };
  const selectStyle = { ...inputStyle, appearance: "none", cursor: "pointer" };

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center" style={{ background: "rgba(0,0,0,0.45)" }} onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className="w-full md:max-w-lg max-h-[90vh] flex flex-col rounded-t-3xl md:rounded-3xl overflow-hidden" style={{ background: C.surface }}>
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 border-b shrink-0" style={{ borderColor: C.line }}>
          <div className="text-[16px] font-extrabold" style={{ ...fDisplay, color: C.ink }}>
            {isEdit ? "Edit Listing" : "Add Listing"}
          </div>
          <button onClick={onClose} className="rounded-xl p-1.5" style={{ background: C.mint }}>
            <X size={18} color={C.primaryDark} />
          </button>
        </div>

        {/* Scrollable body */}
        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-4">
          {/* Name */}
          <div>
            <div className="mb-1.5" style={labelStyle}>Hostel name *</div>
            <input style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Greenview Hostel" />
          </div>

          {/* Location */}
          <div>
            <div className="mb-1.5" style={labelStyle}>Location *</div>
            <div className="flex flex-col gap-2 sm:flex-row">
              <input className="min-w-0 flex-1" style={inputStyle} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Chuka Town, near main gate" />
              <button
                type="button"
                onClick={detectArea}
                disabled={detectingLocation}
                className="flex shrink-0 items-center justify-center gap-1.5 rounded-[14px] px-3.5 py-2.5 text-[12px] font-semibold disabled:opacity-60"
                style={{ ...fBody, background: C.mint, color: C.primaryDark, border: `1px solid ${C.line}` }}
              >
                {detectingLocation ? <Loader2 size={14} className="animate-spin" /> : <Navigation size={14} />}
                {detectingLocation ? "Detecting…" : "Detect area"}
              </button>
            </div>
            <div className="mt-1 text-[10px]" style={{ ...fBody, color: C.inkSoft }}>Use GPS to fill this field, or enter the area manually.</div>
          </div>

          {/* Contact role + Phone */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            <div>
              <div className="mb-1.5" style={labelStyle}>Contact role *</div>
              <select style={selectStyle} value={form.contactRole} onChange={(e) => set("contactRole", e.target.value)}>
                {["Landlord", "Caretaker"].map((role) => <option key={role}>{role}</option>)}
              </select>
            </div>
            <div>
              <div className="mb-1.5" style={labelStyle}>Phone *</div>
              <input style={inputStyle} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="07XX XXX XXX" />
            </div>
          </div>

          {/* Room type */}
          <div>
            <div className="mb-1.5" style={labelStyle}>House category</div>
            <select style={selectStyle} value={form.roomType} onChange={(e) => set("roomType", e.target.value)}>
              {["Bedsitter", "Single", "Shared", "Studio", "1 Bedroom", "2 Bedroom"].map((r) => <option key={r}>{r}</option>)}
            </select>
          </div>

          {/* Price + Billing period + Distance + Rooms */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-4">
            <div>
              <div className="mb-1.5" style={labelStyle}>Price (KES) *</div>
              <input style={inputStyle} type="number" value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="4500" />
            </div>
            <div>
              <div className="mb-1.5" style={labelStyle}>Billing period</div>
              <select style={selectStyle} value={form.billingPeriod} onChange={(e) => set("billingPeriod", e.target.value)}>
                <option value="month">Per month</option>
                <option value="semester">Per semester</option>
              </select>
              {form.billingPeriod === "semester" && Number(form.price) > 0 && (
                <div className="mt-1 text-[10px] leading-snug" style={{ ...fBody, color: C.primaryDark }}>
                  KES {monthlyEquivalent(form.price, "semester").toLocaleString()}/month equivalent · 4 months
                </div>
              )}
            </div>
            <div>
              <div className="mb-1.5" style={labelStyle}>Distance (km) {getDistanceFromCampus(form.latlng) !== null ? "(auto)" : "*"}</div>
              <input
                style={inputStyle}
                type="number"
                step="0.1"
                value={getDistanceFromCampus(form.latlng) ?? form.distance}
                onChange={(e) => set("distance", e.target.value)}
                readOnly={getDistanceFromCampus(form.latlng) !== null}
                placeholder="0.5"
              />
              {getDistanceFromCampus(form.latlng) !== null && (
                <div className="mt-1 text-[10px]" style={{ ...fBody, color: C.primaryDark }}>Calculated from the detected GPS location.</div>
              )}
            </div>
            <div>
              <div className="mb-1.5" style={labelStyle}>Available rooms</div>
              <input
                style={{ ...inputStyle, opacity: form.availability === "full" ? 0.55 : 1 }}
                type="number"
                min="1"
                value={form.availableRooms}
                onChange={(e) => set("availableRooms", e.target.value)}
                placeholder="5"
                disabled={form.availability === "full"}
              />
            </div>
          </div>

          {/* Availability */}
          <div>
            <div className="mb-1.5" style={labelStyle}>Availability</div>
            <select style={selectStyle} value={form.availability} onChange={(e) => set("availability", e.target.value)}>
              <option value="available">Vacancies available</option>
              <option value="full">Full — no vacancies</option>
            </select>
            <div className="mt-1 text-[10px]" style={{ ...fBody, color: form.availability === "full" ? C.danger : C.primaryDark }}>
              {form.availability === "full" ? "This listing will show a red Full! label." : "This listing will show a green dot with the room count."}
            </div>
          </div>

          {/* Status */}
          <div>
            <div className="mb-1.5" style={labelStyle}>Status</div>
            <select style={selectStyle} value={form.status} onChange={(e) => set("status", e.target.value)}>
              {["active", "pending", "rejected"].map((s) => <option key={s}>{s}</option>)}
            </select>
          </div>

          {/* Amenities */}
          <div>
            <div className="mb-2" style={labelStyle}>Amenities</div>
            <div className="flex flex-wrap gap-2">
              {AMENITY_OPTIONS.map(({ key, label }) => {
                const on = form.amenities.includes(key);
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => toggleAmenity(key)}
                    className="rounded-xl px-3 py-1.5 text-[12px] font-semibold transition-all"
                    style={{ ...fBody, background: on ? C.primary : C.mint, color: on ? "#fff" : C.primaryDark }}
                  >
                    {label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div>
            <div className="mb-1.5" style={labelStyle}>Description</div>
            <textarea
              style={{ ...inputStyle, resize: "vertical", minHeight: 72 }}
              value={form.description}
              onChange={(e) => set("description", e.target.value)}
              placeholder="Brief description of the hostel…"
            />
          </div>

          {/* Image Upload */}
          <div>
            <div className="mb-2" style={labelStyle}>Photos</div>
            {/* Previews */}
            {imageUrls.length > 0 && (
              <div className="flex flex-wrap gap-2 mb-3">
                {imageUrls.map((url, idx) => (
                  <div key={idx} className="relative rounded-xl overflow-hidden shrink-0" style={{ width: 72, height: 72 }}>
                    <MediaItem src={url} alt="" controls={isVideo(url)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                    <button
                      type="button"
                      onClick={() => removeImage(idx)}
                      className="absolute top-0.5 right-0.5 rounded-full flex items-center justify-center"
                      style={{ background: "rgba(0,0,0,0.55)", width: 20, height: 20 }}
                    >
                      <X size={11} color="#fff" />
                    </button>
                  </div>
                ))}
              </div>
            )}
            {/* Upload controls */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*,video/*"
              multiple
              style={{ display: "none" }}
              onChange={handleFileChange}
            />
            <div className="flex items-center gap-2 flex-wrap">
              {/* File picker */}
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="flex items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all shrink-0"
                style={{ ...fBody, background: C.mint, color: C.primaryDark, opacity: uploading ? 0.6 : 1, border: `1.5px dashed ${C.primary}` }}
              >
                <ImagePlus size={16} />
                {uploading ? "Uploading…" : imageUrls.length > 0 ? "Add more" : "Choose files"}
              </button>
              {/* URL input */}
              <div className="flex flex-1 min-w-0 items-center rounded-xl overflow-hidden" style={{ border: `1.5px solid ${C.line}`, background: C.bg }}>
                <input
                  type="url"
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addUrlInput(); } }}
                  placeholder="Paste image or video URL…"
                  className="flex-1 min-w-0 bg-transparent px-3 py-2.5 text-[12px] outline-none"
                  style={{ ...fBody, color: C.ink }}
                />
                <button
                  type="button"
                  onClick={addUrlInput}
                  disabled={!urlInput.trim()}
                  className="px-3 py-2.5 text-[12px] font-semibold shrink-0"
                  style={{ ...fBody, color: urlInput.trim() ? C.primaryDark : C.inkSoft, background: urlInput.trim() ? C.mint : "transparent", transition: "all 0.15s" }}
                >
                  Add
                </button>
              </div>
            </div>
          </div>

          {error && (
            <div className="rounded-xl px-3 py-2 text-[12px] font-medium" style={{ background: C.dangerSoft, color: C.danger, ...fBody }}>
              {error}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-5 py-4 border-t shrink-0" style={{ borderColor: C.line }}>
          <PrimaryButton full onClick={handleSave} disabled={saving}>
            {saving ? "Saving…" : isEdit ? "Save Changes" : "Add Listing"}
          </PrimaryButton>
        </div>
      </div>
    </div>
  );
}

function SupportAdminPanel({ settings, onSaved, showToast }) {
  const [form, setForm] = useState(() => ({
    supportPhone: settings.supportPhone || "",
    whatsappNumber: settings.whatsappNumber || "",
    email: settings.email || "",
    officeHours: settings.officeHours || "",
    faqs: settings.faqs?.length ? settings.faqs.map((faq) => ({ question: faq.question, answer: faq.answer })) : [{ question: "", answer: "" }],
  }));
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setForm({
      supportPhone: settings.supportPhone || "",
      whatsappNumber: settings.whatsappNumber || "",
      email: settings.email || "",
      officeHours: settings.officeHours || "",
      faqs: settings.faqs?.length ? settings.faqs.map((faq) => ({ question: faq.question, answer: faq.answer })) : [{ question: "", answer: "" }],
    });
  }, [settings]);

  const setField = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const updateFaq = (index, key, value) => setForm((current) => ({
    ...current,
    faqs: current.faqs.map((faq, faqIndex) => faqIndex === index ? { ...faq, [key]: value } : faq),
  }));
  const addFaq = () => setForm((current) => ({ ...current, faqs: [...current.faqs, { question: "", answer: "" }] }));
  const removeFaq = (index) => setForm((current) => ({
    ...current,
    faqs: current.faqs.length > 1 ? current.faqs.filter((_, faqIndex) => faqIndex !== index) : [{ question: "", answer: "" }],
  }));

  const save = async () => {
    if (!form.supportPhone.trim() || !form.whatsappNumber.trim() || !form.email.trim()) {
      showToast("Phone, WhatsApp and email are required");
      return;
    }
    setSaving(true);
    try {
      const saved = await api.updateSupport({
        ...form,
        faqs: form.faqs.filter((faq) => faq.question.trim() && faq.answer.trim()),
      });
      onSaved(normalizeSupportSettings(saved));
      showToast("Support details updated ✓");
    } catch (err) {
      showToast(err.message || "Failed to update support details");
    } finally {
      setSaving(false);
    }
  };

  const inputStyle = { ...fBody, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 14, padding: "10px 14px", fontSize: 13, color: C.ink, width: "100%", outline: "none" };
  const labelStyle = { ...fBody, color: C.inkSoft, fontSize: 11, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" };

  return (
    <div className="px-4 py-4 space-y-4">
      <div className="rounded-2xl p-4" style={{ background: C.mint, border: `1px solid ${C.primary}22` }}>
        <div className="flex items-start gap-3">
          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: C.primary }}><MessageCircle size={17} color="#fff" /></div>
          <div>
            <div className="text-[14px] font-bold" style={{ ...fDisplay, color: C.primaryDark }}>Support page settings</div>
            <div className="mt-1 text-[12px] leading-relaxed" style={{ ...fBody, color: C.inkSoft }}>These details are shown to students on the Help & Support page. Keep the contact numbers current.</div>
          </div>
        </div>
      </div>

      <div className="rounded-2xl p-4 space-y-3" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
        <div className="text-[13px] font-bold" style={{ ...fDisplay, color: C.ink }}>Contact details</div>
        <div className="grid gap-3 sm:grid-cols-2">
          {[
            ["supportPhone", "Support phone", "e.g. +254 700 000 000", "tel"],
            ["whatsappNumber", "WhatsApp number", "e.g. +254 700 000 000", "tel"],
            ["email", "Support email", "support@chukanest.co.ke", "email"],
            ["officeHours", "Office hours", "Mon–Fri, 8:00 AM–5:00 PM", "text"],
          ].map(([key, label, placeholder, type]) => (
            <label key={key}>
              <div className="mb-1.5" style={labelStyle}>{label}</div>
              <input type={type} style={inputStyle} value={form[key]} onChange={(e) => setField(key, e.target.value)} placeholder={placeholder} />
            </label>
          ))}
        </div>
      </div>

      <div className="rounded-2xl p-4 space-y-3" style={{ background: C.surface, border: `1px solid ${C.line}` }}>
        <div className="flex items-center justify-between gap-2">
          <div>
            <div className="text-[13px] font-bold" style={{ ...fDisplay, color: C.ink }}>Frequently asked questions</div>
            <div className="mt-0.5 text-[11px]" style={{ ...fBody, color: C.inkSoft }}>Edit the answers students see on the Support page.</div>
          </div>
          <button onClick={addFaq} className="flex shrink-0 items-center gap-1 rounded-xl px-2.5 py-2 text-[11px] font-semibold" style={{ ...fBody, background: C.mint, color: C.primaryDark }}><Plus size={13} /> Add FAQ</button>
        </div>
        <div className="space-y-3">
          {form.faqs.map((faq, index) => (
            <div key={index} className="rounded-2xl p-3 space-y-2" style={{ background: C.bg, border: `1px solid ${C.line}` }}>
              <div className="flex items-center gap-2">
                <input style={{ ...inputStyle, flex: 1 }} value={faq.question} onChange={(e) => updateFaq(index, "question", e.target.value)} placeholder="Question" />
                <button onClick={() => removeFaq(index)} className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl" style={{ background: C.dangerSoft }} aria-label="Remove FAQ"><Trash2 size={15} color={C.danger} /></button>
              </div>
              <textarea style={{ ...inputStyle, resize: "vertical", minHeight: 68 }} value={faq.answer} onChange={(e) => updateFaq(index, "answer", e.target.value)} placeholder="Answer" />
            </div>
          ))}
        </div>
      </div>

      <PrimaryButton full onClick={save} disabled={saving}>{saving ? "Saving support details…" : "Save support details"}</PrimaryButton>
    </div>
  );
}

/* ---------------------------------- ADMIN SCREEN ---------------------------------- */

function AdminScreen({ showToast, onHostelSaved }) {
  const [activeTab, setActiveTab] = useState("overview");
  const [listings, setListings] = useState([]);
  const [pendingVerifications, setPendingVerifications] = useState([]);
  const [flagged, setFlagged] = useState([]);
  const [users, setUsers] = useState([]);
  const [supportSettings, setSupportSettings] = useState(FALLBACK_SUPPORT_SETTINGS);
  const [loading, setLoading] = useState(true);
  const [hostelModal, setHostelModal] = useState(null); // null | { hostel: null } | { hostel: <obj> }

  useEffect(() => {
    const load = async () => {
      try {
        const [active, pending, flaggedRevs, userList, support] = await Promise.all([
          api.getHostels(),
          api.getHostels("pending"),
          api.getFlaggedReviews(),
          api.getUsers(),
          api.getSupport(),
        ]);
        setListings(active);
        setPendingVerifications(pending);
        setFlagged(flaggedRevs);
        setUsers(userList);
        setSupportSettings(normalizeSupportSettings(support));
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
    { id: "support",       label: "Support",   icon: MessageCircle },
  ];

  if (loading) {
    return (
      <div className="flex h-full flex-col items-center justify-center gap-3" style={{ background: C.bg }}>
        <Spinner size={40} />
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
                <div className="text-[13px] font-bold" style={{ ...fDisplay, color: C.ink }}>Listings by Category</div>
              </div>
              {[
                { label: "Bedsitter",  count: listings.filter(h => h.roomType === "Bedsitter").length,  color: "#E879A0" },
                { label: "Single",     count: listings.filter(h => h.roomType === "Single").length,     color: "#5B6DCD" },
                { label: "Shared",     count: listings.filter(h => h.roomType === "Shared").length,     color: C.primary },
                { label: "Studio",     count: listings.filter(h => h.roomType === "Studio").length,     color: "#F59E0B" },
                { label: "1 Bedroom",  count: listings.filter(h => h.roomType === "1 Bedroom").length,  color: "#10B981" },
                { label: "2 Bedroom",  count: listings.filter(h => h.roomType === "2 Bedroom").length,  color: "#6366F1" },
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
              <button onClick={() => setHostelModal({ hostel: null })} className="flex items-center gap-1.5 rounded-xl px-3 py-1.5 text-[12px] font-semibold" style={{ background: C.primary, color: "#fff", ...fBody }}>
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
                    <div className="text-[12px] truncate" style={{ ...fBody, color: C.inkSoft }}>{h.location || "Location not provided"} · {h.contactRole || "Landlord"} · {h.roomType}</div>
                    <div className="mt-1 flex flex-wrap items-center gap-2">
                      <PriceSummary
                        price={h.price}
                        billingPeriod={h.billingPeriod}
                        mainClassName="text-[12px] font-semibold"
                        mainStyle={{ ...fMono, color: C.primaryDark }}
                      />
                      <AvailabilityBadge rooms={h.availableRooms} compact />
                    </div>
                  </div>
                </div>
                <div className="flex border-t" style={{ borderColor: C.line }}>
                  <button onClick={() => setHostelModal({ hostel: h })} className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-[12px] font-semibold" style={{ ...fBody, color: C.inkSoft }}>
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
                  <div className="flex flex-col gap-1.5 shrink-0">
                    <button
                      onClick={async () => {
                        const newStatus = u.status === "suspended" ? "active" : "suspended";
                        try {
                          await api.updateUser(u.id, { status: newStatus });
                          setUsers((us) => us.map((x) => x.id === u.id ? { ...x, status: newStatus } : x));
                          showToast(`${u.name || u.email} ${newStatus === "suspended" ? "suspended" : "reactivated"}`);
                        } catch { showToast("Action failed"); }
                      }}
                      className="rounded-xl px-2.5 py-1.5 text-[11px] font-semibold"
                      style={{ ...fBody, background: C.dangerSoft, color: C.danger }}
                    >
                      {u.status === "suspended" ? "Reactivate" : "Suspend"}
                    </button>
                    <button
                      onClick={async () => {
                        if (!window.confirm(`Delete ${u.name || u.email}? This cannot be undone.`)) return;
                        try {
                          await api.deleteUser(u.id);
                          setUsers((us) => us.filter((x) => x.id !== u.id));
                          showToast(`${u.name || u.email} deleted`);
                        } catch { showToast("Delete failed"); }
                      }}
                      className="rounded-xl px-2.5 py-1.5 text-[11px] font-semibold"
                      style={{ ...fBody, background: "#F5F5F5", color: C.inkSoft }}
                    >
                      Delete
                    </button>
                  </div>
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
                      <div className="text-[12px] mt-0.5 truncate" style={{ ...fBody, color: C.inkSoft }}>{v.location || "Location not provided"} · {v.contactRole || "Landlord"} · {v.phone}</div>
                    </div>
                    <Badge tone="gold">Pending</Badge>
                  </div>
                  <div className="grid grid-cols-1 gap-2 mb-4 sm:grid-cols-3">
                    {[
                      { label: "Rooms", value: v.availableRooms },
                      { label: `Price/${billingPeriodLabel(v.billingPeriod)}`, value: `KES ${v.price?.toLocaleString()}` },
                      ...(v.billingPeriod === "semester" ? [{ label: "Monthly equivalent", value: `KES ${monthlyEquivalent(v.price, "semester").toLocaleString()}` }] : []),
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

        {/* ── SUPPORT SETTINGS ── */}
        {activeTab === "support" && (
          <SupportAdminPanel
            settings={supportSettings}
            onSaved={setSupportSettings}
            showToast={showToast}
          />
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

      {/* ── HOSTEL FORM MODAL ── */}
      {hostelModal && (
        <HostelFormModal
          hostel={hostelModal.hostel}
          onClose={() => setHostelModal(null)}
          onSaved={(saved, isEdit) => {
            const norm = { ...saved, id: saved._id ?? saved.id };
            if (isEdit) {
              setListings((l) => l.map((x) => x.id === norm.id ? norm : x));
            } else {
              setListings((l) => [...l, norm]);
            }
            onHostelSaved?.(norm, isEdit);
          }}
          showToast={showToast}
        />
      )}
    </div>
  );
}

/* ---------------------------------- NAV ---------------------------------- */

function AppNav({ tab, setTab, role, dark, toggleDark }) {
  const tabs = [
    { id: "home",    label: "Home",    icon: Home },
    { id: "map",     label: "Map",     icon: Navigation },
    { id: "favs",    label: "Saved",   icon: Heart },
    { id: "ai",      label: "Ask AI",  icon: Bot },
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
        {/* Dark mode toggle — mobile */}
        <button
          onClick={toggleDark}
          className="flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-2xl transition-all"
          style={{ background: "transparent", minWidth: 44 }}
          title={dark ? "Switch to light mode" : "Switch to dark mode"}
        >
          {dark
            ? <Sun size={20} color={C.gold} strokeWidth={1.8} />
            : <Moon size={20} color={C.inkSoft} strokeWidth={1.8} />}
          <span className="text-[10px] font-semibold" style={{ ...fBody, color: C.inkSoft }}>{dark ? "Light" : "Dark"}</span>
        </button>
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

        <div className="px-3 pt-4 space-y-3" style={{ borderTop: `1px solid ${C.line}` }}>
          {/* Dark mode toggle — desktop */}
          <button
            onClick={toggleDark}
            className="w-full flex items-center gap-3 rounded-2xl px-3 py-2.5 transition-all"
            style={{ background: C.mint }}
            title={dark ? "Switch to light mode" : "Switch to dark mode"}
          >
            {dark
              ? <Sun size={18} color={C.gold} strokeWidth={1.8} />
              : <Moon size={18} color={C.primaryDark} strokeWidth={1.8} />}
            <span className="text-[14px] font-semibold" style={{ ...fBody, color: dark ? C.gold : C.primaryDark }}>
              {dark ? "Light mode" : "Dark mode"}
            </span>
          </button>
          <div className="text-[11px]" style={{ ...fBody, color: C.inkSoft }}>Verified student housing</div>
          <div className="text-[11px]" style={{ ...fBody, color: C.inkSoft }}>near Chuka University</div>
        </div>
      </div>
    </>
  );
}

/* ────────────────────────── AI CHAT PAGE ────────────────────────── */

function AiScreen({ role }) {
  const GREETING = "Hi! 👋 I'm your ChukaNest assistant. Tell me what you're looking for — budget, room type, amenities — and I'll point you to the right hostel.";
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
    "Bedsitter under KES 5,000",
    "Closest hostel to campus",
    "Best rated with WiFi",
    "1 bedroom with parking",
  ];

  return (
    <div className="flex flex-col h-full" style={{ background: C.bg }}>
        {/* Header */}
        <div
          className="flex items-center gap-3 px-4 py-4 shrink-0"
          style={{ background: C.primary }}
        >
          <div className="flex h-9 w-9 items-center justify-center rounded-full shrink-0" style={{ background: "rgba(255,255,255,0.18)" }}>
            <Bot size={18} color="#fff" />
          </div>
          <div>
            <div className="text-[16px] font-bold text-white" style={fDisplay}>ChukaNest AI</div>
            <div className="text-[11px] text-white/70" style={fBody}>Powered by Groq · llama-3.1-8b-instant</div>
          </div>
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
                ? <Spinner size={18} color="#fff" />
                : <Send size={14} color={input.trim() ? "#fff" : C.inkSoft} />
              }
            </button>
          </div>
          <div className="mt-1.5 text-center text-[10px]" style={{ ...fBody, color: C.inkSoft }}>Enter to send · Shift+Enter for new line</div>
        </div>
    </div>
  );
}

/* ---------------------------------- APP ROOT ---------------------------------- */

export default function App() {
  const [role, setRole] = useState(() => { const s = loadAuth(); return s?.user?.role ?? null; });
  const [currentUser, setCurrentUser] = useState(() => { const s = loadAuth(); return s?.user ?? null; });
  const [tab, setTab] = useState(() => new URLSearchParams(window.location.search).get("support") === "1" ? "support" : "home");
  const [openHostelId, setOpenHostelId] = useState(null);
  const [hostels, setHostels] = useState([]);
  const [favs, setFavs] = useState(new Set());
  const [reviews, setReviews] = useState({}); // { hostelId: Review[] }
  const [toast, setToast] = useState(null);
  const [hostelLoading, setHostelLoading] = useState(true);
  const [dark, setDark] = useState(() => localStorage.getItem("cn_dark") === "1");
  const toastRef = useRef(null);

  // Apply theme palette before every render so all children read correct colors
  Object.assign(C, dark ? DARK_PALETTE : LIGHT_PALETTE);

  const toggleDark = () => {
    setDark((d) => {
      const next = !d;
      localStorage.setItem("cn_dark", next ? "1" : "0");
      return next;
    });
  };

  // Inject Google Fonts
  useEffect(() => {
    const style = document.createElement("style");
    style.textContent = FONT_IMPORT;
    document.head.appendChild(style);
    return () => document.head.removeChild(style);
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

  const handleAdminHostelSaved = (saved, isEdit) => {
    setHostels((prev) => {
      if (saved.status !== "active") {
        return isEdit ? prev.filter((hostel) => hostel.id !== saved.id) : prev;
      }
      return isEdit
        ? prev.map((hostel) => hostel.id === saved.id ? saved : hostel)
        : [...prev, saved];
    });
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
      <div className="h-screen w-full overflow-hidden" style={{ background: C.primaryDark, color: C.ink }}>
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
    <div className="flex h-screen w-full overflow-hidden" style={{ background: C.bg, color: C.ink }}>
      <Toast toast={toast} />
      <AppNav tab={tab} setTab={setTab} role={role} dark={dark} toggleDark={toggleDark} />

      <div className="min-w-0 min-h-0 flex-1 overflow-hidden md:ml-[220px]">
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
                <div className="h-full overflow-y-auto px-4 pt-4 pb-24">
                  <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                    {Array.from({ length: 6 }).map((_, i) => <HostelCardSkeleton key={i} />)}
                  </div>
                </div>
              ) : (
                <HomeScreen hostels={hostels} favs={favs} onToggleFav={toggleFav} onOpen={setOpenHostelId} showToast={showToast} currentUser={currentUser} favIds={[...favs]} />
              )
            )}
            {tab === "map" && <MapScreen hostels={hostels} onOpen={(id) => setOpenHostelId(id)} />}
            {tab === "favs" && <FavouritesScreen hostels={hostels} favs={favs} onToggleFav={toggleFav} onOpen={setOpenHostelId} />}
            {tab === "ai" && <AiScreen role={role} />}
            {tab === "admin" && role === "admin" && <AdminScreen showToast={showToast} onHostelSaved={handleAdminHostelSaved} />}
            {tab === "support" && <SupportScreen showToast={showToast} onBack={() => setTab("profile")} currentUser={currentUser} />}
            {tab === "profile" && <ProfileScreen role={role} currentUser={currentUser} onLogout={handleLogout} showToast={showToast} onOpenSupport={() => setTab("support")} />}
          </div>
        )}
      </div>
    </div>
  );
}
