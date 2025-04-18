<template>
  <div class="chat-panel">
    <!-- Top bar showing the partner's name and optional subtitle -->
    <div class="chat-header">
      <h2>{{ partnerDisplayName }}</h2>
      <span class="partner-subtitle">Chatting with <b>{{ partnerRole }} of {{ foundItemName }}</b></span>
      <div class="dropdown-container" ref="dropdownContainer">
        <div class="item-status">{{ itemStatus }}</div>
        <button class="dropdown-toggle" @click="toggleDropdown">
          <img src="@/assets/more.png" alt="More" />
        </button>
        <div v-if="dropdownOpen" class="dropdown-menu">
          <button 
            v-if="itemStatus === 'Returned'" 
            class="dropdown-item" 
            @click="onDeleteConversation"
          >
            Delete Conversation
          </button>

          <button 
            v-if="isFounder && itemStatus !== 'Not Found Yet'" 
            class="dropdown-item" 
            @click="onItemReturned"
          >
            {{ itemStatus === 'Matched' ? 'Item Returned' : 'Undo Item Returned' }}
          </button>

          <button 
            v-if="itemStatus === 'Matched'" 
            class="dropdown-item" 
            @click="onItemNotMine"
          >
            Undo Match
          </button>
        </div>
      </div>
    </div>

    <!-- Scrollable message list -->
    <div class="messages" ref="messageContainer">
      <div v-for="group in groupedMessages" :key="group.date" class="day-group">
        <div class="date-separator">{{ group.date }}</div>

        <div
          v-for="message in group.messages"
          :key="message.id"
          :class="['message', { sent: message.sender === currentUserID, received: message.sender !== currentUserID }]"
        >
          <div class="message-bubble">
            <div class="message-text">{{ message.text }}</div>

            <div v-if="message.attachmentType" class="attachment">
              <div class="attachment-wrapper" style="position: relative;">
                <!-- Spinner for uploading state -->
                <template v-if="message.status === 'uploading'">
                  <div class="uploading-indicator">
                    <div class="loading-spinner"></div>
                    <span>Uploading...</span>
                  </div>
                </template>
                <!-- Placeholder for when attachment URL is not yet available -->
                <template v-else-if="!message.attachmentUrl">
                  <div class="loading-placeholder">Loading attachment...</div>
                </template>
                <!-- Display the attachment once uploaded -->
                <template v-else>
                  <img
                    v-if="message.attachmentType.startsWith('image/')"
                    :src="message.attachmentUrl"
                    alt="Attached image"
                  />
                  <div v-else class="file-attachment">
                    📎 <a :href="message.attachmentUrl" target="_blank">{{ message.attachmentName }}</a>
                  </div>
                </template>
              </div>
            </div>

            <button
              v-if="message.sender === currentUserID"
              class="delete-icon"
              @click="confirmDeleteMessage(message)"
            >
              ×
            </button>
          </div>
          <div class="message-info">
            <span class="timestamp">{{ formatTimestamp(message.timestamp) }}</span>
            <span v-if="message.sender === currentUserID" class="read-receipt">
              <span v-if="message.readAt">✓✓</span>
              <span v-else>✓</span>
            </span>
          </div>
        </div>
      </div>
    </div>

    <div v-if="filePreview" class="file-preview">
      <button class="close-btn" @click="clearFile">×</button>
      <div v-if="isImageFile">
        <img :src="filePreview" alt="Preview" />
      </div>
      <div v-else>
        <span>File selected:</span> {{ fileName }}
      </div>
    </div>

    <form @submit.prevent="sendMessage" class="message-form">
      <div class="input-container">
        <input type="file" id="file-input" @change="handleFileUpload" style="display: none;" />
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
import { ref, onMounted, onBeforeUnmount, watch, nextTick, computed } from 'vue';
import {
  collection,
  doc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  addDoc,
  updateDoc,
  getDoc,
  getDocs,
  serverTimestamp,
  deleteField,
  arrayUnion,
  arrayRemove
} from 'firebase/firestore';
import {
  ref as storageRef,
  uploadBytes,
  getDownloadURL,
  deleteObject
} from 'firebase/storage';
import { db, storage } from '../firebase';
import { useRouter } from 'vue-router';
import { findMatchingLostItems } from '@/components/matchingService.js'

