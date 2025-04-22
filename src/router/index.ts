import { createRouter, createWebHistory, RouteRecordRaw } from 'vue-router';

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

const router = createRouter({
  history: createWebHistory(),
  routes,
});

export default router;