<template>
    <div class="logo-container">
        <img src="@/assets/CFL_logo.png" alt="CanFindLah">
        <span>CanFindLah</span>
    </div>
    <div class="main-container">
        <div class="left-panel">
            <img src="../assets/CFL_signup.png" id="illustration" alt="illustration">
        </div>
        <div class="right-panel">
            <div class="instructions">
                <h1>Account Login</h1>
                <p id="desc">If you already signup, you can login with your NUS email address and password.</p>

                <form @submit.prevent="loginUser">
                    <label for="email">NUS Email Address</label>
                    <input type="email" v-model="email" required>
                    
                    <label for="password">Password</label>
                    <div class="password-container">
                        <input class="password-input" :type="showPassword ? 'text' : 'password'" v-model="password" required>
                        <span class="toggle-icon" @click="togglePassword">
                            <i :class="showPassword ? 'pi pi-eye' : 'pi pi-eye-slash'"></i>
                        </span>
                    </div>
                    <br>

                    <button type="submit">Login</button>
                    <br>

                    <p class="error-message">{{ errorMessage }}</p>
                    <p id="directToSignup">Don't have an account? <router-link style="text-decoration: none; color: #2C73EB" to="/signup">Sign up here</router-link></p>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { signInWithEmailAndPassword } from 'firebase/auth';
import { auth } from '../firebase';

export default {
    data() {
        return {
            email: "", 
            password: "",
            showPassword: false,
            errorMessage: ""
        };
    }, 
    methods: {
        togglePassword() {
            this.showPassword = !this.showPassword;
        }, 
        async loginUser() {
            try {
                await signInWithEmailAndPassword(auth, this.email, this.password);
                alert("Login successful! Redirecting to home page.");
                this.$router.push("/");
            } catch(error) {
                this.errorMessage = "Invalid email or password. Please try again.";
            }
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
    left: 60px;
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

#illustration {
    max-width: 75%;
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
    width: 70%;
}

h1 {
    font-size: 2.25rem;
    margin-bottom: 0px;
}

#desc {
    color: #8692A6;
    font-size: 1.375rem;
    margin-top: 12px;
    margin-bottom: 30px;
}

.error-message {
    margin-top: 0px;
    margin-bottom: 5px;
    color: red;
}

form {
    display: flex;
    flex-direction: column;
    color: #696F79;
    width: 100%;
}

label {
    margin-bottom: 8px;
    font-size: 1.25rem;
}

input {
    margin-bottom: 15px;
    height: 50px;
    border: 0.5px solid #8692A6;
    border-radius: 5px;
    font-size: 1.25rem;
    padding: 0% 1.5%;
}

.password-container {
    display: flex;
    position: relative;
    align-items: center;
    height: 50px;
    border: 0.5px solid #8692A6;
    border-radius: 5px;
    font-size: 1.25rem;
    padding: 0% 1.5%;
    margin-bottom: 15px;
    background-color: white;
    max-width: 100%;
}

.password-input {
    all: unset;
    flex-grow: 1;
    color: black;
}

.toggle-icon {
    cursor: pointer;
    margin-right: 5px;
    position: absolute;
    top: 50%;
    right: 10px;
    transform: translateY(-45%);
}

.toggle-icon img {
    width: 20px;
    height: 20px;
}

button {
    height: 50px;
    padding: 10px;
    background-color: #ff8844;
    border: none;
    border-radius: 5px;
    cursor: pointer;
    font-size: 1.25rem;
    color: white;
    min-width: 100%;
}

p {
    font-size: 1.25rem;
}

#directToSignup {
    text-align: center;
}
</style>