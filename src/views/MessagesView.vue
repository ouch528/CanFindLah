<template>
  <div class="home-view">
    <!-- Main "Messages" heading -->
    <div class="messages-header">
      <h1>Messages</h1>
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
          <ChatPanel
            :conversationId="currentConversationId"
            :currentUserID="currentUserID"
            :partnerID="partnerID"
          />
        </div>
        <div v-else class="no-chat-selected">
          <div class="no-chat-message">
            Select a chat to start messaging
          </div>
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
  background: linear-gradient(to bottom, white, #F1C39C);
  overflow: hidden;
}
.messages-header {
  text-align: center;
  margin-top: 1rem;
  font-family: 'Inter';
}
.messages-header h1 {
  font-size: 2rem;
  color: #7A4B2B;
  margin: 0;
}
.main-content {
  flex: 1;
  display: flex;
  width: 90%;
  max-width: 82rem;
  margin: 0 auto;
  background-color: #F2FAFF;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  overflow: hidden;
}
.sidebar {
  width: 28rem;
  background-color: #FFFAEF;
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
  background: #F2FAFF;
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