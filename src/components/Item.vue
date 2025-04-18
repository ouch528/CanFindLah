<template>
    <div class="history-item">
        <div class="image-container">
            <!-- Show loading spinner if both isLoading is true and imageUrl exists -->
            <div v-if="isLoading && imageUrl" class="loading-spinner"></div>

            <!-- Display the image or fallback image -->
            <img v-if="imageUrl" :src="imageUrl" alt="Item Image" id="item-image" @load="onImageLoad" @error="handleImageError" />
            <img v-else src="@/assets/NotFoundYet.png" />

            <!-- Alert icon for items that have been found but not claimed -->
            <div class="alert-icon" @click="matchPage" v-if="status == 'searcher' && item.found_afterwards == true && item.claimed_status == 'Not Found Yet'">!</div>
        </div>
        <h3>{{ item.name }}</h3>
        <div id="scroll">
            <p><strong>Category: </strong>{{ item.category }}</p>
            <p><strong>Colour: </strong>{{ item.colour }}</p>
            <p><strong>Brand: </strong>{{ item.brand }}</p>
            <p><strong>Location: </strong>{{ item.location }}</p>
            <p v-if="status == 'founder'"><strong>Date & Time: </strong>{{ item.date_time_found.replace('T', ' ') }}</p>
            <p v-if="status == 'searcher'"><strong>Date & Time: </strong>{{ item.date_time_lost.replace('T', ' ') }}</p>
            <p><strong>Description: </strong>{{ item.description }}</p>
        </div>
        <br>
        <div class="boxes">
            <div class="status" :class="{ 'not-found': item.claimed_status === 'Not Found Yet', matched: item.claimed_status === 'Matched', returned: item.claimed_status === 'Returned' }">
                {{ item.claimed_status }}
            </div>
            <div class="you-are founder" v-if="status == 'founder'">Founder</div>
            <div class="you-are searcher" v-if="status == 'searcher'">Searcher</div>
            <div>
                <i class="pi pi-pencil" id="pencil" @click="toggleMenu"></i>

                <div v-if="showMenu" class="action-menu">
                    <button @click="updateItem" v-if="status == 'searcher'">Edit</button>
                    <button @click="deleteItem">Delete</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { app, storage } from '../firebase.js'
import { getFirestore } from 'firebase/firestore'
import { ref, getDownloadURL, getStorage, deleteObject } from 'firebase/storage'
import { collection, getDoc, doc, deleteDoc, updateDoc, arrayRemove } from 'firebase/firestore'
import 'primeicons/primeicons.css'
import { useUserStore } from '@/stores/user-store'

const db = getFirestore(app)

/**
 * HistoryItem Component
 * 
 * This component displays an individual lost or found item in the user's history.
 * It provides functionality to view item details, update status, edit, and delete items.
 * 
 * Features:
 * - Display item details including image, category, color, location, and description
 * - Show item status (Not Found Yet, Matched, Returned)
 * - Allow editing of items for searchers
 * - Allow deletion of items with confirmation
 * - Notification indicator for matched items
 * - Navigate to matching page for lost items that have been found
 */
