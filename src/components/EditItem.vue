<template>
    <div class="edit-item-box">
        <div id="function-button">
            <i class="pi pi-undo" id="undo" @click="refresh" title="Click this to revert all your changes"></i>
            <img id="backward-img" src="@/assets/arrow_back.png" alt="Back to Home" @click="goBack" @disabled="!uploadingImage" />
        </div>
        <div class="image-container">
            <img v-if="imageUrl" :src="imageUrl" alt="Item Image" @error="handleImageError" id="edit-image"/>
            <img v-else src="@/assets/NotFoundYet.png" />
        </div>

        <div class="edit-item"> 
            <h2 class="item-name">{{ item.name }}</h2>
            <p class="word" style="font-size: 1.3rem;">Category</p>
            <p class="edit-box">
                <select id="item" v-model="item.category" @change="markAsChanged">
                    <option value="Student Card">Student Card</option>
                    <option value="Bank Card">Bank Card</option>
                    <option value="Waterbottle">Waterbottle</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Stationary">Stationary</option>
                    <option value="Toys">Toys</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Others">Others</option>
                </select>
            </p>
            <p class="word" style="font-size: 1.3rem;">Colour</p> 
            <p class="edit-box">
                <select v-model="item.colour" id="item" @change="markAsChanged">
                    <option value="Red">Red</option>
                    <option value="Green">Green</option>
                    <option value="Blue">Blue</option>
                    <option value="Yellow">Yellow</option>
                    <option value="Black">Black</option>
                    <option value="White">White</option>
                    <option value="Others">Others</option>
                </select>
            </p>
                    
            <p class="word" style="font-size: 1.3rem;">Brand</p> 
            <p class="edit-box"><input type="text" id="item" v-model="item.brand" @input="markAsChanged" /></p>
            <p class="word" style="font-size: 1.3rem;">Location</p> 
            <p class="edit-box"><input type="text" id="item" v-model="item.location" @input="markAsChanged" /></p>
            <p v-if="status == 'founder'" class="word" style="font-size: 1.3rem;">Date & Time</p>
            <p class="edit-box" v-if="status == 'founder'">
                <input type="datetime-local" id="item" v-model="item.date_time_found" placeholder="Enter Date & Time Lost" @input="markAsChanged"/>
            </p>
            <p v-if="status == 'searcher'" class="word" style="font-size: 1.3rem;">Date & Time</p>
            <p class="edit-box" v-if="status == 'searcher'">
                <input type="datetime-local" id="item" v-model="item.date_time_lost" placeholder="Enter Date & Time Lost" @input="markAsChanged"/>
            </p>
            <p class="word" style="font-size: 1.3rem;">Description</p>
            <p class="edit-box"><textarea type="text" id="des" v-model="item.description" @input="markAsChanged"></textarea></p>
            <br>

            <div v-if="imagePreview" id="image-preview-box">
                <button @click="removeImage" class="remove-image-btn">&#10006;</button>
                <img :src="imagePreview" alt="Uploaded Image" id="image-preview" />
            </div>
            <div id="upload-img" v-if="status == 'founder'" style="margin-left: 1.7rem;">
                <input type="file" @change="handleImageUpload" id="default-upload" accept="image/*" style="align-content: center;"/>
                <label for="default-upload">
                    <img src="@/assets/upload.png" alt="Upload Icon" id="upload-icon" />
                    <span id="instruction">{{ instruction }}</span>
                </label>
                <br /><br />
            </div>
        </div>
    </div>
</template>

<script>
import { app, storage } from '../firebase.js'
import { getFirestore } from 'firebase/firestore'
import { ref, getDownloadURL, getStorage, deleteObject, uploadBytes } from 'firebase/storage'
import { collection, getDoc, doc, deleteDoc } from 'firebase/firestore'
import 'primeicons/primeicons.css'
import { findMatchingItems, findMatchingLostItems } from '@/components/matchingService.js'

const db = getFirestore(app)

/**
 * EditItem Component
 * 
 * This component provides an interface for editing lost or found items.
 * It supports different functionalities based on whether the user is the one who lost the item (searcher)
 * or the one who found the item (founder).
 * 
 * Features:
 * - Display and edit item details (category, color, brand, location, date/time, description)
 * - Upload and preview images for found items
 * - Revert changes with an undo button
 * - Navigate back to history page
 * - Track changes to notify parent components
 */
