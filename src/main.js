import { createApp } from 'vue'
import 'primeicons/primeicons.css'
import App from './App.vue'
import router from './router/index.js'
import { auth } from './firebase'
import { onAuthStateChanged } from 'firebase/auth'
import { createPinia } from "pinia";
import piniaPluginPersistedState from "pinia-plugin-persistedstate"
import './assets/index.css'

let app

onAuthStateChanged(auth, () => {
    if (!app) {
        const pinia = createPinia();
        app = createApp(App)
        app.use(router)
        pinia.use(piniaPluginPersistedState);
        app.use(pinia)
        app.mount('#app')
    }
})
