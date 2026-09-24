/**
 * app.js - Frontend Application Logic for Asilzoda Apology Website
 * Handles animations, the playful escaping "YO'Q" button, "HA" celebration,
 * and live chat messaging.
 */

document.addEventListener('DOMContentLoaded', () => {
    // ----------------------------------------------------
    // 1. Ambient Background Particles
    // ----------------------------------------------------
    initAmbientParticles();

    // ----------------------------------------------------
    // 2. Escaping "YO'Q" Button Logic
    // ----------------------------------------------------
    initEscapingNoButton();

    // ----------------------------------------------------
    // 3. "HA" Button Celebration & Modal
    // ----------------------------------------------------
    initHaButtonFlow();

    // ----------------------------------------------------
    // 4. Chat System (Messaging for Asilzoda)
    // ----------------------------------------------------
    initChatSystem();

    // ----------------------------------------------------
    // 5. Sound & Background Music Toggle
    // ----------------------------------------------------
    initAudioControls();

    // ----------------------------------------------------
    // 6. Cross-Tab Live Event Subscriptions
    // ----------------------------------------------------
    initLiveSubscriptions();
});

/* ==========================================================================
   1. Ambient Floating Canvas Particles (Hearts & Stars)
   ========================================================================== */
function initAmbientParticles() {
    const canvas = document.getElementById('particleCanvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');

    let particles = [];
    const particleCount = window.innerWidth < 600 ? 25 : 55;

    function resize() {
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    class AmbientParticle {
        constructor() {
            this.reset(true);
        }

        reset(initial = false) {
            this.x = Math.random() * canvas.width;
            this.y = initial ? Math.random() * canvas.height : canvas.height + 20;
            this.size = Math.random() * 5 + 3;
            this.speedY = Math.random() * 0.5 + 0.3;
            this.speedX = (Math.random() - 0.5) * 0.4;
            this.opacity = Math.random() * 0.4 + 0.2;
            this.type = Math.random() > 0.4 ? 'circle' : 'star';
            this.color = Math.random() > 0.5 ? 'rgba(255, 182, 193, ' : 'rgba(216, 180, 254, ';
        }

        update() {
            this.y -= this.speedY;
            this.x += this.speedX;
            if (this.y < -30) {
                this.reset();
            }
        }

        draw() {
            ctx.save();
            ctx.fillStyle = this.color + this.opacity + ')';
            ctx.beginPath();
            if (this.type === 'circle') {
                ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
                ctx.fill();
            } else {
                // Gentle diamond / star
                ctx.translate(this.x, this.y);
                ctx.moveTo(0, -this.size);
                ctx.lineTo(this.size * 0.7, 0);
                ctx.lineTo(0, this.size);
                ctx.lineTo(-this.size * 0.7, 0);
                ctx.closePath();
                ctx.fill();
            }
            ctx.restore();
        }
    }

    for (let i = 0; i < particleCount; i++) {
        particles.push(new AmbientParticle());
    }

    function animate() {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        particles.forEach(p => {
            p.update();
            p.draw();
        });
        requestAnimationFrame(animate);
    }
    animate();
}

/* ==========================================================================
   2. Playful Escaping "YO'Q" Button
   ========================================================================== */
function initEscapingNoButton() {
    const btnNo = document.getElementById('btnNo');
    const escapeBubble = document.getElementById('escapeBubble');
    if (!btnNo) return;

    const funnyMessages = [
        "Yo‘q deyishga shoshma 😭",
        "Bu tugma qochib ketdi 😂",
        "Bir marta o‘ylab ko‘r 😄",
        "Rostdanmi? Yana bir marta o‘ylab ko‘rchi 🥺",
        "Meni kechirmasang xafa bo‘laman-ku 😢",
        "Ushlay olmaysan 😜",
        "Balki 'HA' degan ma'qulroqdir? 😉",
        "Do‘stlik osonlikcha tugamaydi 🤍",
        "Qochdim! 🏃💨"
    ];

    let messageIndex = 0;
    let bubbleTimeout = null;

    function escapeButton(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }

        // Sound effect
        if (window.soundFX) window.soundFX.playWhoosh();

        // Increment stats
        if (window.storageManager) window.storageManager.recordNoEscapeAttempt();

        const btnWidth = btnNo.offsetWidth || 120;
        const btnHeight = btnNo.offsetHeight || 50;

        // Viewport dimensions with safe padding
        const padX = 24;
        const padTop = 80; // keep clear of top controls
        const padBottom = 90; // keep clear of bottom FAB

        const minX = padX;
        const maxX = Math.max(minX + 20, window.innerWidth - btnWidth - padX);

        const minY = padTop;
        const maxY = Math.max(minY + 20, window.innerHeight - btnHeight - padBottom);

        // Generate random new coordinates distinct from current
        const rect = btnNo.getBoundingClientRect();
        let newX, newY;
        let attempts = 0;

        do {
            newX = Math.floor(Math.random() * (maxX - minX + 1)) + minX;
            newY = Math.floor(Math.random() * (maxY - minY + 1)) + minY;
            attempts++;
        } while (
            attempts < 10 &&
            Math.hypot(newX - rect.left, newY - rect.top) < 90
        );

        // Apply new position with fixed positioning
        btnNo.classList.add('escaping');
        btnNo.style.position = 'fixed';
        btnNo.style.left = `${newX}px`;
        btnNo.style.top = `${newY}px`;
        btnNo.style.zIndex = '999';

        // Show funny bubble
        showEscapeBubble(newX + btnWidth / 2, newY);
    }

    function showEscapeBubble(targetCenterX, targetTop) {
        if (!escapeBubble) return;

        const msg = funnyMessages[messageIndex % funnyMessages.length];
        messageIndex++;
        escapeBubble.textContent = msg;

        // Position bubble above the button if space permits, else below
        let bubbleY = targetTop - 42;
        if (bubbleY < 60) {
            bubbleY = targetTop + 56;
        }

        escapeBubble.style.left = `${targetCenterX}px`;
        escapeBubble.style.top = `${bubbleY}px`;
        escapeBubble.style.transform = 'translate(-50%, 0) scale(1)';
        escapeBubble.classList.add('show');

        clearTimeout(bubbleTimeout);
        bubbleTimeout = setTimeout(() => {
            escapeBubble.classList.remove('show');
        }, 2200);
    }

    // Desktop hover & click capture
    btnNo.addEventListener('mouseenter', escapeButton);
    btnNo.addEventListener('mouseover', escapeButton);

    // Mobile touch & tap capture
    btnNo.addEventListener('touchstart', escapeButton, { passive: false });
    btnNo.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'touch' || e.pointerType === 'pen') {
            escapeButton(e);
        }
    });

    btnNo.addEventListener('click', (e) => {
        // In the rare event a click registers, escape immediately
        escapeButton(e);
    });
}

