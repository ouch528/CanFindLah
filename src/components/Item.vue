<template>
    <div class="history-item">
        <div class="image-container">
            <!-- Show loading spinner if both isLoading is true and imageUrl exists -->
            <div v-if="isLoading && imageUrl" class="loading-spinner"></div>

            <!-- Display the image or fallback image -->
            <img v-if="imageUrl" :src="imageUrl" alt="Item Image" id="item-image" @load="onImageLoad" @error="handleImageError" />
            <img v-else src="@/assets/still_finding_yet.jpg" />

            <router-link to="/edit?status_edit_item=searcher&edit_item_id=YsmFFHlbIil3k4M7W1qj&image=">
                <div class="alert-icon">!</div>
            </router-link>
        </div>

        <h3>{{ item.name }}</h3>
        <p><strong>Category: </strong>{{ item.category }}</p>
        <p><strong>Colour: </strong>{{ item.colour }}</p>
        <p><strong>Brand: </strong>{{ item.brand }}</p>
        <p><strong>Location: </strong>{{ item.location }}</p>
        <p v-if="status == 'founder'"><strong>Date & Time: </strong>{{ item.date_time_found.replace('T', ' ') }}</p>
        <p v-if="status == 'searcher'"><strong>Date & Time: </strong>{{ item.date_time_lost.replace('T', ' ') }}</p>
        <p><strong>Description: </strong>{{ item.description }}</p>
        <br />
        <!-- <p>{{ itemId }}</p> -->
        <div class="boxes">
            <div class="status" :class="{ 'not-found': item.claimed_status === 'Not Found Yet', matched: item.claimed_status === 'Matched', returned: item.claimed_status === 'Returned' }">
                {{ item.claimed_status }}
            </div>
            <div class="you-are founder" v-if="status == 'founder'">Founder</div>
            <div class="you-are searcher" v-if="status == 'searcher'">Searcher</div>
            <div>
                <i class="pi pi-pencil" id="pencil" @click="toggleMenu"></i>

                <div v-if="showMenu" class="action-menu">
                    <button @click="updateItem">Edit</button>
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

export default {
    props: {
        found_item_Id: String,
        lost_item_Id: String,
        user_id: String,
    },

    data() {
        return {
            item: 1,
            status: '',
            imageUrl: '',
            showMenu: false,
            item_id: '',
            failed_image: '',
            isLoading: true,
            // lost_item: 1,// Will store item details, set as 1 if null will wrong idk why
        }
    },

    mounted() {
        this.fetchImage()
    },

    async created() {
        await this.fetchItemDetails()
        await this.fetchItemDetails_lost() // Fetch item details when component is created
        // const storage = getStorage();
        //             console.log(this.found_item_Id)

        //             const docRef = doc(db, 'Found Item', "zY5xtPpDQFuEvQds4UVw")
        //             const docSnap = await getDoc(docRef);
        //             const data = docSnap.data()
        //             const desertRef = ref(storage, "found_items/1743705909082");
        //             console.log(desertRef)
        //             deleteObject(desertRef).then(() => {
        //             // File deleted successfully
        //             }).catch((error) => {
        //             console.log(error)
        //             });
    },

    watch: {
        found_item_Id: 'fetchItemDetails', // Fetch new data when itemId changes
        lost_item_Id: 'fetchItemDetails_lost',
    },

    methods: {
        onImageLoad() {
            this.isLoading = false
        },
        // Called if the image fails to load
        onImageError() {
            this.isLoading = false
        },

        async fetchItemDetails() {
            console.log('hmm')
            if (!this.found_item_Id) return // Ensure itemId is valid

            try {
                const itemRef = doc(db, 'Found Item', String(this.found_item_Id)) // Reference to Firestore document
                const docSnap = await getDoc(itemRef)

                if (docSnap.exists()) {
                    this.item = docSnap.data() // Update item details
                    this.status = 'founder'
                    this.item_id = this.item.found_item_id

                    this.imageUrl = this.item.photo
                    console.log('Fetched Item Details:', this.item)
                } else {
                    console.log('No item found for ID:', this.itemId)
                }
            } catch (error) {
                console.error('Error fetching item details:', error)
            }
        },

        async fetchItemDetails_lost() {
            if (!this.lost_item_Id) return // Ensure itemId is valid

            try {
                const itemRef = doc(db, 'Lost Item', String(this.lost_item_Id)) // Reference to Firestore document
                const docSnap = await getDoc(itemRef)

                if (docSnap.exists()) {
                    this.item = docSnap.data() // Update item details
                    const storageRef = ref(storage, 'still_finding_yet.jpg') // Replace with your image path
                    const url = await getDownloadURL(storageRef)
                    this.status = 'searcher'
                    this.item_id = this.item.lost_item_id
                    if (this.item.claimed_status == 'Not Found Yet') {
                        this.imageUrl = url
                    } else {
                        this.imageUrl = this.item.photo
                    }

                    console.log('Fetched Item Details:', this.item)
                } else {
                    console.log('No item found for ID:', this.itemId)
                }
            } catch (error) {
                console.error('Error fetching item details:', error)
            }
        },

        async fetchImage() {
            try {
                const storageRef = ref(storage, 'image_not_found.jpg') // Replace with your image path
                const url = await getDownloadURL(storageRef)
                this.failed_image = url
            } catch (error) {
                console.error('Error fetching image:', error)
            }
        },

        updateItem() {
            // Implement your update logic here

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
            console.log(this.found_item_Id)
        },

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
                        // console.log(this.item)
                        const docRef = doc(db, 'Lost Item', this.lost_item_Id)
                        const userRef = doc(db, 'History', user_id)

                        await updateDoc(userRef, {
                            lost_item_id_list: arrayRemove(this.lost_item_Id), // Remove the item ID from the array
                        })
                        await deleteDoc(docRef)
                    } else {
                        const storage = getStorage()
                        console.log(this.found_item_Id)

                        const docRef = doc(db, 'Found Item', this.found_item_Id)
                        const docSnap = await getDoc(docRef)
                        const data = docSnap.data()
                        const desertRef = ref(storage, `${data.photo_directory}`)
                        console.log(desertRef)
                        deleteObject(desertRef)
                            .then(() => {
                                // File deleted successfully
                            })
                            .catch((error) => {
                                console.log(error)
                            })
                        const userRef = doc(db, 'History', user_id)
                        await updateDoc(userRef, {
                            found_item_id_list: arrayRemove(this.found_item_Id), // Remove the item ID from the array
                        })
                        console.log('yes')
                        await deleteDoc(docRef)
                    }
                    this.$emit('item-deleted')
                } catch (error) {
                    console.error('Error deleting document: ', error)
                }
            }

            this.showMenu = false // Close menu after action
        },

        toggleMenu() {
            this.showMenu = !this.showMenu
        },

        handleImageError(event) {
            this.imageUrl = this.failed_image // Fallback image
        },
    },

    // methods : {
    //     async fetchItemDetails() {
    //         try {
    //             const docRef = doc(db, 'LostItem', this.itemId);
    //         }
    //     }
    // }

    // display() {
    //    // Create a reference to 'mountains.jpg'
    //     const mountainsRef = ref(storage, 'mountains.jpg');

    //     // Create a reference to 'images/mountains.jpg'
    //     const mountainImagesRef = ref(storage, 'images/mountains.jpg');

    //     // While the file names are the same, the references point to different files
    //     mountainsRef.name === mountainImagesRef.name;           // true
    //     mountainsRef.fullPath === mountainImagesRef.fullPath;   // false
    // },

    // uploadImage(){
    //     let storageRef = firebaseApp.storage().ref("images/" + filename)

    //     uploadTask.on("state_changed" , (snapshot) => {
    //         console.log(snapshot);
    //         percentVal = Math.floor((snapshot.bytesTransferred/snapshot.totalBytes) * 100);
    //         console.log(percentVal);

    //     }, (error) => {
    //         console.log("Error is", error)
    //     },  () => {
    //         uploadTask.snapshot.ref.getDownloadURL().then((url) => {
    //             console.log("URL" , url);

    //         })
    //     })

    // }
}
</script>

