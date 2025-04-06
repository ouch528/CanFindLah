<template>
    <div class="card" @click="goToClaimPage">
        <img v-if="imageUrl" :src="imageUrl" :alt="item.name" class="item-image" />
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
        }
    },
    mounted() {
        this.imageUrl = this.item.photo || ''
    },
    methods: {
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
</style>
