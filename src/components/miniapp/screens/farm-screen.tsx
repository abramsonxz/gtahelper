"use client";

import { useCallback, useEffect, useState } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { toast } from "sonner";
import {
  Crown,
  Flame,
  type LucideIcon,
  ListChecks,
  RotateCcw,
  Shield,
  Star,
} from "lucide-react";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { haptic } from "@/lib/telegram";
import { useAppStore } from "@/store/app-store";
import { FACTION_TASKS, TASKS } from "@/data/tasks";
import {
  completedCount,
  earnedBp,
  farmDayIndex,
  formatHms,
  multiplierOf,
  msToNextReset,
  TOTAL_BASE_BP,
  TOTAL_TASKS,
} from "@/lib/farm";
import { cn } from "@/lib/utils";
import {
  EmptyState,
  fadeUpItem,
  HudCard,
  SectionHeading,
  staggerContainer,
  StatReadout,
} from "@/components/miniapp/hud-card";
import { TaskRow } from "@/components/miniapp/task-row";

const listStagger: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.015, delayChildren: 0.02 } },
};

/** Обратный отсчёт до сброса дня (07:00 МСК) */
function ResetTimer() {
  const [ms, setMs] = useState(() => msToNextReset());

  useEffect(() => {
    const id = window.setInterval(() => setMs(msToNextReset()), 1000);
    return () => window.clearInterval(id);
  }, []);

  return <span className="font-mono text-[11px] tnum text-primary">{formatHms(ms)}</span>;
}

interface ModRowProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  checked: boolean;
  onToggle: (value: boolean) => void;
}

function ModRow({ icon: Icon, title, desc, checked, onToggle }: ModRowProps) {
  return (
    <div className="flex items-center gap-3 py-3 first:pt-3 last:pb-0">
      <div className="cut-tl-sm grid size-9 shrink-0 place-items-center border border-white/12 bg-[#202429]">
        <Icon className="size-4 text-primary/90" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium text-secondary-foreground">{title}</p>
        <p className="text-[10px] leading-snug text-muted-foreground">{desc}</p>
      </div>
      <Switch checked={checked} onCheckedChange={onToggle} aria-label={title} />
    </div>
  );
}

interface GroupLabelProps {
  icon: LucideIcon;
  label: string;
  count: number;
  total: number;
}

function GroupLabel({ icon: Icon, label, count, total }: GroupLabelProps) {
  return (
    <div className="sticky top-[57px] z-20 flex items-center gap-2.5 border-b border-white/10 bg-[#141619] py-2.5">
      <Icon className="size-3.5 shrink-0 text-primary" />
      <span className="font-display text-[10px] font-semibold uppercase tracking-[0.22em] text-secondary-foreground">
        {label}
      </span>
      <span className="font-mono text-[10px] tnum text-muted-foreground">
        {count}/{total}
      </span>
      <span className="h-px flex-1 bg-white/10" />
    </div>
  );
}

