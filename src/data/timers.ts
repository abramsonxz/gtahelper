/**
 * Персональные кулдауны для фарма BP (GTA 5 RP).
 *
 * Таймер хранит отметку времени окончания (endsAt) — поэтому отсчёт
 * продолжается, даже если закрыть приложение: при следующем открытии
 * остаток считается от текущего времени.
 */

export interface TimerDef {
  /** Стабильный id — по нему хранится состояние в localStorage */
  id: string;
  title: string;
  /** Длительность в минутах */
  minutes: number;
}

/** Обычные кулдауны (подкатегория «Обычные») */
export const TIMERS: TimerDef[] = [
  { id: "tir", title: "Тир", minutes: 90 },
  { id: "car-theft", title: "Угон авто", minutes: 90 },
  { id: "sutenerka", title: "Сутенёрка", minutes: 90 },
];

/** Кулдауны клубов (подкатегория «Клубы») — у всех два часа */
export const CLUB_TIMERS: TimerDef[] = [
  { id: "club-rednecks", title: "Rednecks", minutes: 120 },
  { id: "club-motoclub", title: "MotoClub", minutes: 120 },
  { id: "club-epsilon", title: "Epsilon", minutes: 120 },
  { id: "club-merryweather", title: "Merryweather", minutes: 120 },
];

/** Все таймеры сразу — для сквозной логики (тосты завершения) */
export const ALL_TIMERS: TimerDef[] = [...TIMERS, ...CLUB_TIMERS];

/** «1 ч 30 мин» / «2 ч» — подпись длительности на карточке */
export function formatDuration(minutes: number): string {
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  if (h === 0) return `${m} мин`;
  if (m === 0) return `${h} ч`;
  return `${h} ч ${m} мин`;
}

/** «14:35» — время окончания по местным часам устройства */
export function formatClock(timestamp: number): string {
  const d = new Date(timestamp);
  const pad = (v: number) => String(v).padStart(2, "0");
  return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/** «1 таймер» / «4 таймера» — для подписей */
export function pluralTimer(n: number): string {
  const mod10 = n % 10;
  const mod100 = n % 100;
  if (mod10 === 1 && mod100 !== 11) return "таймер";
  if (mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14)) return "таймера";
  return "таймеров";
}
