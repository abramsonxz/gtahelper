"use client";

import { useSyncExternalStore } from "react";

export interface TgUser {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export interface TelegramWebApp {
  ready: () => void;
  expand: () => void;
  platform: string;
  version: string;
  colorScheme: "light" | "dark";
  initDataUnsafe?: {
    user?: TgUser;
  };
  setHeaderColor?: (color: string) => void;
  setBackgroundColor?: (color: string) => void;
  disableVerticalSwipes?: () => void;
  HapticFeedback?: {
    impactOccurred: (style: "light" | "medium" | "heavy" | "rigid" | "soft") => void;
    notificationOccurred: (type: "error" | "success" | "warning") => void;
    selectionChanged: () => void;
  };
}

declare global {
  interface Window {
    Telegram?: {
      WebApp: TelegramWebApp;
    };
  }
}

/* Кэш WebApp-инстанса: SDK подключается через <script strategy="beforeInteractive">,
   поэтому объект доступен уже на первом клиентском рендере. */
let cachedApp: TelegramWebApp | null = null;

function initApp(app: TelegramWebApp): void {
  try {
    app.ready();
    app.expand();
    app.setHeaderColor?.("#141619");
    app.setBackgroundColor?.("#141619");
    // Не закрываем Mini App свайпом вниз при скролле списка
    app.disableVerticalSwipes?.();
  } catch {
    // старые версии клиента — тихо игнорируем
  }
}

const subscribe = () => () => {};

function getSnapshot(): TelegramWebApp | null {
  if (cachedApp === null && typeof window !== "undefined") {
    const app = window.Telegram?.WebApp;
    if (app) {
      initApp(app);
      cachedApp = app;
    }
  }
  return cachedApp;
}

function getServerSnapshot(): TelegramWebApp | null {
  return null;
}

/**
 * Хук доступа к Telegram WebApp.
 * Вне Telegram (в обычном браузере) возвращает null —
 * приложение продолжает работать как обычная веб-страница.
 */
export function useTelegram() {
  const tg = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  return {
    tg,
    user: tg?.initDataUnsafe?.user ?? null,
    isTelegram: Boolean(tg),
    platform: tg?.platform ?? "browser",
  };
}

export type HapticKind = "tap" | "select" | "success" | "warning" | "error";

/** Тактильный отклик через Telegram HapticFeedback (безопасно вне TG) */
export function haptic(kind: HapticKind = "tap", enabled = true): void {
  if (!enabled || typeof window === "undefined") return;
  const hf = window.Telegram?.WebApp?.HapticFeedback;
  if (!hf) return;
  try {
    if (kind === "tap") hf.impactOccurred("light");
    else if (kind === "select") hf.selectionChanged();
    else hf.notificationOccurred(kind);
  } catch {
    // платформа не поддерживает — пропускаем
  }
}
