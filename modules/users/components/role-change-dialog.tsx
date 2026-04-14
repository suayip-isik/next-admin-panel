"use client";

import { useEffect } from "react";
import { useForm, useWatch } from "react-hook-form";
import { standardSchemaResolver } from "@hookform/resolvers/standard-schema";
import { z } from "zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { getErrorMessage } from "@/lib/errors";
import { changeUserRole, type User } from "../queries/users.queries";
import { fetchRoles } from "@/modules/roles/queries/roles.queries";
import { rolesKeys } from "@/modules/roles/roles.keys";
import { usersKeys } from "../users.keys";

const roleChangeSchema = z.object({
  role_name: z.string().min(1),
});

type RoleChangeValues = z.infer<typeof roleChangeSchema>;

interface RoleChangeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  onSuccess: () => void;
}

export function RoleChangeDialog({
  open,
  onOpenChange,
  user,
  onSuccess,
}: RoleChangeDialogProps) {
  const t = useTranslations("users.dialogs.changeRole");
  const tUsers = useTranslations("users");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const queryClient = useQueryClient();

  const form = useForm<RoleChangeValues>({
    resolver: standardSchemaResolver(roleChangeSchema),
    defaultValues: { role_name: user.role.name },
  });
  const selectedRoleName = useWatch({
    control: form.control,
    name: "role_name",
  });

  useEffect(() => {
    form.reset({ role_name: user.role.name });
  }, [form, open, user]);

  const { data: roles } = useQuery({
    queryKey: rolesKeys.list(),
    queryFn: fetchRoles,
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: ({ role_name }: RoleChangeValues) =>
      changeUserRole(user.id, role_name),
    onSuccess: () => {
      toast.success(tUsers("successMessages.roleChanged"));
      void queryClient.invalidateQueries({
        queryKey: usersKeys.detail(user.id),
      });
      void queryClient.invalidateQueries({ queryKey: usersKeys.all });
      onSuccess();
    },
    onError: (error) =>
      toast.error(
        getErrorMessage(
          error,
          tUsers("errorMessages.roleChangeFailed") || tErrors("generic"),
        ),
      ),
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
              name="role_name"
              render={({ field }) => (
                <FormItem>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder={t("selectRole")} />
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
            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                {tCommon("cancel")}
              </Button>
              <Button
                type="submit"
                disabled={
                  mutation.isPending || selectedRoleName === user.role.name
                }
              >
                {mutation.isPending ? tCommon("loading") : t("confirm")}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
