// import './assets/main.css'

import { createApp } from 'vue'
import App from './App.vue'
import router from './router'
import '@/assets/index.css';
import NavBar from "./components/NavBar.vue"

const app = createApp(App).component("NavBar", NavBar)

app.use(router)



app.mount('#app')
