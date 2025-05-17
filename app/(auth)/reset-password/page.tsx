"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ArrowLeft, Loader2 } from "lucide-react";
import { resetPassword, verifyResetCode, setNewPasswordApi } from "@/lib/api";
import { toast } from "@/components/ui/use-toast";

enum ResetStep {
  EMAIL_INPUT = 0,
  CODE_VERIFICATION = 1,
  NEW_PASSWORD = 2,
  SUCCESS = 3,
}

export default function ResetPasswordPage() {
  const router = useRouter();
  const [step, setStep] = useState<ResetStep>(ResetStep.EMAIL_INPUT);
  const [email, setEmail] = useState("");
  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await resetPassword(email); // email orqali API chaqiruvi
      setStep(ResetStep.CODE_VERIFICATION);
      toast({
        title: "Kod yuborildi",
        description: "Email manzilingizga tasdiqlash kodi yuborildi.",
      });
    } catch (error: any) {
      toast({
        title: "Xatolik yuz berdi",
        description: error.message || "Kodni yuborishda xatolik yuz berdi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleCodeSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await verifyResetCode(email, code);
      setStep(ResetStep.NEW_PASSWORD);
      toast({
        title: "Kod tasdiqlandi",
        description: "Endi yangi parolingizni kiriting.",
      });
    } catch (error: any) {
      toast({
        title: "Xatolik yuz berdi",
        description: error.message || "Kodni tasdiqlashda xatolik yuz berdi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast({
        title: "Parollar mos kelmaydi",
        description: "Iltimos, parollarni bir xil kiriting.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);

    try {
      await setNewPasswordApi(email, code, newPassword);
      setStep(ResetStep.SUCCESS);
      toast({
        title: "Parol yangilandi",
        description: "Parolingiz muvaffaqiyatli yangilandi.",
      });
    } catch (error: any) {
      toast({
        title: "Xatolik yuz berdi",
        description: error.message || "Parolni yangilashda xatolik yuz berdi.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="container flex h-screen w-screen flex-col items-center justify-center">
      <Link
        href="/login"
        className="absolute left-4 top-4 md:left-8 md:top-8 flex items-center text-sm font-medium text-muted-foreground"
      >
        <ArrowLeft className="mr-2 h-4 w-4" />
        Kirish sahifasiga qaytish
      </Link>

      <Card className="w-full max-w-md">
        {step === ResetStep.EMAIL_INPUT && (
          <>
            <CardHeader>
              <CardTitle>Parolni tiklash</CardTitle>
              <CardDescription>
                Parolni tiklash uchun email manzilingizni kiriting
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleEmailSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="you@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Kodni yuborish
                </Button>
              </CardFooter>
            </form>
          </>
        )}

        {step === ResetStep.CODE_VERIFICATION && (
          <>
            <CardHeader>
              <CardTitle>Kodni tasdiqlash</CardTitle>
              <CardDescription>
                Email manzilingizga yuborilgan kodni kiriting
              </CardDescription>
            </CardHeader>
            <form onSubmit={handleCodeSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">Tasdiqlash kodi</Label>
                  <Input
                    id="code"
                    placeholder="123456"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Kodni tasdiqlash
                </Button>
              </CardFooter>
            </form>
          </>
        )}

        {step === ResetStep.NEW_PASSWORD && (
          <>
            <CardHeader>
              <CardTitle>Yangi parol</CardTitle>
              <CardDescription>Yangi parolingizni kiriting</CardDescription>
            </CardHeader>
            <form onSubmit={handlePasswordSubmit}>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="newPassword">Yangi parol</Label>
                  <Input
                    id="newPassword"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Parolni tasdiqlash</Label>
                  <Input
                    id="confirmPassword"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    required
                  />
                </div>
              </CardContent>
              <CardFooter>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading && (
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  )}
                  Parolni yangilash
                </Button>
              </CardFooter>
            </form>
          </>
        )}

        {step === ResetStep.SUCCESS && (
          <>
            <CardHeader>
              <CardTitle>Parol yangilandi</CardTitle>
              <CardDescription>
                Parolingiz muvaffaqiyatli yangilandi
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-center">
                Endi yangi parolingiz bilan tizimga kirishingiz mumkin
              </p>
            </CardContent>
            <CardFooter>
              <Button className="w-full" onClick={() => router.push("/login")}>
                Kirish sahifasiga o'tish
              </Button>
            </CardFooter>
          </>
        )}
      </Card>
    </div>
  );
}
