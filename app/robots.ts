import type { MetadataRoute } from "next";
import { getAppUrl, isSearchIndexingEnabled } from "@/lib/env";

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
        allow: ["/", "/login", "/forgot-password", "/reset-password"],
        disallow: [
          "/api/",
          "/dashboard",
          "/users",
          "/roles",
          "/notifications",
          "/audit-logs",
          "/api-keys",
          "/profile",
        ],
      },
    ],
    sitemap: `${appUrl}/sitemap.xml`,
    host: appUrl,
  };
}
