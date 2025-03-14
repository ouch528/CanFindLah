import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LostPage from '../views/LostPage.vue'
import FoundPage from '../views/FoundPage.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },
    {
      path: '/report_lost',
      name: 'Report Lost',
      component: LostPage,
    },
    {
      path: '/report_found',
      name: 'Report Found',
      component: FoundPage,
    },
  ],
})

export default router
