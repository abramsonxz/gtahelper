import { create } from "zustand";
import { persist } from "zustand/middleware";

import { farmDayIndex } from "@/lib/farm";

export type TabId = "home" | "farm" | "timers" | "settings";

export interface AppSettings {
  /** Тактильный отклик при нажатиях (HapticFeedback) */
  haptics: boolean;
  /** Напоминания о сессиях фарма (заглушка на будущее) */
  notifications: boolean;
  /** Компактный интерфейс — меньше отступов */
  compact: boolean;
}

export const DEFAULT_SETTINGS: AppSettings = {
  haptics: true,
  notifications: false,
  compact: false,
};

export interface FarmState {
  /** Индекс игрового дня — меняется в 07:00 МСК, отметки сбрасываются */
  dayIndex: number;
  /** Platinum VIP — удваивает награды */
  vip: boolean;
  /** X2 акция проекта — удваивает награды */
  x2: boolean;
  /** Идентификаторы избранных заданий */
  favorites: string[];
  /** Отметки выполнения за текущий день: id задания → число выполнений */
  completions: Record<string, number>;
  /** Включён фильтр «Только избранные» */
  onlyFavorites: boolean;
}

/** id таймера → отметка времени окончания (мс). Отсутствие = не запущен */
export type Timers = Record<string, number>;

/** Подкатегория раздела «Таймеры» */
export type TimersView = "personal" | "clubs";

interface AppState {
  activeTab: TabId;
  nickname: string;
  settings: AppSettings;
  /** Сколько раз запускали приложение (счётчик живёт в localStorage) */
  visits: number;
  farm: FarmState;
  /** Персональные кулдауны: id таймера → время окончания */
  timers: Timers;
  /** Какая подкатегория таймеров открыта: обычные или клубы */
  timersView: TimersView;
  setActiveTab: (tab: TabId) => void;
  setTimersView: (view: TimersView) => void;
  setNickname: (name: string) => void;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  setVip: (value: boolean) => void;
  setX2: (value: boolean) => void;
  /** Запустить/перезапустить таймер: id + длительность в миллисекундах */
  startTimer: (id: string, durationMs: number) => void;
  /** Сбросить таймер в исходное (не запущен) состояние */
  resetTimer: (id: string) => void;
  toggleTask: (id: string) => void;
  incTask: (id: string) => void;
  decTask: (id: string) => void;
  toggleFavorite: (id: string) => void;
  setOnlyFavorites: (value: boolean) => void;
  /** Обнулить отметки вручную (избранное и настройки остаются) */
  resetDayMarks: () => void;
  /** Сверка игрового дня: если перешли 07:00 МСК — сбросить отметки */
  syncFarmDay: () => void;
  resetAll: () => void;
}

/** Ключ хранилища: живёт в localStorage, пока пользователь не очистит кеш Telegram */
export const STORAGE_KEY = "gta-farm-hub";

const initialFarm = (): FarmState => ({
  dayIndex: farmDayIndex(),
  vip: false,
  x2: false,
  favorites: [],
  completions: {},
  onlyFavorites: false,
});

export const useAppStore = create<AppState>()(
  persist(
    (set) => ({
      activeTab: "home",
      nickname: "",
      settings: { ...DEFAULT_SETTINGS },
      visits: 0,
      farm: initialFarm(),
      timers: {},
      timersView: "personal",

      setActiveTab: (activeTab) => set({ activeTab }),
      setTimersView: (timersView) => set({ timersView }),
      setNickname: (nickname) => set({ nickname: nickname.trim().slice(0, 24) }),
      updateSetting: (key, value) =>
        set((state) => ({ settings: { ...state.settings, [key]: value } })),

      setVip: (vip) => set((s) => ({ farm: { ...s.farm, vip } })),
      setX2: (x2) => set((s) => ({ farm: { ...s.farm, x2 } })),

      startTimer: (id, durationMs) =>
        set((s) => ({
          timers: { ...s.timers, [id]: Date.now() + durationMs },
        })),

      resetTimer: (id) =>
        set((s) => {
          if (!(id in s.timers)) return {};
          const timers = { ...s.timers };
          delete timers[id];
          return { timers };
        }),

      toggleTask: (id) =>
        set((s) => {
          const completions = { ...s.farm.completions };
          if (completions[id]) delete completions[id];
          else completions[id] = 1;
          return { farm: { ...s.farm, completions } };
        }),

      incTask: (id) =>
        set((s) => {
          const completions = { ...s.farm.completions };
          completions[id] = (completions[id] ?? 0) + 1;
          return { farm: { ...s.farm, completions } };
        }),

      decTask: (id) =>
        set((s) => {
          const current = s.farm.completions[id] ?? 0;
          if (current <= 0) return {};
          const completions = { ...s.farm.completions };
          if (current <= 1) delete completions[id];
          else completions[id] = current - 1;
          return { farm: { ...s.farm, completions } };
        }),

      toggleFavorite: (id) =>
        set((s) => ({
          farm: {
            ...s.farm,
            favorites: s.farm.favorites.includes(id)
              ? s.farm.favorites.filter((f) => f !== id)
              : [...s.farm.favorites, id],
          },
        })),

      setOnlyFavorites: (onlyFavorites) =>
        set((s) => ({ farm: { ...s.farm, onlyFavorites } })),

      resetDayMarks: () =>
        set((s) => ({ farm: { ...s.farm, completions: {} } })),

      syncFarmDay: () =>
        set((s) => {
          const dayIndex = farmDayIndex();
          if (s.farm.dayIndex === dayIndex) return {};
          return { farm: { ...s.farm, dayIndex, completions: {} } };
        }),

      resetAll: () =>
        set({
          activeTab: "home",
          nickname: "",
          settings: { ...DEFAULT_SETTINGS },
          visits: 0,
          farm: initialFarm(),
          timers: {},
          timersView: "personal",
        }),
    }),
    {
      name: STORAGE_KEY,
      version: 5,
      // v1→2 — оболочка без раздела фарма: добавляем ферму с чистого листа
      // v2→3 — убрали настройку «Звук интерфейса»: зачищаем устаревший ключ
      // v3→4 — раздел «Таймеры»: добавляем кулдауны с чистого листа
      // v4→5 — «Задание клуба» переехал в подкатегорию «Клубы»: чистим старый ключ
      migrate: (persisted, version) => {
        const base = (persisted ?? {}) as Partial<AppState>;
        const farm = version < 2 || !base.farm ? initialFarm() : base.farm;
        if (base.settings) {
          const { sound: _removed, ...settings } = base.settings as AppSettings & {
            sound?: boolean;
          };
          base.settings = settings;
        }
        const timers =
          version < 4 || !base.timers ? {} : { ...base.timers };
        delete timers["club-task"];
        const timersView =
          version < 5 || !base.timersView ? "personal" : base.timersView;
        return { ...base, farm, timers, timersView } as AppState;
      },
    }
  )
);
