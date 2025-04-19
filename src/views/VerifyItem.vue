<template>
    <h2 id="header">Verify Item</h2>
    <div class="container">
      <div class="claim-item card">
        <!-- Item image with fallback -->
        <img 
          v-if="item.photo" 
          :src="item.photo" 
          :alt="item.name" 
          class="item-image" 
        />
        <img 
          v-else 
          src="@/assets/image_not_found.png" 
          :alt="item.name" 
          class="item-image" 
        />
        
        <!-- Close button -->
        <img 
          src="@/assets/cross.png" 
          class="close-icon" 
          @click="goBack" 
          alt="Close" 
        />
  
        <!-- Item details -->
        <div class="card-content">
          <h3>{{ item.name }}</h3>
          <p><strong>Category:</strong> {{ item.category }}</p>
          <p><strong>Colour:</strong> {{ item.colour }}</p>
          <p><strong>Brand:</strong> {{ item.brand }}</p>
          <p><strong>Location:</strong> {{ item.location }}</p>
          <p><strong>Date & Time Found:</strong> {{ item.date_time_found }}</p>
          <p><strong>Description:</strong> {{ item.description }}</p>
  
          <button class="claim-button" @click="verifyItem">This Item is Mine</button>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore'
  import { db, auth } from '../firebase.js'
  import { onAuthStateChanged } from 'firebase/auth'
  
  /**
   * VerifyItem Component
   * 
   * This component allows users to claim a found item that matches their lost item report.
   * It displays the details of the found item and facilitates the claiming process.
   */
  export default {
    name: 'VerifyItem',
    
    data() {
      return {
        item: null,         // Stores the found item details
        currentUserID: '',  // Current user's ID (searcher)
      }
    },
    
    created() {
      // Initialize the component by extracting data from route and setting up user authentication
      this.initializeComponent();
    },
    
    methods: {
      /**
       * Initialize component by extracting route data and authenticating user
       */
      initializeComponent() {
        // Parse the found item data from URL query parameters
        const lostItemData = this.$route.query.lostItem;
        if (lostItemData) {
          this.item = JSON.parse(lostItemData);
        }
  
        // Get the current authenticated user's ID
        onAuthStateChanged(auth, async (user) => {
          if (user) {
            await this.fetchUserData(user.uid);
          }
        });
      },
  
      /**
       * Fetch user data from Firestore
       * @param {string} uid - User ID from Firebase Authentication
       */
      async fetchUserData(uid) {
        const userRef = doc(db, 'users', uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          // Use the userID from the document or fallback to auth uid
          this.currentUserID = userSnap.data().userID || uid;
        }
      },
  
      /**
       * Navigate back to the previous page
       */
      goBack() {
        this.$router.go(-1);
      },
  
      /**
       * Process the item verification when user claims an item
       * Links lost and found items and initiates conversation between finder and searcher
       */
      async verifyItem() {
        const foundItemId = this.item.id;
        const lostItemId = this.$route.query.id;
  
        console.log('Found Item ID:', foundItemId);
        console.log('Lost Item ID:', lostItemId);
        console.log('Current User ID (Searcher):', this.currentUserID);
  
        try {
          // Get the found item details
          const foundItemRef = doc(db, 'Found Item', foundItemId);
          const foundItemDoc = await getDoc(foundItemRef);
          if (!foundItemDoc.exists()) {
            throw new Error('Found item not found.');
          }
          const foundItemDetail = foundItemDoc.data();
  
          // Check if the item is already claimed
          if (foundItemDetail.claimed_status !== 'Not Found Yet') {
            alert('This item has already been matched.');
            return;
          }
  
          // Verify the lost item exists
          const lostItemRef = doc(db, 'Lost Item', lostItemId);
          const lostItemDoc = await getDoc(lostItemRef);
          if (!lostItemDoc.exists()) {
            throw new Error('Lost item not found.');
          }
  
          // Get the founder's user ID
          const founderID = foundItemDetail.reporter_id;
          if (!founderID) {
            throw new Error('Founder user ID not found in Found Item.');
          }
          console.log('Founder ID:', founderID);
  
          // Update both found and lost item statuses to "Matched"
          await this.updateItemStatuses(foundItemRef, lostItemRef, foundItemDetail);
  
          // Initialize conversation between searcher and founder
          await this.initializeConversation(founderID, foundItemId, lostItemId);
  
          // Show success message and navigate to Messages
          alert(`You have claimed the item: ${this.item.name}`);
          this.navigateToMessages(founderID, foundItemId);
        } catch (err) {
          console.error('Error verifying item:', err);
          alert('An error occurred while processing your claim.');
        }
      },
  
      /**
       * Update the status of both the found and lost items
       * @param {Object} foundItemRef - Reference to the found item document
       * @param {Object} lostItemRef - Reference to the lost item document
       * @param {Object} foundItemDetail - Found item document data
       */
      async updateItemStatuses(foundItemRef, lostItemRef, foundItemDetail) {
        await updateDoc(foundItemRef, { claimed_status: 'Matched' });
        await updateDoc(lostItemRef, { 
          claimed_status: 'Matched', 
          photo: foundItemDetail.photo, 
          found_afterwards: false 
        });
      },
  
      /**
       * Initialize or retrieve conversation between searcher and founder
       * @param {string} founderID - User ID of the founder
       * @param {string} foundItemId - ID of the found item
       * @param {string} lostItemId - ID of the lost item
       */
      async initializeConversation(founderID, foundItemId, lostItemId) {
        // Create a consistent conversation ID
        const userIds = [this.currentUserID, founderID].sort();
        const conversationId = `${userIds[0]}-${userIds[1]}-${foundItemId}`;
        const conversationRef = doc(db, 'conversations', conversationId);
        const snap = await getDoc(conversationRef);
  
        // Create conversation document if it doesn't exist
        if (!snap.exists()) {
          await setDoc(conversationRef, {
            roles: {
              searcher: this.currentUserID,
              founder: founderID,
            },
            createdAt: serverTimestamp(),
            itemStatus: 'Matched',
            lostItemId: lostItemId,
            foundItemId: foundItemId,
            Notified: false,
          });
        }
        
        return conversationId;
      },
  
      /**
       * Navigate to the Messages page with appropriate parameters
       * @param {string} founderID - User ID of the founder
       * @param {string} foundItemId - ID of the found item
       */
      navigateToMessages(founderID, foundItemId) {
        const userIds = [this.currentUserID, founderID].sort();
        const conversationId = `${userIds[0]}-${userIds[1]}-${foundItemId}`;
        
        this.$router.push({
          name: 'Messages',
          query: {
            conversationId: conversationId,
            partnerID: founderID,
          },
        });
      }
    }
  }
  </script>
  
  <style scoped>
  #header {
    font-size: 3rem;
    color: #684545;
    text-align: center;
  }
  
  .container {
    display: flex;
    align-items: center;
    justify-content: center;
  }
  
  .card {
    position: relative;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 0.5rem;
    padding: 1rem;
    width: 30rem;
    height: 36.5rem;
    margin: 1rem;
  }
  
  .item-image {
    min-height: 17rem;
    max-height: 17rem;
    object-fit: contain;
    display: block;
    margin-top: 0.5rem;
    margin-left: 1.5rem;
    margin-right: 1.5rem;
  }
  
  .card-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-left: 1.5rem;
    margin-right: 1.5rem;
    margin-top: 1rem;
  }
  
  h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: black;
  }
  
  p {
    font-size: 1rem;
    color: #757575;
    line-height: 1.2rem;
  }
  
  .claim-button {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background-color: #378f00;
    color: white;
    font-size: 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    width: 50%;
    display: flex;
    justify-content: center;
    margin-left: auto;
    margin-right: auto;
  }
  
  .claim-button:hover {
    background-color: #2d7500;
  }
  
  .close-icon {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.5rem;
    color: #888;
    cursor: pointer;
    transition: color 0.3s ease;
    z-index: 10;
  }
  
  .close-icon:hover {
    color: #333;
  }
  </style>