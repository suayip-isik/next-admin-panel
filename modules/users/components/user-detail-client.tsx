"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  Mail,
  Pencil,
  Send,
  Shield,
  Trash2,
  UserCheck,
  UserX,
} from "lucide-react";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { notFound, useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { fetchRoles } from "@/modules/roles/queries/roles.queries";
import { rolesKeys } from "@/modules/roles/roles.keys";
import { AvatarManagementCard } from "@/shared/components/avatar-management-card";
import { PageHeader } from "@/shared/components/page-header";
import { Badge } from "@/shared/components/ui/badge";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { ConfirmDialog } from "@/shared/components/confirm-dialog";
import { Skeleton } from "@/shared/components/ui/skeleton";
import {
  activateUser,
  deactivateUser,
  deleteUser,
  deleteUserAvatar,
  fetchUser,
  resendAdminInvite,
  resendUserVerification,
  uploadUserAvatar,
} from "../queries/users.queries";
import { usersKeys } from "../users.keys";
import { ChangeUserEmailDialog } from "./change-user-email-dialog";
import { EditUserDialog } from "./edit-user-dialog";
import { RoleChangeDialog } from "./role-change-dialog";

interface UserDetailClientProps {
  id: string;
}

function getInitials(email: string, fullName: string | null) {
  if (fullName) {
    const initials = fullName
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase() ?? "")
      .join("");

    if (initials) return initials;
  }

  return email.slice(0, 2).toUpperCase();
}