export default {
  name: 'ChatPanel',
  props: {
    conversationId: { type: String, required: true },
    currentUserID: { type: String, required: true },
    partnerID: { type: String, required: true }
  },
  emits: ['conversationDeleted'],
  setup(props, { emit }) {
    const router = useRouter();
    const partnerDisplayName = ref('');
    const messages = ref([]);
    const newMessage = ref('');
    const file = ref(null);
    const filePreview = ref(null);
    const fileName = ref('');
    const isImageFile = ref(false);
    const messageContainer = ref(null);
    const isSending = ref(false);
    const itemStatus = ref('Matched');
    const isFounder = ref(false);
    const dropdownOpen = ref(false);
    const lostItemId = ref('');
    const foundItemId = ref('');
    const partnerRole = ref('');
    const foundItemName = ref('');
    const notified = ref(false);
    let unsubscribeMessages = null;
    let unsubscribeConversation = null;

    const toggleDropdown = () => {
      dropdownOpen.value = !dropdownOpen.value;
    };

    const dropdownContainer = ref(null);

    const handleClickOutside = (event) => {
      if (dropdownOpen.value && dropdownContainer.value && !dropdownContainer.value.contains(event.target)) {
        dropdownOpen.value = false;
      }
    };

    onMounted(() => {
      document.addEventListener('click', handleClickOutside);
      fetchConversationData();
      loadMessages();
      fetchPartnerName();
      fetchFoundItemName();
    });

    onBeforeUnmount(() => {
      document.removeEventListener('click', handleClickOutside);
      if (unsubscribeMessages) unsubscribeMessages();
      if (unsubscribeConversation) unsubscribeConversation();
    });

    const fetchConversationData = () => {
      const conversationRef = doc(db, 'conversations', props.conversationId);
      unsubscribeConversation = onSnapshot(conversationRef, (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          itemStatus.value = data.itemStatus || 'Matched';
          isFounder.value = data.roles?.founder === props.currentUserID;
          lostItemId.value = data.lostItemId || '';
          foundItemId.value = data.foundItemId || '';
          partnerRole.value = data.roles?.founder === props.partnerID ? 'Founder' : 'Searcher';
          notified.value = data.Notified ?? false;
        } else {
          itemStatus.value = 'Matched';
          isFounder.value = false;
          lostItemId.value = '';
          foundItemId.value = '';
          partnerRole.value = '';
          notified.value = false;
          console.warn(`Conversation with ID ${props.conversationId} does not exist.`);
          emit('conversationDeleted', props.conversationId);
        }
      }, (error) => {
        console.error('Error fetching conversation:', error);
        itemStatus.value = 'Matched';
        isFounder.value = false;
        lostItemId.value = '';
        foundItemId.value = '';
        partnerRole.value = '';
        notified.value = false;
      });
    };

    const fetchFoundItemName = async () => {
      try {
        const conversationRef = doc(db, 'conversations', props.conversationId);
        const conversationSnap = await getDoc(conversationRef);
        if (conversationSnap.exists()) {
          const foundItemId = conversationSnap.data().foundItemId;
          if (foundItemId) {
            const foundItemRef = doc(db, 'Found Item', foundItemId);
            const foundItemSnap = await getDoc(foundItemRef);
            if (foundItemSnap.exists()) {
              foundItemName.value = foundItemSnap.data().name || 'Unknown Item';
            } else {
              foundItemName.value = 'Unknown Item';
            }
          } else {
            foundItemName.value = 'Unknown Item';
          }
        }
      } catch (error) {
        console.error('Error fetching Found Item name:', error);
        foundItemName.value = 'Unknown Item';
      }
    };

    watch(itemStatus, async (newStatus) => {
      if (!lostItemId.value || !foundItemId.value) {
        console.warn('lostItemId or foundItemId not found in conversation document.');
        return;
      }

      try {
        const lostItemRef = doc(db, 'Lost Item', lostItemId.value);
        const foundItemRef = doc(db, 'Found Item', foundItemId.value);

        await Promise.all([
          updateDoc(lostItemRef, { claimed_status: newStatus }),
          updateDoc(foundItemRef, { claimed_status: newStatus })
        ]);
        console.log(`Updated claimed_status to ${newStatus} for Lost Item ${lostItemId.value} and Found Item ${foundItemId.value}`);
      } catch (error) {
        console.error('Error updating claimed_status:', error);
        alert('Failed to update item status in Lost Item and Found Item. Please try again.');
      }
    });

    const deleteConversation = async () => {
      try {
        const messagesRef = collection(db, 'conversations', props.conversationId, 'messages');
        const messagesSnapshot = await getDocs(messagesRef);
        const deletePromises = [];
        messagesSnapshot.forEach((docSnap) => {
          deletePromises.push(deleteDoc(doc(db, 'conversations', props.conversationId, 'messages', docSnap.id)));
        });
        await Promise.all(deletePromises);
        await deleteDoc(doc(db, 'conversations', props.conversationId));
      } catch (error) {
        console.error('Error deleting conversation:', error);
        throw error;
      }
    };

    const onDeleteConversation = async () => {
      const confirmed = window.confirm(
        'Are you sure you want to delete this conversation? This action is permanent and cannot be undone.'
      );
      if (confirmed) {
        try {
          await deleteConversation();
          emit('conversationDeleted', props.conversationId);
          router.push('/messages');
        } catch (error) {
          alert('Failed to delete the conversation. Please try again.');
        }
      }
      dropdownOpen.value = false;
    };

    const onItemReturned = async () => {
      const isReturning = itemStatus.value === 'Matched';
      const message = isReturning
        ? 'Are you sure the item has been returned to its owner?'
        : 'Are you sure you want to undo the item returned status?';
      const confirmed = window.confirm(message);
      if (confirmed) {
        try {
          const newStatus = isReturning ? 'Returned' : 'Matched';
          await updateDoc(doc(db, 'conversations', props.conversationId), {
            itemStatus: newStatus
          });
        } catch (error) {
          console.error(`Error ${isReturning ? 'marking item as returned' : 'undoing item returned'}:`, error);
          alert(`Failed to ${isReturning ? 'mark the item as returned' : 'undo the item returned status'}. Please try again.`);
        }
      }
      dropdownOpen.value = false;
    };

    const onItemNotMine = async () => {
      const confirmed = window.confirm(
        'Undoing this match will delete the current conversation and recreate the found item. This action is permanent and cannot be undone. Are you sure you want to proceed?'
      );
      if (confirmed) {
        try {
          // Step 1: Get the found item data
          const foundItemRef = doc(db, 'Found Item', foundItemId.value);
          const foundItemSnap = await getDoc(foundItemRef);
          if (foundItemSnap.exists()) {
            const foundItemData = foundItemSnap.data();

            // Step 2: Delete the old found item
            const userRef = doc(db, 'History', foundItemData.reporter_id)
            await updateDoc(userRef, {
              found_item_id_list: arrayRemove(foundItemId.value), // Remove the item ID from the array
            })
            await deleteDoc(foundItemRef);
            
            const form = {
                        category: foundItemData.category,
                        color: foundItemData.colour,
                        brand: foundItemData.brand,
                        location: foundItemData.location,
                        datetime: foundItemData.date_time_found,
                        description: foundItemData.description,
                    }
            const itemArray = await findMatchingLostItems(form)

            // Step 3: Create a new found item with claimed_status 'Not Found Yet'
            const newFoundItemData = {
              ...foundItemData,
              claimed_status: 'Not Found Yet',
              similar_item: itemArray

            };
            


            const docRef = await addDoc(collection(db, 'Found Item'), newFoundItemData);
            
            await updateDoc(userRef, {
                found_item_id_list: arrayUnion(docRef.id),
            })

          } else {
            console.warn('Found item does not exist.');
          }

          // Step 4: Update the lost item's claimed_status
          const lostItemRef = doc(db, 'Lost Item', lostItemId.value);
          await updateDoc(lostItemRef, { claimed_status: 'Not Found Yet' });
          await updateDoc(lostItemRef, {
            photo: deleteField()
          })


          // Step 5: Delete the conversation
          await deleteConversation();

          // Step 6: Emit event and redirect
          emit('conversationDeleted', props.conversationId);
          router.push('/messages');
        } catch (error) {
          console.error('Error undoing match:', error);
          alert('Failed to undo the match. Please try again.');
        }
      }
      dropdownOpen.value = false;
    };

    const updatedMessageIds = new Set();
    watch(() => props.partnerID, () => {
      fetchPartnerName();
    });

    const groupedMessages = computed(() => {
      if (!messages.value.length) return [];
      const dateMap = new Map();

      for (const msg of messages.value) {
        const timestamp = msg.timestamp;
        if (!timestamp) continue;
        const dateObj = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
        const dateString = dateObj.toLocaleDateString([], {
          year: 'numeric',
          month: 'long',
          day: 'numeric'
        });
        if (!dateMap.has(dateString)) {
          dateMap.set(dateString, []);
        }
        dateMap.get(dateString).push(msg);
      }

      const result = [];
      for (const [dateString, msgs] of dateMap.entries()) {
        msgs.sort((a, b) => {
          const aTime = a.timestamp ? a.timestamp.toMillis() : 0;
          const bTime = b.timestamp ? b.timestamp.toMillis() : 0;
          return aTime - bTime;
        });
        result.push({ date: dateString, messages: msgs });
      }

      result.sort((a, b) => new Date(a.date) - new Date(b.date));
      return result;
    });

    const loadMessages = () => {
      if (unsubscribeMessages) unsubscribeMessages();
      const messagesRef = collection(db, 'conversations', props.conversationId, 'messages');
      const q = query(messagesRef, orderBy('timestamp'));
      unsubscribeMessages = onSnapshot(q, (snapshot) => {
        messages.value = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        
        snapshot.docs.forEach((docSnap) => {
          const msg = docSnap.data();
          if (msg.sender !== props.currentUserID && !msg.readAt && !updatedMessageIds.has(docSnap.id)) {
            updateDoc(
              doc(db, 'conversations', props.conversationId, 'messages', docSnap.id),
              { readAt: serverTimestamp() }
            )
              .then(() => {
                updatedMessageIds.add(docSnap.id);
              })
              .catch((error) => {
                console.error('Error updating read receipt:', error);
              });
          }
        });

        nextTick(() => {
          if (messageContainer.value) {
            messageContainer.value.scrollTop = messageContainer.value.scrollHeight;
          }
        });
      }, (error) => {
        console.error('Error loading messages:', error);
      });
    };

    const fetchPartnerName = async () => {
      try {
        const userDoc = await getDoc(doc(db, 'users', props.partnerID));
        if (userDoc.exists()) {
          partnerDisplayName.value = userDoc.data().name || 'Unknown User';
        } else {
          partnerDisplayName.value = 'Unknown User';
          console.warn(`User with ID ${props.partnerID} does not exist.`);
        }
      } catch (err) {
        console.error('Error fetching partner name:', err);
        partnerDisplayName.value = 'Unknown User';
      }
    };

    watch(() => props.conversationId, () => {
      messages.value = [];
      fetchConversationData();
      loadMessages();
      fetchFoundItemName();
    });

    watch(messages, () => {
      nextTick(() => {
        if (messageContainer.value) {
          messageContainer.value.scrollTo({
            top: messageContainer.value.scrollHeight,
            behavior: 'smooth'
          });
        }
      });
    });

    const confirmDeleteMessage = async (message) => {
      const userConfirmed = window.confirm('Are you sure you want to delete this message?');
      if (!userConfirmed) return;
      try {
        if (message.attachmentPath) {
          const fileRef = storageRef(storage, message.attachmentPath);
          await deleteObject(fileRef);
        }
        await deleteDoc(doc(db, 'conversations', props.conversationId, 'messages', message.id));
      } catch (error) {
        console.error('Error deleting message:', error);
      }
    };

    const handleFileUpload = (e) => {
      if (e.target.files.length > 0) {
        const selectedFile = e.target.files[0];
        
        // Check file size
        if (selectedFile.size > 5242880) {
          alert('File must be less than 5MB');
          clearFile();
          return;
        }
        
        // Check for HEIC format
        const fileType = selectedFile.type.toLowerCase();
        const fileName = selectedFile.name.toLowerCase();
        if (fileType.includes('heic') || fileName.endsWith('.heic')) {
          alert('HEIC file format is not supported. Please convert to JPEG or PNG before uploading.');
          clearFile();
          return;
        }
        
        file.value = selectedFile;
        fileName.value = selectedFile.name;
        isImageFile.value = selectedFile.type.startsWith('image/');
        filePreview.value = URL.createObjectURL(selectedFile);
      }
    };

    const clearFile = () => {
      file.value = null;
      filePreview.value = null;
      fileName.value = '';
      isImageFile.value = false;
      const input = document.getElementById('file-input');
      if (input) input.value = '';
    };

    const sendMessage = async () => {
      if (isSending.value) return;
      if (newMessage.value.trim() === '' && !file.value) return;
      isSending.value = true;
      try {
        let fileToUpload = null;
        if (file.value) {
          fileToUpload = file.value;
          clearFile();
        }
        if (fileToUpload) {
          const attachmentName = fileToUpload.name;
          const attachmentType = fileToUpload.type;
          const attachmentPath = `chat_attachments/${attachmentName}-${Date.now()}`;
          const messageData = {
            text: newMessage.value.trim(),
            sender: props.currentUserID,
            receiver: props.partnerID, // Add the receiver field
            timestamp: serverTimestamp(),
            readAt: null,
            attachmentUrl: '',
            attachmentType,
            attachmentName,
            attachmentPath,
            status: 'uploading'
          };
          const messageRef = await addDoc(collection(db, 'conversations', props.conversationId, 'messages'), messageData);
          const storageReference = storageRef(storage, attachmentPath);
          await uploadBytes(storageReference, fileToUpload);
          const attachmentUrl = await getDownloadURL(storageReference);
          await updateDoc(doc(db, 'conversations', props.conversationId, 'messages', messageRef.id), {
            attachmentUrl,
            status: 'sent'
          });
        } else {
          await addDoc(collection(db, 'conversations', props.conversationId, 'messages'), {
            text: newMessage.value.trim(),
            sender: props.currentUserID,
            receiver: props.partnerID, // Add the receiver field
            timestamp: serverTimestamp(),
            readAt: null
          });
        }
        newMessage.value = '';
      } catch (error) {
        console.error('Error sending message:', error);
      } finally {
        isSending.value = false;
      }
    };

    const formatTimestamp = (timestamp) => {
      if (!timestamp) return '';
      const dateObj = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
      const now = new Date();
      const isToday = dateObj.toDateString() === now.toDateString();
      return isToday
        ? dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        : dateObj.toLocaleString([], {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
          });
    };

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
      partnerDisplayName,
      dropdownOpen,
      toggleDropdown,
      onDeleteConversation,
      onItemReturned,
      onItemNotMine,
      dropdownContainer,
      itemStatus,
      isFounder,
      partnerRole,
      foundItemName,
      notified
    };
  }
};
</script>

