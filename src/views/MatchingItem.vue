<template>
    <h2 id="header">Similar Items Found</h2>
    <div>
        <!-- Loading and error messages -->
        <p v-if="loading">Searching for matching items...</p>
        <p v-if="error" class="error">{{ error }}</p>

        <!-- Display matching items using the SimilarItem component -->
        <div class="card-container" v-if="matchingItems.length > 0">
            <SimilarItem v-for="item in matchingItems" :key="item.id" :item="item" />
        </div>

        <!-- No matching items message -->
        <p id="no-match" v-else-if="!loading && !matchingItems.length">
            No matching items found yet. <br />
            <br />
            An email notification will be sent if a similar item has been found.
        </p>

        <p id="end" v-if="matchingItems.length > 0">You've reached the end.</p>
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
            console.log('Query Parameters:', this.$route.query)

            const lostItem = this.$route.query.lostItem
            if (!lostItem) {
                throw new Error('')
            }

            const parsedLostItem = JSON.parse(lostItem)
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

#no-match {
    text-align: center;
    font-size: 1.5rem;
}

#end {
    text-align: center;
    font-size: 1.5rem;
    margin-top: 4.125rem;
}
</style>
