<template>
    <!-- Main application layout -->
    <NavBar v-if="!isAuthPage" />
    <RouterView />
  </template>
  
  <script>
  import NavBar from './components/NavBar.vue'
  import { signOut } from 'firebase/auth'
  import { auth } from './firebase'
  
  /**
   * Root App Component
   * 
   * This component serves as the main container for the application, managing:
   * - Navigation bar visibility based on route
   * - User inactivity tracking and auto-logout for security
   */
  export default {
    components: {
      NavBar
    },
    
    data() {
      return {
        inactivityTimer: null,
        timeOutDuration: 15 * 60 * 1000 // 15 minutes in milliseconds
      }
    },
    
    computed: {
      /**
       * Determines if the current route is an authentication page
       * @returns {boolean} True if on login or signup page
       */
      isAuthPage() {
        return this.$route.path === '/login' || this.$route.path === '/signup'
      }
    },
    
    mounted() {
      // Start tracking inactivity only if not on auth pages
      if (!this.isAuthPage) {
        this.startInactivityTracking()
      }
    },
    
    beforeUnmount() {
      // Clean up event listeners when component is destroyed
      this.stopInactivityTracking()
    },
    
    watch: {
      /**
       * Watch for route changes to manage inactivity tracking
       * @param {string} newPath - The new route path
       */
      '$route.path'(newPath) {
        if (newPath === '/login' || newPath === '/signup') {
          this.stopInactivityTracking()
        } else {
          this.startInactivityTracking()
        }
      }
    },
    
    methods: {
      /**
       * Start tracking user activity by attaching event listeners
       */
      startInactivityTracking() {
        this.resetInactivityTimer();
        window.addEventListener("mousemove", this.resetInactivityTimer)
        window.addEventListener("keydown", this.resetInactivityTimer)
        window.addEventListener("scroll", this.resetInactivityTimer)
        window.addEventListener("click", this.resetInactivityTimer)
      },
      
      /**
       * Reset the inactivity timer when user activity is detected
       * If timeout occurs, log out the user and redirect to login page
       */
      resetInactivityTimer() {
        clearTimeout(this.inactivityTimer)
        this.inactivityTimer = setTimeout(async () => {
          alert("You've been logged out due to inactivity.")
          await signOut(auth)
          this.$router.push("/login")
        }, this.timeOutDuration)
      },
      
      /**
       * Stop tracking user inactivity and clean up event listeners
       */
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