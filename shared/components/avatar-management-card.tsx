"use client";

import { useRef, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import { AppAvatar } from "@/shared/components/app-avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { getAvatarDisplayName } from "@/shared/utils/avatar";

export interface AvatarManagementCardProps {
  title: string;
  description: string;
  imageUrl: string | null;
  imageVersion?: string | number | null;
  fallback: string;
  displayName?: string | null;
  uploadLabel: string;
  removeLabel: string;
  uploadedLabel: string;
  emptyLabel: string;
  uploading?: boolean;
  removing?: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

export function AvatarManagementCard({
  title,
  description,
  imageUrl,
  imageVersion,
  fallback,
  displayName,
  uploadLabel,
  removeLabel,
  uploadedLabel,
  emptyLabel,
  uploading = false,
  removing = false,
  onUpload,
  onRemove,
}: Readonly<AvatarManagementCardProps>) {
  const resetKey = String(imageVersion ?? imageUrl ?? "__empty__");

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <AvatarManagementCardBody
          key={resetKey}
          imageUrl={imageUrl}
          fallback={fallback}
          displayName={displayName}
          uploadLabel={uploadLabel}
          removeLabel={removeLabel}
          uploadedLabel={uploadedLabel}
          emptyLabel={emptyLabel}
          uploading={uploading}
          removing={removing}
          onUpload={onUpload}
          onRemove={onRemove}
          title={title}
        />
      </CardContent>
    </Card>
  );
}

interface AvatarManagementCardBodyProps {
  title: string;
  imageUrl: string | null;
  fallback: string;
  displayName?: string | null;
  uploadLabel: string;
  removeLabel: string;
  uploadedLabel: string;
  emptyLabel: string;
  uploading: boolean;
  removing: boolean;
  onUpload: (file: File) => void;
  onRemove: () => void;
}

function AvatarManagementCardBody({
  title,
  imageUrl,
  fallback,
  displayName,
  uploadLabel,
  removeLabel,
  uploadedLabel,
  emptyLabel,
  uploading,
  removing,
  onUpload,
  onRemove,
}: Readonly<AvatarManagementCardBodyProps>) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const resolvedDisplayName = getAvatarDisplayName(
    selectedFileName ?? displayName ?? null,
  );

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    onUpload(file);
    event.target.value = "";
  }

  return (
    <>
      <div className="flex items-center gap-4">
        <AppAvatar
          src={imageUrl}
          fallback={fallback}
          alt={title}
          className="h-16 w-16 border"
          fallbackClassName="text-lg font-medium"
        />
        <div className="space-y-1">
          {resolvedDisplayName && (
            <p className="text-sm font-medium">{resolvedDisplayName}</p>
          )}
          <p className="text-xs text-muted-foreground">
            {imageUrl ? uploadedLabel : emptyLabel}
          </p>
        </div>
      </div>

      <div className="flex gap-2">
        <input
          ref={inputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
        />
        <Button
          type="button"
          variant="outline"
          disabled={uploading || removing}
          onClick={() => inputRef.current?.click()}
        >
          {uploading ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Upload className="mr-2 h-4 w-4" />
          )}
          {uploadLabel}
        </Button>
        <Button
          type="button"
          variant="outline"
          disabled={!imageUrl || uploading || removing}
          onClick={onRemove}
        >
          {removing ? (
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="mr-2 h-4 w-4" />
          )}
          {removeLabel}
        </Button>
      </div>
    </>
  );
}
