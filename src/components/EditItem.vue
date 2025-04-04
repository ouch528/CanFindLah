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
            <img v-if="imageUrl" :src="imageUrl" alt="Item Image" @error="handleImageError"/>
            <img v-else :src ="failed_image"/>
            <i class="pi pi-refresh" id="pencil" @click="refresh" title="Click this to revert all your changes"></i>
            <!-- <p v-else>Loading image...</p> -->
        </div>

        <!-- <p>{{ $route.params.edit_item.name }}</p> -->
        <div class = "edit-item"> 
            <h3 class = "item-name">{{ item.name }}</h3>
            <p class = "word">Category:</p><p class = "edit-box"><select id="item" v-model="item.category" @change = "markAsChanged">
                        <option value="Card">Card</option>
                        <option value="Waterbottle">Waterbottle</option>
                        <option value="Electronics">Electronics</option>
                        <option value="Stationary">Stationary</option>
                        <option value="Toys">Toys</option>
                        <option value="Clothing">Clothing</option>
                        <option value="Others">Others</option>
                    </select></p>
            <p class = "word">Colour:</p> <p class = "edit-box"><select v-model="item.colour" id="item" @change = "markAsChanged">
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
            <p class = "word">Brand:</p> <p class = "edit-box"><input type="text" id="item" v-model="item.brand" @input="markAsChanged" /></p>
            <p class = "word">Location:</p> <p class = "edit-box"><input type="text" id="item" v-model="item.location" @input="markAsChanged" /></p>
            <!-- <p>Date & Time: <input type="text" id="item" v-model="item.date_time_lost" @input="markAsChanged" /></p> -->
            <p v-if = "status == 'founder'" class = "word">Date & Time:</p><p class = "edit-box" v-if = "status == 'founder'"> <input type="datetime-local" id="item" v-model="item.date_time_found" placeholder="Enter Date & Time Lost" @input="markAsChanged"/></p>
            <p v-if= "status == 'searcher'" class = "word">Date & Time:</p><p class = "edit-box" v-if= "status == 'searcher'"><input type="datetime-local" id="item" v-model="item.date_time_lost" placeholder="Enter Date & Time Lost" @input="markAsChanged"/></p>
            <p class = "word">Description:</p><p class = "edit-box"><input type="text" id="item" v-model="item.description" @input="markAsChanged" /></p>
            <!-- <p>{{ itemId }}</p> -->
            <br>

            <div v-if="imagePreview">
                    <button @click="removeImage" class="remove-image-btn">&#10006;</button>
                    <img :src="imagePreview" alt="Uploaded Image" id="image-preview" />
            </div>
            <div id="upload-img" v-if = "status == 'founder'">
                    <input type="file" @change="handleImageUpload" id="default-upload" accept="image/*" />
                    <label for="default-upload">
                        <img src="@/assets/upload.png" alt="Upload Icon" id="upload-icon" />
                        <span id="instruction">{{ instruction }}</span>
                    </label>
                    <br /><br />
                    <!-- <div v-if="imagePreview">
                        <img :src="imagePreview" alt="Uploaded Image" id="image-preview" />
                    </div> -->
            </div>
        </div>
    </div>
</template>

