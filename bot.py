import telebot
import json
from datetime import datetime

TELEGRAM_TOKEN = "8364026426:AAFDzOSLhBZ94ekk6NMmv3vsoYNrsNoq-lM"
OWNER_ID = 1004898287

bot = telebot.TeleBot(TELEGRAM_TOKEN, parse_mode="HTML")

# --- Флаг состояния бота ---
bot_running = True

# --- Логи сообщений и удалённых сообщений ---
messages_log = {}
deleted_messages = []

# --- Функция проверки админа ---
def is_owner(message):
    return message.from_user.id == OWNER_ID

# --- Форматирование уведомлений ---
def format_message_notification(action, msg_type, content="", caption="", author_name="", message_date=""):
    if action == "deleted":
        emoji = "❌"
        title = "Сообщение удалено"
    elif action == "edited":
        emoji = "✏️"
        title = "Сообщение изменено"
    elif action == "old":
        emoji = "📜"
        title = "Старое сообщение"
    elif action == "new":
        emoji = "🆕"
        title = "Новое сообщение"
    else:
        emoji = ""
        title = action

    base_text = f"{emoji} <b>{title}</b>\n\n"
    base_text += f"👤 <b>Автор:</b> {author_name}\n"
    base_text += f"🕒 <b>Время:</b> {message_date}\n"
    base_text += f"📌 <b>Тип:</b> {msg_type}\n\n"

    if msg_type == "text":
        base_text += f"📝 <b>Текст:</b>\n{content}\n"
    elif msg_type == "photo":
        base_text += f"📷 Фото"
        if caption:
            base_text += f"\n💬 <b>Подпись:</b>\n{caption}\n"
    elif msg_type == "video":
        base_text += f"🎥 Видео"
        if caption:
            base_text += f"\n💬 <b>Подпись:</b>\n{caption}\n"
    elif msg_type == "document":
        base_text += f"📄 Документ"
        if caption:
            base_text += f"\n💬 <b>Подпись:</b>\n{caption}\n"
    elif msg_type == "audio":
        base_text += f"🎵 Аудио\n"
    elif msg_type == "voice":
        base_text += f"🎙 Голосовое сообщение\n"
    elif msg_type == "sticker":
        base_text += f"🛑 Стикер\n"
    elif msg_type == "animation":
        base_text += f"🎞 Анимация\n"
    elif msg_type == "location":
        base_text += f"📍 Локация:\n{content}\n"
    elif msg_type == "contact":
        base_text += f"📇 Контакт:\n{content}\n"

    return base_text

# --- Админская панель ---
@bot.message_handler(commands=['stop_bot'])
def stop_bot(message):
    global bot_running
    if not is_owner(message):
        bot.reply_to(message, "❌ У вас нет доступа!")
        return
    bot_running = False
    bot.reply_to(message, "🛑 Бот остановлен (все функции приостановлены)")

@bot.message_handler(commands=['start_bot'])
def start_bot(message):
    global bot_running
    if not is_owner(message):
        bot.reply_to(message, "❌ У вас нет доступа!")
        return
    bot_running = True
    bot.reply_to(message, "✅ Бот снова активен!")

@bot.message_handler(commands=['status'])
def status_bot(message):
    if not is_owner(message):
        bot.reply_to(message, "❌ У вас нет доступа!")
        return
    state = "🟢 Активен" if bot_running else "🔴 Остановлен"
    bot.reply_to(message, f"Состояние бота: {state}")

