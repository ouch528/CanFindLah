import { createRouter, createWebHistory } from 'vue-router'
import HomeView from '../views/HomeView.vue'
import LostPage from '../views/LostPage.vue'
import FoundPage from '../views/FoundPage.vue'
import MessagesView from '../views/MessagesView.vue'
import EditItem from '../views/EditItemView.vue'
import History from '../views/HistoryView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: MessagesView,
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
        {
            path: '/Messages',
            name: 'Messages',
            component: MessagesView,
        },
        {
            path: '/edit',
            name: 'edit_item',
            component: EditItem,
        },

        {
            path: '/history',
            name: 'history',
            component: History,
        },
    ],
})

export default router
