<template>
    <div class="edit-item-box">
      <!-- Back and Undo button controls -->
      <div class="function-buttons">
        <div class="back-button" @click="goBack" :disabled="uploadingImage">
          <i class="pi pi-arrow-left" aria-label="Go back"></i>
        </div>
        <i class="pi pi-undo" id="undo-button" @click="refresh" title="Click this to revert all your changes"></i>
      </div>
  
      <!-- Item image display -->
      <div class="image-container">
        <img 
          v-if="imageUrl" 
          :src="imageUrl" 
          alt="Item Image" 
          @error="handleImageError" 
          class="edit-image"
        />
        <img v-else src="@/assets/NotFoundYet.png" alt="No image available" />
      </div>
  
      <!-- Form inputs section -->
      <div class="inputs">
        <div class="edit-item"> 
          <h2 class="item-name" v-if = "item.category != 'Student Card'">{{ item.name }}</h2>
          <h2 class="item-name" v-else>Student Card</h2>
          
          <!-- Color selection -->
          <p class="field-label">Colour</p> 
          <p class="edit-box">
            <select 
              v-model="item.colour" 
              class="form-input" 
              @change="markAsChanged" 
              :disabled="item.category === 'Student Card'"
            >
              <option value="Red">Red</option>
              <option value="Green">Green</option>
              <option value="Blue">Blue</option>
              <option value="Yellow">Yellow</option>
              <option value="Black">Black</option>
              <option value="White">White</option>
              <option value="Others">Others</option>
            </select>
          </p>
          
          <!-- Brand input -->
          <p class="field-label">Brand</p> 
          <p class="edit-box">
            <input 
              type="text" 
              class="form-input" 
              v-model="item.brand" 
              @input="markAsChanged" 
              :disabled="item.category === 'Student Card'"
            />
          </p>
          
          <!-- Location input -->
          <p class="field-label">Location</p> 
          <p class="edit-box">
            <input 
              type="text" 
              class="form-input" 
              v-model="item.location" 
              @input="markAsChanged" 
            />
          </p>
          
          <!-- Date and time inputs - different based on user status -->
          <p v-if="status === 'founder'" class="field-label">Date & Time</p>
          <p v-if="status === 'founder'" class="edit-box"> 
            <input 
              type="datetime-local" 
              class="form-input" 
              v-model="item.date_time_found" 
              placeholder="Enter Date & Time Found" 
              @input="markAsChanged"
            />
          </p>
          
          <p v-if="status === 'searcher'" class="field-label">Date & Time</p>
          <p v-if="status === 'searcher'" class="edit-box">
            <input 
              type="datetime-local" 
              class="form-input" 
              v-model="item.date_time_lost" 
              placeholder="Enter Date & Time Lost" 
              @input="markAsChanged"
            />
          </p>
          
          <!-- Description textarea -->
          <p class="field-label">Description</p>
          <p class="edit-box">
            <textarea 
              class="form-textarea" 
              v-model="item.description" 
              @input="markAsChanged"
            ></textarea>
          </p>
          <br>
  
          <!-- Image preview section (if a new image is selected) -->
          <div v-if="imagePreview" class="image-preview-container">
            <button @click="removeImage" class="remove-image-btn" aria-label="Remove uploaded image">&#10006;</button>
            <img :src="imagePreview" alt="Uploaded Image" class="image-preview" />
          </div>
          
          <!-- Image upload option (only for founders) -->
          <div v-if="status === 'founder'" class="upload-container">
            <input 
              type="file" 
              @change="handleImageUpload" 
              id="image-upload" 
              accept="image/*"
            />
            <label for="image-upload">
              <img src="@/assets/upload.png" alt="Upload Icon" class="upload-icon" />
              <span class="upload-instruction">{{ uploadInstructionText }}</span>
            </label>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { app, storage } from '../firebase.js';
  import { getFirestore } from 'firebase/firestore';
  import { ref, getDownloadURL, getStorage, deleteObject, uploadBytes } from 'firebase/storage';
  import { getDoc, doc } from 'firebase/firestore';
  import 'primeicons/primeicons.css';
  import { findMatchingLostItems } from '@/components/matchingService.js';
  
  const db = getFirestore(app);
  
  /**
   * @component EditItemForm
   * @description A component that allows users to edit details of lost or found items.
   * It handles different behavior based on whether the user is the finder or the searcher.
   */
  export default {
    name: 'EditItemForm',
    
    props: {
      /**
       * ID of the lost item (if user is a searcher)
       */
      lost_item_Id: String,
      
      /**
       * ID of the found item (if user is a finder)
       */
      found_item_Id: String,
      
      /**
       * Image URL of the item
       */
      image: String,
    },
  
    data() {
      return {
        // Item data that will be populated from Firebase
        item: 1, // Placeholder until data is loaded
        
        // Identifies if the user is a 'founder' or 'searcher'
        status: '',
        
        // URL of the current item image
        imageUrl: '',
        
        // URL for fallback image when loading fails
        failed_image: "",
        
        // Stores the initial state of the item for comparison
        initialItem: null,
        
        // Flag to indicate if the item has been changed
        changed: false,
        
        // Text instruction for image upload
        uploadInstructionText: 'Please attach photo of the item',
        
        // URL preview for newly uploaded image
        imagePreview: null,
        
        // Storage path for the uploaded image
        directory: null,
        
        // Flag to indicate if image is currently being uploaded
        uploadingImage: false
      };
    },
  
    computed: {
      /**
       * Checks if the current item has changes compared to the original
       */
      hasChanges() {
        if (JSON.stringify(this.item) === JSON.stringify(this.initialItem)) {
          this.$emit('noUpdate', false);
        }
      }
    },
  
    mounted() {
      this.fetchImage();
    },
  
    async created() {
      // Load item details when component is created
      await this.fetchItemDetails();
      await this.fetchItemDetails_lost();
      
      // Store initial state for comparison/reset
      this.initialItem = JSON.parse(JSON.stringify(this.item));
      
      // Test matching functionality for specific item
      this.checkMatchingItems();
    },
  
    watch: {
      // Re-fetch data when props change
      found_item_Id: 'fetchItemDetails',
      lost_item_Id: 'fetchItemDetails_lost',
    },
  
    methods: {
      /**
       * Fetches details for a found item from Firestore
       */
      async fetchItemDetails() {
        if (!this.found_item_Id) return;
  
        try {
          const itemRef = doc(db, 'Found Item', String(this.found_item_Id));
          const docSnap = await getDoc(itemRef);
  
          if (docSnap.exists()) {
            this.item = docSnap.data();
            this.status = 'founder';
            this.imageUrl = this.item.photo;
            console.log('Fetched Found Item Details:', this.item);
          } else {
            console.log('No found item with ID:', this.found_item_Id);
          }
        } catch (error) {
          console.error('Error fetching found item details:', error);
        }
      },
  
      /**
       * Fetches details for a lost item from Firestore
       */
      async fetchItemDetails_lost() {
        if (!this.lost_item_Id) return;
  
        try {
          const itemRef = doc(db, 'Lost Item', String(this.lost_item_Id));
          const docSnap = await getDoc(itemRef);
  
          if (docSnap.exists()) {
            this.item = docSnap.data();
            this.status = 'searcher';
            this.imageUrl = this.item.photo;
            console.log('Fetched Lost Item Details:', this.item);
          } else {
            console.log('No lost item with ID:', this.lost_item_Id);
          }
        } catch (error) {
          console.error('Error fetching lost item details:', error);
        }
      },
  
      /**
       * Fetches fallback image for when item image fails to load
       */
      async fetchImage() {
        try {
          const storageRef = ref(storage, 'image_not_found.jpg');
          const url = await getDownloadURL(storageRef);
          this.failed_image = url;
        } catch (error) {
          console.error('Error fetching fallback image:', error);
        }
      },
  
      /**
       * Updates item data and emits event to parent when changes are made
       */
      markAsChanged() {

        // Update item name based on color and category
        if (this.item.category != "Student Card") {
            this.item.name = `${this.item.colour} ${this.item.category}`;
        }
        
        // Check if item has changed from initial state
        this.changed = JSON.stringify(this.item) !== JSON.stringify(this.initialItem);
        
        // If no changes, notify parent component
        if (JSON.stringify(this.item) === JSON.stringify(this.initialItem)) {
          this.$emit('noUpdate', false);
          return;
        }
  
        // Emit event with updated item data when changes are detected
        if (this.changed) {
          this.$emit('changeMade', { ...this.item });
        }
      },
  
      /**
       * Handles image loading errors by using fallback image
       */
      handleImageError() {
        this.imageUrl = this.failed_image;
      },
  
      /**
       * Handles image upload and creates image preview
       * @param {Event} event - File input change event
       */
      async handleImageUpload(event) {
        const file = event.target.files[0];
        if (!file) return;
        
        this.uploadingImage = true;
        this.$emit('uploading', true); // Notify parent component
        this.imagePreview = URL.createObjectURL(file);
  
        try {
          // Create unique file path and upload to Firebase Storage
          const imageFilePath = `found_items/${Date.now()}-${file.name}`;
          const storageReference = ref(storage, imageFilePath);
          const snapshot = await uploadBytes(storageReference, file);
          const url = await getDownloadURL(snapshot.ref);
          
          // Store upload result
          this.imageChangeUrl = url;
          this.directory = imageFilePath;
          
          // Notify parent component of change
          this.$emit('changeMade', {
            ...this.editedData,
            image_change_url: url,
          });
        } catch (error) {
          console.error("Image upload failed:", error);
        } finally {
          this.uploadingImage = false;
          this.$emit('uploading', false, this.directory);
          this.uploadInstructionText = 'Reupload Image';
        }
      },
  
      /**
       * Removes the uploaded image and deletes from storage if needed
       */
      removeImage() {
        if (this.uploadingImage) return;
        
        // Delete image from Firebase Storage if it exists
        if (this.directory) {
          const storage = getStorage();
          const desertRef = ref(storage, this.directory);
          
          deleteObject(desertRef)
            .then(() => {
              console.log('File deleted successfully');
            })
            .catch((error) => {
              console.log('Error deleting file:', error);
            });
        }
        
        // Reset image state
        this.imagePreview = null;
        this.uploadInstructionText = 'Please attach photo of the item';
        this.directory = null;
        
        // Check if item has reverted to original state
        if (JSON.stringify(this.item) === JSON.stringify(this.initialItem)) {
          this.$emit('noUpdate', false);
        }
      },
  
      /**
       * Resets form to initial state
       */
      refresh() {
        // Reset item data to initial state
        Object.assign(this.item, JSON.parse(JSON.stringify(this.initialItem)));
        this.$emit('noUpdate', false);
        this.removeImage();
      },
  
      /**
       * Navigates back to history page with confirmation if changes exist
       */
      goBack() {
        if (JSON.stringify(this.item) !== JSON.stringify(this.initialItem)) {
          if (confirm("Are you sure you want to go back? You will lose all your edits.")) {
            this.removeImage();
            this.$router.push('/history');
          }
        } else {
          this.$router.push('/history');
        }
      },
  
      /**
       * Tests matching functionality for specific items
       */
      checkMatchingItems() {
        if (this.lost_item_Id === "PwMmSomGXQgm0WhrYyXW") {
          const formData = {
            category: this.item.category,
            color: this.item.colour,
            brand: this.item.brand,
            location: this.item.location,
            datetime: this.item.date_time_lost,
            description: this.item.description,
          };
          
          console.log("Testing matching algorithm...");
          console.log(findMatchingLostItems(formData));
        }
      }
    },
  };
  </script>
  
  <style scoped>
  /* Main container styling */
  .edit-item-box {
    position: relative;
    width: 100%;
    margin: 0.44rem;
    background-color: #fff;
    padding-bottom: 0.5rem;
    padding-top: 1rem;
    border: 0.07rem solid #ccc;
    height: auto;
  }
  
  /* Form layout */
  .inputs {
    margin-left: 5rem;
    margin-right: 5rem;
  }
  
  /* Form control styling */
  .form-input,
  .form-textarea,
  .edit-item select {
    width: 100%;
    font-family: 'Inter', sans-serif;
    background-color: rgba(251, 240, 230, 1);
    border-radius: 0.625rem;
    border: none;
    box-sizing: border-box;
    color: #888;
    padding-left: 0.7rem;
  }
  
  /* Input field styling */
  .form-input {
    height: 1.57rem;
    font-size: 1rem;
    line-height: 2;
  }
  
  /* Text area styling */
  .form-textarea {
    height: 10rem;
    font-size: 1rem;
    white-space: pre-wrap;
    resize: none;
    padding-top: 0.5rem;
  }
  
  /* Dropdown styling */
  .edit-item select {
    height: 1.57rem;
    font-size: 1rem;
    line-height: 2;
    padding-left: 0.5rem;
  }
  
  /* Text styling */
  .edit-item p {
    font-family: "Inter", sans-serif;
    margin-top: 0.25rem;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
  }
  
  /* Field label styling */
  .field-label {
    color: black;
    font-weight: bold;
    font-size: 1.3rem;
  }
  
  /* Form field layout */
  .edit-box {
    text-align: center;
  }
  
  /* Item name styling */
  .item-name {
    text-align: center;
  }
  
  /* Image upload container styling */
  .upload-container {
    width: 22rem;
    height: 1.5625rem;
    padding: 0.07rem;
    font-size: 1rem;
    background-color: rgba(251, 240, 230, 1);
    border-radius: 0.625rem;
    line-height: 2;
    border: none;
    box-sizing: border-box;
    margin-left: 1.7rem;
    margin-bottom: 1rem;
  }
  
  /* Upload icon styling */
  .upload-icon {
    margin-left: 0.5rem;
  }
  
  /* Upload instruction text styling */
  .upload-instruction {
    line-height: 2rem;
    color: #888;
    font-size: 0.875rem;
    padding-left: 0.75rem;
    opacity: 0.7;
    font-weight: 400;
    margin-top: 1rem;
    margin-bottom: 1rem;
    align-items: center;
  }
  
  /* Hide file input */
  input[type='file'] {
    display: none;
  }
  
  /* Image preview styling */
  .image-preview-container {
    margin-bottom: 1rem;
  }
  
  .image-preview {
    width: 85%;
    height: auto;
    margin-left: 2rem;
    margin-right: 5.1rem;
    margin-bottom: 1rem;
  }
  
  /* Remove image button styling */
  .remove-image-btn {
    background: none;
    border: none;
    color: red;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.2rem;
    margin-left: 1.7rem;
  }
  
  /* Main item image styling */
  .edit-image {
    width: 100%;
    height: 100%;
    text-align: center;
  }
  
  /* Back button styling */
  .back-button {
    height: 2.125rem;
    width: 2.125rem;
    display: inline-block;
    text-align: center;
    margin-left: 1rem;
  }
  
  .back-button i {
    width: 2.125rem;
    height: 2.125rem;
    color: black;
    font-size: 1.5rem;
    padding-top: 0.2rem;
  }
  
  .back-button i:hover {
    transform: scale(1.1);
    opacity: 0.8;
  }
  
  /* Image container styling */
  .image-container {
    text-align: center;
  }
  
  /* Function buttons container styling */
  .function-buttons {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;
  }
  
  /* Undo button styling */
  .undo-button {
    border-radius: 50%;
    padding: 0.5rem;
    cursor: pointer;
    font-size: 1.5rem;
    margin-right: 1rem;
  }
  
  .undo-button:hover {
    transform: scale(1.1);
  }
  </style>