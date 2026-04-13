import type { Metadata } from "next";
import { headers } from "next/headers";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages } from "next-intl/server";
import { NuqsAdapter } from "nuqs/adapters/next/app";
import { getAppDescription, getAppName, getAppUrl } from "@/lib/env";
import { SecurityProvider } from "@/shared/components/security-provider";
import { QueryProvider } from "@/shared/components/query-provider";
import { ThemeProvider } from "@/shared/components/theme-provider";
import { Toaster } from "@/shared/components/ui/sonner";
import "./globals.css";

const appName = getAppName();

export const metadata: Metadata = {
  metadataBase: new URL(getAppUrl()),
  title: {
    template: `%s | ${appName}`,
    default: appName,
  },
  description: getAppDescription(),
  manifest: "/manifest.webmanifest",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const requestHeaders = await headers();
  const locale = await getLocale();
  const messages = await getMessages();
  const nonce = requestHeaders.get("x-nonce");

  return (
    <html lang={locale} suppressHydrationWarning>
      <body className="min-h-screen bg-background font-sans antialiased">
        <NextIntlClientProvider locale={locale} messages={messages}>
          <NuqsAdapter>
            <SecurityProvider nonce={nonce}>
              <ThemeProvider defaultTheme="system">
                <QueryProvider>
                  {children}
                  <Toaster richColors position="top-right" />
                </QueryProvider>
              </ThemeProvider>
            </SecurityProvider>
          </NuqsAdapter>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
