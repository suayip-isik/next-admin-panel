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
import { Textarea } from "@/shared/components/ui/textarea";
import { Button } from "@/shared/components/ui/button";
import { getErrorMessage } from "@/lib/errors";
import {
  type Role,
  updateRoleDescription,
} from "@/modules/roles/queries/roles.queries";
import { rolesKeys } from "@/modules/roles/roles.keys";

const descriptionSchema = z.object({
  description: z.string().optional(),
});

type DescriptionValues = z.infer<typeof descriptionSchema>;

interface RoleDescriptionDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  role: Role;
}

export function RoleDescriptionDialog({
  open,
  onOpenChange,
  role,
}: RoleDescriptionDialogProps) {
  const t = useTranslations("roles");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const queryClient = useQueryClient();
  const form = useForm<DescriptionValues>({
    resolver: standardSchemaResolver(descriptionSchema),
    defaultValues: {
      description: role.description ?? "",
    },
  });

  useEffect(() => {
    form.reset({ description: role.description ?? "" });
  }, [form, role, open]);

  const mutation = useMutation({
    mutationFn: (values: DescriptionValues) =>
      updateRoleDescription(role.id, {
        description: values.description || null,
      }),
    onSuccess: () => {
      toast.success(t("successMessages.updated"));
      void queryClient.invalidateQueries({ queryKey: rolesKeys.all });
      onOpenChange(false);
    },
    onError: (error) => toast.error(getErrorMessage(error, tErrors("generic"))),
  });

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Description</DialogTitle>
          <DialogDescription>
            Update the role description without changing its permissions.
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form
            onSubmit={form.handleSubmit((values) => mutation.mutate(values))}
            className="space-y-4"
          >
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{t("form.description")}</FormLabel>
                  <FormControl>
                    <Textarea
                      rows={4}
                      placeholder={t("form.descriptionPlaceholder")}
                      {...field}
                      value={field.value ?? ""}
                    />
                  </FormControl>
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
