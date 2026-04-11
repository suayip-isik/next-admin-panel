import type { MetadataRoute } from "next";
import {
  getAppBackgroundColor,
  getAppDescription,
  getAppName,
  getAppShortName,
  getAppThemeColor,
} from "@/lib/env";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: getAppName(),
    short_name: getAppShortName(),
    description: getAppDescription(),
    start_url: "/",
    display: "standalone",
    background_color: getAppBackgroundColor(),
    theme_color: getAppThemeColor(),
    icons: [
      {
        src: "/favicon.ico",
        sizes: "any",
        type: "image/x-icon",
      },
    ],
  };
}
