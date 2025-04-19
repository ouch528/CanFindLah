<template>
    <div class="edit-item-container">
      <!-- Page header -->
      <div class="page-header">
        <h1>Edit This Item</h1>
        <h3>You are {{ status_edit_item }}</h3>
      </div>
      
      <!-- Edit item form component - conditionally rendered based on user role -->
      <div class="edit-form-container">
        <EditItem 
          v-if="status_edit_item === 'searcher'"
          :lost_item_Id="lost_item_Id" 
          :image="imageUrl" 
          @changeMade="handleEdit" 
          @uploading="handleUploading" 
          @noUpdate="noUpdate"
          class="edit-item"
        />
        <EditItem 
          v-if="status_edit_item === 'founder'"
          :found_item_Id="found_item_Id" 
          :image="imageUrl" 
          @changeMade="handleEdit" 
          @uploading="handleUploading" 
          @noUpdate="noUpdate"
          class="edit-item" 
        />
      </div>
  
      <!-- Action buttons -->
      <div class="action-buttons">
        <button 
          :disabled="!hasChanges || uploadingImage" 
          @click="uploadChanges" 
          class="btn primary"
        >
          Edit Item
        </button>
      </div>
    </div>
  </template>
  
  <script>
  import { app, storage } from '../firebase.js';
  import { getFirestore } from 'firebase/firestore';
  import { ref, getDownloadURL, getStorage, deleteObject } from 'firebase/storage';
  import { collection, getDoc, doc, deleteDoc, setDoc, updateDoc, addDoc } from 'firebase/firestore';
  import { findMatchingLostItems } from '@/components/matchingService.js';
  import 'primeicons/primeicons.css';
  import EditItem from '@/components/EditItem.vue';
  
  const db = getFirestore(app);
  
  /**
   * Edit Item Page Component
   * 
   * A page component for editing lost or found items.
   * Supports different functionality based on user role (searcher/founder).
   * 
   * Route query parameters:
   * - edit_item_id: ID of the item to edit
   * - status_edit_item: User role ('searcher' or 'founder')
   * - image: URL of the item image
   */
  export default {
    name: 'EditItemPage',
    
    components: {
      EditItem,
    },
  
    data() {
      return {
        lost_item_Id: this.$route.query.edit_item_id,
        found_item_Id: this.$route.query.edit_item_id,
        status_edit_item: this.$route.query.status_edit_item,
        imageUrl: this.$route.query.image,
        editedData: null,         // Holds updated item data from EditItem component
        edited_image: null,       // Holds updated image URL
        hasChanges: false,        // Tracks if any changes were made
        uploadingImage: false,    // Tracks if an image is currently uploading
        image_file_path: ""       // Storage path for the uploaded image
      };
    },
  
    methods: {
      /**
       * Handles edited data coming from the EditItem child component
       * @param {Object} updatedItem - Updated item data
       */
      handleEdit(updatedItem) {
        this.editedData = updatedItem;
        this.edited_image = updatedItem.image_change_url;
        this.hasChanges = true;
      },
  
      /**
       * Uploads changes to Firestore when the Edit Item button is clicked
       */
      async uploadChanges() {
        if (confirm("Are you sure you want to edit this item?")) {
          // Create a common form object for both searcher and founder
          const form = {
            category: this.editedData.category,
            color: this.editedData.colour,
            brand: this.editedData.brand,
            location: this.editedData.location,
            description: this.editedData.description,
          };
  
          // Handle lost item edit (searcher)
          if (this.editedData && this.status_edit_item === 'searcher') {
            try {
              form["datetime"] = this.editedData.date_time_lost;
              const docRef = doc(db, 'Lost Item', this.lost_item_Id);
              
              await setDoc(docRef, this.editedData, { merge: true });
              
              this.hasChanges = false;
              this.editedData = null;
              alert('Item edited successfully!');
              
              const lostItemRef = await addDoc(collection(db, 'tempMatchingRequests'), {
                lostItem: JSON.stringify(form), 
                timestamp: new Date()
                });

                this.$router.push({
                name: 'matching',
                query: { lostItem: lostItemRef.id,
                        id: this.lost_item_Id,
                        
                }
                });
              // Navigate to matching page with the updated item
            //   this.$router.push({
            //     name: 'matching',
            //     query: { lostItem: JSON.stringify(form), id: this.lost_item_Id },
            //   });
            } catch (error) {
              console.error('Error uploading data:', error);
            }
          } 
          // Handle found item edit (founder)
          else if (this.editedData && this.status_edit_item === 'founder') {
            try {
              form["datetime"] = this.editedData.date_time_found;
              const docRef = doc(db, 'Found Item', this.found_item_Id);
              
              // Update document with or without new image
              if (this.edited_image) {
                await setDoc(docRef, {
                  ...this.editedData, 
                  photo: this.edited_image, 
                  photo_directory: this.image_file_path
                }, { merge: true });
              } else {
                await setDoc(docRef, {...this.editedData}, { merge: true });
              }
              
              // Find and update matching lost items
              const itemArray = await findMatchingLostItems(form);
              await updateDoc(docRef, {
                similar_item: itemArray
              });
              
              this.hasChanges = false;
              this.editedData = null;
              alert('Item edited successfully!');
              this.$router.push('/history');
            } catch (error) {
              console.error('Error uploading data:', error);
            }
          }
        }
      },
  
      /**
       * Navigation handler for back button (currently unused but retained for future use)
       */
      async goBack() {
        this.$router.push('/history');
        this.edited_image = null;
        
        // Delete uploaded image if user navigates away without saving
        if (this.image_file_path) {
          const storage = getStorage();
          const desertRef = ref(storage, this.image_file_path);
          
          deleteObject(desertRef).then(() => {
            // File deleted successfully
          }).catch((error) => {
            console.log(error);
          });
        }
      },
  
      /**
       * Updates image upload status from child component
       * @param {Boolean} isUploading - Whether an image is currently uploading
       * @param {String} directory - Storage path of the uploaded image
       */
      handleUploading(isUploading, directory) {
        this.uploadingImage = isUploading;
        if (!this.uploadingImage) {
          this.hasChanges = true;
        }
        this.image_file_path = directory;
      },
  
      /**
       * Resets form state when no updates are made
       */
      noUpdate() {
        this.hasChanges = false;
        this.uploadingImage = false;
      }
    }
  };
  </script>
  
  <style scoped>
  /* Container for the entire page */
  .edit-item-container {
    overflow: auto;
  }
  
  /* Header section styling */
  .page-header {
    text-align: center;
  }
  
  /* Container for the edit form */
  .edit-form-container {
    display: flex;
    justify-content: center;
  }
  
  /* Button container */
  .action-buttons {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
  }
  
  /* Button styling */
  .btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
  }
  
  /* Primary button - orange for edit action */
  .primary {
    background-color: #ff8844;
    color: black;
  }
  
  /* Disabled button styling */
  .primary:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    color: white;
  }
  
  /* Secondary button - light gray (unused but retained) */
  .secondary {
    background-color: #f8f9fa;
    color: black;
    border: 0.07rem solid #ccc;
  }
  
  /* Hover effect for buttons */
  .btn:hover {
    transform: scale(1.05);
  }
  
  /* Edit item component container */
  .edit-item {
    max-width: 500px;
    border-radius: 1rem;
  }
  </style>