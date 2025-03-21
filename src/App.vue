<template>
  <div id="app">
    <HeaderBar />

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
import HeaderBar from "./components/HeaderBar.vue";
import MessageList from "./components/MessageList.vue";
import MessageDetail from "./components/MessageDetail.vue";

export default {
  name: "App",
  components: {
    HeaderBar,
    MessageList,
    MessageDetail,
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
  text-align: center;
  font-family: 'Inter', sans-serif;
  font-size: 48px;              /* or 3rem, if you prefer responsive units */
  color: rgba(104, 69, 69, 1);
  margin: 20px 0;               /* optional spacing */
}

/* 3) The container that encloses your main-layout and centers it */
.messages-panel {
  /* Center horizontally */
  margin: 0 auto;
  /* Control width (either a percentage or fixed px) */
  width: 80%;
  max-width: 1200px;

  /* Add a border around the entire panel */
  border: 2px solid #ccc;
  border-radius: 8px;
  background-color: rgba(255, 250, 239, 1);

  /* Some vertical spacing if you like */
  margin-bottom: 10px;
  min-height: 600px;
  /* If you want a minimum height, you can set it here:
     min-height: 600px;
  */
  /* For layouts that have a header or extra space, you can also add margin-top if desired */
}

/* 4) The existing .main-layout that holds the left & right columns */
.main-layout {
  display: flex;
  flex: 1; /* fill the container's vertical space */
  overflow: hidden; /* no horizontal overflow */
}
</style>






<!-- <script setup>
import { RouterLink, RouterView } from 'vue-router'
import HelloWorld from './components/HelloWorld.vue'
</script>

<template>
  <header>
    <img alt="Vue logo" class="logo" src="@/assets/logo.svg" width="125" height="125" />

    <div class="wrapper">
      <HelloWorld msg="You did it!" />

      <nav>
        <RouterLink to="/">Home</RouterLink>
        <RouterLink to="/about">About</RouterLink>
      </nav>
    </div>
  </header>

  <RouterView />
</template>

<style scoped>
header {
  line-height: 1.5;
  max-height: 100vh;
}

.logo {
  display: block;
  margin: 0 auto 2rem;
}

nav {
  width: 100%;
  font-size: 12px;
  text-align: center;
  margin-top: 2rem;
}

nav a.router-link-exact-active {
  color: var(--color-text);
}

nav a.router-link-exact-active:hover {
  background-color: transparent;
}

nav a {
  display: inline-block;
  padding: 0 1rem;
  border-left: 1px solid var(--color-border);
}

nav a:first-of-type {
  border: 0;
}

@media (min-width: 1024px) {
  header {
    display: flex;
    place-items: center;
    padding-right: calc(var(--section-gap) / 2);
  }

  .logo {
    margin: 0 2rem 0 0;
  }

  header .wrapper {
    display: flex;
    place-items: flex-start;
    flex-wrap: wrap;
  }

  nav {
    text-align: left;
    margin-left: -1rem;
    font-size: 1rem;

    padding: 1rem 0;
    margin-top: 1rem;
  }
}
</style> -->
