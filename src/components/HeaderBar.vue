<template>
    <header class="header-bar">
      <div class="brand">
        <img src="/Users/cheepheng/Documents/GitHub/l1-finaltermproject-2425s2l1_group_08/src/components/images/Magnifying Glass Tilted Right.png" alt="CanFindLah Logo" class="logo">
        <span>CanFindLah</span>
      </div>
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
  /* .header-bar {
    width: 100%;
    display: flex;
    justify-content: space-between;
    align-items: center;
    background-color: #f6f6f6;
    padding: 10px 20px;
    border-bottom: 1px solid #ccc;
    box-sizing: border-box;
  } */
  
  .brand {
    display: flex;
    /* align-items: center; */
    position: absolute;
    color: rgba(0, 0, 0, 1);
    font-weight: bold;
    font-size: 1.25rem;
    left: 8.375rem;
    top: 3.4375rem;
  }


  /* .logo {
    position: absolute;
    left: 84px;
    top: 50px;
    width: 44px;
    height: 44px;
  } */

  .nav-links {
    position: absolute;
    top: 55px;
    left: 51.625rem;
    display: flex;
    gap: 8.5rem;
    width: 51.625rem;
  }
  
  .nav-links a {
    text-decoration: none;
    color: rgba(0, 0, 0, 1);
    font-weight: bold;
    font-size: 1.25rem;
  }
  
  .nav-links a.active {
    font-size: 1.25rem;
    color: rgba(128, 128, 128, 1);
    font-weight: bold;
  }

  * {
    margin: 0 !important;
  }

  </style>
  