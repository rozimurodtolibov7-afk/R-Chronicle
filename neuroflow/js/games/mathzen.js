/* ==========================================
   MATHZEN GAME - Tez hisoblash
   Prefrontal korteks va mantiqni rivojlantirish
   ========================================== */

class MathZenGame {
    constructor() {
        this.timeLimit = 60; // 60 seconds
        this.timeLeft = this.timeLimit;
        this.score = 0;
        this.currentProblem = null;
        this.timer = null;
        this.difficulty = 1; // Starts easy
        this.startTime = null;
    }
    
    init() {
        const content = document.getElementById('gameContent');
        content.innerHTML = `
            <div class="mathzen-game">
                <div class="game-header">
                    <h2>${i18n.t('math_title')}</h2>
                    <p class="game-instruction">${i18n.t('math_instruction')}</p>
                </div>
                
                <div class="mathzen-stats">
                    <div class="stat">
                        <span class="stat-label">${i18n.t('math_timeLeft')}</span>
                        <span class="stat-value timer-value" id="mzTimer">60</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">${i18n.t('math_solved')}</span>
                        <span class="stat-value" id="mzSolved">0</span>
                    </div>
                    <div class="stat">
                        <span class="stat-label">${i18n.t('colorflow_score')}</span>
                        <span class="stat-value" id="mzScore">0</span>
                    </div>
                </div>
                
                <div class="math-problem-area">
                    <div class="math-problem" id="mathProblem">
                        <div class="problem-text" id="problemText">5 + 3 = ?</div>
                    </div>
                    
                    <div class="math-input-area">
                        <input type="number" 
                               id="mathInput" 
                               class="math-input" 
                               placeholder="?" 
                               disabled
                               autocomplete="off">
                    </div>
                    
                    <div class="math-options" id="mathOptions"></div>
                </div>
                
                <button class="btn-game" id="mzStartBtn">${i18n.t('start')}</button>
                
                <div class="combo-display" id="comboDisplay"></div>
            </div>
        `;
        
        this.addStyles();
        this.attachEventListeners();
    }
    
    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .mathzen-game {
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
            
            .mathzen-stats {
                display: flex;
                justify-content: center;
                gap: 2rem;
                margin-bottom: 3rem;
                flex-wrap: wrap;
            }
            
            .timer-value {
                color: var(--neuro-success);
            }
            
            .timer-value.warning {
                color: var(--neuro-energy);
                animation: pulse 1s infinite;
            }
            
            .math-problem-area {
                max-width: 600px;
                margin: 0 auto 2rem;
            }
            
            .math-problem {
                background: var(--neuro-deep);
                padding: 3rem;
                border-radius: var(--radius-lg);
                margin-bottom: 2rem;
                box-shadow: var(--shadow-md);
            }
            
            .problem-text {
                font-size: 3rem;
                font-weight: bold;
                color: var(--neuro-text);
                font-family: 'Courier New', monospace;
            }
            
            .math-input-area {
                margin-bottom: 2rem;
            }
            
            .math-input {
                width: 100%;
                max-width: 200px;
                padding: 1rem;
                font-size: 2rem;
                text-align: center;
                background: var(--neuro-focus);
                border: 2px solid var(--neuro-flow);
                border-radius: var(--radius-md);
                color: var(--neuro-text);
                outline: none;
                transition: all var(--transition-fast);
            }
            
            .math-input:focus {
                border-color: var(--neuro-calm);
                box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.2);
            }
            
