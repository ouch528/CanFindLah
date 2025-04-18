<template>
    <div class="container">
        <form id="found_form">
            <h2 id="header">Report Found Item</h2>

            <div class="formli">
                <RouterLink to="/" id="backward">
                    <i class="pi pi-arrow-left" id="backward-icon"></i>
                </RouterLink>
                <br />

                <label for="cat">Category </label> <br />
                <select v-model="formData.category" id="cat">
                    <option value="">--Please choose the category--</option>
                    <option value="Student Card">Student Card</option>
                    <option value="Bank Card">Bank Card</option>
                    <option value="Waterbottle">Waterbottle</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Stationary">Stationary</option>
                    <option value="Toys">Toys</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Others">Others</option>
                </select>
                <br /><br />

                <label for="col">Colour </label> <br />
                <select v-model="formData.color" id="col" :disabled="formData.category === 'Student Card'" required>
                    <option value="" disabled>
                        {{ formData.category === 'Student Card' ? 'Colour not required for Student Cards' : '--Please choose the colour--' }}
                    </option>
                    <option value="Red">Red</option>
                    <option value="Green">Green</option>
                    <option value="Blue">Blue</option>
                    <option value="Yellow">Yellow</option>
                    <option value="Black">Black</option>
                    <option value="White">White</option>
                    <option value=" ">Others</option>
                </select>
                <br /><br />

                <label for="brand">Brand </label> <br />
                <input type="text" id="brand" v-model="formData.brand" required :placeholder="formData.category === 'Student Card' ? 'Not required for student cards' : 'Enter Brand'" :disabled="formData.category === 'Student Card'" />
                <br /><br />

                <label for="loc">Location Found </label> <br />
                <input type="text" v-model="formData.location" id="loc" required placeholder="Enter Location Found" />
                <br /><br />

                <label for="datetime">Date & Time Found </label> <br />
                <input type="datetime-local" v-model="formData.datetime" id="datetime" required :max="maxDateTime" placeholder="Enter Date & Time Lost" />
                <br /><br />

                <label for="desc">Description </label> <br />
                <textarea name="desc" v-model="formData.description" rows="5" cols="20" :placeholder="formData.category === 'Student Card' ? 'Enter name and student number on the card ' : 'Enter Description'"></textarea>
                <br /><br />

                <label for="default-upload">Upload Image </label>
                <div v-if="imagePreview">
                    <button @click="removeImage" class="remove-image-btn">&#10006;</button>
                    <img :src="imagePreview" alt="Uploaded Image" id="image-preview" />
                </div>
                <div class="upload-container">
                    <input type="file" @change="handleFileUpload" id="default-upload" accept="image/*" />
                    <label for="default-upload">
                        <i class="pi pi-upload" id="upload-icon"></i>
                        <span id="instruction">{{ instruction }}</span>
                    </label>
                    <br /><br />
                </div>

                <div class="save">
                    <!-- <button id="savebutton" type="button" :disabled="uploading" v-on:click="saveFoundItem">Submit</button> -->
                    <button id="savebutton" type="button" :disabled="uploading" @click="saveFoundItem">
                        <span v-if="uploading" id="submitting">Submitting...</span>
                        <span v-else>Submit</span>
                    </button>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