export function FarmScreen() {
  const farm = useAppStore((s) => s.farm);
  const setVip = useAppStore((s) => s.setVip);
  const setX2 = useAppStore((s) => s.setX2);
  const toggleTask = useAppStore((s) => s.toggleTask);
  const incTask = useAppStore((s) => s.incTask);
  const decTask = useAppStore((s) => s.decTask);
  const toggleFavorite = useAppStore((s) => s.toggleFavorite);
  const setOnlyFavorites = useAppStore((s) => s.setOnlyFavorites);
  const resetDayMarks = useAppStore((s) => s.resetDayMarks);
  const syncFarmDay = useAppStore((s) => s.syncFarmDay);
  const { haptics } = useAppStore((s) => s.settings);

  const mult = multiplierOf(farm.vip, farm.x2);
  const completed = completedCount(farm.completions);
  const earned = earnedBp(farm.completions, farm.vip, farm.x2);
  const maxBp = TOTAL_BASE_BP * mult;
  const favCount = farm.favorites.length;

  // Сверка игрового дня: перешли через 07:00 МСК — отметки обнуляются
  useEffect(() => {
    const check = () => {
      if (useAppStore.getState().farm.dayIndex !== farmDayIndex()) syncFarmDay();
    };
    check();
    const id = window.setInterval(check, 30_000);
    return () => window.clearInterval(id);
  }, [syncFarmDay]);

  const handleToggle = useCallback(
    (id: string) => {
      toggleTask(id);
      haptic("select", haptics);
    },
    [toggleTask, haptics]
  );

  const handleInc = useCallback(
    (id: string) => {
      incTask(id);
      haptic("tap", haptics);
    },
    [incTask, haptics]
  );

  const handleDec = useCallback(
    (id: string) => {
      decTask(id);
      haptic("tap", haptics);
    },
    [decTask, haptics]
  );

  const handleFav = useCallback(
    (id: string) => {
      toggleFavorite(id);
      haptic("tap", haptics);
    },
    [toggleFavorite, haptics]
  );

  const handleVip = useCallback(
    (value: boolean) => {
      setVip(value);
      haptic("select", haptics);
    },
    [setVip, haptics]
  );

  const handleX2 = useCallback(
    (value: boolean) => {
      setX2(value);
      haptic("select", haptics);
    },
    [setX2, haptics]
  );

  const handleFilter = useCallback(() => {
    setOnlyFavorites(!farm.onlyFavorites);
    haptic("select", haptics);
  }, [farm.onlyFavorites, setOnlyFavorites, haptics]);

  const handleResetMarks = useCallback(() => {
    resetDayMarks();
    haptic("warning", haptics);
    toast.success("Отметки сброшены", {
      description: "Избранные задания и настройки не тронуты.",
    });
  }, [resetDayMarks, haptics]);

  const showGeneral = farm.onlyFavorites
    ? TASKS.filter((t) => farm.favorites.includes(t.id))
    : TASKS;
  const showFaction = farm.onlyFavorites
    ? FACTION_TASKS.filter((t) => farm.favorites.includes(t.id))
    : FACTION_TASKS;
  const totalVisible = showGeneral.length + showFaction.length;

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4"
    >
      <motion.div variants={fadeUpItem}>
        <SectionHeading
          kicker="Раздел 02"
          title="Фарм BP"
          desc="Отмечай выполненные задания — статистика, избранное и сброс дня считаются автоматически."
        />
      </motion.div>

      {/* ===== Статистика дня ===== */}
      <motion.div variants={fadeUpItem}>
        <HudCard glow>
          <div className="grid grid-cols-2 gap-3">
            <StatReadout
              label="Выполнено"
              value={String(completed)}
              unit={`из ${TOTAL_TASKS}`}
              barPct={(completed / TOTAL_TASKS) * 100}
            />
            <StatReadout
              label="Получено"
              value={String(earned)}
              unit="BP"
              barPct={maxBp > 0 ? Math.min(100, (earned / maxBp) * 100) : 0}
            />
          </div>
          <div className="mt-3.5 flex items-center justify-between gap-2 border-t border-white/10 pt-3">
            <p className="text-[10px] uppercase tracking-[0.14em] text-muted-foreground">
              Сброс 07:00 МСК · макс {maxBp} BP
            </p>
            <ResetTimer />
          </div>
        </HudCard>
      </motion.div>

      {/* ===== Модификаторы награды ===== */}
      <motion.div variants={fadeUpItem}>
        <HudCard>
          <div className="flex items-center justify-between gap-3">
            <p className="font-display text-[10px] font-medium uppercase tracking-[0.22em] text-primary">
              {"// Модификаторы награды"}
            </p>
            <span
              className={cn(
                "cut-tr-sm border px-2 py-0.5 font-display text-[10px] font-semibold tnum",
                mult > 1
                  ? "hud-glow border-primary/50 bg-primary/15 text-primary"
                  : "border-white/15 bg-white/5 text-muted-foreground"
              )}
            >
              ×{mult}
            </span>
          </div>
          <div className="mt-1 divide-y divide-white/8">
            <ModRow
              icon={Crown}
              title="Platinum VIP"
              desc="Удваивает награду за задания"
              checked={farm.vip}
              onToggle={handleVip}
            />
            <ModRow
              icon={Flame}
              title="X2 акция"
              desc="Событие проекта: награда ×2"
              checked={farm.x2}
              onToggle={handleX2}
            />
          </div>
          {mult > 1 ? (
            <p className="mt-3 text-[10px] leading-relaxed text-muted-foreground">
              1 BP базовой награды превращается в {mult} BP.
            </p>
          ) : null}
        </HudCard>
      </motion.div>

      {/* ===== Фильтр избранного + сброс отметок ===== */}
      <motion.div variants={fadeUpItem} className="flex items-center gap-3">
        <button
          type="button"
          onClick={handleFilter}
          aria-pressed={farm.onlyFavorites}
          className={cn(
            "cut-tr-sm inline-flex h-10 flex-1 items-center justify-center gap-2 px-4 font-display text-[11px] font-semibold uppercase tracking-[0.14em] transition-all",
            farm.onlyFavorites
              ? "hud-glow bg-gradient-to-b from-[#ff9430] to-[#ff6f10] text-primary-foreground"
              : "border border-white/15 bg-[#22262c] text-secondary-foreground hover:border-primary/45 hover:text-primary"
          )}
        >
          <Star
            className={cn("size-4 shrink-0", farm.onlyFavorites && "fill-primary-foreground")}
          />
          <span className="truncate">Только избранные</span>
          {favCount > 0 ? (
            <span className="font-mono text-[10px] tnum opacity-80">{favCount}</span>
          ) : null}
        </button>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <button
              type="button"
              aria-label="Сбросить отметки за сегодня"
              className="grid size-10 shrink-0 place-items-center border border-white/15 bg-[#22262c] text-muted-foreground transition-colors hover:border-primary/45 hover:text-primary"
            >
              <RotateCcw className="size-4" />
            </button>
          </AlertDialogTrigger>
          <AlertDialogContent className="max-w-[88vw] rounded-md border-white/15 bg-popover">
            <AlertDialogHeader>
              <AlertDialogTitle className="font-display uppercase tracking-[0.08em]">
                Сбросить отметки?
              </AlertDialogTitle>
              <AlertDialogDescription className="text-xs leading-relaxed">
                Все галочки и счётчики за сегодня обнулятся. Избранные задания и настройки
                останутся без изменений.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="gap-2.5">
              <AlertDialogCancel className="mt-0 border-white/15 bg-[#22262c] text-xs uppercase">
                Отмена
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={handleResetMarks}
                className="bg-primary text-xs uppercase hover:bg-primary/85"
              >
                Сбросить
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </motion.div>

      {/* ===== Список заданий ===== */}
      <motion.div
        key={farm.onlyFavorites ? "favorites" : "all"}
        variants={listStagger}
        initial="hidden"
        animate="show"
        className="flex flex-col gap-2"
      >
        {showGeneral.length > 0 ? (
          <GroupLabel
            icon={ListChecks}
            label="Задания"
            count={showGeneral.length}
            total={TASKS.length}
          />
        ) : null}
        {showGeneral.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            count={farm.completions[t.id] ?? 0}
            favorite={farm.favorites.includes(t.id)}
            mult={mult}
            onToggle={handleToggle}
            onInc={handleInc}
            onDec={handleDec}
            onFav={handleFav}
          />
        ))}

        {showFaction.length > 0 ? (
          <GroupLabel
            icon={Shield}
            label="Фракционные"
            count={showFaction.length}
            total={FACTION_TASKS.length}
          />
        ) : null}
        {showFaction.map((t) => (
          <TaskRow
            key={t.id}
            task={t}
            count={farm.completions[t.id] ?? 0}
            favorite={farm.favorites.includes(t.id)}
            mult={mult}
            onToggle={handleToggle}
            onInc={handleInc}
            onDec={handleDec}
            onFav={handleFav}
          />
        ))}

        {farm.onlyFavorites && totalVisible === 0 ? (
          <EmptyState
            icon={Star}
            title="Нет избранных"
            text="Нажми на звёздочку рядом с заданием — оно появится в этом фильтре."
            badge="Фильтр"
          />
        ) : null}
      </motion.div>
    </motion.div>
  );
}
