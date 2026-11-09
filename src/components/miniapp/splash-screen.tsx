"use client";

import { motion } from "framer-motion";

/** Загрузочный экран в стилистике GTA: логотип, полоса загрузки, свайп-блики */
export function SplashScreen() {
  return (
    <motion.div
      className="fixed inset-0 z-50 grid place-items-center bg-background"
      exit={{ opacity: 0, transition: { duration: 0.35, ease: "easeOut" } }}
      aria-label="Загрузка приложения"
      role="status"
    >
      <div className="flex flex-col items-center gap-6 px-8 text-center">
        <motion.div
          initial={{ scale: 0.75, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 16 }}
          className="cut-tr hud-glow-strong grid size-20 place-items-center bg-gradient-to-br from-[#ffb25e] to-[#ff6a00]"
        >
          <span className="font-display text-3xl font-bold tracking-tighter text-primary-foreground">
            GF
          </span>
        </motion.div>

        <div>
          <h1 className="font-display text-2xl font-semibold uppercase tracking-[0.18em] text-foreground text-glow">
            GTA FARM HUB
          </h1>
          <p className="mt-2 text-[10px] uppercase tracking-[0.4em] text-muted-foreground">
            RP Assistant
          </p>
        </div>

        <div className="relative h-1 w-56 overflow-hidden bg-white/10">
          <div className="animate-sweep absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-primary to-transparent" />
        </div>

        <p className="animate-hud-pulse text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          Загрузка…
        </p>
      </div>
    </motion.div>
  );
}
