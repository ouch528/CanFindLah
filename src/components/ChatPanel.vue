<template>
    <div class="chat-panel">
        <!-- Top bar showing the partner's name and optional subtitle -->
        <div class="chat-header">
            <h2>{{ partnerName }}</h2>
            <span class="partner-subtitle">Searcher of Green Water Bottle</span>
        </div>

        <!-- Scrollable message list -->
        <div class="messages" ref="messageContainer">
            <!-- Outer loop: each date group -->
            <div v-for="group in groupedMessages" :key="group.date" class="day-group">
                <!-- Date header -->
                <div class="date-separator">{{ group.date }}</div>

                <!-- Inner loop: messages within this date -->
                <div v-for="message in group.messages" :key="message.id" :class="['message', { sent: message.sender === currentUser, received: message.sender !== currentUser }]">
                    <div class="message-bubble">
                        <!-- Message text -->
                        <div class="message-text">{{ message.text }}</div>

                        <!-- Attachment (image/file) -->
                        <div v-if="message.attachmentType" class="attachment">
                            <template v-if="message.status === 'uploading'">
                                <div class="uploading-indicator">
                                    <svg class="spinner" viewBox="0 0 50 50">
                                        <circle class="path" cx="25" cy="25" r="20" fill="none" stroke-width="5"></circle>
                                    </svg>
                                    <span>Uploading...</span>
                                </div>
                            </template>
                            <template v-else>
                                <img v-if="message.attachmentType.startsWith('image/')" :src="message.attachmentUrl" alt="Attached image" />
                                <div v-else class="file-attachment">
                                    📎 <a :href="message.attachmentUrl" target="_blank">{{ message.attachmentName }}</a>
                                </div>
                            </template>
                        </div>

                        <!-- "X" delete button for your own messages -->
                        <button v-if="message.sender === currentUser" class="delete-icon" @click="confirmDeleteMessage(message)">×</button>
                    </div>
                    <!-- Timestamp -->
                    <div class="message-info">
                        <span class="timestamp">{{ formatTimestamp(message.timestamp) }}</span>
                    </div>
                </div>
            </div>
        </div>

        <!-- File preview area if a file is selected -->
        <div v-if="filePreview" class="file-preview">
            <button class="close-btn" @click="clearFile">×</button>
            <div v-if="isImageFile">
                <img :src="filePreview" alt="Preview" />
            </div>
            <div v-else><span>File selected:</span> {{ fileName }}</div>
        </div>

        <!-- Input area (text + file + send) -->
        <form @submit.prevent="sendMessage" class="message-form">
            <div class="input-container">
                <!-- Hidden file input triggered by paperclip -->
                <input type="file" id="file-input" @change="handleFileUpload" style="display: none" />
                <!-- Paperclip icon label -->
                <label for="file-input" class="file-label"><img src="@/assets/icon.png" alt="Icon" /></label>
                <input v-model="newMessage" type="text" placeholder="Write a message..." />
                <button type="submit" class="send-button" :disabled="isSending">
                    <img src="@/assets/send.png" alt="Send" />
                </button>
            </div>
        </form>
    </div>
</template>

