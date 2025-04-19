<template>
  <!-- Lost Items Page Container -->
  <div class="lost-page"> 
    <!-- Report Lost Item Form Component -->
    <ReportLostItem />
  </div>
</template>

<script>
/**
 * Lost Page Component
 * 
 * This component serves as the container for the lost items reporting functionality.
 * It incorporates the ReportLostItem component which handles the form submission
 * and related functionality for reporting lost items.
 */
import ReportLostItem from '@/components/ReportLostItem.vue'

export default {
  name: 'LostPage',
  components: {
    ReportLostItem,
  }
}
</script>