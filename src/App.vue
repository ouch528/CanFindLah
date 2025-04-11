<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { computed } from 'vue'
import NavBar from './components/NavBar.vue'

const route = useRoute()
const isAuthPage = computed(() => route.path === '/login' || route.path === '/signup')
</script>
<!-- 
<template>
    <NavBar v-if="!isAuthPage" />
    <NavBar />
    <RouterView />
</template> -->

<template>
    <!-- <header>
        <nav>
            <RouterLink to="/"></RouterLink>
        </nav>
    </header> -->

    <NavBar v-if="!isAuthPage" />
    <!-- <NavBar /> -->
    <RouterView />
</template>

<script>
import { signOut } from 'firebase/auth'
import { auth } from './firebase'

export default {
    data() {
        return {
            inactivityTimer: null,
            timeOutDuration: 15 * 60 * 1000 // 15 minutes
        }
    },
    mounted() {
        this.startInactivityTracking()
    },
    beforeUnmount() {
        this.stopInactivityTracking()
    },
    methods: {
        startInactivityTracking() {
            this.resetInactivityTimer();
            window.addEventListener("mousemove", this.resetInactivityTimer)
            window.addEventListener("keydown", this.resetInactivityTimer)
            window.addEventListener("scroll", this.resetInactivityTimer)
            window.addEventListener("click", this.resetInactivityTimer)
        },
        resetInactivityTimer() {
            clearTimeout(this.inactivityTimer)
            this.inactivityTimer = setTimeout(async () => {
                alert("You've been logged out due to inactivity.")
                await signOut(auth)
                this.$router.push("/login")
            }, this.timeOutDuration)
        }, 
        stopInactivityTracking() {
            clearTimeout(this.inactivityTimer)
            window.removeEventListener("mousemove", this.resetInactivityTimer)
            window.removeEventListener("keydown", this.resetInactivityTimer)
            window.removeEventListener("scroll", this.resetInactivityTimer)
            window.removeEventListener("click", this.resetInactivityTimer)
        }
    }
}
</script>