<style scoped>
/* Styles remain unchanged */
.chat-panel {
  display: flex;
  flex-direction: column;
  max-height: 35rem;
  min-height: 35rem;
  overflow: hidden;
}

.chat-header {
  background-color: #F2FAFF;
  padding: 0.75rem 1rem;
  border-bottom: none;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  font-family: "Inter";
  position: relative;
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

.messages {
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  background: #F2FAFF;
  display: flex;
  flex-direction: column;
}

.message {
  display: flex;
  flex-direction: column;
  margin-bottom: 0.75rem;
  position: relative;
}

.message.sent {
  align-items: flex-end;
}

.message.received {
  align-items: flex-start;
}

.message-bubble {
  max-width: 60%;
  padding: 0.75rem 1rem;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(0,0,0,0.1);
  position: relative;
  word-wrap: break-word;
  font-size: 1rem;
  line-height: 1.4;
}

.message.sent .message-bubble {
  background-color: #B3E7FF;
  color: #000;
}

.message.received .message-bubble {
  background-color: #E0E0E0;
  color: #000;
}

.message-info {
  text-align: right;
  font-size: 0.75rem;
  opacity: 0.7;
  margin-top: 0.2rem;
  font-size: 0.625rem;
}

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

.attachment {
  margin-top: 0.5rem;
  font-family: "Inter";
}
.attachment img {
  max-width: 200px;
  border-radius: 8px;
  display: block;
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

.message-form {
  display: flex;
  align-items: center;
  padding: 1rem;
  background: #F2FAFF;
  border-top: none;
}

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

.file-label {
  cursor: pointer;
  padding: 0 0.5rem;
  font-size: 1.2rem;
}

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
.attachment-wrapper {
  position: relative;
  display: inline-block;
  min-height: 50px; /* Ensure there’s space for the spinner */
  min-width: 100px;
}

.uploading-indicator {
  display: flex;
  align-items: center;
  justify-content: center;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8); /* Slight overlay effect */
  z-index: 1;
  border-radius: 8px;
}

.loading-spinner {
  position: absolute;
  top: 8px; /* Small padding from the top */
  right: 8px; /* Small padding from the right */
  width: 1.5rem; /* Smaller size: 24px */
  height: 1.5rem;
  border: 3px solid #f3f3f3; /* Adjusted border thickness for smaller size */
  border-top: 3px solid #3498db; /* Blue color for the spinner */
  border-radius: 50%;
  animation: spin 1s linear infinite;
  z-index: 2; /* Ensure the spinner is on top */
}
@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

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
  font-family: "Inter";
}

