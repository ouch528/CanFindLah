<template>
    <!-- <div class="logo-container">
        <img src="@/assets/CFL_logo.png" alt="CanFindLah" />
        <span>CanFindLah</span>
    </div> -->
    <div class="main-container">
        <div class="left-panel">
            <img src="../assets/CFL_signup.png" id="illustration" alt="illustration" />
        </div>
        <div class="right-panel">
            <div class="instructions">
                <h1>Account Login</h1>
                <p id="desc">If you already signup, you can login with your NUS email address and password.</p>

                <form @submit.prevent="loginUser">
                    <label for="email">NUS Email Address</label>
                    <input type="email" v-model="email" required />

                    <label for="password">Password</label>
                    <div class="password-container">
                        <input class="password-input" :type="showPassword ? 'text' : 'password'" v-model="password" required />
                        <span class="toggle-icon" @click="togglePassword">
                            <i :class="showPassword ? 'pi pi-eye' : 'pi pi-eye-slash'"></i>
                        </span>
                    </div>
                    <br />

                    <button type="submit">Login</button>
                    <br />

                    <p class="error-message">{{ errorMessage }}</p>
                    <p v-if="needsVerification" id="prompt">
                        Haven't received the verification email? <span @click="resendVerificationEmail" style="color:#2c73eb; cursor: pointer;"> Click here to resend </span>
                    </p>
                    <p id="prompt">Don't have an account? <router-link style="text-decoration: none; color: #2c73eb" to="/signup">Sign up here</router-link></p>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { signInWithEmailAndPassword, signOut, sendEmailVerification } from 'firebase/auth'
import { auth, db } from '../firebase'
import { doc, setDoc, serverTimestamp, updateDoc, getDoc } from 'firebase/firestore'

export default {
    data() {
        return {
            email: '',
            password: '',
            showPassword: false,
            errorMessage: '',
            needsVerification: false,
            unverifiedUser: null,
        }
    },
    methods: {
        togglePassword() {
            this.showPassword = !this.showPassword
        },
        async loginUser() {
            const attempts = doc(db, "Login Attempts", this.email)
            const attemptsSnap = await getDoc(attempts)
            const now = new Date()
            let newFailCount = 1

            if (attemptsSnap.exists()) { 
                const { failCount, lastAttempt } = attemptsSnap.data()
                const diff = (now - lastAttempt.toDate()) / 1000

                // For users whose accounts have already been locked, prevent them from logging in
                if (failCount >= 5 && diff < 600) {
                    const remainingMinutes = Math.ceil((600 - diff) / 60)

                    this.errorMessage = `Account temporarily locked due to too many failed attempts. Please try again in ${remainingMinutes} minute${remainingMinutes !== 1 ? "s" : ""}.`
                    return
                }
            }

            try {
                await signInWithEmailAndPassword(auth, this.email, this.password)

                // user has not verified email
                if (!auth.currentUser.emailVerified) {
                    this.unverifiedUser = auth.currentUser
                    alert('Please verify your email before logging in.')
                    this.needsVerification = true
                    this.errorMessage = 'Please verify your email before logging in.'
                    await signOut(auth)
                    return
                }

                // sucessful login, reset the counter
                await setDoc(attempts, {
                    failCount: 0,
                    lastAttempt: serverTimestamp()
                })

                alert('Login successful! Redirecting to home page.')
                this.$router.push('/')
            } catch (error) {
                if (attemptsSnap.exists()) {
                    const { failCount, lastAttempt } = attemptsSnap.data();
                    const diff = (now - lastAttempt.toDate()) / 1000 // in seconds
                    
                    if (diff < 600) { // last failed login attempt was less than 10 minutes
                        newFailCount = failCount + 1; // increment fail count
                    }
                }

                await setDoc(attempts, {
                    failCount: newFailCount,
                    lastAttempt: serverTimestamp(),
                })

                // First time they got locked
                if (newFailCount > 5) { // == 6 condition works too
                    alert('Too many failed attempts. Account temporarily locked.')
                    this.errorMessage = 'Account temporarily locked. Please try again in 10 minutes.'
                } else {
                    this.errorMessage = 'Invalid email or password. Please try again.'
                }
            }
        },
        async resendVerificationEmail() {
            try {
                const user = this.unverifiedUser;
                if (!user) {
                    this.errorMessage = 'User info expired. Please log in again.';
                    return;
                }
                await sendEmailVerification(user);
                this.errorMessage = "Verification email sent! Please check your inbox.";
            } catch (error) {
                console.error(error);
                this.errorMessage = "Failed to resend verification email. Please try again.";
            }
        }
    },
}
</script>

<style scoped>
.main-container {
    display: flex;
    height: 100vh;
    font-family: 'Arial';
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
    background-color: #ff8844;
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
    color: #8692a6;
    font-size: 1.375rem;
    margin-top: 12px;
    margin-bottom: 30px;
}

.error-message {
    margin-top: 0px;
    margin-bottom: 15px;
    color: red;
}

form {
    display: flex;
    flex-direction: column;
    color: #696f79;
    width: 100%;
}

label {
    margin-bottom: 8px;
    font-size: 1.25rem;
}

input {
    margin-bottom: 15px;
    height: 50px;
    border: 0.5px solid #8692a6;
    border-radius: 5px;
    font-size: 1.25rem;
    padding: 0% 1.5%;
}

.password-container {
    display: flex;
    position: relative;
    align-items: center;
    height: 50px;
    border: 0.5px solid #8692a6;
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

#prompt {
    text-align: center;
}
</style>
