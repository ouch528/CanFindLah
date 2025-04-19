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
        <UserList
          :currentUserID="currentUserID"
          @conversationStarted="handleConversationStarted"
          @conversationDeleted="handleConversationDeleted"
        />
      </div>
      
      <!-- Chat panel area -->
      <div class="chat-container">
        <div v-if="currentConversationId">
          <ChatPanel
            :conversationId="currentConversationId"
            :currentUserID="currentUserID"
            :partnerID="partnerID"
            @conversationDeleted="handleConversationDeleted"
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
import { onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db } from '../firebase';
import UserList from '@/components/UserList.vue';
import ChatPanel from '@/components/ChatPanel.vue';

/**
 * MessagesView Component
 * 
 * Displays the main messaging interface with a sidebar showing conversation partners
 * and a main area for chat messages. Handles user authentication, conversation selection,
 * and conversation deletion.
 */
export default {
  name: 'MessagesView',
  
  components: {
    UserList,
    ChatPanel,
  },
  
  data() {
    return {
      currentUserID: '',       // ID of the authenticated user
      currentConversationId: '', // ID of the selected conversation
      partnerID: '',           // ID of the user's conversation partner
    };
  },
  
  created() {
    // Initialize component with user authentication
    this.initializeAuthState();
  },
  
  methods: {
    /**
     * Sets up authentication state monitoring and loads user data
     */
    initializeAuthState() {
      onAuthStateChanged(auth, async (user) => {
        if (user) {
          await this.loadUserData(user.uid);
        }
      });
    },
    
    /**
     * Loads user data from Firestore and initializes conversation if needed
     * @param {string} uid - The user's Firebase UID
     */
    async loadUserData(uid) {
      const userRef = doc(db, 'users', uid);
      const userSnap = await getDoc(userRef);
      
      if (userSnap.exists()) {
        // Use the custom userID if available, otherwise use Firebase UID
        this.currentUserID = userSnap.data().userID || uid;
        
        // Check if there's a conversation ID in URL params
        this.checkQueryParams();
      }
    },
    
    /**
     * Updates the active conversation when a user selects one from the sidebar
     * @param {string} conversationId - The ID of the selected conversation
     * @param {string} partnerID - The ID of the conversation partner
     */
    handleConversationStarted(conversationId, partnerID) {
      this.currentConversationId = conversationId;
      this.partnerID = partnerID;
    },
    
    /**
     * Checks URL query parameters for conversation data
     * Used for direct linking to specific conversations
     */
    checkQueryParams() {
      const { conversationId, partnerID } = this.$route.query;
      if (conversationId && partnerID) {
        this.currentConversationId = conversationId;
        this.partnerID = partnerID;
      }
    },
    
    /**
     * Handles conversation deletion by resetting the current conversation if needed
     * @param {string} conversationId - The ID of the deleted conversation
     */
    handleConversationDeleted(conversationId) {
      // If the deleted conversation is the currently displayed one, reset the state
      if (this.currentConversationId === conversationId) {
        this.currentConversationId = '';
        this.partnerID = '';
      }
    },
  },
};
</script>

<style scoped>
/* Main container */
.home-view {
  height: 44rem;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Header styling */
.messages-header {
  text-align: center;
  font-family: 'Inter', sans-serif;
}

h1 {
  color: #685545;
  text-align: center;
  font-size: 3rem;
  margin-bottom: 1rem;
}

/* Two-column layout */
.main-content {
  flex: 1;
  display: flex;
  width: 80%;
  max-width: 82rem;
  margin: 0 auto;
  background-color: #F2FAFF;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  overflow: hidden;
  margin-bottom: 1rem;
}

/* Sidebar styling */
.sidebar {
  width: 28rem;
  background-color: #FFFAEF;
  border-right: 1px solid #ddd;
  overflow-y: auto;
}

/* Chat area styling */
.chat-container {
  flex: 1;
  display: flex;
  flex-direction: column;
  overflow: hidden;
}

/* Empty state styling */
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