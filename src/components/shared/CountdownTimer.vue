<script setup lang="ts">
import { onUnmounted, computed, watch } from 'vue';
import { useRouter } from 'vue-router';
import { timerStore } from '../../store/timerStore';

const props = defineProps<{
  start?: boolean;
}>();

const emit = defineEmits<{
  (e: 'timeUp'): void;
}>();

const router = useRouter();

// Use the shared timer state from timerStore
const timeLeft = computed(() => timerStore.timeLeft.value);
const isRunning = computed(() => timerStore.isRunning.value);

// Format time as MM:SS using the store's helper method
const formattedTime = computed(() => timerStore.getFormattedTime());

// Progress percentage for visual indicator using the store's helper method
const progressPercentage = computed(() => timerStore.getProgressPercentage());

// Game over when time runs out
watch(timeLeft, (newValue) => {
  if (newValue === 0) {
    emit('timeUp');
    router.push('/game-over');
  }
});

// Watch for start prop changes
watch(() => props.start, (newVal) => {
  if (newVal && !isRunning.value) {
    startTimer();
  } else if (!newVal && isRunning.value) {
    stopTimer();
  }
}, { immediate: true });

// These methods now just delegate to the timerStore
function startTimer() {
  timerStore.startTimer();
}

function stopTimer() {
  timerStore.stopTimer();
}

function resetTimer() {
  timerStore.resetTimer();
}

// Setup and cleanup
onUnmounted(() => {
  // No need to stop the timer here, as we want it to continue running across component changes
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