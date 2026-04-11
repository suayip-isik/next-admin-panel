"use client";

import { useForm } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { getErrorMessage } from "@/lib/errors";
import { fetchRoles } from "@/modules/roles/queries/roles.queries";
import { rolesKeys } from "@/modules/roles/roles.keys";
import { createAdminUser } from "../queries/users.queries";
import { usersKeys } from "../users.keys";

const createAdminUserSchema = z.object({
  email: z.email(),
  role_name: z.string().min(1),
  full_name: z.string().optional(),
  username: z.string().optional(),
});

type CreateAdminUserValues = z.infer<typeof createAdminUserSchema>;

interface CreateAdminUserDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CreateAdminUserDialog({
  open,
  onOpenChange,
}: CreateAdminUserDialogProps) {
  const t = useTranslations("users.createDialog");
  const tCommon = useTranslations("common");
  const tUsers = useTranslations("users");
  const tErrors = useTranslations("errors");
  const queryClient = useQueryClient();

  const form = useForm<CreateAdminUserValues>({
    resolver: standardSchemaResolver(createAdminUserSchema),
    defaultValues: {
      email: "",
      role_name: "",
      full_name: "",
      username: "",
    },
  });

  const { data: roles } = useQuery({
    queryKey: rolesKeys.list(),
    queryFn: fetchRoles,
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: (values: CreateAdminUserValues) =>
      createAdminUser({
        email: values.email,
        role_name: values.role_name,
        full_name: values.full_name || null,
        username: values.username || null,
      }),
    onSuccess: () => {
      toast.success(tUsers("successMessages.created"));
      form.reset();
      onOpenChange(false);
      void queryClient.invalidateQueries({ queryKey: usersKeys.all });
    },
    onError: (error) => toast.error(getErrorMessage(error, tErrors("generic"))),
  });

  return (
    <Dialog
      open={open}
      onOpenChange={(nextOpen) => {
        onOpenChange(nextOpen);
        if (!nextOpen) form.reset();
      }}
    >
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
                      placeholder="admin@example.com"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="role_name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("role")}</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("rolePlaceholder")} />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {(roles ?? []).map((role) => (
                        <SelectItem key={role.id} value={role.name}>
                          {role.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
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
