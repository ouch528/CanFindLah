<script>
import Item from '@/components/Item.vue'
import { app } from '../firebase.js'
import { getFirestore } from 'firebase/firestore'
import { collection, getDoc, doc, deleteDoc } from 'firebase/firestore'
import { useUserStore } from '@/stores/user-store'

const db = getFirestore(app)

/**
 * History component
 * Displays user's history of found and lost items with filtering capability
 */
export default {
    name: 'HistoryView',
    
    components: {
        Item
    },

    async created() {
        await this.fetchItems()
    },

    data() {
        return {
            // Arrays to store item IDs from Firestore
            found_item_Ids: [],
            lost_item_Ids: [],
            
            // Filter status: 'all', 'founder', or 'searcher'
            status: 'all',
            
            // User ID for history management
            user_id: 'fAQOn1Iz4YfOKk8c9B8zvQSItcy1'
        }
    },

    methods: {
        /**
         * Updates filter status when user selects an option
         * @param {string} option - The selected filter option
         */
        selectOption(option) {
            this.status = option
        },

        /**
         * Fetches user's item history from Firestore
         * Gets both found and lost item IDs from the user's history document
         */
        async fetchItems() {
            try {
                const userStore = useUserStore()
                console.log('User ID:', userStore.userId)
                
                // Get reference to user's history document
                const historyDoc = doc(db, 'History', userStore.userId)
                const docSnap = await getDoc(historyDoc)

                if (docSnap.exists()) {
                    // Extract found and lost item IDs
                    this.found_item_Ids = docSnap.data().found_item_id_list || []
                    this.lost_item_Ids = docSnap.data().lost_item_id_list || []
                    
                    // Reverse arrays to show newest items first
                    if (this.found_item_Ids.length) {
                        this.found_item_Ids.reverse()
                    }
                    if (this.lost_item_Ids.length) {
                        this.lost_item_Ids.reverse()
                    }
                    
                    console.log('Lost items loaded:', this.lost_item_Ids)
                } else {
                    console.log('No history document found for this user')
                }
            } catch (error) {
                console.error('Error fetching history data:', error)
            }
        }
    }
}
</script>

<template>
    <h1>History</h1>

    <!-- Filter dropdown -->
    <div id="select-bar">
        <select v-model="status">
            <option value="all">Status: All</option>
            <option value="founder">Status: Founder</option>
            <option value="searcher">Status: Searcher</option>
        </select>
    </div>
    <br />

    <!-- Item display section -->
    <div id="item-display">
        <!-- Found items (displayed when status is 'all' or 'founder') -->
        <Item 
            v-for="found_item_Id in found_item_Ids" 
            :key="found_item_Id" 
            :found_item_Id="found_item_Id" 
            :user_id="user_id" 
            v-if="status === 'all' || status === 'founder'" 
            @item-deleted="fetchItems" 
            id="card" 
        />

        <!-- Lost items (displayed when status is 'all' or 'searcher') -->
        <Item 
            v-for="lost_item_Id in lost_item_Ids" 
            :key="lost_item_Id" 
            :lost_item_Id="lost_item_Id" 
            :user_id="user_id" 
            v-if="status === 'all' || status === 'searcher'" 
            @item-deleted="fetchItems" 
            id="card" 
        />
    </div>

    <!-- End of list indicator -->
    <div>
        <h5>You've reached the end</h5>
    </div>
</template>

<style scoped>
h1 {
    color: #685545;
    text-align: center;
    font-size: 3rem;
}

/* Filter dropdown styling */
#select-bar select {
    border-radius: 0.5rem;
    border: 0.07rem solid #ccc;
    background-color: white;
    cursor: pointer;
    width: 10rem;
    height: 1.57rem;
    padding: 0.07rem;
    font-size: 1rem;
    font-family: 'Inter';
    box-sizing: border-box;
    display: flex;
    flex-wrap: wrap;
}

/* Container for item cards */
#item-display {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding-left: 10rem;
    padding-right: 10rem;
}

/* Center the filter dropdown */
#select-bar {
    justify-content: center;
    display: flex;
    flex-wrap: wrap;
}

/* End of list text */
h5 {
    font-family: Inter;
    text-align: center;
    color: grey;
    font-size: 1.5rem;
}

/* Individual item card sizing */
#card {
    flex: 0 0 20%;
}
</style>