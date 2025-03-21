<template>
  <div class="chat-panel">
    <!-- Top bar showing the partner's name and optional subtitle -->
    <div class="chat-header">
      <h2>{{ partnerName }}</h2>
      <span class="partner-subtitle">Searcher of Green Water Bottle</span>
    </div>

    <!-- Scrollable message list -->
    <div class="messages" ref="messageContainer">
      <div
        v-for="message in messages"
        :key="message.id"
        :class="['message', { sent: message.sender === currentUser, received: message.sender !== currentUser }]"
      >
        <div class="message-bubble">
          <!-- Message text -->
          <div class="message-text">{{ message.text }}</div>

          <!-- Attachment (image/file) -->
          <div v-if="message.attachmentUrl" class="attachment">
            <img
              v-if="message.attachmentType && message.attachmentType.startsWith('image/')"
              :src="message.attachmentUrl"
              alt="Attached image"
            />
            <div v-else class="file-attachment">
              📎 <a :href="message.attachmentUrl" target="_blank">{{ message.attachmentName }}</a>
            </div>
          </div>

          <!-- "X" delete button for your own messages -->
          <button
            v-if="message.sender === currentUser"
            class="delete-icon"
            @click="confirmDeleteMessage(message)"
          >
            ×
          </button>
        </div>
          <!-- Timestamp -->
        <div class="message-info">
          <span class="timestamp">{{ formatTimestamp(message.timestamp) }}</span>
        </div>
      </div>
    </div>

    <!-- File preview area if a file is selected -->
    <div v-if="filePreview" class="file-preview">
      <button class="close-btn" @click="clearFile">×</button>
      <div v-if="isImageFile">
        <img :src="filePreview" alt="Preview" />
      </div>
      <div v-else>
        <span>File selected:</span> {{ fileName }}
      </div>
    </div>

    <!-- Input area (text + file + send) -->
    <form @submit.prevent="sendMessage" class="message-form">
      <div class="input-container">
        <!-- Hidden file input triggered by paperclip -->
        <input
          type="file"
          id="file-input"
          @change="handleFileUpload"
          style="display: none;"
        />
        <!-- Paperclip icon label -->
        <label for="file-input" class="file-label"><img src="@/assets/icon.png" alt="Icon" /></label>
        <input
          v-model="newMessage"
          type="text"
          placeholder="Write a message..."
        />
        <button type="submit" class="send-button">
          <img src="@/assets/send.png" alt="Send">
        </button>
      </div>
    </form>
  </div>
</template>

<script>
import { ref, onMounted, watch, nextTick } from 'vue'
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  addDoc,
  serverTimestamp
} from 'firebase/firestore'
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage'
import { db, storage } from '../firebase'

export default {
  name: 'ChatPanel',
  props: {
    conversationId: { type: String, required: true },
    currentUser: { type: String, required: true },
    partnerName: { type: String, required: false }
  },
  setup(props) {
    const messages = ref([])
    const newMessage = ref('')
    const file = ref(null)
    const filePreview = ref(null)
    const fileName = ref('')
    const isImageFile = ref(false)
    let unsubscribe = null
    const messageContainer = ref(null)

    // Load messages from Firestore
    const loadMessages = () => {
      if (unsubscribe) unsubscribe()
      const messagesRef = collection(db, 'conversations', props.conversationId, 'messages')
      const q = query(messagesRef, orderBy('timestamp'))
      unsubscribe = onSnapshot(q, (snapshot) => {
        messages.value = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data()
        }))
        nextTick(() => {
          if (messageContainer.value) {
            messageContainer.value.scrollTop = messageContainer.value.scrollHeight
          }
        })
      })
    }

    onMounted(loadMessages)
    watch(() => props.conversationId, loadMessages)

    // Confirm & delete message
    const confirmDeleteMessage = async (message) => {
      const userConfirmed = window.confirm("Are you sure you want to delete this message?")
      if (!userConfirmed) return
      try {
        if (message.attachmentPath) {
          const fileRef = storageRef(storage, message.attachmentPath)
          await deleteObject(fileRef)
        }
        await deleteDoc(doc(db, 'conversations', props.conversationId, 'messages', message.id))
      } catch (error) {
        console.error('Error deleting message:', error)
      }
    }

    // Handle file selection
    const handleFileUpload = (e) => {
      if (e.target.files.length > 0) {
        file.value = e.target.files[0]
        fileName.value = file.value.name
        isImageFile.value = file.value.type.startsWith('image/')
        filePreview.value = URL.createObjectURL(file.value)
      }
    }

    // Clear file
    const clearFile = () => {
      file.value = null
      filePreview.value = null
      fileName.value = ''
      isImageFile.value = false
      const input = document.getElementById('file-input')
      if (input) input.value = ''
    }

    // Send message (with optional file)
    const sendMessage = async () => {
      // Prevent sending if text is empty and there's no file attached.
      if(newMessage.value.trim() === "" && !file.value) {
        return;
      }

      try {
        let attachmentUrl = ''
        let attachmentType = ''
        let attachmentName = ''
        let attachmentPath = ''

        if (file.value) {
          attachmentName = file.value.name
          attachmentType = file.value.type
          attachmentPath = `chat_attachments/${attachmentName}-${Date.now()}`
          const storageReference = storageRef(storage, attachmentPath)
          await uploadBytes(storageReference, file.value)
          attachmentUrl = await getDownloadURL(storageReference)
        }

        await addDoc(collection(db, 'conversations', props.conversationId, 'messages'), {
          text: newMessage.value.trim(),
          sender: props.currentUser,
          timestamp: serverTimestamp(),
          attachmentUrl,
          attachmentType,
          attachmentName,
          attachmentPath
        })

        newMessage.value = ''
        clearFile()
      } catch (error) {
        console.error('Error sending message:', error)
      }
    }

    // Format timestamp
    const formatTimestamp = (timestamp) => {
      if (!timestamp) return ''
      const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    }

    return {
      messages,
      newMessage,
      file,
      filePreview,
      fileName,
      isImageFile,
      messageContainer,
      loadMessages,
      confirmDeleteMessage,
      handleFileUpload,
      clearFile,
      sendMessage,
      formatTimestamp
    }
  }
}
</script>

