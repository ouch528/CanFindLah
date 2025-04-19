<template>
    <div class="matching-items-container">
      <h2 id="header">Similar Items Found</h2>
      <div>
        <!-- Loading state indicator -->
        <p v-if="loading" class="status-message">Searching for matching items...</p>
  
        <!-- Already matched item message -->
        <p 
          v-if="errorMessage === 'The lost item has already been matched.'" 
          id="already-matched" 
          class="status-message"
        >
          This lost item has already been matched with another item.
        </p>
  
        <!-- Display matching items using the SimilarItem component -->
        <div class="card-container" v-if="matchingItems.length > 0">
          <SimilarItem 
            v-for="item in matchingItems" 
            :key="item.id" 
            :item="item" 
          />
        </div>
  
        <!-- No matching items message -->
        <p 
          id="no-match" 
          class="status-message"
          v-else-if="!loading && !matchingItems.length && !errorMessage"
        >
          No matching items found yet. <br /><br />
          An email notification will be sent if a similar item has been found.
        </p>
  
        <!-- End of results message -->
        <p 
          id="end" 
          class="status-message"
          v-if="matchingItems.length > 0"
        >
          You've reached the end.
        </p>
      </div>
    </div>
  </template>
  
  <script>
  import { doc, getDoc, updateDoc } from 'firebase/firestore' 
  import SimilarItem from '@/components/SimilarItem.vue'
  import { findMatchingItems } from '@/components/matchingService.js'
  import { db } from '@/firebase'
  
  /**
   * MatchingItem Component
   * 
   * Displays potential matching items for a lost item.
   * Fetches and displays found items that match the characteristics
   * of a specified lost item.
   */
  export default {
    name: 'MatchingItem',
    
    components: {
      SimilarItem,
    },
    
    data() {
      return {
        matchingItems: [],       // Array to store matching items
        loading: false,          // Loading state indicator
        errorMessage: '',        // Error message to display if any
      }
    },
    
    async mounted() {
      // Initialize matching items when component mounts
      this.refreshMatchingItems()
    },
    
    methods: {
      /**
       * Fetches and refreshes the list of matching items
       * Updates the lost item document based on whether matches are found
       */
      async refreshMatchingItems() {
        this.loading = true
        this.errorMessage = '' // Clear any previous error messages
        
        try {
          console.log('Query Parameters:', this.$route.query)
  
          const lostItem = this.$route.query.lostItem
          const lostItemID = this.$route.query.id
  
          console.log('Lost Item ID:', lostItemID)
  
          // Validate required parameters are present
          if (!lostItem || !lostItemID) {
            this.errorMessage = 'Lost item data is missing.'
            return
          }
  
          // Fetch the lost item document from Firestore
          const lostItemDocRef = doc(db, 'Lost Item', lostItemID)
          const lostItemDocSnap = await getDoc(lostItemDocRef)
  
          // Check if the item is available for matching
          if (!lostItemDocSnap.exists() || lostItemDocSnap.data().claimed_status !== 'Not Found Yet') {
            this.errorMessage = 'The lost item has already been matched.'
            return
          }
  
          // Parse the lost item and find matching items
          const parsedLostItem = JSON.parse(lostItem)
          const matchingItems = await findMatchingItems(parsedLostItem)
  
          // Only show items that are not yet claimed
          this.matchingItems = matchingItems.filter((item) => item.claimed_status === 'Not Found Yet')
          
          // Update the lost item document based on match results
          if (this.matchingItems.length > 0) {
            await updateDoc(lostItemDocRef, { 
              already_similar_item: true,
              found_afterwards: true 
            })
          } else {
            await updateDoc(lostItemDocRef, { 
              already_similar_item: false,
              found_afterwards: false 
            })
          }
        } catch (err) {
          console.error('Error fetching matching items:', err)
          this.errorMessage = 'An error occurred while fetching the matching items.'
        } finally {
          this.loading = false
        }
      },
    },
    
    beforeRouteEnter(to, from, next) {
      // Force data refresh when entering the route
      next((vm) => {
        vm.refreshMatchingItems()
      })
    },
    
    beforeRouteUpdate(to, from, next) {
      // Force data refresh when navigating between pages
      this.refreshMatchingItems()
      next()
    },
  }
  </script>
  
  <style scoped>
  .matching-items-container {
    max-width: 1200px;
    margin: 0 auto;
    padding: 1rem;
  }
  
  #header {
    font-size: 3rem;
    color: #684545;
    text-align: center;
    margin-bottom: 2rem;
  }
  
  .status-message {
    text-align: center;
    font-size: 1.5rem;
    margin: 2rem 0;
  }
  
  .error {
    color: red;
    font-weight: bold;
  }
  
  .card-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    padding: 1rem;
  }
  
  #already-matched {
    color: #d9534f;
  }
  
  #no-match {
    color: #5bc0de;
  }
  
  #end {
    margin-top: 4.125rem;
    margin-bottom: 4.125rem;
    color: #777;
  }
  </style>