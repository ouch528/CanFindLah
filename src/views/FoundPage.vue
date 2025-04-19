<template>
  <div class="found-page">
    <ReportFoundItem />
  </div>
</template>

<script>
import ReportFoundItem from '@/components/ReportFoundItem.vue';

/**
 * Found Page Component
 * 
 * A wrapper component that displays the ReportFoundItem form.
 * This serves as a container page for the found item reporting functionality.
 */
export default {
  name: 'FoundPage',
  
  components: {
    ReportFoundItem,
  }
}
</script>