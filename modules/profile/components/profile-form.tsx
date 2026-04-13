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
import { updateProfileBasic } from "../queries/profile.queries";

const profileSchema = z.object({
  full_name: z.string().optional(),
  username: z.string().optional(),
});

type ProfileFormValues = z.infer<typeof profileSchema>;

export function ProfileForm() {
  const t = useTranslations("profile");
  const tErrors = useTranslations("errors");
  const queryClient = useQueryClient();
  const { data: user, isLoading } = useCurrentUser();
  const updateBasicGate = usePermissionGate({ all: ["profile.update.basic"] });

  const form = useForm<ProfileFormValues>({
    resolver: standardSchemaResolver(profileSchema),
    defaultValues: { full_name: "", username: "" },
  });

  useEffect(() => {
    if (user) {
      form.reset({
        full_name: user.full_name ?? "",
        username: user.username ?? "",
      });
    }
  }, [user, form]);

  const mutation = useMutation({
    mutationFn: (values: ProfileFormValues) =>
      updateProfileBasic({
        full_name: values.full_name || null,
        username: values.username || null,
      }),
    onSuccess: () => {
      toast.success(t("successMessages.updated"));
      void queryClient.invalidateQueries({ queryKey: ["auth", "me"] });
    },
    onError: (error) => toast.error(getErrorMessage(error, tErrors("generic"))),
  });

  if (isLoading || updateBasicGate.isLoading) {
    return (
      <Card>
        <CardHeader>
          <Skeleton className="h-5 w-32" />
        </CardHeader>
        <CardContent className="space-y-4">
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </CardContent>
      </Card>
    );
  }

  if (!updateBasicGate.isAllowed) {
    return null;
  }

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
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.fullName")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.fullNamePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.username")}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder={t("form.usernamePlaceholder")}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end">
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? t("form.submitting") : t("form.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
