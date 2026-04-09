"use client";

import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { getErrorMessage } from "@/lib/errors";
import { changePassword } from "../queries/profile.queries";

function createPasswordSchema(
  t: (key: string, params?: Record<string, string | number>) => string,
) {
  return z
    .object({
      new_password: z
        .string()
        .min(8, { error: t("passwordMinLength", { min: 8 }) }),
      confirm_password: z.string().min(1),
    })
    .refine((data) => data.new_password === data.confirm_password, {
      error: t("passwordMismatch"),
      path: ["confirm_password"],
    });
}

type PasswordFormValues = { new_password: string; confirm_password: string };

export function ChangePasswordForm() {
  const t = useTranslations("profile.security.password");
  const tProfile = useTranslations("profile");
  const tValidation = useTranslations("validation");
  const tErrors = useTranslations("errors");

  const schema = createPasswordSchema(tValidation);

  const form = useForm<PasswordFormValues>({
    resolver: standardSchemaResolver(schema),
    defaultValues: { new_password: "", confirm_password: "" },
  });

  const mutation = useMutation({
    mutationFn: (values: PasswordFormValues) =>
      changePassword(values.new_password),
    onSuccess: () => {
      toast.success(tProfile("successMessages.passwordChanged"));
      form.reset();
    },
    onError: (error) => toast.error(getErrorMessage(error, tErrors("generic"))),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{t("title")}</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="new_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("new")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="confirm_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("confirm")}</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="new-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? t("submitting") : t("submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
