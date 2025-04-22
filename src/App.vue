<script setup lang="ts">
// App.vue is the root component
</script>

<template>
  <div class="app-container">
    <router-view v-slot="{ Component }">
      <transition name="fade" mode="out-in">
        <component :is="Component" />
      </transition>
    </router-view>
  </div>
</template>

<style>
/* Global styles */
:root {
  --primary-color: #33ff33;
  --danger-color: #ff3333;
  --warning-color: #ffff33;
  --dark-bg: #121212;
  --font-family: 'Courier New', monospace;
}

* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

html, body {
  height: 100%;
  background-color: var(--dark-bg);
  color: #e0e0e0;
  font-family: var(--font-family);
  overflow-x: hidden;
}

.app-container {
  min-height: 100vh;
  background: linear-gradient(135deg, #121212, #1a1a1a);
  padding: 1rem;
}

/* Transition animations */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
