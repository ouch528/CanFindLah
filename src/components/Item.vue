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
            <img v-if="imageUrl" :src="imageUrl" alt="Item Image" @error="handleImageError"/>
            <img v-else :src = failed_image>
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
                <i class = "pi pi-pencil" id = "pencil" @click="toggleMenu"></i>

                <div v-if="showMenu" class="action-menu">
                    <button @click="updateItem">Update</button>
                    <button @click="deleteItem">Delete</button>
                </div>
            </div>
        </div>
        
        
    </div>

    

</template>

<script>

    import firebaseApp, {storage} from "../../firebase.js";
    import { getFirestore } from "firebase/firestore"
    import { ref, getDownloadURL } from 'firebase/storage';
    import {collection, getDoc, doc, deleteDoc, updateDoc, arrayRemove} from "firebase/firestore"
    import 'primeicons/primeicons.css'


    const db = getFirestore(firebaseApp);

    export default {

        props: {
            found_item_Id : String,
            lost_item_Id : String,
            user_id: String
        },

        data() {
            return {
                item: 1,
                status : "",
                imageUrl: "",
                showMenu : false,
                item_id: "",
                failed_image:"",
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
                if (!this.found_item_Id) return; // Ensure itemId is valid

                try {
                    const itemRef = doc(db, "Found Item", String(this.found_item_Id)); // Reference to Firestore document
                    const docSnap = await getDoc(itemRef);

                    if (docSnap.exists()) {
                        this.item = docSnap.data(); // Update item details
                        this.status = "founder"
                        this.item_id = this.item.found_item_id

                        
                        this.imageUrl = this.item.photo
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
                    const itemRef = doc(db, "Lost Item", String(this.lost_item_Id)); // Reference to Firestore document
                    const docSnap = await getDoc(itemRef);

                    if (docSnap.exists()) {
                        this.item = docSnap.data(); // Update item details
                        const storageRef = ref(storage, 'still_finding_yet.jpg'); // Replace with your image path
                        const url = await getDownloadURL(storageRef);
                        this.status = "searcher"
                        this.item_id = this.item.lost_item_id
                        if (this.item.claimed_status == "Not Found Yet") {
                            this.imageUrl = url
                        } else {
                            this.imageUrl = this.item.photo
                        }
                        
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
                    
                    const storageRef = ref(storage, 'image_not_found.jpg'); // Replace with your image path
                    const url = await getDownloadURL(storageRef);
                    this.failed_image = url;
                } catch (error) {
                    console.error('Error fetching image:', error);
                }
            },

            updateItem() {
                // Implement your update logic here
                
                
                this.showMenu = false; // Close menu after action

                if (this.item.claimed_status == "Returned") {
                    alert("You cannot edit a returned item");
                    return
                }

                if (this.item.claimed_status == "Matched") {
                    alert("You cannot edit a matched item");
                    return
                }
                alert('Update item clicked');
                if (this.status == "searcher") {
                    this.$router.push({
                    name: "edit_item",
                    query: { 
                        status_edit_item: this.status,
                        edit_item_id: this.lost_item_Id,
                        image: ""
                    }
                    });
                } else {
                    this.$router.push({
                    name: "edit_item",
                    query: {
                        status_edit_item: this.status,
                        edit_item_id: this.found_item_Id,
                        image: this.imageUrl
                    }
                    });
                }
                console.log(this.found_item_Id)

                },

            async deleteItem() {
                try {
                    alert('Delete item clicked');
                    if (this.status == "searcher") {
                        // console.log(this.item)
                        const docRef = doc(db, 'Lost Item', this.lost_item_Id)
                        const userRef = doc(db, 'History', this.user_id)
                        await updateDoc(userRef, {
                            lost_item_id_list: arrayRemove(this.lost_item_Id) // Remove the item ID from the array
                        });
                        await deleteDoc(docRef);
                    } else {
                        console.log(this.found_item_Id)
                        const docRef = doc(db, 'Found_Item', this.found_item_Id)
                        const userRef = doc(db, 'History', this.user_id)
                        await updateDoc(userRef, {
                            found_item_id_list: arrayRemove(this.found_item_Id) // Remove the item ID from the array
                        });
                        await deleteDoc(docRef);
                    }
                    this.$emit('item-deleted');
                } catch (error) {
                    console.error("Error deleting document: ", error);
                }
                
                
                this.showMenu = false; // Close menu after action
            },

            toggleMenu() {
                this.showMenu = !this.showMenu;
            },

            handleImageError(event) {
                this.imageUrl = this.failed_image; // Fallback image
            }


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
        border : 0.0625rem;
        max-width: 15.625rem;
        margin: 0.44rem;
        background-color: #fff;
        padding: 1.25rem;
        border: 0.0625rem solid #ccc;
        /* box-shadow: 2px 2px 10px rgba(0, 0, 0, 0.1); */

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

    p{
        font-family: Arial;
        margin-top: 0.25rem;    /* Adjust the top margin */
        margin-bottom: 0.25rem;
        color: grey;
        /* display: inline; */
        font-size: 1rem;
    }


    .boxes {
        display: inline-flex; /* Arrange boxes horizontally */
        align-items: center; /* Vertically align items */
        gap: 0.625rem; /* Space between boxes */

    }

    

    .status {
        padding: 0.5rem 0.57rem; /* Padding inside the boxes */
        border-radius: 0.57rem; /* Rounded corners */
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
        margin-bottom: 0.63rem; /* Space between image and boxes */
        text-align: center;
    }

    .image-container img {
        display: inline-block; /* Allow centering with text-align */
        max-width: 50%; /* Make image responsive */
        height: 120%;
        border-radius: 0.32rem; /* Rounded corners for image */
    }

    #pencil {
        position: absolute;
        right: 0.7em;
        transform: translateY(-50%);
        border-radius: 50%;
        padding: 0.5rem;
    }

    #pencil:hover{
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


    

</style>