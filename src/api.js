const BASE = "/api";

function getToken() {
  return localStorage.getItem("cn_token");
}

function authHeaders() {
  const token = getToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
}

async function req(method, path, body) {
  const res = await fetch(`${BASE}${path}`, {
    method,
    headers: { "Content-Type": "application/json", ...authHeaders() },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
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
  updateSupport: (data) => req("PATCH", "/support", data),

  // Upload
  uploadImages: async (files) => {
    const fd = new FormData();
    for (const f of files) fd.append("images", f);
    const res = await fetch(`${BASE}/upload/images`, {
      method: "POST",
      headers: authHeaders(),
      body: fd,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Upload failed");
    return data.urls; // string[]
  },

  // Users
  getUsers: () => req("GET", "/users").then(normArr),
  updateUser: (id, data) => req("PATCH", `/users/${id}`, data).then(norm),
  deleteUser: (id) => req("DELETE", `/users/${id}`),
  getBookmarks: () => req("GET", "/users/me/bookmarks").then(normArr),
  toggleBookmark: (hostelId) => req("POST", `/users/me/bookmarks/${hostelId}`),
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
