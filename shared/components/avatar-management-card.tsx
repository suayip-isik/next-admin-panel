"use client";

import { useRef, useState } from "react";
import { Loader2, Trash2, Upload } from "lucide-react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";

interface AvatarManagementCardProps {
  title: string;
  description: string;
  imageUrl: string | null;
  fallback: string;
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
  fallback,
  uploadLabel,
  removeLabel,
  uploadedLabel,
  emptyLabel,
  uploading = false,
  removing = false,
  onUpload,
  onRemove,
}: AvatarManagementCardProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleFileChange(event: React.ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;

    setFileName(file.name);
    onUpload(file);
    event.target.value = "";
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-center gap-4">
          <Avatar className="h-16 w-16 border">
            {imageUrl && <AvatarImage src={imageUrl} alt={title} />}
            <AvatarFallback className="text-lg font-medium">
              {fallback}
            </AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <p className="text-sm font-medium">{fileName ?? fallback}</p>
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
      </CardContent>
    </Card>
  );
}
