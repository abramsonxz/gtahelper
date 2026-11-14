"use client";

import {
  Home,
  ListChecks,
  ListTodo,
  Settings2,
  Timer,
  type LucideIcon,
} from "lucide-react";
import { motion } from "framer-motion";

import { cn } from "@/lib/utils";
import { haptic } from "@/lib/telegram";
import { useAppStore, type TabId } from "@/store/app-store";

const TABS: { id: TabId; label: string; icon: LucideIcon }[] = [
  { id: "home", label: "Главная", icon: Home },
  { id: "farm", label: "Фарм BP", icon: ListChecks },
  { id: "timers", label: "Таймеры", icon: Timer },
  { id: "todo", label: "TO-DO", icon: ListTodo },
  { id: "settings", label: "Настройки", icon: Settings2 },
];

/** Нижняя навигация в стиле HUD с оранжевым индикатором активного таба */
export function TabBar() {
  const activeTab = useAppStore((s) => s.activeTab);
  const setActiveTab = useAppStore((s) => s.setActiveTab);
  const { haptics } = useAppStore((s) => s.settings);

  const select = (id: TabId) => {
    if (id === activeTab) return;
    setActiveTab(id);
    haptic("select", haptics);
  };

  return (
    <nav
      aria-label="Навигация по разделам"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-white/10 bg-[#15171a]/95 backdrop-blur-xl"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <div className="mx-auto grid w-full max-w-md grid-cols-5">
        {TABS.map((tab) => {
          const active = tab.id === activeTab;
          return (
            <motion.button
              key={tab.id}
              type="button"
              whileTap={{ scale: 0.94 }}
              onClick={() => select(tab.id)}
              aria-current={active ? "page" : undefined}
              className="relative flex h-16 flex-col items-center justify-center gap-1"
            >
              {active ? (
                <motion.span
                  layoutId="tab-notch"
                  className="hud-glow absolute top-0 h-[3px] w-10 bg-primary"
                  transition={{ type: "spring", stiffness: 420, damping: 34 }}
                />
              ) : null}

              <tab.icon
                className={cn(
                  "size-5 transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              />
              <span
                className={cn(
                  "font-display text-[9px] font-medium uppercase tracking-[0.1em] transition-colors",
                  active ? "text-primary" : "text-muted-foreground"
                )}
              >
                {tab.label}
              </span>
            </motion.button>
          );
        })}
      </div>
    </nav>
  );
}
