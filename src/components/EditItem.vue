<template>

    <div class = "item">
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
        <!-- <div class="image-container">
            <img v-if="imageUrl" :src="imageUrl" alt="Item Image" />
            <p v-else>Loading image...</p>
        </div> -->
        
        <!-- <p>{{ $route.params.edit_item.name }}</p> -->

        <h3> {{ item.name }}</h3>
        <p>Category: {{ item.category }}</p>
        <p>Colour: {{ item.colour }}</p>
        <p>Brand: {{ item.brand }}</p>
        <p>Location: {{ item.location }}</p>
        <p>Date & Time: {{ item.date_time_lost }}</p>
        <p>Description: {{ item.description }}</p>
        <br>
        <!-- <p>{{ itemId }}</p> -->
        
        
    </div>

</template>

<script>

    import firebaseApp, {storage} from "../../firebase.js";
    import { getFirestore } from "firebase/firestore"
    import { ref, getDownloadURL } from 'firebase/storage';
    import {collection, getDoc, doc, deleteDoc} from "firebase/firestore"
    import 'primeicons/primeicons.css'


    const db = getFirestore(firebaseApp);

    export default {
        props: {
            lost_item_Id: String,
            found_item_Id: String,
        },

        data() {
            return {
                item: 1,
                status : "",
                imageUrl: "",
                showMenu : false,
                // lost_item: 1,// Will store item details, set as 1 if null will wrong idk why
            };
        },

        mounted() {
            this.fetchImage();
        },

        async created() {
            await this.fetchItemDetails();
            await this.fetchItemDetails_lost(); // Fetch item details when component is created
        },

        watch: {
            found_item_Id: "fetchItemDetails", // Fetch new data when itemId changes
            lost_item_Id: "fetchItemDetails_lost"
        },

        methods: {
            async fetchItemDetails() {
                console.log("hmm")
                console.log(this.found_item_Id)
                if (!this.found_item_Id) return; // Ensure itemId is valid

                try {
                    const itemRef = doc(db, "Found_Item", String(this.found_item_Id)); // Reference to Firestore document
                    const docSnap = await getDoc(itemRef);

                    if (docSnap.exists()) {
                        this.item = docSnap.data(); // Update item details
                        this.status = "founder"
                        console.log("Fetched Item Details:", this.item);
                    } else {
                        console.log("No item found for ID:", this.itemId);
                    }
                } catch (error) {
                    console.error("Error fetching item details:", error);
                }
            },

            async fetchItemDetails_lost() {
               
                if (!this.lost_item_Id) return; // Ensure itemId is valid

                try {
                    const itemRef = doc(db, "Lost_Item", String(this.lost_item_Id)); // Reference to Firestore document
                    const docSnap = await getDoc(itemRef);

                    if (docSnap.exists()) {
                        this.item = docSnap.data(); // Update item details
                        this.status = "searcher"
                        console.log("Fetched Item Details:", this.item);
                    } else {
                        console.log("No item found for ID:", this.itemId);
                    }
                } catch (error) {
                    console.error("Error fetching item details:", error);
                }
            },

            async fetchImage() {
                try {
                    const storageRef = ref(storage, 'glasses.jpg'); // Replace with your image path
                    const url = await getDownloadURL(storageRef);
                    this.imageUrl = url;
                } catch (error) {
                    console.error('Error fetching image:', error);
                }
            }
        }
    }

</script>

<style>

</style>