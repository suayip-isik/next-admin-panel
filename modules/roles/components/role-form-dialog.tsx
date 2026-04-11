"use client";

import { useForm, Controller } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { useTranslations } from "next-intl";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useMemo } from "react";
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
import { Textarea } from "@/shared/components/ui/textarea";
import { Checkbox } from "@/shared/components/ui/checkbox";
import { Button } from "@/shared/components/ui/button";
import {
  PERMISSIONS,
  PERMISSION_LABELS,
  type Permission,
} from "@/shared/utils/permissions";
import { getErrorMessage } from "@/lib/errors";
import {
  createRoleSchema,
  createUpdateRoleSchema,
  type CreateRoleInput,
  type UpdateRoleInput,
} from "../schemas/roles.schemas";
import { createRole, updateRole, type Role } from "../queries/roles.queries";
import { rolesKeys } from "../roles.keys";

interface RoleFormDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role?: Role;
  onSuccess: () => void;
}

// Union type for both create and edit scenarios
type RoleFormInput = CreateRoleInput | UpdateRoleInput;

export function RoleFormDialog({
  open,
  onOpenChange,
  role,
  onSuccess,
}: RoleFormDialogProps) {
  const t = useTranslations("roles");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const tValidation = useTranslations("validation");
  const queryClient = useQueryClient();
  const isEdit = !!role;

  const schema = useMemo(
    () => (isEdit ? createUpdateRoleSchema() : createRoleSchema(tValidation)),
    [isEdit, tValidation],
  );

  const form = useForm<RoleFormInput>({
    resolver: standardSchemaResolver(schema),
    defaultValues: {
      ...(isEdit ? {} : { name: "" }),
      description: role?.description ?? "",
      permissions: (role?.permissions ?? []) as Permission[],
    },
  });

  const mutation = useMutation({
    mutationFn: (values: RoleFormInput) =>
      isEdit
        ? updateRole(role!.id, values)
        : createRole(values as CreateRoleInput),
    onSuccess: () => {
      toast.success(
        isEdit ? t("successMessages.updated") : t("successMessages.created"),
      );
      void queryClient.invalidateQueries({ queryKey: rolesKeys.all });
      form.reset();
      onSuccess();
    },
    onError: (error) => toast.error(getErrorMessage(error, tErrors("generic"))),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {isEdit ? t("form.editTitle") : t("form.createTitle")}
          </DialogTitle>
          <DialogDescription>
            {isEdit ? t("form.editDescription") : t("form.createDescription")}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((v) => mutation.mutate(v))}
            className="space-y-4"
          >
            {!isEdit && (
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{t("form.name")}</FormLabel>
                    <FormControl>
                      <Input
                        placeholder={t("form.namePlaceholder")}
                        {...field}
                      />
                    </FormControl>
                    <p className="text-xs text-muted-foreground">
                      {t("form.nameHint")}
                    </p>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder={t("form.descriptionPlaceholder")}
                      rows={2}
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="space-y-2">
              <p className="text-sm font-medium">{t("form.permissions")}</p>
              <p className="text-xs text-muted-foreground">
                {t("form.permissionsHint")}
              </p>
              <div className="grid grid-cols-2 gap-2">
                <Controller
                  control={form.control}
                  name="permissions"
                  render={({ field }) => (
                    <>
                      {PERMISSIONS.map((permission) => (
                        <label
                          key={permission}
                          className="flex items-center gap-2 cursor-pointer"
                        >
                          <Checkbox
                            checked={field.value?.includes(permission) ?? false}
                            onCheckedChange={(checked) => {
                              const current = field.value ?? [];
                              field.onChange(
                                checked
                                  ? [...current, permission]
                                  : current.filter((p) => p !== permission),
                              );
                            }}
                          />
                          <span className="text-xs">
                            {PERMISSION_LABELS[permission]}
                          </span>
                        </label>
                      ))}
                    </>
                  )}
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
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
