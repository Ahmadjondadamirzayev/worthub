export interface TelegramConfig {
  botToken: string;
  chatId: string;
  isEnabled: boolean;
}

export interface TelegramLogItem {
  id: string;
  timestamp: string;
  type: 'visit' | 'game' | 'login' | 'name_set';
  title: string;
  details: string;
  status: 'sent' | 'pending' | 'saved_offline';
}

const TELEGRAM_CONFIG_KEY = 'worthub_telegram_config_v1';
const TELEGRAM_LOGS_KEY = 'worthub_telegram_logs_v1';

export function getTelegramConfig(): TelegramConfig {
  try {
    const raw = localStorage.getItem(TELEGRAM_CONFIG_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (parsed && typeof parsed === 'object') return parsed;
    }
  } catch (e) {}
  return {
    botToken: '',
    chatId: '',
    isEnabled: false,
  };
}

export function saveTelegramConfig(config: TelegramConfig): void {
  try {
    localStorage.setItem(TELEGRAM_CONFIG_KEY, JSON.stringify(config));
  } catch (e) {}
}

export function getTelegramLogs(): TelegramLogItem[] {
  try {
    const raw = localStorage.getItem(TELEGRAM_LOGS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) return parsed;
    }
  } catch (e) {}
  return [];
}

export function addTelegramLog(log: Omit<TelegramLogItem, 'id' | 'timestamp'>): void {
  try {
    const items = getTelegramLogs();
    const newItem: TelegramLogItem = {
      ...log,
      id: `tg-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: new Date().toISOString().slice(0, 19).replace('T', ' '),
    };
    const updated = [newItem, ...items.slice(0, 49)];
    localStorage.setItem(TELEGRAM_LOGS_KEY, JSON.stringify(updated));
  } catch (e) {}
}

/**
 * Sends a message to the Admin's Telegram bot and chat
 */
export async function sendTelegramNotification(
  text: string,
  meta?: { type: TelegramLogItem['type']; title: string }
): Promise<boolean> {
  const config = getTelegramConfig();

  // Always log locally so admin can see entries even before adding bot token
  addTelegramLog({
    type: meta?.type || 'visit',
    title: meta?.title || "Sayt faolligi",
    details: text.replace(/<[^>]+>/g, ''), // strip html tags for preview
    status: config.isEnabled && config.botToken && config.chatId ? 'sent' : 'saved_offline',
  });

  if (!config.isEnabled || !config.botToken.trim() || !config.chatId.trim()) {
    return false;
  }

  try {
    const url = `https://api.telegram.org/bot${config.botToken.trim()}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: config.chatId.trim(),
        text,
        parse_mode: 'HTML',
      }),
    });
    return res.ok;
  } catch (e) {
    console.warn('Telegram notification failed:', e);
    return false;
  }
}

/**
 * Test telegram bot token and chat id connection
 */
export async function testTelegramBot(token: string, chatId: string): Promise<{ success: boolean; message: string }> {
  if (!token.trim() || !chatId.trim()) {
    return { success: false, message: "Bot Token va Chat ID to'ldirilishi shart!" };
  }
  try {
    const url = `https://api.telegram.org/bot${token.trim()}/sendMessage`;
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId.trim(),
        text: `🤖 <b>Worthub.uz Telegram Boti muvaffaqiyatli ulandi!</b>\n\n🇩🇪 Endi saytga kirgan barcha o'quvchilar, kunlik faolliklar va o'yin natijalari to'g'ridan-to'g'ri shu yerga keladi.\n\n⏰ Vaqt: ${new Date().toLocaleString()}`,
        parse_mode: 'HTML',
      }),
    });
    const data = await res.json();
    if (data.ok) {
      return { success: true, message: "Telegram botga test xabari muvaffaqiyatli yuborildi!" };
    } else {
      return { success: false, message: data.description || "Telegram bot xatosi" };
    }
  } catch (e: any) {
    return { success: false, message: e?.message || "Telegram serveriga ulanishda xatolik yuz berdi" };
  }
}
