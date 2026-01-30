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
        this.btnSkip = this.card.querySelector('.btn-skip');
        this.btnEdit = this.card.querySelector('.btn-edit');
        this.btnSettings = this.card.querySelector('.btn-settings');
        this.btnSave = this.card.querySelector('.btn-save');
        this.settingsPanel = this.card.querySelector('.settings-panel');
        this.blindLevelsInput = this.card.querySelector('.blind-levels');
        this.clockEditor = this.card.querySelector('.clock-editor');
        this.clockHand = this.card.querySelector('.clock-hand');
        this.clockSvg = this.card.querySelector('.clock-svg');
        this.timeInfo = this.card.querySelector('.time-info');
        this.btnApply = this.card.querySelector('.btn-apply');
        this.btnCancel = this.card.querySelector('.btn-cancel');
    }
    
    bindEvents() {
        this.btnStart.addEventListener('click', () => this.start());
        this.btnPause.addEventListener('click', () => this.pause());
        this.btnReset.addEventListener('click', () => this.reset());
        this.btnSkip.addEventListener('click', () => this.skipToNext());
        this.btnEdit.addEventListener('click', () => this.openClockEditor());
        this.btnSettings.addEventListener('click', () => this.toggleSettings());
        this.btnSave.addEventListener('click', () => this.saveSettings());
        this.btnApply.addEventListener('click', () => this.applyTimeEdit());
        this.btnCancel.addEventListener('click', () => this.closeClockEditor());
        this.setupClockEditor();
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
    
    skipToNext() {
        if (this.currentLevel < this.blindLevels.length - 1) {
            this.currentLevel++;
            this.timeRemaining = this.blindLevels[this.currentLevel].duration;
            this.updateDisplay();
            this.playSound();
        }
    }
    
    setupClockEditor() {
        this.isDragging = false;
        this.tempTimeRemaining = 0;
        
        this.clockSvg.addEventListener('mousedown', (e) => this.startDrag(e));
        this.clockSvg.addEventListener('mousemove', (e) => this.drag(e));
        this.clockSvg.addEventListener('mouseup', () => this.stopDrag());
        this.clockSvg.addEventListener('mouseleave', () => this.stopDrag());
        
        this.clockSvg.addEventListener('touchstart', (e) => this.startDrag(e));
        this.clockSvg.addEventListener('touchmove', (e) => this.drag(e));
        this.clockSvg.addEventListener('touchend', () => this.stopDrag());
    }
    
    openClockEditor() {
        this.tempTimeRemaining = this.timeRemaining;
        this.updateClockHand(this.timeRemaining);
        this.clockEditor.style.display = 'flex';
    }
    
    closeClockEditor() {
        this.clockEditor.style.display = 'none';
        this.isDragging = false;
    }
    
    applyTimeEdit() {
        this.timeRemaining = this.tempTimeRemaining;
        this.updateDisplay();
        this.closeClockEditor();
    }
    
    startDrag(e) {
        this.isDragging = true;
        this.drag(e);
    }
    
    stopDrag() {
        this.isDragging = false;
    }
    
    drag(e) {
        if (!this.isDragging) return;
        
        e.preventDefault();
        const rect = this.clockSvg.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;
        
        let clientX, clientY;
        if (e.type.startsWith('touch')) {
            clientX = e.touches[0].clientX;
            clientY = e.touches[0].clientY;
        } else {
            clientX = e.clientX;
            clientY = e.clientY;
        }
        
        const deltaX = clientX - centerX;
        const deltaY = clientY - centerY;
        let angle = Math.atan2(deltaX, -deltaY) * (180 / Math.PI);
        if (angle < 0) angle += 360;
        
        const maxDuration = this.blindLevels[this.currentLevel].duration;
        const percentage = angle / 360;
        this.tempTimeRemaining = Math.round(maxDuration * percentage);
        
        this.updateClockHand(this.tempTimeRemaining);
    }
    
    updateClockHand(timeRemaining) {
        const maxDuration = this.blindLevels[this.currentLevel].duration;
        const percentage = timeRemaining / maxDuration;
        const angle = percentage * 360;
        
        const radians = (angle - 90) * (Math.PI / 180);
        const handLength = 70;
        const x2 = 100 + handLength * Math.cos(radians);
        const y2 = 100 + handLength * Math.sin(radians);
        
        this.clockHand.setAttribute('x2', x2);
        this.clockHand.setAttribute('y2', y2);
        
        const minutes = Math.floor(timeRemaining / 60);
        const seconds = timeRemaining % 60;
        this.timeInfo.textContent = 
            `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
    }
}

document.addEventListener('DOMContentLoaded', () => {
    const timerCards = document.querySelectorAll('.timer-card');
    timerCards.forEach(card => new PokerTimer(card));
});