# --- Логирование сообщений ---
@bot.business_message_handler(content_types=['text','photo','video','document','audio','voice','sticker','animation','location','contact'])
def handle_message(message):
    if not bot_running:
        return

    chat_id = message.chat.id
    msg_id = message.message_id
    ctype = message.content_type

    log_data = {
        "type": ctype,
        "date": str(datetime.fromtimestamp(message.date)),
        "author_name": f"{message.from_user.first_name or ''} {message.from_user.last_name or ''}".strip() +
                       (f" (@{message.from_user.username})" if message.from_user.username else "")
    }

    if ctype == "text":
        log_data["content"] = message.text
    elif ctype == "photo":
        log_data["content"] = message.photo[-1].file_id
        log_data["caption"] = message.caption or ""
    elif ctype == "video":
        log_data["content"] = message.video.file_id
        log_data["caption"] = message.caption or ""
    elif ctype == "document":
        log_data["content"] = message.document.file_id
        log_data["caption"] = message.caption or ""
    elif ctype == "audio":
        log_data["content"] = message.audio.file_id
    elif ctype == "voice":
        log_data["content"] = message.voice.file_id
    elif ctype == "sticker":
        log_data["content"] = message.sticker.file_id
    elif ctype == "animation":
        log_data["content"] = message.animation.file_id
    elif ctype == "location":
        lat = message.location.latitude
        lon = message.location.longitude
        log_data["content"] = f"lat={lat}, lon={lon}"
    elif ctype == "contact":
        first_name = message.contact.first_name
        last_name = message.contact.last_name or ""
        phone = message.contact.phone_number
        log_data["content"] = f"{first_name} {last_name}, tel={phone}"

    messages_log[(chat_id, msg_id)] = log_data

# --- Отслеживание редактирования ---
@bot.edited_business_message_handler(content_types=['text','photo','video','document','audio','voice','sticker','animation','location','contact'])
def handle_edited_message(message):
    if not bot_running:
        return

    chat_id = message.chat.id
    msg_id = message.message_id
    old_data = messages_log.get((chat_id, msg_id))
    if not old_data:
        return

    ctype = message.content_type
    new_content = ""
    caption = ""

    if ctype == "text":
        new_content = message.text
    elif ctype == "photo":
        new_content = message.photo[-1].file_id
        caption = message.caption or ""
    elif ctype == "video":
        new_content = message.video.file_id
        caption = message.caption or ""
    elif ctype == "document":
        new_content = message.document.file_id
        caption = message.caption or ""
    elif ctype == "audio":
        new_content = message.audio.file_id
    elif ctype == "voice":
        new_content = message.voice.file_id
    elif ctype == "sticker":
        new_content = message.sticker.file_id
    elif ctype == "animation":
        new_content = message.animation.file_id
    elif ctype == "location":
        lat = message.location.latitude
        lon = message.location.longitude
        new_content = f"lat={lat}, lon={lon}"
    elif ctype == "contact":
        first_name = message.contact.first_name
        last_name = message.contact.last_name or ""
        phone = message.contact.phone_number
        new_content = f"{first_name} {last_name}, tel={phone}"

    author_name = old_data.get("author_name", "Неизвестно")
    message_date = old_data.get("date", str(datetime.now()))

    # Отправка старого сообщения
    text_old = format_message_notification("old", ctype, old_data.get("content"), old_data.get("caption",""), author_name, message_date)
    bot.send_message(OWNER_ID, text_old, parse_mode="HTML")

    # Отправка нового сообщения
    text_new = format_message_notification("new", ctype, new_content, caption, author_name, message_date)
    bot.send_message(OWNER_ID, text_new, parse_mode="HTML")

    # Медиа: отправляем файлы
    if ctype in ["photo", "video", "document", "audio", "voice", "animation"]:
        old_content = old_data.get("content")
        old_caption = old_data.get("caption", "")
        if ctype == "photo":
            bot.send_photo(OWNER_ID, old_content, caption="📷 Старое фото\n"+old_caption)
            bot.send_photo(OWNER_ID, new_content, caption="📷 Новое фото\n"+caption)
        elif ctype == "video":
            bot.send_video(OWNER_ID, old_content, caption="🎥 Старое видео\n"+old_caption)
            bot.send_video(OWNER_ID, new_content, caption="🎥 Новое видео\n"+caption)
        elif ctype == "document":
            bot.send_document(OWNER_ID, old_content, caption="📄 Старый документ\n"+old_caption)
            bot.send_document(OWNER_ID, new_content, caption="📄 Новый документ\n"+caption)
        elif ctype == "audio":
            bot.send_audio(OWNER_ID, old_content, caption="🎵 Старое аудио")
            bot.send_audio(OWNER_ID, new_content, caption="🎵 Новое аудио")
        elif ctype == "voice":
            bot.send_voice(OWNER_ID, old_content, caption="🎙 Старое голосовое сообщение")
            bot.send_voice(OWNER_ID, new_content, caption="🎙 Новое голосовое сообщение")
        elif ctype == "animation":
            bot.send_animation(OWNER_ID, old_content, caption="🎞 Старая анимация")
            bot.send_animation(OWNER_ID, new_content, caption="🎞 Новая анимация")

    # Обновляем лог
    messages_log[(chat_id, msg_id)]["content"] = new_content
    if caption:
        messages_log[(chat_id, msg_id)]["caption"] = caption

