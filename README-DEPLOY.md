# GTA FARM HUB — деплой на Vercel и запуск бота

Telegram Mini App для помощника фарма GTA 5 RP.
Стек: **Next.js 16 + TypeScript + Tailwind CSS 4**, данные — **localStorage**
(живут, пока пользователь не очистит кеш Telegram).

---

## 1. Деплой фронтенда на Vercel

### Вариант А — через GitHub (рекомендую)

1. Залей проект в репозиторий GitHub (без `node_modules`, `.next`, `db`).
2. Открой [vercel.com/new](https://vercel.com/new) → **Import** репозиторий.
3. Vercel сам определит Next.js — настройки по умолчанию менять не нужно.
4. Жми **Deploy**. Через минуту получишь URL вида
   `https://gta-farm-hub.vercel.app` (HTTPS обязателен для Mini App).

### Вариант Б — через Vercel CLI

```bash
npm i -g vercel
vercel login
vercel --prod
```

> Никаких переменных окружения не требуется: приложение пока что
> полностью клиентское, база не используется.

## 2. Привязка Mini App к боту

1. Получи токен бота у [@BotFather](https://t.me/BotFather) (`/newbot`).
2. Заполни `bot/bot.py`:
   ```python
   BOT_TOKEN = "токен_бота"
   WEBAPP_URL = "https://твой-проект.vercel.app"
   ```
3. Запусти бота:
   ```bash
   pip install -r bot/requirements.txt
   python bot/bot.py
   ```
4. Открой бота в Telegram → `/start` → кнопка «🟠 Открыть GTA FARM HUB».

Альтернатива без кода: `/mybots` → **Bot Settings** → **Menu Button** →
вставь URL с Vercel.

## 3. Локальный запуск

```bash
npm install
npm run dev      # http://localhost:3000
```

Вне Telegram приложение работает как обычный сайт (SDK подключается,
но фичи Telegram мягко отключаются) — удобно для разработки.

---

## Структура проекта

```
src/
  app/
    layout.tsx            # шрифты Oswald + Inter, viewport, Telegram SDK
    page.tsx              # оболочка: сплэш + переходы разделов + сверка игрового дня
    globals.css           # тема GTA HUD (тёмно-серый + оранжевый)
  data/tasks.ts           # перечень заданий и наград BP (48 обычных + 12 фракционных)
  lib/
    farm.ts               # игровой день (сброс 07:00 МСК), множители, статистика
    telegram.ts           # Telegram WebApp SDK, haptic
    sound.ts              # HUD-звуки (WebAudio)
  components/miniapp/
    app-header.tsx        # шапка с логотипом и счётчиком BP за сегодня
    tab-bar.tsx           # нижняя навигация (3 раздела)
    splash-screen.tsx     # загрузочный экран
    hud-card.tsx          # HUD-компоненты: карточки, счётчики, кнопки
    task-row.tsx          # строка задания: галочка, избранное, счётчик повторов, бейдж BP
    screens/
      home-screen.tsx     # Главная (живая статистика дня)
      farm-screen.tsx     # Фарм BP: задания, избранное, VIP/X2, сброс дня
      settings-screen.tsx # Настройки (рабочие)
  store/app-store.ts      # zustand + persist → localStorage (v2, с миграцией)
bot/
  bot.py                  # aiogram 3.x — бот-оболочка
  requirements.txt
```

## Как устроено хранение данных

- Ключ localStorage: `gta-farm-hub`
- Хранится: активный раздел, ник, настройки, избранное, отметки заданий,
  флаги Platinum VIP / X2, счётчик запусков
- Игровой день меняется в **07:00 МСК** — отметки выполненных заданий
  автоматически сбрасываются, избранное и настройки остаются
- Множители: Platinum VIP (×2) и X2 акция (×2) перемножаются — максимум ×4
- Удаляется: кнопкой «Сбросить отметки» (день), «Очистить все данные» (всё)
  либо при очистке кеша Telegram

## Что дальше (когда наполнишь разделы)

- **История фарма**: сохранять итоги дня (BP, задания) в отдельную запись —
  графики по неделям в разделе «Журнал»
- **Синхронизация с сервером** (по желанию): Next.js API routes + Prisma
  уже настроены в проекте, а для валидации пользователя передавай
  `initData` из `window.Telegram.WebApp` на бэкенд
