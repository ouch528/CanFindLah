<template>
  <div class="container">
    <div class="text-section">
      <h3 id="welcome-msg">Welcome, Jane Doe.</h3>

      <h1 id="main-msg">
        Find and <br />
        Recover with <br />
        Ease.
      </h1>
    </div>

    <div class="nav-section">
      <RouterLink to="/report_lost">
        <div id="lost-item-nav">
          <img src="@/assets/lost_item_icon.png" />
          Report Lost Item
        </div>
      </RouterLink>

      <br />

      <RouterLink to="/report_found">
        <div id="found-item-nav">
          <img src="@/assets/found_item_icon.png" />
          Report Found Item
        </div>
      </RouterLink>
    </div>
  </div>

  <div class="stats">
    <div id="claimed">
      <h1>{{ claimed }}</h1>
      <h3>Items Claimed</h3>
    </div>

    <div id="found">
      <h1>{{ found }}</h1>
      <h3>Items Found</h3>
    </div>

    <div id="yet">
      <h1>{{ yetToBeClaimed }}</h1>
      <h3>Items Yet to be Claimed</h3>
    </div>
  </div>
</template>

<script>
import firebaseApp from '../firebase.js'
import { getFirestore } from 'firebase/firestore'
import { getDocs, collection, query, where, onSnapshot } from 'firebase/firestore'
const db = getFirestore(firebaseApp)

export default {
  name: 'Home',
  data() {
    return {
      claimed: 0,
      found: 0,
      yetToBeClaimed: 0,
    }
  },
  mounted() {
    const claimedQuery = query(collection(db, 'Found Item'), where('claimed_status', '==', true))

    onSnapshot(claimedQuery, (snapshot) => {
      this.claimed = snapshot.size
    })

    const foundQuery = query(collection(db, 'Lost Item'), where('claimed_status', '==', true))

    onSnapshot(foundQuery, (snapshot) => {
      this.found = snapshot.size
    })

    const yetToBeClaimedQuery = query(
      collection(db, 'Found Item'),
      where('claimed_status', '==', false),
    )

    onSnapshot(yetToBeClaimedQuery, (snapshot) => {
      this.yetToBeClaimed = snapshot.size
    })
  },

  methods: {},
}
</script>

<style scoped>
* {
  font-family: Arial;
}

#main-msg {
  line-height: 1.25;
  font-weight: 700;
  text-align: left;
  font-size: 70px;
}

#welcome-msg {
  font-weight: 400;
  text-align: left;
  font-size: 24px;
}

.container {
  text-align: center;
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.text-section {
  margin-left: 194px;
  margin-top: 30px;
}

.nav-section {
  margin-right: 194px;
}

#lost-item-nav,
#found-item-nav {
  color: white;
  font-size: 2rem;
  font-weight: 700;
  border-radius: 20px;
  height: 200px;
  width: 444px;
  margin-left: auto;
  margin-right: auto;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
}

#lost-item-nav {
  background-color: #ff8844;
  font-size: 40px;
}

#found-item-nav {
  background-color: #4a95df;
  font-size: 40px;
}

#found-item-nav img,
#lost-item-nav img {
  width: 72px;
  height: 72px;
}

.stats {
  text-align: center;
  justify-content: space-between;
  display: flex;
  justify-content: space-between;
  margin-left: 160px;
  margin-right: 160px;
}

.stats h1 {
  text-align: center;
}

.stats h3 {
  color: #747373;
}

#claimed h1 {
  color: #0b8b1c;
}

#found h1 {
  color: #3f61c7;
}

#yet {
  color: #af2c2c;
}
</style>
