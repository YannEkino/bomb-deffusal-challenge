<script setup lang="ts">
import { ref, onMounted, onUnmounted, computed } from 'vue';
import { useRouter } from 'vue-router';
import CountdownTimer from '../components/shared/CountdownTimer.vue';

const router = useRouter();
const timerRef = ref<InstanceType<typeof CountdownTimer> | null>(null);

// Device orientation API variables
const isDeviceOrientationSupported = ref(!!window.DeviceOrientationEvent);
const deviceOrientation = ref<{ alpha: number | null; beta: number | null; gamma: number | null }>({
  alpha: null, // z-axis rotation (0-360)
  beta: null,  // x-axis rotation (-180 to 180)
  gamma: null  // y-axis rotation (-90 to 90)
});
const errorMessage = ref('');
const permissionGranted = ref(false);

// Defuse state variables
const targetAchieved = ref(false);
const stabilityTime = ref(0);
const requiredStabilityTime = 5; // 5 seconds of stability required to defuse
const stabilityInterval = ref<number | null>(null);

// Feedback variables for user
const betaDeviation = computed(() => {
  if (deviceOrientation.value.beta === null) return null;
  return Math.abs(deviceOrientation.value.beta);
});

const gammaDeviation = computed(() => {
  if (deviceOrientation.value.gamma === null) return null;
  return Math.abs(deviceOrientation.value.gamma);
});

const levelingAccuracy = computed(() => {
  if (betaDeviation.value === null || gammaDeviation.value === null) return 0;
  
  // Calculate how level the device is (0-100%)
  const maxBetaDeviation = 15;  // max degrees off level for beta
  const maxGammaDeviation = 15; // max degrees off level for gamma
  
  const betaAccuracy = Math.max(0, 100 - (betaDeviation.value / maxBetaDeviation * 100));
  const gammaAccuracy = Math.max(0, 100 - (gammaDeviation.value / maxGammaDeviation * 100));
  
  return Math.min(betaAccuracy, gammaAccuracy);
});

// Check if device is level enough
const isLevelEnough = computed(() => {
  if (betaDeviation.value === null || gammaDeviation.value === null) return false;
  
  // Consider device level when beta and gamma are close to 0
  return betaDeviation.value < 5 && gammaDeviation.value < 5;
});

// Handle device orientation event
function handleOrientationEvent(event: DeviceOrientationEvent) {
  deviceOrientation.value = {
    alpha: event.alpha,
    beta: event.beta,
    gamma: event.gamma
  };
}

// Request permission for device orientation (only needed for iOS 13+)
async function requestOrientationPermission() {
  // Type definition for the DeviceOrientationEvent with requestPermission
  interface DeviceOrientationEventiOS extends DeviceOrientationEvent {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  }

  try {
    // Check if the device requires permission (iOS 13+)
    if (typeof (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS).requestPermission === 'function') {
      const requestPermission = (DeviceOrientationEvent as unknown as DeviceOrientationEventiOS).requestPermission;
        if (typeof requestPermission === 'function') {
            const permissionState = await requestPermission();
        if (permissionState === 'granted') {
            permissionGranted.value = true;
            window.addEventListener('deviceorientation', handleOrientationEvent);
            startStabilityCheck();
        } else {
            errorMessage.value = 'Permission to access device orientation was denied';
        }
        } else {
        // No permission required, directly add the event listener
        permissionGranted.value = true;
        window.addEventListener('deviceorientation', handleOrientationEvent);
        startStabilityCheck();
        }
    }
  } catch (error) {
    console.error('Error requesting device orientation permission:', error);
    errorMessage.value = 'Could not access device orientation';
  }
}

// Start checking device stability
function startStabilityCheck() {
  if (stabilityInterval.value) clearInterval(stabilityInterval.value);
  
  stabilityInterval.value = window.setInterval(() => {
    if (isLevelEnough.value) {
      stabilityTime.value += 0.1; // Increment by 100ms
      if (stabilityTime.value >= requiredStabilityTime) {
        defuseSucceeded();
      }
    } else {
      stabilityTime.value = 0; // Reset if device is moved
    }
  }, 100);
}

