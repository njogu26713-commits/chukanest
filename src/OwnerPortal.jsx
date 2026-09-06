import { useEffect, useRef, useState } from "react";
import {
  ArrowLeft,
  Building2,
  Check,
  Copy,
  Eye,
  EyeOff,
  ImagePlus,
  Lock,
  LogOut,
  Mail,
  MapPin,
  Pencil,
  Phone,
  Plus,
  ShieldCheck,
  Trash2,
  User,
  WalletCards,
  X,
} from "lucide-react";
import { api, clearAuth, saveAuth } from "./api.js";

const C = {
  primary: "#1B6B45",
  primaryDark: "#0F4A30",
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
const fDisplay = { fontFamily: "'Plus Jakarta Sans', sans-serif" };
const fBody = { fontFamily: "'Inter', sans-serif" };
const fMono = { fontFamily: "'Roboto Mono', monospace" };
const AMENITIES = [
  ["wifi", "Wi-Fi"],
  ["water", "Water 24/7"],
  ["power", "Electricity"],
  ["security", "Security"],
  ["parking", "Parking"],
  ["laundry", "Laundry"],
  ["study", "Study room"],
  ["cctv", "CCTV"],
];
const ROOM_TYPES = ["Bedsitter", "Single", "Shared", "Studio", "1 Bedroom", "2 Bedroom"];
const placeholder = "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='400' height='300'%3E%3Crect width='400' height='300' fill='%23E4E9E3'/%3E%3C/svg%3E";

function Button({ children, onClick, disabled = false, variant = "primary", type = "button", className = "" }) {
  const styles = {
    primary: { background: C.primary, color: "#fff" },
    soft: { background: C.mint, color: C.primaryDark },
    danger: { background: C.dangerSoft, color: C.danger },
    outline: { background: C.surface, color: C.primaryDark, border: `1px solid ${C.line}` },
  };
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`flex items-center justify-center gap-2 rounded-2xl px-4 py-3 text-sm font-semibold transition-all disabled:opacity-50 ${className}`}
      style={{ ...fBody, ...styles[variant] }}
    >
      {children}
    </button>
  );
}

function Field({ label, children }) {
  return <label className="block"><div className="mb-1.5 text-[11px] font-semibold uppercase tracking-wide" style={{ ...fBody, color: C.inkSoft }}>{label}</div>{children}</label>;
}

const inputStyle = { ...fBody, background: C.bg, border: `1px solid ${C.line}`, borderRadius: 14, padding: "10px 14px", fontSize: 13, color: C.ink, width: "100%", outline: "none" };
const selectStyle = { ...inputStyle, appearance: "none" };

