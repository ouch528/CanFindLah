<template>
    <div class="message-list">
      <!-- Header Row: "Messages" + Trash Button -->
      <div class="header-row">
        <!-- Button that toggles delete mode -->
        <button class="toggle-delete" @click="toggleDeleteMode">
          <!-- Show a trash icon or text. You can swap icons based on mode if you want. -->
          🗑
        </button>
      </div>
  
      <!-- List of conversations -->
      <ul>
        <li
          v-for="(conversation, index) in conversations"
          :key="index"
          :class="{ active: selectedIndex === index }"
          @click="selectConversation(index)"
        >
          <!-- Sender & label row -->
          <div class="sender">
            <span class="sender-name">{{ conversation.sender }}</span>
            <span class="founder" v-if="conversation.founder">{{ conversation.founder }}</span>
            <span class="searcher" v-if="conversation.searcher">{{ conversation.searcher }}</span>
          </div>

          <div class="preview-row">
            <span class="preview-text">{{ conversation.preview }}</span>
            <span class="time">{{ conversation.time }}</span>
          </div>
  
          <!-- Timestamp and preview -->
          <!-- <div class="timestamp">{{ conversation.time }}</div>
          <div class="preview">{{ conversation.preview }}</div> -->
  
          <!-- Red minus circle at the bottom-left, visible only if isDeleteMode is true -->
          <div
            class="minus-circle"
            v-if="isDeleteMode"
            @click.stop="confirmDelete(index)"
          >
            <span>-</span>
          </div>
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
    emits: ["select", "delete"],
    data() {
      return {
        isDeleteMode: false, // toggles display of the minus button
      };
    },
    methods: {
      toggleDeleteMode() {
        this.isDeleteMode = !this.isDeleteMode;
      },
      selectConversation(index) {
        // Only select conversation if not in delete mode (optional behavior)
        if (!this.isDeleteMode) {
          this.$emit("select", index);
        }
      },
      confirmDelete(index) {
        // Show confirmation prompt
        if (
          window.confirm(
            "Are you sure you want to delete this conversation? This action cannot be undone."
          )
        ) {
          // Emit 'delete' event so the parent (App.vue) can remove it from the data array
          this.$emit("delete", index);
        }
      },
    },
  };
  </script>
  
  <style scoped>
  /* Header row with "Messages" and the trash button on the right */
  .header-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
  }
  
  .toggle-delete {
    background: none;
    border: none;
    font-size: 1.2rem;
    cursor: pointer;
  }
  
  /* Main container styles */
  .message-list {
    width: 452px;
    border-right: 1px solid #ccc;
    padding: 10px;
    overflow-y: auto
  }
  
  .message-list ul {
    list-style: none;
    margin: 0;
    padding: 0;
  }
  
  .message-list li {
    position: relative;/* Important: for absolutely positioning the minus-circle */
    padding: 5px 5px 20px 20px; 
    cursor: pointer;
    border-bottom: 1px solid #eee; 
  }
  
  .message-list li.active {
    background-color: #dfeffd;
  }
  
  .sender {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 5px;
  }

  .sender-name {
    font-size: 22px;
    font-weight: 600;
  }

  .founder {
    background-color: rgba(74, 149, 223, 1);
    color: #fff;
    padding: 2px 5px;
    border-radius: 5px;
    font-size: 0.7rem;
  }
  
  .searcher {
    background-color: rgba(255, 136, 68, 1);
    color: #fff;
    padding: 2px 5px;
    border-radius: 5px;
    font-size: 0.7rem;
  }
  
  .timestamp {
    font-size: 0.8rem;
    color: #999;
    text-align: right;
  }
  
  .preview {
    font-size: 0.9rem;
    color: #555;
    margin-top: 3px;
  }
  
  /* Minus-circle styling */
  .minus-circle {
    position: absolute;
    bottom: 10px; /* adjust as desired */
    right: 10px;   /* adjust as desired */
    width: 20px;
    height: 20px;
    background-color: rgba(255, 136, 68, 1);
    border-radius: 50%;
    color: #fff;
    font-weight: bold;
    display: flex; 
    align-items: center;
    justify-content: center;
    cursor: pointer;
    z-index: 1; 
  }

  .preview-row {
      display: flex;             /* Place preview & time side by side */
      align-items: center;       /* Vertically center them */
      justify-content: space-between; /* Spread them apart (optional) */
      margin-top: 4px;          /* Example spacing */
      font-family: 'Inter', sans-serif;
      font-weight: 300; /* Inter Light is often weight 300 */
      font-size: 18px;
    }
  </style>
  