// Handle successful defuse
function defuseSucceeded() {
  targetAchieved.value = true;
  if (stabilityInterval.value) {
    clearInterval(stabilityInterval.value);
    stabilityInterval.value = null;
  }
}

// Navigate to success screen
function proceedToSuccess() {
  router.push('/');
}

onMounted(() => {
  if (timerRef.value) {
    timerRef.value.startTimer();
  }

  if (!isDeviceOrientationSupported.value) {
    errorMessage.value = 'Device orientation is not supported on your device';
  }
});

onUnmounted(() => {
  if (stabilityInterval.value) {
    clearInterval(stabilityInterval.value);
    stabilityInterval.value = null;
  }
  window.removeEventListener('deviceorientation', handleOrientationEvent);
});

// Type declaration for the iOS version of DeviceOrientationEvent
declare global {
  interface DeviceOrientationEvent {
    requestPermission?: () => Promise<'granted' | 'denied'>;
  }
}
</script>

<template>
  <div class="defuse-bomb-container">
    <h1>Step 3: Defuse the Bomb</h1>
    
    <div class="timer-container">
      <CountdownTimer ref="timerRef" :initialTime="300" :start="true" />
    </div>
    
    <div v-if="!isDeviceOrientationSupported" class="error-message">
      <p>Your device doesn't support orientation detection, which is required for this challenge.</p>
      <p>Please try on a device with accelerometer/gyroscope sensors.</p>
    </div>
    
    <div v-else-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
    </div>
    
    <div v-else class="challenge-container">
      <div class="instructions">
        <p>To defuse the bomb, you need to place your device on a flat surface and keep it perfectly level.</p>
        <p>Hold it steady for {{ requiredStabilityTime }} seconds to complete the defusal process.</p>
        <p class="warning" v-if="!permissionGranted">You need to grant permission to access your device's orientation sensors.</p>
      </div>
      
      <div v-if="!permissionGranted" class="permission-container">
        <button @click="requestOrientationPermission" class="permission-button">Grant Sensor Access</button>
      </div>
      
      <div v-else class="orientation-container">
        <div class="bubble-level-container">
          <div class="bubble-level">
            <div class="bubble" :style="{
              transform: `translate(${deviceOrientation.gamma ? deviceOrientation.gamma * 3 : 0}px, ${deviceOrientation.beta ? deviceOrientation.beta * 3 : 0}px)`,
              backgroundColor: isLevelEnough ? '#33ff33' : '#ff3333'
            }"></div>
          </div>
        </div>
        
        <div class="orientation-values">
          <div class="orientation-value">
            <label>X-axis (β):</label>
            <span :class="{ 'good': betaDeviation !== null && betaDeviation < 5 }">
              {{ deviceOrientation.beta !== null ? deviceOrientation.beta.toFixed(2) : 'N/A' }}°
            </span>
          </div>
          
          <div class="orientation-value">
            <label>Y-axis (γ):</label>
            <span :class="{ 'good': gammaDeviation !== null && gammaDeviation < 5 }">
              {{ deviceOrientation.gamma !== null ? deviceOrientation.gamma.toFixed(2) : 'N/A' }}°
            </span>
          </div>
        </div>
        
        <div class="progress-container">
          <div class="progress-label">Device Level: {{ Math.round(levelingAccuracy) }}%</div>
          <div class="progress-bar">
            <div class="progress" :style="{ width: `${levelingAccuracy}%` }"></div>
          </div>
        </div>
        
        <div v-if="isLevelEnough" class="stability-progress">
          <div class="stability-label">Stabilizing: {{ stabilityTime.toFixed(1) }}/{{ requiredStabilityTime }}s</div>
          <div class="stability-bar">
            <div class="stability-progress" :style="{ width: `${(stabilityTime / requiredStabilityTime) * 100}%` }"></div>
          </div>
          <div class="stability-message">Hold steady!</div>
        </div>
      </div>
      
      <div v-if="targetAchieved" class="success-panel">
        <h2>BOMB DEFUSED!</h2>
        <p>The bomb has been successfully defused. Well done!</p>
        <button @click="proceedToSuccess" class="success-button">Mission Complete</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.defuse-bomb-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
}

