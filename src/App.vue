<template>
  <div id="app">
    <!-- Header -->
    <HeaderBar />

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
      // Reset the selected index if it was the deleted conversation.
      if (this.selectedIndex === index) {
        this.selectedIndex = null;
      }
    },
  },
};
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  display: flex;
  flex-direction: column;
  min-height: 100vh;
}

/* Layout for the main content */
.main-layout {
  flex: 1;
  display: flex;         /* enable flex layout for side-by-side columns */
  align-items: stretch;  /* ensures child elements stretch vertically */
  background-color: #e0f2ff; 
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
