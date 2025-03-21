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
                <h1>Account Signup</h1>
                <p>Join the CanFindLah Network - Helping Each Other, One Item at a Time!</p>

                <form @submit.prevent="registerUser">
                    <label for="name">Name</label>
                    <input type="text" v-model="name" required>

                    <label for="email">NUS Email Address</label>
                    <input type="email" v-model="email" required>
                    
                    <label for="password">Password</label>
                    <div class="password-container">
                        <input class="password-input" :type="showPassword ? 'text' : 'password'" v-model="password" required>
                        <span class="toggle-icon" @click="togglePassword">
                            <i :class="showPassword ? 'pi pi-eye' : 'pi pi-eye-slash'"></i>
                        </span>
                    </div>
                    
                    
                    <label for="cfmPassword">Confirm Password</label>
                    <div class="password-container">
                        <input class="password-input" :type="showCfmPassword ? 'text' : 'password'" v-model="cfmPassword" required>
                        <span class="toggle-icon" @click="toggleCfmPassword">
                            <i :class="showCfmPassword ? 'pi pi-eye' : 'pi pi-eye-slash'"></i>
                        </span>
                    </div>
                    <br>
                    
                    <button type="submit">Continue</button>
                    
                    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
                    <p v-if="emailInUse" class="error-message">Email is already in use. Please <RouterLink style="text-decoration: none; color: #2C73EB" to="/login">login</RouterLink> instead.</p>
                </form>
            </div>
        </div>
    </div>
    
</template>

<script>
import { auth, createUserWithEmailAndPassword, db } from "../firebase";
import { doc, setDoc } from "firebase/firestore";

export default {
    data() {
        return {
            name: "",
            email: "",
            password: "",
            cfmPassword: "",
            showPassword: false,
            showCfmPassword: false,
            errorMessage: "",
            emailInUse: false
        };
    }, 
    methods: {
        togglePassword() {
            this.showPassword = !this.showPassword;
        },
        toggleCfmPassword() {
            this.showCfmPassword = !this.showCfmPassword;
        },
        isStrongPassword(password) {
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,-.\/:;<=>?\\@[\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,-.\/:;<=>?\\@[\]^_`{|}~]{10,}$/.test(password);
        },
        async registerUser() {
            if (!this.email.endsWith("nus.edu")) {
                this.errorMessage = "Please sign up with NUS Email.";
                return;
            }
            if (this.password !== this.cfmPassword) {
                this.errorMessage = "Passwords do not match.";
                return;
            }
            if (!this.isStrongPassword(this.password)) {
                this.errorMessage = "Password must be at least 10 characters with uppercase, lowercase, numbers, and special characters."
                return;
            }

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password);
                const user = userCredential.user;
                await setDoc(doc(db, "users", user.uid), {
                    name: this.name,
                    email: this.email,
                    createdAt: new Date()
                });
                alert("Signup sucessful! Redirecting to login.");
                this.$router.push("/login");

            } catch(error) {
                if (error.code == "auth/email-already-in-use") {
                    this.emailInUse = true;
                } else {
                    this.errorMessage = error.message;
                }
            }
        }
    }
}
</script>

<style scoped>
.main-container {
    display: flex;
    height: 100vh;
}

.logo-container {
    display: flex;
    align-items: center;
    justify-content: center;
    padding: 20px 0;
    position: absolute;
    top: 30px;
    left: 40px;
    font-size: 1.25rem;
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

.error-message {
    color: red;
    margin-top: 10px;
}
</style>