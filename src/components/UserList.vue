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
            <p class="chat-username">{{ user.name }}</p>
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
  doc, getDoc, setDoc, deleteDoc, getDocs,
  serverTimestamp, collection, query,
  orderBy, limit, onSnapshot
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
  emits: ['conversationStarted'],
  setup(props, { emit }) {
    const users = ref([]);
    const lastMessages = ref({});
    const userRoles = ref({}); // Store roles for each user

    const usersCollection = collection(db, 'users');

    // Fetch all users
    onSnapshot(usersCollection, (snapshot) => {
      users.value = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      loadLastMessages();
      loadUserRoles(); // Load roles after users are fetched
    });

    // Load the last message for each conversation
    const loadLastMessages = () => {
      for (const user of users.value) {
        if (user.id === props.currentUserID) continue;

        const conversationId = [props.currentUserID, user.id].sort().join('-');
        const messagesRef = collection(db, 'conversations', conversationId, 'messages');
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

          lastMessages.value[user.id] = {
            text: preview,
            timestamp: messageData?.timestamp || null
          };
        });
      }
    };

    // Load the role of each user relative to the current user
    const loadUserRoles = async () => {
      for (const user of users.value) {
        if (user.id === props.currentUserID) continue;

        const conversationId = [props.currentUserID, user.id].sort().join('-');
        const conversationRef = doc(db, 'conversations', conversationId);
        const snap = await getDoc(conversationRef);

        if (snap.exists()) {
          const data = snap.data();
          const roles = data.roles || {};
          // Determine the role of the other user
          userRoles.value[user.id] = roles.founder === user.id ? 'Founder' : 'Searcher';
        } else {
          // If conversation doesn't exist, assume the role based on startChat logic
          // In startChat, currentUserID is set as searcher, other user as founder
          userRoles.value[user.id] = 'Founder';
        }
      }
    };

    const filteredUsers = computed(() =>
      users.value
        .filter((u) => u.id !== props.currentUserID)
        .map((user) => {
          const msg = lastMessages.value[user.id] || {};
          return {
            ...user,
            lastMessage: msg.text || 'Click to start chatting',
            lastTimestamp: msg.timestamp
              ? new Date(msg.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
              : null,
            rawTimestamp: msg.timestamp || null,
            role: userRoles.value[user.id] || 'Founder' // Default to Founder if role not yet loaded
          };
        })
        .sort((a, b) => {
          if (!a.rawTimestamp) return 1;
          if (!b.rawTimestamp) return -1;
          return b.rawTimestamp.toMillis() - a.rawTimestamp.toMillis();
        })
    );

    const startChat = async (user) => {
      const conversationId = [props.currentUserID, user.id].sort().join('-');
      const conversationRef = doc(db, 'conversations', conversationId);
      const snap = await getDoc(conversationRef);

      if (!snap.exists()) {
        await setDoc(conversationRef, {
          roles: {
            searcher: props.currentUserID,
            founder: user.id
          },
          createdAt: serverTimestamp(),
          itemStatus: 'Matched'
        });
        // Update the role after creating the conversation
        userRoles.value[user.id] = 'Founder';
      }

      emit('conversationStarted', conversationId, user.id);
    };

    watch(() => props.currentUserID, () => {
      loadLastMessages();
      loadUserRoles();
    });
    watch(
      [() => props.currentUserID, () => users.value],
      ([currentID, allUsers]) => {
        if (currentID && allUsers.length) {
          loadLastMessages();
          loadUserRoles();
        }
      }
    );

    return {
      filteredUsers,
      startChat
    };
  }
};
</script>

<style scoped>
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