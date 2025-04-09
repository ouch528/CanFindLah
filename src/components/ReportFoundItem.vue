<template>
    <div class="container">
        <form id="found_form">
            <h2 id="header">Report Found Item</h2>

            <div class="formli">
                <RouterLink to="/">
                    <img id="backward_img" src="@/assets/arrow_back.png" alt="Back to Home" />
                </RouterLink>
                <br />

                <label for="cat">Category </label> <br />
                <select v-model="formData.category" id="cat">
                    <option value="">--Please choose the category--</option>
                    <option value="card">Card</option>
                    <option value="waterbottle">Waterbottle</option>
                    <option value="electronics">Electronics</option>
                    <option value="stationary">Stationary</option>
                    <option value="toys">Toys</option>
                    <option value="clothing">Clothing</option>
                    <option value="others">Others</option>
                </select>
                <br /><br />

                <label for="col">Colour </label> <br />
                <select v-model="formData.color" id="col" required>
                    <option value="">--Please choose the colour--</option>
                    <option value="red">Red</option>
                    <option value="green">Green</option>
                    <option value="blue">Blue</option>
                    <option value="yellow">Yellow</option>
                    <option value="black">Black</option>
                    <option value="white">White</option>
                    <option value=" ">Others</option>
                </select>
                <br /><br />

                <label for="brand">Brand </label> <br />
                <input type="text" v-model="formData.brand" id="brand" required placeholder="Enter Brand" />
                <br /><br />

                <label for="loc">Location Found </label> <br />
                <input type="text" v-model="formData.location" id="loc" required placeholder="Enter Location Lost" />
                <br /><br />

                <label for="datetime">Date & Time Found </label> <br />
                <input type="datetime-local" v-model="formData.datetime" id="datetime" required :max="maxDateTime" placeholder="Enter Date & Time Lost" />
                <br /><br />

                <label for="desc">Description </label> <br />
                <textarea v-model="formData.description" name="desc" rows="5" cols="20" placeholder="Enter Description"></textarea>
                <br /><br />

                <label for="default-upload">Upload Image </label>
                <div class="upload-container">
                    <input type="file" @change="handleFileUpload" id="default-upload" accept="image/*" />
                    <label for="default-upload">
                        <img src="@/assets/upload.png" alt="Upload Icon" id="upload-icon" />
                        <span id="instruction">{{ instruction }}</span>
                    </label>
                </div>

                <div class="save">
                    <button id="savebutton" type="button" v-on:click="saveFoundItem">Submit</button>
                </div>
            </div>
        </form>
    </div>
</template>

<!-- <script>
import firebaseApp from '../firebase.js'
import { getFirestore } from 'firebase/firestore'
import { collection, addDoc } from 'firebase/firestore'
const db = getFirestore(firebaseApp)

export default {
    data() {
        return {
            formData: {
                category: '',
                color: '',
                brand: '',
                location: '',
                datetime: '',
                description: '',
                image: null,
            },
            maxDateTime: new Date().toISOString().slice(0, 16),
        }
    },
    methods: {
        // handleFileUpload(event) {
        //   this.formData.image = event.target.files[0]
        // },

        async saveFoundItem() {
            if (this.validateForm()) {
                try {
                    // If an image is selected, upload it to Firebase Storage
                    // let imageUrl = "";
                    // if (this.formData.image) {
                    //   const imageRef = ref(storage, "found-items/" + this.formData.image.name);
                    //   await uploadBytes(imageRef, this.formData.image);
                    //   imageUrl = await getDownloadURL(imageRef);
                    // }

                    await addDoc(collection(db, 'Found Item'), {
                        category: this.formData.category,
                        colour: this.formData.color,
                        brand: this.formData.brand,
                        location: this.formData.location,
                        date_time_found: this.formData.datetime,
                        description: this.formData.description,
                        name: `${this.formData.color} ${this.formData.category}`,
                        claimed_status: 'Not Found Yet',
                        found_item_id: 'empty for now',
                        photo: 'jpg',
                    })

                    this.formData = {
                        category: '',
                        color: '',
                        brand: '',
                        location: '',
                        datetime: '',
                        description: '',
                        image: null,
                    }

                    alert('Item reported successfully!')
                } catch (error) {
                    console.error('Error saving item:', error)
                    alert('Failed to report item. Please try again.')
                }
            }
        },

        validateForm() {
            if (!this.formData.category || !this.formData.color || !this.formData.brand || !this.formData.location || !this.formData.datetime || !this.formData.description) {
                alert('Please fill all required fields.')
                return false
            }

            const selectedDateTime = new Date(this.formData.datetime)
            const now = new Date()

            if (selectedDateTime > now) {
                alert('Date & Time must be in the past.')
                return false
            }

            return true
        },
    },
}
</script> -->

