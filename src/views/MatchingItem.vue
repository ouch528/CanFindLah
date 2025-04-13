<template>
    <h2 id="header">Similar Items Found</h2>
    <div>
        <!-- Loading and error messages -->
        <p v-if="loading">Searching for matching items...</p>

        <p v-if="errorMessage === 'The lost item has already been matched.'" id="already-matched">This lost item has already been matched with another item.</p>

        <!-- Display matching items using the SimilarItem component -->
        <div class="card-container" v-if="matchingItems.length > 0">
            <SimilarItem v-for="item in matchingItems" :key="item.id" :item="item" />
        </div>

        <!-- No matching items message -->
        <p id="no-match" v-else-if="!loading && !matchingItems.length && !errorMessage">
            No matching items found yet. <br />
            <br />
            An email notification will be sent if a similar item has been found.
        </p>

        <p id="end" v-if="matchingItems.length > 0">You've reached the end.</p>
    </div>
</template>

<script>
import { doc, getDoc } from 'firebase/firestore' // Import Firestore v9 functions
import SimilarItem from '@/components/SimilarItem.vue'
import { findMatchingItems } from '@/components/matchingService.js'
import { db } from '@/firebase' // Assuming db is the Firestore instance
import { updateDoc } from 'firebase/firestore'

export default {
    name: 'MatchingItem',
    components: {
        SimilarItem,
    },
    data() {
        return {
            matchingItems: [],
            loading: false,
            errorMessage: '', // Error message to display if any
        }
    },
    async mounted() {
        this.refreshMatchingItems()
    },
    methods: {
        async refreshMatchingItems() {
            this.loading = true
            this.errorMessage = '' // Clear any previous error messages
            try {
                console.log('Query Parameters:', this.$route.query)

                const lostItem = this.$route.query.lostItem
                const lostItemID = this.$route.query.id

                console.log('Lost Item ID:', lostItemID)

                if (!lostItem || !lostItemID) {
                    this.errorMessage = 'Lost item data is missing.'
                    return
                }

                // Fetch the lost item document from Firestore
                const lostItemDocRef = doc(db, 'Lost Item', lostItemID) // Get the document reference
                const lostItemDocSnap = await getDoc(lostItemDocRef) // Fetch the document

                // Check if the document exists and if the claimed_status is "Not Found Yet"
                if (!lostItemDocSnap.exists() || lostItemDocSnap.data().claimed_status !== 'Not Found Yet') {
                    this.errorMessage = 'The lost item has already been matched.'
                    return
                }

                const parsedLostItem = JSON.parse(lostItem)
                const matchingItems = await findMatchingItems(parsedLostItem)

                // Filter items with 'claimed_status' as "Not Found Yet"
                this.matchingItems = matchingItems.filter((item) => item.claimed_status === 'Not Found Yet')

                await updateDoc(lostItemDocRef, { found_afterwards: false })
                if (this.matchingItems.length > 0) {
                    await updateDoc(lostItemDocRef, { already_similar_item: true })
                } else {
                    await updateDoc(lostItemDocRef, { already_similar_item: false })
                }
            } catch (err) {
                this.errorMessage = 'An error occurred while fetching the matching items.'
            } finally {
                this.loading = false
            }
        },
    },
    beforeRouteEnter(to, from, next) {
        // Force data refresh when entering the route
        next((vm) => {
            vm.refreshMatchingItems()
        })
    },
    beforeRouteUpdate(to, from, next) {
        // Force data refresh when navigating between pages (e.g., using back button)
        this.refreshMatchingItems()
        next()
    },
}
</script>

<style scoped>
#header {
    font-size: 3rem;
    color: #684545;
    text-align: center;
}

.error {
    color: red;
    font-weight: bold;
}

.card-container {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 1rem;
    padding: 1rem;
}

#already-matched {
    text-align: center;
    font-size: 1.5rem;
}

#no-match {
    text-align: center;
    font-size: 1.5rem;
}

#end {
    text-align: center;
    font-size: 1.5rem;
    margin-top: 4.125rem;
    margin-bottom: 4.125rem;
}
</style>
