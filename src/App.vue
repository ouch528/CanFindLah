<template>
  <div id="app">
    <NavBar />

    <h2 class="messages-title">Messages</h2>


    <div class="messages-panel">
      <div class="main-layout">

      <!-- Left: Message List -->
        <MessageList
          :conversations="conversations"
          :selectedIndex="selectedIndex"
          @select="handleSelect"
          @delete="handleDelete"
        />

        <!-- Right: Message Detail -->
        <MessageDetail :selectedConversation="selectedConversation" />
      </div>
    </div>
  </div>

</template>


<script>
// import HeaderBar from "./components/HeaderBar.vue";
import MessageList from "./components/MessageList.vue";
import MessageDetail from "./components/MessageDetail.vue";
import NavBar from "./components/NavBar.vue";

export default {
  name: "App",
  components: {
    MessageList,
    MessageDetail,
    NavBar,
  },
  data() {
    return {
      selectedIndex: null,
      conversations: [
        {
          sender: "Jane",
          founder: "Founder",
          time: "5:01 PM",
          preview: "Where shall we meet then?",
          fullMessage: "Jane: Where shall we meet then?\nYou: Let’s decide a place soon.",
        },
        {
          sender: "Doe",
          searcher: "Searcher",
          time: "3:20 PM",
          preview: "Searching for an item",
          fullMessage: "Doe: I'm still searching for that item.\nYou: Let me know if you need help!",
        },
        {
          sender: "Mike",
          founder: "Founder",
          time: "9:08 AM",
          preview: "Need your help with something.",
          fullMessage: "Mike: Can we talk about the project?\nYou: Sure, let's discuss the details.",
        },
        {
          sender: "Sam",
          searcher: "Searcher",
          time: "12:25 AM",
          preview: "Hi, that card belongs to me.",
          fullMessage: "Sam: Hi, that card belongs to me.\nYou: Understood. Let's meet to return it.",
        },
        {
          sender: "Tim",
          searcher: "Searcher",
          time: "11:19 PM",
          preview: "Thank you for returning my item!",
          fullMessage: "Tim: Thank you for returning my item!\nYou: No problem at all.",
        },
      ],
    };
  },
  computed: {
    selectedConversation() {
      if (this.selectedIndex === null) return null;
      return this.conversations[this.selectedIndex];
    },
  },
  methods: {
    handleSelect(index) {
      this.selectedIndex = index;
    },
    handleDelete(index) {
      this.conversations.splice(index, 1);
      if (this.selectedIndex === index) {
        this.selectedIndex = null;
      }
    },
  },
};
</script>

<style>
/* 1) Root container with peach gradient background */
#app {
  margin: 0;
  padding: 0;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background: linear-gradient(to bottom, #fff, #F1C39C);
}

/* 2) Optional heading for "Messages" at the top, centered */
.messages-title {   
  position: absolute;          
  left: 37.0625rem;
  top: 7.25rem; /* based on figma is 8.25rem */
  text-align: center;
  font-family: 'Inter', sans-serif;
  font-size: 3rem;              /* or 3rem, if you prefer responsive units */
  color: rgba(104, 69, 69, 1);
  margin: 1.25rem 0;  
}

/* 3) The container that encloses your main-layout and centers it */
.messages-panel {
  position: absolute;
  display: flex;           /* make it a flex container */
  flex-direction: column;  /* stack children vertically (the heading, then .main-layout) */
  left: 63px;
  right: 63px;
  top: 232px;
  bottom: 38px;
  border: 2px solid #ccc;
  border-radius: 8px;
  background-color: rgba(255, 250, 239, 1);
}

/* 4) The existing .main-layout that holds the left & right columns */
.main-layout {
  flex: 1;             /* let it grow to fill remaining vertical space */
  display: flex;       /* so left & right columns line up horizontally */
  align-items: stretch;/* ensures both columns stretch full height */
  overflow: hidden;    /* optional if you don't want scrollbars */
}

.preview-text {
  font-size: 18px;    /* Set your desired font size here */
  font-weight: 300;   /* Set your desired font weight here */
}

.conversation {
  font-family: 'Inter', sans-serif;
  font-weight: 300; /* Inter Light is often weight 300 */
  font-size: 18px;
}


</style>
