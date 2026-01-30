class PokerTimer {
    constructor(cardElement) {
        this.card = cardElement;
        this.timerId = cardElement.dataset.timerId;
        this.isRunning = false;
        this.isPaused = false;
        this.timeRemaining = 0;
        this.currentLevel = 0;
        this.intervalId = null;
        this.startTime = null;
        
        this.blindLevels = [
            { small: 50, big: 100, duration: 15 * 60 },
            { small: 100, big: 200, duration: 15 * 60 },
            { small: 200, big: 400, duration: 20 * 60 },
            { small: 300, big: 600, duration: 20 * 60 },
            { small: 500, big: 1000, duration: 25 * 60 },
            { small: 1000, big: 2000, duration: 30 * 60 }
        ];
        
        this.initElements();
        this.bindEvents();
        this.updateDisplay();
    }
    
    initElements() {
        this.timeDisplay = this.card.querySelector('.time-display');
        this.blindInfo = this.card.querySelector('.current-blind');
        this.startTimeDisplay = this.card.querySelector('.start-time');
        this.btnStart = this.card.querySelector('.btn-start');
        this.btnPause = this.card.querySelector('.btn-pause');
        this.btnReset = this.card.querySelector('.btn-reset');
        this.btnSettings = this.card.querySelector('.btn-settings');
        this.btnSave = this.card.querySelector('.btn-save');
        this.settingsPanel = this.card.querySelector('.settings-panel');
        this.blindLevelsInput = this.card.querySelector('.blind-levels');
    }
    
    bindEvents() {
        this.btnStart.addEventListener('click', () => this.start());
        this.btnPause.addEventListener('click', () => this.pause());
        this.btnReset.addEventListener('click', () => this.reset());
        this.btnSettings.addEventListener('click', () => this.toggleSettings());
        this.btnSave.addEventListener('click', () => this.saveSettings());
    }
    
    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.isPaused = false;
            if (this.timeRemaining === 0) {
                this.timeRemaining = this.blindLevels[this.currentLevel].duration;
            }
            if (!this.startTime) {
                this.startTime = new Date();
                this.updateStartTime();
            }
            this.card.classList.add('running');
            this.intervalId = setInterval(() => this.tick(), 1000);
        }
    }
    
    pause() {
        if (this.isRunning) {
            this.isRunning = false;
            this.isPaused = true;
            this.card.classList.remove('running');
            clearInterval(this.intervalId);
        }
    }
    
    reset() {
        this.isRunning = false;
        this.isPaused = false;
        this.currentLevel = 0;
        this.timeRemaining = this.blindLevels[0].duration;
        this.startTime = null;
        this.card.classList.remove('running');
        clearInterval(this.intervalId);
        this.startTimeDisplay.textContent = '開始時間: --:--';
        this.updateDisplay();
    }
    
    tick() {
        this.timeRemaining--;
        
        if (this.timeRemaining <= 0) {
            this.currentLevel++;
            if (this.currentLevel >= this.blindLevels.length) {
                this.currentLevel = this.blindLevels.length - 1;
                this.timeRemaining = this.blindLevels[this.currentLevel].duration;
            } else {
                this.timeRemaining = this.blindLevels[this.currentLevel].duration;
                this.playSound();
            }
        }
        
        this.updateDisplay();
    }
    
    updateDisplay() {
        const minutes = Math.floor(this.timeRemaining / 60);
        const seconds = this.timeRemaining % 60;
        this.timeDisplay.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
        
        const level = this.blindLevels[this.currentLevel];
        this.blindInfo.textContent = `小盲: ${level.small} / 大盲: ${level.big}`;
    }
    
    updateStartTime() {
        if (this.startTime) {
            const hours = String(this.startTime.getHours()).padStart(2, '0');
            const minutes = String(this.startTime.getMinutes()).padStart(2, '0');
            this.startTimeDisplay.textContent = `開始時間: ${hours}:${minutes}`;
        }
    }
    
    toggleSettings() {
        const isVisible = this.settingsPanel.style.display !== 'none';
        this.settingsPanel.style.display = isVisible ? 'none' : 'block';
    }
    
    saveSettings() {
        const blindText = this.blindLevelsInput.value.trim();
        const lines = blindText.split('\n');
        this.blindLevels = lines.map(line => {
            const [small, big, duration] = line.split('/').map(v => parseInt(v.trim()));
            return { small, big, duration: duration * 60 };
        }).filter(level => !isNaN(level.small) && !isNaN(level.big) && !isNaN(level.duration));
        
        if (this.blindLevels.length === 0) {
            alert('請輸入有效的盲注級別！');
            return;
        }
        
        if (!this.isRunning && !this.isPaused) {
            this.timeRemaining = this.blindLevels[0].duration;
            this.currentLevel = 0;
        }
        
        this.updateDisplay();
        this.settingsPanel.style.display = 'none';
        alert('設定已保存！');
    }
    
    playSound() {
        const audioContext = new (window.AudioContext || window.webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();
        
        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);
        
        oscillator.frequency.value = 800;
        oscillator.type = 'sine';
        
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);
        
        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.5);
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const timerCards = document.querySelectorAll('.timer-card');
    timerCards.forEach(card => new PokerTimer(card));
});
