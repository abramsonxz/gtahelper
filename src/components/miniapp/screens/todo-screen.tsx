"use client";

import { useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Check, ListTodo, Pin, Plus, Star, Trash2, X } from "lucide-react";

import { haptic } from "@/lib/telegram";
import { useAppStore, type TodoItem } from "@/store/app-store";
import { formatClock } from "@/data/timers";
import { cn } from "@/lib/utils";
import {
  EmptyState,
  fadeUpItem,
  SectionHeading,
  staggerContainer,
} from "@/components/miniapp/hud-card";

interface TodoRowProps {
  todo: TodoItem;
  onToggleDone: (id: string) => void;
  onToggleStar: (id: string) => void;
  onRemove: (id: string) => void;
  hapticsEnabled: boolean;
}

function TodoRow({ todo, onToggleDone, onToggleStar, onRemove, hapticsEnabled }: TodoRowProps) {
  const toggleDone = () => {
    onToggleDone(todo.id);
    // отметка выполненной — «успешная» вибрация, снятие — обычный отклик
    haptic(todo.done ? "select" : "success", hapticsEnabled);
  };

  const toggleStar = () => {
    onToggleStar(todo.id);
    haptic("select", hapticsEnabled);
  };

  const remove = () => {
    onRemove(todo.id);
    haptic("warning", hapticsEnabled);
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, x: -16, transition: { duration: 0.18 } }}
      transition={{ type: "spring", stiffness: 480, damping: 42 }}
      className={cn(
        "cut-tr flex items-start gap-3 border px-3.5 py-3",
        todo.starred
          ? "border-primary/45 bg-[#221d18]"
          : "border-white/12 bg-[#1b1e22]",
        todo.done && !todo.starred && "bg-[#161a17]"
      )}
    >
      {/* Чекбокс выполнения */}
      <button
        type="button"
        onClick={toggleDone}
        aria-pressed={todo.done}
        aria-label={todo.done ? `Снять выполнение: ${todo.title}` : `Выполнено: ${todo.title}`}
        className={cn(
          "cut-tl-sm mt-0.5 grid size-[22px] shrink-0 place-items-center border transition-colors",
          todo.done
            ? "border-[#79c141]/60 bg-[#79c141]/15 text-[#79c141]"
            : "border-white/15 bg-[#202429] text-transparent hover:border-primary/40"
        )}
      >
        <Check className="size-3.5" strokeWidth={3.5} />
      </button>

      {/* Название + метаданные */}
      <div className="min-w-0 flex-1">
        <p
          className={cn(
            "text-[13px] font-medium leading-snug break-words",
            todo.done
              ? "text-muted-foreground line-through decoration-muted-foreground/50"
              : "text-foreground"
          )}
        >
          {todo.title}
        </p>
        {todo.done && todo.doneAt ? (
          <p className="mt-1 text-[10px] uppercase tracking-[0.14em] text-[#79c141]/80">
            выполнено в {formatClock(todo.doneAt)}
          </p>
        ) : null}
        {todo.starred && !todo.done ? (
          <p className="mt-1 flex items-center gap-1 text-[10px] uppercase tracking-[0.14em] text-primary/80">
            <Pin className="size-3" />
            закреплено
          </p>
        ) : null}
      </div>

      {/* Звезда */}
      <button
        type="button"
        onClick={toggleStar}
        aria-pressed={todo.starred}
        aria-label={todo.starred ? `Открепить: ${todo.title}` : `Закрепить: ${todo.title}`}
        className={cn(
          "mt-0.5 grid size-8 shrink-0 place-items-center transition-colors",
          todo.starred
            ? "text-primary"
            : "text-muted-foreground/50 hover:text-primary/80"
        )}
      >
        <Star
          className={cn("size-4", todo.starred && "fill-primary")}
        />
      </button>

      {/* Удаление — вручную */}
      <button
        type="button"
        onClick={remove}
        aria-label={`Удалить: ${todo.title}`}
        className="mt-0.5 grid size-8 shrink-0 place-items-center text-muted-foreground/50 transition-colors hover:text-destructive"
      >
        <X className="size-4" />
      </button>
    </motion.div>
  );
}

