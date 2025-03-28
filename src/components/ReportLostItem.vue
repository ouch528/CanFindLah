<template>
    <div class="container">
        <form id="lost_form">
            <h2 id="header">Report Lost Item</h2>

            <div class="formli">
                <RouterLink to="/">
                    <img id="backward_img" src="@/assets/arrow_back.png" alt="Back to Home" />
                </RouterLink>
                <br />

                <label for="cat">Category </label> <br />
                <select name="cat" id="cat" v-model="formData.category">
                    <option value="">--Please choose the category--</option>
                    <option value="card">Card</option>
                    <option value="waterbottle">Waterbottle</option>
                    <option value="electronics">Electronics</option>
                    <option value="stationary">Stationary</option>
                    <option value="toys">Toys</option>
                    <option value="clothing">Clothing</option>
                    <option value="others">Others</option>
                </select>

                <br />
                <br />

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
                <input type="text" id="brand" v-model="formData.brand" required placeholder="Enter Brand" />
                <br /><br />

                <label for="loc">Location Lost </label> <br />
                <input type="text" id="loc" v-model="formData.location" required placeholder="Enter Location Lost" />
                <br /><br />

                <label for="datetime">Date & Time Lost </label> <br />
                <input type="datetime-local" id="datetime" v-model="formData.datetime" required :max="maxDateTime" placeholder="Enter Date & Time Lost" />
                <br /><br />

                <label for="desc">Description </label> <br />
                <textarea name="desc" v-model="formData.description" rows="5" cols="20" placeholder="Enter Description">Enter Description</textarea>
                <br /><br />

                <div class="save">
                    <button id="savebutton" type="button" @click="saveLostItem()">Submit</button>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
// import firebaseApp from '../firebase.js'
// import { getFirestore } from 'firebase/firestore'
import { collection, addDoc } from 'firebase/firestore'
// const db = getFirestore(firebaseApp)
import { db } from '../firebase.js'

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
            },
            maxDateTime: new Date().toISOString().slice(0, 16),
        }
    },
    methods: {
        async saveLostItem() {
            if (this.validateForm()) {
                try {
                    await addDoc(collection(db, 'Lost Item'), {
                        brand: this.formData.brand,
                        category: this.formData.category,
                        claimed_status: 'Not Found Yet',
                        colour: this.formData.color,
                        date_time_lost: this.formData.datetime,
                        description: this.formData.description,
                        lost_item_id: 'empty for now',
                        location: this.formData.location,
                        name: `${this.formData.color} ${this.formData.category}`,
                    })

                    this.formData = {
                        category: '',
                        color: '',
                        brand: '',
                        location: '',
                        datetime: '',
                        description: '',
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
    height: 42rem;
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
    font-family: Arial;
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
</style>
