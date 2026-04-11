import type { MetadataRoute } from "next";
import { getAppUrl, isSearchIndexingEnabled } from "@/lib/env";

export default function sitemap(): MetadataRoute.Sitemap {
  if (!isSearchIndexingEnabled()) {
    return [];
  }

  const appUrl = getAppUrl();
  const lastModified = new Date();

  return [
    {
      url: `${appUrl}/`,
      lastModified,
      changeFrequency: "weekly",
      priority: 1,
    },
    {
      url: `${appUrl}/login`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.4,
    },
    {
      url: `${appUrl}/forgot-password`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.2,
    },
    {
      url: `${appUrl}/reset-password`,
      lastModified,
      changeFrequency: "monthly",
      priority: 0.2,
    },
  ];
}
