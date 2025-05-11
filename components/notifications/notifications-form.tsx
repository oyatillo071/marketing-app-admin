"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";

import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLanguage } from "@/contexts/language-context";
import { useNotifications } from "@/hooks/use-notifications";

export function NotificationsForm() {
  const { t } = useLanguage();
  const { sendNotification } = useNotifications();

  const formSchema = z.object({
    title: z.string().min(2, {
      message: "Title must be at least 2 characters.",
    }),
    message: z.string().min(10, {
      message: "Message must be at least 10 characters.",
    }),
    recipient: z.string({
      required_error: "Please select a recipient.",
    }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      title: "",
      message: "",
      recipient: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    sendNotification(values);
    form.reset();
  }

  return (
    <div className="max-w-full ">
      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6 bg-white rounded-lg shadow-md p-4  sm:p-6 md:p-8"
        >
          <div className="grid gap-4 grid-cols-1 md:grid-cols-2">
            {/* Title Field */}
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("title")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("notificationTitle")}
                      {...field}
                      className="w-full"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {/* Recipient Field */}
            <FormField
              control={form.control}
              name="recipient"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("recipient")}</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="w-full">
                        <SelectValue placeholder={t("selectRecipient")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="all">{t("allUsers")}</SelectItem>
                      <SelectItem value="premium">
                        {t("premiumUsers")}
                      </SelectItem>
                      <SelectItem value="standard">
                        {t("standardUsers")}
                      </SelectItem>
                      <SelectItem value="basic">{t("basicUsers")}</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>{t("recipientDescription")}</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          {/* Message Field */}
          <FormField
            control={form.control}
            name="message"
            render={({ field }) => (
              <FormItem>
                <FormLabel>{t("message")}</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder={t("notificationMessage")}
                    className="resize-none w-full"
                    rows={5}
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Submit Button */}
          <Button
            type="submit"
            className="w-full bg-button-bg hover:bg-button-hover py-2"
          >
            {t("send")}
          </Button>
        </form>
      </Form>
    </div>
  );
}
