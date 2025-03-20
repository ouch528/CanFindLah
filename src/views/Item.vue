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
        <div class="image-container">
            <img v-if="imageUrl" :src="imageUrl" alt="Item Image" />
            <p v-else>Loading image...</p>
        </div>

        <h3> {{ item.name }}</h3>
        <p>Category: {{ item.category }}</p>
        <p>Colour: {{ item.colour }}</p>
        <p>Brand: {{ item.brand }}</p>
        <p>Location: {{ item.location }}</p>
        <p>Date & Time: {{ item.date_time_lost }}</p>
        <p>Description: {{ item.description }}</p>
        <br>
        <!-- <p>{{ itemId }}</p> -->
        <div class = "boxes">
            <div class="status" :class=" { 'not-found': item.claimed_status === 'Not Found Yet', 'matched': item.claimed_status === 'Matched', 
            'returned': item.claimed_status === 'Returned' }">
                {{ item.claimed_status }}
            </div>
            <div class = "you-are founder" v-if = "status == 'founder'">Founder </div>
            <div class = "you-are searcher" v-if = "status == 'searcher'">Searcher</div>
            <div>
                <i class = "pi pi-pencil" id = "pencil"></i>
            </div>
        </div>
        
        
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
            found_item_Id : String,
            lost_item_Id : String,
        },

        data() {
            return {
                item: 1,
                status : "",
                imageUrl: ""
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
                // console.log("hmm")
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


        }

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

    .item{
        position: relative;
        background-color: white;
        /* right: 500px; */
        border : 1px;
        max-width: 250px;
        margin: 7px;
        background-color: #fff;
        padding: 20px;
        border: 1px solid #ccc;
        /* box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1); */

    }

    .you-are {
        display: inline;
        padding: 8px 7px; /* Padding inside the boxes */
        border-radius: 9px; /* Rounded corners */
        color: white;
         /* Text color */
        font-family: sans-serif; /* Example font */
    }

    h3 {
        font-family: Arial;
        margin-bottom: 8px;
    }

    p{
        font-family: Arial;
        margin-top: 4px;    /* Adjust the top margin */
        margin-bottom: 4px;
        color: grey;
        /* display: inline; */
    }

    h5 {
        font-family: Arial;
        text-align: center;
        color: grey;
    }

    .boxes {
        display: inline-flex; /* Arrange boxes horizontally */
        align-items: center; /* Vertically align items */
        gap: 10px; /* Space between boxes */

    }

    

    .status {
        padding: 8px 9px; /* Padding inside the boxes */
        border-radius: 9px; /* Rounded corners */
        color: black;
         /* Text color */
        font-family: sans-serif; /* Example font */
    }

    .searcher {
        background-color: #ff8844; /* Red background */
    }

    .founder {
        background-color: #4A95Df; /* Blue background */
    }

    .not-found{
        background-color: #ff836d
    }

    .matched{
        background-color: #ffdd00;
    }

    .returned{
        background-color: #73E853;
    }

    .image-container {
        width: 100%; /* Image takes full width of the container */
        margin-bottom: 10px; /* Space between image and boxes */
        text-align: center;
    }

    .image-container img {
        display: inline-block; /* Allow centering with text-align */
        max-width: 50%; /* Make image responsive */
        height: 120%;
        border-radius: 5px; /* Rounded corners for image */
    }

    #pencil {
        position: absolute;
        right: 0.5em;;
        transform: translateY(-50%);
    }


    

</style>