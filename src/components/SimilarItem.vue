<template>
    <div class="card">
        <img v-if="imageUrl" :src="imageUrl" :alt="item.name" class="item-image" />

        <div class="card-content">
            <h3>{{ item.name }}</h3>
            <p><strong>Category:</strong> {{ item.category }}</p>
            <p><strong>Colour:</strong> {{ item.colour }}</p>
            <p><strong>Brand:</strong> {{ item.brand }}</p>
            <p><strong>Location:</strong> {{ item.location }}</p>
            <p><strong>Date & Time Found:</strong> {{ item.date_time_found }}</p>
            <p><strong>Description:</strong> {{ item.description }}</p>
        </div>

        <!-- Claim Button (use this.$router.push) -->
        <button class="claim-button" @click="goToClaimPage">Claim Item</button>
    </div>
</template>

<script>
export default {
    props: {
        item: {
            type: Object,
            required: true,
        },
    },
    data() {
        return {
            imageUrl: null,
        }
    },
    mounted() {
        if (this.item.photo) {
            this.imageUrl = this.item.photo // Use direct URL from Firestore
        } else {
            this.imageUrl = '' // Fallback image
        }
    },
    methods: {
        goToClaimPage() {
            // Prepare the object with the item data
            const formDataCopy = {
                id: this.item.id,
                name: this.item.name,
                category: this.item.category,
                colour: this.item.colour,
                brand: this.item.brand,
                location: this.item.location,
                date_time_found: this.item.date_time_found,
                description: this.item.description,
                photo: this.item.photo,
                // Add other properties you may need
            }

            // Use this.$router.push to navigate to the "matching" route with query params
            this.$router.push({
                name: 'claim',
                query: { lostItem: JSON.stringify(formDataCopy) },
            })
        },
    },
}
</script>

<style scoped>
.card {
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 1rem;
    padding: 1rem;
    width: 20.3125rem;
    height: 29.5rem;
    margin: 1rem;
}

.item-image {
    min-height: 13rem;
    max-height: 13rem;
    width: 100%;
    object-fit: contain;
    display: block;
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
    background-color: #4caf50; /* Green */
    color: white;
    font-size: 1rem;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    transition: background-color 0.3s ease;
}

.claim-button:hover {
    background-color: #45a049;
}
</style>
