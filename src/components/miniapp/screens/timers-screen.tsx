"use client";

import { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Briefcase,
  Car,
  Check,
  Heart,
  Play,
  RotateCcw,
  Target,
  Timer as TimerIcon,
  X,
  type LucideIcon,
} from "lucide-react";

import { haptic } from "@/lib/telegram";
import { useAppStore } from "@/store/app-store";
import { TIMERS, formatClock, formatDuration } from "@/data/timers";
import { formatHms } from "@/lib/farm";
import { cn } from "@/lib/utils";
import {
  fadeUpItem,
  SectionHeading,
  staggerContainer,
} from "@/components/miniapp/hud-card";

/** Иконка каждого таймера — чтобы карточки различались с одного взгляда */
const TIMER_ICONS: Record<string, LucideIcon> = {
  tir: Target,
  "club-task": Briefcase,
  "car-theft": Car,
  sutenerka: Heart,
};

interface TimerCardProps {
  id: string;
  title: string;
  minutes: number;
  endsAt: number | undefined;
  now: number;
  onStart: (id: string, durationMs: number) => void;
  onReset: (id: string) => void;
  hapticsEnabled: boolean;
}

function TimerCard({
  id,
  title,
  minutes,
  endsAt,
  now,
  onStart,
  onReset,
  hapticsEnabled,
}: TimerCardProps) {
  const Icon = TIMER_ICONS[id] ?? TimerIcon;
  const totalMs = minutes * 60_000;
  const remaining = endsAt ? endsAt - now : 0;
  const pct =
    endsAt && endsAt > now
      ? Math.max(0, Math.min(100, ((endsAt - now) / totalMs) * 100))
      : 0;

  const start = () => {
    onStart(id, totalMs);
    haptic("select", hapticsEnabled);
  };

  const reset = () => {
    onReset(id);
    haptic("warning", hapticsEnabled);
  };

  /* ===== Состояние: ИДЁТ ОТСЧЁТ ===== */
  if (endsAt !== undefined && endsAt > now) {
    return (
      <motion.div
        variants={fadeUpItem}
        className="cut-tr relative overflow-hidden border border-primary/30 bg-[#1b1e22]"
      >
        <div className="flex items-center gap-3 px-4 py-4">
          <div className="cut-tl-sm grid size-10 shrink-0 place-items-center border border-primary/40 bg-primary/15">
            <Icon className="size-5 text-primary" />
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-display text-sm font-semibold uppercase tracking-[0.1em] text-foreground">
              {title}
            </p>
            <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              закончится в{" "}
              <span className="tnum text-primary/90">{formatClock(endsAt)}</span>
            </p>
          </div>
          <button
            type="button"
            onClick={reset}
            aria-label={`Сбросить таймер: ${title}`}
            className="grid size-9 shrink-0 place-items-center border border-white/12 bg-[#22262c] text-muted-foreground transition-colors hover:border-destructive/50 hover:text-destructive"
          >
            <X className="size-4" />
          </button>
        </div>

        {/* Отсчёт + прогресс */}
        <div className="px-4 pb-4">
          <p className="hud-glow text-center font-display text-[34px] font-semibold leading-none tracking-wide tnum text-primary">
            {formatHms(remaining)}
          </p>
          <div className="mt-3 h-[3px] w-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-[#ff9430] to-[#ff6f10] transition-[width] duration-1000 ease-linear"
              style={{ width: `${pct}%` }}
            />
          </div>
        </div>
      </motion.div>
    );
  }

  /* ===== Состояние: ГОТОВО (истёк) ===== */
  if (endsAt !== undefined) {
    return (
      <motion.button
        type="button"
        variants={fadeUpItem}
        whileTap={{ scale: 0.97 }}
        onClick={start}
        aria-label={`Запустить заново: ${title}`}
        className="cut-tr flex w-full items-center gap-3 border border-[#79c141]/45 bg-[#79c141]/10 px-4 py-4 text-left transition-colors hover:bg-[#79c141]/15"
      >
        <div className="cut-tl-sm grid size-10 shrink-0 place-items-center border border-[#79c141]/50 bg-[#79c141]/15">
          <Check className="size-5 text-[#79c141]" strokeWidth={3} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="truncate font-display text-sm font-semibold uppercase tracking-[0.1em] text-foreground">
            {title}
          </p>
          <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-[#79c141]">
            Готово · закончился в {formatClock(endsAt)}
          </p>
        </div>
        <span className="flex shrink-0 items-center gap-1.5 border border-[#79c141]/40 px-2.5 py-1.5 font-display text-[10px] font-semibold uppercase tracking-[0.16em] text-[#79c141]">
          <RotateCcw className="size-3.5" />
          Заново
        </span>
      </motion.button>
    );
  }

  /* ===== Состояние: ОЖИДАНИЕ (не запущен) ===== */
  return (
    <motion.button
      type="button"
      variants={fadeUpItem}
      whileTap={{ scale: 0.97 }}
      onClick={start}
      aria-label={`Запустить таймер: ${title}`}
      className="cut-tr group flex w-full items-center gap-3 border border-white/12 bg-[#1b1e22] px-4 py-4 text-left transition-colors hover:border-primary/50 hover:bg-[#1f2328]"
    >
      <div className="cut-tl-sm grid size-10 shrink-0 place-items-center border border-white/12 bg-[#202429] transition-colors group-hover:border-primary/40">
        <Icon className="size-5 text-primary/90" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="truncate font-display text-sm font-semibold uppercase tracking-[0.1em] text-foreground">
          {title}
        </p>
        <p className="mt-0.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
          {formatDuration(minutes)}
        </p>
      </div>
      <span className="flex shrink-0 items-center gap-2">
        <span className="font-display text-[13px] font-semibold tnum text-muted-foreground/80">
          {formatHms(totalMs)}
        </span>
        <span className="grid size-8 place-items-center border border-primary/40 bg-primary/10 text-primary transition-colors group-hover:bg-primary/20">
          <Play className="size-4 fill-primary" />
        </span>
      </span>
    </motion.button>
  );
}

export function TimersScreen() {
  const timers = useAppStore((s) => s.timers);
  const startTimer = useAppStore((s) => s.startTimer);
  const resetTimer = useAppStore((s) => s.resetTimer);
  const { haptics } = useAppStore((s) => s.settings);

  // Общий «тик» раз в секунду — двигает все отсчёты сразу
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);

  // Момент перехода таймера в «готово» (только при открытом приложении):
  // тихий до этого секундный остаток → тост + вибрация
  const prevRemaining = useRef<Record<string, number>>({});
  useEffect(() => {
    for (const t of TIMERS) {
      const endsAt = timers[t.id];
      if (!endsAt) continue;
      const remaining = endsAt - now;
      const prev = prevRemaining.current[t.id];
      prevRemaining.current[t.id] = remaining;
      if (prev !== undefined && prev > 0 && remaining <= 0) {
        haptic("success", haptics);
        toast.success(`Таймер «${t.title}» завершён`, {
          description: "Можно выполнять снова.",
        });
      }
    }
  }, [now, timers, haptics]);

  const runningCount = TIMERS.filter((t) => {
    const endsAt = timers[t.id];
    return endsAt !== undefined && endsAt > now;
  }).length;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4"
    >
      <motion.div variants={fadeUpItem}>
        <SectionHeading
          kicker="Раздел 03"
          title="Таймеры"
          desc="Личные кулдауны: запусти и закрывай приложение — отсчёт продолжается."
        />
      </motion.div>

      {/* Сводка */}
      <motion.div variants={fadeUpItem}>
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            {runningCount > 0 ? `Идёт отсчёт: ${runningCount}` : "Ни один не запущен"}
          </span>
          <span className="font-mono text-[10px] tnum text-muted-foreground/70">
            {TIMERS.length} кулдауна
          </span>
        </div>
      </motion.div>

      {/* Карточки-таймеры */}
      <div className="flex flex-col gap-3">
        {TIMERS.map((t) => (
          <TimerCard
            key={t.id}
            id={t.id}
            title={t.title}
            minutes={t.minutes}
            endsAt={timers[t.id]}
            now={now}
            onStart={startTimer}
            onReset={resetTimer}
            hapticsEnabled={haptics}
          />
        ))}
      </div>

      {/* Подсказка */}
      <motion.div variants={fadeUpItem}>
        <p className="flex items-start gap-2 px-1 text-[10px] leading-relaxed text-muted-foreground">
          <TimerIcon className="mt-0.5 size-3.5 shrink-0" />
          Таймеры хранятся локально и переживают закрытие приложения. Напоминаний
          из Telegram не будет — просто заглядывай, зелёная карточка значит «пора».
        </p>
      </motion.div>
    </motion.div>
  );
}
