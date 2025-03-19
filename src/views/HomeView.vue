<template>
  <div class="home-view">
    <!-- Top navbar -->
    <NavBar />

    <!-- Main "Messages" heading -->
    <div class="messages-header">
      <h1>Messages</h1>
    </div>

    <!-- Identity selection -->
    <div class="perspective-select">
      <label for="perspective">Select Your Identity:</label>
      <select id="perspective" v-model="currentUser">
        <option>User</option>
        <option>Xavier</option>
        <option>Ziyang</option>
        <option>Mia</option>
      </select>
    </div>

    <!-- Main content area: two columns (sidebar + chat) -->
    <div class="main-content">
      <!-- Sidebar with list of conversation partners -->
      <div class="sidebar">
        <UserList :currentUser="currentUser" @conversationStarted="handleConversationStarted" />
      </div>

      <!-- Chat panel area -->
      <div class="chat-container">
        <div v-if="conversationId">
          <ChatPanel
            :conversationId="conversationId"
            :currentUser="currentUser"
            :partnerName="partnerName"
          />
        </div>
        <div v-else>
          <p>Please select a user to start chatting.</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import NavBar from '@/components/NavBar.vue'
import ChatPanel from '@/components/ChatPanel.vue'
import UserList from '@/components/UserList.vue'

export default {
  name: 'HomeView',
  components: {
    NavBar,
    ChatPanel,
    UserList
  },
  data() {
    return {
      conversationId: '',
      currentUser: 'User',
      partnerName: '' // store the other participant here
    }
  },
  methods: {
  handleConversationStarted(newId) {
    this.conversationId = newId
    // Extract partner name from newId:
    const participants = newId.split('-')
    this.partnerName = participants.find(name => name !== this.currentUser)
  }
}
}
</script>

<style scoped>
.home-view {
  /* A gradient background, like in your screenshot */
  background: linear-gradient(to bottom, white, #F1C39C);
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

/* Header for "Messages" */
.messages-header {
  text-align: center;
  margin-top: 1rem;
}

.messages-header h1 {
  font-size: 2rem;
  color: #7A4B2B; /* Example brand color */
  margin: 0;
}

/* The container for the sidebar + chat panel */
.main-content {
  display: flex;
  width: 90%;
  max-width: 1200px;
  margin: 1rem auto;
  background-color: #fff; /* optional: a white background behind content */
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2); /* optional: subtle shadow */
}

/* Sidebar for the user list */
.sidebar {
  width: 25%;
  min-width: 200px; /* ensure some minimum space */
  padding: 1rem;
  border-right: 1px solid #ddd; /* separate sidebar from chat */
}

/* Container for the chat area */
.chat-container {
  flex: 1;
}
</style>