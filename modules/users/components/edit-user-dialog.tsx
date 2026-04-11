"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
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
import { getErrorMessage } from "@/lib/errors";
import { updateUser, type User } from "../queries/users.queries";
import { usersKeys } from "../users.keys";

const editUserSchema = z.object({
  full_name: z.string().optional(),
  username: z.string().optional(),
});

type EditUserValues = z.infer<typeof editUserSchema>;

interface EditUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function EditUserDialog({
  open,
  onOpenChange,
  user,
}: EditUserDialogProps) {
  const t = useTranslations("users.editDialog");
  const tUsers = useTranslations("users");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const queryClient = useQueryClient();

  const form = useForm<EditUserValues>({
    resolver: standardSchemaResolver(editUserSchema),
    defaultValues: {
      full_name: user.full_name ?? "",
      username: user.username ?? "",
    },
  });

  useEffect(() => {
    form.reset({
      full_name: user.full_name ?? "",
      username: user.username ?? "",
    });
  }, [form, user]);

  const mutation = useMutation({
    mutationFn: (values: EditUserValues) =>
      updateUser(user.id, {
        full_name: values.full_name || null,
        username: values.username || null,
      }),
    onSuccess: () => {
      toast.success(tUsers("successMessages.updated"));
      void queryClient.invalidateQueries({
        queryKey: usersKeys.detail(user.id),
      });
      void queryClient.invalidateQueries({ queryKey: usersKeys.all });
      onOpenChange(false);
    },
    onError: (error) => toast.error(getErrorMessage(error, tErrors("generic"))),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t("title")}</DialogTitle>
          <DialogDescription>{t("description")}</DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="full_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("fullName")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("fullNamePlaceholder")} {...field} />
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
                  <FormLabel>{t("username")}</FormLabel>
                  <FormControl>
                    <Input placeholder={t("usernamePlaceholder")} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? t("submitting") : t("submit")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
