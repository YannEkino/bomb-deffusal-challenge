<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import CountdownTimer from '../components/shared/CountdownTimer.vue';
import { SpeechRecognitionApi, type SpeechRecognitionResult } from '../modules/speech-recognition/SpeechRecognitionApi';

const router = useRouter();
const timerRef = ref<InstanceType<typeof CountdownTimer> | null>(null);

// Speech Recognition API related variables
const isSpeechRecognitionSupported = ref(SpeechRecognitionApi.isSupported());
const speechRecognition = ref<SpeechRecognitionApi | null>(null);
const isListening = ref(false);
const errorMessage = ref('');
const recognizedText = ref('');
const matchFound = ref(false);
const attemptCount = ref(0);

// Secret codes (only one works)
const secretCodes = [
  'Alpha Tango Foxtrot',
  'Bravo Echo Delta',
  'Charlie Oscar Delta Echo',
  'Delta Lima Tango',
  'Echo Sierra Charlie Alpha Papa Echo'
];
const correctCodeIndex = 2; // "Charlie Oscar Delta Echo" is the correct code

// Try to initialize the speech recognition API
function initializeSpeechRecognition() {
  if (!isSpeechRecognitionSupported.value) {
    errorMessage.value = 'Speech Recognition API is not supported in your browser';
    return;
  }

  try {
    speechRecognition.value = new SpeechRecognitionApi({
      lang: 'en-US',
      continuous: false,
      interimResults: false
    });
  } catch (error) {
    console.error('Error initializing speech recognition:', error);
    errorMessage.value = 'Failed to initialize speech recognition';
  }
}

// Start listening for speech
async function startListening() {
  if (!speechRecognition.value) return;
  
  isListening.value = true;
  recognizedText.value = '';
  
  try {
    await speechRecognition.value.start();
    const result = await speechRecognition.value.listen();
    handleSpeechResult(result);
  } catch (error: any) {
    console.error('Speech recognition error:', error);
    errorMessage.value = error.message || 'Speech recognition failed';
    isListening.value = false;
  }
}

// Handle speech recognition result
function handleSpeechResult(result: SpeechRecognitionResult) {
  isListening.value = false;
  recognizedText.value = result.transcript;
  attemptCount.value++;
  
  // Check if the spoken phrase matches the correct code
  const isCorrect = SpeechRecognitionApi.compareTranscript(
    result.transcript, 
    secretCodes[correctCodeIndex],
    true // Use fuzzy matching for better user experience
  );
  
  if (isCorrect) {
    matchFound.value = true;
  }
}

// Proceed to the next challenge
function proceedToNextStep() {
  router.push('/defuse-bomb');
}

// Cleanup on component unmount
onUnmounted(() => {
  if (speechRecognition.value && isListening.value) {
    speechRecognition.value.stop();
  }
});

// Initialize on component mount
onMounted(() => {
  if (timerRef.value) {
    timerRef.value.startTimer();
  }
  
  initializeSpeechRecognition();
});
</script>

<template>
  <div class="unlock-bomb-container">
    <h1>Step 2: Unlock the Bomb</h1>
    
    <div class="timer-container">
      <CountdownTimer ref="timerRef" :initialTime="300" :start="true" />
    </div>
    
    <div v-if="!isSpeechRecognitionSupported" class="error-message">
      <p>Your browser doesn't support speech recognition, which is required for this challenge.</p>
      <p>Please try using Chrome or Edge on desktop, or Chrome on Android.</p>
    </div>
    
    <div v-else-if="errorMessage" class="error-message">
      <p>{{ errorMessage }}</p>
      <button @click="initializeSpeechRecognition" class="retry-button">Retry</button>
    </div>
    
    <div v-else class="challenge-container">
      <div class="instructions">
        <p>The bomb's control panel requires voice authentication to unlock.</p>
        <p>You need to speak the correct code phrase from the list below:</p>
        
        <div class="code-options">
          <ul>
            <li v-for="(code, index) in secretCodes" :key="index">{{ code }}</li>
          </ul>
        </div>
        
        <p class="hint">Only one of these codes will work. Choose wisely!</p>
      </div>
      
      <div class="speech-container">
        <button 
          @click="startListening" 
          class="mic-button" 
          :class="{ 'listening': isListening, 'disabled': matchFound }"
          :disabled="isListening || matchFound"
        >
          {{ isListening ? 'Listening...' : 'Speak Code' }}
        </button>
        
        <div v-if="recognizedText" class="recognition-result">
          <p>Recognized speech:</p>
          <div class="transcript">{{ recognizedText }}</div>
        </div>
        
        <div v-if="attemptCount > 0 && !matchFound" class="attempt-feedback">
          <p class="wrong">Incorrect code. Try again!</p>
          <p class="attempts">Attempts: {{ attemptCount }}</p>
        </div>
        
        <div v-if="matchFound" class="success-message">
          <p>Authentication successful! The bomb has been unlocked.</p>
          <button @click="proceedToNextStep" class="proceed-button">Proceed to Defuse the Bomb</button>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
.unlock-bomb-container {
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

.code-options {
  margin: 1.5rem 0;
  background-color: rgba(0, 0, 0, 0.5);
  border-radius: 8px;
  padding: 1rem;
}

.code-options ul {
  list-style-type: none;
  padding: 0;
}

.code-options li {
  margin: 0.7rem 0;
  font-size: 1.1rem;
  font-weight: bold;
  color: #33ff33;
  text-shadow: 0 0 5px rgba(51, 255, 51, 0.7);
}

.hint {
  color: #ffff33;
  font-style: italic;
  margin-top: 1rem;
}

.speech-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1.5rem;
}

.mic-button {
  background-color: #33ff33;
  color: black;
  border: none;
  padding: 1.2rem 2rem;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 50px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  transition: all 0.3s ease;
  width: 200px;
}

.mic-button:hover:not(.disabled) {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(51, 255, 51, 0.7);
}

.mic-button.listening {
  background-color: #ff3333;
  animation: pulse 1s infinite;
}

.mic-button.disabled {
  background-color: #666;
  cursor: not-allowed;
  opacity: 0.7;
}

.recognition-result {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 1.5rem;
  border-radius: 8px;
  width: 100%;
  text-align: center;
}

.transcript {
  font-size: 1.3rem;
  margin-top: 0.5rem;
  color: #ffff33;
}

.attempt-feedback {
  margin-top: 1rem;
  text-align: center;
}

.wrong {
  color: #ff3333;
  font-weight: bold;
}

.attempts {
  font-size: 0.9rem;
  color: #999;
  margin-top: 0.5rem;
}

.success-message {
  background-color: rgba(51, 255, 51, 0.3);
  padding: 1.5rem;
  border-radius: 8px;
  margin-top: 1.5rem;
  text-align: center;
  animation: successPulse 2s infinite;
}

.proceed-button {
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

.proceed-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(51, 255, 51, 0.7);
}

.retry-button {
  background-color: #33ff33;
  color: black;
  border: none;
  padding: 0.5rem 1.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  margin-top: 1rem;
  font-family: 'Courier New', monospace;
  transition: all 0.3s ease;
}

@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.7; }
  100% { opacity: 1; }
}

@keyframes successPulse {
  0% { box-shadow: 0 0 5px rgba(51, 255, 51, 0.7); }
  50% { box-shadow: 0 0 20px rgba(51, 255, 51, 0.9); }
  100% { box-shadow: 0 0 5px rgba(51, 255, 51, 0.7); }
}
</style>
