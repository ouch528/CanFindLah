<script>

// import HelloWorld from './components/HelloWorld.vue'
// import TheWelcome from './components/TheWelcome.vue'
import Item from "./Item.vue";
import firebaseApp, {storage} from "../../firebase.js";
import { getFirestore } from "firebase/firestore"
import {collection, getDoc, doc, deleteDoc} from "firebase/firestore"
const db = getFirestore(firebaseApp);

export default {
    components :{
        Item,
    },

    async created() {
        await this.fetchItems(); // Fetch Firestore data when component is created
    },

    // async fetch() {
    //     const his = doc(db, "History", "123456")
    //     const docSnap = getDoc(his);
    //     console.log(docSnap.data().found_item_id_list)

    // },


    data() {
        
        return {
        found_item_Ids: [], // Your list of item IDs
        lost_item_Ids: [],
        status : "all"
        // itemIdsDb: db.collection("History").get()
        };
    },
    
    methods: {
        async fetchItems() {
            try {
                const his = doc(db, "History", "123456"); // Firestore document reference
                const docSnap = await getDoc(his); // Wait for document fetch

                if (docSnap.exists()) {
                    this.found_item_Ids = docSnap.data().found_item_id_list; // Update state
                    this.lost_item_Ids = docSnap.data().lost_item_id_list;
                    // console.log("Fetched Items:", this.itemIds);
                    console.log(this.lost_item_Ids)
                } else {
                    console.log("No such document!");
                }
            } catch (error) {
                console.error("Error fetching Firestore data:", error);
            }
        }
    }
};

// fetch()
</script>

<template>
    <h1>
        History <br>
    </h1>

    <div>
        <select v-model = "status">
            <option value = "all">Status: All</option>
            <option value = "founder">Status: Founder</option>
            <option value = "searcher">Status: Searcher</option>
        </select>
        
    </div>
    <br>

    <div id = "item-display">
        <Item
            v-for="found_item_Id in found_item_Ids"
            :key="found_item_Id"
            :found_item_Id="found_item_Id"
            v-if = "status == 'all' || status == 'founder'"
        />

        <Item
            v-for = "lost_item_Id in lost_item_Ids"
            :key = "lost_item_Id"
            :lost_item_Id = "lost_item_Id"
            v-if = "status == 'all' || status == 'searcher'"
        />
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

    h1{
        color: brown;
        text-align: center;
        
    }

    body {
        background-color: green;
    }

    select {
    padding: 5px 10px;
    border-radius: 5px;
    border: 1px solid #ccc;
    background-color: white;
    cursor: pointer;
    }

    #item-display {
        display: flex;
    flex-wrap: wrap;
    }
</style>
