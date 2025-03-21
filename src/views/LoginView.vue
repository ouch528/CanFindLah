<template>
    <div class="logo-container">
        <img src="@/assets/CFL_logo.png" alt="CanFindLah">
        <span>CanFindLah</span>
    </div>
    <div class="main-container">
        <div class="left-panel">
            <img src="../assets/CFL_signup.png" alt="illustration">
        </div>
        <div class="right-panel">
            <div class="instructions">
                <h1>Account Login</h1>
                <p>If you already signup, you can login with your NUS email address and password.</p>

                <form @submit.prevent>
                    <label for="email">NUS Email Address</label>
                    <input type="email">
                    
                    <label for="password">Password</label>
                    <div class="password-container">
                        <input class="password-input" :type="showPassword ? 'text' : 'password'">
                        <span class="toggle-icon" @click="togglePassword">
                            <i :class="showPassword ? 'pi pi-eye' : 'pi pi-eye-slash'"></i>
                        </span>
                    </div>
                    <br>

                    <button type="submit">Login</button>
                    <br>

                    <p id="directToSignup">Don't have an account? <router-link style="text-decoration: none; color: #2C73EB" to="/signup">Sign up here</router-link></p>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
export default {
    data() {
        return {
            password: "",
            showPassword: false
        };
    }, 
    methods: {
        togglePassword() {
            this.showPassword = !this.showPassword;
        }
    }
}
</script>

<style scoped>
.main-container {
    display: flex;
    height: 100vh;
    font-family: "Arial";
}

.logo-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 0;
    position: absolute;
    top: 30px;
    left: 40px;
    font-size: 1.25em;
    font-weight: bold;
}

.logo-container img {
    height: 35px;
    margin-right: 5px;
}

.left-panel {
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #FF8844;
}

img {
    max-width: 60%;
}

.right-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
}

.instructions {
    max-width: 80%;
}

h1 {
    font-size: 1.875rem;
    margin-bottom: 0px;
}

p {
    color: #8692A6;
}

form {
    display: flex;
    flex-direction: column;
    color: #696F79;
}

label {
    margin-bottom: 8px;
}

input {
    margin-bottom: 15px;
    height: 40px;
    border: 0.5px solid #8692A6;
    border-radius: 5px;
    font-size: 1rem;
    padding: 0% 1.5%;
}

.password-container {
    display: flex;
    position: relative;
    align-items: center;
    height: 40px;
    border: 0.5px solid #8692A6;
    border-radius: 5px;
    font-size: 1rem;
    padding: 0% 1.5%;
    margin-bottom: 15px;
    background-color: white;
}

.password-input {
    all: unset;
    flex-grow: 1;
}

.toggle-icon {
    cursor: pointer;
    margin-right: 5px;
}

.toggle-icon img {
    width: 20px;
    height: 20px;
}

button {
    height: 40px;
    padding: 10px;
    background-color: #ff8844;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1rem;
    color: white;
}

#directToSignup {
    text-align: center;
}
</style>