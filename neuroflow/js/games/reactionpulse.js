/* ==========================================
   REACTIONPULSE GAME - Reaktsiya tezligi
   Motor korteks va reaktsiya vaqtini yaxshilash
   ========================================== */

class ReactionPulseGame {
    constructor() {
        this.rounds = 5;
        this.currentRound = 0;
        this.reactionTimes = [];
        this.startTime = null;
        this.waitTimeout = null;
        this.isWaiting = false;
        this.totalGameTime = 0;
    }
    
    init() {
        const content = document.getElementById('gameContent');
        content.innerHTML = `
            <div class="reaction-game">
                <div class="game-header">
                    <h2>${i18n.t('reaction_title')}</h2>
                    <p class="game-instruction">${i18n.t('reaction_instruction')}</p>
                </div>
                
                <div class="reaction-stats">
                    <div class="stat">
                        <span class="stat-label">${i18n.t('colorflow_round')}</span>
                        <span class="stat-value" id="rpRound">0/5</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">${i18n.t('reaction_avgTime')}</span>
                        <span class="stat-value" id="rpAvg">-</span>
                    </div>
                </div>
                
                <div class="reaction-area" id="reactionArea">
                    <div class="reaction-circle" id="reactionCircle">
                        <span id="reactionText">${i18n.t('start')}</span>
                    </div>
                </div>
                
                <div class="reaction-results" id="reactionResults"></div>
            </div>
        `;
        
        this.addStyles();
        this.attachEventListeners();
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .reaction-game {
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
                font-size: 1.1rem;
            }
            
            .reaction-stats {
                display: flex;
                justify-content: center;
                gap: 3rem;
                margin-bottom: 3rem;
            }
            
            .reaction-area {
                display: flex;
                justify-content: center;
                align-items: center;
                min-height: 400px;
                margin-bottom: 2rem;
            }
            
            .reaction-circle {
                width: 250px;
                height: 250px;
                border-radius: 50%;
                display: flex;
                justify-content: center;
                align-items: center;
                cursor: pointer;
                transition: all 0.2s ease;
                background: var(--neuro-focus);
                border: 4px solid var(--neuro-flow);
                user-select: none;
            }
            
            .reaction-circle:hover {
                transform: scale(1.05);
            }
            
            .reaction-circle.waiting {
                background: var(--neuro-energy);
                border-color: var(--neuro-energy);
                animation: pulse 1s infinite;
            }
            
            .reaction-circle.ready {
                background: var(--neuro-success);
                border-color: var(--neuro-success);
                box-shadow: 0 0 30px var(--neuro-success);
            }
            
            .reaction-circle.too-early {
                background: var(--neuro-energy);
                border-color: var(--neuro-energy);
                animation: shake 0.3s;
            }
            
            #reactionText {
                font-size: 1.8rem;
                font-weight: bold;
                color: white;
            }
            
            .reaction-results {
                display: grid;
                grid-template-columns: repeat(5, 1fr);
                gap: 1rem;
                max-width: 600px;
                margin: 0 auto;
            }
            
            .result-item {
                background: var(--neuro-focus);
                padding: 1rem;
                border-radius: var(--radius-sm);
                border: 2px solid transparent;
                transition: all 0.3s ease;
            }
            
            .result-item.good {
                border-color: var(--neuro-success);
            }
            
            .result-item.average {
                border-color: var(--neuro-calm);
            }
            
            .result-item.slow {
                border-color: var(--neuro-text-dim);
            }
            
            .result-number {
                font-size: 0.9rem;
                color: var(--neuro-text-dim);
                margin-bottom: 0.25rem;
            }
            
            .result-time {
                font-size: 1.3rem;
                font-weight: bold;
            }
            
