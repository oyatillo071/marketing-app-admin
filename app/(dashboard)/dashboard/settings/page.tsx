"use client"

import type React from "react"

import { useSettings } from "@/hooks/use-settings"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useLanguage } from "@/contexts/language-context"
import { useTheme } from "next-themes"
import { Loader2 } from "lucide-react"
import { useState } from "react"

export default function SettingsPage() {
  const { data: settings, isLoading, updateSettings } = useSettings()
  const { t, language, setLanguage } = useLanguage()
  const { theme, setTheme } = useTheme()
  const [isSaving, setIsSaving] = useState(false)

  const handleSaveGeneral = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    const formData = new FormData(e.currentTarget)
    const updatedSettings = {
      ...settings,
      general: {
        siteName: formData.get("siteName"),
        siteDescription: formData.get("siteDescription"),
        contactEmail: formData.get("contactEmail"),
        supportPhone: formData.get("supportPhone"),
      },
    }

    await updateSettings(updatedSettings)
    setIsSaving(false)
  }

  const handleSaveAppearance = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    const formData = new FormData(e.currentTarget)
    const newTheme = formData.get("theme") as string
    const newLanguage = formData.get("language") as any
    const dateFormat = formData.get("dateFormat") as string

    setTheme(newTheme)
    setLanguage(newLanguage)

    const updatedSettings = {
      ...settings,
      appearance: {
        theme: newTheme,
        language: newLanguage,
        dateFormat,
      },
    }

    await updateSettings(updatedSettings)
    setIsSaving(false)
  }

  const handleSaveNotifications = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    const formData = new FormData(e.currentTarget)
    const updatedSettings = {
      ...settings,
      notifications: {
        emailNotifications: formData.get("emailNotifications") === "on",
        smsNotifications: formData.get("smsNotifications") === "on",
        pushNotifications: formData.get("pushNotifications") === "on",
      },
    }

    await updateSettings(updatedSettings)
    setIsSaving(false)
  }

  const handleSaveSecurity = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsSaving(true)

    const formData = new FormData(e.currentTarget)
    const updatedSettings = {
      ...settings,
      security: {
        twoFactorAuth: formData.get("twoFactorAuth") === "on",
        sessionTimeout: Number(formData.get("sessionTimeout")),
        passwordPolicy: {
          minLength: Number(formData.get("minLength")),
          requireUppercase: formData.get("requireUppercase") === "on",
          requireNumbers: formData.get("requireNumbers") === "on",
          requireSpecialChars: formData.get("requireSpecialChars") === "on",
        },
      },
    }

    await updateSettings(updatedSettings)
    setIsSaving(false)
  }

  if (isLoading) {
    return (
      <div className="flex-1 space-y-4 p-4 md:p-8 pt-6 flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
          <p>{t("loading")}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex-1 space-y-4 p-4 md:p-8 pt-6">
      <div className="flex items-center justify-between">
        <h2 className="text-3xl font-bold tracking-tight">{t("settings")}</h2>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">{t("general")}</TabsTrigger>
          <TabsTrigger value="appearance">{t("appearance")}</TabsTrigger>
          <TabsTrigger value="notifications">{t("notifications")}</TabsTrigger>
          <TabsTrigger value="security">{t("security")}</TabsTrigger>
        </TabsList>

        <TabsContent value="general" className="space-y-4">
          <Card>
            <form onSubmit={handleSaveGeneral}>
              <CardHeader>
                <CardTitle>{t("general")}</CardTitle>
                <CardDescription>{t("generalSettings")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="siteName">{t("siteName")}</Label>
                  <Input id="siteName" name="siteName" defaultValue={settings?.general.siteName} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="siteDescription">{t("siteDescription")}</Label>
                  <Input id="siteDescription" name="siteDescription" defaultValue={settings?.general.siteDescription} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="contactEmail">{t("contactEmail")}</Label>
                  <Input
                    id="contactEmail"
                    name="contactEmail"
                    type="email"
                    defaultValue={settings?.general.contactEmail}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="supportPhone">{t("supportPhone")}</Label>
                  <Input id="supportPhone" name="supportPhone" defaultValue={settings?.general.supportPhone} />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("save")}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <form onSubmit={handleSaveAppearance}>
              <CardHeader>
                <CardTitle>{t("appearance")}</CardTitle>
                <CardDescription>{t("appearanceSettings")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="theme">{t("theme")}</Label>
                  <Select name="theme" defaultValue={theme}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectTheme")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="dark">{t("dark")}</SelectItem>
                      <SelectItem value="light">{t("light")}</SelectItem>
                      <SelectItem value="system">{t("system")}</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="language">{t("language")}</Label>
                  <Select name="language" defaultValue={language}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectLanguage")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="uz">Uzbek</SelectItem>
                      <SelectItem value="en">English</SelectItem>
                      <SelectItem value="ru">Russian</SelectItem>
                      <SelectItem value="kz">Kazakh</SelectItem>
                      <SelectItem value="kg">Kyrgyz</SelectItem>
                      <SelectItem value="tj">Tajik</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="dateFormat">{t("dateFormat")}</Label>
                  <Select name="dateFormat" defaultValue={settings?.appearance.dateFormat}>
                    <SelectTrigger>
                      <SelectValue placeholder={t("selectDateFormat")} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DD-MM-YYYY">DD-MM-YYYY</SelectItem>
                      <SelectItem value="MM-DD-YYYY">MM-DD-YYYY</SelectItem>
                      <SelectItem value="YYYY-MM-DD">YYYY-MM-DD</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("save")}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <form onSubmit={handleSaveNotifications}>
              <CardHeader>
                <CardTitle>{t("notifications")}</CardTitle>
                <CardDescription>{t("notificationSettings")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="emailNotifications">{t("emailNotifications")}</Label>
                  <Switch
                    id="emailNotifications"
                    name="emailNotifications"
                    defaultChecked={settings?.notifications.emailNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="smsNotifications">{t("smsNotifications")}</Label>
                  <Switch
                    id="smsNotifications"
                    name="smsNotifications"
                    defaultChecked={settings?.notifications.smsNotifications}
                  />
                </div>
                <div className="flex items-center justify-between">
                  <Label htmlFor="pushNotifications">{t("pushNotifications")}</Label>
                  <Switch
                    id="pushNotifications"
                    name="pushNotifications"
                    defaultChecked={settings?.notifications.pushNotifications}
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("save")}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <form onSubmit={handleSaveSecurity}>
              <CardHeader>
                <CardTitle>{t("security")}</CardTitle>
                <CardDescription>{t("securitySettings")}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label htmlFor="twoFactorAuth">{t("twoFactorAuth")}</Label>
                  <Switch id="twoFactorAuth" name="twoFactorAuth" defaultChecked={settings?.security.twoFactorAuth} />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sessionTimeout">{t("sessionTimeout")} (minutes)</Label>
                  <Input
                    id="sessionTimeout"
                    name="sessionTimeout"
                    type="number"
                    defaultValue={settings?.security.sessionTimeout}
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="text-lg font-medium">{t("passwordPolicy")}</h3>
                  <div className="space-y-4 pl-4">
                    <div className="space-y-2">
                      <Label htmlFor="minLength">{t("minLength")}</Label>
                      <Input
                        id="minLength"
                        name="minLength"
                        type="number"
                        defaultValue={settings?.security.passwordPolicy.minLength}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireUppercase">{t("requireUppercase")}</Label>
                      <Switch
                        id="requireUppercase"
                        name="requireUppercase"
                        defaultChecked={settings?.security.passwordPolicy.requireUppercase}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireNumbers">{t("requireNumbers")}</Label>
                      <Switch
                        id="requireNumbers"
                        name="requireNumbers"
                        defaultChecked={settings?.security.passwordPolicy.requireNumbers}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label htmlFor="requireSpecialChars">{t("requireSpecialChars")}</Label>
                      <Switch
                        id="requireSpecialChars"
                        name="requireSpecialChars"
                        defaultChecked={settings?.security.passwordPolicy.requireSpecialChars}
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" disabled={isSaving}>
                  {isSaving && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                  {t("save")}
                </Button>
              </CardFooter>
            </form>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
