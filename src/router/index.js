import { createRouter, createWebHistory } from 'vue-router';
import LandingPage from '@/components/LandingPage.vue';
import GameBoard from '@/components/GameBoard.vue';

const routes = [
  { path: '/', component: LandingPage },
  { path: '/singleplayer', component: GameBoard },
  { path: '/multiplayer', component: GameBoard }
];

const router = createRouter({
  history: createWebHistory(),
  routes
});

export default router;
