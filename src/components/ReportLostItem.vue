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
                    <option value="Student Card">Student Card</option>
                    <option value="Bank Card">Bank Card</option>
                    <option value="Waterbottle">Waterbottle</option>
                    <option value="Electronics">Electronics</option>
                    <option value="Stationary">Stationary</option>
                    <option value="Toys">Toys</option>
                    <option value="Clothing">Clothing</option>
                    <option value="Others">Others</option>
                </select>

                <br />
                <br />

                <label for="col">Colour </label> <br />
                <select v-model="formData.color" id="col" :disabled="formData.category === 'Student Card'" required>
                    <option value="" disabled>
                        {{ formData.category === 'Student Card' ? 'Colour not required for Student Cards' : '--Please choose the colour--' }}
                    </option>
                    <option v-if="formData.category !== 'Student Card'" value="Red">Red</option>
                    <option v-if="formData.category !== 'Student Card'" value="Green">Green</option>
                    <option v-if="formData.category !== 'Student Card'" value="Blue">Blue</option>
                    <option v-if="formData.category !== 'Student Card'" value="Yellow">Yellow</option>
                    <option v-if="formData.category !== 'Student Card'" value="Black">Black</option>
                    <option v-if="formData.category !== 'Student Card'" value="White">White</option>
                    <option v-if="formData.category !== 'Student Card'" value=" ">Others</option>
                </select>

                <br /><br />

                <label for="brand">Brand </label> <br />
                <input type="text" id="brand" v-model="formData.brand" required :placeholder="formData.category === 'Student Card' ? 'Not required for student cards' : 'Enter Brand'" :disabled="formData.category === 'Student Card'" />
                <br /><br />

                <label for="loc">Location Lost </label> <br />
                <input type="text" id="loc" v-model="formData.location" required placeholder="Enter Location Lost" />
                <br /><br />

                <label for="datetime">Date & Time Lost </label> <br />
                <input type="datetime-local" id="datetime" v-model="formData.datetime" required :max="maxDateTime" placeholder="Enter Date & Time Lost" />
                <br /><br />

                <label for="desc">Description </label> <br />
                <textarea name="desc" v-model="formData.description" rows="5" cols="20" :placeholder="formData.category === 'Student Card' ? 'Enter name and student number on the card ' : 'Enter Description'"></textarea>
                <br /><br />

                <div class="save">
                    <button id="savebutton" type="button" @click="saveLostItem()">Submit</button>
                </div>
            </div>
        </form>
    </div>
</template>

<script>
import { collection, addDoc, doc, setDoc, arrayUnion, getDoc } from 'firebase/firestore'
import { db } from '../firebase.js'
import { useUserStore } from '@/stores/user-store'

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
                    const userStore = useUserStore()
                    const userEmailRef = doc(db, 'users', userStore.userId)
                    const docSnap = await getDoc(userEmailRef)
                    const userData = docSnap.data()
                    const userEmail = userData.email

                    const docRef = await addDoc(collection(db, 'Lost Item'), {
                        brand: this.formData.brand,
                        category: this.formData.category,
                        claimed_status: 'Not Found Yet',
                        colour: this.formData.color,
                        date_time_lost: this.formData.datetime,
                        description: this.formData.description,
                        lost_item_id: 'empty for now',
                        location: this.formData.location,
                        name: `${this.formData.color} ${this.formData.category}`,
                        email: userEmail,
                        reporter_id: userStore.userId,
                    })

                    console.log('User ID:', userStore.userId)
                    const userRef = doc(db, 'History', userStore.userId)

                    // Use setDoc with merge:true to create/update document
                    await setDoc(
                        userRef,
                        {
                            lost_item_id_list: arrayUnion(docRef.id),
                        },
                        { merge: true },
                    )

                    const lostItemId = docRef.id

                    const formDataCopy = { ...this.formData }

                    this.formData = {
                        category: '',
                        color: '',
                        brand: '',
                        location: '',
                        datetime: '',
                        description: '',
                    }
                    console.log('Form Data:', formDataCopy)
                    alert('Item reported successfully! Redirecting to check for similar items found')

                    this.$router.push({
                        name: 'matching',
                        query: { lostItem: JSON.stringify(formDataCopy), id: lostItemId },
                    })
                } catch (error) {
                    const userStore = useUserStore()
                    console.log('User ID:', userStore.userId)
                    console.error('Error saving item:', error)
                    alert('Failed to report item. Please try again.')
                }
            }
        },

        validateForm() {
            if (!this.formData.category || (!this.formData.color && this.formData.category !== 'Student Card') || (!this.formData.brand && this.formData.category !== 'Student Card') || !this.formData.location || !this.formData.datetime || !this.formData.description) {
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
    color: black;
}

.formli textarea {
    height: 6.0625rem;
    min-width: 24.8125rem;
    max-width: 24.8125rem;
    padding-left: 0.75rem;
    resize: none;
    font-size: 0.875rem;
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
    margin-top: 1rem;
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
    cursor: pointer;
}

#savebutton:hover {
    transform: scale(1.1); /* Slight zoom in */
}

#backward_img {
    width: 2.125rem;
    height: 2.125rem;
    margin-left: 1rem;
    margin-top: 1rem;
}

#backward-img:hover {
    transform: scale(1.1); /* Slight zoom in */
    opacity: 0.8; /* Slight transparency */
}
</style>
