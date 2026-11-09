"use client";

import * as React from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import type { LucideIcon } from "lucide-react";

import { cn } from "@/lib/utils";

/* ============ Общие варианты анимаций ============ */

export const staggerContainer: Variants = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.04 } },
};

export const fadeUpItem: Variants = {
  hidden: { opacity: 0, y: 16 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.45, ease: [0.22, 1, 0.36, 1] },
  },
};

/* ============ Заголовок раздела в стиле HUD ============ */

interface SectionHeadingProps {
  kicker: string;
  title: string;
  desc?: string;
}

export function SectionHeading({ kicker, title, desc }: SectionHeadingProps) {
  return (
    <div className="pt-1 pb-0.5">
      <p className="font-display text-[10px] font-medium uppercase tracking-[0.26em] text-primary">
        {"// "}
        {kicker}
      </p>
      <h1 className="mt-1 font-display text-2xl font-semibold uppercase tracking-[0.06em] leading-tight text-foreground">
        {title}
      </h1>
      {desc ? (
        <p className="mt-1.5 text-xs leading-relaxed text-muted-foreground">{desc}</p>
      ) : null}
    </div>
  );
}

/* ============ Карточка HUD ============ */

interface HudCardProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Оранжевая подсветка рамки */
  glow?: boolean;
}

export function HudCard({ glow, className, children, ...rest }: HudCardProps) {
  return (
    <div
      className={cn(
        "hud-card relative rounded-md border bg-gradient-to-b from-[#1e2126] to-[#191c20] p-5",
        glow ? "border-primary/40" : "border-white/10",
        className
      )}
      {...rest}
    >
      {/* тонкая оранжевая линия-акцент сверху слева */}
      <span className="absolute left-0 top-0 h-px w-16 bg-primary/60" />
      {children}
    </div>
  );
}

/* ============ HUD-счётчик статистики ============ */

interface StatReadoutProps {
  label: string;
  value: string;
  unit?: string;
  /** длина мини-полосы под числом, % */
  barPct?: number;
}

export function StatReadout({ label, value, unit, barPct = 0 }: StatReadoutProps) {
  return (
    <div className="group relative overflow-hidden rounded-md border border-white/10 bg-[#1b1e22] px-3.5 py-3 transition-colors hover:border-primary/35">
      <span className="absolute left-0 top-0 h-px w-8 bg-primary/50" />
      <p className="text-[9px] uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
      <p className="mt-1.5 font-display text-2xl font-semibold leading-none tnum text-foreground">
        {value}
        {unit ? (
          <span className="ml-1 text-xs font-medium text-muted-foreground">{unit}</span>
        ) : null}
      </p>
      <div className="mt-2.5 h-[3px] overflow-hidden bg-white/10">
        <motion.div
          className="h-full bg-gradient-to-r from-[#ff9a2e] to-primary"
          initial={{ width: 0 }}
          animate={{ width: `${Math.max(barPct, 3)}%` }}
          transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
        />
      </div>
    </div>
  );
}

/* ============ Кнопка HUD (скошенный угол) ============ */

interface HudButtonProps {
  icon?: LucideIcon;
  label: string;
  primary?: boolean;
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
}

export function HudButton({
  icon: Icon,
  label,
  primary,
  fullWidth,
  className,
  onClick,
}: HudButtonProps) {
  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.96 }}
      onClick={onClick}
      className={cn(
        "cut-tr-sm inline-flex h-11 items-center justify-center gap-2 px-4 font-display text-[11px] font-semibold uppercase tracking-[0.14em] transition-all",
        fullWidth && "w-full",
        primary
          ? "hud-glow bg-gradient-to-b from-[#ff9430] to-[#ff6f10] text-primary-foreground"
          : "border border-white/15 bg-[#22262c] text-secondary-foreground hover:border-primary/45 hover:text-primary",
        className
      )}
    >
      {Icon ? <Icon className="size-4 shrink-0" /> : null}
      <span className="truncate">{label}</span>
    </motion.button>
  );
}

/* ============ Пустое состояние-заглушка ============ */

interface EmptyStateProps {
  icon: LucideIcon;
  title: string;
  text: string;
  badge?: string;
}

export function EmptyState({ icon: Icon, title, text, badge }: EmptyStateProps) {
  return (
    <div className="relative flex flex-col items-center rounded-md border border-dashed border-white/20 bg-[#191c20]/60 px-6 py-10 text-center">
      <div className="relative grid size-16 place-items-center">
        <span className="absolute inset-0 rounded-full border border-primary/25 animate-hud-pulse" />
        <span className="absolute inset-2 rounded-full border border-primary/10" />
        <Icon className="size-7 text-primary" />
      </div>
      <h3 className="mt-5 font-display text-base font-semibold uppercase tracking-[0.12em] text-foreground">
        {title}
      </h3>
      <p className="mt-2 max-w-[30ch] text-xs leading-relaxed text-muted-foreground">{text}</p>
      {badge ? (
        <span className="cut-tr-sm animate-hud-pulse mt-4 border border-primary/45 bg-primary/15 px-2.5 py-1 font-display text-[9px] font-semibold uppercase tracking-[0.22em] text-primary">
          {badge}
        </span>
      ) : null}
    </div>
  );
}
