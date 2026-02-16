/* ==========================================
   PATTERNMIND GAME - Naqsh xotirasi
   Vizual-spatial xotirani rivojlantirish
   ========================================== */

class PatternMindGame {
    constructor() {
        this.gridSize = 3; // Start with 3x3
        this.pattern = [];
        this.userPattern = [];
        this.round = 1;
        this.score = 0;
        this.isMemorizing = false;
        this.startTime = null;
    }
    
    init() {
        const content = document.getElementById('gameContent');
        content.innerHTML = `
            <div class="pattern-game">
                <div class="game-header">
                    <h2>${i18n.t('pattern_title')}</h2>
                    <p class="game-instruction">${i18n.t('pattern_instruction')}</p>
                </div>
                
                <div class="pattern-stats">
                    <div class="stat">
                        <span class="stat-label">${i18n.t('colorflow_round')}</span>
                        <span class="stat-value" id="pmRound">1</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">${i18n.t('pattern_gridSize')}</span>
                        <span class="stat-value" id="pmGrid">3×3</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">${i18n.t('colorflow_score')}</span>
                        <span class="stat-value" id="pmScore">0</span>
                    </div>
                </div>
                
                <div class="pattern-status" id="pmStatus">${i18n.t('start')}</div>
                
                <div class="pattern-grid-container">
                    <div class="pattern-grid" id="patternGrid"></div>
                </div>
                
                <button class="btn-game" id="pmStartBtn">${i18n.t('start')}</button>
            </div>
        `;
        
        this.addStyles();
        this.createGrid();
        this.attachEventListeners();
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .pattern-game {
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
            
            .pattern-stats {
                display: flex;
                justify-content: center;
                gap: 2rem;
                margin-bottom: 2rem;
                flex-wrap: wrap;
            }
            
            .pattern-status {
                font-size: 1.5rem;
                font-weight: 600;
                margin-bottom: 2rem;
                min-height: 2rem;
                color: var(--neuro-calm);
            }
            
            .pattern-grid-container {
                display: flex;
                justify-content: center;
                margin-bottom: 2rem;
            }
            
            .pattern-grid {
                display: grid;
                gap: 8px;
                padding: 1rem;
                background: var(--neuro-deep);
                border-radius: var(--radius-md);
                box-shadow: var(--shadow-md);
            }
            
            .pattern-cell {
                background: var(--neuro-focus);
                border: 2px solid var(--neuro-flow);
                border-radius: var(--radius-sm);
                cursor: pointer;
                transition: all var(--transition-fast);
                aspect-ratio: 1;
                min-width: 60px;
                min-height: 60px;
            }
            
            .pattern-cell:hover:not(.active):not(.disabled) {
                background: var(--neuro-flow);
                transform: scale(1.05);
            }
            
            .pattern-cell.active {
                background: var(--neuro-success);
                border-color: var(--neuro-success);
                box-shadow: 0 0 15px var(--neuro-success);
            }
            
            .pattern-cell.user-selected {
                background: var(--neuro-calm);
                border-color: var(--neuro-calm);
            }
            
            .pattern-cell.correct {
                background: var(--neuro-success);
                animation: celebrate 0.5s;
            }
            
            .pattern-cell.wrong {
                background: var(--neuro-energy);
                animation: shake 0.3s;
            }
            
            .pattern-cell.disabled {
                cursor: not-allowed;
                opacity: 0.5;
            }
            
            @media (max-width: 600px) {
                .pattern-cell {
                    min-width: 50px;
                    min-height: 50px;
                }
            }
            
            @media (max-width: 400px) {
                .pattern-cell {
                    min-width: 40px;
                    min-height: 40px;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    createGrid() {
        const grid = document.getElementById('patternGrid');
        grid.style.gridTemplateColumns = `repeat(${this.gridSize}, 1fr)`;
        grid.innerHTML = '';
        
        const totalCells = this.gridSize * this.gridSize;
        for (let i = 0; i < totalCells; i++) {
            const cell = document.createElement('div');
            cell.className = 'pattern-cell disabled';
            cell.dataset.index = i;
            grid.appendChild(cell);
        }
    }
    
    attachEventListeners() {
        document.getElementById('pmStartBtn').addEventListener('click', () => {
            this.start();
        });
        
        document.getElementById('patternGrid').addEventListener('click', (e) => {
            if (e.target.classList.contains('pattern-cell')) {
                this.handleCellClick(parseInt(e.target.dataset.index));
            }
        });
    }
    
    start() {
        this.pattern = [];
        this.userPattern = [];
        this.round = 1;
        this.score = 0;
        this.gridSize = 3;
        this.startTime = Date.now();
        
        document.getElementById('pmStartBtn').style.display = 'none';
        this.createGrid();
        this.updateDisplay();
        this.nextRound();
    }
    
    nextRound() {
        this.userPattern = [];
        this.generatePattern();
        this.showPattern();
    }
    
    generatePattern() {
        const totalCells = this.gridSize * this.gridSize;
        const patternSize = Math.min(this.round + 2, Math.floor(totalCells * 0.6));
        
        this.pattern = [];
        const available = Array.from({ length: totalCells }, (_, i) => i);
        
        for (let i = 0; i < patternSize; i++) {
            const randomIndex = Math.floor(Math.random() * available.length);
            this.pattern.push(available[randomIndex]);
            available.splice(randomIndex, 1);
        }
    }
    
    async showPattern() {
        this.isMemorizing = true;
        this.disableCells();
        this.updateStatus(i18n.t('pattern_memorize'));
        
        const cells = document.querySelectorAll('.pattern-cell');
        
        // Clear previous state
        cells.forEach(cell => {
            cell.classList.remove('active', 'user-selected', 'correct', 'wrong');
        });
        
        // Show pattern
        this.pattern.forEach(index => {
            cells[index].classList.add('active');
        });
        
        audioManager.playSuccess();
        
        // Memorization time (based on pattern size)
        const memoryTime = 2000 + (this.pattern.length * 300);
        await this.wait(memoryTime);
        
        // Hide pattern
        cells.forEach(cell => {
            cell.classList.remove('active');
        });
        
        this.isMemorizing = false;
        this.enableCells();
        this.updateStatus(i18n.t('pattern_recall'));
    }
    
    handleCellClick(index) {
        if (this.isMemorizing) return;
        
        const cell = document.querySelector(`[data-index="${index}"]`);
        if (cell.classList.contains('user-selected')) return;
        
        audioManager.playClick();
        
        this.userPattern.push(index);
        cell.classList.add('user-selected');
        
        // Check if complete
        if (this.userPattern.length === this.pattern.length) {
            this.checkPattern();
        }
    }
    
    async checkPattern() {
        this.disableCells();
        
        const cells = document.querySelectorAll('.pattern-cell');
        let correct = true;
        
        // Sort both arrays for comparison
        const sortedPattern = [...this.pattern].sort((a, b) => a - b);
        const sortedUser = [...this.userPattern].sort((a, b) => a - b);
        
        // Check if patterns match
        for (let i = 0; i < sortedPattern.length; i++) {
            if (sortedPattern[i] !== sortedUser[i]) {
                correct = false;
                break;
            }
        }
        
        if (correct) {
            // Correct!
            this.userPattern.forEach(index => {
                cells[index].classList.add('correct');
            });
            
            audioManager.playSuccess();
            this.updateStatus(`✓ ${i18n.t('correct')}`);
            
            // Calculate score
            const points = this.gridSize * this.gridSize * 5;
            this.score += points;
            this.round++;
            
            // Increase grid size every 2 rounds
            if (this.round % 2 === 0 && this.gridSize < 5) {
                this.gridSize++;
                this.createGrid();
            }
            
            this.updateDisplay();
            
            await this.wait(2000);
            
            if (this.round <= 8) { // Max 8 rounds
                this.nextRound();
            } else {
                this.endGame(true);
            }
        } else {
            // Wrong!
            this.userPattern.forEach(index => {
                if (!this.pattern.includes(index)) {
                    cells[index].classList.add('wrong');
                }
            });
            
            audioManager.playError();
            this.updateStatus(`✗ ${i18n.t('wrong')}`);
            
            await this.wait(2000);
            this.endGame(false);
        }
    }
    
    endGame(won) {
        const totalTime = Math.floor((Date.now() - this.startTime) / 1000);
        
        if (won) {
            this.updateStatus(`🎉 ${i18n.t('excellent')} - ${i18n.t('colorflow_score')}: ${this.score}`);
        } else {
            this.updateStatus(`${i18n.t('colorflow_score')}: ${this.score}`);
        }
        
        // Save stats
        Storage.updateGameStats('patternmind', this.score, totalTime);
        
        // Calculate XP
        let xpEarned = 25;
        if (won) xpEarned = 35;
        else if (this.score > 100) xpEarned = 30;
        
        const result = Storage.addXP(xpEarned);
        
        showToast(`+${xpEarned} XP`);
        
        if (result.leveledUp) {
            setTimeout(() => {
                showToast(`🎉 ${i18n.t('levelUp')} ${result.newLevel}`);
                audioManager.playLevelUp();
            }, 1000);
        }
        
        // Show restart button
        const btn = document.getElementById('pmStartBtn');
        btn.textContent = i18n.t('tryAgain');
        btn.style.display = 'block';
    }
    
    updateDisplay() {
        document.getElementById('pmRound').textContent = this.round;
        document.getElementById('pmGrid').textContent = `${this.gridSize}×${this.gridSize}`;
        document.getElementById('pmScore').textContent = this.score;
    }
    
    updateStatus(text) {
        document.getElementById('pmStatus').textContent = text;
    }
    
    disableCells() {
        document.querySelectorAll('.pattern-cell').forEach(cell => {
            cell.classList.add('disabled');
        });
    }
    
    enableCells() {
        document.querySelectorAll('.pattern-cell').forEach(cell => {
            cell.classList.remove('disabled');
        });
    }
    
    wait(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export
window.PatternMindGame = PatternMindGame;
