"use client";

import { Coins } from "lucide-react";
import { motion } from "framer-motion";

import { earnedBp } from "@/lib/farm";
import { useAppStore } from "@/store/app-store";

/** Шапка в стиле HUD: логотип-монограмма, название и счётчик BP за сегодня */
export function AppHeader() {
  const earned = useAppStore((s) => earnedBp(s.farm.completions, s.farm.vip, s.farm.x2));

  return (
    <header className="fixed inset-x-0 top-0 z-40 border-b border-white/10 bg-[#141619]/85 backdrop-blur-md">
      <div className="mx-auto flex h-14 w-full max-w-md items-center justify-between gap-3 px-4">
        {/* Логотип */}
        <div className="flex min-w-0 items-center gap-2.5">
          <div className="cut-tr-sm hud-glow grid size-9 shrink-0 place-items-center bg-gradient-to-br from-[#ffb25e] to-[#ff6a00]">
            <span className="font-display text-sm font-bold tracking-tighter text-primary-foreground">
              GF
            </span>
          </div>
          <div className="min-w-0 leading-none">
            <h1 className="truncate font-display text-[15px] font-semibold uppercase tracking-[0.12em] text-foreground">
              GTA FARM HUB
            </h1>
            <p className="mt-1 text-[9px] uppercase tracking-[0.28em] text-muted-foreground">
              RP Assistant
            </p>
          </div>
        </div>

        {/* Счётчик BP за сегодня */}
        <div className="cut-bl flex h-8 shrink-0 items-center gap-1.5 border border-primary/40 bg-primary/10 pl-2.5 pr-3">
          <Coins className="size-3.5 shrink-0 text-primary" />
          <motion.span
            key={earned}
            initial={{ scale: 1.25, opacity: 0.6 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="font-display text-sm font-semibold tnum text-primary"
          >
            {earned}
          </motion.span>
          <span className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">BP</span>
        </div>
      </div>

      {/* оранжевая градиентная линия под шапкой */}
      <div className="h-px bg-gradient-to-r from-transparent via-primary/70 to-transparent" />
    </header>
  );
}