.loading-placeholder {
  font-size: 0.9rem;
  color: #888;
  padding: 0.5rem;
  background-color: #eee;
  border-radius: 6px;
  max-width: 200px;
  text-align: center;
}

.read-receipt {
  margin-left: 8px;
  font-size: 0.9rem;
  color: #666;
}

.dropdown-container {
  position: absolute;
  top: 0.75rem;
  right: 1rem;
  display: flex;
  align-items: center;
  gap: 8px;
}
.dropdown-toggle {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
  padding: 0.25rem;
}
.dropdown-menu {
  position: absolute;
  top: 2rem;
  right: 0;
  background: white;
  border: 1px solid #ccc;
  border-radius: 6px;
  min-width: 140px;
  box-shadow: 0 2px 6px rgba(0,0,0,0.15);
  display: flex;
  flex-direction: column;
  z-index: 1000;
}
.dropdown-item {
  background: none;
  border: none;
  text-align: left;
  padding: 0.5rem 1rem;
  cursor: pointer;
  font-family: "Inter";
  font-size: 0.95rem;
}
.dropdown-item:hover {
  background-color: #f5f5f5;
}
.item-status {
  display: inline-block;
  margin-right: 8px;
  font-weight: bold;
  color: #333;
  vertical-align: middle;
}
</style>