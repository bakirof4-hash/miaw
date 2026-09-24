/**
 * admin.js - Admin Panel Controller
 * Handles authentication, real-time message stream, replies,
 * activity analytics, and SMS architecture configuration.
 */

document.addEventListener('DOMContentLoaded', () => {
    initAdminAuth();
    initTabNavigation();
    initChatAndInbox();
    initActivityLog();
    initSettingsAndSms();
    initLiveSubscriptions();
});

/* ==========================================================================
   1. Authentication & Session Control
   ========================================================================== */
function initAdminAuth() {
    const loginContainer = document.getElementById('loginContainer');
    const adminApp = document.getElementById('adminApp');
    const loginForm = document.getElementById('loginForm');
    const loginError = document.getElementById('loginError');
    const btnLogout = document.getElementById('btnLogout');

    function checkSession() {
        const isAuth = sessionStorage.getItem('admin_authenticated') === 'true';
        if (isAuth) {
            loginContainer.style.display = 'none';
            adminApp.style.display = 'flex';
            refreshAllDashboardData();
        } else {
            loginContainer.style.display = 'flex';
            adminApp.style.display = 'none';
        }
    }

    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('adminUser').value.trim();
            const password = document.getElementById('adminPass').value;

            if (loginError) loginError.style.display = 'none';

            const isValid = await window.storageManager.verifyAdminLogin(username, password);

            if (isValid) {
                sessionStorage.setItem('admin_authenticated', 'true');
                checkSession();
            } else {
                if (loginError) {
                    loginError.textContent = 'Noto‘g‘ri login yoki parol!';
                    loginError.style.display = 'block';
                }
            }
        });
    }

    if (btnLogout) {
        btnLogout.addEventListener('click', () => {
            sessionStorage.removeItem('admin_authenticated');
            checkSession();
        });
    }

    checkSession();
}

/* ==========================================================================
   2. Tab Navigation
   ========================================================================== */
function initTabNavigation() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            const targetId = btn.getAttribute('data-tab');

            tabButtons.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));

            btn.classList.add('active');
            const targetContent = document.getElementById(targetId);
            if (targetContent) targetContent.classList.add('active');

            if (targetId === 'tabMessages') {
                // If opening messages, can optionally mark as read
                refreshInboxAndChat();
            } else if (targetId === 'tabResponses') {
                refreshActivityLog();
            }
        });
    });
}

/* ==========================================================================
   3. Chat & Inbox Messaging Flow
   ========================================================================== */
function initChatAndInbox() {
    const adminReplyInput = document.getElementById('adminReplyInput');
    const btnSendAdmin = document.getElementById('btnSendAdmin');
    const btnMarkAllRead = document.getElementById('btnMarkAllRead');
    const chipButtons = document.querySelectorAll('.chip');

    // Quick chip suggestion clicks
    chipButtons.forEach(chip => {
        chip.addEventListener('click', () => {
            if (adminReplyInput) {
                adminReplyInput.value = chip.textContent.trim();
                adminReplyInput.focus();
            }
        });
    });

    function sendReply() {
        if (!adminReplyInput) return;
        const text = adminReplyInput.value.trim();
        if (!text) return;

        window.storageManager.sendMessage('admin', text);
        // Automatically mark Asilzoda's previous messages as read
        window.storageManager.markAllAsRead();

        if (window.soundFX) window.soundFX.playMessageSent();

        adminReplyInput.value = '';
        refreshInboxAndChat();
        refreshStats();
    }

    if (btnSendAdmin) {
        btnSendAdmin.addEventListener('click', sendReply);
    }

    if (adminReplyInput) {
        adminReplyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendReply();
        });
    }

    if (btnMarkAllRead) {
        btnMarkAllRead.addEventListener('click', () => {
            window.storageManager.markAllAsRead();
            refreshInboxAndChat();
            refreshStats();
        });
    }
}

