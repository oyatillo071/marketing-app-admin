import axios from "axios";
import mockData from "@/data/data.json";
import { API_CONFIG } from "@/config/api";
import { log } from "util";

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Add auth token to requests + mlm_user check
api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    // Login yoki register endpointlariga so‘rov yuborilsa, localStorage tekshirilmaydi
    const isAuthRequest =
      config.url?.includes("/authorization/login") ||
      config.url?.includes("/authorization/register") ||
      config.url?.includes("/auth/login") ||
      config.url?.includes("/auth/register");

    if (!isAuthRequest) {
      if (!localStorage.getItem("mlm-data")) {
        window.location.href = "/login";
        return Promise.reject(new Error("Not authenticated"));
      }
      const token = localStorage.getItem("token");
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    }
  }
  return config;
});

// Add response interceptor for auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (
      error.response &&
      (error.response.status === 401 || error.response.status === 403)
    ) {
      window.location.href = "/login";
    }
    return Promise.reject(error);
  }
);

// Helper to determine if we should use mock data or real API
export const useMockData = () => {
  return !API_CONFIG.API_BASE_URL;
};

// Auth
export const loginUser = async (email: string, password: string) => {
  const response = await api.post("/authorization/login", { email, password });
  localStorage.setItem("token", response.data.token);
  localStorage.setItem("mlm-data", JSON.stringify(response.data.data));
  localStorage.setItem(
    "mlm_role",
    JSON.stringify(response.data.data.user.role)
  );
  return response.data;
};

export const resetPassword = async (phone: string) => {
  // if (useMockData()) {
  //   // Simulate API delay
  //   await new Promise((resolve) => setTimeout(resolve, 500));

  //   // Check if phone exists
  //   const user = mockData.users.find((u) => u.phone === phone);
  //   if (!user) {
  //     throw new Error("Phone number not found");
  //   }

  //   return { success: true, message: "SMS sent with reset code" };
  // }

  const response = await api.post("/auth/reset-password", { phone });
  return response.data;
};

export const verifyResetCode = async (phone: string, code: string) => {
  const response = await api.post("/auth/verify-reset-code", { phone, code });
  return response.data;
};

export const setNewPasswordApi = async (
  email: string,
  code: string,
  newPassword: string
) => {
  if (useMockData()) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500));

    return { success: true, message: "Password updated successfully" };
  }

  const response = await api.post("/auth/set-new-password", {
    email,
    code,
    newPassword,
  });
  return response.data;
};

// Users
export const fetchUsers = async () => {
  const response = await api.get("/users");
  return response.data;
};

export const fetchUserById = async (id: string | number) => {
  const response = await api.get(`/users/${id}`);
  return response.data;
};

export const updateUser = async (id: string, data: any) => {
  const response = await api.put(`/users/${id}`, data);
  return response.data;
};

export const deleteUser = async (id: string) => {
  const response = await api.delete(`/users/${id}`);
  return response.data;
};

// Block a user by id
export const blockUser = async (id: string) => {
  const response = await api.get(`/users/block/${id}`);
  return response.data;
};

// Unblock a user by id
export const unblockUser = async (id: string) => {
  const response = await api.get(`/users/deblock/${id}`);
  return response.data;
};

// Payments
export const fetchPayments = async () => {
  const response = await api.get("/payments");
  return response.data;
};

export async function fetchUserPayments() {
  const { data } = await api(`/payments/user`);
  return data;
}

export async function fetchPaymentById(id: string | number) {
  const { data } = await api(`/payments/${id}`);
  return data;
}

export async function fetchPaymentsByStatus(status: string) {
  const { data } = await api(`/payments/status/${status}`);
  return data;
}
export async function paymentsChekedFn({
  currency,
  how_much,
  coin,
  id,
}: { currency: string; how_much: number; coin: number; id: number }) {
  const { data } = await api.post(`/payments/checked`, {
    currency,
    how_much,
    coin,
    id,
  });
  return data;
}
// // Check payment status and reason
// export async function checkPayment({
//   id,
//   status,
//   reason,
// }: {
//   id: string | number;
//   status: string;
//   reason?: string;
// }) {
//   const { data } = await axios.post(`/payments/checked`, {
//     id,
//     status,
//     reason,
//   });
//   return data;
// }
// Withdrawals
export const fetchWithdrawals = async () => {
  const response = await api.get("/payments");
  return response.data;
};
// Backendga admin id va comment bilan yuborish uchun yangi funksiya
export async function processWithdrawalWithAdmin(
  id: string,
  adminId: string,
  comment: string
) {
  const response = await api.post(`/payments/${id}/process`, {
    adminId,
    comment,
  });
  return response.data;
}

export const processWithdrawal = async (id: string) => {
  const response = await api.post(`/payments/${id}/process`);
  return response.data;
};

export const rejectPayments = async (id: string|number, reason: string) => {
  const response = await api.post(`/payments/rejected`, { id,reason });
  return response.data;
};

