"use client";

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
import { changeUserEmail, type User } from "../queries/users.queries";
import { usersKeys } from "../users.keys";

const changeEmailSchema = z.object({
  email: z.email(),
});

type ChangeEmailValues = z.infer<typeof changeEmailSchema>;

interface ChangeUserEmailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
}

export function ChangeUserEmailDialog({
  open,
  onOpenChange,
  user,
}: ChangeUserEmailDialogProps) {
  const t = useTranslations("users.emailDialog");
  const tUsers = useTranslations("users");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const queryClient = useQueryClient();

  const form = useForm<ChangeEmailValues>({
    resolver: standardSchemaResolver(changeEmailSchema),
    defaultValues: { email: user.email },
  });

  const mutation = useMutation({
    mutationFn: (values: ChangeEmailValues) => changeUserEmail(user.id, values),
    onSuccess: () => {
      toast.success(tUsers("successMessages.emailChanged"));
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
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("email")}</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="name@example.com"
                      {...field}
                    />
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
