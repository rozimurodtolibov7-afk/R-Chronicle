/* ==========================================
   BREATHEBALANCE GAME - Nafas meditatsiyasi
   Stressni kamaytirish va parasimpatik tizimni faollashtirish
   ========================================== */

class BreatheBalanceGame {
    constructor() {
        this.cycles = 5;
        this.currentCycle = 0;
        this.phase = 'ready'; // ready, inhale, hold, exhale, hold2
        this.isActive = false;
        this.startTime = null;
        
        // Breathing pattern (4-7-8 technique)
        this.timings = {
            inhale: 4000,    // 4 seconds
            hold: 7000,      // 7 seconds
            exhale: 8000,    // 8 seconds
            hold2: 2000      // 2 seconds pause
        };
    }
    
    init() {
        const content = document.getElementById('gameContent');
        content.innerHTML = `
            <div class="breathe-game">
                <div class="game-header">
                    <h2>${i18n.t('breathe_title')}</h2>
                    <p class="game-instruction">${i18n.t('breathe_instruction')}</p>
                </div>
                
                <div class="breathe-stats">
                    <div class="stat">
                        <span class="stat-label">${i18n.t('breathe_cycle')}</span>
                        <span class="stat-value" id="bbCycle">0/5</span>
                    </div>
                </div>
                
                <div class="breathe-container">
                    <div class="breathe-circle-outer">
                        <div class="breathe-circle" id="breatheCircle">
                            <div class="breathe-text" id="breatheText">${i18n.t('start')}</div>
                        </div>
                    </div>
                    
                    <div class="breathe-instruction" id="breatheInstruction">
                        ${i18n.t('breathe_instruction')}
                    </div>
                </div>
                
                <button class="btn-game" id="bbStartBtn">${i18n.t('start')}</button>
            </div>
        `;
        
        this.addStyles();
        this.attachEventListeners();
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .breathe-game {
                text-align: center;
                padding: 2rem;
                background: linear-gradient(135deg, #0f3460 0%, #1a1a2e 100%);
                border-radius: var(--radius-lg);
            }
            
            .game-header h2 {
                font-size: 2rem;
                margin-bottom: 1rem;
            }
            
            .game-instruction {
                color: var(--neuro-text-dim);
                margin-bottom: 2rem;
                font-size: 1.1rem;
            }
            
            .breathe-stats {
                display: flex;
                justify-content: center;
                margin-bottom: 3rem;
            }
            
            .breathe-container {
                display: flex;
                flex-direction: column;
                align-items: center;
                gap: 3rem;
                margin-bottom: 3rem;
                min-height: 500px;
                justify-content: center;
            }
            
            .breathe-circle-outer {
                position: relative;
                width: 350px;
                height: 350px;
                display: flex;
                align-items: center;
                justify-content: center;
            }
            
            .breathe-circle {
                width: 200px;
                height: 200px;
                border-radius: 50%;
                background: radial-gradient(circle, var(--neuro-calm), var(--neuro-pulse));
                display: flex;
                align-items: center;
                justify-content: center;
                box-shadow: 0 0 40px rgba(74, 144, 226, 0.6);
                transition: all 0.3s ease;
                position: relative;
            }
            
            .breathe-circle::before {
                content: '';
                position: absolute;
                width: 100%;
                height: 100%;
                border-radius: 50%;
                background: inherit;
                filter: blur(20px);
                opacity: 0.5;
                z-index: -1;
            }
            
            .breathe-circle.inhale {
                animation: breatheIn 4s ease-in-out forwards;
            }
            
            .breathe-circle.hold {
                transform: scale(1.5);
            }
            
            .breathe-circle.exhale {
                animation: breatheOut 8s ease-in-out forwards;
            }
            
            @keyframes breatheIn {
                from {
                    transform: scale(1);
                    box-shadow: 0 0 40px rgba(74, 144, 226, 0.6);
                }
                to {
                    transform: scale(1.5);
                    box-shadow: 0 0 80px rgba(74, 144, 226, 0.9);
                }
            }
            
            @keyframes breatheOut {
                from {
                    transform: scale(1.5);
                    box-shadow: 0 0 80px rgba(74, 144, 226, 0.9);
                }
                to {
                    transform: scale(1);
                    box-shadow: 0 0 40px rgba(74, 144, 226, 0.6);
                }
            }
            
            .breathe-text {
                font-size: 1.8rem;
                font-weight: 600;
                color: white;
                text-shadow: 0 2px 10px rgba(0, 0, 0, 0.5);
                z-index: 1;
            }
            
            .breathe-instruction {
                font-size: 1.5rem;
                color: var(--neuro-text);
                font-weight: 500;
                min-height: 2rem;
                transition: all 0.5s ease;
            }
            
            .breathe-instruction.pulse-text {
                animation: pulse 2s ease-in-out infinite;
            }
            
            /* Floating particles for calm effect */
            .particle-container {
                position: absolute;
                top: 0;
                left: 0;
                width: 100%;
                height: 100%;
                pointer-events: none;
                overflow: hidden;
                border-radius: 50%;
            }
            
            .breathe-particle {
                position: absolute;
                width: 4px;
                height: 4px;
                background: rgba(255, 255, 255, 0.6);
                border-radius: 50%;
                animation: floatParticle 4s infinite;
            }
            
            @keyframes floatParticle {
                0%, 100% {
                    transform: translateY(0) translateX(0);
                    opacity: 0;
                }
                50% {
                    opacity: 1;
                }
                100% {
                    transform: translateY(-100px) translateX(var(--tx));
                    opacity: 0;
                }
            }
            
            @media (max-width: 600px) {
                .breathe-circle-outer {
                    width: 300px;
                    height: 300px;
                }
                
                .breathe-circle {
                    width: 150px;
                    height: 150px;
                }
                
                .breathe-text {
                    font-size: 1.4rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    attachEventListeners() {
        document.getElementById('bbStartBtn').addEventListener('click', () => {
            this.start();
        });
    }
    
    async start() {
        this.currentCycle = 0;
        this.isActive = true;
        this.startTime = Date.now();
        
        document.getElementById('bbStartBtn').style.display = 'none';
        
        // Create floating particles
        this.createParticles();
        
        // Start breathing cycles
        while (this.currentCycle < this.cycles && this.isActive) {
            this.currentCycle++;
            this.updateStats();
            
            await this.breatheCycle();
        }
        
        if (this.isActive) {
            this.complete();
        }
    }
    
    async breatheCycle() {
        // Inhale
        await this.breathePhase('inhale', this.timings.inhale);
        
        // Hold
        await this.breathePhase('hold', this.timings.hold);
        
        // Exhale
        await this.breathePhase('exhale', this.timings.exhale);
        
        // Small pause
        await this.breathePhase('hold2', this.timings.hold2);
    }
    
    async breathePhase(phase, duration) {
        const circle = document.getElementById('breatheCircle');
        const text = document.getElementById('breatheText');
        const instruction = document.getElementById('breatheInstruction');
        
        // Remove previous classes
        circle.classList.remove('inhale', 'hold', 'exhale');
        
        // Set phase
        if (phase === 'inhale') {
            circle.classList.add('inhale');
            text.textContent = '↑';
            instruction.textContent = i18n.t('breathe_inhale');
            audioManager.playBreathCue('inhale');
        } else if (phase === 'hold' || phase === 'hold2') {
            circle.classList.add('hold');
            text.textContent = '◉';
            instruction.textContent = i18n.t('breathe_hold');
        } else if (phase === 'exhale') {
            circle.classList.add('exhale');
            text.textContent = '↓';
            instruction.textContent = i18n.t('breathe_exhale');
            audioManager.playBreathCue('exhale');
        }
        
        instruction.classList.add('pulse-text');
        
        await this.wait(duration);
        
        instruction.classList.remove('pulse-text');
    }
    
    createParticles() {
        const outer = document.querySelector('.breathe-circle-outer');
        const container = document.createElement('div');
        container.className = 'particle-container';
        
        for (let i = 0; i < 20; i++) {
            const particle = document.createElement('div');
            particle.className = 'breathe-particle';
            particle.style.left = `${Math.random() * 100}%`;
            particle.style.top = '100%';
            particle.style.setProperty('--tx', `${(Math.random() - 0.5) * 100}px`);
            particle.style.animationDelay = `${Math.random() * 4}s`;
            container.appendChild(particle);
        }
        
        outer.appendChild(container);
    }
    
    updateStats() {
        document.getElementById('bbCycle').textContent = `${this.currentCycle}/${this.cycles}`;
    }
    
    complete() {
        const circle = document.getElementById('breatheCircle');
        const text = document.getElementById('breatheText');
        const instruction = document.getElementById('breatheInstruction');
        
        circle.classList.remove('inhale', 'hold', 'exhale');
        text.textContent = '✓';
        instruction.textContent = i18n.t('breathe_calm');
        
        const totalTime = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Save stats
        Storage.updateGameStats('breathebalance', this.cycles, totalTime);
        
        // Award XP
        const xpEarned = 10;
        const result = Storage.addXP(xpEarned);
        
        showToast(`+${xpEarned} XP - ${i18n.t('breathe_calm')}`);
        
        if (result.leveledUp) {
            setTimeout(() => {
                showToast(`🎉 ${i18n.t('levelUp')} ${result.newLevel}`);
                audioManager.playLevelUp();
            }, 1000);
        }
        
        // Show restart button
        const btn = document.getElementById('bbStartBtn');
        btn.textContent = i18n.t('continue');
        btn.style.display = 'block';
    }
    
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export
window.BreatheBalanceGame = BreatheBalanceGame;
