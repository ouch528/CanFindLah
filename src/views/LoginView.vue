<template>
    <div class="login-page">
      <!-- Header logo -->
      <div class="logo-container">
        <img src="@/assets/CFL_logo.png" alt="CanFindLah" />
        <span>CanFindLah</span>
      </div>
      
      <!-- Main content area with two-panel layout -->
      <div class="main-container">
        <!-- Left panel with illustration -->
        <div class="left-panel">
          <img src="../assets/CFL_signup.png" id="illustration" alt="Login illustration" />
        </div>
        
        <!-- Right panel with login form -->
        <div class="right-panel">
          <div class="login-form-container">
            <h1>Account Login</h1>
            <p id="desc">If you already signed up, you can login with your NUS email address and password.</p>
  
            <form @submit.prevent="loginUser">
              <!-- Email input field -->
              <label for="email">NUS Email Address</label>
              <input id="email" type="email" v-model="email" required />
  
              <!-- Password input with toggle visibility -->
              <label for="password">Password</label>
              <div class="password-container">
                <input 
                  id="password" 
                  :type="showPassword ? 'text' : 'password'" 
                  v-model="password" 
                  required 
                />
                <span class="toggle-icon" @click="togglePassword">
                  <i :class="showPassword ? 'pi pi-eye' : 'pi pi-eye-slash'"></i>
                </span>
              </div>
              
              <!-- Password reset link -->
              <p id="forgot-password">
                <span @click="forgotPassword">Forgot password?</span>
              </p>
              <br />
  
              <!-- Login button -->
              <button type="submit">Login</button>
              <br />
  
              <!-- Error messages and verification reminder -->
              <p class="error-message">{{ errorMessage }}</p>
              <p v-if="needsVerification" id="prompt">
                Haven't received the verification email? 
                <span @click="resendVerificationEmail" class="action-link">Click here to resend</span>
              </p>
              
              <!-- Sign up link -->
              <p id="prompt">
                Don't have an account? 
                <router-link class="action-link" to="/signup">Sign up here</router-link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { useUserStore } from '@/stores/user-store'
  import { 
    signInWithEmailAndPassword, 
    signOut, 
    sendEmailVerification, 
    sendPasswordResetEmail, 
    fetchSignInMethodsForEmail 
  } from 'firebase/auth'
  import { auth, db } from '../firebase'
  import { 
    doc, 
    setDoc, 
    serverTimestamp, 
    getDoc 
  } from 'firebase/firestore'
  
  /**
   * Login component for CanFindLah application
   * 
   * This component handles user authentication including:
   * - Email/password login
   * - Email verification checks
   * - Password reset functionality
   * - Login attempt tracking to prevent brute force attacks
   */
  export default {
    name: 'LoginView',
    
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
      /**
       * Toggles password visibility between visible and hidden
       */
      togglePassword() {
        this.showPassword = !this.showPassword
      },
      
      /**
       * Handles password reset request
       * Sends a password reset email if the provided email exists
       */
      async forgotPassword() {
        // Validate email is provided
        if (!this.email) {
          alert('Please enter your email address first.')
          return
        }
        
        const confirmed = confirm('Reset password? A password reset email will be sent to your inbox')
        if (!confirmed) return
  
        try {
          // Check if email exists (but don't reveal this information to the user)
          await fetchSignInMethodsForEmail(auth, this.email)
          
          // Send reset email
          await sendPasswordResetEmail(auth, this.email)
          alert('If your email exists, a reset link will be sent.')
        } catch (error) {
          console.error('Reset error: ', error)
          
          if (error.code === 'auth/invalid-email') {
            this.errorMessage = 'Please enter a valid email address.'
          } else {
            this.errorMessage = 'Failed to send reset email. Please try again.'
          }
        }
      },
      
      /**
       * Handles user login with provided credentials
       * Implements security features like account locking after multiple failed attempts
       */
      async loginUser() {
        // Track login attempts in Firestore
        const attempts = doc(db, 'Login Attempts', this.email)
        const attemptsSnap = await getDoc(attempts)
        const now = new Date()
        let newFailCount = 1
  
        // Check if account is locked due to previous failed attempts
        if (attemptsSnap.exists()) {
          const { failCount, lastAttempt } = attemptsSnap.data()
          const secondsSinceLastAttempt = (now - lastAttempt.toDate()) / 1000
  
          // Block login if account is locked (5+ failed attempts within 5 minutes)
          if (failCount >= 5 && secondsSinceLastAttempt < 300) {
            const remainingMinutes = Math.ceil((300 - secondsSinceLastAttempt) / 60)
            this.errorMessage = `Account temporarily locked due to too many failed attempts. Please try again in ${remainingMinutes} minute${remainingMinutes !== 1 ? 's' : ''}.`
            return
          }
        }
  
        try {
          // Attempt to sign in
          const userCredential = await signInWithEmailAndPassword(auth, this.email, this.password)
  
          // Check if email is verified
          if (!auth.currentUser.emailVerified) {
            this.unverifiedUser = auth.currentUser
            alert('Please verify your email before logging in.')
            this.needsVerification = true
            this.errorMessage = 'Please verify your email before logging in.'
            await signOut(auth)
            return
          }
  
          // Successful login - store user data
          const user = userCredential.user
          const userId = user.uid
          const userStore = useUserStore()
          userStore.setUserId(userId)
  
          // Reset failed attempt counter
          await setDoc(attempts, {
            failCount: 0,
            lastAttempt: serverTimestamp(),
          })
  
          alert('Login successful! Redirecting to home page.')
          this.$router.push('/')
        } catch (error) {
          // Handle failed login attempt
          if (attemptsSnap.exists()) {
            const { failCount, lastAttempt } = attemptsSnap.data()
            const secondsSinceLastAttempt = (now - lastAttempt.toDate()) / 1000
  
            if (secondsSinceLastAttempt < 300) {
              // Increment fail count if within the 5-minute window
              newFailCount = failCount + 1
            }
          }
  
          // Update failed attempt counter
          await setDoc(attempts, {
            failCount: newFailCount,
            lastAttempt: serverTimestamp(),
          })
  
          // Lock account if too many failed attempts
          if (newFailCount > 5) {
            alert('Too many failed attempts. Account temporarily locked.')
            this.errorMessage = 'Account temporarily locked. Please try again in 10 minutes.'
          } else {
            this.errorMessage = 'Invalid email or password. Please try again.'
          }
        }
      },
      
      /**
       * Resends the verification email to an unverified user
       */
      async resendVerificationEmail() {
        try {
          const user = this.unverifiedUser
          if (!user) {
            this.errorMessage = 'User info expired. Please log in again.'
            return
          }
          
          await sendEmailVerification(user)
          this.errorMessage = 'Verification email sent! Please check your inbox.'
        } catch (error) {
          console.error(error)
          this.errorMessage = 'Failed to resend verification email. Please try again.'
        }
      },
    },
  }
  </script>
  
  <style scoped>
  /* Layout styles */
  .login-page {
    position: relative;
    min-height: 100vh;
    font-family: 'Arial', sans-serif;
  }
  
  .main-container {
    display: flex;
    height: 100vh;
  }
  
  /* Logo styles */
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
    z-index: 10;
  }
  
  .logo-container img {
    height: 35px;
    margin-right: 5px;
  }
  
  /* Left panel - illustration area */
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
  
  /* Right panel - login form area */
  .right-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
  }
  
  .login-form-container {
    width: 70%;
  }
  
  /* Typography */
  h1 {
    font-size: 2.25rem;
    margin-bottom: 0;
  }
  
  #desc {
    color: #8692a6;
    font-size: 1.375rem;
    margin-top: 12px;
    margin-bottom: 30px;
  }
  
  .error-message {
    margin-top: 0;
    margin-bottom: 15px;
    color: red;
  }
  
  /* Form elements */
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
    padding: 0 1.5%;
  }
  
  /* Password field container with toggle button */
  .password-container {
    display: flex;
    position: relative;
    align-items: center;
    height: 50px;
    border: 0.5px solid #8692a6;
    border-radius: 5px;
    font-size: 1.25rem;
    padding: 0 1.5%;
    margin-bottom: 15px;
    background-color: white;
    max-width: 100%;
  }
  
  #password {
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
  
  /* Button styles */
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
  
  /* Links and helper text */
  p {
    font-size: 1.25rem;
  }
  
  #forgot-password {
    margin-top: 0;
    font-size: 1rem;
    text-align: right;
    color: #8692a6;
  }
  
  #forgot-password span {
    cursor: pointer;
  }
  
  #prompt {
    text-align: center;
  }
  
  .action-link {
    text-decoration: none;
    color: #2c73eb;
    cursor: pointer;
  }
  </style>