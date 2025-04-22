import { createRouter, createWebHistory } from 'vue-router';
import type { RouteRecordRaw } from 'vue-router';

// Define routes with more explicit dynamic imports
const routes: Array<RouteRecordRaw> = [
  {
    path: '/',
    name: 'home',
    // Use a more explicit import method to avoid issues in production
    component: () => import(/* webpackChunkName: "home" */ '../views/HomeView.vue')
  },
  {
    path: '/find-bomb-location',
    name: 'find-bomb-location',
    component: () => import(/* webpackChunkName: "find-bomb" */ '../views/FindBombLocationView.vue')
  },
  {
    path: '/unlock-bomb',
    name: 'unlock-bomb',
    component: () => import(/* webpackChunkName: "unlock" */ '../views/UnlockBombView.vue')
  },
  {
    path: '/defuse-bomb',
    name: 'defuse-bomb',
    component: () => import(/* webpackChunkName: "defuse" */ '../views/DefuseBombView.vue')
  },
  {
    path: '/game-over',
    name: 'game-over',
    component: () => import(/* webpackChunkName: "game-over" */ '../views/GameOverView.vue')
  },
];

// Use import.meta.env.BASE_URL to ensure the router base matches Vite's base configuration
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes,
});

export default router;