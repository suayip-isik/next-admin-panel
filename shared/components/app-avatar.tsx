"use client";

import { useState } from "react";
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/shared/components/ui/avatar";
import { cn } from "@/shared/utils/cn";

type ImageLoadingStatus = "idle" | "loading" | "loaded" | "error";

export interface AppAvatarProps {
  src: string | null;
  fallback: string;
  alt: string;
  className?: string;
  fallbackClassName?: string;
  imageClassName?: string;
}

export function AppAvatar({
  src,
  fallback,
  alt,
  className,
  fallbackClassName,
  imageClassName,
}: Readonly<AppAvatarProps>) {
  if (!src) {
    return (
      <Avatar className={className}>
        <AvatarFallback className={fallbackClassName}>
          {fallback}
        </AvatarFallback>
      </Avatar>
    );
  }

  return (
    <AppAvatarImageState
      key={src}
      src={src}
      fallback={fallback}
      alt={alt}
      className={className}
      fallbackClassName={fallbackClassName}
      imageClassName={imageClassName}
    />
  );
}

function AppAvatarImageState({
  src,
  fallback,
  alt,
  className,
  fallbackClassName,
  imageClassName,
}: Readonly<Omit<AppAvatarProps, "src"> & { src: string }>) {
  const [status, setStatus] = useState<ImageLoadingStatus>("loading");
  const showFallback = status !== "loaded";

  return (
    <Avatar className={className}>
      <AvatarImage
        src={src}
        alt={alt}
        className={cn(
          "transition-opacity",
          status === "loaded" ? "opacity-100" : "opacity-0",
          imageClassName,
        )}
        onLoadingStatusChange={setStatus}
      />
      {showFallback && (
        <AvatarFallback className={fallbackClassName}>
          {fallback}
        </AvatarFallback>
      )}
    </Avatar>
  );
}