export default {
    props: {
        found_item_Id: String,  // ID of found item (if applicable)
        lost_item_Id: String,   // ID of lost item (if applicable)
        user_id: String,        // Current user ID
    },

    data() {
        return {
            item: 1,             // Item details
            status: '',          // 'founder' or 'searcher'
            imageUrl: '',        // URL of item image
            showMenu: false,     // Controls action menu visibility
            item_id: '',         // Item ID based on status
            failed_image: '',    // Fallback image URL
            isLoading: true,     // Image loading state
        }
    },

    mounted() {
        this.fetchImage() // Fetch fallback image on component mount
    },

    async created() {
        await this.fetchItemDetails()
        await this.fetchItemDetails_lost()
    },

    watch: {
        found_item_Id: 'fetchItemDetails',     // Watch for changes to props
        lost_item_Id: 'fetchItemDetails_lost',
    },

    methods: {
        /**
         * Handle image load completion
         */
        onImageLoad() {
            this.isLoading = false
        },

        /**
         * Handle image loading error
         */
        onImageError() {
            this.isLoading = false
        },

        /**
         * Fetch details for a found item from Firestore
         */
        async fetchItemDetails() {
            if (!this.found_item_Id) return

            try {
                const itemRef = doc(db, 'Found Item', String(this.found_item_Id))
                const docSnap = await getDoc(itemRef)

                if (docSnap.exists()) {
                    this.item = docSnap.data()
                    this.status = 'founder'
                    this.item_id = this.item.found_item_id
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
         * Fetch details for a lost item from Firestore
         */
        async fetchItemDetails_lost() {
            if (!this.lost_item_Id) return

            try {
                const itemRef = doc(db, 'Lost Item', String(this.lost_item_Id))
                const docSnap = await getDoc(itemRef)

                if (docSnap.exists()) {
                    this.item = docSnap.data()
                    const storageRef = ref(storage, 'still_finding_yet.jpg')
                    const url = await getDownloadURL(storageRef)
                    this.status = 'searcher'
                    this.item_id = this.item.lost_item_id
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
         * Fetch the fallback image for when item images fail to load
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
         * Navigate to edit item page
         * Prevents editing of matched or returned items
         */
        updateItem() {
            this.showMenu = false // Close menu after action

            if (this.item.claimed_status == 'Returned') {
                alert('You cannot edit a returned item')
                return
            }

            if (this.item.claimed_status == 'Matched') {
                alert('You cannot edit a matched item')
                return
            }
            alert('Edit item clicked')
            if (this.status == 'searcher') {
                this.$router.push({
                    name: 'edit_item',
                    query: {
                        status_edit_item: this.status,
                        edit_item_id: this.lost_item_Id,
                        image: '',
                    },
                })
            } else {
                this.$router.push({
                    name: 'edit_item',
                    query: {
                        status_edit_item: this.status,
                        edit_item_id: this.found_item_Id,
                        image: this.imageUrl,
                    },
                })
            }
        },

        /**
         * Delete an item with confirmation
         * Prevents deletion of matched items
         * Removes item from database and user's history
         */
        async deleteItem() {
            if (this.item.claimed_status == 'Matched') {
                alert('You cannot delete a Matched Item')
                return
            }
            if (confirm('Are you sure you want to delete this item?') == true) {
                try {
                    alert('Item Deleted')
                    const userStore = useUserStore()
                    const user_id = userStore.userId
                    
                    if (this.status == 'searcher') {
                        // Handle lost item deletion
                        const docRef = doc(db, 'Lost Item', this.lost_item_Id)
                        const userRef = doc(db, 'History', user_id)

                        await updateDoc(userRef, {
                            lost_item_id_list: arrayRemove(this.lost_item_Id),
                        })
                        await deleteDoc(docRef)
                    } else {
                        // Handle found item deletion (including image)
                        const storage = getStorage()
                        const docRef = doc(db, 'Found Item', this.found_item_Id)
                        const docSnap = await getDoc(docRef)
                        const data = docSnap.data()
                        const desertRef = ref(storage, `${data.photo_directory}`)
                        
                        deleteObject(desertRef)
                            .then(() => {
                                // File deleted successfully
                            })
                            .catch((error) => {
                                console.log(error)
                            })
                            
                        const userRef = doc(db, 'History', user_id)
                        await updateDoc(userRef, {
                            found_item_id_list: arrayRemove(this.found_item_Id),
                        })
                        await deleteDoc(docRef)
                    }
                    this.$emit('item-deleted')
                } catch (error) {
                    console.error('Error deleting document: ', error)
                }
            }

            this.showMenu = false // Close menu after action
        },

        /**
         * Toggle action menu visibility
         */
        toggleMenu() {
            this.showMenu = !this.showMenu
        },

        /**
         * Handle image loading errors by displaying fallback image
         */
        handleImageError(event) {
            this.imageUrl = this.failed_image
        },

        /**
         * Navigate to matching page with item details
         * Used when alert icon is clicked
         */
        matchPage() {
            const formDataCopy = {
                category: this.item.category,
                color: this.item.colour,
                brand: this.item.brand,
                location: this.item.location,
                datetime: this.item.date_time_lost,
                description: this.item.description,
            }
            this.$router.push({
                name: 'matching',
                query: { lostItem: JSON.stringify(formDataCopy), id: this.lost_item_Id },
            })
        }
    },
}
</script>

<style>
.history-item {
    position: relative;
    background-color: white;
    border: 0.0625rem;
    margin: 0.44rem;
    background-color: #fff;
    padding: 1rem;
    border: 0.0625rem solid #ccc;
    border-radius: 0.5rem;
    flex-direction: column;
    height: 30.625rem;
    display: flex;
}

.you-are {
    display: inline;
    padding: 0.5rem 0.5rem;
    border-radius: 0.57rem;
    color: white;
    font-family: sans-serif;
    font-size: 1rem;
}

h3 {
    font-family: Arial;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
}

p {
    font-family: Arial;
    margin-top: 0.25rem;
    margin-bottom: 0.25rem;
    color: grey;
    font-size: 1rem;
}

.boxes {
    display: inline-flex;
    align-items: center;
    gap: 0.625rem;
    width: 19rem;
    margin-top: auto;
}

.status {
    padding: 0.5rem 0.57rem;
    border-radius: 0.57rem;
    color: black;
    font-family: sans-serif;
    transition: all 0.3s ease-in-out;
}

.status:hover {
    transform: scale(1.05);
}

.searcher {
    background-color: #ff8844;
    transition: all 0.3s ease-in-out;
}

.searcher:hover {
    transform: scale(1.05);
}

.founder {
    background-color: #4a95df;
    transition: all 0.3s ease-in-out;
}

.founder:hover {
    transform: scale(1.05);
}

.not-found {
    background-color: #ff836d;
}

.matched {
    background-color: #ffdd00;
}

.returned {
    background-color: #73e853;
}

.image-container {
    width: 100%;
    margin-bottom: 0.63rem;
    text-align: center;
}

.image-container img {
    min-height: 13rem;
    max-height: 13rem;
    width: 100%;
    object-fit: contain;
    display: block;
}

#pencil {
    position: absolute;
    right: 0.7em;
    transform: translateY(-50%);
    border-radius: 50%;
    padding: 0.5rem;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
}

#pencil:hover {
    background-color: #e0e0e0;
}

.action-menu {
    position: absolute;
    top: 100%;
    right: 0;
    background-color: white;
    border: 0.07rem solid #ccc;
    border-radius: 0.32rem;
    padding: 0.5rem;
    z-index: 10;
    box-shadow: 0 0.13rem 0.32rem rgba(0, 0, 0, 0.2);
}

.action-menu button {
    display: block;
    width: 100%;
    padding: 0.375rem 0.625rem;
    margin-bottom: 0.25rem;
    border: none;
    background-color: #f0f0f0;
    border-radius: 0.1875rem;
    cursor: pointer;
    font-size: 0.88rem;
}

.action-menu button:hover {
    background-color: #e0e0e0;
}

.alert-icon {
    position: absolute;
    top: 0.5rem;
    right: 0.5rem;
    background-color: red;
    color: white;
    font-weight: bold;
    border-radius: 50%;
    padding: 0.3rem 0.6rem;
    font-size: 1rem;
    z-index: 5;
    box-shadow: 0 0 0.32rem rgba(0, 0, 0, 0.2);
    cursor: pointer;
    transition: all 0.3s ease-in-out;
}

.alert-icon:hover {
    transform: scale(1.3);
}

#item-image {
    min-height: 13rem;
    max-height: 13rem;
    width: 100%;
    object-fit: contain;
    display: block;
}

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

/* Keyframes for spinning animation */
@keyframes spin {
    0% {
        transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}

#scroll {
    max-height: 10.625rem;
    overflow-y: auto;
}
</style>