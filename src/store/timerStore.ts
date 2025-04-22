import { ref } from 'vue';

// Total time for the challenge in seconds (5 minutes)
const INITIAL_TIME = 300;

// Create a reactive store for the timer
const timeLeft = ref(INITIAL_TIME);
const isRunning = ref(false);
let timerInterval: number | null = null;

export const timerStore = {
  // State
  timeLeft,
  isRunning,
  
  // Actions
  startTimer() {
    if (isRunning.value) return;
    
    isRunning.value = true;
    timerInterval = window.setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--;
      } else {
        this.stopTimer();
        // Game over logic will be handled in the components
      }
    }, 1000);
  },
  
  stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
      isRunning.value = false;
    }
  },
  
  resetTimer() {
    this.stopTimer();
    timeLeft.value = INITIAL_TIME;
  },
  
  // Computed values
  getFormattedTime(): string {
    const minutes = Math.floor(timeLeft.value / 60);
    const seconds = timeLeft.value % 60;
    return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  },
  
  getProgressPercentage(): number {
    return (timeLeft.value / INITIAL_TIME) * 100;
  },
  
  // Cleanup
  dispose() {
    this.stopTimer();
  }
};

// Make sure the timer is cleaned up when the app is closed
window.addEventListener('beforeunload', () => {
  timerStore.dispose();
});