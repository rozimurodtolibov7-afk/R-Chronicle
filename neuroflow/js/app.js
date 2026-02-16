/* ==========================================
   NEUROFLOW - MAIN APPLICATION
   Barcha komponentlarni boshqarish
   ========================================== */

// Global state
let currentGame = null;
let currentScreen = 'home';

// Initialize app
document.addEventListener('DOMContentLoaded', () => {
    initializeApp();
});

function initializeApp() {
    // Initialize i18n
    i18n.init();
    
    // Update streak
    Storage.updateStreak();
    
    // Load user data
    updateUIWithUserData();
    
    // Setup event listeners
    setupEventListeners();
    
    // Initialize audio on first interaction
    document.addEventListener('click', () => {
        if (!audioManager.initialized) {
            audioManager.init();
        }
    }, { once: true });
}

function setupEventListeners() {
    // Language selector
    document.getElementById('langSelect').addEventListener('change', (e) => {
        i18n.change(e.target.value);
        updateUIWithUserData();
        audioManager.playClick();
    });
    
    // Audio toggle
    document.getElementById('audioToggle').addEventListener('click', () => {
        const enabled = audioManager.toggle();
        document.getElementById('audioToggle').textContent = enabled ? '🔊' : '🔇';
        showToast(enabled ? 'Audio ON' : 'Audio OFF');
    });
    
    // Game cards
    document.querySelectorAll('.game-card').forEach(card => {
        card.addEventListener('click', () => {
            const gameName = card.dataset.game;
            startGame(gameName);
            audioManager.playClick();
        });
    });
    
    // Back button from game
    document.getElementById('backToHome').addEventListener('click', () => {
        showScreen('home');
        audioManager.playClick();
    });
    
    // Stats button
    document.getElementById('showStatsBtn').addEventListener('click', () => {
        showStats();
        audioManager.playClick();
    });
    
    // Back from stats
    document.getElementById('backFromStats').addEventListener('click', () => {
        showScreen('home');
        audioManager.playClick();
    });
}

function updateUIWithUserData() {
    const data = Storage.getUserData();
    
    // Update stats
    document.getElementById('userLevel').textContent = data.level;
    document.getElementById('totalXP').textContent = data.totalXP;
    document.getElementById('streakDays').textContent = data.streakDays;
    
    // Update daily progress
    const dailyProgress = getDailyProgress();
    document.getElementById('dailyProgress').style.width = `${dailyProgress}%`;
    document.getElementById('dailyXP').textContent = data.dailyXP;
    document.getElementById('dailyGoal').textContent = data.dailyGoal;
    
    // Add streak fire animation if active
    if (data.streakDays > 0) {
        const streakEl = document.querySelector('#streakDays').parentElement;
        streakEl.classList.add('streak-fire');
    }
}

function showScreen(screenName) {
    // Hide all screens
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // Show selected screen
    const screen = document.getElementById(`${screenName}Screen`);
    if (screen) {
        screen.classList.add('active');
        currentScreen = screenName;
    }
    
    // Update UI if returning to home
    if (screenName === 'home') {
        updateUIWithUserData();
    }
}

function startGame(gameName) {
    showScreen('game');
    
    // Clear previous game
    if (currentGame) {
        currentGame = null;
    }
    
    // Initialize game
    switch (gameName) {
        case 'colorflow':
            currentGame = new ColorFlowGame();
            break;
        case 'reactionpulse':
            currentGame = new ReactionPulseGame();
            break;
        case 'patternmind':
            currentGame = new PatternMindGame();
            break;
        case 'mathzen':
            currentGame = new MathZenGame();
            break;
        case 'breathebalance':
            currentGame = new BreatheBalanceGame();
            break;
    }
    
    if (currentGame && currentGame.init) {
        currentGame.init();
    }
}

function showStats() {
    showScreen('stats');
    
    const stats = Storage.getAllStats();
    const content = document.getElementById('statsContent');
    
    let html = `
        <div class="stats-container">
            <div class="stats-overview">
                <div class="stat-card">
                    <div class="stat-icon">🏆</div>
                    <div class="stat-label">${i18n.t('level')}</div>
                    <div class="stat-value">${stats.level}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">⭐</div>
                    <div class="stat-label">${i18n.t('totalXP')}</div>
                    <div class="stat-value">${stats.totalXP}</div>
                </div>
                <div class="stat-card">
                    <div class="stat-icon">🔥</div>
                    <div class="stat-label">${i18n.t('streak')}</div>
                    <div class="stat-value">${stats.streakDays}</div>
                </div>
            </div>
            
            <div class="games-stats">
    `;
    
    // Game statistics
    const gameNames = ['colorflow', 'reactionpulse', 'patternmind', 'mathzen', 'breathebalance'];
    
    gameNames.forEach(gameName => {
        const gameData = stats.games[gameName];
        if (gameData && gameData.played > 0) {
            const avgScore = gameName === 'reactionpulse' 
                ? Math.round(gameData.totalScore / gameData.played)
                : Math.round(gameData.totalScore / gameData.played);
            
            const bestScore = gameName === 'breathebalance'
                ? gameData.cyclesCompleted
                : gameData.bestScore;
            
            html += `
                <div class="game-stat-card">
                    <h3>${i18n.t(gameName)}</h3>
                    <div class="game-stat-grid">
                        <div class="game-stat-item">
                            <span class="game-stat-label">${i18n.t('gamesPlayed')}</span>
                            <span class="game-stat-value">${gameData.played}</span>
                        </div>
                        <div class="game-stat-item">
                            <span class="game-stat-label">${i18n.t('avgScore')}</span>
                            <span class="game-stat-value">${avgScore}</span>
                        </div>
                        <div class="game-stat-item">
                            <span class="game-stat-label">${i18n.t('bestScore')}</span>
                            <span class="game-stat-value">${bestScore}</span>
                        </div>
                    </div>
                </div>
            `;
        }
    });
    
    html += `
            </div>
        </div>
    `;
    
    content.innerHTML = html;
    
    // Add stats styles
    addStatsStyles();
}