<style>
.history-item {
    position: relative;
    background-color: white;
    /* right: 500px; */
    border: 0.0625rem;
    /* max-width: 15.625rem; */
    margin: 0.44rem;
    background-color: #fff;
    padding: 1rem;
    border: 0.0625rem solid #ccc;
    /* box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1); */
    border-radius: 0.5rem;
}

.you-are {
    display: inline;
    padding: 0.5rem 0.5rem; /* Padding inside the boxes */
    border-radius: 0.57rem; /* Rounded corners */
    color: white;
    /* Text color */
    font-family: sans-serif; /* Example font */
    font-size: 1rem;
}

h3 {
    font-family: Arial;
    margin-bottom: 0.5rem;
    font-size: 1.5rem;
}

p {
    font-family: Arial;
    margin-top: 0.25rem; /* Adjust the top margin */
    margin-bottom: 0.25rem;
    color: grey;
    /* display: inline; */
    font-size: 1rem;
}

.boxes {
    display: inline-flex; /* Arrange boxes horizontally */
    align-items: center; /* Vertically align items */
    gap: 0.625rem; /* Space between boxes */
    width: 19rem;
}

.status {
    padding: 0.5rem 0.57rem; /* Padding inside the boxes */
    border-radius: 0.57rem; /* Rounded corners */
    color: black;
    /* Text color */
    font-family: sans-serif; /* Example font */
    /* cursor: pointer; */
    transition: all 0.3s ease-in-out;
}

.status:hover {
    transform: scale(1.05);
}

.searcher {
    background-color: #ff8844; /* Red background */
    /* cursor: pointer; */
    transition: all 0.3s ease-in-out;
}

.searcher:hover {
    transform: scale(1.05);
}

.founder {
    background-color: #4a95df; /* Blue background */
    /* cursor: pointer; */
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
    width: 100%; /* Image takes full width of the container */
    margin-bottom: 0.63rem; /* Space between image and boxes */
    text-align: center;
}

.image-container img {
    /* max-width: 100%;
    height: auto;
    object-fit: contain; */
    /* width: 9.4rem;
    height: 9.4rem; */
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
    background-color: #e0e0e0; /* Slightly darker on hover */
}

.action-menu {
    position: absolute;
    top: 100%; /* Position below the icon */
    right: 0; /* Align to the right */
    background-color: white;
    border: 0.07rem solid #ccc;
    border-radius: 0.32rem;
    padding: 0.5rem;
    z-index: 10;
    box-shadow: 0 0.13rem 0.32rem rgba(0, 0, 0, 0.2); /* Add shadow for depth */
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
    background-color: #e0e0e0; /* Slightly darker on hover */
}

.similar {
    text-align: center;
}

button.update {
    border: none;
}

.row-wrap {
    display: flex;
    justify-content: space-between;
    align-items: center;
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
    width: 3rem; /* Size of the spinner */
    height: 3rem;
    border: 4px solid #f3f3f3; /* Light grey border */
    border-top: 4px solid #3498db; /* Blue color for the spinner */
    border-radius: 50%;
    animation: spin 1s linear infinite; /* Animation for spinning */
    z-index: 2; /* Ensure the spinner is on top */
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
</style>
