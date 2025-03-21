<script setup>
import { RouterLink, RouterView, useRoute } from 'vue-router'
import { computed } from "vue"
import NavBar from './components/NavBar.vue';

const route = useRoute();
const isAuthPage = computed(() => route.path === "/login" || route.path === "/signup");
</script>

<template>
  <!-- <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
      <RouterLink to="/signup">Signup</RouterLink>
      <RouterLink to="/login">Login</RouterLink>
    </nav>
  </header> -->

  <NavBar v-if="!isAuthPage" />

  <RouterView />
</template>
