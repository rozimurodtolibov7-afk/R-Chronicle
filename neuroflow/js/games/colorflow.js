/* ==========================================
   COLORFLOW GAME - Rang xotirasi o'yini
   Ishchi xotirani rivojlantirish
   ========================================== */

class ColorFlowGame {
    constructor() {
        this.colors = [
            { name: 'red', hex: '#ee5a6f', sound: 261.63 },
            { name: 'blue', hex: '#4a90e2', sound: 293.66 },
            { name: 'green', hex: '#05c46b', sound: 329.63 },
            { name: 'yellow', hex: '#ffd93d', sound: 349.23 },
            { name: 'purple', hex: '#533483', sound: 392.00 },
            { name: 'orange', hex: '#ff6b6b', sound: 440.00 }
        ];
        
        this.sequence = [];
        this.userSequence = [];
        this.level = 1;
        this.score = 0;
        this.isPlaying = false;
        this.startTime = null;
    }
    
    init() {
        const content = document.getElementById('gameContent');
        content.innerHTML = `
            <div class="colorflow-game">
                <div class="game-header">
                    <h2>${i18n.t('colorflow_title')}</h2>
                    <p class="game-instruction">${i18n.t('colorflow_instruction')}</p>
                </div>
                
                <div class="game-stats">
                    <div class="stat">
                        <span class="stat-label">${i18n.t('colorflow_round')}</span>
                        <span class="stat-value" id="cfRound">1</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">${i18n.t('colorflow_score')}</span>
                        <span class="stat-value" id="cfScore">0</span>
                    </div>
                </div>
                
                <div class="game-status" id="cfStatus">${i18n.t('colorflow_ready')}</div>
                
                <div class="color-grid" id="colorGrid"></div>
                
                <button class="btn-game" id="cfStartBtn">${i18n.t('start')}</button>
            </div>
        `;
        
        this.addStyles();
        this.createColorButtons();
        this.attachEventListeners();
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .colorflow-game {
                text-align: center;
                padding: 2rem;
            }
            
            .game-header h2 {
                font-size: 2rem;
                margin-bottom: 1rem;
            }
            
            .game-instruction {
                color: var(--neuro-text-dim);
                margin-bottom: 2rem;
            }
            
            .game-stats {
                display: flex;
                justify-content: center;
                gap: 3rem;
                margin-bottom: 2rem;
            }
            
            .stat {
                display: flex;
                flex-direction: column;
                gap: 0.5rem;
            }
            
            .stat-label {
                font-size: 0.9rem;
                color: var(--neuro-text-dim);
            }
            
            .stat-value {
                font-size: 2rem;
                font-weight: bold;
                color: var(--neuro-calm);
            }
            
            .game-status {
                font-size: 1.5rem;
                font-weight: 600;
                margin-bottom: 2rem;
                min-height: 2rem;
                color: var(--neuro-success);
            }
            
            .color-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 1rem;
                max-width: 500px;
                margin: 0 auto 2rem;
            }
            
            .color-btn {
                aspect-ratio: 1;
                border: none;
                border-radius: var(--radius-md);
                cursor: pointer;
                transition: all var(--transition-fast);
                box-shadow: var(--shadow-sm);
                position: relative;
                overflow: hidden;
            }
            
            .color-btn:hover:not(:disabled) {
                transform: scale(1.05);
                box-shadow: var(--shadow-md);
            }
            
            .color-btn:active:not(:disabled) {
                transform: scale(0.95);
            }
            
            .color-btn:disabled {
                cursor: not-allowed;
                opacity: 0.6;
            }
            
            .color-btn.flash {
                animation: colorFlash 0.5s ease;
            }
            
            @keyframes colorFlash {
                0%, 100% { transform: scale(1); filter: brightness(1); }
                50% { transform: scale(1.1); filter: brightness(1.5); }
            }
            
            .btn-game {
                background: linear-gradient(135deg, var(--neuro-calm), var(--neuro-pulse));
                color: white;
                border: none;
                padding: 1rem 3rem;
                border-radius: var(--radius-md);
                font-size: 1.2rem;
                font-weight: 600;
                cursor: pointer;
                transition: all var(--transition-normal);
            }
            
            .btn-game:hover {
                transform: translateY(-2px);
                box-shadow: var(--shadow-md);
            }
            
