<template>
    <h2 id="header">Verify Item</h2>
    <div class="container">
        <div class="claim-item card">
            <img v-if="item.photo" :src="item.photo" :alt="item.name" class="item-image" />
            <img v-else src="@/assets/image_not_found.png" :alt="item.name" class="item-image" />
            <img src="@/assets/cross.png" class="close-icon" @click="goBack" />

            <div class="card-content">
                <h3>{{ item.name }}</h3>
                <p><strong>Category:</strong> {{ item.category }}</p>
                <p><strong>Colour:</strong> {{ item.colour }}</p>
                <p><strong>Brand:</strong> {{ item.brand }}</p>
                <p><strong>Location:</strong> {{ item.location }}</p>
                <p><strong>Date & Time Found:</strong> {{ item.date_time_found }}</p>
                <p><strong>Description:</strong> {{ item.description }}</p>

                <button class="claim-button" @click="verifyItem">This Item is Mine</button>
            </div>
        </div>
    </div>
</template>

<script>
import { doc, getDoc, updateDoc, setDoc, serverTimestamp } from 'firebase/firestore'
import { db, auth } from '../firebase.js'
import { onAuthStateChanged } from 'firebase/auth'

export default {
    data() {
        return {
            item: null,
            currentUserID: '',
        }
    },
    created() {
        // Parse the lostItem query parameter from the URL
        const lostItemData = this.$route.query.lostItem
        if (lostItemData) {
            this.item = JSON.parse(lostItemData) // Parse and assign it to the item property
        }

        // Get the current user's ID
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = doc(db, 'users', user.uid)
                const userSnap = await getDoc(userRef)
                if (userSnap.exists()) {
                    this.currentUserID = userSnap.data().userID || user.uid
                }
            }
        })
    },
    methods: {
        async verifyItem() {
            const foundItemId = this.item.id
            const lostItemId = this.$route.query.id

            console.log('Found Item ID:', foundItemId)
            console.log('Lost Item ID:', lostItemId)
            console.log('Current User ID (Searcher):', this.currentUserID)

            try {
                // 1. Find the Found Item document by its ID
                const foundItemRef = doc(db, 'Found Item', foundItemId)
                const foundItemDoc = await getDoc(foundItemRef)
                if (!foundItemDoc.exists()) {
                    throw new Error('Found item not found.')
                }
                const foundItemDetail = foundItemDoc.data()

                // Check if the item is already claimed
                if (foundItemDetail.claimed_status !== 'Not Found Yet') {
                    alert('This item has already been matched.')
                    return
                }

                // 2. Find the Lost Item document by its ID
                const lostItemRef = doc(db, 'Lost Item', lostItemId)
                const lostItemDoc = await getDoc(lostItemRef)
                if (!lostItemDoc.exists()) {
                    throw new Error('Lost item not found.')
                }

                // 3. Get the Founder’s user ID from the Found Item document
                const foundItemData = foundItemDoc.data()
                const founderID = foundItemData.reporter_id // Assumes reporter_id field in Found Item stores the Founder's ID
                if (!founderID) {
                    throw new Error('Founder user ID not found in Found Item.')
                }
                console.log('Founder ID:', founderID)

                // 4. Update both documents to set claimed_status to "Matched"
                await updateDoc(foundItemRef, { claimed_status: 'Matched' })
                await updateDoc(lostItemRef, { claimed_status: 'Matched', photo: foundItemDetail.photo, found_afterwards: false })

                // 5. Initialize the conversation with the new ID format: {user1id}-{user2id}-{founditemid}
                const userIds = [this.currentUserID, founderID].sort()
                const conversationId = `${userIds[0]}-${userIds[1]}-${foundItemId}`
                const conversationRef = doc(db, 'conversations', conversationId)
                const snap = await getDoc(conversationRef)

                if (!snap.exists()) {
                    await setDoc(conversationRef, {
                        roles: {
                            searcher: this.currentUserID,
                            founder: founderID,
                        },
                        createdAt: serverTimestamp(),
                        itemStatus: 'Matched',
                        lostItemId: lostItemId,
                        foundItemId: foundItemId,
                        Notified: false, // Add the Notified field initialized to false
                    })
                }

                // 6. Show success message
                alert(`You have claimed the item: ${this.item.name}`)

                // 7. Navigate to Messages page with conversationId and partnerID
                this.$router.push({
                    name: 'Messages',
                    query: {
                        conversationId: conversationId,
                        partnerID: founderID,
                    },
                })
            } catch (err) {
                console.error('Error verifying item:', err)
                alert('An error occurred while processing your claim.')
            }
        },
        goBack() {
            this.$router.go(-1)
        },
    },
}
</script>

<style scoped>
/* Styles remain unchanged */
#header {
    font-size: 3rem;
    color: #684545;
    text-align: center;
}

.container {
    display: flex;
    align-items: center;
    justify-content: center;
}

.card {
    position: relative;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 0.5rem;
    padding: 1rem;
    width: 29.75rem;
    height: 36.5rem;
    margin: 1rem;
}

.item-image {
    min-height: 17rem;
    max-height: 17rem;
    object-fit: contain;
    display: block;
    margin-top: 0.5rem;
    margin-left: 1.5rem;
    margin-right: 1.5rem;
}

.card-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    margin-left: 1.5rem;
    margin-right: 1.5rem;
    margin-top: 1rem;
}

h3 {
    font-size: 1.5rem;
    margin-bottom: 0.5rem;
    color: black;
}

p {
    font-size: 1rem;
    color: #757575;
    line-height: 1.2rem;
}

.claim-button {
    margin-top: 1rem;
    padding: 0.75rem 1.5rem;
    background-color: #378f00;
    color: white;
    font-size: 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    width: 50%;
    display: flex;
    justify-content: center;
    margin-left: auto;
    margin-right: auto;
}

.claim-button:hover {
    background-color: #378f00;
}

.close-icon {
    position: absolute;
    top: 1rem;
    right: 1rem;
    font-size: 1.5rem;
    color: #888;
    cursor: pointer;
    transition: color 0.3s ease;
    z-index: 10;
}

.close-icon:hover {
    color: #333;
}
</style>
