<template>
    <div class="card" @click="goToClaimPage">
        <!-- Show loading spinner if both isLoading is true and imageUrl exists -->
        <div v-if="isLoading && imageUrl" class="loading-spinner"></div>

        <!-- Display the image or fallback image -->
        <img v-if="imageUrl" :src="imageUrl" :alt="item.name" class="item-image" @load="onImageLoad" @error="onImageError" />
        <img v-else src="@/assets/image_not_found.png" :alt="item.name" class="item-image" />

        <div class="card-content">
            <h3>{{ item.name }}</h3>
            <p><strong>Category:</strong> {{ item.category }}</p>
            <p><strong>Colour:</strong> {{ item.colour }}</p>
            <p><strong>Brand:</strong> {{ item.brand }}</p>
            <p><strong>Location:</strong> {{ item.location }}</p>
            <p><strong>Date & Time Found:</strong> {{ item.date_time_found }}</p>
            <p><strong>Description:</strong> {{ item.description }}</p>
        </div>
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
            isLoading: true, // State to track image loading
        }
    },
    mounted() {
        this.imageUrl = this.item.photo || ''
    },
    methods: {
        // Called when image is successfully loaded
        onImageLoad() {
            this.isLoading = false
        },
        // Called if the image fails to load
        onImageError() {
            this.isLoading = false
        },
        goToClaimPage() {
            const formDataCopy = { ...this.item }
            const lostItemID = this.$route.query.id
            console.log(lostItemID)

            this.$router.push({
                name: 'verify',
                query: { lostItem: JSON.stringify(formDataCopy), id: lostItemID },
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
    border-radius: 0.5rem;
    padding: 1rem;
    width: 19.3125rem;
    height: 27.5rem;
    margin: 1rem;
    cursor: pointer;
    transition:
        transform 0.3s ease,
        box-shadow 0.3s ease;
    will-change: transform;
}

.card:hover {
    transform: scale(1.05);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
    z-index: 1;
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

/* .loading-spinner {
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translate(-50%, -50%);
    font-size: 1.5rem;
    color: #757575;
    z-index: 2;
    color: red;
} */

.loading-spinner {
    position: absolute;
    top: 25%;
    left: 50%;
    transform: translate(-50%, -50%);
    width: 3rem; /* Size of the spinner */
    height: 3rem;
    border: 4px solid #f3f3f3; /* Light grey border */
    border-top: 4px solid #3498db; /* Blue color for the spinner */
    border-radius: 50%;
    animation: spin 1s linear infinite; /* Animation for spinning */
    z-index: 2; /* Ensure the spinner is on top */
}

/* Keyframes for spinning animation */
@keyframes spin {
    0% {
        transform: translate(-50%, -50%) rotate(0deg);
    }
    100% {
        transform: translate(-50%, -50%) rotate(360deg);
    }
}
</style>
