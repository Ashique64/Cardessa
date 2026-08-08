import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

/**
 * Axios instance pre-configured with the Django API base URL.
 *
 * Auth: JWT Bearer tokens (access + refresh)
 *   - Access token: short-lived (30 min), sent in Authorization header
 *   - Refresh token: long-lived (7 days), used to get a new access token
 */
const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// ─── Request interceptor — attach access token ─────────────────────────────
apiClient.interceptors.request.use(
  (config) => {
    if (typeof window !== "undefined") {
      const token = localStorage.getItem("access_token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ─── Response interceptor — auto-refresh on 401 ───────────────────────────
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and we haven't already retried this request
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      const refreshToken = localStorage.getItem("refresh_token");
      if (refreshToken) {
        try {
          const res = await axios.post(`${API_URL}/auth/token/refresh/`, {
            refresh: refreshToken,
          });
          const newAccess = res.data.access;
          localStorage.setItem("access_token", newAccess);
          originalRequest.headers.Authorization = `Bearer ${newAccess}`;
          return apiClient(originalRequest);
        } catch {
          // Refresh failed — clear tokens and redirect to login
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
          localStorage.removeItem("auth_user");
          if (typeof window !== "undefined") window.location.href = "/login";
        }
      } else {
        if (typeof window !== "undefined") window.location.href = "/login";
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;

// ─── API helpers ────────────────────────────────────────────────────────────

export const authApi = {
  /** Email + password login → { access, refresh, user } */
  login: (data) => apiClient.post("/auth/login/", data),

  /** Register new user → { access, refresh, user } */
  register: (data) => apiClient.post("/auth/register/", data),

  /** Logout (clears server-side session if any) */
  logout: () => apiClient.post("/auth/logout/"),

  /** Exchange Google OAuth access_token for Cardessa JWT pair */
  googleLogin: (accessToken) =>
    apiClient.post("/auth/social/google/token/", { access_token: accessToken }),

  /** Get current user details */
  me: () => apiClient.get("/auth/user/"),

  /** Refresh access token manually */
  refreshToken: (refresh) =>
    axios.post(`${API_URL}/auth/token/refresh/`, { refresh }),
};

export const templatesApi = {
  list: (params) => apiClient.get("/templates/", { params }),
  detail: (slug) => apiClient.get(`/templates/${slug}/`),
};

export const invitationsApi = {
  list: () => apiClient.get("/invitations/"),
  create: (data) => apiClient.post("/invitations/", data),
  get: (slug) => apiClient.get(`/invitations/${slug}/`),
  getPublic: (slug) => apiClient.get(`/invitations/${slug}/`),
  update: (slug, data) => apiClient.patch(`/invitations/${slug}/`, data),
  delete: (slug) => apiClient.delete(`/invitations/${slug}/`),
};

export const ordersApi = {
  plans: () => apiClient.get("/orders/plans/"),
  create: (planId) => apiClient.post("/orders/create/", { plan_id: planId }),
  verify: (data) => apiClient.post("/orders/verify/", data),
  checkPlan: () => apiClient.get("/orders/check-plan/"),
};

export const mediaApi = {
  upload: (file, type) => {
    const form = new FormData();
    form.append("file", file);
    form.append("type", type);
    return apiClient.post("/media/upload/", form, {
      headers: { "Content-Type": "multipart/form-data" },
    });
  },
};