import { collection, addDoc, doc, updateDoc, arrayUnion, getDoc } from 'firebase/firestore'
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage'
import { useUserStore } from '@/stores/user-store'
import { storage, db } from '../firebase.js'
import { findMatchingLostItems } from '@/components/matchingService.js'


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
            uploading: false,
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

            const fileInput = document.getElementById('default-upload')
            fileInput.value = '' // Reset the file input value
        },

        async saveFoundItem() {
            if (this.validateForm()) {
                try {
                    this.uploading = true
                    let imageUrl = ''

                    if (this.formData.image) {
                        var image_file_path = `found_items/${Date.now()}-${this.formData.image.name}`
                        const imageRef = ref(storage, image_file_path)
                        const snapshot = await uploadBytes(imageRef, this.formData.image)
                        imageUrl = await getDownloadURL(snapshot.ref)
                    }
                    const userStore = useUserStore()
                    const userEmailRef = doc(db, 'users', userStore.userId)
                    const docSnap = await getDoc(userEmailRef)
                    const userData = docSnap.data()
                    const userEmail = userData.email
                    const form = {
                        category: this.formData.category,
                        color: this.formData.color,
                        brand: this.formData.brand,
                        location: this.formData.location,
                        datetime: this.formData.datetime,
                        description: this.formData.description,
                    }
                    const itemArray = await findMatchingLostItems(form)


                    const docRef = await addDoc(collection(db, 'Found Item'), {
                        category: this.formData.category,
                        colour: this.formData.color,
                        brand: this.formData.brand,
                        location: this.formData.location,
                        date_time_found: this.formData.datetime,
                        description: this.formData.description,
                        name: this.formData.category === 'Student Card' ? this.formData.category : `${this.formData.color} ${this.formData.category}`,
                        claimed_status: 'Not Found Yet',
                        found_item_id: '',
                        photo: imageUrl,
                        photo_directory: image_file_path,
                        email: userEmail,
                        reporter_id: userStore.userId,
                        similar_item: itemArray
                    })

                    await updateDoc(docRef, {
                        found_item_id: docRef.id // Update the `found_item_id` with the doc ID
                    });

                    console.log(itemArray)
                    console.log(docRef.id)
                    

                    console.log('User ID:', userStore.userId)
                    const userRef = doc(db, 'History', userStore.userId)
                    await updateDoc(userRef, {
                        found_item_id_list: arrayUnion(docRef.id),
                    })

                    this.resetForm()
                    this.instruction = 'Please attach photo of the item'
                    alert('Item reported successfully!')

                    this.uploading = false
                    this.$router.push('/')
                } catch (error) {
                    console.error('Error saving item:', error)
                    alert('Failed to report item. Please try again.')
                }
            }
        },

        validateForm() {
            const { category, color, brand, location, datetime, description, image } = this.formData

            if (category === 'Student Card') {
                if (!this.formData.color) this.formData.color = 'Not Available'
                if (!this.formData.brand) this.formData.brand = 'Not Available'
            }

            if (!category || !location || !datetime || !description) {
                alert('Please fill all required fields.')
                return false
            }

            if (category !== 'Student Card' && (!color || !brand)) {
                alert('Please fill all required fields.')
                return false
            }

            if (!image) {
                alert('Please upload an image of the found item.')
                return false
            }

            const selectedDateTime = new Date(datetime)
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
* {
    font-family: 'Inter';
}

.container {
    margin-bottom: 2rem;
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
    width: 36.375rem;
    /* height: 45.5625rem; */
    /* height: 42rem; */
    height: auto;
    padding-bottom: 1rem;
    /* overflow: scroll; */
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
    height: 6.0625rem;
    min-width: 24.8125rem;
    max-width: 24.8125rem;
    font-size: 0.875rem;
    padding-left: 0.75rem;
    resize: none;
}

select,
input {
    color: #888;
    font-size: 0.875rem;
    text-align: left;
    padding-left: 0.75rem;
}

textarea::placeholder {
    color: #888;
    font-size: 0.875rem;
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
    margin: 0.5rem 0;
    font-size: 1rem;
    cursor: pointer;
}

#savebutton:hover {
    transform: scale(1.1); /* Slight zoom in */
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
    font-size: 1rem;
}

#instruction {
    color: #888;
    font-size: 0.875rem;
    padding-left: 0;
}

#backward {
    height: 2.125rem;
    width: 2.125rem;
    display: inline-block;
    margin-left: 1rem;
    margin-top: 1rem;
    text-align: center;
}

#backward-icon {
    width: 2.125rem;
    height: 2.125rem;
    color: black;
    font-size: 1.5rem;
}

#backward-icon:hover {
    transform: scale(1.1); /* Slight zoom in */
    opacity: 0.8; /* Slight transparency */
}

#savebutton:disabled {
    background-color: #ccc;
    cursor: not-allowed;
    color: #666;
}

#submitting {
    font-size: 0.75rem;
}
</style>
