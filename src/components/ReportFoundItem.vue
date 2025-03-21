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
                    <option value="adapter">Adapter</option>
                    <option value="stationary">Stationary</option>
                </select>
                <br /><br />

                <label for="col">Colour </label> <br />
                <input type="color" v-model="formData.color" id="col" required /> <br /><br />

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

                <label for="img">Upload Image </label> <br />
                <div id="upload-img">
                    <img src="@/assets/upload.png" alt="Upload Icon" id="upload-icon" />
                    <span id="instruction">Please attach photo of the item</span>
                    <input type="file" @change="handleFileUpload" id="default-upload" accept="image/*" />
                    <!-- <textarea rows="1" cols="20" placeholder="Please attach photo of the item"></textarea> -->
                    <br /><br />
                </div>
                <!-- <input type="file" @change="handleFileUpload" id="img" accept="image/*" /> <br /><br /> -->

                <!-- <label for="img" class="custom-file-upload">
                    <img src="@/assets/upload.png" alt="Upload Icon" width="40px" />
                </label>
                <input type="file" @change="handleFileUpload" id="img" accept="image/*" /> -->

                <div class="save">
                    <button id="savebutton" type="button" v-on:click="saveFoundItem">Submit</button>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
import firebaseApp from '../firebase.js'
import { getFirestore } from 'firebase/firestore'
import { collection, addDoc } from 'firebase/firestore'
const db = getFirestore(firebaseApp)

export default {
    data() {
        return {
            formData: {
                category: '',
                color: '#000000',
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
                        color: this.formData.color,
                        brand: this.formData.brand,
                        location_found: this.formData.location,
                        datetime_found: this.formData.datetime,
                        description: this.formData.description,
                        name: `${this.formData.color} ${this.formData.category}`,
                        claimed_status: false,
                        // imageUrl: imageUrl,
                    })

                    this.formData = {
                        category: '',
                        color: '#000000',
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
</script>

<style scoped>
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
}

.formli textarea {
    height: 6.0625rem;
}

#upload-img {
    background-color: rgba(251, 240, 230, 1);
    margin-left: 5.8125rem;
    margin-right: 5.8125rem;
    border-radius: 0.625rem;
    height: 2rem;
}

#upload-icon,
#instruction {
    line-height: 2rem;
}

#instruction,
select,
input,
textarea::placeholder {
    color: #888;
    font-size: 0.875rem;
    font-family: Arial;
    text-align: left;
    padding-left: 0.75rem;
}

.save {
    text-align: center;
    margin-top: 1rem;
    border-radius: 2rem;
}

#savebutton {
    width: 5.125rem;
    height: 2rem;
    border-radius: 0.625rem;
    background-color: #ff8844;
    color: black;
    font-weight: 600;
    border: none;
}

#backward_img {
    width: 2.125rem;
    height: 2.125rem;
    margin-left: 1rem;
    margin-top: 1rem;
}

#default-upload {
    /* opacity: 0; */
}

#upload-img img {
    margin-left: 5.8125rem;
}
</style>
