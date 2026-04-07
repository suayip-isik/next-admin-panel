"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { RolesTable } from "./roles-table";
import { RoleFormDialog } from "./role-form-dialog";

export function RolesTableWithCreate() {
  const t = useTranslations("roles");
  const [createOpen, setCreateOpen] = useState(false);

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={() => setCreateOpen(true)}>
          <Plus className="mr-2 h-4 w-4" />
          {t("createRole")}
        </Button>
      </div>
      <RolesTable />
      <RoleFormDialog
        open={createOpen}
        onOpenChange={setCreateOpen}
        onSuccess={() => setCreateOpen(false)}
      />
    </div>
  );
}
