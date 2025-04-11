<template>
    <div class="home-view">
        <!-- Main "Messages" heading -->
        <div>
            <h2 id="header">Messages</h2>
        </div>

        <!-- Main content area: two columns (sidebar + chat) -->
        <div class="main-content">
            <!-- Sidebar with list of conversation partners -->
            <div class="sidebar">
                <UserList :currentUserID="currentUserID" @conversationStarted="handleConversationStarted" />
            </div>

            <!-- Chat panel area -->
            <div class="chat-container">
                <div v-if="currentConversationId">
                    <ChatPanel :conversationId="currentConversationId" :currentUserID="currentUserID" :partnerID="partnerID" />
                </div>
                <div v-else class="no-chat-selected">
                    <div class="no-chat-message">Select a chat to start messaging</div>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { onAuthStateChanged } from 'firebase/auth'
import { auth, db } from '../firebase'
import { doc, getDoc } from 'firebase/firestore'
import UserList from '@/components/UserList.vue'
import ChatPanel from '@/components/ChatPanel.vue'

export default {
    components: {
        UserList,
        ChatPanel,
    },
    data() {
        return {
            currentUserID: '',
            currentConversationId: '',
            partnerID: '',
        }
    },
    created() {
        onAuthStateChanged(auth, async (user) => {
            if (user) {
                const userRef = doc(db, 'users', user.uid)
                const userSnap = await getDoc(userRef)
                if (userSnap.exists()) {
                    this.currentUserID = userSnap.data().userID
                }
            }
        })
    },
    methods: {
        handleConversationStarted(conversationId, partnerID) {
            this.currentConversationId = conversationId
            this.partnerID = partnerID
        },
    },
}
</script>

<style scoped>
.home-view {
    height: 80vh;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}

#header {
    font-size: 3rem;
    color: #684545;
    text-align: center;
}

.main-content {
    flex: 1;
    display: flex;
    width: 90%;
    max-width: 82rem;
    margin: 0 auto;
    background-color: #f2faff;
    border-radius: 8px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
    overflow: hidden;
}
.sidebar {
    width: 28rem;
    background-color: #fffaef;
    border-right: 1px solid #ddd;
    overflow-y: auto;
}
.chat-container {
    flex: 1;
    display: flex;
    flex-direction: column;
    overflow: hidden;
}
.no-chat-selected {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    background: #f2faff;
}
.no-chat-message {
    background-color: rgba(0, 0, 0, 0.4);
    padding: 0.5rem 0.5rem;
    border-radius: 2rem;
    font-size: 1.2rem;
    font-weight: 500;
    text-align: center;
    color: white;
    box-shadow: 0 4px 10px rgba(0, 0, 0, 0.1);
}
</style>
