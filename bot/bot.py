"""
GTA FARM HUB — Telegram-бот с Mini App (aiogram 3.x)

Бот служит «оболочкой» для Mini App: выдаёт кнопку запуска приложения
и закрепляет её в меню бота. Вся логика приложения живёт на фронтенде.

Запуск:
  1. pip install -r requirements.txt
  2. Получи токен у @BotFather и вставь его в BOT_TOKEN
  3. Задеплой Mini App на Vercel и укажи ссылку в WEBAPP_URL
  4. python bot.py
"""

import asyncio
import logging

from aiogram import Bot, Dispatcher
from aiogram.filters import CommandStart
from aiogram.types import (
    InlineKeyboardButton,
    InlineKeyboardMarkup,
    MenuButtonWebApp,
    Message,
    WebAppInfo,
)

# --- Настройки -------------------------------------------------------------
BOT_TOKEN = "ВСТАВЬ_СЮДА_ТОКЕН_ОТ_BOTFATHER"
WEBAPP_URL = "https://gta-farm-hub.vercel.app"  # URL Mini App после деплоя на Vercel
# ---------------------------------------------------------------------------

dp = Dispatcher()


def app_keyboard() -> InlineKeyboardMarkup:
    """Кнопка запуска Mini App прямо в чате."""
    return InlineKeyboardMarkup(
        inline_keyboard=[
            [
                InlineKeyboardButton(
                    text="🟠 Открыть GTA FARM HUB",
                    web_app=WebAppInfo(url=WEBAPP_URL),
                )
            ]
        ]
    )


@dp.message(CommandStart())
async def cmd_start(message: Message) -> None:
    await message.answer(
        "Йо! Это <b>GTA FARM HUB</b> — помощник фарма для GTA 5 RP.\n\n"
        "Жми кнопку ниже, чтобы открыть приложение 👇",
        reply_markup=app_keyboard(),
        parse_mode="HTML",
    )


async def main() -> None:
    logging.basicConfig(level=logging.INFO)
    if BOT_TOKEN.startswith("ВСТАВЬ"):
        raise SystemExit("❗ Сначала вставь BOT_TOKEN от @BotFather в bot.py")

    bot = Bot(BOT_TOKEN)

    # Кнопка меню бота (слева от поля ввода) тоже открывает Mini App
    await bot.set_chat_menu_button(
        menu_button=MenuButtonWebApp(
            text="Открыть приложение",
            web_app=WebAppInfo(url=WEBAPP_URL),
        )
    )

    # Webhook-инфо не нужен: поллим сами
    await dp.start_polling(bot)


if __name__ == "__main__":
    asyncio.run(main())
