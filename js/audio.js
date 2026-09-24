/**
 * audio.js - Web Audio API Sound Synthesizer
 * 100% offline, zero external audio assets, works instantly in all modern browsers.
 */

class SoundEffects {
    constructor() {
        this.ctx = null;
        this.isMusicPlaying = false;
        this.musicInterval = null;
        this.isMuted = false;
    }

    initContext() {
        if (!this.ctx) {
            const AudioContext = window.AudioContext || window.webkitAudioContext;
            if (AudioContext) {
                this.ctx = new AudioContext();
            }
        }
        if (this.ctx && this.ctx.state === 'suspended') {
            this.ctx.resume();
        }
    }

    // Playful escape whoosh sound for YO'Q button
    playWhoosh() {
        if (this.isMuted) return;
        try {
            this.initContext();
            if (!this.ctx) return;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();

            osc.type = 'sine';
            const now = this.ctx.currentTime;
            
            // Pitch glide down and up
            osc.frequency.setValueAtTime(450, now);
            osc.frequency.exponentialRampToValueAtTime(750, now + 0.08);
            osc.frequency.exponentialRampToValueAtTime(320, now + 0.18);

            gain.gain.setValueAtTime(0.08, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.2);
        } catch (e) {
            // Audio context policy safe guard
        }
    }

    // Cute pop sound
    playPop() {
        if (this.isMuted) return;
        try {
            this.initContext();
            if (!this.ctx) return;

            const osc = this.ctx.createOscillator();
            const gain = this.ctx.createGain();
            const now = this.ctx.currentTime;

            osc.type = 'triangle';
            osc.frequency.setValueAtTime(520, now);
            osc.frequency.exponentialRampToValueAtTime(880, now + 0.06);

            gain.gain.setValueAtTime(0.12, now);
            gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);

            osc.connect(gain);
            gain.connect(this.ctx.destination);

            osc.start(now);
            osc.stop(now + 0.09);
        } catch (e) {}
    }

    // Heartfelt celebration chime for "HA"
    playCelebration() {
        if (this.isMuted) return;
        try {
            this.initContext();
            if (!this.ctx) return;

            // Pentatonic warm chime: C5, E5, G5, A5, C6
            const notes = [523.25, 659.25, 783.99, 880.00, 1046.50];
            const now = this.ctx.currentTime;

            notes.forEach((freq, index) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const startTime = now + (index * 0.1);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, startTime);

                gain.gain.setValueAtTime(0.15, startTime);
                gain.gain.exponentialRampToValueAtTime(0.001, startTime + 1.2);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(startTime);
                osc.stop(startTime + 1.25);
            });
        } catch (e) {}
    }

    // Message sent chime
    playMessageSent() {
        if (this.isMuted) return;
        try {
            this.initContext();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            [659.25, 880.00].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const st = now + (idx * 0.08);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, st);
                gain.gain.setValueAtTime(0.1, st);
                gain.gain.exponentialRampToValueAtTime(0.001, st + 0.25);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(st);
                osc.stop(st + 0.26);
            });
        } catch (e) {}
    }

    // Message received notification tone
    playMessageReceived() {
        if (this.isMuted) return;
        try {
            this.initContext();
            if (!this.ctx) return;

            const now = this.ctx.currentTime;
            [880.00, 659.25, 783.99].forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();
                const st = now + (idx * 0.09);

                osc.type = 'sine';
                osc.frequency.setValueAtTime(freq, st);
                gain.gain.setValueAtTime(0.12, st);
                gain.gain.exponentialRampToValueAtTime(0.001, st + 0.35);

                osc.connect(gain);
                gain.connect(this.ctx.destination);
                osc.start(st);
                osc.stop(st + 0.36);
            });
        } catch (e) {}
    }

    // Gentle procedural warm ambient background music (toggled by user only)
    toggleAmbientMusic(onStateChange) {
        this.initContext();
        if (this.isMusicPlaying) {
            this.stopAmbientMusic();
            if (onStateChange) onStateChange(false);
            return false;
        } else {
            this.startAmbientMusic();
            if (onStateChange) onStateChange(true);
            return true;
        }
    }

    startAmbientMusic() {
        if (this.isMusicPlaying || !this.ctx) return;
        this.isMusicPlaying = true;

        // Soothing warm chord progression:
        // Cmaj7 (C4, E4, G4, B4) -> Am7 (A3, C4, E4, G4) -> Fmaj7 (F3, A3, C4, E4) -> Gsus4/G (G3, C4, D4, G4)
        const chordProgression = [
            [261.63, 329.63, 392.00, 493.88], // Cmaj7
            [220.00, 261.63, 329.63, 392.00], // Am7
            [174.61, 220.00, 261.63, 329.63], // Fmaj7
            [196.00, 261.63, 293.66, 392.00]  // Gsus4
        ];

        let chordIndex = 0;

        const playNextChord = () => {
            if (!this.isMusicPlaying || !this.ctx) return;

            const chord = chordProgression[chordIndex];
            chordIndex = (chordIndex + 1) % chordProgression.length;

            const now = this.ctx.currentTime;
            chord.forEach((freq, idx) => {
                const osc = this.ctx.createOscillator();
                const gain = this.ctx.createGain();

                osc.type = 'sine';
                // Slight detune for analog warmth
                osc.frequency.setValueAtTime(freq + (idx % 2 === 0 ? 0.3 : -0.3), now);

                // Very soft gentle ambient volume
                gain.gain.setValueAtTime(0.001, now);
                gain.gain.linearRampToValueAtTime(0.025, now + 1.0);
                gain.gain.exponentialRampToValueAtTime(0.001, now + 3.8);

                osc.connect(gain);
                gain.connect(this.ctx.destination);

                osc.start(now);
                osc.stop(now + 4.0);
            });
        };

        playNextChord();
        this.musicInterval = setInterval(playNextChord, 4000);
    }

    stopAmbientMusic() {
        this.isMusicPlaying = false;
        if (this.musicInterval) {
            clearInterval(this.musicInterval);
            this.musicInterval = null;
        }
    }
}

// Global audio singleton
window.soundFX = new SoundEffects();