            .math-input:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }
            
            .math-options {
                display: grid;
                grid-template-columns: repeat(2, 1fr);
                gap: 1rem;
            }
            
            .math-option {
                background: var(--neuro-focus);
                border: 2px solid var(--neuro-flow);
                padding: 1.5rem;
                border-radius: var(--radius-md);
                font-size: 1.8rem;
                font-weight: bold;
                cursor: pointer;
                transition: all var(--transition-fast);
                color: var(--neuro-text);
            }
            
            .math-option:hover {
                background: var(--neuro-flow);
                transform: scale(1.05);
            }
            
            .math-option:active {
                transform: scale(0.95);
            }
            
            .math-option.correct {
                background: var(--neuro-success);
                border-color: var(--neuro-success);
                animation: celebrate 0.5s;
            }
            
            .math-option.wrong {
                background: var(--neuro-energy);
                border-color: var(--neuro-energy);
                animation: shake 0.3s;
            }
            
            .combo-display {
                font-size: 1.5rem;
                font-weight: bold;
                color: var(--neuro-success);
                min-height: 2rem;
                margin-top: 1rem;
            }
            
            .combo-text {
                animation: comboMultiplier 0.4s;
            }
            
            @media (max-width: 600px) {
                .problem-text {
                    font-size: 2rem;
                }
                
                .math-input {
                    font-size: 1.5rem;
                }
                
                .math-options {
                    grid-template-columns: 1fr;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    attachEventListeners() {
        document.getElementById('mzStartBtn').addEventListener('click', () => {
            this.start();
        });
        
        const input = document.getElementById('mathInput');
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                this.checkAnswer(parseInt(input.value));
            }
        });
    }
    
    start() {
        this.timeLeft = this.timeLimit;
        this.score = 0;
        this.difficulty = 1;
        this.combo = 0;
        this.startTime = Date.now();
        
        document.getElementById('mzStartBtn').style.display = 'none';
        document.getElementById('mathInput').disabled = false;
        document.getElementById('mathInput').focus();
        
        this.updateDisplay();
        this.generateProblem();
        this.startTimer();
    }
    
    startTimer() {
        this.timer = setInterval(() => {
            this.timeLeft--;
            
            const timerEl = document.getElementById('mzTimer');
            timerEl.textContent = this.timeLeft;
            
            if (this.timeLeft <= 10) {
                timerEl.classList.add('warning');
                if (this.timeLeft % 2 === 0) {
                    audioManager.playClick();
                }
            }
            
            if (this.timeLeft <= 0) {
                this.endGame();
            }
        }, 1000);
    }
    
    generateProblem() {
        const operations = ['+', '-', '×'];
        let num1, num2, operator, answer;
        
        // Difficulty increases every 5 correct answers
        const maxNum = Math.min(20 + (this.difficulty * 10), 100);
        
        if (this.difficulty <= 2) {
            // Easy: addition and subtraction
            operator = operations[Math.floor(Math.random() * 2)];
            num1 = Math.floor(Math.random() * maxNum) + 1;
            num2 = Math.floor(Math.random() * maxNum) + 1;
            
            if (operator === '-' && num2 > num1) {
                [num1, num2] = [num2, num1];
            }
        } else {
            // Medium: all operations
            operator = operations[Math.floor(Math.random() * 3)];
            
            if (operator === '×') {
                num1 = Math.floor(Math.random() * 12) + 1;
                num2 = Math.floor(Math.random() * 12) + 1;
            } else {
                num1 = Math.floor(Math.random() * maxNum) + 1;
                num2 = Math.floor(Math.random() * maxNum) + 1;
                
                if (operator === '-' && num2 > num1) {
                    [num1, num2] = [num2, num1];
                }
            }
        }
        
        // Calculate answer
        switch (operator) {
            case '+':
                answer = num1 + num2;
                break;
            case '-':
                answer = num1 - num2;
                break;
            case '×':
                answer = num1 * num2;
                break;
        }
        
        this.currentProblem = {
            num1,
            num2,
            operator,
            answer
        };
        
        // Display problem
        document.getElementById('problemText').textContent = 
            `${num1} ${operator} ${num2} = ?`;
        
        // Generate multiple choice options
        this.generateOptions(answer);
        
        // Clear input
        document.getElementById('mathInput').value = '';
    }
    
    generateOptions(correctAnswer) {
        const options = [correctAnswer];
        
        // Generate 3 wrong answers
        while (options.length < 4) {
            const offset = Math.floor(Math.random() * 20) - 10;
            const wrong = correctAnswer + offset;
            
            if (wrong !== correctAnswer && wrong >= 0 && !options.includes(wrong)) {
                options.push(wrong);
            }
        }
        
        // Shuffle options
        options.sort(() => Math.random() - 0.5);
        
        // Create option buttons
        const optionsContainer = document.getElementById('mathOptions');
        optionsContainer.innerHTML = '';
        
        options.forEach(option => {
            const btn = document.createElement('button');
            btn.className = 'math-option';
            btn.textContent = option;
            btn.onclick = () => this.checkAnswer(option);
            optionsContainer.appendChild(btn);
        });
    }
    
    checkAnswer(userAnswer) {
        if (!this.currentProblem) return;
        
        const correct = userAnswer === this.currentProblem.answer;
        
        // Highlight options
        const options = document.querySelectorAll('.math-option');
        options.forEach(opt => {
            const value = parseInt(opt.textContent);
            if (value === this.currentProblem.answer) {
                opt.classList.add('correct');
            } else if (value === userAnswer && !correct) {
                opt.classList.add('wrong');
            }
        });
        
        if (correct) {
            // Correct answer!
            this.combo = (this.combo || 0) + 1;
            const points = 10 + (this.combo * 2);
            this.score += points;
            
            audioManager.playSuccess();
            
            // Show combo
            if (this.combo > 2) {
                const comboDisplay = document.getElementById('comboDisplay');
                comboDisplay.innerHTML = `
                    <span class="combo-text">🔥 ${this.combo}x Combo! +${points}</span>
                `;
            }
            
            // Increase difficulty
            if (this.score % 50 === 0) {
                this.difficulty++;
            }
            
            this.updateDisplay();
            
            setTimeout(() => {
                this.generateProblem();
                document.getElementById('comboDisplay').innerHTML = '';
            }, 500);
        } else {
            // Wrong answer
            this.combo = 0;
            audioManager.playError();
            
            setTimeout(() => {
                this.generateProblem();
            }, 1000);
        }
    }
    
    updateDisplay() {
        document.getElementById('mzSolved').textContent = Math.floor(this.score / 10);
        document.getElementById('mzScore').textContent = this.score;
    }
    
    endGame() {
        clearInterval(this.timer);
        
        document.getElementById('mathInput').disabled = true;
        document.getElementById('mathOptions').innerHTML = '';
        document.getElementById('problemText').textContent = 
            `${i18n.t('excellent')} ${this.score} ${i18n.t('colorflow_score')}!`;
        
        const totalTime = Math.floor((Date.now() - this.startTime) / 1000);
        
        // Save stats
        Storage.updateGameStats('mathzen', this.score, totalTime);
        
        // Calculate XP based on score
        let xpEarned = 20;
        if (this.score >= 200) xpEarned = 35;
        else if (this.score >= 150) xpEarned = 30;
        else if (this.score >= 100) xpEarned = 25;
        
        const result = Storage.addXP(xpEarned);
        
        showToast(`+${xpEarned} XP`);
        
        if (result.leveledUp) {
            setTimeout(() => {
                showToast(`🎉 ${i18n.t('levelUp')} ${result.newLevel}`);
                audioManager.playLevelUp();
            }, 1000);
        }
        
        // Show restart button
        const btn = document.getElementById('mzStartBtn');
        btn.textContent = i18n.t('tryAgain');
        btn.style.display = 'block';
    }
}

// Export
window.MathZenGame = MathZenGame;
