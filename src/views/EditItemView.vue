<template>
    <div style="text-align: center">
        <h1>Edit This Item <br /></h1>
        <h3>You are {{ status_edit_item }}</h3>

        <div style="display: flex; justify-content: center; align-items: center">
            <EditItem :lost_item_Id="this.lost_item_Id" :image="this.imageUrl" v-if="this.status_edit_item == 'searcher'" @changeMade="handleEdit" 
            style="width: 800px; height: 500px;"   />
            <EditItem :found_item_Id="this.found_item_Id" :image="this.imageUrl" v-if="this.status_edit_item == 'founder'" @changeMade="handleEdit"
            style="width: 800px; height: 500px;" />
        </div>

        <div style="display: flex; justify-content: center; gap: 20px; margin-top: 20px">
            <button :disabled="!hasChanges" @click="uploadChanges" class="btn primary">Edit Item</button>
            <button id="back-button" class="btn secondary" @click="goBack">Back</button>
        </div>
    </div>
</template>

<script>
import { app, storage } from '../firebase.js'
import { getFirestore } from 'firebase/firestore'
import { ref, getDownloadURL } from 'firebase/storage'
import { collection, getDoc, doc, deleteDoc, setDoc } from 'firebase/firestore'
import 'primeicons/primeicons.css'

const db = getFirestore(app)

import EditItem from '@/components/EditItem.vue'
export default {
    components: {
        EditItem,
    },

    data() {
        return {
            lost_item_Id: this.$route.query.edit_item_id,
            status_edit_item: this.$route.query.status_edit_item,
            found_item_Id: this.$route.query.edit_item_id,
            imageUrl: this.$route.query.image,
            hasChanges: false,
            editedData: null,
        }
    },

    methods: {
        handleEdit(updatedItem) {
            this.editedData = updatedItem
            this.hasChanges = true
        },

        async uploadChanges() {
            if (this.editedData && this.status_edit_item == 'searcher') {
                try {
                    console.log(this.editedData.lost_item_id)
                    const docRef = doc(db, 'Lost Item', this.lost_item_Id)
                    await setDoc(docRef, this.editedData, { merge: true })
                    this.hasChanges = false
                    this.editedData = null
                    alert('Item edited successfully!')
                    this.$router.push('/history')
                } catch (error) {
                    console.error('Error uploading data:', error)
                }
            } else if (this.editedData && this.status_edit_item == 'founder') {
                try {
                    console.log(this.editedData.found_item_id)
                    const docRef = doc(db, 'Found Item', this.found_item_Id)
                    await setDoc(docRef, this.editedData, { merge: true })

                    this.hasChanges = false
                    this.editedData = null
                    alert('Item edited successfully!')
                    this.$router.push('/history')
                } catch (error) {
                    console.error('Error uploading data:', error)
                }
            }
        },

        goBack() {
            // Use Vue Router to navigate to a different page (e.g., "Home Page")
            this.$router.push('/history') // Replace with your desired route path
        },
    },
}
</script>

<style>
.btn {
    padding: 0.75rem 1.5rem;
    font-size: 1rem;
    border-radius: 0.5rem;
    border: none;
    cursor: pointer;
    transition: all 0.3s ease-in-out;
}

.primary {
    background-color: #007bff;
    color: white;
}

.primary:disabled {
    background-color: #ccc;
    cursor: not-allowed;
}

.secondary {
    background-color: #f8f9fa;
    color: black;
    border: 0.07rem solid #ccc;
}

.btn:hover {
    transform: scale(1.05);
}
</style>
