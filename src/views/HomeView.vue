<script setup lang="ts">
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import CountdownTimer from '../components/shared/CountdownTimer.vue';

const router = useRouter();
const timerRef = ref<InstanceType<typeof CountdownTimer> | null>(null);

const startGame = () => {
  if (timerRef.value) {
    timerRef.value.startTimer();
  }
  router.push('/find-bomb-location');
};
</script>

<template>
  <div class="home-container">
    <h1>Bomb Defusal Challenge</h1>
    
    <div class="mission-brief">
      <h2>Mission Briefing</h2>
      <p>A dangerous device has been planted somewhere in your vicinity. Your mission, should you choose to accept it, is to:</p>
      
      <ol>
        <li><strong>Find the bomb's location</strong> using geolocation technology</li>
        <li><strong>Unlock the bomb's control panel</strong> using voice recognition</li>
        <li><strong>Defuse the device</strong> by maintaining the perfect orientation</li>
      </ol>
      
      <p>You have <strong>5 minutes</strong> to complete all tasks before detonation.</p>
      <p class="warning">Warning: This mission requires device access to geolocation, microphone, and device orientation sensors.</p>
    </div>
    
    <div class="timer-container">
      <CountdownTimer ref="timerRef" :initialTime="300" :start="false" />
    </div>
    
    <div class="start-container">
      <button @click="startGame" class="start-button">Accept Mission</button>
    </div>
  </div>
</template>

<style scoped>
.home-container {
  max-width: 800px;
  margin: 0 auto;
  padding: 2rem;
  text-align: center;
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
}

h1 {
  color: #ff3333;
  font-size: 3rem;
  margin-bottom: 2rem;
  text-shadow: 0 0 10px rgba(255, 0, 0, 0.5);
}

h2 {
  color: #33ff33;
  margin-bottom: 1rem;
}

.mission-brief {
  background-color: rgba(0, 0, 0, 0.7);
  padding: 2rem;
  border-radius: 8px;
  margin-bottom: 2rem;
  text-align: left;
}

ol {
  margin-left: 2rem;
  margin-bottom: 1rem;
}

li {
  margin-bottom: 0.5rem;
}

.warning {
  color: #ffff33;
  font-weight: bold;
  margin-top: 1rem;
}

.timer-container {
  margin-bottom: 2rem;
}

.start-button {
  background-color: #ff3333;
  color: white;
  border: none;
  padding: 1rem 2rem;
  font-size: 1.5rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  font-family: 'Courier New', monospace;
}

.start-button:hover {
  background-color: #cc0000;
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(255, 0, 0, 0.7);
}
</style>