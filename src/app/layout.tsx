import type { Metadata, Viewport } from "next";
import { Inter, Oswald } from "next/font/google";
import Script from "next/script";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "cyrillic"],
});

const oswald = Oswald({
  variable: "--font-oswald",
  subsets: ["latin", "cyrillic"],
});

export const metadata: Metadata = {
  title: "GTA FARM HUB — помощник фарма GTA 5 RP",
  description:
    "Telegram Mini App для игроков GTA 5 RP: учёт фарма BP, сессии, статистика и настройки. Данные хранятся локально на устройстве.",
  applicationName: "GTA FARM HUB",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#141619",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ru" className="dark" suppressHydrationWarning>
      <body
        className={`${inter.variable} ${oswald.variable} font-sans antialiased bg-background text-foreground min-h-dvh`}
      >
        {/* Официальный SDK Telegram Mini Apps — обязан загрузиться до гидрации */}
        <Script
          src="https://telegram.org/js/telegram-web-app.js"
          strategy="beforeInteractive"
        />
        {children}
        <Toaster theme="dark" position="top-center" offset={72} />
      </body>
    </html>
  );
}
