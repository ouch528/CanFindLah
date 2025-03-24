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
        <p>Category: <input type = "text" id = "item" v-model="item.category"  @input="markAsChanged"/></p>
        <p>Colour: <input type = "text" id = "item" v-model="item.colour"  @input="markAsChanged"/></p>
        <p>Brand: <input type = "text" id = "item" v-model="item.brand"  @input="markAsChanged"/></p>
        <p v-if ="this.status == 'founder'">Location: <input type = "text" id = "item" v-model="item.location"  @input="markAsChanged"/></p>
        <p v-if ="this.status == 'searcher'">Location: <input type = "text" id = "item" v-model="item.location_lost"  @input="markAsChanged"/></p>
        <p>Date & Time: <input type = "text" id = "item" v-model="item.date_time_lost"  @input="markAsChanged"/></p>
        <p>Description: <input type = "text" id = "item" v-model="item.description"  @input="markAsChanged"/></p>
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
            },

            markAsChanged() {
                this.$emit("changeMade", { ...this.item }); // Emit a copy of the updated data
            },
        }
    }

</script>

<style>

.item{
    position: relative;
    background-color: white;
    /* right: 500px; */
    border : 1px;
    max-width: 250px;
    margin: 7px;
    background-color: #fff;
    padding: 30px;
    border: 1px solid #ccc;
    /* box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1); */

    }

</style>