function addStatsStyles() {
    if (document.getElementById('statsStyles')) return;
    
    const style = document.createElement('style');
    style.id = 'statsStyles';
    style.textContent = `
        .stats-container {
            padding: 2rem;
        }
        
        .stats-overview {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 1.5rem;
            margin-bottom: 3rem;
        }
        
        .stat-card {
            background: var(--neuro-focus);
            padding: 2rem;
            border-radius: var(--radius-lg);
            text-align: center;
            box-shadow: var(--shadow-md);
            transition: all var(--transition-normal);
        }
        
        .stat-card:hover {
            transform: translateY(-4px);
            box-shadow: var(--shadow-lg);
        }
        
        .stat-icon {
            font-size: 3rem;
            margin-bottom: 1rem;
        }
        
        .games-stats {
            display: grid;
            gap: 1.5rem;
        }
        
        .game-stat-card {
            background: var(--neuro-focus);
            padding: 1.5rem;
            border-radius: var(--radius-md);
            box-shadow: var(--shadow-sm);
        }
        
        .game-stat-card h3 {
            font-size: 1.5rem;
            margin-bottom: 1rem;
            color: var(--neuro-calm);
        }
        
        .game-stat-grid {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 1rem;
        }
        
        .game-stat-item {
            display: flex;
            flex-direction: column;
            gap: 0.5rem;
            padding: 1rem;
            background: var(--neuro-deep);
            border-radius: var(--radius-sm);
        }
        
        .game-stat-label {
            font-size: 0.85rem;
            color: var(--neuro-text-dim);
        }
        
        .game-stat-value {
            font-size: 1.5rem;
            font-weight: bold;
            color: var(--neuro-text);
        }
        
        @media (max-width: 768px) {
            .stats-container {
                padding: 1rem;
            }
            
            .stats-overview {
                grid-template-columns: 1fr;
            }
            
            .game-stat-grid {
                grid-template-columns: 1fr;
            }
        }
    `;
    
    document.head.appendChild(style);
}

// Toast notification system
function showToast(message, duration = 3000) {
    const toast = document.getElementById('toast');
    toast.textContent = message;
    toast.classList.add('show');
    
    setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// XP gain animation
function showXPGain(amount, x, y) {
    const xpEl = document.createElement('div');
    xpEl.className = 'xp-gain';
    xpEl.textContent = `+${amount} XP`;
    xpEl.style.left = `${x}px`;
    xpEl.style.top = `${y}px`;
    
    document.body.appendChild(xpEl);
    
    setTimeout(() => {
        xpEl.remove();
    }, 1000);
}

// Create particle burst effect
function createParticleBurst(x, y, count = 8) {
    const colors = ['#05c46b', '#4a90e2', '#ee5a6f', '#ffd93d'];
    
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.left = `${x}px`;
        particle.style.top = `${y}px`;
        particle.style.background = colors[Math.floor(Math.random() * colors.length)];
        
        const angle = (Math.PI * 2 * i) / count;
        const distance = 50 + Math.random() * 50;
        const tx = Math.cos(angle) * distance;
        const ty = Math.sin(angle) * distance;
        
        particle.style.setProperty('--tx', `${tx}px`);
        particle.style.setProperty('--ty', `${ty}px`);
        
        document.body.appendChild(particle);
        
        setTimeout(() => {
            particle.remove();
        }, 800);
    }
}

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // ESC to go back
    if (e.key === 'Escape') {
        if (currentScreen === 'game' || currentScreen === 'stats') {
            showScreen('home');
        }
    }
});

// Export global functions
window.showToast = showToast;
window.showXPGain = showXPGain;
window.createParticleBurst = createParticleBurst;

// Log initialization
console.log('%c🧠 NeuroFlow Initialized!', 'font-size: 20px; color: #4a90e2; font-weight: bold;');
console.log('%cYour brain training journey begins now.', 'font-size: 14px; color: #05c46b;');
