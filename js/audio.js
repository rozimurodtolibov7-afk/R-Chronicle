/* ==========================================
   NEUROFLOW - AUDIO SYSTEM
   Web Audio API bilan psixologik ovozlar
   ========================================== */

class AudioManager {
    constructor() {
        this.context = null;
        this.masterGain = null;
        this.enabled = true;
        this.initialized = false;
        
        // Sound settings
        this.settings = {
            musicVolume: 0.3,
            sfxVolume: 0.5
        };
        
        // Load saved settings
        const savedSettings = Storage.getAudioSettings();
        if (savedSettings) {
            this.enabled = savedSettings.audioEnabled;
            this.settings.musicVolume = savedSettings.musicVolume || 0.3;
            this.settings.sfxVolume = savedSettings.sfxVolume || 0.5;
        }
    }
    
    // Initialize Audio Context (must be called after user interaction)
    init() {
        if (this.initialized) return;
        
        try {
            this.context = new (window.AudioContext || window.webkitAudioContext)();
            this.masterGain = this.context.createGain();
            this.masterGain.connect(this.context.destination);
            this.initialized = true;
        } catch (error) {
            console.error('Audio initialization failed:', error);
        }
    }
    
    // Generate success sound (pleasant ding)
    playSuccess() {
        if (!this.enabled || !this.initialized) return;
        
        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Pleasant frequency (C note)
            oscillator.frequency.setValueAtTime(523.25, this.context.currentTime);
            
            // ADSR envelope
            gainNode.gain.setValueAtTime(0, this.context.currentTime);
            gainNode.gain.linearRampToValueAtTime(
                this.settings.sfxVolume * 0.3, 
                this.context.currentTime + 0.01
            );
            gainNode.gain.exponentialRampToValueAtTime(
                0.01, 
                this.context.currentTime + 0.3
            );
            
            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + 0.3);
        } catch (error) {
            console.error('Success sound error:', error);
        }
    }
    
    // Generate error sound (subtle tap)
    playError() {
        if (!this.enabled || !this.initialized) return;
        
        try {
            const bufferSize = this.context.sampleRate * 0.05;
            const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
            const data = buffer.getChannelData(0);
            
            // White noise
            for (let i = 0; i < bufferSize; i++) {
                data[i] = (Math.random() * 2 - 1) * 0.1;
            }
            
            const source = this.context.createBufferSource();
            const gainNode = this.context.createGain();
            
            source.buffer = buffer;
            source.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            gainNode.gain.setValueAtTime(this.settings.sfxVolume * 0.2, this.context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);
            
            source.start();
        } catch (error) {
            console.error('Error sound error:', error);
        }
    }
    
    // Generate click sound (button feedback)
    playClick() {
        if (!this.enabled || !this.initialized) return;
        
        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            oscillator.frequency.setValueAtTime(200, this.context.currentTime);
            
            gainNode.gain.setValueAtTime(this.settings.sfxVolume * 0.1, this.context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.context.currentTime + 0.05);
            
            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + 0.05);
        } catch (error) {
            console.error('Click sound error:', error);
        }
    }
    
    // Generate level up sound (celebration)
    playLevelUp() {
        if (!this.enabled || !this.initialized) return;
        
        try {
            const now = this.context.currentTime;
            const notes = [523.25, 659.25, 783.99]; // C, E, G (major chord)
            
            notes.forEach((freq, index) => {
                const oscillator = this.context.createOscillator();
                const gainNode = this.context.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(this.masterGain);
                
                oscillator.frequency.setValueAtTime(freq, now);
                
                const startTime = now + (index * 0.1);
                gainNode.gain.setValueAtTime(0, startTime);
                gainNode.gain.linearRampToValueAtTime(
                    this.settings.sfxVolume * 0.2,
                    startTime + 0.05
                );
                gainNode.gain.exponentialRampToValueAtTime(
                    0.01,
                    startTime + 0.4
                );
                
                oscillator.start(startTime);
                oscillator.stop(startTime + 0.4);
            });
        } catch (error) {
            console.error('Level up sound error:', error);
        }
    }
    
    // Play ambient background music (binaural beats for focus)
    playAmbient() {
        if (!this.enabled || !this.initialized) return;
        
        try {
            // Create two oscillators for binaural beat
            const baseFreq = 200; // Base frequency
            const beatFreq = 10;  // Alpha wave (10 Hz difference for focus)
            
            const osc1 = this.context.createOscillator();
            const osc2 = this.context.createOscillator();
            
            const gainNode = this.context.createGain();
            const pannerL = this.context.createStereoPanner();
            const pannerR = this.context.createStereoPanner();
            
            osc1.frequency.setValueAtTime(baseFreq, this.context.currentTime);
            osc2.frequency.setValueAtTime(baseFreq + beatFreq, this.context.currentTime);
            
            osc1.type = 'sine';
            osc2.type = 'sine';
            
            pannerL.pan.value = -1; // Left ear
            pannerR.pan.value = 1;  // Right ear
            
            osc1.connect(pannerL);
            osc2.connect(pannerR);
            pannerL.connect(gainNode);
            pannerR.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            gainNode.gain.setValueAtTime(this.settings.musicVolume * 0.1, this.context.currentTime);
            
            osc1.start();
            osc2.start();
            
            // Store oscillators to stop later
            this.ambientOscillators = [osc1, osc2];
        } catch (error) {
            console.error('Ambient sound error:', error);
        }
    }
    
    // Stop ambient music
    stopAmbient() {
        if (this.ambientOscillators) {
            this.ambientOscillators.forEach(osc => {
                try {
                    osc.stop();
                } catch (e) {
                    // Already stopped
                }
            });
            this.ambientOscillators = null;
        }
    }
    
    // Play breathing guide sound
    playBreathCue(type) {
        if (!this.enabled || !this.initialized) return;
        
        try {
            const oscillator = this.context.createOscillator();
            const gainNode = this.context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(this.masterGain);
            
            // Different tones for inhale/exhale
            if (type === 'inhale') {
                oscillator.frequency.setValueAtTime(440, this.context.currentTime);
            } else if (type === 'exhale') {
                oscillator.frequency.setValueAtTime(330, this.context.currentTime);
            }
            
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0, this.context.currentTime);
            gainNode.gain.linearRampToValueAtTime(
                this.settings.sfxVolume * 0.15,
                this.context.currentTime + 0.1
            );
            gainNode.gain.exponentialRampToValueAtTime(
                0.01,
                this.context.currentTime + 0.5
            );
            
            oscillator.start(this.context.currentTime);
            oscillator.stop(this.context.currentTime + 0.5);
        } catch (error) {
            console.error('Breath cue sound error:', error);
        }
    }
    
    // Toggle audio on/off
    toggle() {
        this.enabled = !this.enabled;
        Storage.updateAudioSettings({ audioEnabled: this.enabled });
        
        if (!this.enabled) {
            this.stopAmbient();
        }
        
        return this.enabled;
    }
    
    // Set volume
    setMusicVolume(volume) {
        this.settings.musicVolume = Math.max(0, Math.min(1, volume));
        Storage.updateAudioSettings({ musicVolume: this.settings.musicVolume });
    }
    
    setSFXVolume(volume) {
        this.settings.sfxVolume = Math.max(0, Math.min(1, volume));
        Storage.updateAudioSettings({ sfxVolume: this.settings.sfxVolume });
    }
}

// Create global audio manager instance
window.audioManager = new AudioManager();
