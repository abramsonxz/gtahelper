"use client";

import { memo } from "react";
import { motion } from "framer-motion";
import type { Variants } from "framer-motion";
import { Check, Minus, Plus, Star } from "lucide-react";

import type { Task } from "@/data/tasks";
import { cn } from "@/lib/utils";

const listItem: Variants = {
  hidden: { opacity: 0, y: 10 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] },
  },
};

interface TaskRowProps {
  task: Task;
  /** Сколько раз выполнено сегодня (для повторяемых заданий) */
  count: number;
  favorite: boolean;
  /** Итоговый множитель (VIP × акция) */
  mult: number;
  onToggle: (id: string) => void;
  onInc: (id: string) => void;
  onDec: (id: string) => void;
  onFav: (id: string) => void;
}

function TaskRowInner({
  task,
  count,
  favorite,
  mult,
  onToggle,
  onInc,
  onDec,
  onFav,
}: TaskRowProps) {
  const done = count > 0;
  const eff = task.bp * mult;

  return (
    <motion.div
      variants={listItem}
      className={cn(
        "flex items-center gap-2.5 rounded-md border bg-[#1b1e22] px-3 py-2.5 transition-colors",
        done ? "border-primary/25" : "border-white/10 hover:border-white/20"
      )}
    >
      {/* Левая часть: чекбокс или счётчик повторов */}
      {task.repeatable ? (
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={() => onDec(task.id)}
            disabled={count === 0}
            aria-label={`Убрать выполнение: ${task.title}`}
            className="grid size-7 place-items-center border border-white/15 bg-[#22262c] text-muted-foreground transition-opacity disabled:pointer-events-none disabled:opacity-30"
          >
            <Minus className="size-3.5" />
          </button>
          <span
            className={cn(
              "w-6 text-center font-display text-sm font-semibold tnum",
              count > 0 ? "text-primary" : "text-muted-foreground/60"
            )}
          >
            {count}
          </span>
          <button
            type="button"
            onClick={() => onInc(task.id)}
            aria-label={`Отметить выполнение: ${task.title}`}
            className="grid size-7 place-items-center border border-primary/40 bg-primary/10 text-primary transition-colors hover:bg-primary/20"
          >
            <Plus className="size-3.5" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          role="checkbox"
          aria-checked={done}
          aria-label={`Выполнено: ${task.title}`}
          onClick={() => onToggle(task.id)}
          className={cn(
            "grid size-6 shrink-0 place-items-center border transition-all",
            done
              ? "hud-glow border-primary bg-gradient-to-b from-[#ff9430] to-[#ff6f10] text-primary-foreground"
              : "border-white/25 bg-[#22262c] text-transparent hover:border-primary/60"
          )}
        >
          <Check className="size-4" strokeWidth={3} />
        </button>
      )}

      {/* Название задания (нажатие = отметить/добавить повтор) */}
      <button
        type="button"
        onClick={task.repeatable ? () => onInc(task.id) : () => onToggle(task.id)}
        className="min-w-0 flex-1 text-left"
      >
        <p
          className={cn(
            "text-[13px] font-medium leading-snug text-secondary-foreground",
            done && "text-muted-foreground line-through decoration-white/25"
          )}
        >
          {task.title}
        </p>
        {task.note ? (
          <p className="mt-0.5 text-[10px] leading-snug text-muted-foreground">{task.note}</p>
        ) : null}
      </button>

      {/* Избранное */}
      <button
        type="button"
        onClick={() => onFav(task.id)}
        aria-label={favorite ? `Убрать из избранных: ${task.title}` : `В избранные: ${task.title}`}
        aria-pressed={favorite}
        className="grid size-8 shrink-0 place-items-center rounded-md transition-colors hover:bg-white/5"
      >
        <Star
          className={cn(
            "size-4 transition-colors",
            favorite
              ? "fill-primary text-primary"
              : "text-muted-foreground/50 hover:text-muted-foreground"
          )}
        />
      </button>

      {/* Награда с учётом множителя */}
      <div className="cut-bl flex h-7 shrink-0 items-center gap-1 border border-primary/35 bg-primary/10 pl-2 pr-2">
        {mult > 1 ? (
          <span className="text-[10px] tnum text-muted-foreground/70 line-through decoration-muted-foreground/50">
            {task.bp}
          </span>
        ) : null}
        <span className="font-display text-[13px] font-semibold tnum text-primary">{eff}</span>
        <span className="text-[8px] uppercase tracking-[0.16em] text-muted-foreground">BP</span>
        {task.repeatable && count > 0 ? (
          <span className="ml-0.5 font-mono text-[10px] tnum text-primary/80">×{count}</span>
        ) : null}
      </div>
    </motion.div>
  );
}

export const TaskRow = memo(TaskRowInner);
