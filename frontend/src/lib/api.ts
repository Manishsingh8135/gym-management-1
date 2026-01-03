import axios from "axios";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("accessToken");
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If 401 and not already retrying, try to refresh token
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const refreshToken = localStorage.getItem("refreshToken");
        if (refreshToken) {
          const response = await axios.post(`${API_URL}/auth/refresh`, {
            refreshToken,
          });

          const { accessToken, refreshToken: newRefreshToken } = response.data.data;
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", newRefreshToken);

          originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          return api(originalRequest);
        }
      } catch (refreshError) {
        // Refresh failed, redirect to login
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        window.location.href = "/login";
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

// Auth API
export const authApi = {
  login: (email: string, password: string) =>
    api.post("/auth/login", { email, password }),
  register: (data: { email: string; password: string; firstName: string; lastName: string }) =>
    api.post("/auth/register", data),
  logout: () => api.post("/auth/logout"),
  me: () => api.get("/auth/me"),
  refreshToken: (refreshToken: string) =>
    api.post("/auth/refresh", { refreshToken }),
};

// Members API
export const membersApi = {
  getAll: (params?: { page?: number; limit?: number; status?: string; search?: string }) =>
    api.get("/members", { params }),
  getById: (id: string) => api.get(`/members/${id}`),
  create: (data: any) => api.post("/members", data),
  update: (id: string, data: any) => api.patch(`/members/${id}`, data),
  delete: (id: string) => api.delete(`/members/${id}`),
};

// Dashboard API
export const dashboardApi = {
  getStats: () => api.get("/dashboard/stats"),
  getRecentActivity: () => api.get("/dashboard/recent-activity"),
};

// Plans API
export const plansApi = {
  getAll: () => api.get("/plans"),
  getById: (id: string) => api.get(`/plans/${id}`),
  create: (data: any) => api.post("/plans", data),
  update: (id: string, data: any) => api.patch(`/plans/${id}`, data),
};

// Memberships API
export const membershipsApi = {
  getAll: (params?: { memberId?: string; status?: string }) =>
    api.get("/memberships", { params }),
  create: (data: any) => api.post("/memberships", data),
  renew: (id: string, data: any) => api.post(`/memberships/${id}/renew`, data),
  freeze: (id: string, data: any) => api.post(`/memberships/${id}/freeze`, data),
  unfreeze: (id: string) => api.post(`/memberships/${id}/unfreeze`),
};

// Payments API
export const paymentsApi = {
  getAll: (params?: { memberId?: string; status?: string }) =>
    api.get("/payments", { params }),
  create: (data: any) => api.post("/payments", data),
  getById: (id: string) => api.get(`/payments/${id}`),
};

// Classes API
export const classesApi = {
  getAll: () => api.get("/classes"),
  getSchedule: (params?: { branchId?: string; startDate?: string; endDate?: string }) =>
    api.get("/schedules", { params }),
  book: (data: { scheduleId: string; memberId: string; classDate: string }) =>
    api.post("/bookings", data),
};

// Attendance API
export const attendanceApi = {
  checkIn: (data: { qrCode: string; branchId: string }) =>
    api.post("/attendance/scan", { ...data, type: "CHECK_IN" }),
  checkOut: (data: { qrCode: string; branchId: string }) =>
    api.post("/attendance/scan", { ...data, type: "CHECK_OUT" }),
  getToday: () => api.get("/attendance/current"),
};

export default api;