<script>
import { app, storage } from '../firebase.js'
import { getFirestore } from 'firebase/firestore'
import { ref, getDownloadURL, getStorage, deleteObject,  uploadBytes } from 'firebase/storage'
import { collection, getDoc, doc, deleteDoc } from 'firebase/firestore'
// import failedImage from '@/assets/still_finding_yet.jpg';
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
            failed_image: "",
            initialItem: null, // Store initial state
            changed: false,
            initial: false,
            test: "",
            others: false,
            image_change : false,
            change_image :'',
            instruction: 'Please attach photo of the item',
            imagePreview: null,
            directory: null,
            // lost_item: 1,// Will store item details, set as 1 if null will wrong idk why
        }
    },

    computed: {
        hasChanges() {
            console.log('haha')
            if (JSON.stringify(this.item) == JSON.stringify(this.originalItem)) {
                this.$emit('noUpdate', false);
            }
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

        async markAsChanged() {
            // console.log(this.image_change)
            this.item.name = `${this.item.colour} ${this.item.category}`
            // console.log(this.item)
            // if (this.image_change == false) {
            this.changed = JSON.stringify(this.item) !== JSON.stringify(this.initialItem)
            // }
            console.log(this.originalItem)
            if (JSON.stringify(this.item) == JSON.stringify(this.initialItem)) {
                this.$emit('noUpdate', false);
                return
            }

            // Emit event only when a change is detected
            if (this.changed) {
                this.$emit('changeMade', { ...this.item}) // Emit a copy of the updated data
            }
        },

        handleImageError(event) {
            this.imageUrl = this.failed_image // Fallback image
        },

        // handleFileUpload(event) {
        //     const file = event.target.files[0]
        //     if (file) {
        //         this.change_image = file
        //         // this.imagePreview = URL.createObjectURL(file)
        //         // this.instruction = 'Reupload Image'
        //     }
        //     this.$emit('changeMade', { ...this.item, changing : true })
        //     this.image_change = true
        //     console.log("erm")
        //     this.handleImageUpload()
            
        // },

        async handleImageUpload(event) {
            var file = event.target.files[0];
            if (!file) return;
            this.uploadingImage = true;
            this.$emit('uploading', true); // notify parent
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
                this.$emit('uploading', false, image_file_path); // done uploading
                this.instruction = 'Reupload Image'

            }
        },

        removeImage() {
            if (this.directory) {
                const storage = getStorage();
                const desertRef = ref(storage, this.directory);
                console.log(this.directory)
                deleteObject(desertRef).then(() => {
                // File deleted successfully
                }).catch((error) => {
                console.log(error)
                });
            }
            this.imagePreview = null // Remove the preview
            this.instruction = 'Please attach photo of the item'
            this.directory = null
            console.log("yes")
            if (JSON.stringify(this.item) == JSON.stringify(this.initialItem)) {
                this.$emit('noUpdate', false);
            }
        },

        refresh() {
            Object.assign(this.item, JSON.parse(JSON.stringify(this.initialItem)));
            this.$emit('noUpdate', false);
            this.removeImage()
        }
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

.edit-item select, .edit-item input {
    width: 22rem;  /* Set a fixed width */
    height: 25px;  /* Set a fixed height */
    padding: 1px;  /* Add some padding */
    font-size: 16px;  /* Ensure text size is the same */
    border: 1px solid #ccc;  /* Add a consistent border */
    border-radius: 1px;  /* Optional: Rounded corners */
    font-family: 'Arial';
    background-color: rgba(251, 240, 230, 1);
    border-radius: 0.625rem;
    line-height: 2;
    border: none;
    box-sizing: border-box;
    align-content: center;
}

.edit-item p {
    font-family: Arial;
    margin-top: 0.25rem; /* Adjust the top margin */
    margin-bottom: 0.5rem;
    /* color: grey; */
    /* display: inline; */
    font-size: 1rem;
    font-weight: 600;
    /* text-align: center; */

}


.formli label {
    margin-left: 5.8125rem;
    display: inline-block;
    width: 24.8125rem;
    height: 1.75rem;
    font-size: 1.25rem;
    font-weight: 600;
}

#upload-img {
    width: 22rem;  /* Set a fixed width */
    height: 25px;  /* Set a fixed height */
    padding: 1px;  /* Add some padding */
    font-size: 16px;  /* Ensure text size is the same */
    border: 1px solid #ccc;  /* Add a consistent border */
    border-radius: 1px;  /* Optional: Rounded corners */
    font-family: 'Arial';
    background-color: rgba(251, 240, 230, 1);
    border-radius: 0.625rem;
    line-height: 2;
    border: none;
    box-sizing: border-box;
    align-content: center;
    margin-left: 4.6em;
}

.word{
    margin-left: 5rem;
    color: black;
}

.edit-box{
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
    width: 50%;
    height: 50%; /* Adjust height and width as needed */
    margin-left: 9.1rem;
    margin-right: 9.1rem;
    margin-bottom: 1rem;
}

.remove-image-btn {
    background: none;
    border: none;
    color: red;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.2rem;
    margin-left: 5.8125rem;
}


</style>
