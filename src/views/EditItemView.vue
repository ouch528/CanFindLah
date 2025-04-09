<template>
    <div overflow: auto>
        <div style="text-align: center">
        <h1>Edit This Item <br /></h1>
        <h3>You are {{ status_edit_item }}</h3>
        </div>
        
        <div style="display: flex; justify-content: center; ">
            <EditItem :lost_item_Id="this.lost_item_Id" :image="this.imageUrl" v-if="this.status_edit_item == 'searcher'" @changeMade="handleEdit" @uploading="handleUploading" @noUpdate = "noUpdate"
              class = "edit-item"/>
            <EditItem :found_item_Id="this.found_item_Id" :image="this.imageUrl" v-if="this.status_edit_item == 'founder'" @changeMade="handleEdit" @uploading="handleUploading" @noUpdate = "noUpdate"
            class = "edit-item" />
        </div>

        <div style=" justify-content: center; gap: 20px; margin-top: 20px; display: flex;">
            <button :disabled="!hasChanges || uploadingImage" @click="uploadChanges" class="btn primary">Edit Item</button>
            <!-- <button id="back-button" class="btn secondary" @click="goBack">Back</button> -->
        </div>

    </div>
</template>

<script>
import { app, storage } from '../firebase.js'
import { getFirestore } from 'firebase/firestore'
import { ref, getDownloadURL, getStorage, deleteObject } from 'firebase/storage'
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
            editedData: null,
            edited_image: null,
            hasChanges: false,
            uploadingImage: false,
            image_file_path: ""
        }
    },

    methods: {
        handleEdit(updatedItem) {
            this.editedData = updatedItem
            this.edited_image = updatedItem.image_change_url
            console.log(this.editedData)
            this.hasChanges = true
            
        },

        async uploadChanges() {
            if (confirm("Are you sure you want to edit this item?") == true) {
                if (this.editedData && this.status_edit_item == 'searcher') {
                    try {
                        console.log(this.lost_item_Id)
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
                        console.log(this.found_item_Id_item_Id)
                        const docRef = doc(db, 'Found Item', this.found_item_Id)
                        if (this.edited_image) {
                            await setDoc(docRef, {...this.editedData, photo: this.edited_image, photo_directory: this.image_file_path}, { merge: true })
                        } else {
                            await setDoc(docRef, {...this.editedData}, { merge: true })
                        }
                        this.hasChanges = false
                        this.editedData = null 
                        alert('Item edited successfully!')
                        this.$router.push('/history')
                    } catch (error) {
                        console.error('Error uploading data:', error)
                    }
                }
            }
        },

        async goBack() {
            // Use Vue Router to navigate to a different page (e.g., "Home Page")
            this.$router.push('/history') // Replace with your desired route path
            this.edited_image = null
            if (this.image_file_path) {
                const storage = getStorage();
                console.log(this.found_item_Id)
                const desertRef = ref(storage, this.image_file_path);
                console.log(desertRef)
                deleteObject(desertRef).then(() => {
                // File deleted successfully
                }).catch((error) => {
                console.log(error)
                });
            }
        },

        handleUploading(isUploading, directory) {
            
            this.uploadingImage = isUploading;
            console.log(this.uploadingImage)
            console.log(this.hasChanges)
            console.log(directory)
            if (this.uploadingImage == false){
                this.hasChanges = true
            }
            this.image_file_path = directory
        },

        noUpdate(boolean) {
            console.log('hahah')
            this.hasChanges = false
            this.uploadingImage = false
        }




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

.edit-item {
    max-width: 500px; 
    /* height: 550px; */
    border-radius: 1rem;
}
</style>
