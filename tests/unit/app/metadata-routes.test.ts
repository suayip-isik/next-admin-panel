import { afterEach, describe, expect, it, vi } from "vitest";
import manifest from "@/app/manifest";
import robots from "@/app/robots";
import sitemap from "@/app/sitemap";

describe("metadata routes", () => {
  afterEach(() => {
    vi.resetModules();
    delete process.env.NEXT_PUBLIC_APP_URL;
    delete process.env.NEXT_PUBLIC_APP_NAME;
    delete process.env.NEXT_PUBLIC_APP_SHORT_NAME;
    delete process.env.NEXT_PUBLIC_APP_DESCRIPTION;
    delete process.env.NEXT_PUBLIC_APP_THEME_COLOR;
    delete process.env.NEXT_PUBLIC_APP_BACKGROUND_COLOR;
    delete process.env.VERCEL_ENV;
  });

  it("builds the manifest from env-backed metadata", () => {
    process.env.NEXT_PUBLIC_APP_NAME = "Acme Console";
    process.env.NEXT_PUBLIC_APP_SHORT_NAME = "Acme";
    process.env.NEXT_PUBLIC_APP_DESCRIPTION = "Acme admin surface";
    process.env.NEXT_PUBLIC_APP_THEME_COLOR = "#123456";
    process.env.NEXT_PUBLIC_APP_BACKGROUND_COLOR = "#eeeeee";

    expect(manifest()).toMatchObject({
      name: "Acme Console",
      short_name: "Acme",
      description: "Acme admin surface",
      theme_color: "#123456",
      background_color: "#eeeeee",
    });
  });

  it("disables indexing outside production", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://preview.example.com";
    process.env.VERCEL_ENV = "preview";

    expect(robots()).toEqual({
      rules: {
        userAgent: "*",
        disallow: "/",
      },
      host: "https://preview.example.com",
    });
    expect(sitemap()).toEqual([]);
  });

  it("builds public robots and sitemap in production", () => {
    process.env.NEXT_PUBLIC_APP_URL = "https://admin.example.com";
    process.env.VERCEL_ENV = "production";

    const robotsConfig = robots();
    const sitemapConfig = sitemap();

    expect(robotsConfig.host).toBe("https://admin.example.com");
    expect(robotsConfig.sitemap).toBe("https://admin.example.com/sitemap.xml");
    expect(sitemapConfig[0]?.url).toBe("https://admin.example.com/");
    expect(sitemapConfig[1]?.url).toBe("https://admin.example.com/login");
  });
});
