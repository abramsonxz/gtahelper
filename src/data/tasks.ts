/**
 * Перечень заданий для фарма BP (GTA 5 RP).
 * Обновляй вручную, если награды на проекте изменятся.
 */

export interface Task {
  /** Стабильный id — по нему хранятся отметки в localStorage */
  id: string;
  title: string;
  /** Пояснение к заданию (необязательно) */
  note?: string;
  /** Базовая награда в BP без модификаторов */
  bp: number;
  /** Можно выполнять многократно за день (счётчик вместо галочки) */
  repeatable?: boolean;
}

/** Сортировка по награде: сверху самые «жирные» задания, внизу — мелкие */
const byBpDesc = (a: Task, b: Task): number => b.bp - a.bp;

/** Обычные задания — доступны всем (по убыванию награды) */
export const TASKS: Task[] = [
  { id: "online", title: "3 часа в онлайне", note: "Можно выполнять многократно за день", bp: 2, repeatable: true },
  { id: "casino-zeros", title: "Нули в казино", bp: 2 },
  { id: "construction", title: "25 действий на стройке", bp: 2 },
  { id: "port", title: "25 действий в порту", bp: 2 },
  { id: "mine", title: "25 действий в шахте", bp: 2 },
  { id: "dance-battle", title: "3 победы в Дэнс Баттлах", bp: 2 },
  { id: "business-materials", title: "Заказ материалов для бизнеса вручную", note: "Просто прожать вкл/выкл", bp: 1 },
  { id: "gym", title: "20 подходов в тренажёрном зале", bp: 1 },
  { id: "shooting-range", title: "Успешная тренировка в тире", bp: 1 },
  { id: "post-office", title: "10 посылок на почте", bp: 1 },
  { id: "film-rent", title: "Арендовать киностудию", bp: 2 },
  { id: "lottery", title: "Купить лотерейный билет", bp: 1 },
  { id: "karting", title: "Выиграть гонку в картинге", bp: 1 },
  { id: "farm-actions", title: "10 действий на ферме", note: "10 коров, 10 пшеницы и т.д. — один любой способ в день", bp: 1 },
  { id: "firefighter", title: "Потушить 25 «огоньков» пожарным", bp: 1 },
  { id: "treasure", title: "Выкопать 1 сокровище", note: "Не мусор", bp: 1 },
  { id: "street-race", title: "Проехать 1 уличную гонку", note: "Регистрация в телефоне, ставка от 1000$", bp: 1 },
  { id: "trucker", title: "Выполнить 3 заказа дальнобойщиком", note: "Кроме клубов", bp: 2 },
  { id: "surgery", title: "Два раза оплатить смену внешности у хирурга в EMS", bp: 2 },
  { id: "cinema-videos", title: "Добавить 5 видео в кинотеатре", bp: 1 },
  { id: "training-complex", title: "Выиграть 5 игр в тренировочном комплексе", note: "Со ставкой от 100$", bp: 1 },
  { id: "arena-games", title: "Выиграть 3 любых игры на арене", note: "Со ставкой от 100$", bp: 1 },
  { id: "bus-route", title: "2 круга на любом маршруте автобусника", bp: 2 },
  { id: "skinning", title: "5 раз снять 100% шкуру с животных", bp: 2 },
  { id: "browser-visit", title: "Посетить любой сайт в браузере", bp: 1 },
  { id: "brawl-channel", title: "Зайти в любой канал в Brawl", bp: 1 },
  { id: "match-like", title: "Поставить лайк любой анкете в Match", bp: 1 },
  { id: "dp-case", title: "Прокрутить за DP кейс", note: "Серебряный, золотой или driver", bp: 10 },
  { id: "pet-ball", title: "Кинуть мяч питомцу 15 раз", bp: 2 },
  { id: "pet-commands", title: "15 выполненных питомцем команд", bp: 2 },
  { id: "wheel-of-luck", title: "Ставка в колесе удачи в казино", note: "Межсерверное колесо", bp: 3 },
  { id: "metro", title: "Проехать 1 станцию на метро", bp: 2 },
  { id: "fishing", title: "Поймать 20 рыб", bp: 4 },
  { id: "club-quests", title: "Выполнить 2 квеста любых клубов", bp: 4 },
  { id: "car-service", title: "Починить деталь в автосервисе", bp: 1 },
  { id: "basketball", title: "Забросить 2 мяча в баскетболе", bp: 1 },
  { id: "football", title: "Забить 2 гола в футболе", bp: 1 },
  { id: "armwrestling", title: "Победить в армрестлинге", bp: 1 },
  { id: "darts", title: "Победить в дартс", bp: 1 },
  { id: "volleyball", title: "Поиграть 1 минуту в волейбол", bp: 1 },
  { id: "table-tennis", title: "Поиграть 1 минуту в настольный теннис", bp: 1 },
  { id: "tennis", title: "Поиграть 1 минуту в большой теннис", bp: 1 },
  { id: "mafia", title: "Сыграть в мафию в казино", bp: 3 },
  { id: "leasing", title: "Сделать платеж по лизингу", bp: 1 },
  { id: "greenhouse", title: "Посадить траву в теплице", bp: 4 },
  { id: "lab-painkillers", title: "Запустить переработку обезболивающих", note: "В лаборатории", bp: 4 },
  { id: "airdrops", title: "Принять участие в двух аирдропах", bp: 4 },
  { id: "car-service-other", title: "Починить чужой автомобиль в автосервисе", note: "Прочность детали ниже 90%", bp: 2 },
].sort(byBpDesc);

/** Фракционные способы фарма (по убыванию награды) */
export const FACTION_TASKS: Task[] = [
  { id: "graffiti", title: "7 закрашенных граффити", bp: 1 },
  { id: "contraband", title: "Сдать 5 контрабанды", bp: 2 },
  { id: "captures", title: "Участие в каптах/бизварах", bp: 1 },
  { id: "hummer-vzh", title: "Сдать Хаммер с ВЗХ", bp: 3 },
  { id: "medcards", title: "5 выданных медкарт в EMS", bp: 2 },
  { id: "ems-calls", title: "Закрыть 15 вызовов в EMS", bp: 2 },
  { id: "wn-ads", title: "Отредактировать 40 объявлений в WN", bp: 2 },
  { id: "locks", title: "Взломать 15 замков", note: "Ограбления домов или автоугоны", bp: 2 },
  { id: "codes", title: "Закрыть 5 кодов в силовых структурах", bp: 2 },
  { id: "lspd-register", title: "Поставить на учёт 2 автомобиля", note: "Для LSPD", bp: 1 },
  { id: "arrest", title: "Произвести 1 арест в КПЗ", bp: 1 },
  { id: "bail-out", title: "Выкупить двух человек из КПЗ", bp: 2 },
].sort(byBpDesc);
