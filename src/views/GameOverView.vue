<script setup lang="ts">
import { useRouter } from 'vue-router';

const router = useRouter();

function restartChallenge() {
  router.push('/find-bomb-location');
}

function returnToHome() {
  router.push('/');
}
</script>

<template>
  <div class="game-over-container">
    <div class="explosion-animation"></div>
    
    <div class="content">
      <h1>BOOM!</h1>
      <h2>Mission Failed</h2>
      
      <p>You ran out of time and the bomb exploded.</p>
      <p>Better luck next time, agent!</p>
      
      <div class="buttons">
        <button @click="restartChallenge" class="restart-button">Try Again</button>
        <button @click="returnToHome" class="home-button">Return to Briefing</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.game-over-container {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  height: 100vh;
  width: 100%;
  background-color: #000;
  position: relative;
  overflow: hidden;
}

.explosion-animation {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: radial-gradient(circle at center, #ff3333, transparent);
  opacity: 0;
  z-index: 0;
  animation: explosion 3s ease-out forwards;
}

@keyframes explosion {
  0% {
    transform: scale(0);
    opacity: 1;
  }
  30% {
    transform: scale(1.5);
    opacity: 0.8;
  }
  100% {
    transform: scale(2);
    opacity: 0;
  }
}

.content {
  position: relative;
  z-index: 1;
  background-color: rgba(0, 0, 0, 0.8);
  padding: 3rem;
  border-radius: 8px;
  text-align: center;
  color: #e0e0e0;
  font-family: 'Courier New', monospace;
  animation: fadeIn 2s ease-in 0.5s forwards;
  opacity: 0;
  max-width: 600px;
}

@keyframes fadeIn {
  to { opacity: 1; }
}

h1 {
  color: #ff3333;
  font-size: 5rem;
  margin-bottom: 1rem;
  text-shadow: 0 0 20px rgba(255, 0, 0, 0.7);
  animation: shake 0.5s ease-in-out;
}

@keyframes shake {
  0%, 100% { transform: translateX(0); }
  10%, 30%, 50%, 70%, 90% { transform: translateX(-10px); }
  20%, 40%, 60%, 80% { transform: translateX(10px); }
}

h2 {
  color: #ff3333;
  font-size: 2.5rem;
  margin-bottom: 2rem;
}

p {
  font-size: 1.2rem;
  margin-bottom: 1rem;
}

.buttons {
  display: flex;
  gap: 1rem;
  justify-content: center;
  margin-top: 2rem;
}

.restart-button, .home-button {
  background-color: #333;
  color: #fff;
  border: none;
  padding: 1rem 1.5rem;
  font-size: 1.2rem;
  font-weight: bold;
  border-radius: 8px;
  cursor: pointer;
  font-family: 'Courier New', monospace;
  transition: all 0.3s ease;
}

.restart-button {
  background-color: #ff3333;
}

.restart-button:hover, .home-button:hover {
  transform: scale(1.05);
  box-shadow: 0 0 15px rgba(255, 255, 255, 0.5);
}
</style>