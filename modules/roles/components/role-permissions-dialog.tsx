"use client";

import { useEffect } from "react";
import { Controller, useForm } from "react-hook-form";
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
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Button } from "@/shared/components/ui/button";
import {
  PERMISSIONS,
  PERMISSION_LABELS,
  type Permission,
} from "@/shared/utils/permissions";
import { getErrorMessage } from "@/lib/errors";
import {
  replaceRolePermissions,
  type Role,
} from "@/modules/roles/queries/roles.queries";
import { rolesKeys } from "@/modules/roles/roles.keys";

const permissionsSchema = z.object({
  permissions: z.array(
    z.enum(PERMISSIONS as unknown as readonly [Permission, ...Permission[]]),
  ),
});

type PermissionsValues = z.infer<typeof permissionsSchema>;

interface RolePermissionsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
}

export function RolePermissionsDialog({
  open,
  onOpenChange,
  role,
}: RolePermissionsDialogProps) {
  const t = useTranslations("roles");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const queryClient = useQueryClient();
  const form = useForm<PermissionsValues>({
    resolver: standardSchemaResolver(permissionsSchema),
    defaultValues: {
      permissions: (role.permissions ?? []) as Permission[],
    },
  });

  useEffect(() => {
    form.reset({
      permissions: (role.permissions ?? []) as Permission[],
    });
  }, [form, role, open]);

  const mutation = useMutation({
    mutationFn: (values: PermissionsValues) =>
      replaceRolePermissions(role.id, values),
    onSuccess: () => {
      toast.success(t("successMessages.updated"));
      void queryClient.invalidateQueries({ queryKey: rolesKeys.all });
      onOpenChange(false);
    },
    onError: (error) => toast.error(getErrorMessage(error, tErrors("generic"))),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Replace Permissions</DialogTitle>
          <DialogDescription>
            Replace the entire permission set for this role.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="permissions"
              render={() => (
                <FormItem>
                  <FormLabel>{t("form.permissions")}</FormLabel>
                  <Controller
                    control={form.control}
                    name="permissions"
                    render={({ field }) => (
                      <div className="grid gap-2 sm:grid-cols-2">
                        {PERMISSIONS.map((permission) => (
                          <label
                            key={permission}
                            className="flex items-center gap-2 rounded-md border px-3 py-2"
                          >
                            <Checkbox
                              checked={
                                field.value?.includes(permission) ?? false
                              }
                              onCheckedChange={(checked) => {
                                const current = field.value ?? [];
                                field.onChange(
                                  checked
                                    ? [...current, permission]
                                    : current.filter(
                                        (item) => item !== permission,
                                      ),
                                );
                              }}
                            />
                            <span className="text-xs">
                              {PERMISSION_LABELS[permission]}
                            </span>
                          </label>
                        ))}
                      </div>
                    )}
                  />
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-end gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button type="submit" disabled={mutation.isPending}>
                {mutation.isPending ? t("form.submitting") : t("form.submit")}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
