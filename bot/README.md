# GTA FARM HUB — бот-оболочка (aiogram 3.x)

Бот нужен только для запуска Mini App: он выдаёт inline-кнопку и закрепляет
кнопку меню. Вся логика приложения — на фронтенде (Next.js, деплой на Vercel).

## Шаг 1. Создай бота в Telegram

1. Открой [@BotFather](https://t.me/BotFather)
2. `/newbot` → придумай имя и username
3. Скопируй токен вида `1234567:AA...`

## Шаг 2. Заполни константы в `bot.py`

```python
BOT_TOKEN = "твой_токен"
WEBAPP_URL = "https://имя-проекта.vercel.app"   # ссылка после деплоя на Vercel
```

## Шаг 3. Запусти бота

```bash
pip install -r requirements.txt
python bot.py
```

После запуска:
- `/start` в боте → inline-кнопка «Открыть GTA FARM HUB»
- Кнопка меню (слева от поля ввода) тоже открывает приложение

## Альтернатива: кнопка меню через BotFather (без кода)

`/mybots` → выбери бота → **Bot Settings** → **Menu Button** → `https://имя-проекта.vercel.app`

## Куда развивать дальше

- `bot.py` — сюда позже добавятся команды (`/farm`, `/stats`) и WebApp-data авторизация
  (`aiogram` умеет валидировать `initData` через `WebAppInitData`)
- Фронтенд уже читает `initDataUnsafe.user` — имя из Telegram подставляется в приветствие
