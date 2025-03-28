<template>
    <nav class="navbar">
        <div class="logo">
            <img src="@/assets/CFL_logo.png" alt="CanFindLah" />
            <span>CanFindLah</span>
        </div>
        <ul>
            <li><router-link to="/" active-class="active-link">Home</router-link></li>
            <li>History</li>
            <li><router-link to="/Messages" active-class="active-link">Messages</router-link></li>
            <li>Logout</li>
        </ul>
    </nav>
</template>

<style scoped>
.navbar {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 15px 30px;
    font-size: 1.25rem;
}

.logo {
    display: flex;
    align-items: center;
    font-size: 1.25rem;
    font-weight: bold;
}

.logo img {
    height: 35px;
    margin-right: 5px;
}

ul {
    display: flex;
    list-style: none;
}

ul li {
    margin: 0 30px;
    font-weight: bold;
}

ul li a {
    text-decoration: none;
    color: black;
}

.active-link {
    color: #808080;
}
</style>
