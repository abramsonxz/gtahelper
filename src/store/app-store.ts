import { create } from "zustand";
import { persist } from "zustand/middleware";

import { farmDayIndex } from "@/lib/farm";

export type TabId = "home" | "farm" | "settings";

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

interface AppState {
  activeTab: TabId;
  nickname: string;
  settings: AppSettings;
  /** Сколько раз запускали приложение (счётчик живёт в localStorage) */
  visits: number;
  farm: FarmState;
  setActiveTab: (tab: TabId) => void;
  setNickname: (name: string) => void;
  updateSetting: <K extends keyof AppSettings>(key: K, value: AppSettings[K]) => void;
  setVip: (value: boolean) => void;
  setX2: (value: boolean) => void;
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

      setActiveTab: (activeTab) => set({ activeTab }),
      setNickname: (nickname) => set({ nickname: nickname.trim().slice(0, 24) }),
      updateSetting: (key, value) =>
        set((state) => ({ settings: { ...state.settings, [key]: value } })),

      setVip: (vip) => set((s) => ({ farm: { ...s.farm, vip } })),
      setX2: (x2) => set((s) => ({ farm: { ...s.farm, x2 } })),

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
        }),
    }),
    {
      name: STORAGE_KEY,
      version: 3,
      // v1→2 — оболочка без раздела фарма: добавляем ферму с чистого листа
      // v2→3 — убрали настройку «Звук интерфейса»: зачищаем устаревший ключ
      migrate: (persisted, version) => {
        const base = (persisted ?? {}) as Partial<AppState>;
        const farm = version < 2 || !base.farm ? initialFarm() : base.farm;
        if (base.settings) {
          const { sound: _removed, ...settings } = base.settings as AppSettings & {
            sound?: boolean;
          };
          base.settings = settings;
        }
        return { ...base, farm } as AppState;
      },
    }
  )
);
