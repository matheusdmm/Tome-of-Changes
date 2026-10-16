import { createRouter, createWebHistory } from 'vue-router'
import { CATEGORIES } from '../composables/useOpen5e.js'
export const routes = [
  { path: '/', name: 'home', component: () => import('../views/HomeView.vue') },
  { path: '/conditions', name: 'conditions', component: () => import('../views/ConditionsView.vue') },
  { path: '/privacy', name: 'privacy', component: () => import('../views/PrivacyView.vue') },
  { path: '/favorites', name: 'favorites', component: () => import('../views/FavoritesView.vue') },
  { path: '/whats-new', name: 'whats-new', component: () => import('../views/WhatsNewView.vue') },
  { path: '/attribution', name: 'attribution', component: () => import('../views/AttributionView.vue') },
  { path: '/compare/:category/:query(.*)', name: 'compare', component: () => import('../views/SearchView.vue') },
  { path: '/:pathMatch(.*)*', name: 'not-found', component: () => import('../views/NotFoundView.vue') },
]
export function validateCategory(to) {
  if (to.name === 'compare' && !Object.hasOwn(CATEGORIES, to.params.category)) return { name: 'not-found', params: { pathMatch: to.path.slice(1).split('/') }, replace: true }
  return true
}
const router = createRouter({ history: createWebHistory(), routes, scrollBehavior: () => ({ top: 0 }) })
router.beforeEach(validateCategory)
export default router
