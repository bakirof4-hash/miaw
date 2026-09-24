/**
 * storage.js - Central Data & Event Hub for Asilzoda Apology & Admin System
 * Works 100% locally using localStorage, BroadcastChannel, and window storage events.
 */

const STORAGE_KEYS = {
    MESSAGES: 'asilzoda_messages',
    STATS: 'asilzoda_stats',
    ADMIN_AUTH: 'asilzoda_admin_auth',
    ADMIN_SETTINGS: 'asilzoda_admin_settings',
    ACTIVITY_LOG: 'asilzoda_activity_log'
};

// Default SHA-256 for password "admin123":
// echo -n "admin123" | sha256sum -> 240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9
const DEFAULT_PASSWORD_HASH = '240be518fabd2724ddb6f04eeb1da5967448d7e831c08c8fa822809f74c720a9';
const DEFAULT_USERNAME = 'admin';

class StorageManager {
    constructor() {
        this.channel = null;
        try {
            if (typeof BroadcastChannel !== 'undefined') {
                this.channel = new BroadcastChannel('asilzoda_app_channel');
            }
        } catch (e) {
            console.warn('BroadcastChannel not supported, falling back to window storage events.', e);
        }

        this.listeners = [];
        this.initDefaults();
        this.bindEvents();
    }

    initDefaults() {
        if (!localStorage.getItem(STORAGE_KEYS.MESSAGES)) {
            // Seed with friendly initial state or welcome note
            const initialMessages = [
                {
                    id: 'msg_' + Date.now(),
                    sender: 'admin',
                    text: 'Salom, Asilzoda 🤍 Men seni tinglashga tayyorman. Nima xafa qilgan bo‘lsa, bemalol ayt.',
                    timestamp: Date.now() - 60000,
                    date: this.formatDate(new Date(Date.now() - 60000)),
                    time: this.formatTime(new Date(Date.now() - 60000)),
                    read: true
                }
            ];
            localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(initialMessages));
        }

