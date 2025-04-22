import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    component: () => import('../views/HomeView.vue'),
  },
  {
    path: '/find-bomb-location',
    name: 'find-bomb-location',
    component: () => import('../views/FindBombLocationView.vue'),
  },
  {
    path: '/unlock-bomb',
    name: 'unlock-bomb',
    component: () => import('../views/UnlockBombView.vue'),
  },
  {
    path: '/defuse-bomb',
    name: 'defuse-bomb',
    component: () => import('../views/DefuseBombView.vue'),
  },
  {
    path: '/game-over',
    name: 'game-over',
    component: () => import('../views/GameOverView.vue'),
  },
];

// Use import.meta.env.BASE_URL to ensure the router base matches Vite's base configuration
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;