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
import { changeUserRole, type User } from "../queries/users.queries";
import { fetchRoles } from "@/modules/roles/queries/roles.queries";

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
  const [roleName, setRoleName] = useState(user.role.name);

  const { data: rolesData } = useQuery({
    queryKey: ["roles"],
    queryFn: fetchRoles,
    enabled: open,
  });

  const mutation = useMutation({
    mutationFn: () => changeUserRole(user.id, roleName),
    onSuccess: () => {
      toast.success(tUsers("successMessages.roleChanged"));
      onSuccess();
    },
    onError: () => toast.error(tUsers("errorMessages.roleChangeFailed")),
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
