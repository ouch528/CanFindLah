import { createRouter, createWebHistory } from 'vue-router'
import { auth } from '../firebase'
import HomeView from '../views/HomeView.vue'
import LostPage from '../views/LostPage.vue'
import FoundPage from '../views/FoundPage.vue'
import MessagesView from '../views/MessagesView.vue'
import EditItem from '../views/EditItemView.vue'
import History from '../views/HistoryView.vue'
import SignupView from '../views/SignupView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
    history: createWebHistory(import.meta.env.BASE_URL),
    routes: [
        {
            path: '/',
            name: 'home',
            component: HomeView,
            meta: { requiresAuth: true },
        },
        {
            path: '/signup',
            name: 'signup',
            component: SignupView,
        },
        {
            path: '/login',
            name: 'login',
            component: LoginView,
        },
        {
            path: '/report_lost',
            name: 'Report Lost',
            component: LostPage,
            meta: { requiresAuth: true },
        },
        {
            path: '/report_found',
            name: 'Report Found',
            component: FoundPage,
            meta: { requiresAuth: true },
        },
        {
            path: '/Messages',
            name: 'Messages',
            component: MessagesView,
            meta: { requiresAuth: true },
        },
        {
            path: '/edit',
            name: 'edit_item',
            component: EditItem,
            meta: { requiresAuth: true },
        },

        {
            path: '/history',
            name: 'history',
            component: History,
            meta: { requiresAuth: true },
        },
    ],
})

router.beforeEach((to, from, next) => {
    const user = auth.currentUser

    if (to.meta.requiresAuth && !user) {
        next('/login')
    } else if ((to.path === '/login' || to.path === '/signup') && user) {
        next('/')
    } else {
        next()
    }
})

export default router
