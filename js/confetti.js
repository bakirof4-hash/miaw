/**
 * confetti.js - Canvas Confetti & Floating Hearts Engine
 * High performance, zero dependencies, responsive.
 */

class ConfettiCannon {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animId = null;
        this.isActive = false;
    }

    init() {
        if (!this.canvas) {
            this.canvas = document.createElement('canvas');
            this.canvas.id = 'confettiCanvas';
            this.canvas.style.position = 'fixed';
            this.canvas.style.top = '0';
            this.canvas.style.left = '0';
            this.canvas.style.width = '100vw';
            this.canvas.style.height = '100vh';
            this.canvas.style.pointerEvents = 'none';
            this.canvas.style.zIndex = '99999';
            document.body.appendChild(this.canvas);
            this.ctx = this.canvas.getContext('2d');

            window.addEventListener('resize', () => this.resize());
        }
        this.resize();
    }

    resize() {
        if (this.canvas) {
            this.canvas.width = window.innerWidth;
            this.canvas.height = window.innerHeight;
        }
    }

    fire(durationMs = 4500) {
        this.init();
        const colors = [
            '#ff758c', '#ff7eb3', '#fbc2eb', '#a18cd1',
            '#fad0c4', '#ffd1ff', '#ffeaa7', '#55efc4', '#74b9ff'
        ];

        const particleCount = window.innerWidth < 600 ? 120 : 220;

        for (let i = 0; i < particleCount; i++) {
            const isHeart = Math.random() < 0.25;
            this.particles.push({
                x: window.innerWidth * 0.5 + (Math.random() - 0.5) * 150,
                y: window.innerHeight * 0.65,
                vx: (Math.random() - 0.5) * 18,
                vy: -Math.random() * 22 - 6,
                size: Math.random() * 8 + 6,
                color: colors[Math.floor(Math.random() * colors.length)],
                rotation: Math.random() * 360,
                rotationSpeed: (Math.random() - 0.5) * 10,
                gravity: 0.55,
                drag: 0.96,
                opacity: 1,
                decay: Math.random() * 0.005 + 0.003,
                isHeart: isHeart,
                wobble: Math.random() * Math.PI * 2,
                wobbleSpeed: Math.random() * 0.1 + 0.05
            });
        }

        if (!this.isActive) {
            this.isActive = true;
            this.loop();
        }

        setTimeout(() => {
            // Gradually finish
        }, durationMs);
    }

    drawHeart(ctx, x, y, size, color, opacity) {
        ctx.save();
        ctx.translate(x, y);
        ctx.fillStyle = color;
        ctx.globalAlpha = opacity;
        ctx.beginPath();
        const topCurveHeight = size * 0.3;
        ctx.moveTo(0, topCurveHeight);
        // top left curve
        ctx.bezierCurveTo(
            -size / 2, -size / 2,
            -size, topCurveHeight / 3,
            0, size
        );
        // top right curve
        ctx.bezierCurveTo(
            size, topCurveHeight / 3,
            size / 2, -size / 2,
            0, topCurveHeight
        );
        ctx.closePath();
        ctx.fill();
        ctx.restore();
    }

    loop() {
        if (!this.isActive) return;

        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];

            p.vx *= p.drag;
            p.vy *= p.drag;
            p.vy += p.gravity;
            p.x += p.vx;
            p.y += p.vy;
            p.rotation += p.rotationSpeed;
            p.opacity -= p.decay;
            p.wobble += p.wobbleSpeed;

            if (p.opacity <= 0 || p.y > this.canvas.height + 50) {
                this.particles.splice(i, 1);
                continue;
            }

            if (p.isHeart) {
                this.drawHeart(this.ctx, p.x + Math.sin(p.wobble) * 4, p.y, p.size, p.color, p.opacity);
            } else {
                this.ctx.save();
                this.ctx.translate(p.x + Math.sin(p.wobble) * 5, p.y);
                this.ctx.rotate((p.rotation * Math.PI) / 180);
                this.ctx.fillStyle = p.color;
                this.ctx.globalAlpha = p.opacity;
                this.ctx.fillRect(-p.size / 2, -p.size / 2, p.size, p.size * 0.6);
                this.ctx.restore();
            }
        }

        if (this.particles.length > 0) {
            this.animId = requestAnimationFrame(() => this.loop());
        } else {
            this.isActive = false;
            if (this.canvas) {
                this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
            }
        }
    }
}

window.confettiCannon = new ConfettiCannon();