            .btn-game:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            @media (max-width: 480px) {
                .color-grid {
                    grid-template-columns: repeat(2, 1fr);
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    createColorButtons() {
        const grid = document.getElementById('colorGrid');
        this.colors.forEach((color, index) => {
            const btn = document.createElement('button');
            btn.className = 'color-btn';
            btn.style.backgroundColor = color.hex;
            btn.dataset.colorIndex = index;
            btn.disabled = true;
            grid.appendChild(btn);
        });
    }
    
    attachEventListeners() {
        document.getElementById('cfStartBtn').addEventListener('click', () => {
            this.start();
        });
        
        document.querySelectorAll('.color-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.handleColorClick(parseInt(e.target.dataset.colorIndex));
            });
        });
    }
    
    start() {
        this.sequence = [];
        this.level = 1;
        this.score = 0;
        this.startTime = Date.now();
        
        document.getElementById('cfStartBtn').style.display = 'none';
        this.updateDisplay();
        this.nextRound();
    }
    
    nextRound() {
        this.userSequence = [];
        this.addToSequence();
        this.playSequence();
    }
    
    addToSequence() {
        const randomIndex = Math.floor(Math.random() * this.colors.length);
        this.sequence.push(randomIndex);
    }
    
    async playSequence() {
        this.isPlaying = true;
        this.disableButtons();
        this.updateStatus(i18n.t('colorflow_watch'));
        
        for (let i = 0; i < this.sequence.length; i++) {
            await this.wait(500);
            await this.flashColor(this.sequence[i]);
        }
        
        this.isPlaying = false;
        this.enableButtons();
        this.updateStatus(i18n.t('colorflow_yourTurn'));
    }
    
    async flashColor(colorIndex) {
        const btn = document.querySelector(`[data-color-index="${colorIndex}"]`);
        btn.classList.add('flash');
        
        // Play sound
        if (audioManager.initialized) {
            this.playColorSound(this.colors[colorIndex].sound);
        }
        
        await this.wait(400);
        btn.classList.remove('flash');
    }
    
    playColorSound(frequency) {
        try {
            const oscillator = audioManager.context.createOscillator();
            const gainNode = audioManager.context.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioManager.masterGain);
            
            oscillator.frequency.setValueAtTime(frequency, audioManager.context.currentTime);
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.2, audioManager.context.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioManager.context.currentTime + 0.3);
            
            oscillator.start();
            oscillator.stop(audioManager.context.currentTime + 0.3);
        } catch (e) {}
    }
    
    handleColorClick(colorIndex) {
        if (this.isPlaying) return;
        
        audioManager.playClick();
        this.flashColor(colorIndex);
        
        this.userSequence.push(colorIndex);
        
        // Check if correct
        const currentIndex = this.userSequence.length - 1;
        if (this.userSequence[currentIndex] !== this.sequence[currentIndex]) {
            this.gameOver(false);
            return;
        }
        
        // Check if sequence completed
        if (this.userSequence.length === this.sequence.length) {
            this.score += this.level * 10;
            this.level++;
            this.updateDisplay();
            audioManager.playSuccess();
            
            setTimeout(() => {
                if (this.level <= 12) { // Max 12 rounds
                    this.nextRound();
                } else {
                    this.gameOver(true);
                }
            }, 1000);
        }
    }
    
    gameOver(won) {
        const totalTime = Math.floor((Date.now() - this.startTime) / 1000);
        
        this.disableButtons();
        
        if (won) {
            this.updateStatus(`🎉 ${i18n.t('excellent')} ${i18n.t('colorflow_score')}: ${this.score}`);
            audioManager.playLevelUp();
        } else {
            this.updateStatus(`${i18n.t('wrong')} ${i18n.t('colorflow_score')}: ${this.score}`);
            audioManager.playError();
        }
        
        // Save stats
        Storage.updateGameStats('colorflow', this.score, totalTime);
        
        // Add XP
        const xpEarned = Math.max(15, this.score);
        const result = Storage.addXP(xpEarned);
        
        showToast(`+${xpEarned} XP`);
        
        if (result.leveledUp) {
            setTimeout(() => {
                showToast(`🎉 ${i18n.t('levelUp')} ${result.newLevel}`);
            }, 1000);
        }
        
        // Show restart button
        const btn = document.getElementById('cfStartBtn');
        btn.textContent = i18n.t('tryAgain');
        btn.style.display = 'block';
    }
    
    updateDisplay() {
        document.getElementById('cfRound').textContent = this.level;
        document.getElementById('cfScore').textContent = this.score;
    }
    
    updateStatus(text) {
        document.getElementById('cfStatus').textContent = text;
    }
    
    disableButtons() {
        document.querySelectorAll('.color-btn').forEach(btn => btn.disabled = true);
    }
    
    enableButtons() {
        document.querySelectorAll('.color-btn').forEach(btn => btn.disabled = false);
    }
    
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export
window.ColorFlowGame = ColorFlowGame;