        if (!localStorage.getItem(STORAGE_KEYS.STATS)) {
            const initialStats = {
                haClicked: false,
                haClickTime: null,
                haCount: 0,
                noEscapeAttempts: 0,
                lastSeen: Date.now()
            };
            localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(initialStats));
        }

        if (!localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH)) {
            const defaultAuth = {
                username: DEFAULT_USERNAME,
                passwordHash: DEFAULT_PASSWORD_HASH
            };
            localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, JSON.stringify(defaultAuth));
        }

        if (!localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS)) {
            const defaultSettings = {
                smsProvider: 'eskiz', // eskiz, twilio, playmobile
                smsApiKey: '',
                adminPhone: '+998901234567',
                notifySound: true,
                autoReadOnOpen: false
            };
            localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(defaultSettings));
        }

        if (!localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG)) {
            localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify([]));
        }
    }

    bindEvents() {
        if (this.channel) {
            this.channel.onmessage = (event) => {
                this.notifySubscribers(event.data.type, event.data.payload);
            };
        }

        window.addEventListener('storage', (e) => {
            if (e.key === STORAGE_KEYS.MESSAGES) {
                this.notifySubscribers('messages_updated', this.getMessages());
            } else if (e.key === STORAGE_KEYS.STATS) {
                this.notifySubscribers('stats_updated', this.getStats());
            }
        });
    }

    subscribe(callback) {
        this.listeners.push(callback);
        return () => {
            this.listeners = this.listeners.filter(cb => cb !== callback);
        };
    }

    notifySubscribers(type, payload) {
        this.listeners.forEach(cb => {
            try {
                cb(type, payload);
            } catch (err) {
                console.error('Error in storage listener callback:', err);
            }
        });
    }

    broadcast(type, payload) {
        this.notifySubscribers(type, payload);
        if (this.channel) {
            try {
                this.channel.postMessage({ type, payload });
            } catch (err) {
                console.warn('Could not postMessage to channel:', err);
            }
        }
    }

    // --- Message Operations ---
    getMessages() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.MESSAGES)) || [];
        } catch (e) {
            return [];
        }
    }

    sendMessage(sender, text) {
        const messages = this.getMessages();
        const now = new Date();
        const newMessage = {
            id: 'msg_' + Date.now() + '_' + Math.random().toString(36).substr(2, 5),
            sender: sender, // 'asilzoda' or 'admin'
            text: text.trim(),
            timestamp: now.getTime(),
            date: this.formatDate(now),
            time: this.formatTime(now),
            read: sender === 'admin' // If admin sends, it's already read by admin
        };

        messages.push(newMessage);
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
        
        // Log activity
        this.logActivity(sender === 'asilzoda' ? 'Asilzodadan yangi xabar' : 'Admindan javob yuborildi', text.substring(0, 35) + (text.length > 35 ? '...' : ''));

        this.broadcast('messages_updated', messages);
        if (sender === 'asilzoda') {
            this.broadcast('new_message_from_asilzoda', newMessage);
        } else {
            this.broadcast('new_message_from_admin', newMessage);
        }
        return newMessage;
    }

    markAsRead(messageId) {
        const messages = this.getMessages();
        let changed = false;
        messages.forEach(msg => {
            if (msg.id === messageId && !msg.read) {
                msg.read = true;
                changed = true;
            }
        });
        if (changed) {
            localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
            this.broadcast('messages_updated', messages);
        }
    }

    markAllAsRead() {
        const messages = this.getMessages();
        let changed = false;
        messages.forEach(msg => {
            if (!msg.read) {
                msg.read = true;
                changed = true;
            }
        });
        if (changed) {
            localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
            this.broadcast('messages_updated', messages);
        }
    }

    deleteMessage(messageId) {
        let messages = this.getMessages();
        messages = messages.filter(m => m.id !== messageId);
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify(messages));
        this.broadcast('messages_updated', messages);
    }

    clearAllMessages() {
        localStorage.setItem(STORAGE_KEYS.MESSAGES, JSON.stringify([]));
        this.broadcast('messages_updated', []);
    }

    getUnreadCount() {
        const messages = this.getMessages();
        return messages.filter(m => m.sender === 'asilzoda' && !m.read).length;
    }

    // --- Stats & Decision Operations ---
    getStats() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.STATS)) || {};
        } catch (e) {
            return {};
        }
    }

    recordHaClick() {
        const stats = this.getStats();
        stats.haClicked = true;
        stats.haClickTime = Date.now();
        stats.haCount = (stats.haCount || 0) + 1;
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
        this.logActivity('❤️ Kechirildi!', 'Asilzoda "HA" tugmasini bosdi.');
        this.broadcast('stats_updated', stats);
        this.broadcast('ha_clicked', stats);
    }

    recordNoEscapeAttempt() {
        const stats = this.getStats();
        stats.noEscapeAttempts = (stats.noEscapeAttempts || 0) + 1;
        localStorage.setItem(STORAGE_KEYS.STATS, JSON.stringify(stats));
        this.broadcast('stats_updated', stats);
    }

    // --- Activity Logging ---
    logActivity(title, details) {
        try {
            const logs = JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG)) || [];
            logs.unshift({
                id: 'log_' + Date.now(),
                title,
                details,
                timestamp: Date.now(),
                timeStr: this.formatDate(new Date()) + ' ' + this.formatTime(new Date())
            });
            // Keep last 50
            if (logs.length > 50) logs.pop();
            localStorage.setItem(STORAGE_KEYS.ACTIVITY_LOG, JSON.stringify(logs));
        } catch (e) {
            console.error('Error logging activity:', e);
        }
    }

    getActivityLogs() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.ACTIVITY_LOG)) || [];
        } catch (e) {
            return [];
        }
    }

    // --- Authentication Operations ---
    async hashPassword(password) {
        const encoder = new TextEncoder();
        const data = encoder.encode(password);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    }

    async verifyAdminLogin(username, password) {
        try {
            const auth = JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_AUTH));
            if (!auth) return false;
            
            if (username.trim().toLowerCase() !== auth.username.toLowerCase()) {
                return false;
            }

            const inputHash = await this.hashPassword(password);
            return inputHash === auth.passwordHash;
        } catch (e) {
            console.error('Error verifying login:', e);
            return false;
        }
    }

    async updateAdminPassword(oldPassword, newPassword) {
        const isValid = await this.verifyAdminLogin('admin', oldPassword);
        if (!isValid) return { success: false, error: 'Eski parol noto‘g‘ri!' };

        if (!newPassword || newPassword.length < 4) {
            return { success: false, error: 'Yangi parol kamida 4 ta belgidan iborat bo‘lishi kerak!' };
        }

        const newHash = await this.hashPassword(newPassword);
        const auth = {
            username: DEFAULT_USERNAME,
            passwordHash: newHash
        };
        localStorage.setItem(STORAGE_KEYS.ADMIN_AUTH, JSON.stringify(auth));
        return { success: true };
    }

    // --- Admin Settings & SMS Architecture ---
    getAdminSettings() {
        try {
            return JSON.parse(localStorage.getItem(STORAGE_KEYS.ADMIN_SETTINGS)) || {};
        } catch (e) {
            return {};
        }
    }

    saveAdminSettings(settings) {
        localStorage.setItem(STORAGE_KEYS.ADMIN_SETTINGS, JSON.stringify(settings));
        this.broadcast('settings_updated', settings);
    }

    /**
     * SMS Architecture Integration Layer
     * Simulates or triggers SMS notification to Admin when Asilzoda sends a message.
     */
    async triggerSmsNotification(messageText) {
        const settings = this.getAdminSettings();
        const payload = {
            provider: settings.smsProvider || 'eskiz',
            recipientPhone: settings.adminPhone || '+998901234567',
            message: `[Asilzoda]: "${messageText}"`,
            timestamp: new Date().toISOString()
        };

        console.log('[SMS Provider Simulation] Payload prepared for SMS Gateway:', payload);

        // Real integration placeholder:
        // If an API endpoint exists, it can be called here:
        // return fetch('/api/send-sms', { method: 'POST', body: JSON.stringify(payload) })
        return {
            success: true,
            simulated: true,
            provider: settings.smsProvider,
            recipient: settings.adminPhone,
            timestamp: payload.timestamp
        };
    }

    // --- Date Formatting Helpers ---
    formatDate(date) {
        const d = String(date.getDate()).padStart(2, '0');
        const m = String(date.getMonth() + 1).padStart(2, '0');
        const y = date.getFullYear();
        return `${d}.${m}.${y}`;
    }

    formatTime(date) {
        const h = String(date.getHours()).padStart(2, '0');
        const min = String(date.getMinutes()).padStart(2, '0');
        return `${h}:${min}`;
    }
}

// Global instance
window.storageManager = new StorageManager();
