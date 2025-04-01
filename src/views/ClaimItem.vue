<template>
    <h2 id="header">Claim Item</h2>
    <div class="container">
        <div class="claim-item card">
            <img v-if="item.photo" :src="item.photo" :alt="item.name" class="item-image" />

            <div class="card-content">
                <h3>{{ item.name }}</h3>
                <p><strong>Category:</strong> {{ item.category }}</p>
                <p><strong>Colour:</strong> {{ item.colour }}</p>
                <p><strong>Brand:</strong> {{ item.brand }}</p>
                <p><strong>Location:</strong> {{ item.location }}</p>
                <p><strong>Date & Time Found:</strong> {{ item.date_time_found }}</p>
                <p><strong>Description:</strong> {{ item.description }}</p>

                <button class="claim-button" @click="claimItem">Claim This Item</button>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            item: null,
        }
    },
    created() {
        // Parse the lostItem query parameter from the URL
        const lostItemData = this.$route.query.lostItem
        if (lostItemData) {
            this.item = JSON.parse(lostItemData) // Parse and assign it to the item property
        }
    },
    methods: {
        claimItem() {
            // Handle the logic to claim the item
            alert(`You have claimed the item: ${this.item.name}`)
        },
    },
}
</script>

<style scoped>
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
    display: flex;
    flex-direction: column;
    background: white;

    border-radius: 1rem;
    padding: 1rem;
    width: 20.3125rem;
    height: 30.5rem;
    margin: 1rem;
}

.item-image {
    min-height: 13rem;
    max-height: 13rem;
    width: 100%;
    object-fit: contain;
    display: block;
}

.card-content {
    display: flex;
    flex-direction: column;
    justify-content: space-between;
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
}

.claim-button:hover {
    background-color: #45a049;
}
</style>
