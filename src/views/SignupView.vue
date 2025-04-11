<template>
    <div class="logo-container">
        <img src="@/assets/CFL_logo.png" alt="CanFindLah" />
        <span>CanFindLah</span>
    </div>
    <div class="main-container">
        <div class="left-panel">
            <img src="../assets/CFL_signup.png" id="illustration" alt="illustration" />
        </div>
        <div class="right-panel">
            <router-link to="/login" style="text-decoration: none; color: #8692a6">
                <div class="back-nav">
                    <i class="pi pi-arrow-left"></i>
                    <span> Back</span>
                </div>
            </router-link>

            <div class="instructions">
                <h1>Account Signup</h1>
                <p id="desc">Join the CanFindLah Network - Helping Each Other, One Item at a Time!</p>

                <form @submit.prevent="registerUser">
                    <label for="name">Name</label>
                    <input type="text" v-model="name" required />

                    <label for="email">NUS Email Address</label>
                    <input type="email" v-model="email" required />

                    <label for="password">Password</label>
                    <div class="password-container">
                        <input class="password-input" :type="showPassword ? 'text' : 'password'" v-model="password" required />
                        <span class="toggle-icon" @click="togglePassword">
                            <i :class="showPassword ? 'pi pi-eye' : 'pi pi-eye-slash'"></i>
                        </span>
                    </div>

                    <label for="cfmPassword">Confirm Password</label>
                    <div class="password-container">
                        <input class="password-input" :type="showCfmPassword ? 'text' : 'password'" v-model="cfmPassword" required />
                        <span class="toggle-icon" @click="toggleCfmPassword">
                            <i :class="showCfmPassword ? 'pi pi-eye' : 'pi pi-eye-slash'"></i>
                        </span>
                    </div>
                    <br />

                    <button type="submit">Continue</button>

                    <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
                    <p v-if="emailInUse" class="error-message">Email is already in use. Please <RouterLink style="text-decoration: none; color: #2c73eb" to="/login">login</RouterLink> instead.</p>
                </form>
            </div>
        </div>
    </div>
</template>

<script>
import { auth, createUserWithEmailAndPassword, db } from '../firebase'
import { doc, setDoc } from 'firebase/firestore'
import { signOut, sendEmailVerification } from 'firebase/auth'

export default {
    data() {
        return {
            name: '',
            email: '',
            password: '',
            cfmPassword: '',
            showPassword: false,
            showCfmPassword: false,
            errorMessage: '',
            emailInUse: false,
        }
    },
    methods: {
        togglePassword() {
            this.showPassword = !this.showPassword
        },
        toggleCfmPassword() {
            this.showCfmPassword = !this.showCfmPassword
        },
        isStrongPassword(password) {
            return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,-.\/:;<=>?\\@[\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,-.\/:;<=>?\\@[\]^_`{|}~]{10,}$/.test(password)
        },
        async registerUser() {
            if (!this.email.endsWith('nus.edu')) {
                this.errorMessage = 'Please sign up with NUS Email.'
                return
            }
            if (this.password !== this.cfmPassword) {
                this.errorMessage = 'Passwords do not match.'
                return
            }
            if (!this.isStrongPassword(this.password)) {
                this.errorMessage = 'Password must be at least 10 characters with uppercase, lowercase, numbers, and special characters.'
                return
            }

            try {
                const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password)
                const user = userCredential.user
                await setDoc(doc(db, 'users', user.uid), {
                    userID: user.uid,
                    name: this.name,
                    email: this.email,
                    createdAt: new Date(),
                })

                await setDoc(doc(db, 'History', user.uid), {
                    user_id: user.uid,
                    found_item_id_list: [],
                    lost_item_id_list: [],
                })
                await sendEmailVerification(user)

                await signOut(auth)
                alert('Signup sucessful! A verification email has been sent to your inbox. Please verify your email before logging in.')
                this.$router.push('/login')
            } catch (error) {
                if (error.code == 'auth/email-already-in-use') {
                    this.emailInUse = true
                } else {
                    this.errorMessage = error.message
                }
            }
        },
    },
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
    left: 60px;
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
    position: relative;
}

.back-nav {
    position: absolute;
    top: 50px;
    left: 32px;
    font-size: 1.25rem;
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

.error-message {
    color: red;
    margin-top: 10px;
    font-size: 1.25rem;
}
</style>
