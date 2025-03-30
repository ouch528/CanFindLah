<template>
    <SimilarItem />
    <div>
        <!-- Loading and error messages -->
        <p v-if="loading">Searching for matching items...</p>
        <p v-if="error" class="error">{{ error }}</p>

        <!-- Display matching items if available -->
        <ul v-if="matchingItems.length > 0">
            <li v-for="item in matchingItems" :key="item.id" class="item">
                <h3>{{ item.name }}</h3>
                <p><strong>Category:</strong> {{ item.category }}</p>
                <p><strong>Colour:</strong> {{ item.colour }}</p>
                <p><strong>Brand:</strong> {{ item.brand }}</p>
                <p><strong>Location:</strong> {{ item.location }}</p>
                <p><strong>Date & Time Found:</strong> {{ item.date_time_found }}</p>
                <p><strong>Description:</strong> {{ item.description }}</p>
            </li>
        </ul>

        <!-- No matching items message -->
        <p id="no-match" v-else-if="!loading && !matchingItems.length">
            No matching items found yet. <br />
            <br />
            An email notification will be sent if a similar item has been found.
        </p>
    </div>
</template>

<script>
import SimilarItem from '@/components/SimilarItem.vue'
import { findMatchingItems } from '@/components/matchingService.js'

export default {
    name: 'MatchingItem',
    components: {
        SimilarItem,
    },
    data() {
        return {
            matchingItems: [],
            loading: false,
            error: '',
        }
    },
    async mounted() {
        this.loading = true

        try {
            // Log the query parameters to see what data is being passed
            console.log('Query Parameters:', this.$route.query)

            // Access the lostItem data from query parameters
            const lostItem = this.$route.query.lostItem

            // If the lostItem exists as a query parameter, parse it if necessary
            if (!lostItem) {
                throw new Error('Lost item data not found in query parameters.')
            }

            // If the lostItem is a string (e.g., it was stringified), parse it
            const parsedLostItem = JSON.parse(lostItem)

            // Now use the parsedLostItem to find matching items
            this.matchingItems = await findMatchingItems(parsedLostItem)
        } catch (err) {
            this.error = err.message
        } finally {
            this.loading = false
        }
    },
}
</script>

<style scoped>
.error {
    color: red;
    font-weight: bold;
}

.item {
    margin-bottom: 20px;
    padding: 10px;
    border: 1px solid #ddd;
    border-radius: 5px;
    background-color: #f9f9f9;
}

h2 {
    color: #2c3e50;
}

strong {
    font-size: 1.1em;
}

#no-match {
    text-align: center;
    font-size: 1.5rem;
}
</style>
