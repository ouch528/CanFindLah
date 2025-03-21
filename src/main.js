import { createApp } from 'vue'
import "primeicons/primeicons.css";
import App from './App.vue'
import router from './router'
import { auth } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";

let app;

onAuthStateChanged(auth, () => {
    if (!app) {
        app = createApp(App);
        app.use(router);
        app.mount("#app");
    }
});

// const app = createApp(App)

// app.use(router)

// app.mount('#app')
