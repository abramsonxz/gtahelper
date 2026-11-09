"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { useAppStore } from "@/store/app-store";
import { useTelegram } from "@/lib/telegram";
import { SplashScreen } from "@/components/miniapp/splash-screen";
import { AppHeader } from "@/components/miniapp/app-header";
import { TabBar } from "@/components/miniapp/tab-bar";
import { HomeScreen } from "@/components/miniapp/screens/home-screen";
import { FarmScreen } from "@/components/miniapp/screens/farm-screen";
import { SettingsScreen } from "@/components/miniapp/screens/settings-screen";

/** Считаем запуск один раз за жизнь страницы (устойчиво к Strict Mode) */
let launchCounted = false;

export default function Page() {
  const [booted, setBooted] = useState(false);
  const activeTab = useAppStore((s) => s.activeTab);
  const compact = useAppStore((s) => s.settings.compact);
  useTelegram();

  // Сплэш висит ~1 секунду: за это время persist-хранилище успевает гидрироваться,
  // поэтому SSR-разметка и первый клиентский рендер совпадают.
  useEffect(() => {
    const t = window.setTimeout(() => setBooted(true), 1000);
    return () => window.clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!booted) return;
    // Сверяем игровой день при каждом запуске (сброс отметок в 07:00 МСК)
    useAppStore.getState().syncFarmDay();
    if (launchCounted) return;
    launchCounted = true;
    useAppStore.setState((s) => ({ visits: s.visits + 1 }));
  }, [booted]);

  return (
    <div className="min-h-dvh">
      <AnimatePresence>{!booted ? <SplashScreen key="splash" /> : null}</AnimatePresence>

      {booted ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
          data-compact={compact ? "true" : "false"}
          className="min-h-dvh"
        >
          <AppHeader />

          <main className="mx-auto w-full max-w-md px-4 pb-32 pt-[76px]">
            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              >
                {activeTab === "home" ? <HomeScreen /> : null}
                {activeTab === "farm" ? <FarmScreen /> : null}
                {activeTab === "settings" ? <SettingsScreen /> : null}
              </motion.div>
            </AnimatePresence>
          </main>

          <TabBar />
        </motion.div>
      ) : (
        /* держим место за шапкой/навигацией, пока экран закрыт сплэшем */
        <div className="h-dvh" aria-hidden />
      )}
    </div>
  );
}
