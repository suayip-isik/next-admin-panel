"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { usePermissionGate } from "@/shared/hooks/use-permissions";
import { Button } from "@/shared/components/ui/button";
import { RolesTable } from "./roles-table";
import { RoleFormDialog } from "./role-form-dialog";

export function RolesTableWithCreate() {
  const t = useTranslations("roles");
  const [createOpen, setCreateOpen] = useState(false);
  const createRoleGate = usePermissionGate({ all: ["roles.create"] });

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        {(createRoleGate.isAllowed || createRoleGate.isLoading) && (
          <Button
            onClick={() => setCreateOpen(true)}
            disabled={createRoleGate.isLoading}
          >
            <Plus className="mr-2 h-4 w-4" />
            {t("createRole")}
          </Button>
        )}
      </div>
      <RolesTable />
      {createRoleGate.isAllowed && (
        <RoleFormDialog
          open={createOpen}
          onOpenChange={setCreateOpen}
          onSuccess={() => setCreateOpen(false)}
        />
      )}
    </div>
  );
}
