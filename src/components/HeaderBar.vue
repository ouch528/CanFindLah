<template>
    <header class="header-bar">
      <div class="brand">CanFindLah</div>
      <nav class="nav-links">
        <a href="#">Home</a>
        <a href="#">History</a>
        <a href="#" class="active">Messages</a>
        <a href="#">Log out</a>
      </nav>
    </header>
  </template>
  
  <script>
  export default {
    name: "HeaderBar",
  };
  </script>
  
  <style scoped>
  .header-bar {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f6f6f6;
    padding: 10px 20px;
    border-bottom: 1px solid #ccc;
    box-sizing: border-box;
  }
  
  .brand {
    font-weight: bold;
    font-size: 1.2rem;
  }

  .nav-links {
    /* display: inline-block; */
    /* margin-left: auto; */
    display: flex;
    gap: 20px;

  }
  
  .nav-links a {
    text-decoration: none;
    color: #333;
  }
  
  .nav-links a.active {
    font-weight: bold;
    text-decoration: underline;
  }

  * {
    margin: 0 !important;
  }

  </style>
  