function OwnerAuth({ onAuthed, showToast }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (loading) return;
    setError("");
    if (!email.trim() || !password.trim() || (mode === "signup" && (!name.trim() || !phone.trim()))) {
      setError(mode === "signup" ? "Name, phone, email and password are required" : "Email and password are required");
      return;
    }
    setLoading(true);
    try {
      const result = mode === "signup"
        ? await api.ownerSignup(name.trim(), email.trim(), password, phone.trim())
        : await api.ownerLogin(email.trim(), password);
      saveAuth(result.token, result.user);
      showToast(mode === "signup" ? "Owner account created" : "Welcome back");
      onAuthed(result.user.role, result.user);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen overflow-y-auto" style={{ background: `linear-gradient(135deg, ${C.primaryDark} 0%, ${C.primary} 52%, ${C.bg} 52%)` }}>
      <div className="mx-auto flex min-h-screen w-full max-w-6xl items-center justify-center gap-12 px-5 py-10 lg:px-10">
        <div className="hidden max-w-md flex-1 lg:block">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl" style={{ background: "rgba(255,255,255,0.16)" }}><Building2 size={25} color="#fff" /></div>
            <div className="text-2xl font-extrabold text-white" style={fDisplay}>ChukaNest Owners</div>
          </div>
          <h1 className="text-4xl font-extrabold leading-tight text-white" style={fDisplay}>List your house where Chuka students are looking.</h1>
          <p className="mt-4 text-[15px] leading-relaxed text-white/80" style={fBody}>Pay KSh 999 for 30 days, upload your property, and keep it visible to students while your subscription is active.</p>
          <div className="mt-7 space-y-3 text-sm text-white/90" style={fBody}>
            {["Your listing gets a private generated token", "Premium controls remain with ChukaNest admins", "Expired subscriptions automatically hide listings"].map((item) => <div key={item} className="flex items-center gap-2"><Check size={17} color="#BDE7CE" />{item}</div>)}
          </div>
        </div>

        <div className="w-full max-w-md rounded-3xl p-6 shadow-2xl" style={{ background: C.surface }}>
          <div className="mb-6 flex items-center gap-3 lg:hidden">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: C.primary }}><Building2 size={20} color="#fff" /></div>
            <div className="text-xl font-extrabold" style={{ ...fDisplay, color: C.ink }}>ChukaNest Owners</div>
          </div>
          <div className="mb-5">
            <div className="text-[22px] font-extrabold" style={{ ...fDisplay, color: C.ink }}>{mode === "login" ? "Owner sign in" : "Create owner account"}</div>
            <div className="mt-1 text-[13px]" style={{ ...fBody, color: C.inkSoft }}>{mode === "login" ? "Manage your paid house listings" : "Start listing houses to Chuka students"}</div>
          </div>
          <div className="mb-5 flex rounded-2xl p-1" style={{ background: C.mint }}>
            {["login", "signup"].map((item) => <button key={item} onClick={() => { setMode(item); setError(""); }} className="flex-1 rounded-xl py-2 text-sm font-semibold" style={{ ...fBody, background: mode === item ? C.surface : "transparent", color: mode === item ? C.primaryDark : C.inkSoft }}>{item === "login" ? "Log in" : "Sign up"}</button>)}
          </div>
          <div className="space-y-3">
            {mode === "signup" && <div className="flex items-center gap-2 rounded-2xl px-3.5 py-3" style={{ background: C.bg, border: `1px solid ${C.line}` }}><User size={16} color={C.inkSoft} /><input value={name} onChange={(e) => setName(e.target.value)} placeholder="Full name" className="w-full bg-transparent text-sm outline-none" style={{ ...fBody, color: C.ink }} /></div>}
            {mode === "signup" && <div className="flex items-center gap-2 rounded-2xl px-3.5 py-3" style={{ background: C.bg, border: `1px solid ${C.line}` }}><Phone size={16} color={C.inkSoft} /><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="M-Pesa phone e.g. 0712345678" className="w-full bg-transparent text-sm outline-none" style={{ ...fBody, color: C.ink }} /></div>}
            <div className="flex items-center gap-2 rounded-2xl px-3.5 py-3" style={{ background: C.bg, border: `1px solid ${C.line}` }}><Mail size={16} color={C.inkSoft} /><input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="you@example.com" className="w-full bg-transparent text-sm outline-none" style={{ ...fBody, color: C.ink }} /></div>
            <div className="flex items-center gap-2 rounded-2xl px-3.5 py-3" style={{ background: C.bg, border: `1px solid ${C.line}` }}><Lock size={16} color={C.inkSoft} /><input type={showPassword ? "text" : "password"} value={password} onChange={(e) => setPassword(e.target.value)} onKeyDown={(e) => e.key === "Enter" && submit()} placeholder="Password" className="w-full bg-transparent text-sm outline-none" style={{ ...fBody, color: C.ink }} /><button onClick={() => setShowPassword((value) => !value)}>{showPassword ? <EyeOff size={16} color={C.inkSoft} /> : <Eye size={16} color={C.inkSoft} />}</button></div>
          </div>
          {error && <div className="mt-3 rounded-xl px-3 py-2 text-[12px] font-medium" style={{ background: C.dangerSoft, color: C.danger, ...fBody }}>{error}</div>}
          <Button onClick={submit} disabled={loading} className="mt-5">{loading ? "Please wait…" : mode === "login" ? "Log in as owner" : "Create owner account"}</Button>
          <div className="mt-4 flex items-center justify-center gap-1.5 text-[11px]" style={{ ...fBody, color: C.inkSoft }}><ShieldCheck size={13} /> Owner access is separate from student accounts</div>
        </div>
      </div>
    </div>
  );
}

