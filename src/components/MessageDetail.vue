<template>
    <div class="message-detail">
      <div v-if="selectedConversation">
        <h2>{{ selectedConversation.sender }} <span v-if="selectedConversation.badge">({{ selectedConversation.badge }})</span></h2>
        <p><strong>Last active:</strong> {{ selectedConversation.time }}</p>
        <div class="conversation-box">
          <p>
            <!-- This is where you might display full conversation details. -->
            {{ selectedConversation.fullMessage }}
          </p>
        </div>
      </div>
      <div v-else>
        <h2 class = "positioned-message">Select a conversation to start chatting!</h2>
      </div>
    </div>
  </template>
  
  <script>
  export default {
    name: "MessageDetail",
    props: {
      selectedConversation: {
        type: Object,
        default: null,
      },
    },
  };
  </script>
  
  <style scoped>
  .message-detail {
    flex: 1;         /* fill remaining space */
    background-color: #e0f2ff; 
    padding: 20px;
    width: 860px;
  }
  
  .message-detail h2 {
    margin-bottom: 10px;
  }
  
  .conversation-box {
    border: 2px solid #ccc;
    border-radius: 5px;
    overflow: hidden;
  }

  .positioned-message {
    position: absolute;
    color: rgba(38, 38, 38, 1);
    left: 731px;
    top: 250px;
    font-family: 'Inter', sans-serif;
    font-weight: 300; /* Inter Light typically uses a weight of 300 */
    font-size: 1.25rem;
  }
  </style>
  