export default {
    props: {
        // Item identifiers
        lost_item_Id: String,
        found_item_Id: String,
        image: String,
    },

    data() {
        return {
            item: 1, // Item details object
            status: '', // 'founder' or 'searcher'
            imageUrl: '', // URL of the current image
            showMenu: false,
            failed_image: "", // Fallback image URL
            initialItem: null, // Original item state for reverting changes
            changed: false, // Flag to track if changes have been made
            initial: false,
            image_change: false,
            change_image: '',
            instruction: 'Please attach photo of the item',
            imagePreview: null, // Preview of the uploaded image
            directory: null, // Storage path for the uploaded image
        }
    },

    computed: {
        // Check if item has changed from original state
        hasChanges() {
            if (JSON.stringify(this.item) == JSON.stringify(this.originalItem)) {
                this.$emit('noUpdate', false);
            }
        }
    },

    // Component lifecycle hooks
    mounted() {
        this.fetchImage() // Fetch fallback image
    },

    async created() {
        await this.fetchItemDetails()
        await this.fetchItemDetails_lost()
        this.initialItem = JSON.parse(JSON.stringify(this.item))
        this.checkForMatches()
    },

    // Watch for changes in props
    watch: {
        found_item_Id: 'fetchItemDetails',
        lost_item_Id: 'fetchItemDetails_lost',
    },

    methods: {
        /**
         * Fetches details for a found item from Firestore
         */
        async fetchItemDetails() {
            if (!this.found_item_Id) return

            try {
                const itemRef = doc(db, 'Found Item', String(this.found_item_Id))
                const docSnap = await getDoc(itemRef)

                if (docSnap.exists()) {
                    this.item = docSnap.data()
                    this.status = 'founder'
                    this.imageUrl = this.item.photo
                    console.log('Fetched Item Details:', this.item)
                } else {
                    console.log('No item found for ID:', this.found_item_Id)
                }
            } catch (error) {
                console.error('Error fetching item details:', error)
            }
        },

        /**
         * Fetches details for a lost item from Firestore
         */
        async fetchItemDetails_lost() {
            if (!this.lost_item_Id) return

            try {
                const itemRef = doc(db, 'Lost Item', String(this.lost_item_Id))
                const docSnap = await getDoc(itemRef)

                if (docSnap.exists()) {
                    this.item = docSnap.data()
                    this.status = 'searcher'
                    this.imageUrl = this.item.photo
                    console.log('Fetched Item Details:', this.item)
                } else {
                    console.log('No item found for ID:', this.lost_item_Id)
                }
            } catch (error) {
                console.error('Error fetching item details:', error)
            }
        },

        /**
         * Fetches the fallback image for when item images fail to load
         */
        async fetchImage() {
            try {
                const storageRef = ref(storage, 'image_not_found.jpg')
                const url = await getDownloadURL(storageRef)
                this.failed_image = url
            } catch (error) {
                console.error('Error fetching image:', error)
            }
        },

        /**
         * Updates the item name and marks item as changed
         * Notifies parent component of changes
         */
        async markAsChanged() {
            this.item.name = `${this.item.colour} ${this.item.category}`
            this.changed = JSON.stringify(this.item) !== JSON.stringify(this.initialItem)
            
            if (JSON.stringify(this.item) == JSON.stringify(this.initialItem)) {
                this.$emit('noUpdate', false);
                return
            }

            // Emit event only when a change is detected
            if (this.changed) {
                this.$emit('changeMade', { ...this.item})
            }
        },

        /**
         * Handles image loading errors by displaying fallback image
         */
        handleImageError(event) {
            this.imageUrl = this.failed_image
        },

        /**
         * Handles image upload process
         * Creates preview and uploads to Firebase storage
         */
        async handleImageUpload(event) {
            var file = event.target.files[0];
            if (!file) return;
            this.uploadingImage = true;
            this.$emit('uploading', true);
            this.imagePreview = URL.createObjectURL(file)

            try {
                var image_file_path = `found_items/${Date.now()}-${file.name}`
                const storageReference = ref(storage, image_file_path)
                const snapshot = await uploadBytes(storageReference, file);
                const url = await getDownloadURL(snapshot.ref);
                this.image_change_url = url;
                this.hasChanges = true;
                this.directory = image_file_path;
                this.$emit('changeMade', {
                    ...this.editedData,
                    image_change_url: url,
                });
            } catch (error) {
                console.error("Image upload failed:", error);
            } finally {
                this.uploadingImage = false;
                this.$emit('uploading', false, image_file_path);
                this.instruction = 'Reupload Image'
            }
        },

        /**
         * Removes the uploaded image from preview and storage
         */
        removeImage() {
            if (this.uploadingImage) {
                return
            }
            if (this.directory) {
                const storage = getStorage();
                const desertRef = ref(storage, this.directory);
                deleteObject(desertRef).then(() => {
                    // File deleted successfully
                }).catch((error) => {
                    console.log(error)
                });
            }
            this.imagePreview = null
            this.instruction = 'Please attach photo of the item'
            this.directory = null
            
            if (JSON.stringify(this.item) == JSON.stringify(this.initialItem)) {
                this.$emit('noUpdate', false);
            }
        },

        /**
         * Reverts all changes made to the item
         */
        refresh() {
            Object.assign(this.item, JSON.parse(JSON.stringify(this.initialItem)));
            this.$emit('noUpdate', false);
            this.removeImage()
        },

        /**
         * Navigates back to history page
         * Confirms with user if there are unsaved changes
         */
        goBack() {
            if (JSON.stringify(this.item) != JSON.stringify(this.initialItem)) {
                if (confirm("Are you sure you want to go back, you will lose all your edit") == true) {
                    this.removeImage()
                    this.$router.push('/history')
                }
            } else {
                this.$router.push('/history')
            }
        },

        /**
         * Checks for matching items in the database
         * Used for suggesting potential matches between lost and found items
         */
        checkForMatches() {
            if (this.lost_item_Id == "PwMmSomGXQgm0WhrYyXW") {
                const formData = {
                    category: this.item.category,
                    color: this.item.colour,
                    brand: this.item.brand,
                    location: this.item.location,
                    datetime: this.item.date_time_lost,
                    description: this.item.description,
                }
                console.log(findMatchingLostItems(formData))
            } 
        }
    },
}
</script>