function OwnerPaymentCard({ status, onActivated, showToast }) {
  const [phone, setPhone] = useState(status?.phone || "");
  const [loading, setLoading] = useState(false);
  const [waiting, setWaiting] = useState(false);

  useEffect(() => { if (status?.phone) setPhone(status.phone); }, [status?.phone]);

  const pay = async () => {
    if (!phone.trim()) { showToast("Enter your M-Pesa phone number"); return; }
    setLoading(true);
    try {
      const result = await api.startOwnerPayment(phone);
      showToast(result.message || "Check your phone for the M-Pesa prompt");
      if (result.temporary) {
        onActivated({ active: true, ownerSubscriptionUntil: result.expiresAt, phone });
        setLoading(false);
        return;
      }
      setWaiting(true);
      let attempts = 0;
      const poll = async () => {
        attempts += 1;
        try {
          const next = await api.getOwnerStatus();
          if (next.active) { onActivated(next); showToast("Owner subscription activated"); setWaiting(false); setLoading(false); return; }
        } catch {}
        if (attempts < 15) setTimeout(poll, 4000);
        else { setWaiting(false); setLoading(false); showToast("Payment is still processing. Refresh after confirmation."); }
      };
      setTimeout(poll, 4000);
    } catch (err) {
      showToast(err.message || "Could not start owner payment");
      setLoading(false);
    }
  };

  return (
    <div className="rounded-3xl p-5" style={{ background: C.goldSoft, border: `1px solid ${C.gold}55` }}>
      <div className="flex items-start gap-3">
        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl" style={{ background: C.gold }}><WalletCards size={20} color="#fff" /></div>
        <div><div className="text-[16px] font-extrabold" style={{ ...fDisplay, color: C.ink }}>Activate your house listings</div><div className="mt-1 text-[12px] leading-relaxed" style={{ ...fBody, color: C.inkSoft }}>Pay <b>KSh 999</b> by M-Pesa for 30 days of visibility. All your active listings will appear to students while the subscription is valid.</div></div>
      </div>
      <div className="mt-4 flex flex-col gap-2 sm:flex-row"><input value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="07XX XXX XXX" className="min-w-0 flex-1 rounded-2xl px-3.5 py-3 text-[13px] outline-none" style={{ ...fBody, background: C.surface, border: `1px solid ${C.line}`, color: C.ink }} /><Button onClick={pay} disabled={loading}>{waiting ? "Waiting…" : loading ? "Sending…" : "Pay KSh 999"}</Button></div>
    </div>
  );
}

