/* ==========================================
   NEUROFLOW - STORAGE MANAGEMENT
   LocalStorage orqali ma'lumotlarni saqlash
   ========================================== */

const STORAGE_KEY = 'neuroflow_data';

// Default user data structure
const defaultUserData = {
    level: 1,
    totalXP: 0,
    dailyXP: 0,
    dailyGoal: 100,
    streakDays: 0,
    lastPlayDate: null,
    
    games: {
        colorflow: {
            played: 0,
            bestScore: 0,
            totalScore: 0,
            totalTime: 0
        },
        reactionpulse: {
            played: 0,
            bestScore: 999999, // Lower is better for reaction time
            totalScore: 0,
            totalTime: 0
        },
        patternmind: {
            played: 0,
            bestScore: 0,
            totalScore: 0,
            totalTime: 0
        },
        mathzen: {
            played: 0,
            bestScore: 0,
            totalScore: 0,
            totalTime: 0
        },
        breathebalance: {
            played: 0,
            cyclesCompleted: 0,
            totalTime: 0
        }
    },
    
    achievements: [],
    settings: {
        audioEnabled: true,
        musicVolume: 0.5,
        sfxVolume: 0.7
    }
};

// Storage Manager
const Storage = {
    // Get all user data
    getUserData() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            if (data) {
                return JSON.parse(data);
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
        return { ...defaultUserData };
    },
    
    // Save user data
    saveUserData(data) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
            return true;
        } catch (error) {
            console.error('Error saving user data:', error);
            return false;
        }
    },
    
    // Update specific field
    updateField(path, value) {
        const data = this.getUserData();
        const keys = path.split('.');
        let current = data;
        
        for (let i = 0; i < keys.length - 1; i++) {
            if (!current[keys[i]]) {
                current[keys[i]] = {};
            }
            current = current[keys[i]];
        }
        
        current[keys[keys.length - 1]] = value;
        this.saveUserData(data);
    },
    
    // Add XP and check for level up
    addXP(amount) {
        const data = this.getUserData();
        data.totalXP += amount;
        data.dailyXP += amount;
        
        // Check for level up (100 XP per level)
        const newLevel = Math.floor(data.totalXP / 100) + 1;
        const leveledUp = newLevel > data.level;
        if (leveledUp) {
            data.level = newLevel;
        }
        
        // Check daily goal completion
        const dailyCompleted = data.dailyXP >= data.dailyGoal;
        
        this.saveUserData(data);
        
        return { leveledUp, dailyCompleted, newLevel: data.level };
    },
    
    // Update game stats
    updateGameStats(gameName, score, time) {
        const data = this.getUserData();
        const gameData = data.games[gameName];
        
        if (!gameData) return;
        
        gameData.played += 1;
        gameData.totalScore += score;
        gameData.totalTime += time;
        
        // Update best score
        if (gameName === 'reactionpulse') {
            // For reaction time, lower is better
            if (score < gameData.bestScore) {
                gameData.bestScore = score;
            }
        } else {
            // For other games, higher is better
            if (score > gameData.bestScore) {
                gameData.bestScore = score;
            }
        }
        
        this.saveUserData(data);
    },
    
    // Check and update daily streak
    updateStreak() {
        const data = this.getUserData();
        const today = new Date().toDateString();
        const lastPlay = data.lastPlayDate;
        
        if (lastPlay !== today) {
            const lastDate = lastPlay ? new Date(lastPlay) : null;
            const todayDate = new Date(today);
            
            // Check if it's consecutive day
            if (lastDate) {
                const diffTime = todayDate - lastDate;
                const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
                
                if (diffDays === 1) {
                    // Consecutive day
                    data.streakDays += 1;
                } else if (diffDays > 1) {
                    // Streak broken
                    data.streakDays = 1;
                }
            } else {
                // First play
                data.streakDays = 1;
            }
            
            // Reset daily XP
            data.dailyXP = 0;
            data.lastPlayDate = today;
            
            this.saveUserData(data);
        }
    },
    
    // Get game statistics
    getGameStats(gameName) {
        const data = this.getUserData();
        return data.games[gameName] || {};
    },
    
    // Get all statistics
    getAllStats() {
        const data = this.getUserData();
        return {
            level: data.level,
            totalXP: data.totalXP,
            dailyXP: data.dailyXP,
            dailyGoal: data.dailyGoal,
            streakDays: data.streakDays,
            games: data.games
        };
    },
    
    // Reset all data (for testing)
    resetData() {
        localStorage.removeItem(STORAGE_KEY);
        return this.getUserData();
    },
    
    // Get audio settings
    getAudioSettings() {
        const data = this.getUserData();
        return data.settings;
    },
    
    // Update audio settings
    updateAudioSettings(settings) {
        const data = this.getUserData();
        data.settings = { ...data.settings, ...settings };
        this.saveUserData(data);
    }
};

// Calculate daily progress percentage
function getDailyProgress() {
    const data = Storage.getUserData();
    return Math.min(100, (data.dailyXP / data.dailyGoal) * 100);
}

// Calculate XP needed for next level
function getXPForNextLevel() {
    const data = Storage.getUserData();
    const currentLevelXP = (data.level - 1) * 100;
    const nextLevelXP = data.level * 100;
    return {
        current: data.totalXP - currentLevelXP,
        needed: nextLevelXP - data.totalXP,
        total: 100
    };
}

// Export Storage object
window.Storage = Storage;
window.getDailyProgress = getDailyProgress;
window.getXPForNextLevel = getXPForNextLevel;
