<script>
import Item from '@/components/Item.vue'
import { storage } from '../firebase.js'
import { app } from '../firebase.js'
import { getFirestore } from 'firebase/firestore'
import { collection, getDoc, doc, deleteDoc } from 'firebase/firestore'
const db = getFirestore(app)
import { useUserStore } from "@/stores/user-store";

export default {
    components: {
        Item,
    },

    async created() {
        await this.fetchItems() // Fetch Firestore data when component is created
    },

    data() {
        // <!-- user_id is for future when user configuration is implemented (when delete need update the history via user id) -->

        return {
            found_item_Ids: [], // Your list of item IDs
            lost_item_Ids: [],
            status: 'all',
            user_id: 'fAQOn1Iz4YfOKk8c9B8zvQSItcy1',
            // isOpen: false,
            // selectedOption: this.value || this.options[0],
            // option: ["all", "founder", "searcher"]
            // itemIdsDb: db.collection("History").get()
        }
    },

    methods: {
        toggleDropdown() {
            this.isOpen = !this.isOpen
        },

        selectOption(option) {
            this.status = option // Update the status
            this.isOpen = false // Close the dropdown
        },

        async fetchItems() {
            try {
                const userStore = useUserStore();
                console.log("User ID:", userStore.userId);
                const his = doc(db, 'History', userStore.userId)
                const docSnap = await getDoc(his) // Wait for document fetch

                if (docSnap.exists()) {
                    this.found_item_Ids = docSnap.data().found_item_id_list || []
                    this.lost_item_Ids = docSnap.data().lost_item_id_list || []
                    if (this.found_item_Ids.length) {
                        this.found_item_Ids.reverse()
                    }
                    if (this.lost_item_Ids.length) {
                        this.lost_item_Ids.reverse()
                    }
                    console.log(this.lost_item_Ids)
                } else {
                    console.log('No such document!')
                }
            } catch (error) {
                console.error('Error fetching Firestore data:', error)
            }
        },
    },

    mounted() {
        document.addEventListener('click', this.closeDropdown)
    },

    beforeDestroy() {
        document.removeEventListener('click', this.closeDropdown)
    },
}

// fetch()
</script>

<template>
    <h1>History <br /></h1>

    <div id="select-bar">
        <select v-model="status">
            <option value="all">Status: All</option>
            <option value="founder">Status: Founder</option>
            <option value="searcher">Status: Searcher</option>
        </select>
    </div>
    <br />

    <div id="item-display">
        <!-- user_id is for future when user configuration is implemented (when delete need update the history via user id) -->
        <Item v-for="found_item_Id in found_item_Ids" :key="found_item_Id" :found_item_Id="found_item_Id" :user_id="user_id" v-if="status == 'all' || status == 'founder'" @item-deleted="fetchItems" id="card" />

        <Item v-for="lost_item_Id in lost_item_Ids" :key="lost_item_Id" :lost_item_Id="lost_item_Id" :user_id="user_id" v-if="status == 'all' || status == 'searcher'" @item-deleted="fetchItems" id = "card"/>
        <!-- <Item /> -->
    </div>

    <div>
        <h5>You've reached the end</h5>
    </div>
    <!-- <header>
    <img alt="Vue logo" class="logo" src="./assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />
    </div>
  </header>

  <main>
    <TheWelcome />
  </main> -->
</template>

<style scoped>
/* header {
  line-height: 1.5;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }
} */

h1 {
    color: #685545;
    text-align: center;
    font-size: 3rem;
}

body {
    background-color: green;
    font-family: Inter;
}

#select-bar select {
    /* padding: 0.32rem 0.38rem; */
    border-radius: 0.5rem;
    border: 0.07rem solid #ccc;
    background-color: white;
    cursor: pointer;
    width: 10rem;  /* Set a fixed width */
    height: 1.57rem;  /* Set a fixed height */
    padding: 0.07rem;  /* Add some padding */
    font-size: 1rem;  /* Ensure text size is the same */
    font-family: 'Inter';
    /* background-color: rgba(251, 240, 230, 1); */
    box-sizing: border-box;
    margin-left: 15.5rem;
    display: flex;
    flex-wrap: wrap;
}

#item-display {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    padding-left: 12.5rem;  /* Optional: Add space inside the container */
    padding-right: 12.5rem;

}

#select-bar {
    /* justify-content: center; */
    margin-left: 7.5rem;
    display: flex;
    flex-wrap: wrap;
}

h5 {
    font-family: Inter;
    text-align: center;
    color: grey;
    font-size: 1.5rem;
}

#card{
    flex: 0 0 20%;

}


</style>
