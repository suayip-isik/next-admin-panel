import type { MetadataRoute } from "next";
import { getAppUrl, isSearchIndexingEnabled } from "@/lib/env";
import {
  ADMIN_DISALLOWED_ROBOTS_PATHS,
  PUBLIC_INDEXABLE_PATHS,
} from "@/shared/lib/routes";

export default function robots(): MetadataRoute.Robots {
  const appUrl = getAppUrl();

  if (!isSearchIndexingEnabled()) {
    return {
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      host: appUrl,
    };
  }

  return {
    rules: [
      {
        userAgent: "*",
        allow: [...PUBLIC_INDEXABLE_PATHS],
        disallow: ["/api/", ...ADMIN_DISALLOWED_ROBOTS_PATHS],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