<script>
// import firebaseApp from '../firebase.js'
// import { getFirestore } from 'firebase/firestore'
// import { getStorage } from 'firebase/storage'
import { collection, addDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
// const db = getFirestore(firebaseApp)
// const storage = getStorage(firebaseApp)

import { storage, db } from '../firebase.js'

export default {
    data() {
        return {
            formData: {
                category: '',
                color: '',
                brand: '',
                location: '',
                datetime: '',
                description: '',
                image: null,
            },
            maxDateTime: new Date().toISOString().slice(0, 16),
            imagePreview: null, // To store the image preview URL
            instruction: 'Please attach photo of the item',
        }
    },
    methods: {
        // Handle the file upload and create an image preview
        handleFileUpload(event) {
            const file = event.target.files[0]
            if (file) {
                this.formData.image = file
                this.imagePreview = URL.createObjectURL(file)
                this.instruction = 'Reupload Image'
            }
        },

        removeImage() {
            this.formData.image = null
            this.imagePreview = null // Remove the preview
            this.instruction = 'Please attach photo of the item'
        },

        async saveFoundItem() {
            if (this.validateForm()) {
                try {
                    let imageUrl = ''

                    if (this.formData.image) {
                        const imageRef = ref(storage, `found_items/${Date.now()}-${this.formData.image.name}`)
                        const snapshot = await uploadBytes(imageRef, this.formData.image)
                        imageUrl = await getDownloadURL(snapshot.ref)
                    }

                    await addDoc(collection(db, 'Found Item'), {
                        category: this.formData.category,
                        colour: this.formData.color,
                        brand: this.formData.brand,
                        location: this.formData.location,
                        date_time_found: this.formData.datetime,
                        description: this.formData.description,
                        name: `${this.formData.color} ${this.formData.category}`,
                        claimed_status: 'Not Found Yet',
                        found_item_id: 'empty for now',
                        photo: imageUrl,
                    })

                    this.resetForm()
                    this.instruction = 'Please attach photo of the item'
                    alert('Item reported successfully!')
                } catch (error) {
                    console.error('Error saving item:', error)
                    alert('Failed to report item. Please try again.')
                }
            }
        },

        validateForm() {
            if (!this.formData.category || !this.formData.color || !this.formData.brand || !this.formData.location || !this.formData.datetime || !this.formData.description) {
                alert('Please fill all required fields.')
                return false
            }

            const selectedDateTime = new Date(this.formData.datetime)
            const now = new Date()

            if (selectedDateTime > now) {
                alert('Date & Time must be in the past.')
                return false
            }

            return true
        },

        resetForm() {
            this.formData = {
                category: '',
                color: '',
                brand: '',
                location: '',
                datetime: '',
                description: '',
                image: null,
            }
            this.imagePreview = null // Reset image preview after form submission
        },
    },
}
</script>

<style scoped>
.remove-image-btn {
    background: none;
    border: none;
    color: red;
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0.2rem;
    margin-left: 5.8125rem;
}

#image-preview {
    width: 50%;
    height: 50%; /* Adjust height and width as needed */
    margin-left: 9.1rem;
    margin-right: 9.1rem;
    margin-bottom: 1rem;
}

input[type='file'] {
    display: none;
}

#header {
    font-size: 3rem;
    color: #684545;
}

form {
    text-align: center;
    align-items: center;
    margin: auto;
}

.formli {
    display: inline-block;
    text-align: left;
    border-radius: 1rem;
    background-color: #fffdfb;
    font-family: Arial;
    width: 36.375rem;
    /* height: 45.5625rem; */
    height: 42rem;
    overflow: scroll;
}

.formli label {
    margin-left: 5.8125rem;
    display: inline-block;
    width: 24.8125rem;
    height: 1.75rem;
    font-size: 1.25rem;
    font-weight: 600;
}

.formli input,
.formli select,
.formli textarea {
    margin-left: 5.8125rem;
    width: 24.8125rem;
    height: 2rem;
    background-color: rgba(251, 240, 230, 1);
    letter-spacing: 0.42px;
    border-radius: 0.625rem;
    line-height: 2;
    border: none;
    box-sizing: border-box;
    color: black;
}

.formli textarea {
    min-height: 2rem;
    max-height: 6.0625rem;
    min-width: 24.8125rem;
    max-width: 24.8125rem;
    font-family: Arial;
    font-size: 0.875rem;
    padding-left: 0.75rem;
}

select,
input {
    color: #888;
    font-size: 0.875rem;
    font-family: Arial;
    text-align: left;
    padding-left: 0.75rem;
}

textarea::placeholder {
    color: #888;
    font-size: 0.875rem;
    font-family: Arial;
    text-align: left;
}

.save {
    text-align: center;
    margin-top: 1.5rem;
    border-radius: 2rem;
}

#savebutton {
    width: 5.5rem;
    height: 2rem;
    border-radius: 0.625rem;
    background-color: #ff8844;
    color: black;
    font-weight: 600;
    border: none;
    font-size: 1rem;
}

#backward_img {
    width: 2.125rem;
    height: 2.125rem;
    margin-left: 1rem;
    margin-top: 1rem;
}

.upload-container {
    margin-left: 5.8125rem;
    width: 24.8125rem;
    background-color: rgba(251, 240, 230, 1);
    border-radius: 0.625rem;
    height: 2rem;
    display: flex;
    justify-content: start;
    position: relative;
    cursor: pointer;
}

.upload-container label {
    margin-left: 0;
    display: flex;
    align-items: center;
    justify-content: start;
    width: 100%;
    height: 100%;
    cursor: pointer;
}

#upload-icon {
    width: 1rem;
    height: 1rem;
    margin-left: 0.5rem;
    margin-right: 0.5rem;
}

#instruction {
    color: #888;
    font-size: 0.875rem;
    font-weight: 200;
}
</style>
