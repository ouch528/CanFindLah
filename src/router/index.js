import { createRouter, createWebHistory } from 'vue-router'
import { auth } from "../firebase"
import HomeView from '../views/HomeView.vue'
import SignupView from '../views/SignupView.vue'
import LoginView from '../views/LoginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomeView,
      meta: { requiresAuth: true }
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
    }
  ],
})

router.beforeEach((to, from, next) => {
  const user = auth.currentUser;
  
  if (to.meta.requiresAuth && !user) {
    next("/login");
  } else if ((to.path === "/login" || to.path === "/signup") && user) {
    next("/");
  } else {
    next();
  }
});

export default router