export function TodoScreen() {
  const todos = useAppStore((s) => s.todos);
  const addTodo = useAppStore((s) => s.addTodo);
  const toggleTodoDone = useAppStore((s) => s.toggleTodoDone);
  const toggleTodoStar = useAppStore((s) => s.toggleTodoStar);
  const removeTodo = useAppStore((s) => s.removeTodo);
  const removeDoneTodos = useAppStore((s) => s.removeDoneTodos);
  const { haptics } = useAppStore((s) => s.settings);

  const [draft, setDraft] = useState("");

  // Сортировка: закреплённые звёздочкой — всегда сверху (независимо от даты),
  // дальше обычные. Внутри групп — новые сверху.
  const sorted = useMemo(
    () =>
      [...todos].sort((a, b) => {
        if (a.starred !== b.starred) return a.starred ? -1 : 1;
        return b.createdAt - a.createdAt;
      }),
    [todos]
  );

  const activeCount = todos.filter((t) => !t.done).length;
  const doneCount = todos.length - activeCount;

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    const clean = draft.trim();
    if (!clean) return;
    addTodo(clean);
    setDraft("");
    haptic("select", haptics);
  };

  const clearDone = () => {
    if (doneCount === 0) return;
    removeDoneTodos();
    haptic("warning", haptics);
  };

  return (
    <motion.div
      variants={staggerContainer}
      initial="hidden"
      animate="show"
      className="flex flex-col gap-4"
    >
      <motion.div variants={fadeUpItem}>
        <SectionHeading
          kicker="Раздел 04"
          title="TO-DO"
          desc="Планировщик внутриигровых задач: добавляй, отмечай выполненное и закрепляй важное звёздочкой."
        />
      </motion.div>

      {/* Форма добавления */}
      <motion.div variants={fadeUpItem}>
        <form onSubmit={submit} className="flex gap-2">
          <input
            type="text"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            placeholder="Новая задача…"
            maxLength={80}
            aria-label="Название новой задачи"
            className="cut-tr-sm h-11 min-w-0 flex-1 border border-white/12 bg-[#1b1e22] px-3.5 text-[13px] text-foreground outline-none transition-colors placeholder:text-muted-foreground/45 focus:border-primary/55"
          />
          <motion.button
            type="submit"
            whileTap={{ scale: 0.94 }}
            disabled={!draft.trim()}
            aria-label="Добавить задачу"
            className="hud-glow cut-tr-sm grid h-11 w-11 shrink-0 place-items-center bg-gradient-to-b from-[#ff9430] to-[#ff6f10] text-primary-foreground transition-opacity disabled:opacity-35"
          >
            <Plus className="size-5" strokeWidth={2.5} />
          </motion.button>
        </form>
      </motion.div>

      {/* Сводка */}
      <motion.div variants={fadeUpItem}>
        <div className="flex items-center justify-between border-b border-white/10 pb-2">
          <span className="text-[10px] uppercase tracking-[0.18em] text-muted-foreground">
            Активных: {activeCount}
            {doneCount > 0 ? ` · выполнено: ${doneCount}` : ""}
          </span>
          {doneCount > 0 ? (
            <button
              type="button"
              onClick={clearDone}
              className="flex items-center gap-1.5 text-[10px] uppercase tracking-[0.14em] text-muted-foreground/70 transition-colors hover:text-destructive"
            >
              <Trash2 className="size-3" />
              удалить выполненные
            </button>
          ) : (
            <span className="font-mono text-[10px] tnum text-muted-foreground/70">
              {todos.length} задач
            </span>
          )}
        </div>
      </motion.div>

      {/* Список задач */}
      {todos.length === 0 ? (
        <motion.div variants={fadeUpItem}>
          <EmptyState
            icon={ListTodo}
            title="Список пуст"
            text="Добавь первую задачу — например «Купить броню» или «Сдать экзамен в ЛСПД»."
            badge="Local"
          />
        </motion.div>
      ) : (
        <div className="flex flex-col gap-2.5">
          <AnimatePresence initial={false}>
            {sorted.map((todo) => (
              <TodoRow
                key={todo.id}
                todo={todo}
                onToggleDone={toggleTodoDone}
                onToggleStar={toggleTodoStar}
                onRemove={removeTodo}
                hapticsEnabled={haptics}
              />
            ))}
          </AnimatePresence>
        </div>
      )}

      {/* Подсказка */}
      <motion.div variants={fadeUpItem}>
        <p className="flex items-start gap-2 px-1 text-[10px] leading-relaxed text-muted-foreground">
          <Star className="mt-0.5 size-3.5 shrink-0 text-primary/70" />
          Звёздочка закрепляет задачу вверху списка. Выполненные остаются в
          списке, пока не удалишь вручную — авт очистки нет.
        </p>
      </motion.div>
    </motion.div>
  );
}
