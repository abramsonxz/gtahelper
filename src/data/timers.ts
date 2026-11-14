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

export const TIMERS: TimerDef[] = [
  { id: "tir", title: "Тир", minutes: 90 },
  { id: "club-task", title: "Задание клуба", minutes: 120 },
  { id: "car-theft", title: "Угон авто", minutes: 90 },
  { id: "sutenerka", title: "Сутенёрка", minutes: 90 },
];

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
