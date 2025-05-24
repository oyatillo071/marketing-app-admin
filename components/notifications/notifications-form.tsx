"use client";

import { useState } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { useLanguage } from "@/contexts/language-context";
import { useNotifications } from "@/hooks/use-notifications";

// Single user schema
const singleSchema = z.object({
  email: z.string().email({ message: "Email noto'g'ri" }),
  title: z.string().min(2, {
    message: "Sarlavha kamida 2 ta belgidan iborat bo'lishi kerak.",
  }),
  description: z.string().min(5, {
    message: "Xabar kamida 5 ta belgidan iborat bo'lishi kerak.",
  }),
});

// All users schema
const allSchema = z.object({
  title: z.string().min(2, {
    message: "Sarlavha kamida 2 ta belgidan iborat bo'lishi kerak.",
  }),
  description: z.string().min(5, {
    message: "Xabar kamida 5 ta belgidan iborat bo'lishi kerak.",
  }),
});

export function NotificationsForm() {
  const { t } = useLanguage();
  const { sendNotification, sendNotificationAll } = useNotifications();
  const [tab, setTab] = useState<"single" | "all">("single");

  // Single user form state
  const singleForm = useForm<z.infer<typeof singleSchema>>({
    resolver: zodResolver(singleSchema),
    defaultValues: {
      email: "",
      title: "",
      description: "",
    },
  });

  // All users form state
  const allForm = useForm<z.infer<typeof allSchema>>({
    resolver: zodResolver(allSchema),
    defaultValues: {
      title: "",
      description: "",
    },
  });

  // Single user submit
  async function onSubmitSingle(values: z.infer<typeof singleSchema>) {
    await sendNotification({
      email: values.email,
      title: values.title,
      description: values.description,
    });
    singleForm.reset();
  }

  // All users submit
  async function onSubmitAll(values: z.infer<typeof allSchema>) {
    await sendNotificationAll({
      title: values.title,
      description: values.description,
    });
    allForm.reset();
  }

  return (
    <div className="max-w-full">
      <Tabs
        value={tab}
        onValueChange={(v) => setTab(v as "single" | "all")}
        className="w-full"
      >
        <TabsList className="mb-4 flex w-full">
          <TabsTrigger value="single" className="flex-1">
            {t("sendToOne") || "Bitta foydalanuvchiga"}
          </TabsTrigger>
          <TabsTrigger value="all" className="flex-1">
            {t("sendToAll") || "Barchaga"}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="single">
          <Form {...singleForm}>
            <form
              onSubmit={singleForm.handleSubmit(onSubmitSingle)}
              className="space-y-6 bg-white dark:bg-[#18181b] rounded-lg shadow-md p-4 sm:p-6 md:p-8 w-full"
            >
              <FormField
                control={singleForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">
                      {t("email")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("email")}
                        {...field}
                        className="w-full bg-white dark:bg-[#23232b] dark:text-gray-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={singleForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">
                      {t("title")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("notificationTitle")}
                        {...field}
                        className="w-full bg-white dark:bg-[#23232b] dark:text-gray-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={singleForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">
                      {t("description")}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("notificationMessage")}
                        className="resize-none w-full bg-white dark:bg-[#23232b] dark:text-gray-100"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-button-bg hover:bg-button-hover py-2 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {t("send") || "Yuborish"}
              </Button>
            </form>
          </Form>
        </TabsContent>

        <TabsContent value="all">
          <Form {...allForm}>
            <form
              onSubmit={allForm.handleSubmit(onSubmitAll)}
              className="space-y-6 bg-white dark:bg-[#18181b] rounded-lg shadow-md p-4 sm:p-6 md:p-8 w-full"
            >
              <FormField
                control={allForm.control}
                name="title"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">
                      {t("title")}
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("notificationTitle")}
                        {...field}
                        className="w-full bg-white dark:bg-[#23232b] dark:text-gray-100"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={allForm.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="dark:text-gray-200">
                      {t("description")}
                    </FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder={t("notificationMessage")}
                        className="resize-none w-full bg-white dark:bg-[#23232b] dark:text-gray-100"
                        rows={5}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button
                type="submit"
                className="w-full bg-button-bg hover:bg-button-hover py-2 dark:bg-blue-600 dark:hover:bg-blue-700"
              >
                {t("sendToAll") || "Barchaga yuborish"}
              </Button>
            </form>
          </Form>
        </TabsContent>
      </Tabs>
    </div>
  );
}