# --- Отслеживание удаления ---
@bot.deleted_business_messages_handler()
def handle_deleted_business_messages(deleted):
    if not bot_running:
        return

    for msg_id in deleted.message_ids:
        data = messages_log.pop((deleted.chat.id, msg_id), None)
        if not data:
            continue

        deleted_record = {
            "type": data.get("type"),
            "content": data.get("content"),
            "caption": data.get("caption", ""),
            "author_name": data.get("author_name", "Неизвестно"),
            "deleted_at": str(datetime.now())
        }
        deleted_messages.append(deleted_record)
        with open("deleted_messages.json", "w", encoding="utf-8") as f:
            json.dump(deleted_messages, f, ensure_ascii=False, indent=2)

        ctype = data["type"]
        if ctype == "photo":
            bot.send_photo(OWNER_ID, data["content"],
                           caption=f"❌ Удалённое фото\nАвтор: {data['author_name']}\nВремя: {deleted_record['deleted_at']}\nПодпись: {data.get('caption','')}")
        elif ctype == "video":
            bot.send_video(OWNER_ID, data["content"],
                           caption=f"❌ Удалённое видео\nАвтор: {data['author_name']}\nВремя: {deleted_record['deleted_at']}\nПодпись: {data.get('caption','')}")
        elif ctype == "document":
            bot.send_document(OWNER_ID, data["content"],
                              caption=f"❌ Удалённый документ\nАвтор: {data['author_name']}\nВремя: {deleted_record['deleted_at']}\nПодпись: {data.get('caption','')}")
        elif ctype == "audio":
            bot.send_audio(OWNER_ID, data["content"],
                           caption=f"❌ Удалённое аудио\nАвтор: {data['author_name']}\nВремя: {deleted_record['deleted_at']}")
        elif ctype == "voice":
            bot.send_voice(OWNER_ID, data["content"],
                           caption=f"❌ Удалённое голосовое сообщение\nАвтор: {data['author_name']}\nВремя: {deleted_record['deleted_at']}")
        elif ctype == "animation":
            bot.send_animation(OWNER_ID, data["content"],
                               caption=f"❌ Удалённая анимация\nАвтор: {data['author_name']}\nВремя: {deleted_record['deleted_at']}")
        else:
            text_for_owner = format_message_notification(
                "deleted",
                ctype,
                data.get("content"),
                data.get("caption"),
                data.get("author_name", "Неизвестно"),
                deleted_record["deleted_at"]
            )
            bot.send_message(OWNER_ID, text_for_owner, parse_mode="HTML")

# --- Команда /start ---
@bot.message_handler(commands=['start', 'help'])
def handle_start_help(message):
    bot.send_message(message.chat.id,
                     "Привет! Я бот с админской панелью.\n"
                     "📌 Отслеживаю все сообщения, редактирование и удаление.\n"
                     "🛠 Команды администратора:\n"
                     "/stop_bot - остановить все функции\n"
                     "/start_bot - запустить снова\n"
                     "/status - проверить состояние бота\n"
                     "✏️ Все изменения показываются старое и новое сообщение красиво!")

if __name__ == "__main__":
    print("Бот запущен...")
    bot.polling(none_stop=True)


