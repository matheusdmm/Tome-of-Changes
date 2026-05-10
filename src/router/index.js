import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import SearchView from '../views/SearchView.vue';
import FavoritesView from '../views/FavoritesView.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/favorites', component: FavoritesView, name: 'favorites' },
  {
    // Shareable URL: /compare/Spell/fireball
    path: '/compare/:category/:query(.*)',
    component: SearchView,
    name: 'compare',
  },
];

export default createRouter({
  history: createWebHistory(),
  routes,
});
