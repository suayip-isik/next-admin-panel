"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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
import { Skeleton } from "@/shared/components/ui/skeleton";
import { useCurrentUser } from "@/shared/hooks/use-session-meta";
import { usePermissionGate } from "@/shared/hooks/use-permissions";
import { getErrorMessage } from "@/lib/errors";
import { AUTH_ME_QUERY_KEY } from "@/shared/hooks/use-session-meta";
import { updateProfileEmail } from "../queries/profile.queries";

const profileEmailSchema = z.object({
  email: z.email(),
  current_password: z.string().min(1),
});

type ProfileEmailFormValues = z.infer<typeof profileEmailSchema>;

export function ProfileEmailForm() {
  const t = useTranslations("profile");
  const tErrors = useTranslations("errors");
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useCurrentUser();
  const updateEmailGate = usePermissionGate({ all: ["profile.update.email"] });

  const form = useForm<ProfileEmailFormValues>({
    resolver: standardSchemaResolver(profileEmailSchema),
    defaultValues: { email: "", current_password: "" },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        email: user.email,
        current_password: "",
      });
    }
  }, [form, user]);

  const mutation = useMutation({
    mutationFn: (values: ProfileEmailFormValues) => updateProfileEmail(values),
    onSuccess: () => {
      toast.success(t("successMessages.emailChanged"));
      form.reset({
        email: form.getValues("email"),
        current_password: "",
      });
      void queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
    },
    onError: (error) => toast.error(getErrorMessage(error, tErrors("generic"))),
  });

  if (!updateEmailGate.isAllowed && !updateEmailGate.isLoading) {
    return null;
  }

  if (isLoading || updateEmailGate.isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Change Email</CardTitle>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.email")}</FormLabel>
                  <FormControl>
                    <Input type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="current_password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Password</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      autoComplete="current-password"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? t("form.submitting") : "Update Email"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