            @media (max-width: 600px) {
                .reaction-circle {
                    width: 200px;
                    height: 200px;
                }
                
                .reaction-results {
                    grid-template-columns: repeat(3, 1fr);
                }
                
                #reactionText {
                    font-size: 1.4rem;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    attachEventListeners() {
        const circle = document.getElementById('reactionCircle');
        circle.addEventListener('click', () => this.handleClick());
    }
    
    handleClick() {
        const circle = document.getElementById('reactionCircle');
        const text = document.getElementById('reactionText');
        
        // Start game
        if (this.currentRound === 0 && !this.isWaiting) {
            this.startRound();
            return;
        }
        
        // Too early
        if (this.isWaiting && !circle.classList.contains('ready')) {
            this.tooEarly();
            return;
        }
        
        // Correct click
        if (circle.classList.contains('ready')) {
            this.recordReaction();
        }
    }
    
    startRound() {
        this.currentRound++;
        this.isWaiting = true;
        
        const circle = document.getElementById('reactionCircle');
        const text = document.getElementById('reactionText');
        
        circle.classList.add('waiting');
        circle.classList.remove('ready', 'too-early');
        text.textContent = i18n.t('reaction_wait');
        
        // Random delay between 1-4 seconds
        const delay = 1000 + Math.random() * 3000;
        
        this.waitTimeout = setTimeout(() => {
            this.showGreen();
        }, delay);
        
        this.updateStats();
    }
    
    showGreen() {
        const circle = document.getElementById('reactionCircle');
        const text = document.getElementById('reactionText');
        
        circle.classList.remove('waiting');
        circle.classList.add('ready');
        text.textContent = i18n.t('reaction_click');
        
        this.startTime = performance.now();
        audioManager.playSuccess();
    }
    
    tooEarly() {
        clearTimeout(this.waitTimeout);
        this.isWaiting = false;
        
        const circle = document.getElementById('reactionCircle');
        const text = document.getElementById('reactionText');
        
        circle.classList.remove('waiting', 'ready');
        circle.classList.add('too-early');
        text.textContent = i18n.t('reaction_tooEarly');
        
        audioManager.playError();
        
        setTimeout(() => {
            if (this.currentRound < this.rounds) {
                this.startRound();
            }
        }, 1500);
    }
    
    recordReaction() {
        const reactionTime = Math.round(performance.now() - this.startTime);
        this.reactionTimes.push(reactionTime);
        
        const circle = document.getElementById('reactionCircle');
        const text = document.getElementById('reactionText');
        
        circle.classList.remove('ready');
        
        // Show reaction time
        text.textContent = `${reactionTime}ms`;
        
        audioManager.playSuccess();
        this.showResult(reactionTime);
        this.updateStats();
        
        setTimeout(() => {
            if (this.currentRound < this.rounds) {
                this.startRound();
            } else {
                this.endGame();
            }
        }, 1500);
    }
    
    showResult(time) {
        const results = document.getElementById('reactionResults');
        const item = document.createElement('div');
        item.className = 'result-item';
        
        // Categorize reaction time
        if (time < 250) {
            item.classList.add('good');
        } else if (time < 350) {
            item.classList.add('average');
        } else {
            item.classList.add('slow');
        }
        
        item.innerHTML = `
            <div class="result-number">#${this.currentRound}</div>
            <div class="result-time">${time}ms</div>
        `;
        
        item.classList.add('celebrate');
        results.appendChild(item);
    }
    
    updateStats() {
        document.getElementById('rpRound').textContent = `${this.currentRound}/${this.rounds}`;
        
        if (this.reactionTimes.length > 0) {
            const avg = Math.round(
                this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length
            );
            document.getElementById('rpAvg').textContent = `${avg}ms`;
        }
    }
    
    endGame() {
        const circle = document.getElementById('reactionCircle');
        const text = document.getElementById('reactionText');
        
        const avgTime = Math.round(
            this.reactionTimes.reduce((a, b) => a + b, 0) / this.reactionTimes.length
        );
        
        text.textContent = `${i18n.t('excellent')} ${avgTime}ms`;
        circle.classList.remove('waiting', 'ready');
        
        // Calculate score (lower time = higher score)
        const score = Math.max(0, 500 - avgTime);
        
        // Save stats
        Storage.updateGameStats('reactionpulse', avgTime, this.totalGameTime);
        
        // Add XP
        let xpEarned = 20;
        if (avgTime < 250) xpEarned = 30; // Excellent
        else if (avgTime < 300) xpEarned = 25; // Good
        
        const result = Storage.addXP(xpEarned);
        
        showToast(`+${xpEarned} XP - ${i18n.t('reaction_avgTime')}: ${avgTime}ms`);
        
        if (result.leveledUp) {
            setTimeout(() => {
                showToast(`🎉 ${i18n.t('levelUp')} ${result.newLevel}`);
                audioManager.playLevelUp();
            }, 1000);
        }
        
        // Show restart option
        setTimeout(() => {
            circle.style.cursor = 'pointer';
            text.textContent = i18n.t('tryAgain');
            circle.onclick = () => {
                this.reset();
                this.handleClick();
            };
        }, 2000);
    }
    
    reset() {
        this.currentRound = 0;
        this.reactionTimes = [];
        this.isWaiting = false;
        document.getElementById('reactionResults').innerHTML = '';
        document.getElementById('rpAvg').textContent = '-';
    }
}

// Export
window.ReactionPulseGame = ReactionPulseGame;
