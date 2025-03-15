<template>
    <div class="chat-panel">
      <!-- Messages List -->
      <div class="messages" ref="messageContainer">
        <div
          v-for="message in messages"
          :key="message.id"
          :class="[
            'message',
            { sent: message.sender === currentUser, received: message.sender !== currentUser }
          ]"
        >
          <div class="message-bubble">
            <!-- Message Text -->
            <div class="message-text">{{ message.text }}</div>
    
            <!-- Attachment (image or file link) -->
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
    
            <!-- Timestamp -->
            <div class="message-info">
              <span class="timestamp">{{ formatTimestamp(message.timestamp) }}</span>
            </div>
    
            <!-- "X" Delete Button (only for messages sent by currentUser) -->
            <button
              v-if="message.sender === currentUser"
              class="delete-icon"
              @click="confirmDeleteMessage(message)"
            >
              ×
            </button>
          </div>
        </div>
      </div>
    
      <!-- File Preview (if a file is selected) -->
      <div v-if="filePreview" class="file-preview">
        <button class="close-btn" @click="clearFile">×</button>
        <div v-if="isImageFile">
          <img :src="filePreview" alt="Preview" />
        </div>
        <div v-else>
          <span>File selected:</span> {{ fileName }}
        </div>
      </div>
    
      <!-- Message Form (text input, file upload, send button) -->
      <form @submit.prevent="sendMessage" class="message-form">
        <input
          v-model="newMessage"
          type="text"
          placeholder="Type a message..."
        />
    
        <!-- Hidden file input -->
        <input
          type="file"
          id="file-input"
          @change="handleFileUpload"
          style="display: none;"
        />
    
        <!-- Label with paperclip icon triggers the file input -->
        <label for="file-input" class="file-label">📎</label>
    
        <button type="submit">Send</button>
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
      conversationId: {
        type: String,
        required: true
      },
      currentUser: {
        type: String,
        required: true
      }
    },
    setup(props) {
      const messages = ref([])
      const newMessage = ref('')
    
      // For file uploads
      const file = ref(null)
      const filePreview = ref(null)
      const fileName = ref('')
      const isImageFile = ref(false)
    
      let unsubscribe = null
      const messageContainer = ref(null)
    
      // 1. Load messages from Firestore in real time
      const loadMessages = () => {
        if (unsubscribe) unsubscribe()
        const messagesRef = collection(db, 'conversations', props.conversationId, 'messages')
        const q = query(messagesRef, orderBy('timestamp'))
        unsubscribe = onSnapshot(q, (snapshot) => {
          messages.value = snapshot.docs.map((doc) => ({
            id: doc.id,
            ...doc.data()
          }))
          // Auto-scroll to the bottom
          nextTick(() => {
            if (messageContainer.value) {
              messageContainer.value.scrollTop = messageContainer.value.scrollHeight
            }
          })
        })
      }
      onMounted(loadMessages)
      watch(() => props.conversationId, loadMessages)
    
      // 2. Delete a message (and remove its file from Storage if present)
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
    
      // 3. Handle file selection and create a local preview
      const handleFileUpload = (e) => {
        if (e.target.files.length > 0) {
          file.value = e.target.files[0]
          fileName.value = file.value.name
          isImageFile.value = file.value.type.startsWith('image/')
          filePreview.value = URL.createObjectURL(file.value)
        }
      }
    
      // 4. Clear the selected file and preview
      const clearFile = () => {
        file.value = null
        filePreview.value = null
        fileName.value = ''
        isImageFile.value = false
        const input = document.getElementById('file-input')
        if (input) input.value = ''
      }
    
      // 5. Send a new message (with file upload if selected)
      const sendMessage = async () => {
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
    
      // 6. Format the timestamp for display
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
  .chat-panel {
    display: flex;
    flex-direction: column;
    height: 90vh;
    max-width: 600px;
    margin: auto;
    background-color: #f5f5f5;
    border: 1px solid #ddd;
    border-radius: 8px;
    overflow: hidden;
  }
  .messages {
    flex: 1;
    overflow-y: auto;
    padding: 20px;
    background: #e5ddd5;
  }
  .message {
    position: relative;
    display: flex;
    margin-bottom: 10px;
  }
  .message.sent {
    justify-content: flex-end;
  }
  .message.received {
    justify-content: flex-start;
  }
  .message-bubble {
    position: relative;
    max-width: 70%;
    padding: 10px 15px;
    border-radius: 20px;
    word-wrap: break-word;
    box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  }
  .message.sent .message-bubble {
    background-color: #0088cc;
    color: #fff;
    border-bottom-right-radius: 0;
  }
  .message.received .message-bubble {
    background-color: #fff;
    color: #000;
    border-bottom-left-radius: 0;
  }
  .message-info {
    text-align: right;
    font-size: 0.7em;
    margin-top: 5px;
    opacity: 0.8;
  }
  .delete-icon {
    position: absolute;
    top: 0;
    right: 0;
    transform: translate(50%, -50%);
    background: none;
    border: none;
    font-size: 1.2em;
    cursor: pointer;
    color: #666;
    opacity: 0;
    transition: opacity 0.2s ease;
  }
  .message:hover .delete-icon {
    opacity: 1;
  }
  .delete-icon:hover {
    color: #f00;
  }
  .attachment {
    margin-top: 5px;
  }
  .attachment img {
    max-width: 100%;
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
  .file-preview {
    position: relative;
    background-color: #fff;
    padding: 10px;
    border-top: 1px solid #ddd;
    display: flex;
    align-items: center;
    gap: 10px;
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
  .message-form {
    display: flex;
    align-items: center;
    padding: 10px;
    background-color: #fff;
    border-top: 1px solid #ddd;
  }
  .message-form input[type="text"] {
    flex-grow: 1;
    padding: 10px 15px;
    border: 1px solid #ccc;
    border-radius: 20px;
    font-size: 1em;
    outline: none;
  }
  .file-label {
    font-size: 1.5em;
    margin: 0 10px;
    cursor: pointer;
  }
  .message-form button {
    padding: 10px 20px;
    border: none;
    border-radius: 20px;
    background-color: #0088cc;
    color: #fff;
    font-size: 1em;
    cursor: pointer;
  }
  .message-form button:hover {
    background-color: #0077b3;
  }
  </style>
  