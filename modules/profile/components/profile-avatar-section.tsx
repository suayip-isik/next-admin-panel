"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { AvatarManagementCard } from "@/shared/components/avatar-management-card";
import {
  AUTH_ME_QUERY_KEY,
  useCurrentUser,
} from "@/shared/hooks/use-session-meta";
import { deleteMyAvatar, uploadMyAvatar } from "../queries/profile.queries";

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

export function ProfileAvatarSection() {
  const t = useTranslations("profile.avatar");
  const tErrors = useTranslations("errors");
  const queryClient = useQueryClient();
  const { data: user } = useCurrentUser();

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadMyAvatar(file),
    onSuccess: () => {
      toast.success(t("successUploaded"));
      void queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
    },
    onError: (error) => toast.error(getErrorMessage(error, tErrors("generic"))),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMyAvatar,
    onSuccess: () => {
      toast.success(t("successDeleted"));
      void queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
    },
    onError: (error) => toast.error(getErrorMessage(error, tErrors("generic"))),
  });

  if (!user) return null;

  return (
    <AvatarManagementCard
      title={t("title")}
      description={t("description")}
      imageUrl={user.avatar_url}
      fallback={getInitials(user.email, user.full_name)}
      uploadLabel={t("upload")}
      removeLabel={t("remove")}
      uploadedLabel={t("uploaded")}
      emptyLabel={t("empty")}
      uploading={uploadMutation.isPending}
      removing={deleteMutation.isPending}
      onUpload={(file) => uploadMutation.mutate(file)}
      onRemove={() => deleteMutation.mutate()}
    />
  );
}
