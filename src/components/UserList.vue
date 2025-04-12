<template>
  <div class="chat-partners-container">
    <ul class="chat-list">
      <li
        v-for="user in filteredUsers"
        :key="user.id"
        class="chat-item"
      >
        <div class="chat-content" @click="startChat(user)">
          <div class="chat-left-col">
            <p class="chat-username">{{ user.name }} ({{ user.foundItemName }})</p>
            <p class="chat-preview">{{ user.lastMessage }}</p>
          </div>
          <div class="chat-right-col">
            <span class="chat-role" :data-role="user.role">{{ user.role }}</span>
            <span v-if="user.lastTimestamp" class="chat-time">{{ user.lastTimestamp }}</span>
          </div>
        </div>
      </li>
    </ul>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue';
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  getDocs,
  serverTimestamp,
  collection,
  query,
  orderBy,
  limit,
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebase';

export default {
  name: 'UserList',
  props: {
    currentUserID: {
      type: String,
      required: true
    }
  },
  emits: ['conversationStarted', 'conversationDeleted'], // Add conversationDeleted to emits
  setup(props, { emit }) {
    const users = ref([]);
    const lastMessages = ref({});
    const userRoles = ref({});
    const foundItemNames = ref({}); // To store found item names for each conversation
    const conversations = ref([]); // To store all conversations for the current user

    const usersCollection = collection(db, 'users');

    // Fetch all users
    onSnapshot(usersCollection, (snapshot) => {
      users.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      loadConversations();
    });

    // Fetch all conversations for the current user
    const loadConversations = () => {
      const conversationsRef = collection(db, 'conversations');
      onSnapshot(conversationsRef, (snapshot) => {
        conversations.value = snapshot.docs
          .map(doc => ({
            id: doc.id,
            ...doc.data()
          }))
          .filter(conv => {
            const [user1, user2] = conv.id.split('-').slice(0, 2);
            return user1 === props.currentUserID || user2 === props.currentUserID;
          });

        loadLastMessages();
        loadUserRoles();
        loadFoundItemNames();
      });
    };

    // Load the last message for each conversation
    const loadLastMessages = () => {
      for (const conv of conversations.value) {
        const messagesRef = collection(db, 'conversations', conv.id, 'messages');
        const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(1));

        onSnapshot(q, (snapshot) => {
          const messageData = snapshot.docs[0]?.data();

          const preview = (() => {
            if (!messageData) return 'Click to start chatting';
            const isText = messageData.text?.trim();
            const hasAttachment = messageData.attachmentUrl;

            if (hasAttachment) {
              const fileType = messageData.attachmentType?.split('/')?.[1] || 'file';
              const text = isText ? messageData.text : messageData.attachmentName || 'Attachment';
              return `[${fileType}] ${text}`;
            } else if (isText) {
              return messageData.text;
            } else {
              return 'Click to start chatting';
            }
          })();

          lastMessages.value[conv.id] = {
            text: preview,
            timestamp: messageData?.timestamp || null
          };
        });
      }
    };

    // Load the role of each user relative to the current user
    const loadUserRoles = async () => {
      for (const conv of conversations.value) {
        const data = conv;
        const roles = data.roles || {};
        const otherUserId = roles.founder === props.currentUserID ? roles.searcher : roles.founder;
        userRoles.value[conv.id] = roles.founder === otherUserId ? 'Founder' : 'Searcher';
      }
    };

    // Load the Found Item name for each conversation
    const loadFoundItemNames = async () => {
      for (const conv of conversations.value) {
        const foundItemId = conv.foundItemId;
        if (foundItemId) {
          const foundItemRef = doc(db, 'Found Item', foundItemId);
          const foundItemSnap = await getDoc(foundItemRef);
          if (foundItemSnap.exists()) {
            foundItemNames.value[conv.id] = foundItemSnap.data().name || 'Unknown Item';
          } else {
            foundItemNames.value[conv.id] = 'Unknown Item';
          }
        } else {
          foundItemNames.value[conv.id] = 'Unknown Item';
        }
      }
    };

    const filteredUsers = computed(() => {
      const userMap = new Map();

      for (const conv of conversations.value) {
        const [user1, user2] = conv.id.split('-').slice(0, 2);
        const otherUserId = user1 === props.currentUserID ? user2 : user1;
        const user = users.value.find(u => u.id === otherUserId);
        if (!user) continue;

        if (!userMap.has(otherUserId)) {
          userMap.set(otherUserId, []);
        }
        userMap.get(otherUserId).push({
          conversationId: conv.id,
          role: userRoles.value[conv.id] || 'Founder',
          lastMessage: lastMessages.value[conv.id]?.text || 'Click to start chatting',
          lastTimestamp: lastMessages.value[conv.id]?.timestamp
            ? new Date(lastMessages.value[conv.id].timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            : null,
          rawTimestamp: lastMessages.value[conv.id]?.timestamp || null,
          foundItemName: foundItemNames.value[conv.id] || 'Unknown Item'
        });
      }

      const result = [];
      for (const [userId, convs] of userMap.entries()) {
        const user = users.value.find(u => u.id === userId);
        if (!user) continue;

        convs.sort((a, b) => {
          if (!a.rawTimestamp) return 1;
          if (!b.rawTimestamp) return -1;
          return b.rawTimestamp.toMillis() - a.rawTimestamp.toMillis();
        });

        convs.forEach(conv => {
          result.push({
            id: conv.conversationId, // Use conversationId as the unique key
            userId: userId,
            name: user.name,
            lastMessage: conv.lastMessage,
            lastTimestamp: conv.lastTimestamp,
            rawTimestamp: conv.rawTimestamp,
            role: conv.role,
            foundItemName: conv.foundItemName
          });
        });
      }

      return result.sort((a, b) => {
        if (!a.rawTimestamp) return 1;
        if (!b.rawTimestamp) return -1;
        return b.rawTimestamp.toMillis() - a.rawTimestamp.toMillis();
      });
    });

    const startChat = async (user) => {
      emit('conversationStarted', user.id, user.userId);
    };

    // Handle conversation deletion event from ChatPanel
    const handleConversationDeleted = (conversationId) => {
      emit('conversationDeleted', conversationId);
    };

    watch(() => props.currentUserID, () => {
      loadConversations();
    });

    return {
      filteredUsers,
      startChat,
      handleConversationDeleted // Expose the handler to the template (if needed) or directly use in ChatPanel
    };
  }
};
</script>

<style scoped>
/* Styles remain unchanged */
.chat-partners-container {
  height: 100%;
  overflow-y: auto;
  background: #FFFAEF;
  font-family: "Inter";
}
.chat-list {
  list-style: none;
  padding: 0;
  margin: 0;
}
.chat-item {
  position: relative;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  background-color: #FFFAEF;
  cursor: pointer;
  transition: background-color 0.2s ease;
  height: 4.5rem;
}
.chat-item:hover {
  background-color: #F2FAFF;
}
.chat-content {
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;
}
.chat-left-col {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}
.chat-right-col {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
}
.chat-username {
  font-weight: bold;
  font-size: 1.375rem;
  color: #333;
  margin: 0;
}
.chat-preview {
  font-size: 1.125rem;
  color: #888;
  margin: 2px 0 0;
}
.chat-role {
  font-size: 0.875rem;
  color: white;
  padding: 8px;
  border-radius: 8px;
  font-weight: bold;
}
.chat-role[data-role="Searcher"] {
  background-color: #FF8844; /* Orange for Founder */
}
.chat-role[data-role="Founder"] {
  background-color: #4A95DF; /* Blue for Searcher */
}
.chat-time {
  color: #aaa;
  font-size: 0.8125rem;
}
</style>