function OwnerListingForm({ listing, subscriptionUntil, onClose, onSaved, showToast }) {
  const isEdit = !!listing;
  const initial = {
    name: listing?.name || "",
    location: listing?.location || "",
    contactRole: listing?.contactRole || "Landlord",
    phone: listing?.phone || "",
    roomType: listing?.roomType || "Bedsitter",
    price: listing?.price ?? "",
    billingPeriod: listing?.billingPeriod === "semester" ? "semester" : "month",
    distance: listing?.distance ?? "",
    availableRooms: listing?.availableRooms ?? "",
    availability: Number(listing?.availableRooms) > 0 ? "available" : "full",
    description: listing?.description || "",
    amenities: listing?.amenities || [],
  };
  const [form, setForm] = useState(initial);
  const [images, setImages] = useState(listing?.images || []);
  const [urlInput, setUrlInput] = useState("");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const fileRef = useRef(null);
  const set = (key, value) => setForm((current) => ({ ...current, [key]: value }));
  const toggleAmenity = (key) => set("amenities", form.amenities.includes(key) ? form.amenities.filter((item) => item !== key) : [...form.amenities, key]);

  const upload = async (event) => {
    const files = Array.from(event.target.files || []);
    if (!files.length) return;
    setUploading(true); setError("");
    try {
      const urls = await api.uploadImages(files);
      setImages((current) => [...current, ...urls]);
    } catch (err) { setError(err.message); }
    finally { setUploading(false); event.target.value = ""; }
  };

  const save = async () => {
    if (!form.name.trim() || !form.location.trim() || !form.contactRole || !form.phone.trim()) { setError("Name, location, contact role and phone are required"); return; }
    if (!form.price || !form.distance || !Number.isFinite(Number(form.distance))) { setError("Price and a valid distance are required"); return; }
    if (form.availability === "available" && (!form.availableRooms || Number(form.availableRooms) < 1)) { setError("Enter available rooms, or choose Full"); return; }
    setSaving(true); setError("");
    const payload = {
      ...form,
      price: Number(form.price),
      distance: Number(form.distance),
      availableRooms: form.availability === "full" ? 0 : Number(form.availableRooms),
      images,
    };
    try {
      const saved = isEdit ? await api.updateOwnerListing(listing.id, payload) : await api.createOwnerListing(payload);
      onSaved(saved, isEdit); showToast(isEdit ? "Listing updated" : "Listing created"); onClose();
    } catch (err) { setError(err.message); }
    finally { setSaving(false); }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center" style={{ background: "rgba(0,0,0,0.45)" }} onClick={(event) => event.target === event.currentTarget && onClose()}>
      <div className="flex max-h-[94vh] w-full max-w-2xl flex-col overflow-hidden rounded-t-3xl" style={{ background: C.surface }}>
        <div className="flex items-center justify-between border-b px-5 py-4" style={{ borderColor: C.line }}><div><div className="text-[17px] font-extrabold" style={{ ...fDisplay, color: C.ink }}>{isEdit ? "Edit house listing" : "Upload a house"}</div><div className="mt-0.5 text-[11px]" style={{ ...fBody, color: C.inkSoft }}>Premium is managed by ChukaNest admins.</div></div><button onClick={onClose} className="rounded-xl p-1.5" style={{ background: C.mint }}><X size={18} color={C.primaryDark} /></button></div>
        <div className="flex-1 space-y-4 overflow-y-auto px-5 py-4">
          <Field label="Listing token"><div className="flex items-center gap-2"><input readOnly value={listing?.ownerToken || "Generated automatically after saving"} style={{ ...inputStyle, ...fMono, color: listing?.ownerToken ? C.primaryDark : C.inkSoft }} /><button disabled={!listing?.ownerToken} onClick={() => { navigator.clipboard?.writeText(listing.ownerToken); showToast("Listing token copied"); }} className="flex shrink-0 items-center gap-1 rounded-xl px-3 py-2.5 text-[11px] font-semibold disabled:opacity-40" style={{ ...fBody, background: C.mint, color: C.primaryDark }}><Copy size={13} /> Copy</button></div><div className="mt-1 text-[10px]" style={{ ...fBody, color: C.inkSoft }}>This token is generated by the system and identifies this house. Do not edit it.</div></Field>
          <Field label="House name *"><input style={inputStyle} value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="e.g. Greenview House" /></Field>
          <Field label="Location *"><div className="flex items-center gap-2"><MapPin size={16} color={C.inkSoft} /><input style={inputStyle} value={form.location} onChange={(e) => set("location", e.target.value)} placeholder="e.g. Chuka Town, near main gate" /></div></Field>
          <div className="grid gap-3 sm:grid-cols-2"><Field label="Contact role *"><select style={selectStyle} value={form.contactRole} onChange={(e) => set("contactRole", e.target.value)}>{["Landlord", "Caretaker"].map((item) => <option key={item}>{item}</option>)}</select></Field><Field label="Phone *"><input style={inputStyle} value={form.phone} onChange={(e) => set("phone", e.target.value)} placeholder="07XX XXX XXX" /></Field></div>
          <Field label="House category"><select style={selectStyle} value={form.roomType} onChange={(e) => set("roomType", e.target.value)}>{ROOM_TYPES.map((item) => <option key={item}>{item}</option>)}</select></Field>
          <div className="grid gap-3 sm:grid-cols-4"><Field label="Price (KSh) *"><input type="number" style={inputStyle} value={form.price} onChange={(e) => set("price", e.target.value)} placeholder="4500" /></Field><Field label="Billing period"><select style={selectStyle} value={form.billingPeriod} onChange={(e) => set("billingPeriod", e.target.value)}><option value="month">Per month</option><option value="semester">Per semester</option></select></Field><Field label="Distance (km) *"><input type="number" step="0.1" style={inputStyle} value={form.distance} onChange={(e) => set("distance", e.target.value)} placeholder="0.5" /></Field><Field label="Available rooms"><input type="number" min="1" style={{ ...inputStyle, opacity: form.availability === "full" ? 0.55 : 1 }} disabled={form.availability === "full"} value={form.availableRooms} onChange={(e) => set("availableRooms", e.target.value)} placeholder="5" /></Field></div>
          <Field label="Availability"><select style={selectStyle} value={form.availability} onChange={(e) => set("availability", e.target.value)}><option value="available">Vacancies available</option><option value="full">Full — no vacancies</option></select></Field>
          <Field label="Amenities"><div className="flex flex-wrap gap-2">{AMENITIES.map(([key, label]) => <button key={key} type="button" onClick={() => toggleAmenity(key)} className="rounded-xl px-3 py-1.5 text-[12px] font-semibold" style={{ ...fBody, background: form.amenities.includes(key) ? C.primary : C.mint, color: form.amenities.includes(key) ? "#fff" : C.primaryDark }}>{label}</button>)}</div></Field>
          <Field label="Description"><textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={form.description} onChange={(e) => set("description", e.target.value)} placeholder="Describe the house, surroundings and what students should know" /></Field>
          <Field label="House photos/videos"><div className="flex flex-wrap gap-2">{images.map((src, index) => <div key={`${src}-${index}`} className="relative h-24 w-24 overflow-hidden rounded-xl" style={{ border: `1px solid ${C.line}` }}><img src={src} alt="" className="h-full w-full object-cover" onError={(e) => { e.currentTarget.src = placeholder; }} /><button onClick={() => setImages((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-lg" style={{ background: "rgba(0,0,0,0.62)" }}><X size={13} color="#fff" /></button></div>)}<button onClick={() => fileRef.current?.click()} disabled={uploading} className="flex h-24 w-24 flex-col items-center justify-center gap-1 rounded-xl text-[11px] font-semibold disabled:opacity-50" style={{ ...fBody, background: C.mint, color: C.primaryDark, border: `1px dashed ${C.primary}` }}><ImagePlus size={18} />{uploading ? "Uploading" : "Choose files"}</button></div><input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden" onChange={upload} /><div className="mt-2 flex gap-2"><input style={{ ...inputStyle, flex: 1 }} value={urlInput} onChange={(e) => setUrlInput(e.target.value)} placeholder="Or paste a media URL" /><Button variant="soft" onClick={() => { if (urlInput.trim()) { setImages((current) => [...current, urlInput.trim()]); setUrlInput(""); } }}>Add URL</Button></div></Field>
          {error && <div className="rounded-xl px-3 py-2 text-[12px] font-medium" style={{ ...fBody, background: C.dangerSoft, color: C.danger }}>{error}</div>}
        </div>
        <div className="flex gap-2 border-t px-5 py-4" style={{ borderColor: C.line }}><Button variant="outline" onClick={onClose}>Cancel</Button><Button onClick={save} disabled={saving || uploading}>{saving ? "Saving…" : isEdit ? "Save changes" : "Create listing"}</Button></div>
      </div>
    </div>
  );
}

function dateLabel(value) {
  if (!value) return "Not active";
  return new Date(value).toLocaleDateString("en-KE", { day: "numeric", month: "short", year: "numeric" });
}

function OwnerDashboard({ currentUser, onLogout, showToast }) {
  const [status, setStatus] = useState(null);
  const [listings, setListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modal, setModal] = useState(null);
  const [error, setError] = useState("");

  const load = async () => {
    setLoading(true); setError("");
    try {
      const [ownerStatus, ownerListings] = await Promise.all([api.getOwnerStatus(), api.getOwnerListings()]);
      setStatus(ownerStatus); setListings(ownerListings);
    } catch (err) { setError(err.message); }
    finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);

  const handleActivated = (next) => { setStatus((current) => ({ ...current, ...next, active: true })); load(); };
  const handleSaved = (saved, isEdit) => setListings((current) => isEdit ? current.map((item) => item.id === saved.id ? saved : item) : [saved, ...current]);
  const remove = async (listing) => {
    if (!window.confirm(`Delete ${listing.name}?`)) return;
    try { await api.deleteOwnerListing(listing.id); setListings((current) => current.filter((item) => item.id !== listing.id)); showToast("Listing deleted"); }
    catch (err) { showToast(err.message); }
  };
  const active = !!status?.active;

  if (loading) return <div className="flex min-h-screen items-center justify-center" style={{ background: C.bg, color: C.ink }}>Loading owner portal…</div>;

  return (
    <div className="min-h-screen" style={{ background: C.bg, color: C.ink }}>
      <header className="border-b" style={{ background: C.surface, borderColor: C.line }}><div className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-4 lg:px-8"><div className="flex items-center gap-3"><div className="flex h-10 w-10 items-center justify-center rounded-xl" style={{ background: C.primary }}><Building2 size={20} color="#fff" /></div><div><div className="text-[17px] font-extrabold" style={fDisplay}>Owner portal</div><div className="text-[11px]" style={{ ...fBody, color: C.inkSoft }}>Welcome, {currentUser?.name || "owner"}</div></div></div><Button variant="soft" onClick={onLogout}><LogOut size={15} /> Log out</Button></div></header>
      <main className="mx-auto max-w-6xl space-y-5 px-4 py-5 lg:px-8">
        <div className="rounded-3xl p-5" style={{ background: active ? C.mint : C.surface, border: `1px solid ${active ? C.primary + "44" : C.line}` }}><div className="flex flex-col justify-between gap-4 md:flex-row md:items-center"><div><div className="flex items-center gap-2"><div className="text-[18px] font-extrabold" style={fDisplay}>{active ? "Your listings are live" : "Activate your listing subscription"}</div><span className="rounded-full px-2.5 py-1 text-[10px] font-bold" style={{ ...fBody, background: active ? C.primary : C.goldSoft, color: active ? "#fff" : C.gold }}>{active ? "ACTIVE" : "EXPIRED"}</span></div><div className="mt-1 text-[12px]" style={{ ...fBody, color: C.inkSoft }}>{active ? `Visible to students until ${dateLabel(status.ownerSubscriptionUntil)}` : "Pay KSh 999 for 30 days to show your houses to students."}</div></div><div className="text-right"><div className="text-[24px] font-extrabold" style={{ ...fMono, color: C.primaryDark }}>{listings.length}</div><div className="text-[11px]" style={{ ...fBody, color: C.inkSoft }}>your listings</div></div></div></div>
        {!active && <OwnerPaymentCard status={status} onActivated={handleActivated} showToast={showToast} />}
        {error && <div className="rounded-2xl px-4 py-3 text-[12px] font-medium" style={{ ...fBody, background: C.dangerSoft, color: C.danger }}>{error}</div>}
        <div className="flex items-center justify-between gap-3"><div><div className="text-[16px] font-extrabold" style={fDisplay}>Your houses</div><div className="text-[11px]" style={{ ...fBody, color: C.inkSoft }}>Each listing gets its own system-generated token.</div></div><Button onClick={() => setModal({ listing: null })} disabled={!active}><Plus size={15} /> Upload house</Button></div>
        {!active && listings.length > 0 && <div className="rounded-2xl px-4 py-3 text-[12px]" style={{ ...fBody, background: C.goldSoft, color: C.ink }}>Your existing listings are hidden from students until you renew your KSh 999 subscription.</div>}
        {listings.length === 0 ? <div className="rounded-3xl border border-dashed p-10 text-center" style={{ background: C.surface, borderColor: C.line }}><Building2 size={30} color={C.inkSoft} className="mx-auto" /><div className="mt-3 text-[14px] font-semibold" style={fDisplay}>No houses uploaded yet</div><div className="mt-1 text-[12px]" style={{ ...fBody, color: C.inkSoft }}>Activate your subscription, then upload your first house.</div></div> : <div className="grid gap-3 md:grid-cols-2">{listings.map((listing) => <div key={listing.id} className="rounded-3xl p-4" style={{ background: C.surface, border: `1px solid ${C.line}` }}><div className="flex gap-3"><img src={listing.images?.[0] || placeholder} alt="" className="h-20 w-24 rounded-2xl object-cover" onError={(e) => { e.currentTarget.src = placeholder; }} /><div className="min-w-0 flex-1"><div className="flex items-start justify-between gap-2"><div className="truncate text-[15px] font-extrabold" style={fDisplay}>{listing.name}</div><span className="shrink-0 rounded-full px-2 py-1 text-[10px] font-bold" style={{ ...fBody, background: active ? C.mint : C.dangerSoft, color: active ? C.primaryDark : C.danger }}>{active ? "VISIBLE" : "HIDDEN"}</span></div><div className="mt-1 flex items-center gap-1 text-[11px]" style={{ ...fBody, color: C.inkSoft }}><MapPin size={12} />{listing.location}</div><div className="mt-2 text-[10px]" style={{ ...fMono, color: C.primaryDark }}>TOKEN: {listing.ownerToken || "Not assigned"}</div></div></div><div className="mt-4 flex items-center justify-between gap-2"><div className="text-[10px]" style={{ ...fBody, color: C.inkSoft }}>Visibility until {dateLabel(listing.ownerVisibleUntil || status?.ownerSubscriptionUntil)}</div><div className="flex gap-1.5"><button onClick={() => setModal({ listing })} className="flex items-center gap-1 rounded-xl px-2.5 py-2 text-[11px] font-semibold" style={{ ...fBody, background: C.mint, color: C.primaryDark }}><Pencil size={13} /> Edit</button><button onClick={() => remove(listing)} className="flex items-center gap-1 rounded-xl px-2.5 py-2 text-[11px] font-semibold" style={{ ...fBody, background: C.dangerSoft, color: C.danger }}><Trash2 size={13} /> Delete</button></div></div></div>)}</div>}
      </main>
      {modal && <OwnerListingForm listing={modal.listing} subscriptionUntil={status?.ownerSubscriptionUntil} onClose={() => setModal(null)} onSaved={handleSaved} showToast={showToast} />}
    </div>
  );
}

export default function OwnerPortal({ currentUser, onAuthed, onLogout, showToast }) {
  if (currentUser?.role === "owner") return <OwnerDashboard currentUser={currentUser} onLogout={onLogout} showToast={showToast} />;
  return <OwnerAuth onAuthed={onAuthed} showToast={showToast} />;
}
