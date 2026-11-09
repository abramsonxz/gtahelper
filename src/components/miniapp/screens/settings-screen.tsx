"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { toast } from "sonner";
import {
  Bell,
  Database,
  Minimize2,
  Trash2,
  Vibrate,
  type LucideIcon,
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
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { haptic, useTelegram } from "@/lib/telegram";
import { STORAGE_KEY, useAppStore, type AppSettings } from "@/store/app-store";
import {
  fadeUpItem,
  HudButton,
  HudCard,
  SectionHeading,
  staggerContainer,
} from "@/components/miniapp/hud-card";

interface SettingRowProps {
  icon: LucideIcon;
  title: string;
  desc: string;
  checked: boolean;
  onToggle: (value: boolean) => void;
}

function SettingRow({ icon: Icon, title, desc, checked, onToggle }: SettingRowProps) {
  return (
    <div className="flex items-center gap-3 py-3 first:pt-0 last:pb-0">
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

function InfoRow({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between gap-3 py-1.5">
      <p className="text-xs text-muted-foreground">{label}</p>
      <div className="min-w-0 text-right">{value}</div>
    </div>
  );
}

export function SettingsScreen() {
  const nickname = useAppStore((s) => s.nickname);
  const setNickname = useAppStore((s) => s.setNickname);
  const settings = useAppStore((s) => s.settings);
  const updateSetting = useAppStore((s) => s.updateSetting);
  const visits = useAppStore((s) => s.visits);
  const resetAll = useAppStore((s) => s.resetAll);

  const { haptics } = settings;
  const { user } = useTelegram();

  const [draft, setDraft] = useState(nickname);
  const [storageBytes, setStorageBytes] = useState(0);

  // Держим черновик ника в синхроне со стором (например, после сброса данных)
  useEffect(() => {
    setDraft(nickname);
  }, [nickname]);

  // Считаем фактический объём localStorage-записи приложения
  useEffect(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      setStorageBytes(raw ? new Blob([raw]).size : 0);
    } catch {
      setStorageBytes(0);
    }
  }, [nickname, settings, visits]);

  const sizeLabel =
    storageBytes < 1024
      ? `${storageBytes} Б`
      : `${(storageBytes / 1024).toFixed(1)} КБ`;

  const displayName = nickname || user?.first_name || "Игрок";
  const initials = displayName.trim().slice(0, 2).toUpperCase() || "GF";

  const saveNickname = () => {
    setNickname(draft);
    haptic("success", haptics);
    toast.success("Ник сохранён", {
      description: "Теперь он закреплён за тобой локально.",
    });
  };

  const toggle = (key: keyof AppSettings) => (value: boolean) => {
    updateSetting(key, value);
    haptic("select", haptics);
    if (key === "compact" && value) {
      toast("Компактный режим включён", {
        description: "Отступы в карточках стали меньше.",
      });
    }
  };

  const wipe = () => {
    resetAll();
    haptic("warning", haptics);
    toast.success("Данные очищены", {
      description: "Приложение вернулось к настройкам по умолчанию.",
    });
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
          kicker="Раздел 03"
          title="Настройки"
          desc="Профиль, поведение приложения и локальные данные."
        />
      </motion.div>

      {/* ===== Профиль ===== */}
      <motion.div variants={fadeUpItem}>
        <HudCard>
          <div className="flex items-center gap-3">
            <div className="hud-glow grid size-12 shrink-0 place-items-center rounded-full bg-gradient-to-br from-[#ff9430] to-[#ff6f10]">
              <span className="font-display text-lg font-bold text-primary-foreground">
                {initials}
              </span>
            </div>
            <div className="min-w-0">
              <p className="truncate font-display text-sm font-semibold uppercase tracking-[0.1em] text-foreground">
                {displayName}
              </p>
              <p className="truncate text-[10px] text-muted-foreground">
                {user?.username ? `@${user.username}` : "Локальный профиль"}
              </p>
            </div>
          </div>

          <Separator className="my-4 bg-white/10" />

          <div className="mb-2 flex items-center justify-between">
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground">
              Ник в игре
            </p>
            <span className="font-mono text-[10px] tnum text-muted-foreground">
              {draft.length}/24
            </span>
          </div>
          <div className="flex gap-2.5">
            <Input
              value={draft}
              onChange={(e) => setDraft(e.target.value.slice(0, 24))}
              maxLength={24}
              placeholder="Введи ник"
              aria-label="Ник в игре"
              className="h-10 border-white/15 bg-[#15171b] text-sm"
            />
            <HudButton
              primary
              label="Сохранить"
              className="h-10 w-auto shrink-0 px-4"
              onClick={saveNickname}
            />
          </div>
          <p className="mt-2.5 text-[10px] leading-relaxed text-muted-foreground">
            Ник появится в приветствии на главной. Хранится только на твоём устройстве.
          </p>
        </HudCard>
      </motion.div>

      {/* ===== Поведение приложения ===== */}
      <motion.div variants={fadeUpItem}>
        <HudCard>
          <p className="font-display text-[10px] font-medium uppercase tracking-[0.22em] text-primary">
            {"// Поведение"}
          </p>
          <div className="mt-2 divide-y divide-white/8">
            <SettingRow
              icon={Vibrate}
              title="Вибрация"
              desc="Тактильный отклик при нажатиях"
              checked={settings.haptics}
              onToggle={toggle("haptics")}
            />
            <SettingRow
              icon={Bell}
              title="Уведомления"
              desc="Напоминания о сессиях фарма"
              checked={settings.notifications}
              onToggle={toggle("notifications")}
            />
            <SettingRow
              icon={Minimize2}
              title="Компактный режим"
              desc="Меньше отступов — больше данных"
              checked={settings.compact}
              onToggle={toggle("compact")}
            />
          </div>
        </HudCard>
      </motion.div>

      {/* ===== Данные ===== */}
      <motion.div variants={fadeUpItem}>
        <HudCard>
          <p className="font-display text-[10px] font-medium uppercase tracking-[0.22em] text-primary">
            {"// Данные"}
          </p>
          <div className="mt-2.5">
            <InfoRow
              label="Объём локальных данных"
              value={<span className="font-mono text-[11px] tnum text-primary">{sizeLabel}</span>}
            />
            <InfoRow
              label="Запусков приложения"
              value={<span className="font-mono text-[11px] tnum text-primary">{visits}</span>}
            />
          </div>
          <p className="mt-2.5 flex items-start gap-2 text-[10px] leading-relaxed text-muted-foreground">
            <Database className="mt-0.5 size-3.5 shrink-0" />
            Всё хранится в localStorage Mini App и удаляется только при очистке кеша Telegram.
          </p>

          <AlertDialog>
            <AlertDialogTrigger asChild>
              <button
                type="button"
                className="cut-tr-sm mt-4 inline-flex h-10 w-full items-center justify-center gap-2 border border-destructive/50 bg-destructive/10 font-display text-[11px] font-semibold uppercase tracking-[0.16em] text-destructive transition-colors hover:bg-destructive/20"
              >
                <Trash2 className="size-4" />
                Очистить все данные
              </button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-[88vw] rounded-md border-white/15 bg-popover">
              <AlertDialogHeader>
                <AlertDialogTitle className="font-display uppercase tracking-[0.08em]">
                  Снести всё?
                </AlertDialogTitle>
                <AlertDialogDescription className="text-xs leading-relaxed">
                  Ник, настройки и локальная статистика будут удалены безвозвратно. Приложение
                  вернётся к состоянию первого запуска.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter className="gap-2.5">
                <AlertDialogCancel className="mt-0 border-white/15 bg-[#22262c] text-xs uppercase">
                  Отмена
                </AlertDialogCancel>
                <AlertDialogAction
                  onClick={wipe}
                  className="bg-destructive text-xs uppercase hover:bg-destructive/85"
                >
                  Очистить
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </HudCard>
      </motion.div>
    </motion.div>
  );
}
