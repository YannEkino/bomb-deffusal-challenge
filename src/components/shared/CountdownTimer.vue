<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';

const props = defineProps<{
  initialTime?: number; // Time in seconds
  start?: boolean;
}>();

const emit = defineEmits<{
  (e: 'timeUp'): void;
}>();

const router = useRouter();
const timeLeft = ref(props.initialTime || 300); // Default 5 minutes
const timerInterval = ref<number | null>(null);
const isRunning = ref(false);

// Format time as MM:SS
const formattedTime = computed(() => {
  const minutes = Math.floor(timeLeft.value / 60);
  const seconds = timeLeft.value % 60;
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
});

// Progress percentage for visual indicator
const progressPercentage = computed(() => {
  const initialTime = props.initialTime || 300;
  return (timeLeft.value / initialTime) * 100;
});

// Start the countdown
function startTimer() {
  if (!isRunning.value && timeLeft.value > 0) {
    isRunning.value = true;
    timerInterval.value = window.setInterval(() => {
      if (timeLeft.value > 0) {
        timeLeft.value--;
      } else {
        stopTimer();
        emit('timeUp');
        router.push('/game-over');
      }
    }, 1000);
  }
}

// Stop the countdown
function stopTimer() {
  if (timerInterval.value) {
    clearInterval(timerInterval.value);
    timerInterval.value = null;
  }
  isRunning.value = false;
}

// Reset the timer
function resetTimer() {
  stopTimer();
  timeLeft.value = props.initialTime || 300;
}

// Watch for start prop changes
watch(() => props.start, (newVal) => {
  if (newVal && !isRunning.value) {
    startTimer();
  } else if (!newVal && isRunning.value) {
    stopTimer();
  }
}, { immediate: true });

// Setup and cleanup
onMounted(() => {
  // Force start the timer if the start prop is true
  if (props.start === true) {
    // Small delay to ensure DOM is ready on mobile
    setTimeout(() => {
      startTimer();
    }, 100);
  }
});

onUnmounted(() => {
  stopTimer();
});

defineExpose({
  startTimer,
  stopTimer,
  resetTimer,
  timeLeft,
});
</script>

<template>
  <div class="countdown-timer">
    <div class="timer-display" :class="{ 'warning': timeLeft < 60, 'danger': timeLeft < 30 }">
      {{ formattedTime }}
    </div>
    <div class="progress-bar">
      <div class="progress" :style="{ width: `${progressPercentage}%` }"></div>
    </div>
  </div>
</template>

<style scoped>
.countdown-timer {
  width: 100%;
  max-width: 400px;
  margin: 0 auto;
  text-align: center;
  padding: 10px;
  background-color: rgba(0, 0, 0, 0.8);
  border-radius: 8px;
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.5);
}

.timer-display {
  font-family: 'Courier New', Courier, monospace;
  font-size: 2.5rem;
  font-weight: bold;
  color: #33ff33;
  text-shadow: 0 0 10px rgba(51, 255, 51, 0.7);
  margin-bottom: 10px;
}

.timer-display.warning {
  color: #ffff33;
  text-shadow: 0 0 10px rgba(255, 255, 51, 0.7);
}

.timer-display.danger {
  color: #ff3333;
  text-shadow: 0 0 10px rgba(255, 51, 51, 0.7);
  animation: pulse 1s infinite;
}

.progress-bar {
  height: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #33ff33;
  transition: width 1s linear;
}

.timer-display.warning + .progress-bar .progress {
  background-color: #ffff33;
}

.timer-display.danger + .progress-bar .progress {
  background-color: #ff3333;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.5; }
  100% { opacity: 1; }
}
</style>