export function UserDetailClient({ id }: UserDetailClientProps) {
  const t = useTranslations("users");
  const tDetail = useTranslations("users.detail");
  const tCommon = useTranslations("common");
  const tErrors = useTranslations("errors");
  const router = useRouter();
  const queryClient = useQueryClient();

  const [editOpen, setEditOpen] = useState(false);
  const [emailOpen, setEmailOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [confirmAction, setConfirmAction] = useState<
    "activate" | "deactivate" | "delete" | null
  >(null);

  const { data, isLoading, error } = useQuery({
    queryKey: usersKeys.detail(id),
    queryFn: () => fetchUser(id),
    retry: false,
  });

  useQuery({
    queryKey: rolesKeys.list(),
    queryFn: fetchRoles,
    staleTime: 5 * 60 * 1000,
  });

  const invalidate = () => {
    void queryClient.invalidateQueries({ queryKey: usersKeys.detail(id) });
    void queryClient.invalidateQueries({ queryKey: usersKeys.all });
  };

  const activateMutation = useMutation({
    mutationFn: () => activateUser(id),
    onSuccess: () => {
      toast.success(t("successMessages.activated"));
      invalidate();
      setConfirmAction(null);
    },
    onError: (mutationError) =>
      toast.error(
        getErrorMessage(
          mutationError,
          t("errorMessages.activateFailed") || tErrors("generic"),
        ),
      ),
  });

  const deactivateMutation = useMutation({
    mutationFn: () => deactivateUser(id),
    onSuccess: () => {
      toast.success(t("successMessages.deactivated"));
      invalidate();
      setConfirmAction(null);
    },
    onError: (mutationError) =>
      toast.error(
        getErrorMessage(
          mutationError,
          t("errorMessages.deactivateFailed") || tErrors("generic"),
        ),
      ),
  });

  const deleteMutation = useMutation({
    mutationFn: () => deleteUser(id),
    onSuccess: () => {
      toast.success(t("successMessages.deleted"));
      void queryClient.invalidateQueries({ queryKey: usersKeys.all });
      router.push("/users");
    },
    onError: (mutationError) =>
      toast.error(
        getErrorMessage(
          mutationError,
          t("errorMessages.deleteFailed") || tErrors("generic"),
        ),
      ),
  });

  const verificationMutation = useMutation({
    mutationFn: () => resendUserVerification(id),
    onSuccess: () => {
      toast.success(t("successMessages.verificationSent"));
      invalidate();
    },
    onError: (mutationError) =>
      toast.error(getErrorMessage(mutationError, tErrors("generic"))),
  });

  const inviteMutation = useMutation({
    mutationFn: () => resendAdminInvite(id),
    onSuccess: () => toast.success(t("successMessages.inviteResent")),
    onError: (mutationError) =>
      toast.error(getErrorMessage(mutationError, tErrors("generic"))),
  });

  const uploadAvatarMutation = useMutation({
    mutationFn: (file: File) => uploadUserAvatar(id, file),
    onSuccess: () => {
      toast.success(t("successMessages.avatarUploaded"));
      invalidate();
    },
    onError: (mutationError) =>
      toast.error(getErrorMessage(mutationError, tErrors("generic"))),
  });

  const deleteAvatarMutation = useMutation({
    mutationFn: () => deleteUserAvatar(id),
    onSuccess: () => {
      toast.success(t("successMessages.avatarDeleted"));
      invalidate();
    },
    onError: (mutationError) =>
      toast.error(getErrorMessage(mutationError, tErrors("generic"))),
  });

  if (error) notFound();

  if (isLoading || !data) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-12 w-64" />
        <div className="grid gap-6 lg:grid-cols-2">
          <Skeleton className="h-64" />
          <Skeleton className="h-64" />
        </div>
      </div>
    );
  }

  const verificationNeeded =
    !data.is_verified || data.has_pending_email || data.verification_required;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-start gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/users">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <PageHeader title={data.full_name ?? data.email} subtitle={data.email}>
          <Badge variant="outline" className="capitalize">
            {data.role.name}
          </Badge>
          <Badge variant={data.is_active ? "default" : "secondary"}>
            {data.is_active ? t("filters.active") : t("filters.inactive")}
          </Badge>
          <Button variant="outline" onClick={() => setEditOpen(true)}>
            <Pencil className="mr-2 h-4 w-4" />
            {t("actions.edit")}
          </Button>
        </PageHeader>
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.2fr_1fr]">
        <div className="space-y-6">
          <AvatarManagementCard
            title={t("avatar.title")}
            description={t("avatar.description")}
            imageUrl={data.avatar_url}
            fallback={getInitials(data.email, data.full_name)}
            uploadLabel={t("avatar.upload")}
            removeLabel={t("avatar.remove")}
            uploadedLabel={t("avatar.uploaded")}
            emptyLabel={t("avatar.empty")}
            uploading={uploadAvatarMutation.isPending}
            removing={deleteAvatarMutation.isPending}
            onUpload={(file) => uploadAvatarMutation.mutate(file)}
            onRemove={() => deleteAvatarMutation.mutate()}
          />

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {tDetail("personalInfo")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row label={tDetail("fullName")} value={data.full_name ?? "—"} />
              <Row label={tDetail("username")} value={data.username ?? "—"} />
              <Row label="Email" value={data.email} />
              <Row
                label={t("detail.pendingEmail")}
                value={data.has_pending_email ? tCommon("yes") : tCommon("no")}
              />
              <Row
                label={tDetail("emailVerified")}
                value={data.is_verified ? tCommon("yes") : tCommon("no")}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-base">
                {tDetail("accountStatus")}
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Row
                label={tDetail("accountStatus")}
                value={
                  <Badge variant={data.is_active ? "default" : "secondary"}>
                    {data.is_active
                      ? t("filters.active")
                      : t("filters.inactive")}
                  </Badge>
                }
              />
              <Row
                label={t("detail.verificationRequired")}
                value={
                  data.verification_required ? tCommon("yes") : tCommon("no")
                }
              />
              <Row
                label={tCommon("role")}
                value={
                  <Badge variant="outline" className="capitalize">
                    {data.role.name}
                  </Badge>
                }
              />
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-base">
              {t("detail.actionsTitle")}
            </CardTitle>
            <CardDescription>{t("detail.actionsDescription")}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid gap-2">
              <Button variant="outline" onClick={() => setEditOpen(true)}>
                <Pencil className="mr-2 h-4 w-4" />
                {t("actions.edit")}
              </Button>
              <Button variant="outline" onClick={() => setEmailOpen(true)}>
                <Mail className="mr-2 h-4 w-4" />
                {t("actions.changeEmail")}
              </Button>
              <Button variant="outline" onClick={() => setRoleOpen(true)}>
                <Shield className="mr-2 h-4 w-4" />
                {t("actions.changeRole")}
              </Button>
              {verificationNeeded && (
                <Button
                  variant="outline"
                  disabled={verificationMutation.isPending}
                  onClick={() => verificationMutation.mutate()}
                >
                  <Send className="mr-2 h-4 w-4" />
                  {t("actions.resendVerification")}
                </Button>
              )}
              <Button
                variant="outline"
                disabled={inviteMutation.isPending}
                onClick={() => inviteMutation.mutate()}
              >
                <Send className="mr-2 h-4 w-4" />
                {t("actions.resendInvite")}
              </Button>
              {data.is_active ? (
                <Button
                  variant="outline"
                  onClick={() => setConfirmAction("deactivate")}
                >
                  <UserX className="mr-2 h-4 w-4" />
                  {t("actions.deactivate")}
                </Button>
              ) : (
                <Button
                  variant="outline"
                  onClick={() => setConfirmAction("activate")}
                >
                  <UserCheck className="mr-2 h-4 w-4" />
                  {t("actions.activate")}
                </Button>
              )}
              <Button
                variant="destructive"
                onClick={() => setConfirmAction("delete")}
              >
                <Trash2 className="mr-2 h-4 w-4" />
                {t("actions.delete")}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <EditUserDialog open={editOpen} onOpenChange={setEditOpen} user={data} />
      <ChangeUserEmailDialog
        key={`${data.id}:${data.email}`}
        open={emailOpen}
        onOpenChange={setEmailOpen}
        user={data}
      />
      <RoleChangeDialog
        key={`${data.id}:${data.role.name}`}
        open={roleOpen}
        onOpenChange={setRoleOpen}
        user={data}
        onSuccess={() => {
          setRoleOpen(false);
          invalidate();
        }}
      />

      <ConfirmDialog
        open={confirmAction === "activate"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={t("dialogs.activate.title")}
        description={t("dialogs.activate.description", {
          name: data.full_name ?? data.email,
        })}
        confirmLabel={t("dialogs.activate.confirm")}
        loading={activateMutation.isPending}
        onConfirm={() => activateMutation.mutate()}
      />
      <ConfirmDialog
        open={confirmAction === "deactivate"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={t("dialogs.deactivate.title")}
        description={t("dialogs.deactivate.description", {
          name: data.full_name ?? data.email,
        })}
        confirmLabel={t("dialogs.deactivate.confirm")}
        variant="destructive"
        loading={deactivateMutation.isPending}
        onConfirm={() => deactivateMutation.mutate()}
      />
      <ConfirmDialog
        open={confirmAction === "delete"}
        onOpenChange={(open) => !open && setConfirmAction(null)}
        title={t("dialogs.delete.title")}
        description={t("dialogs.delete.description", {
          name: data.full_name ?? data.email,
        })}
        confirmLabel={t("dialogs.delete.confirm")}
        variant="destructive"
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate()}
      />
    </div>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex justify-between items-start gap-4">
      <span className="text-sm text-muted-foreground">{label}</span>
      <span className="text-sm font-medium text-right">{value}</span>
    </div>
  );
}
