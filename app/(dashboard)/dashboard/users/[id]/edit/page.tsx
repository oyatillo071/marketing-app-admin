"use client"

import React from "react"

import { useUser } from "@/hooks/use-users"
import { useLanguage } from "@/contexts/language-context"
import { Button } from "@/components/ui/button"
import { Skeleton } from "@/components/ui/skeleton"
import { ArrowLeft, Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { useState } from "react"
import { useUsers } from "@/hooks/use-users"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"

export default function UserEditPage({ params }: { params: { id: string } }) {
  const { t } = useLanguage()
  const router = useRouter()
  const { data: user, isLoading } = useUser(params.id)
  const { updateUser } = useUsers()
  const [isSaving, setIsSaving] = useState(false)
  const [formData, setFormData] = useState<any>(null)

  // Initialize form data when user data is loaded
  useState
  React.useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        phone: user.phone,
        email: user.email,
        tariff: user.tariff,
        status: user.status === "Faol",
        balance: user.balance,
      })
    }
  }, [user])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    const updatedUser = {
      ...formData,
      status: formData.status ? "Faol" : "Nofaol",
    }

    try {
      await updateUser(params.id, updatedUser)
      router.push(`/dashboard/users/${params.id}`)
    } catch (error) {
      console.error("Error updating user:", error)
    } finally {
      setIsSaving(false)
    }
  }

  const handleChange = (field: string, value: any) => {
    setFormData((prev: any) => ({
      ...prev,
      [field]: value,
    }))
  }

  if (isLoading || !formData) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back")}
          </Button>
        </div>
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-24" />
        </div>
        <Skeleton className="h-[500px] w-full" />
      </div>
    )
  }

  if (!user) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" onClick={() => router.back()}>
            <ArrowLeft className="mr-2 h-4 w-4" />
            {t("back")}
          </Button>
        </div>
        <div className="flex flex-col items-center justify-center h-[50vh]">
          <h2 className="text-2xl font-bold">{t("userNotFound")}</h2>
          <p className="text-muted-foreground">{t("userNotFoundDescription")}</p>
          <Button className="mt-4" onClick={() => router.push("/dashboard/users")}>
            {t("backToUsers")}
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          {t("back")}
        </Button>
      </div>
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">
          {t("edit")} {t("user")}
        </h2>
      </div>

      <form onSubmit={handleSubmit}>
        <Card>
          <CardHeader>
            <CardTitle>{t("userDetails")}</CardTitle>
            <CardDescription>{t("editUserDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">{t("name")}</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => handleChange("name", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">{t("phone")}</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleChange("phone", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleChange("email", e.target.value)}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tariff">{t("tariff")}</Label>
                <Select value={formData.tariff} onValueChange={(value) => handleChange("tariff", value)}>
                  <SelectTrigger id="tariff">
                    <SelectValue placeholder={t("selectTariff")} />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Premium">Premium</SelectItem>
                    <SelectItem value="Standard">Standard</SelectItem>
                    <SelectItem value="Basic">Basic</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="balance">{t("balance")}</Label>
                <Input
                  id="balance"
                  type="number"
                  step="0.01"
                  value={formData.balance}
                  onChange={(e) => handleChange("balance", Number(e.target.value))}
                  required
                />
              </div>
              <div className="flex items-center justify-between space-y-0 pt-5">
                <Label htmlFor="status">{t("active")}</Label>
                <Switch
                  id="status"
                  checked={formData.status}
                  onCheckedChange={(checked) => handleChange("status", checked)}
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex justify-between">
            <Button variant="outline" type="button" onClick={() => router.back()}>
              {t("cancel")}
            </Button>
            <Button type="submit" disabled={isSaving}>
              {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {t("save")}
            </Button>
          </CardFooter>
        </Card>
      </form>
    </div>
  )
}
