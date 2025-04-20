<template>
    <div class="card" @click="goToClaimPage">
      <!-- Loading spinner overlay that appears only when image is loading -->
      <div v-if="isLoading && imageUrl" class="loading-spinner"></div>
      
      <!-- Display item image or fallback image -->
      <img 
        v-if="imageUrl" 
        :src="imageUrl" 
        :alt="item.name" 
        class="item-image" 
        @load="onImageLoad" 
        @error="onImageError" 
      />
      <img 
        v-else 
        src="@/assets/image_not_found.png" 
        :alt="item.name" 
        class="item-image" 
      />
      
      <!-- Item details -->
      <div class="card-content">
        <h3>{{ item.name }}</h3>
        <p><strong>Category:</strong> {{ item.category }}</p>
        <p><strong>Colour:</strong> {{ item.colour }}</p>
        <p><strong>Brand:</strong> {{ item.brand }}</p>
        <p><strong>Location:</strong> {{ item.location }}</p>
        <p><strong>Date & Time Found:</strong> {{ formatDateTime(item.date_time_found) }}</p>
        <p><strong>Description:</strong> {{ item.description }}</p>
      </div>
    </div>
  </template>
  
  <script>
  /**
   * LostItemCard Component
   * 
   * A card component that displays information about a lost item including:
   * - Item image with loading state
   * - Item details (name, category, color, etc.)
   * 
   * Clicking the card navigates to the claim verification page
   * with the item data passed as route query parameters.
   */
   import { collection, addDoc} from 'firebase/firestore';
   import { db } from '../firebase.js';
  export default {
    name: 'LostItemCard',
    
    props: {
      /**
       * The lost item object containing all item details
       * @type {Object}
       * @required
       */
      item: {
        type: Object,
        required: true,
      },
    },
    
    data() {
      return {
        imageUrl: null,
        isLoading: true, // State to track image loading status
      }
    },
    
    mounted() {
      // Initialize the image URL from the item data
      this.imageUrl = this.item.photo || ''
    },
    
    methods: {
      /**
       * Formats the ISO date string to a more readable format
       * @param {string} dateTimeString - ISO format date-time string
       * @return {string} Formatted date-time string
       */
      formatDateTime(dateTimeString) {
        return dateTimeString.replace('T', ' ')
      },
      
      /**
       * Handler for successful image load
       */
      onImageLoad() {
        this.isLoading = false
      },
      
      /**
       * Handler for image load failure
       */
      onImageError() {
        this.isLoading = false
      },
      
      /**
       * Navigates to the claim verification page with item data
       */
      async goToClaimPage() {
        const formDataCopy = { ...this.item }
        const lostItemID = this.$route.query.id

        
        console.log(formDataCopy)

        this.$router.push({
          name: 'verify',
          query: { 
                lostItem: formDataCopy.found_item_id, 
                id:lostItemID
          }
        });


        
        // this.$router.push({
        //   name: 'verify',
        //   query: { 
        //     lostItem: JSON.stringify(formDataCopy), 
        //     id: lostItemID 
        //   },
        // })
      },
    },
  }
  </script>
  
  <style scoped>
  /* Card container */
  .card {
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 0.5rem;
    padding: 1rem;
    width: 19.3125rem;
    height: 27.5rem;
    margin: 1rem;
    cursor: pointer;
    transition:
      transform 0.3s ease,
      box-shadow 0.3s ease;
    will-change: transform;
  }
  
  /* Hover effect for the card */
  .card:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
    z-index: 1;
  }
  
  /* Item image styling */
  .item-image {
    min-height: 13rem;
    max-height: 13rem;
    width: 100%;
    object-fit: contain;
    display: block;
  }
  
  /* Title styling */
  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: black;
  }
  
  /* Text content styling */
  p {
    font-size: 1rem;
    color: #757575;
    line-height: 1.2rem;
  }
  
  /* Loading spinner animation */
  .loading-spinner {
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 3rem;
    height: 3rem;
    border: 4px solid #f3f3f3;
    border-top: 4px solid #3498db;
    border-radius: 50%;
    animation: spin 1s linear infinite;
    z-index: 2;
  }
  
  /* Spinner animation keyframes */
  @keyframes spin {
    0% {
      transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
      transform: translate(-50%, -50%) rotate(360deg);
    }
  }
  </style>