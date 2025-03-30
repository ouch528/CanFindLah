<template>
    <div class="item">
        <!-- <h3>Small tortoise toy</h3>
        <p>Category: Toy</p>
        <p>Colour: Unknown</p>
        <p>Brand: Unknown</p>
        <p>Location: Fair Price, Utown</p>
        <p>Date & Time: 24/02/2025, 7:20pm </p>
        <p>Description: Small Tortoise found outside fairpirce in utown</p>
        <div>
            <p class = "status"> Not Found Yet</p>
            <p class = "you-are">Founder</p>
        </div> -->
        <div class="image-container">
            <img v-if="imageUrl" :src="imageUrl" alt="Item Image" @error="handleImageError" />
            <img v-else :src="failed_image" />
            <!-- <p v-else>Loading image...</p> -->
        </div>

        <!-- <p>{{ $route.params.edit_item.name }}</p> -->

        <h3>{{ item.name }}</h3>
        <p>Category: <br><select id="item" v-model="item.category" @change = "markAsChanged">
                    <option value="Card">Card</option>
                    <option value="Waterbottle">Waterbottle</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Stationary">Stationary</option>
                    <option value="Toys">Toys</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Others">Others</option>
                </select></p>
        <p>Colour: <br><select v-model="item.colour" id="item" @change = "markAsChanged">
                    <option value="Red">Red</option>
                    <option value="Green">Green</option>
                    <option value="Blue">Blue</option>
                    <option value="Yellow">Yellow</option>
                    <option value="Black">Black</option>
                    <option value="White">White</option>
                    <option value="Others">Others</option>
                </select></p>
        <!-- <p v-if="item.colour == 'others' || others == true">
        Enter Colour: <input type="text" v-model="item.colour" @input="markAsChanged" />
        </p> -->
                
        <!-- <p>Colour: <input type="text" id="item" v-model="item.colour" @input="markAsChanged" /></p> -->
        <p>Brand: <br><input type="text" id="item" v-model="item.brand" @input="markAsChanged" /></p>
        <p>Location: <br><input type="text" id="item" v-model="item.location" @input="markAsChanged" /></p>
        <!-- <p>Date & Time: <input type="text" id="item" v-model="item.date_time_lost" @input="markAsChanged" /></p> -->
        <p v-if = "status == 'founder'"> Date & Time:<br> <input type="datetime-local" id="item" v-model="item.date_time_found" placeholder="Enter Date & Time Lost" @input="markAsChanged"/></p>
        <p v-if="status == 'searcher'"> Date & Time:<br> <input type="datetime-local" id="item" v-model="item.date_time_lost" placeholder="Enter Date & Time Lost" @input="markAsChanged"/></p>
        <p>Description:<br> <input type="text" id="item" v-model="item.description" @input="markAsChanged" /></p>
        <!-- <p>{{ itemId }}</p> -->
    </div>
</template>

<script>
import { app, storage } from '../firebase.js'
import { getFirestore } from 'firebase/firestore'
import { ref, getDownloadURL } from 'firebase/storage'
import { collection, getDoc, doc, deleteDoc } from 'firebase/firestore'
import 'primeicons/primeicons.css'

const db = getFirestore(app)

export default {
    props: {
        lost_item_Id: String,
        found_item_Id: String,
        image: String,
    },

    data() {
        return {
            item: 1,
            status: '',
            imageUrl: '',
            showMenu: false,
            failed_image: '',
            initialItem: {}, // Store initial state
            changed: false,
            initial: false,
            test: "",
            others: false
            // lost_item: 1,// Will store item details, set as 1 if null will wrong idk why
        }
    },

    mounted() {
        this.fetchImage()
    },

    async created() {
        await this.fetchItemDetails()
        await this.fetchItemDetails_lost() // Fetch item details when component is created
        this.initialItem = JSON.parse(JSON.stringify(this.item))
    },

    watch: {
        found_item_Id: 'fetchItemDetails', // Fetch new data when itemId changes
        lost_item_Id: 'fetchItemDetails_lost',
        // item: {
        //     handler: function () {
        //         if (this.item == 1) {
        //             return
        //         } else {
        //             this.markAsChanged();
        //         }

        //     },
        //     deep: true, // Watch for deep changes
        // },
    },

    methods: {
        async fetchItemDetails() {
            console.log('hmm')
            console.log(this.found_item_Id)
            if (!this.found_item_Id) return // Ensure itemId is valid

            try {
                const itemRef = doc(db, 'Found Item', String(this.found_item_Id)) // Reference to Firestore document
                const docSnap = await getDoc(itemRef)

                if (docSnap.exists()) {
                    this.item = docSnap.data() // Update item details
                    this.status = 'founder'
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
                    const storageRef = ref(storage, 'still_finding_yet.jpg') // Replace with your image path
                    const url = await getDownloadURL(storageRef)
                    this.item = docSnap.data() // Update item details
                    this.status = 'searcher'
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

        markAsChanged() {
            this.item.name = `${this.item.colour} ${this.item.category}`
            // console.log(this.item)
            this.changed = JSON.stringify(this.item) !== JSON.stringify(this.initialItem)

            // Emit event only when a change is detected
            if (this.changed) {
                this.$emit('changeMade', { ...this.item }) // Emit a copy of the updated data
            }
        },

        handleImageError(event) {
            this.imageUrl = this.failed_image // Fallback image
        },
    },
}
</script>

<style>
.item {
    position: relative;
    background-color: white;
    /* right: 500px; */
    border: 0.07rem;
    max-width: 17rem;
    margin: 0.44rem;
    background-color: #fff;
    padding: 1.88rem;
    border: 0.07rem solid #ccc;
    /* box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1); */
}

select, input {
  width: 200px;  /* Set a fixed width */
  height: 25px;  /* Set a fixed height */
  padding: 1px;  /* Add some padding */
  font-size: 16px;  /* Ensure text size is the same */
  border: 1px solid #ccc;  /* Add a consistent border */
  border-radius: 1px;  /* Optional: Rounded corners */
}
</style>
