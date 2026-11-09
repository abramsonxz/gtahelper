import { FACTION_TASKS, TASKS, type Task } from "@/data/tasks";

export const ALL_TASKS: Task[] = [...TASKS, ...FACTION_TASKS];
export const TOTAL_TASKS = ALL_TASKS.length;
/** Сумма всех базовых наград за один полный день (без модификаторов) */
export const TOTAL_BASE_BP = ALL_TASKS.reduce((sum, task) => sum + task.bp, 0);

const DAY_MS = 86_400_000;
/** 07:00 МСК = 04:00 UTC — момент ежедневного сброса отметок */
const RESET_OFFSET_MS = 4 * 3_600_000;

/**
 * Индекс текущего «игрового дня». Меняется в 07:00 МСК:
 * всё, что сделано до 07:00, относится к предыдущему дню.
 */
export function farmDayIndex(now: number = Date.now()): number {
  return Math.floor((now - RESET_OFFSET_MS) / DAY_MS);
}

/** Сколько миллисекунд осталось до следующего сброса (07:00 МСК) */
export function msToNextReset(now: number = Date.now()): number {
  return (farmDayIndex(now) + 1) * DAY_MS + RESET_OFFSET_MS - now;
}

/** Формат «ЧЧ:ММ:СС» для обратного отсчёта */
export function formatHms(ms: number): string {
  const total = Math.max(0, Math.floor(ms / 1000));
  const h = Math.floor(total / 3600);
  const m = Math.floor((total % 3600) / 60);
  const s = total % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

/** Итоговый множитель наград: Platinum VIP (×2) и X2 акция (×2) перемножаются */
export function multiplierOf(vip: boolean, x2: boolean): number {
  return (vip ? 2 : 1) * (x2 ? 2 : 1);
}

/** Сколько BP фактически получено за день (с учётом множителей) */
export function earnedBp(
  completions: Record<string, number>,
  vip: boolean,
  x2: boolean
): number {
  const mult = multiplierOf(vip, x2);
  return (
    ALL_TASKS.reduce((sum, task) => sum + (completions[task.id] ?? 0) * task.bp, 0) * mult
  );
}

/** Сколько заданий отмечено выполненными (счётчик > 0) */
export function completedCount(completions: Record<string, number>): number {
  return ALL_TASKS.reduce((sum, task) => sum + ((completions[task.id] ?? 0) > 0 ? 1 : 0), 0);
}