// Tariffs
export const fetchTariffs = async () => {
  const response = await api.get("/tariff");
  return response.data;
};

export const createTariff = async (data: any) => {
  const response = await api.post("/tariff/add", data);
  return response.data;
};

export const updateTariff = async (id: string | number, data: any) => {
  console.log("Updating tariff with data:", id, data);

  const response = await api.put(`/tariff/update/${id}`, data);
  return response.data;
};

export const deleteTariff = async (id: string) => {
  const response = await api.delete(`/tariff/${id}`);
  return response.data;
};

// Notifications
export const fetchNotifications = async () => {
  const response = await api.get("/notification");
  return response.data;
};

export const sendNotification = async (data: any, endpoint: string = "") => {
  const url = endpoint === "all" ? "/notification/all" : "/notification";
  const response = await api.post(url, data);
  return response.data;
};

// Statistikaga CRUD funksiyalari
export const fetchStatistics = async () => {
  const response = await api.get("/statistika");
  return response.data || {};
};

export const createStatistics = async (data: any) => {
  const response = await api.post("/statistika", data);

  return response.data;
};

export const updateStatistics = async (id: string, data: any) => {
  const response = await api.put(`/statistika/${id}`, data);
  return response.data;
};

export const deleteStatistics = async (id: string) => {
  const response = await api.delete(`/statistika/${id}`);
  return response.data;
};

// Settings
export const fetchSettings = async () => {
  if (true) {
    await new Promise((resolve) => setTimeout(resolve, 300));
    return mockData.settings;
  }

  const response = await api.get("/settings");
  return response.data;
};

export const updateSettings = async (data: any) => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500));
    return data;
  }

  const response = await api.put("/settings", data);
  return response.data;
};

// Karta qo'shish
export const addCard = async (data: any) => {
  const response = await api.post("/card/add", data);
  console.log(response.data, "309 qator");

  return response.data;
};

// Barcha kartalarni olish
export const fetchCards = async () => {
  const response = await api.get("/card");
  return response.data;
};

// Karta o'chirish
export const deleteCard = async (id: string) => {
  const response = await api.delete(`/card/${id}`);
  return response.data;
};

// Karta tahrirlash (qo'shimcha endpoint kerak bo'lishi mumkin)
export const updateCard = async (id: string, data: any) => {
  const response = await api.put(`/card/${id}`, data);
  return response.data;
};

// Type bo'yicha filter
export const fetchCardsByType = async (type: string) => {
  const response = await api.get(`/card/type/${type}`);
  return response.data;
};

// Davlat bo'yicha filter
export const fetchCardsByCountry = async (countries: string) => {
  const response = await api.get(`/card/cauntries/${countries}`);
  return response.data;
};

// ===================== PRODUCTS ==============================
export const fetchProducts = async () => {
  const response = await api.get("/products");
  return response.data;
};

export const fetchProductsById = async (id: string) => {
  const response = await api.get(`/products/${id}`);
  return response.data;
};

export const createProduct = async (data: any) => {
  const response = await api.post("/products", data);
  return response.data;
};

export const updateProduct = async (id: string, data: any) => {
  const response = await api.patch(`/products/${id}`, data);
  return response.data;
};

export const deleteProduct = async (id: string | number) => {
  const response = await api.delete(`/products/${id}`);
  return response.data;
};

//=========================== Upload image ============================
export const uploadImage = async (file: File) => {
  const formData = new FormData();
  formData.append("file", file);

  // api.upload orqali POST so‘rov yuboriladi
  const res = await api.post("/upload/single", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return res.data; // { url: "...", path: "..." }
};

export const uploadMultImage = async (files: FileList | File[]) => {
  const formData = new FormData();
  Array.from(files).forEach((file) => {
    formData.append("files", file);
  });

  const res = await api.post("/upload/multiple", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  // Agar javobda urls massiv bo'lsa, uni kerakli formatga o'tkazamiz
  if (res.data && Array.isArray(res.data.urls)) {
    return res.data.urls.map((url: string) => ({ photo_url: url }));
  }
  // Agar eski formatda kelsa, uni ham tekshirib qaytaramiz
  if (Array.isArray(res.data)) {
    return res.data.map((url: string) => ({ photo_url: url }));
  }
  return [];
};

// =========================== Admin Section ==============================
export const addAdmin = async (admin: {
  name: string;
  email: string;
  password: string;
  role: "ADMIN" | "SUPERADMIN";
}) => {
  const response = await api.post("/admin/add", admin);
  return response.data;
};

// Barcha adminlarni olish (GET /admin)
export const fetchAdmins = async () => {
  const response = await api.get("/admin");
  return response.data;
};

export const windrawalResponse = async (id: string, data: any) => {
  const res = await api.post(`/windrafals/response/${id}`, data);
  return res.data;
};