function refreshInboxAndChat() {
    renderInboxList();
    renderConversation();
    refreshStats();
}

function renderInboxList() {
    const inboxList = document.getElementById('inboxList');
    if (!inboxList || !window.storageManager) return;

    const messages = window.storageManager.getMessages();
    inboxList.innerHTML = '';

    if (messages.length === 0) {
        inboxList.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 40px 10px;">
                Hozircha xabarlar yo‘q
            </div>
        `;
        return;
    }

    // Show newest first for inbox list
    const sorted = [...messages].reverse();

    sorted.forEach(msg => {
        const item = document.createElement('div');
        item.className = `inbox-item ${!msg.read && msg.sender === 'asilzoda' ? 'unread' : ''}`;

        const senderLabel = msg.sender === 'asilzoda' ? '🌸 Asilzoda' : '⚡ Umidjon (Siz)';

        item.innerHTML = `
            <div class="inbox-item-header">
                <span class="inbox-sender">${senderLabel}</span>
                <span class="inbox-time">${msg.date} ${msg.time}</span>
            </div>
            <div class="inbox-snippet">${escapeHTML(msg.text)}</div>
            <div class="inbox-actions">
                ${msg.sender === 'asilzoda' && !msg.read ? `
                    <button class="btn-item-action btn-mark-read" data-id="${msg.id}">
                        ✓ O‘qildi
                    </button>
                ` : ''}
                <button class="btn-item-action btn-reply-focus">
                    💬 Javob
                </button>
                <button class="btn-item-action delete btn-delete-msg" data-id="${msg.id}">
                    🗑 O‘chirish
                </button>
            </div>
        `;

        // Action bindings
        const btnRead = item.querySelector('.btn-mark-read');
        if (btnRead) {
            btnRead.addEventListener('click', (e) => {
                e.stopPropagation();
                window.storageManager.markAsRead(msg.id);
                refreshInboxAndChat();
            });
        }

        const btnReply = item.querySelector('.btn-reply-focus');
        if (btnReply) {
            btnReply.addEventListener('click', (e) => {
                e.stopPropagation();
                const input = document.getElementById('adminReplyInput');
                if (input) {
                    input.focus();
                    input.scrollIntoView({ behavior: 'smooth' });
                }
            });
        }

        const btnDelete = item.querySelector('.btn-delete-msg');
        if (btnDelete) {
            btnDelete.addEventListener('click', (e) => {
                e.stopPropagation();
                if (confirm('Ushbu xabarni o‘chirishni xohlaysizmi?')) {
                    window.storageManager.deleteMessage(msg.id);
                    refreshInboxAndChat();
                }
            });
        }

        inboxList.appendChild(item);
    });
}

function renderConversation() {
    const conversationBody = document.getElementById('conversationBody');
    if (!conversationBody || !window.storageManager) return;

    const messages = window.storageManager.getMessages();
    conversationBody.innerHTML = '';

    messages.forEach(msg => {
        const bubble = document.createElement('div');
        const isAsilzoda = msg.sender === 'asilzoda';
        bubble.className = `admin-bubble ${isAsilzoda ? 'from-asilzoda' : 'from-admin'}`;

        bubble.innerHTML = `
            <span class="bubble-sender-label">${isAsilzoda ? '🌸 Asilzoda' : 'Umidjon (Siz)'}</span>
            <span>${escapeHTML(msg.text)}</span>
            <span class="bubble-time">${msg.date} ${msg.time}</span>
        `;

        conversationBody.appendChild(bubble);
    });

    conversationBody.scrollTop = conversationBody.scrollHeight;
}

/* ==========================================================================
   4. Activity Log & Stats Refresh
   ========================================================================== */
function initActivityLog() {
    refreshActivityLog();
}

function refreshActivityLog() {
    const activityList = document.getElementById('activityList');
    if (!activityList || !window.storageManager) return;

    const logs = window.storageManager.getActivityLogs();
    activityList.innerHTML = '';

    if (logs.length === 0) {
        activityList.innerHTML = `
            <div style="text-align: center; color: var(--text-muted); padding: 30px;">
                Hozircha harakatlar tarixi bo‘sh
            </div>
        `;
        return;
    }

    logs.forEach(log => {
        const item = document.createElement('div');
        item.className = 'activity-item';
        item.innerHTML = `
            <div>
                <div class="activity-item-title">${escapeHTML(log.title)}</div>
                <div class="activity-item-details">${escapeHTML(log.details)}</div>
            </div>
            <div class="activity-item-time">${log.timeStr}</div>
        `;
        activityList.appendChild(item);
    });
}

function refreshStats() {
    if (!window.storageManager) return;

    const stats = window.storageManager.getStats();
    const unreadCount = window.storageManager.getUnreadCount();
    const messages = window.storageManager.getMessages();

    // Badges & Counters
    const unreadBadge = document.getElementById('statUnreadBadge');
    const statUnread = document.getElementById('statUnread');
    const tabUnreadBadge = document.getElementById('tabUnreadBadge');
    const statTotalMessages = document.getElementById('statTotalMessages');
    const statFriendshipStatus = document.getElementById('statFriendshipStatus');
    const statEscapeAttempts = document.getElementById('statEscapeAttempts');

    if (unreadBadge) {
        unreadBadge.textContent = unreadCount > 0 ? `${unreadCount} ta yangi` : '0';
        unreadBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }

    if (statUnread) statUnread.textContent = unreadCount;
    if (tabUnreadBadge) {
        tabUnreadBadge.textContent = unreadCount;
        tabUnreadBadge.style.display = unreadCount > 0 ? 'inline-block' : 'none';
    }

    if (statTotalMessages) statTotalMessages.textContent = messages.length;

    if (statFriendshipStatus) {
        if (stats.haClicked) {
            statFriendshipStatus.innerHTML = '<span style="color: #10b981;">Kechirdi 🔓</span>';
        } else {
            statFriendshipStatus.innerHTML = '<span style="color: #f59e0b;">Kutilmoqda ⏳</span>';
        }
    }

    if (statEscapeAttempts) {
        statEscapeAttempts.textContent = `${stats.noEscapeAttempts || 0} marta`;
    }
}

function refreshAllDashboardData() {
    refreshStats();
    refreshInboxAndChat();
    refreshActivityLog();
}

/* ==========================================================================
   5. Settings & SMS Integration Architecture
   ========================================================================== */
function initSettingsAndSms() {
    const formPassword = document.getElementById('formChangePassword');
    const passError = document.getElementById('passChangeError');
    const passSuccess = document.getElementById('passChangeSuccess');

    const selectSmsProvider = document.getElementById('selectSmsProvider');
    const inputSmsApiKey = document.getElementById('inputSmsApiKey');
    const inputAdminPhone = document.getElementById('inputAdminPhone');
    const btnSaveSmsSettings = document.getElementById('btnSaveSmsSettings');
    const btnTestSms = document.getElementById('btnTestSms');
    const smsPreviewOutput = document.getElementById('smsPreviewOutput');

    // Load saved settings
    if (window.storageManager) {
        const settings = window.storageManager.getAdminSettings();
        if (selectSmsProvider && settings.smsProvider) selectSmsProvider.value = settings.smsProvider;
        if (inputSmsApiKey && settings.smsApiKey) inputSmsApiKey.value = settings.smsApiKey;
        if (inputAdminPhone && settings.adminPhone) inputAdminPhone.value = settings.adminPhone;
    }

    // Password Change Form
    if (formPassword) {
        formPassword.addEventListener('submit', async (e) => {
            e.preventDefault();
            const oldPass = document.getElementById('oldPassword').value;
            const newPass = document.getElementById('newPassword').value;

            if (passError) passError.style.display = 'none';
            if (passSuccess) passSuccess.style.display = 'none';

            const res = await window.storageManager.updateAdminPassword(oldPass, newPass);

            if (res.success) {
                if (passSuccess) {
                    passSuccess.textContent = 'Parol muvaffaqiyatli o‘zgartirildi!';
                    passSuccess.style.display = 'block';
                }
                formPassword.reset();
            } else {
                if (passError) {
                    passError.textContent = res.error;
                    passError.style.display = 'block';
                }
            }
        });
    }

    // Save SMS settings
    if (btnSaveSmsSettings) {
        btnSaveSmsSettings.addEventListener('click', () => {
            const settings = {
                smsProvider: selectSmsProvider ? selectSmsProvider.value : 'eskiz',
                smsApiKey: inputSmsApiKey ? inputSmsApiKey.value.trim() : '',
                adminPhone: inputAdminPhone ? inputAdminPhone.value.trim() : '+998901234567'
            };
            window.storageManager.saveAdminSettings(settings);
            alert('SMS sozlamalari saqlandi!');
        });
    }

    // Test SMS Integration simulation
    if (btnTestSms) {
        btnTestSms.addEventListener('click', async () => {
            const testResult = await window.storageManager.triggerSmsNotification('Test: Asilzoda sahifadan xabar yubordi');
            if (smsPreviewOutput) {
                smsPreviewOutput.style.display = 'block';
                smsPreviewOutput.textContent = JSON.stringify({
                    status: 'SUCCESS (Ready for gateway integration)',
                    provider: testResult.provider,
                    gatewayEndpoint: getGatewayEndpoint(testResult.provider),
                    recipient: testResult.recipient,
                    message: '[Asilzoda]: "Test: Asilzoda sahifadan xabar yubordi"',
                    timestamp: testResult.timestamp,
                    note: 'Haqiqiy SMS provayderga (Eskiz.uz yoki Twilio) ulanish uchun POST webhook so‘rovi tayyor.'
                }, null, 2);
            }
        });
    }
}

function getGatewayEndpoint(provider) {
    switch (provider) {
        case 'eskiz': return 'https://notify.eskiz.uz/api/message/sms/send';
        case 'twilio': return 'https://api.twilio.com/2010-04-01/Accounts/.../Messages.json';
        case 'playmobile': return 'https://playmobile.uz/api/sms/send';
        default: return 'https://api.sms-gateway.local/send';
    }
}

/* ==========================================================================
   6. Live Sync Subscriptions & Notification Toasts
   ========================================================================== */
function initLiveSubscriptions() {
    if (!window.storageManager) return;

    window.storageManager.subscribe((type, payload) => {
        refreshStats();

        if (type === 'messages_updated' || type === 'new_message_from_asilzoda') {
            renderInboxList();
            renderConversation();

            if (type === 'new_message_from_asilzoda') {
                if (window.soundFX) window.soundFX.playMessageReceived();
                showAdminToast(`🔴 Asilzodadan yangi xabar: "${payload.text.substring(0, 30)}..."`);
            }
        } else if (type === 'stats_updated' || type === 'ha_clicked') {
            refreshStats();
            refreshActivityLog();
            if (type === 'ha_clicked') {
                showAdminToast('❤️ Asilzoda "HA" tugmasini bosdi!');
                if (window.soundFX) window.soundFX.playCelebration();
            }
        }
    });
}

function showAdminToast(text) {
    const toast = document.getElementById('adminToast');
    const toastText = document.getElementById('adminToastText');
    if (!toast || !toastText) return;

    toastText.textContent = text;
    toast.classList.add('show');

    setTimeout(() => {
        toast.classList.remove('show');
    }, 4500);
}

// Utility: Escape HTML
function escapeHTML(str) {
    if (!str) return '';
    return str.replace(/[&<>'"]/g, 
        tag => ({
            '&': '&amp;',
            '<': '&lt;',
            '>': '&gt;',
            "'": '&#39;',
            '"': '&quot;'
        }[tag] || tag)
    );
}
