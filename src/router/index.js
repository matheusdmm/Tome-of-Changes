import { createRouter, createWebHistory } from 'vue-router';
import HomeView from '../views/HomeView.vue';
import SearchView from '../views/SearchView.vue';
import FavoritesView from '../views/FavoritesView.vue';
import WhatsNewView from '../views/WhatsNewView.vue';
import ConditionsView from '../views/ConditionsView.vue';
import PrivacyView from '../views/PrivacyView.vue';

const routes = [
  { path: '/', component: HomeView },
  { path: '/conditions', component: ConditionsView, name: 'conditions' },
  { path: '/privacy', component: PrivacyView, name: 'privacy' },
  { path: '/favorites', component: FavoritesView, name: 'favorites' },
  { path: '/whats-new', component: WhatsNewView, name: 'whats-new' },
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
