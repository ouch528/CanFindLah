<script setup>
import { RouterLink, RouterView } from 'vue-router'
import History from "./views/HistoryView.vue";

</script>

<template>
  <!-- <header>
    <nav>
      <RouterLink to="/">Home</RouterLink>
    </nav>
  </header> -->
  <NavBar />

  <RouterView />
  <!-- <History /> -->
</template>
