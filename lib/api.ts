import axios from "axios"
import mockData from "@/data/data.json"
import { API_CONFIG } from "@/config/api"

// Create axios instance
const api = axios.create({
  baseURL: API_CONFIG.API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
})

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem("token")
  if (token) {
    config.headers.Authorization = `Bearer ${token}`
  }
  return config
})

// Helper to determine if we should use mock data or real API
export const useMockData = () => {
  return !API_CONFIG.API_BASE_URL
}

// Auth
export const loginUser = async (email: string, password: string) => {
  if (useMockData()) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // For demo purposes, any credentials will work
    if (email && password) {
      // Generate a mock token
      const token = `mock-token-${Date.now()}`
      localStorage.setItem("token", token)

      return {
        id: "admin",
        email,
        name: "Admin User",
        role: "admin",
        token,
      }
    }

    throw new Error("Invalid credentials")
  }

  const response = await api.post("/auth/login", { email, password })
  localStorage.setItem("token", response.data.token)
  return response.data
}

export const resetPassword = async (phone: string) => {
  if (useMockData()) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Check if phone exists
    const user = mockData.users.find((u) => u.phone === phone)
    if (!user) {
      throw new Error("Phone number not found")
    }

    return { success: true, message: "SMS sent with reset code" }
  }

  const response = await api.post("/auth/reset-password", { phone })
  return response.data
}

export const verifyResetCode = async (phone: string, code: string) => {
  if (useMockData()) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Any 6-digit code will work for demo
    if (code.length === 6) {
      return { success: true, message: "Code verified" }
    }

    throw new Error("Invalid code")
  }

  const response = await api.post("/auth/verify-reset-code", { phone, code })
  return response.data
}

export const setNewPassword = async (phone: string, code: string, newPassword: string) => {
  if (useMockData()) {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 500))

    return { success: true, message: "Password updated successfully" }
  }

  const response = await api.post("/auth/set-new-password", { phone, code, newPassword })
  return response.data
}

// Users
export const fetchUsers = async () => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockData.users
  }

  const response = await api.get("/users")
  return response.data
}

export const fetchUserById = async (id: string) => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    const user = mockData.users.find((u) => u.id === id)

    if (!user) {
      throw new Error("User not found")
    }

    return user
  }

  const response = await api.get(`/users/${id}`)
  return response.data
}

export const updateUser = async (id: string, data: any) => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { ...data, id }
  }

  const response = await api.put(`/users/${id}`, data)
  return response.data
}

export const deleteUser = async (id: string) => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return { success: true }
  }

  const response = await api.delete(`/users/${id}`)
  return response.data
}

// Payments
export const fetchPayments = async () => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockData.payments
  }

  const response = await api.get("/payments")
  return response.data
}

// Withdrawals
export const fetchWithdrawals = async () => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockData.withdrawals
  }

  const response = await api.get("/withdrawals")
  return response.data
}

export const processWithdrawal = async (id: string) => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { id, status: "To'langan", processedAt: new Date().toISOString() }
  }

  const response = await api.post(`/withdrawals/${id}/process`)
  return response.data
}

export const rejectWithdrawal = async (id: string, reason: string) => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { id, status: "Rad etilgan", rejectedAt: new Date().toISOString(), reason }
  }

  const response = await api.post(`/withdrawals/${id}/reject`, { reason })
  return response.data
}

// Tariffs
export const fetchTariffs = async () => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockData.tariffs
  }

  const response = await api.get("/tariffs")
  return response.data
}

export const createTariff = async (data: any) => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      id: `TARIFF${Date.now()}`,
      ...data,
      status: "Faol",
    }
  }

  const response = await api.post("/tariffs", data)
  return response.data
}

export const updateTariff = async (id: string, data: any) => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return { ...data, id }
  }

  const response = await api.put(`/tariffs/${id}`, data)
  return response.data
}

export const deleteTariff = async (id: string) => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return { success: true }
  }

  const response = await api.delete(`/tariffs/${id}`)
  return response.data
}

// Notifications
export const fetchNotifications = async () => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockData.notifications
  }

  const response = await api.get("/notifications")
  return response.data
}

export const sendNotification = async (data: any) => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return {
      id: `NOT${Date.now()}`,
      ...data,
      date: new Date().toISOString(),
      status: "Yuborilgan",
    }
  }

  const response = await api.post("/notifications", data)
  return response.data
}

// Statistics
export const fetchStatistics = async () => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return mockData.statistics
  }

  const response = await api.get("/statistics")
  return response.data
}

// Settings
export const fetchSettings = async () => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 300))
    return mockData.settings
  }

  const response = await api.get("/settings")
  return response.data
}

export const updateSettings = async (data: any) => {
  if (useMockData()) {
    await new Promise((resolve) => setTimeout(resolve, 500))
    return data
  }

  const response = await api.put("/settings", data)
  return response.data
}
