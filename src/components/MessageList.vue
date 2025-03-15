<template>
    <div class="message-list">
      <h2>Messages</h2>
      <!-- List of conversations -->
      <ul>
        <li
          v-for="(conversation, index) in conversations"
          :key="index"
          :class="{ active: selectedIndex === index }"
          @click="selectedConversation(index)"
        >
          <div class="sender">
            <span class = "sender-name">{{ conversation.sender }}</span>

            <span class="founder" v-if="conversation.founder">{{ conversation.founder }}</span>
            <span class="searcher" v-if="conversation.searcher">{{ conversation.searcher }}</span>
          </div>
          <div class="timestamp">{{ conversation.time }}</div>
          <div class="preview">{{ conversation.preview }}</div>
        </li>
      </ul>
    </div>
  </template>
  
  <script>
  export default {
    name: "MessageList",
    props: {
      conversations: {
        type: Array,
        required: true,
      },
      selectedIndex: {
        type: Number,
        default: null,
      },
    },
    emits: ["select"],
    methods: {
      selectedConversation(index) {
        this.$emit("select", index);
      },
    },
  };
  </script>
  
  <style scoped>
  .message-list {
    width: 250px;
    border-right: 1px solid #ccc;
    padding: 10px;
  }
  
  .message-list h2 {
    margin: 0 0 10px 0;
    font-size: 1.2rem;
  }
  
  .message-list ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  .message-list li {
    padding: 10px;
    cursor: pointer;
    border-bottom: 1px solid #eee;
  }
  
  .message-list li:hover {
    background-color: #f9f9f9;
  }
  
  .message-list li.active {
    background-color: #dfeffd;
  }
  
  .sender {
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 5px;
  }
  
  .sender-name {
    font-weight: bold;
  }
  
  .founder {
    background-color: orangered;
    color: #fff; /* better readability on blue */
    padding: 2px 5px;
    border-radius: 5px;
    font-size: 0.7rem;
  } 
  .searcher {
    background-color: blue;
    color: white;
    padding: 2px 5px;
    border-radius: 5px;
    font-size: 0.7rem;
  }
  
  .timestamp {
    font-size: 0.8rem;
    color: #999;
  }
  
  .preview {
    font-size: 0.9rem;
    color: #555;
    margin-top: 3px;
  }
  </style>
  