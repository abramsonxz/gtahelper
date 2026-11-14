"use client";

import { motion } from "framer-motion";
import { HardDrive, ListChecks, ListTodo, Timer } from "lucide-react";

import { haptic } from "@/lib/telegram";
import { useAppStore } from "@/store/app-store";
import { useTelegram } from "@/lib/telegram";
import {
  completedCount,
  earnedBp,
  multiplierOf,
  TOTAL_BASE_BP,
  TOTAL_TASKS,
} from "@/lib/farm";
import {
  fadeUpItem,
  HudButton,
  HudCard,
  staggerContainer,
  StatReadout,
} from "@/components/miniapp/hud-card";

export function HomeScreen() {
  const nickname = useAppStore((s) => s.nickname);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const farm = useAppStore((s) => s.farm);
  const { haptics } = useAppStore((s) => s.settings);
  const { user } = useTelegram();

  const displayName = (nickname || user?.first_name || "ИГРОК").toUpperCase();

  const earned = earnedBp(farm.completions, farm.vip, farm.x2);
  const completed = completedCount(farm.completions);
  const mult = multiplierOf(farm.vip, farm.x2);
  const maxBp = TOTAL_BASE_BP * mult;
  const favCount = farm.favorites.length;

  const goFarm = () => {
    setActiveTab("farm");
    haptic("select", haptics);
  };

  const goTimers = () => {
    setActiveTab("timers");
    haptic("select", haptics);
  };

  const goTodo = () => {
    setActiveTab("todo");
    haptic("select", haptics);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4"
    >
      {/* ===== Приветствие + статус ===== */}
      <motion.div variants={fadeUpItem}>
        <HudCard glow>
          <div>
            <p className="font-display text-[10px] font-medium uppercase tracking-[0.24em] text-primary">
              {"// Статус"}
            </p>
            <h2 className="mt-1.5 truncate font-display text-[26px] font-semibold uppercase leading-none tracking-wide text-foreground">
              Привет, {displayName}
            </h2>
            <p className="mt-2.5 text-xs leading-relaxed text-muted-foreground">
              Помощник фарма для GTA 5 RP: следи за заработком BP, планируй сессии и держи
              прогресс под контролем.
            </p>
          </div>

          {/* Полоса статуса */}
          <div className="mt-4 flex items-center justify-between border-t border-white/10 pt-3">
            <div className="flex items-center gap-2">
              <span className="relative flex size-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#79c141] opacity-60" />
                <span className="relative inline-flex size-2 rounded-full bg-[#79c141]" />
              </span>
              <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
                Готов к фарму
              </span>
            </div>
          </div>
        </HudCard>
      </motion.div>

      {/* ===== Статистика дня (живая, из раздела фарма) ===== */}
      <motion.div variants={fadeUpItem} className="grid grid-cols-2 gap-3">
        <StatReadout
          label="BP за сегодня"
          value={String(earned)}
          unit="BP"
          barPct={maxBp > 0 ? Math.min(100, (earned / maxBp) * 100) : 0}
        />
        <StatReadout
          label="Задания дня"
          value={String(completed)}
          unit={`из ${TOTAL_TASKS}`}
          barPct={(completed / TOTAL_TASKS) * 100}
        />
        <StatReadout label="Множитель" value={`×${mult}`} barPct={(mult / 4) * 100} />
        <StatReadout
          label="В избранных"
          value={String(favCount)}
          barPct={(favCount / TOTAL_TASKS) * 100}
        />
      </motion.div>

      {/* ===== Быстрые действия ===== */}
      <motion.div variants={fadeUpItem} className="grid grid-cols-3 gap-2">
        <HudButton primary icon={ListChecks} label="К фарму" onClick={goFarm} className="px-2" />
        <HudButton icon={Timer} label="Таймеры" onClick={goTimers} className="px-2" />
        <HudButton icon={ListTodo} label="TO-DO" onClick={goTodo} className="px-2" />
      </motion.div>

      {/* ===== Баннер про локальные данные ===== */}
      <motion.div variants={fadeUpItem}>
        <div className="flex items-center gap-3 rounded-md border border-white/10 bg-[#191c20]/70 px-3.5 py-3">
          <div className="cut-tl-sm grid size-8 shrink-0 place-items-center border border-primary/35 bg-primary/10">
            <HardDrive className="size-4 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-[11px] font-medium text-secondary-foreground">
              Данные хранятся локально
            </p>
            <p className="text-[10px] leading-snug text-muted-foreground">
              Всё остаётся на устройстве, пока ты не очистишь кеш Telegram.
            </p>
          </div>
          <span className="shrink-0 font-display text-[9px] font-semibold uppercase tracking-[0.2em] text-primary/80">
            Local
          </span>
        </div>
      </motion.div>
    </motion.div>
  );
}