<style>
.edit-item-box {
    position: relative;
    background-color: white;
    border: 0.07rem;
    width: 25.5rem;
    margin: 0.44rem;
    background-color: #fff;
    padding-right: 5rem;
    padding-left: 5rem;
    padding-bottom: 0.5rem;
    border: 0.07rem solid #ccc;
    height: 42rem;
    padding-top: 1rem;
    overflow-y: scroll
}

.edit-item select {
    width: 22rem;
    height: 1.57rem;
    font-size: 1rem;
    border-radius: 1px;
    font-family: 'Inter';
    background-color: rgba(251, 240, 230, 1);
    border-radius: 0.625rem;
    line-height: 2;
    border: none;
    box-sizing: border-box;
    color: #888;
    padding-left: 0.5rem;
}

.edit-item input {
    width: 22rem;
    height: 1.57rem;
    font-size: 1rem;
    border-radius: 1px;
    font-family: 'Inter';
    background-color: rgba(251, 240, 230, 1);
    border-radius: 0.625rem;
    line-height: 2;
    border: none;
    box-sizing: border-box;
    color: #888;
    padding-left: 0.7rem;
}

.edit-item textarea {
    width: 22rem;
    height: 10rem;
    font-size: 1rem;
    border-radius: 1px;
    font-family: 'Inter';
    background-color: rgba(251, 240, 230, 1);
    border-radius: 0.625rem;
    border: none;
    box-sizing: border-box;
    color: #888;
    padding-left: 0.7rem;
    resize: none;
    padding-top: 0.5rem;
}

.edit-item p {
    font-family: "Inter";
    margin-top: 0.25rem;
    margin-bottom: 0.5rem;
    font-size: 1rem;
    font-weight: 600;
}

#upload-img {
    width: 22rem;
    height: 1.5625rem;
    padding: 0.07rem;
    font-size: 1rem;
    border: 0.07rem solid #ccc;
    border-radius: 0.07rem;
    font-family: 'Inter';
    background-color: rgba(251, 240, 230, 1);
    border-radius: 0.625rem;
    line-height: 2;
    border: none;
    box-sizing: border-box;
    align-content: center;
    margin-left: 1rem;
}

.word {
    margin-left: 2rem;
    color: black;
    font-weight: bold;
    font-size: 100px;
}

#des {
    height: 10rem;  
    white-space: pre-wrap;
}

.edit-box {
    text-align: center;
}

.item-name {
    text-align: center;
}

#upload-icon {
    margin-left: 0.5rem;
}

#instruction {
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

input[type='file'] {
    display: none;
}

#image-preview {
    width: 85%;
    height: 80%;
    margin-left: 2rem;
    margin-right: 5.1rem;
    margin-bottom: 1rem;
}

.remove-image-btn {
    background: none;
    border: none;
    color: red;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.2rem;
    margin-left: 1.7rem;
}

#edit-image {
    width: 100%;
    height: 100%;
    text-align: center;
}

#backward-img {
    width: 2.125rem;
    height: 2.125rem;
    position: absolute;
    top: 0.625rem;
    left: 0.625rem;
    z-index: 1000;
}

#backward-img:hover {
    transform: scale(1.1);
    opacity: 0.8;
}

#image-container {
    text-align: center;
}

#function-button {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 10px;
    width: 100%;
}

#function-button i {
    top: 1.2rem;
    right: 0.3rem;
    margin-top: 0.5rem;
}

#function-button .backward-img {
    margin-right: 20px;
}

#undo {
    position: absolute;
    right: 0.7em;
    transform: translateY(-50%);
    border-radius: 50%;
    padding: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
}

#undo:hover {
    background-color: #e0e0e0;
}
</style>