<script>
import { ref, onMounted, watch, nextTick, computed } from 'vue'
import { collection, doc, onSnapshot, query, orderBy, deleteDoc, addDoc, updateDoc, serverTimestamp } from 'firebase/firestore'
import { ref as storageRef, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage'
import { db, storage } from '../firebase.js'

export default {
    name: 'ChatPanel',
    props: {
        conversationId: { type: String, required: true },
        currentUser: { type: String, required: true },
        partnerName: { type: String, required: false },
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
        const isSending = ref(false)

        // Group messages by date
        const groupedMessages = computed(() => {
            if (!messages.value.length) return []

            // A map of dateString -> array of messages for that date
            const dateMap = new Map()

            for (const msg of messages.value) {
                const timestamp = msg.timestamp
                if (!timestamp) continue

                // Convert Firestore Timestamp or Date object to a JS Date
                const dateObj = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)

                // Extract just the date portion as a string, e.g., "March 29, 2025"
                const dateString = dateObj.toLocaleDateString([], {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                })

                if (!dateMap.has(dateString)) {
                    dateMap.set(dateString, [])
                }
                dateMap.get(dateString).push(msg)
            }

            // Convert map entries to an array of { date, messages }
            const result = []
            for (const [dateString, msgs] of dateMap.entries()) {
                // Sort messages within the same day by actual timestamp
                msgs.sort((a, b) => {
                    const aTime = a.timestamp ? a.timestamp.toMillis() : 0
                    const bTime = b.timestamp ? b.timestamp.toMillis() : 0
                    return aTime - bTime
                })
                result.push({ date: dateString, messages: msgs })
            }

            // Sort the groups by date
            result.sort((a, b) => {
                // parse the date string into a Date object
                const aDate = new Date(a.date)
                const bDate = new Date(b.date)
                return aDate - bDate
            })

            return result
        })

        // Load messages from Firestore
        const loadMessages = () => {
            if (unsubscribe) unsubscribe()
            const messagesRef = collection(db, 'conversations', props.conversationId, 'messages')
            const q = query(messagesRef, orderBy('timestamp'))
            unsubscribe = onSnapshot(q, (snapshot) => {
                messages.value = snapshot.docs.map((doc) => ({
                    id: doc.id,
                    ...doc.data(),
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
            const userConfirmed = window.confirm('Are you sure you want to delete this message?')
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
                const selectedFile = e.target.files[0]
                if (selectedFile.size > 5242880) {
                    // 5MB in bytes
                    alert('File must be less than 5MB')
                    clearFile()
                    return
                }
                file.value = selectedFile
                fileName.value = selectedFile.name
                isImageFile.value = selectedFile.type.startsWith('image/')
                filePreview.value = URL.createObjectURL(selectedFile)
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

        const sendMessage = async () => {
            if (isSending.value) return // Prevent multiple submissions
            if (newMessage.value.trim() === '' && !file.value) {
                return
            }
            isSending.value = true
            try {
                let fileToUpload = null
                if (file.value) {
                    fileToUpload = file.value
                    // Hide file preview immediately upon clicking send
                    clearFile()
                }
                if (fileToUpload) {
                    const attachmentName = fileToUpload.name
                    const attachmentType = fileToUpload.type
                    const attachmentPath = `chat_attachments/${attachmentName}-${Date.now()}`

                    // Optimistically add the message with a placeholder for attachmentUrl and status 'uploading'
                    const messageData = {
                        text: newMessage.value.trim(),
                        sender: props.currentUser,
                        timestamp: serverTimestamp(),
                        attachmentUrl: '', // placeholder until upload completes
                        attachmentType,
                        attachmentName,
                        attachmentPath,
                        status: 'uploading',
                    }
                    const messageRef = await addDoc(collection(db, 'conversations', props.conversationId, 'messages'), messageData)

                    // Start the file upload
                    const storageReference = storageRef(storage, attachmentPath)
                    await uploadBytes(storageReference, fileToUpload)
                    const attachmentUrl = await getDownloadURL(storageReference)

                    // Update the message document with the actual download URL and status
                    await updateDoc(doc(db, 'conversations', props.conversationId, 'messages', messageRef.id), {
                        attachmentUrl,
                        status: 'sent',
                    })
                } else {
                    // No file attached; simply add the text message
                    await addDoc(collection(db, 'conversations', props.conversationId, 'messages'), {
                        text: newMessage.value.trim(),
                        sender: props.currentUser,
                        timestamp: serverTimestamp(),
                    })
                }

                newMessage.value = ''
            } catch (error) {
                console.error('Error sending message:', error)
            } finally {
                isSending.value = false
            }
        }

        // Format timestamp
        const formatTimestamp = (timestamp) => {
            if (!timestamp) return ''
            const dateObj = timestamp.toDate ? timestamp.toDate() : new Date(timestamp)

            // Show date+time if it's not today
            const now = new Date()
            const isToday = dateObj.toDateString() === now.toDateString()

            if (isToday) {
                // e.g. '10:41 PM'
                return dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            } else {
                // e.g. 'Mar 29, 10:41 PM'
                return dateObj.toLocaleString([], {
                    month: 'short',
                    day: 'numeric',
                    hour: '2-digit',
                    minute: '2-digit',
                })
            }
        }

        return {
            messages,
            groupedMessages,
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
            formatTimestamp,
            isSending,
        }
    },
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
    background-color: #f2faff; /* subtle grey */
    padding: 0.75rem 1rem;
    border-bottom: none;
    display: flex;
    flex-direction: column;
    gap: 4px;
    font-family: 'Inter';
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
    background: #f2faff; /* a subtle light background for the chat area */
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
    box-shadow: 0 1px 2px rgba(0, 0, 0, 0.1);
    position: relative;
    word-wrap: break-word;
    font-size: 1rem;
    line-height: 1.4;
}

/* For sent messages, you can still do a special corner if you like */
.message.sent .message-bubble {
    background-color: #b3e7ff; /* your light blue */
    color: #000;
    /* If you want a more rectangular look, remove bottom-right radius or reduce it */
    /* border-bottom-right-radius: 0; <-- optional if you like one corner less rounded */
}

/* For received messages, similarly adjust corners */
.message.received .message-bubble {
    background-color: #e0e0e0; /* your gray or white */
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
    font-family: 'Inter';
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
    background: #f2faff; /* no background */
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
.uploading-indicator {
    display: flex;
    align-items: center;
    justify-content: center;
    width: 100%;
    font-size: 0.9rem;
    color: #666;
}
.spinner {
    animation: spin 1s linear infinite;
    width: 16px;
    height: 16px;
    margin-right: 8px;
}
@keyframes spin {
    from {
        transform: rotate(0deg);
    }
    to {
        transform: rotate(360deg);
    }
}

/* Date separator styles */
.day-group {
    margin-bottom: 1rem;
}

.date-separator {
    text-align: center;
    margin: 0.5rem auto;
    font-size: 0.75rem;
    color: #666;
    background-color: #d9d9d9;
    display: block;
    width: fit-content;
    padding: 3px 8px;
    border-radius: 8px;
    font-weight: 500;
    font-family: 'Inter';
}
</style>
