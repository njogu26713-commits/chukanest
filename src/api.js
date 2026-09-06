const BASE = (import.meta.env.VITE_API_URL || "/api").replace(/\/+$/, "");

function getToken() {
  return localStorage.getItem("cn_token");
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

function isHtmlResponse(text, contentType) {
  const body = text.trimStart().toLowerCase();
  return contentType.includes("text/html") || body.startsWith("<!doctype html") || body.startsWith("<html");
}

async function parseResponse(res, endpoint) {
  const text = await res.text();
  if (!text) {
    if (!res.ok) throw new Error(`The request failed for ${endpoint} (HTTP ${res.status}).`);
    return null;
  }

  const contentType = (res.headers.get("content-type") || "").toLowerCase();
  if (isHtmlResponse(text, contentType)) {
    throw new Error(
      `The API returned an HTML page for ${endpoint} instead of JSON. ` +
      "If the frontend and backend are deployed separately, set VITE_API_URL to the backend URL ending in /api and rebuild."
    );
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error(`The server returned an invalid response for ${endpoint} (HTTP ${res.status}).`);
  }
}

async function req(method, path, body) {
  const endpoint = `${BASE}${path}`;
  const res = await fetch(endpoint, {
    method,
    headers: { Accept: "application/json", "Content-Type": "application/json", ...authHeaders() },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await parseResponse(res, endpoint);
  if (!res.ok) throw new Error(data?.error || "Request failed");
  return data;
}

// Normalize MongoDB _id → id
const norm = (d) => (d && d._id ? { ...d, id: d._id } : d);
const normArr = (arr) => (Array.isArray(arr) ? arr.map(norm) : arr);

export const api = {
  // Auth
  login: (email, password) => req("POST", "/auth/login", { email, password }),
  signup: (name, email, password, adminCode) => req("POST", "/auth/signup", { name, email, password, adminCode }),
  googleLogin: (credential, adminCode) => req("POST", "/auth/google", { credential, adminCode }),
  getAuthConfig: () => req("GET", "/auth/config"),

  // Hostels
  getHostels: (status) =>
    req("GET", `/hostels${status ? `?status=${status}` : ""}`).then(normArr),
  getPremiumAvailability: () => req("GET", "/hostels/premium-availability"),
  getHostel: (id) => req("GET", `/hostels/${id}`).then(norm),
  createHostel: (data) => req("POST", "/hostels", data).then(norm),
  updateHostel: (id, data) => req("PATCH", `/hostels/${id}`, data).then(norm),
  deleteHostel: (id) => req("DELETE", `/hostels/${id}`),

  // Reviews
  getReviews: (hostelId) => req("GET", `/hostels/${hostelId}/reviews`).then(normArr),
  addReview: (hostelId, data) =>
    req("POST", `/hostels/${hostelId}/reviews`, data).then(norm),
  getFlaggedReviews: () => req("GET", "/reviews/flagged").then(normArr),
  getMyReviews: () => req("GET", "/reviews/mine").then(normArr),
  moderateReview: (id, action) => req("PATCH", `/reviews/${id}`, { action }),

  // AI
  aiSearch: (query) => req("POST", "/ai/search", { query }),
  aiSummarize: (hostelId) => req("POST", `/ai/summarize/${hostelId}`),
  aiRecommend: (data) => req("POST", "/ai/recommend", data),

  // Support
  getSupport: () => req("GET", "/support"),
  submitContact: (data) => req("POST", "/support/contact", data),
  updateSupport: (data) => req("PATCH", "/support", data),

  // Upload
  uploadImages: async (files) => {
    const fd = new FormData();
    for (const f of files) fd.append("images", f);

    const endpoint = `${BASE}/upload/images`;
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { Accept: "application/json", ...authHeaders() },
      body: fd,
    });
    const data = await parseResponse(res, endpoint);
    if (!res.ok) {
      throw new Error(data?.error || `Upload failed (HTTP ${res.status}).`);
    }
    if (!Array.isArray(data?.urls)) throw new Error("The upload API returned no image URLs.");
    return data.urls; // string[]
  },

  // Users
  getUsers: () => req("GET", "/users").then(normArr),
  updateUser: (id, data) => req("PATCH", `/users/${id}`, data).then(norm),
  deleteUser: (id) => req("DELETE", `/users/${id}`),
  getBookmarks: () => req("GET", "/users/me/bookmarks").then(normArr),
  toggleBookmark: (hostelId) => req("POST", `/users/me/bookmarks/${hostelId}`),

  // Premium / M-Pesa
  getPremiumStatus: () => req("GET", "/payments/status"),
  startPremiumPayment: (phone) => req("POST", "/payments/stk", { phone }),
  getPayments: () => req("GET", "/payments").then(normArr),
};

export function saveAuth(token, user) {
  localStorage.setItem("cn_token", token);
  localStorage.setItem("cn_user", JSON.stringify(user));
}

export function loadAuth() {
  const token = localStorage.getItem("cn_token");
  const raw = localStorage.getItem("cn_user");
  if (!token || !raw) return null;
  try {
    return { token, user: JSON.parse(raw) };
  } catch {
    return null;
  }
}

export function clearAuth() {
  localStorage.removeItem("cn_token");
  localStorage.removeItem("cn_user");
}