<style scoped>
/* Overall chat panel with a white card look, slight radius, etc. */
.chat-panel {
  display: flex;
  flex-direction: column;
  background-color: #fff; /* white card look */
  width: 100%;
  max-width: 900px;
  margin: auto;
  border: 1px solid #ddd;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);
  height: 650px; /* fix the height to get a scroll area */
  overflow: hidden;
}

/* A top bar with the partner's name */
.chat-header {
  background-color: #F2FAFF; /* subtle grey */
  padding: 0.75rem 1rem;
  border-bottom: none;
  display: flex;
  flex-direction: column;
  gap: 4px;
  font-family: "Inter";
}
.chat-header h2 {
  margin: 0;
  font-size: 1.25rem;
  color: #333;
  font-weight: 600;
}
.partner-subtitle {
  font-size: 1rem;
  color: #666;
}

/* The scrollable messages area */
.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #F2FAFF; /* a subtle light background for the chat area */
  min-height: 0; /* ensures flex container can shrink */
}

/* Individual message */
.message {
  display: flex;
  flex-direction: column; /* stacks message-bubble and message-info vertically */
  margin-bottom: 0.75rem;
  position: relative;
}

/* For sent messages, align the column to the right */
.message.sent {
  align-items: flex-end;
}

/* For received messages, align the column to the left */
.message.received {
  align-items: flex-start;
}

/* Chat bubble styling */
.message-bubble {
  max-width: 60%;
  padding: 0.75rem 1rem;
  /* Instead of a large border-radius, use a smaller one for subtle rounded corners */
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  position: relative;
  word-wrap: break-word;
  font-size: 1rem;
  line-height: 1.4;
}

/* For sent messages, you can still do a special corner if you like */
.message.sent .message-bubble {
  background-color: #B3E7FF; /* your light blue */
  color: #000;
  /* If you want a more rectangular look, remove bottom-right radius or reduce it */
  /* border-bottom-right-radius: 0; <-- optional if you like one corner less rounded */
}

/* For received messages, similarly adjust corners */
.message.received .message-bubble {
  background-color: #E0E0E0; /* your gray or white */
  color: #000;
  /* border-bottom-left-radius: 0; <-- optional if you want one corner less rounded */
}

/* Timestamp styling inside bubble */
.message-info {
  text-align: right;
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 0.2rem;
  font-size: 0.625rem;
}

/* "X" delete icon */
.delete-icon {
  position: absolute;
  top: 5px;
  right: 5px;
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #666;
  opacity: 0;
  transition: opacity 0.2s ease;
}
.message-bubble:hover .delete-icon {
  opacity: 1;
}
.delete-icon:hover {
  color: #f00;
}

/* Attachments */
.attachment {
  margin-top: 0.5rem;
}
.attachment img {
  max-width: 200px;
  border-radius: 8px;
}
.file-attachment {
  font-size: 0.9em;
  margin-top: 5px;
}
.file-attachment a {
  color: inherit;
  text-decoration: underline;
}

/* File preview if a file is selected */
.file-preview {
  position: relative;
  background-color: #fff;
  padding: 1rem;
  border-top: 1px solid #ddd;
  display: flex;
  align-items: center;
  gap: 1rem;
}
.file-preview img {
  max-width: 100px;
  border-radius: 4px;
}
.close-btn {
  position: absolute;
  top: 5px;
  right: 10px;
  background: none;
  border: none;
  font-size: 1.2em;
  cursor: pointer;
}

/* Message form at the bottom */
.message-form {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #F2FAFF; /* no background */
  border-top: none; /* remove top border if you had one */
}

/* New input container for aligning input and buttons */
.input-container {
  display: flex;
  align-items: center;
  width: 100%;
  border: 1px solid #ccc;
  border-radius: 8px;
  padding: 0.5rem;
  background: white;
}

.input-container input {
  flex-grow: 1;
  border: none;
  outline: none;
  padding: 0.5rem;
  font-size: 1rem;
}

/* Style the paperclip icon label */
.file-label {
  cursor: pointer;
  padding: 0 0.5rem;
  font-size: 1.2rem;
}

/* Replace the default "Send" style with a rectangular, curved button */
.send-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0 0.5rem;
}
.send-button:hover {
  color: #0077b3;
}
</style>