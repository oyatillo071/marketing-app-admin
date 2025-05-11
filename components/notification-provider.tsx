"use client"

import type React from "react"
import { createContext, useContext, useState, useEffect } from "react"
import { useToast } from "@/components/ui/use-toast"
import { useLanguage } from "@/contexts/language-context"

type Notification = {
  id: string
  title: string
  message: string
  type: "info" | "success" | "warning" | "error"
  timestamp: Date
}

type NotificationContextType = {
  notifications: Notification[]
  addNotification: (notification: Omit<Notification, "id" | "timestamp">) => void
  removeNotification: (id: string) => void
  clearNotifications: () => void
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined)

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const { toast } = useToast()
  const { t } = useLanguage()

  const addNotification = (notification: Omit<Notification, "id" | "timestamp">) => {
    const id = `notification-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    const newNotification = {
      ...notification,
      id,
      timestamp: new Date(),
    }
    setNotifications((prev) => [...prev, newNotification])

    // Also show a toast
    toast({
      title: notification.title,
      description: notification.message,
      variant: notification.type === "error" ? "destructive" : "default",
    })
  }

  const removeNotification = (id: string) => {
    setNotifications((prev) => prev.filter((notification) => notification.id !== id))
  }

  const clearNotifications = () => {
    setNotifications([])
  }

  // Simulate receiving notifications
  useEffect(() => {
    // Demo notification after 5 seconds
    const timer = setTimeout(() => {
      addNotification({
        title: t("newNotification"),
        message: t("newNotificationMessage"),
        type: "info",
      })
    }, 5000)

    return () => clearTimeout(timer)
  }, [t])

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        addNotification,
        removeNotification,
        clearNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  )
}

export const useNotification = () => {
  const context = useContext(NotificationContext)
  if (context === undefined) {
    throw new Error("useNotification must be used within a NotificationProvider")
  }
  return context
}
