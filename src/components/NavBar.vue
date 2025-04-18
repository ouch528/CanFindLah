<template>
    <!-- Main navigation bar component -->
    <nav class="navbar">
      <!-- Logo and brand name section -->
      <div class="logo">
        <img src="@/assets/CFL_logo.png" alt="CanFindLah" />
        <span>CanFindLah</span>
      </div>
      
      <!-- Navigation links -->
      <ul>
        <li><router-link to="/" active-class="active-link">Home</router-link></li>
        <li><router-link to="/history" active-class="active-link">History</router-link></li>
        <li><router-link to="/Messages" active-class="active-link">Messages</router-link></li>
        <li id="logout" @click="logoutConfirmation">Logout</li>
      </ul>
    </nav>
  </template>
  
  <script>
  import { signOut } from 'firebase/auth'
  import { auth } from '../firebase'
  
  /**
   * Navigation bar component
   * Provides site navigation and user logout functionality
   */
  export default {
    methods: {
      /**
       * Handles user logout with confirmation
       * Shows confirmation dialog before signing out
       */
      async logoutConfirmation() {
        let text = 'Are you sure you want to logout?'
        if (confirm(text)) {
          try {
            await signOut(auth)
            alert('You have been logged out.')
            this.$router.push('/login')
          } catch (error) {
            console.error('Error signing out:', error)
          }
        }
      },
    },
  }
  </script>
  
  <style scoped>
  /* Main navbar container */
  .navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 30px;
    font-size: 1.25rem;
  }
  
  /* Logo and brand name styling */
  .logo {
    display: flex;
    align-items: center;
    font-size: 1.25rem;
    font-weight: bold;
  }
  
  .logo img {
    height: 35px;
    margin-right: 5px;
  }
  
  /* Navigation list styling */
  ul {
    display: flex;
    list-style: none;
  }
  
  ul li {
    margin: 0 30px;
    font-weight: bold;
  }
  
  ul li a {
    text-decoration: none;
    color: black;
  }
  
  ul li:hover {
    transform: scale(1.1);
  }
  
  /* Active link styling */
  .active-link {
    color: #808080;
  }
  
  /* Logout button styling */
  #logout {
    cursor: pointer;
  }
  
  #logout:hover {
    color: #808080;
  }
  </style>