<script setup>
import { RouterLink, RouterView } from 'vue-router'
import History from "./views/History.vue";
</script>

<template>
  <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
    </nav>
  </header>

  <RouterView />
  <History />
</template>