/* ==========================================================================
   3. "HA" Button Flow & Success Modal
   ========================================================================== */
function initHaButtonFlow() {
    const btnHa = document.getElementById('btnHa');
    const successModalOverlay = document.getElementById('successModalOverlay');
    const btnTalkTrigger = document.getElementById('btnTalkTrigger');
    const listenSection = document.getElementById('listenSection');
    const quickReplyInput = document.getElementById('quickReplyInput');
    const btnQuickReply = document.getElementById('btnQuickReply');

    if (!btnHa) return;

    btnHa.addEventListener('click', () => {
        // Sound and Confetti
        if (window.soundFX) window.soundFX.playCelebration();
        if (window.confettiCannon) window.confettiCannon.fire(5000);

        // Record in storage
        if (window.storageManager) window.storageManager.recordHaClick();

        // Show Success Modal
        if (successModalOverlay) {
            successModalOverlay.classList.add('active');
        }
    });

    // Close on overlay click if outside modal
    if (successModalOverlay) {
        successModalOverlay.addEventListener('click', (e) => {
            if (e.target === successModalOverlay) {
                successModalOverlay.classList.remove('active');
            }
        });
    }

    // "💬 Endi gaplashamiz" Button in modal
    if (btnTalkTrigger) {
        btnTalkTrigger.addEventListener('click', () => {
            if (listenSection) {
                listenSection.classList.toggle('open');
                if (listenSection.classList.contains('open') && quickReplyInput) {
                    quickReplyInput.focus();
                }
            }
        });
    }

    // Quick reply sender inside modal
    function sendQuickReply() {
        if (!quickReplyInput) return;
        const text = quickReplyInput.value.trim();
        if (!text) return;

        if (window.storageManager) {
            window.storageManager.sendMessage('asilzoda', text);
            window.storageManager.triggerSmsNotification(text);
        }
        if (window.soundFX) window.soundFX.playMessageSent();

        quickReplyInput.value = '';

        // Open chat window and close modal for natural conversation flow
        setTimeout(() => {
            if (successModalOverlay) successModalOverlay.classList.remove('active');
            openChatWindow();
        }, 400);
    }

    if (btnQuickReply) {
        btnQuickReply.addEventListener('click', sendQuickReply);
    }
    if (quickReplyInput) {
        quickReplyInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') sendQuickReply();
        });
    }
}

/* ==========================================================================
   4. Chat System for Frontend
   ========================================================================== */
let chatWindowOpen = false;

