<template>
    <div class="user-list">
      <h2>Chat Partners</h2>
      <div v-for="user in filteredUsers" :key="user.id" class="user-item">
        <span>{{ user.name }}</span>
        <button @click="startChat(user)">Chat</button>
      </div>
    </div>
  </template>
    
  <script>
  import { ref, computed } from 'vue'
  import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore'
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
      // List of available users (in a real app, this might come from an API)
      const users = ref([
        { id: 1, name: 'User' },
        { id: 2, name: 'Xavier' },
        { id: 3, name: 'Ziyang' },
        { id: 4, name: 'Mia' }
      ])
    
      // Only show users that are not the current user
      const filteredUsers = computed(() =>
        users.value.filter((u) => u.name !== props.currentUser)
      )
    
      const startChat = async (user) => {
        // Compute conversationId as sorted([currentUser, partner]).join('-')
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
    
      return { filteredUsers, startChat }
    }
  }
  </script>
    
  <style scoped>
  .user-list {
    max-width: 300px;
    margin: 20px auto;
    border: 1px solid #ddd;
    padding: 10px;
    border-radius: 4px;
  }
  .user-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 10px;
  }
  button {
    padding: 5px 10px;
    cursor: pointer;
    border: 1px solid #007bff;
    background-color: #007bff;
    color: #fff;
    border-radius: 4px;
  }
  button:hover {
    background-color: #0056b3;
  }
  </style>
  