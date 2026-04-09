"use client";

import { useState } from "react";
import { useMutation, useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
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
  const [roleName, setRoleName] = useState(user.role.name);

  const { data: rolesData } = useQuery({
    queryKey: rolesKeys.list(),
    queryFn: fetchRoles,
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: () => changeUserRole(user.id, roleName),
    onSuccess: () => {
      toast.success(tUsers("successMessages.roleChanged"));
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
        </DialogHeader>
        <Select value={roleName} onValueChange={setRoleName}>
          <SelectTrigger>
            <SelectValue placeholder={t("selectRole")} />
          </SelectTrigger>
          <SelectContent>
            {(rolesData ?? []).map((role) => (
              <SelectItem key={role.id} value={role.name}>
                {role.name}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {tCommon("cancel")}
          </Button>
          <Button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || roleName === user.role.name}
          >
            {mutation.isPending ? tCommon("loading") : t("confirm")}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
