<template>
    <div class="content-wrapper">
        <!-- Main content container with welcome message and navigation options -->
        <div class="container">
            <!-- Welcome text and main message -->
            <div class="text-section">
                <h3 id="welcome-msg" ref="welcomeText"></h3>
                <h1 id="main-msg">
                    Find and <br />
                    Recover with <br />
                    Ease.
                </h1>
                <p>test github auto deploy</p>
            </div>

            <!-- Navigation buttons for reporting lost/found items -->
            <div class="nav-section">
                <RouterLink to="/report_lost">
                    <div id="lost-item-nav">
                        <img src="@/assets/lost_item_icon.png" alt="Lost item icon" />
                        Report Lost Item
                    </div>
                </RouterLink>

                <br />

                <RouterLink to="/report_found">
                    <div id="found-item-nav">
                        <img src="@/assets/found_item_icon.png" alt="Found item icon" />
                        Report Found Item
                    </div>
                </RouterLink>
            </div>
        </div>

        <!-- Statistics display section -->
        <div class="stats">
            <div id="claimed">
                <h1>{{ claimed }}</h1>
                <h3>Items Returned</h3>
            </div>

            <div id="found">
                <h1>{{ found }}</h1>
                <h3>Items Matched</h3>
            </div>

            <div id="yet">
                <h1>{{ yetToBeClaimed }}</h1>
                <h3>Items Yet to be Claimed</h3>
            </div>
        </div>
    </div>
</template>

<script>
import { collection, query, where, onSnapshot, doc, getDoc } from 'firebase/firestore'
import { auth, db } from '../firebase.js'

/**
 * Home Component
 * Serves as the landing page for the lost and found application
 * Features a personalized welcome message, navigation options, and real-time statistics
 */
export default {
    name: 'HomeView',
    
    data() {
        return {
            claimed: 0,       // Count of returned items
            found: 0,         // Count of matched items
            yetToBeClaimed: 0, // Count of items not yet claimed
            userName: '',     // User's name for personalized greeting
        }
    },
    
    mounted() {
        this.initializeUserAndStats()
    },
    
    methods: {
        /**
         * Initializes the component by fetching user data and setting up real-time stats
         */
        initializeUserAndStats() {
            // Get current user and fetch their name
            const user = auth.currentUser
            if (user) {
                this.fetchUserName(user.uid)
            } else {
                // Default fallback if no user is logged in
                this.userName = 'there'
                this.startWelcomeAnimation()
            }

            // Set up real-time listeners for statistics
            this.setupStatsListeners()
        },

        /**
         * Sets up Firebase listeners for real-time statistics
         */
        setupStatsListeners() {
            // Listen for items that have been returned to owners
            const claimedQuery = query(collection(db, 'Found Item'), where('claimed_status', '==', 'Returned'))
            onSnapshot(claimedQuery, (snapshot) => {
                this.claimed = snapshot.size
            })

            // Listen for items that have been matched but not yet returned
            const foundQuery = query(collection(db, 'Found Item'), where('claimed_status', '==', 'Matched'))
            onSnapshot(foundQuery, (snapshot) => {
                this.found = snapshot.size
            })

            // Listen for items that have not been matched yet
            const yetToBeClaimedQuery = query(collection(db, 'Found Item'), where('claimed_status', '==', 'Not Found Yet'))
            onSnapshot(yetToBeClaimedQuery, (snapshot) => {
                this.yetToBeClaimed = snapshot.size
            })
        },

        /**
         * Fetches user's name from Firestore
         * @param {string} userId - The current user's ID
         */
        async fetchUserName(userId) {
            try {
                const userDocRef = doc(db, 'users', userId)
                const userDoc = await getDoc(userDocRef)

                if (userDoc.exists()) {
                    // Use the name field from the users collection
                    this.userName = userDoc.data().name || 'there'
                } else {
                    // Fallback if user document doesn't exist
                    this.userName = 'there'
                }

                // Start the typing animation after we have the user name
                this.startWelcomeAnimation()
            } catch (error) {
                console.error('Error fetching user data:', error)
                this.userName = 'there'
                this.startWelcomeAnimation()
            }
        },

        /**
         * Creates a typing animation effect for the welcome message
         */
        startWelcomeAnimation() {
            this.$nextTick(() => {
                const fullText = `Welcome, ${this.userName}.`
                let i = 0

                // Clear any existing text first
                if (this.$refs.welcomeText) {
                    this.$refs.welcomeText.textContent = ''
                }

                // Add one character at a time to create typing effect
                const interval = setInterval(() => {
                    if (this.$refs.welcomeText) {
                        if (i < fullText.length) {
                            this.$refs.welcomeText.textContent += fullText.charAt(i)
                            i++
                        } else {
                            clearInterval(interval)
                        }
                    } else {
                        // Safety check - clear interval if element doesn't exist
                        clearInterval(interval)
                    }
                }, 30) // 30ms delay between characters
            })
        }
    }
}
</script>

<style scoped>
/* Remove underline from router links */
a {
    text-decoration: none;
}

/* Main content container */
.content-wrapper {
    max-width: 1440px;
    margin: 0 auto;
}

/* Main message styling with animation */
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

/* Animation for fade-in with upward motion */
@keyframes fadeInUp {
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Welcome message styling */
#welcome-msg {
    font-weight: 400;
    text-align: left;
    font-size: 1.5rem;
}

/* Container layout */
.container {
    text-align: center;
    display: flex;
    justify-content: space-between;
    align-items: flex-start;
    margin-top: 4.75rem;
}

/* Text section positioning */
.text-section {
    margin-left: 12.125rem;
    margin-top: auto;
    margin-bottom: auto;
}

/* Navigation section positioning */
.nav-section {
    margin-right: 12.125rem;
}

/* Common styles for navigation buttons */
#lost-item-nav,
#found-item-nav {
    color: white;
    font-size: 2.5rem;
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

/* Button-specific colors */
#lost-item-nav {
    background-color: #ff8844;
}

#found-item-nav {
    background-color: #4a95df;
}

/* Icon sizing for navigation buttons */
#found-item-nav img,
#lost-item-nav img {
    width: 4.5rem;
    height: 4.5rem;
}

/* Hover effects */
#found-item-nav:hover {
    background-color: #3487db;
}

#lost-item-nav:hover {
    background-color: #f8772d;
}

/* Statistics section layout */
.stats {
    text-align: center;
    display: flex;
    justify-content: space-between;
    margin-left: 10rem;
    margin-right: 10rem;
    margin-top: 7.81rem;
}

/* Common styles for statistic numbers */
.stats h1 {
    font-size: 5.25rem;
    text-align: center;
    margin-top: 0;
    margin-bottom: -2.5rem;
}

/* Common styles for statistic labels */
.stats h3 {
    color: #747373;
    font-size: 1.875rem;
    width: 16.625rem;
    margin-top: 3.5rem;
}

/* Color coding for different statistics */
#claimed h1 {
    color: #0b8b1c; /* Green for returned items */
}

#found h1 {
    color: #3f61c7; /* Blue for matched items */
}

#yet h1 {
    color: #af2c2c; /* Red for unclaimed items */
}
</style>