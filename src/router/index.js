import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import EditItem from "../views/EditItemView.vue"
import History from "../views/HistoryView.vue"

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
    },

    {
      path: "/edit",
      name: "edit_item",
      component: EditItem
    },

    {
      path: "/history",
      name: "history",
      component: History
    }
  ],
})

export default router
