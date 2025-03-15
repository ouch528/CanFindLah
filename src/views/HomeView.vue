<template>
  <div class="home-view">
    <h1>Chat App</h1>
    <!-- Perspective Selection -->
    <div class="perspective-select">
      <label for="perspective">Select Your Identity:</label>
      <select id="perspective" v-model="currentUser">
        <option>User</option>
        <option>Xavier</option>
        <option>Ziyang</option>
        <option>Mia</option>
      </select>
    </div>
    <!-- User List: only show other users -->
    <UserList :currentUser="currentUser" @conversationStarted="handleConversationStarted" />
    <!-- Chat Panel is shown only if a conversation is selected -->
    <div v-if="conversationId">
      <h2>Conversation: {{ conversationId }}</h2>
      <ChatPanel :conversationId="conversationId" :currentUser="currentUser" />
    </div>
    <div v-else>
      <p>Please select a user to start chatting.</p>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import ChatPanel from '@/components/ChatPanel.vue'
import UserList from '@/components/UserList.vue'

export default {
  name: 'HomeView',
  components: {
    ChatPanel,
    UserList
  },
  setup() {
    const conversationId = ref('')
    const currentUser = ref('User')

    // When the identity changes, clear the conversationId
    watch(currentUser, () => {
      conversationId.value = ''
    })

    const handleConversationStarted = (newId) => {
      conversationId.value = newId
    }

    return { conversationId, currentUser, handleConversationStarted }
  }
}
</script>

<style scoped>
.home-view {
  padding: 20px;
  max-width: 600px;
  margin: auto;
}
.perspective-select {
  margin-bottom: 20px;
}
</style>