h1 {
  color: #33ff33;
  text-align: center;
  margin-bottom: 2rem;
}

.timer-container {
  margin-bottom: 2rem;
}

.error-message {
  background-color: rgba(255, 0, 0, 0.3);
  padding: 1rem;
  border-radius: 8px;
  margin-bottom: 1rem;
  text-align: center;
}

.challenge-container {
  display: flex;
  flex-direction: column;
  gap: 2rem;
}

.instructions {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 1.5rem;
  border-radius: 8px;
  text-align: center;
}

.warning {
  color: #ffff33;
  font-weight: bold;
  margin-top: 1rem;
}

.permission-container {
  display: flex;
  justify-content: center;
  margin: 2rem 0;
}

.permission-button {
  background-color: #33ff33;
  color: black;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  transition: all 0.3s ease;
}

.permission-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(51, 255, 51, 0.7);
}

.orientation-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 2rem;
}

.bubble-level-container {
  width: 300px;
  height: 300px;
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
}

.bubble-level {
  width: 200px;
  height: 200px;
  border: 3px solid #33ff33;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.5);
  position: relative;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bubble {
  width: 30px;
  height: 30px;
  background-color: #ff3333;
  border-radius: 50%;
  position: absolute;
  transition: all 0.3s ease;
}

.orientation-values {
  display: flex;
  justify-content: center;
  gap: 2rem;
}

.orientation-value {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 1rem;
  border-radius: 8px;
  display: flex;
  flex-direction: column;
  align-items: center;
}

.orientation-value label {
  font-size: 0.9rem;
  color: #999;
  margin-bottom: 0.5rem;
}

.orientation-value span {
  font-size: 1.5rem;
  font-weight: bold;
  color: #ff3333;
}

.orientation-value span.good {
  color: #33ff33;
}

.progress-container {
  width: 100%;
  max-width: 400px;
}

.progress-label {
  margin-bottom: 0.5rem;
  text-align: center;
}

.progress-bar {
  height: 20px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 10px;
  overflow: hidden;
}

.progress {
  height: 100%;
  background-color: #33ff33;
  transition: width 0.3s ease;
}

.stability-progress {
  margin-top: 1rem;
  width: 100%;
  max-width: 400px;
  text-align: center;
}

.stability-label {
  margin-bottom: 0.5rem;
  color: #33ff33;
  font-weight: bold;
}

.stability-bar {
  height: 10px;
  background-color: rgba(255, 255, 255, 0.2);
  border-radius: 5px;
  overflow: hidden;
  margin-bottom: 0.5rem;
}

.stability-progress {
  height: 100%;
  background-color: #33ff33;
  transition: width 0.1s linear;
}

.stability-message {
  color: #33ff33;
  font-style: italic;
  animation: blink 1s infinite;
}

.success-panel {
  background-color: rgba(51, 255, 51, 0.3);
  padding: 2rem;
  border-radius: 8px;
  margin-top: 2rem;
  text-align: center;
  animation: successPulse 2s infinite;
}

.success-panel h2 {
  color: #33ff33;
  font-size: 2rem;
  margin-bottom: 1rem;
}

.success-button {
  background-color: #33ff33;
  color: black;
  border: none;
  padding: 0.8rem 1.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
  font-family: 'Courier New', monospace;
  transition: all 0.3s ease;
}

.success-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(51, 255, 51, 0.7);
}

@keyframes blink {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.5; }
}

@keyframes successPulse {
  0% { box-shadow: 0 0 5px rgba(51, 255, 51, 0.7); }
  50% { box-shadow: 0 0 20px rgba(51, 255, 51, 0.9); }
  100% { box-shadow: 0 0 5px rgba(51, 255, 51, 0.7); }
}
</style>