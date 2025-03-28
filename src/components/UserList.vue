<template>
    <div class="chat-partners-container">
      <ul class="chat-list">
        <li
          v-for="user in filteredUsers"
          :key="user.id"
          class="chat-item"
          @mouseenter="hoveredUser = user.name"
          @mouseleave="hoveredUser = null"
        >
          <div class="chat-content" @click="startChat(user)">
            <div class="chat-left-col">
              <p class="chat-username">{{ user.name }}</p>
              <p class="chat-preview">{{ user.lastMessage }}</p>
            </div>
            <div class="chat-right-col">
              <span class="chat-role">Searcher</span>
              <span v-if="user.lastTimestamp" class="chat-time">{{ user.lastTimestamp }}</span>
            </div>
          </div> <!-- close .chat-content -->
          <div
            v-if="hoveredUser === user.name"
            class="delete-icon"
            @click.stop="deleteConversation(user.name)"
          >✕</div>
        </li>
      </ul>
    </div>
  </template>
    
  <script>
  import { ref, computed, watch } from 'vue'
  import { doc, getDoc, setDoc, serverTimestamp, collection, query, orderBy, limit, onSnapshot, deleteDoc } from 'firebase/firestore'
  import { db } from '../firebase'
    
  export default {
    name: 'UserList',
    props: {
      currentUser: {
        type: String,
        required: true
      }
    },
    emits: ['conversationStarted'],
    setup(props, { emit }) {
      const users = ref([
        { id: 1, name: 'User' },
        { id: 2, name: 'Xavier' },
        { id: 3, name: 'Ziyang' },
        { id: 4, name: 'Mia' }
      ])

      const lastMessages = ref({})
      const hoveredUser = ref(null)

      const filteredUsers = computed(() =>
        users.value
          .filter((u) => u.name !== props.currentUser)
          .map((user) => {
            const message = lastMessages.value[user.name]
            return {
              ...user,
              lastMessage: message?.text || 'Click to start chatting',
              lastTimestamp: message?.timestamp
                ? new Date(message.timestamp.toDate()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : null
            }
          })
      )

      const startChat = async (user) => {
        const conversationId = [props.currentUser, user.name].sort().join('-')
        const conversationRef = doc(db, 'conversations', conversationId)
        const conversationSnap = await getDoc(conversationRef)

        if (!conversationSnap.exists()) {
          await setDoc(conversationRef, {
            participants: [props.currentUser, user.name],
            createdAt: serverTimestamp()
          })
        }

        emit('conversationStarted', conversationId)
      }

      const deleteConversation = async (partnerName) => {
        const confirmed = confirm(`Are you sure you want to delete the conversation with ${partnerName}?`)
        if (!confirmed) return

        const conversationId = [props.currentUser, partnerName].sort().join('-')
        await deleteDoc(doc(db, 'conversations', conversationId))
        lastMessages.value[partnerName] = undefined
      }

      const loadLastMessages = () => {
        for (const user of users.value) {
          if (user.name === props.currentUser) continue
          const conversationId = [props.currentUser, user.name].sort().join('-')
          const messagesRef = collection(db, 'conversations', conversationId, 'messages')
          const q = query(messagesRef, orderBy('timestamp', 'desc'), limit(2))

          onSnapshot(q, (snapshot) => {
            if (!snapshot.empty) {
              const lastMsg = snapshot.docs[0].data()
              let previewText = ''
              if (lastMsg.attachmentUrl) {
                const fileType = lastMsg.attachmentType?.split('/')?.[1] || 'file'
                previewText = lastMsg.text
                  ? `[${fileType}] ${lastMsg.text}`
                  : lastMsg.attachmentName || 'File attachment'
              } else {
                previewText = lastMsg.text || ''
              }

              lastMessages.value[user.name] = {
                text: previewText,
                timestamp: lastMsg.timestamp || null
              }
            } else {
              lastMessages.value[user.name] = {
                text: 'Click to start chatting',
                timestamp: null
              }
            }
          })
        }
      }

      loadLastMessages()
      watch(() => props.currentUser, () => {
        loadLastMessages()
      })

      return { filteredUsers, startChat, hoveredUser, deleteConversation }
    }
  }
  </script>
    
  <style scoped>
  .chat-partners-container {
    width: 100%;
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
    justify-content: space-between;
    gap: 0.5rem;
  }

  .chat-right-col {
    display: flex;
    flex-direction: column;
    align-items: flex-end;
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
    margin: 2px 0 0 0;
  }

  .chat-role {
    font-size: 0.875rem;
    background-color: #ff8147;
    color: white;
    padding: 8px 8px;
    border-radius: 8px;
    font-weight: bold;
  }

  .chat-time {
    color: #aaa;
    font-size: 0.8125rem;
    margin-left: 8px;
  }

  .delete-icon {
    position: absolute;
    top: 12px;
    right: 12px;
    cursor: pointer;
    font-size: 1.1rem;
    color: #d11a2a;
    display: none;
  }

  .chat-item:hover .delete-icon {
    display: block;
  }

  .chat-header {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .chat-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
  </style>