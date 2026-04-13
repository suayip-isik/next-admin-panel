"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { toast } from "sonner";
import { getErrorMessage } from "@/lib/errors";
import { AvatarManagementCard } from "@/shared/components/avatar-management-card";
import {
  AUTH_ME_QUERY_KEY,
  mergeCurrentUserCache,
  useCurrentUser,
} from "@/shared/hooks/use-session-meta";
import { getAvatarPresentation } from "@/shared/utils/avatar";
import { deleteMyAvatar, uploadMyAvatar } from "../queries/profile.queries";

export function ProfileAvatarSection() {
  const t = useTranslations("profile.avatar");
  const tErrors = useTranslations("errors");
  const queryClient = useQueryClient();
  const { data: user, dataUpdatedAt } = useCurrentUser();
  const avatar = user
    ? getAvatarPresentation({
        email: user.email,
        fullName: user.full_name,
        avatarUrl: user.avatar_url,
        revision: dataUpdatedAt,
      })
    : null;

  const uploadMutation = useMutation({
    mutationFn: (file: File) => uploadMyAvatar(file),
    onSuccess: (updatedUser) => {
      mergeCurrentUserCache(queryClient, updatedUser);
      toast.success(t("successUploaded"));
      void queryClient.invalidateQueries({ queryKey: AUTH_ME_QUERY_KEY });
    },
    onError: (error) => toast.error(getErrorMessage(error, tErrors("generic"))),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteMyAvatar,
    onSuccess: (updatedUser) => {
      mergeCurrentUserCache(queryClient, updatedUser);
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
      imageUrl={avatar?.src ?? null}
      imageVersion={dataUpdatedAt}
      fallback={avatar?.fallback ?? ""}
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
