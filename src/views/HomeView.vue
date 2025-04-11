<template>
    <div class="content-wrapper">
        <div class="container">
            <div class="text-section">
                <h3 id="welcome-msg" ref="welcomeText"></h3>

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
    </div>
    
</template>

<script>
import { getFirestore } from 'firebase/firestore'
import { collection, query, where, onSnapshot } from 'firebase/firestore'
import { auth } from '../firebase.js'
import { db } from '../firebase.js'

export default {
    name: 'Home',
    data() {
        return {
            claimed: 0,
            found: 0,
            yetToBeClaimed: 0,
            userName: ''
        }
    },
    mounted() {
        const user = auth.currentUser
        if (user) {
            this.userName = user.displayName || user.email || 'there'
        }

        const claimedQuery = query(collection(db, 'Found Item'), where('claimed_status', '==', 'Returned'))
        onSnapshot(claimedQuery, (snapshot) => {
            this.claimed = snapshot.size
        })

        const foundQuery = query(collection(db, 'Lost Item'), where('claimed_status', '==', 'Returned'))
        onSnapshot(foundQuery, (snapshot) => {
            this.found = snapshot.size
        })

        const yetToBeClaimedQuery = query(collection(db, 'Found Item'), where('claimed_status', '==', 'Not Found Yet'))
        onSnapshot(yetToBeClaimedQuery, (snapshot) => {
            this.yetToBeClaimed = snapshot.size
        })

        // Use $nextTick to ensure DOM is updated and the ref is available
        this.$nextTick(() => {
            const fullText = `Welcome, ${this.userName}.`
            let i = 0
            const interval = setInterval(() => {
                // Always check if the element exists before modifying it
                if (this.$refs.welcomeText) {
                    if (i < fullText.length) {
                        this.$refs.welcomeText.textContent += fullText.charAt(i)
                        i++
                    } else {
                        clearInterval(interval)
                    }
                }
            }, 30)
        })
    },
    methods: {},
}
</script>

<style scoped>
* {
    font-family: Arial;
}

a {
    text-decoration: none;
}

.content-wrapper {
    max-width: 1440px;
    margin: 0 auto;
}

#main-msg {
    line-height: 1.25;
    font-weight: 700;
    text-align: left;
    font-size: 4.375rem;
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 1s ease-out forwards;
    animation-delay: 0.3s;
}

@keyframes fadeInUp {
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

#welcome-msg {
    font-weight: 400;
    text-align: left;
    font-size: 1.5rem;
}

.container {
    text-align: center;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 4.75rem;
}

.text-section {
    margin-left: 12.125rem;
    margin-top: auto;
    margin-bottom: auto;
}

.nav-section {
    margin-right: 12.125rem;
}

#lost-item-nav,
#found-item-nav {
    color: white;
    font-size: 2rem;
    font-weight: 700;
    border-radius: 1.25rem;
    height: 12.5rem;
    width: 27.75rem;
    margin-left: auto;
    margin-right: auto;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    text-align: center;
    opacity: 0;
    transform: translateY(20px);
    animation: fadeInUp 1s ease-out forwards;
    animation-delay: 0.3s;
}

#lost-item-nav {
    background-color: #ff8844;
    font-size: 2.5rem;
}

#found-item-nav {
    background-color: #4a95df;
    font-size: 2.5rem;
}

#found-item-nav img,
#lost-item-nav img {
    width: 4.5rem;
    height: 4.5rem;
}

.stats {
    text-align: center;
    display: flex;
    justify-content: space-between;
    margin-left: 10rem;
    margin-right: 10rem;
    margin-top: 7.81rem;
}

.stats h1 {
    font-size: 5.25rem;
    text-align: center;
    margin-top: 0;
    margin-bottom: 0;
}

.stats h3 {
    color: #747373;
    font-size: 1.875rem;
    width: 16.625rem;
    margin-top: 3.5rem;
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