function openChatWindow() {
    const chatWindow = document.getElementById('chatWindow');
    if (chatWindow) {
        chatWindow.classList.add('open');
        chatWindowOpen = true;
        renderChatMessages();
        const input = document.getElementById('chatInput');
        if (input) input.focus();
        updateChatBadge();
    }
}

function closeChatWindow() {
    const chatWindow = document.getElementById('chatWindow');
    if (chatWindow) {
        chatWindow.classList.remove('open');
        chatWindowOpen = false;
    }
}

function initChatSystem() {
    const fabChat = document.getElementById('fabChat');
    const chatCloseBtn = document.getElementById('chatCloseBtn');
    const chatSendBtn = document.getElementById('chatSendBtn');
    const chatInput = document.getElementById('chatInput');

    if (fabChat) {
        fabChat.addEventListener('click', () => {
            if (chatWindowOpen) {
                closeChatWindow();
            } else {
                openChatWindow();
            }
        });
    }

    if (chatCloseBtn) {
        chatCloseBtn.addEventListener('click', closeChatWindow);
    }

    function handleSend() {
        if (!chatInput) return;
        const text = chatInput.value.trim();
        if (!text) return;

        if (window.storageManager) {
            window.storageManager.sendMessage('asilzoda', text);
            window.storageManager.triggerSmsNotification(text);
        }
        if (window.soundFX) window.soundFX.playMessageSent();

        chatInput.value = '';
        renderChatMessages();
    }

    if (chatSendBtn) {
        chatSendBtn.addEventListener('click', handleSend);
    }

    if (chatInput) {
        chatInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                handleSend();
            }
        });
    }

    renderChatMessages();
    updateChatBadge();
}

function renderChatMessages() {
    const chatBody = document.getElementById('chatBody');
    if (!chatBody || !window.storageManager) return;

    const messages = window.storageManager.getMessages();
    chatBody.innerHTML = '';

    messages.forEach(msg => {
        const bubble = document.createElement('div');
        bubble.className = `chat-bubble ${msg.sender === 'asilzoda' ? 'from-asilzoda' : 'from-admin'}`;

        const textSpan = document.createElement('span');
        textSpan.className = 'msg-text';
        textSpan.textContent = msg.text;

        const timeSpan = document.createElement('span');
        timeSpan.className = 'msg-timestamp';
        timeSpan.textContent = msg.time || '';

        bubble.appendChild(textSpan);
        bubble.appendChild(timeSpan);
        chatBody.appendChild(bubble);
    });

    chatBody.scrollTop = chatBody.scrollHeight;
}

function updateChatBadge() {
    const badge = document.getElementById('fabBadge');
    if (!badge || !window.storageManager) return;

    // Check for any unread admin messages for Asilzoda
    const messages = window.storageManager.getMessages();
    // In Asilzoda's view, show indicator if recent message is from admin and chat is closed
    const hasAdminMsg = messages.length > 0 && messages[messages.length - 1].sender === 'admin';

    if (hasAdminMsg && !chatWindowOpen) {
        badge.style.display = 'flex';
        badge.textContent = '!';
    } else {
        badge.style.display = 'none';
    }
}

/* ==========================================================================
   5. Sound & Music Controls
   ========================================================================== */
function initAudioControls() {
    const btnMusic = document.getElementById('btnMusic');
    const musicIcon = document.getElementById('musicIcon');
    const musicLabel = document.getElementById('musicLabel');
    const musicWaves = document.getElementById('musicWaves');

    if (!btnMusic) return;

    btnMusic.addEventListener('click', () => {
        if (!window.soundFX) return;
        const isPlaying = window.soundFX.toggleAmbientMusic((active) => {
            if (active) {
                btnMusic.classList.add('active');
                if (musicIcon) musicIcon.textContent = '🎵';
                if (musicLabel) musicLabel.textContent = 'Musiqa yoqildi';
                if (musicWaves) musicWaves.style.display = 'flex';
            } else {
                btnMusic.classList.remove('active');
                if (musicIcon) musicIcon.textContent = '🔇';
                if (musicLabel) musicLabel.textContent = 'Musiqa';
                if (musicWaves) musicWaves.style.display = 'none';
            }
        });
    });
}

/* ==========================================================================
   6. Live Sync Subscriptions
   ========================================================================== */
function initLiveSubscriptions() {
    if (!window.storageManager) return;

    window.storageManager.subscribe((type, payload) => {
        if (type === 'messages_updated' || type === 'new_message_from_admin') {
            renderChatMessages();
            updateChatBadge();

            if (type === 'new_message_from_admin') {
                if (window.soundFX) window.soundFX.playMessageReceived();
            }
        }
    });
}
