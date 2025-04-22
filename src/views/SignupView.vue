<template>
    <div class="signup-page">
      <!-- Header logo -->
      <div class="logo-container">
        <img src="@/assets/CFL_logo.png" alt="CanFindLah" />
        <span>CanFindLah</span>
      </div>
      
      <!-- Main content with two-panel layout -->
      <div class="main-container">
        <!-- Left panel with illustration -->
        <div class="left-panel">
          <img src="../assets/CFL_signup.png" id="illustration" alt="Signup illustration" />
        </div>
        
        <!-- Right panel with signup form -->
        <div class="right-panel">
          <!-- Back navigation button -->
          <router-link to="/login" class="back-link">
            <div class="back-nav">
              <i class="pi pi-arrow-left"></i>
              <span> Back</span>
            </div>
          </router-link>
  
          <!-- Signup form container -->
          <div class="signup-form-container">
            <h1>Account Signup</h1>
            <p id="desc">Join the CanFindLah Network - Helping Each Other, One Item at a Time!</p>
  
            <form @submit.prevent="registerUser">
              <!-- Username field -->
              <label for="name">Username (used only for messaging)</label>
              <input 
                id="name" 
                type="text" 
                v-model="name" 
                required 
                placeholder="Enter a display name or nickname" 
              />
  
              <!-- Email field -->
              <label for="email">NUS Email Address</label>
              <input 
                id="email" 
                type="email" 
                v-model="email" 
                required 
                placeholder="Enter your NUS email"
              />
  
              <!-- Password field with visibility toggle -->
              <label for="password">Password</label>
              <div class="password-container">
                <input 
                  id="password" 
                  :type="showPassword ? 'text' : 'password'" 
                  v-model="password" 
                  required 
                  placeholder="Enter your password"
                />
                <span class="toggle-icon" @click="togglePassword">
                  <i :class="showPassword ? 'pi pi-eye' : 'pi pi-eye-slash'"></i>
                </span>
              </div>
  
              <!-- Confirm password field with visibility toggle -->
              <label for="cfmPassword">Confirm Password</label>
              <div class="password-container">
                <input 
                  id="cfmPassword" 
                  :type="showCfmPassword ? 'text' : 'password'" 
                  v-model="cfmPassword" 
                  required 
                  placeholder="Confirm your password"
                />
                <span class="toggle-icon" @click="toggleCfmPassword">
                  <i :class="showCfmPassword ? 'pi pi-eye' : 'pi pi-eye-slash'"></i>
                </span>
              </div>
              <br />
  
              <!-- Submit button -->
              <button type="submit">Continue</button>
  
              <!-- Error messages -->
              <p v-if="errorMessage" class="error-message">{{ errorMessage }}</p>
              <p v-if="emailInUse" class="error-message">
                Email is already in use. Please 
                <RouterLink class="login-link" to="/login">login</RouterLink> 
                instead.
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  </template>
  
  <script>
  import { auth, createUserWithEmailAndPassword, db } from '../firebase'
  import { doc, setDoc } from 'firebase/firestore'
  import { signOut, sendEmailVerification } from 'firebase/auth'
  
  /**
   * Signup Component
   * 
   * Allows new users to create an account with the CanFindLah platform.
   * Includes form validation, account creation, and initial user data setup.
   */
  export default {
    name: 'SignupView',
    
    data() {
      return {
        name: '',                // User's display name
        email: '',               // User's NUS email address
        password: '',            // User's password
        cfmPassword: '',         // Password confirmation
        showPassword: false,     // Toggle for password visibility
        showCfmPassword: false,  // Toggle for confirm password visibility
        errorMessage: '',        // Error message to display
        emailInUse: false,       // Flag for email already in use error
      }
    },
    
    methods: {
      /**
       * Toggles the visibility of the password field
       */
      togglePassword() {
        this.showPassword = !this.showPassword
      },
      
      /**
       * Toggles the visibility of the confirm password field
       */
      toggleCfmPassword() {
        this.showCfmPassword = !this.showCfmPassword
      },
      
      /**
       * Validates if the password meets security requirements
       * Password must be at least 10 characters with uppercase, lowercase, 
       * numbers, and special characters
       * 
       * @param {string} password - The password to validate
       * @returns {boolean} - True if password meets requirements, false otherwise
       */
      isStrongPassword(password) {
        const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[!"#$%&'()*+,-.\/:;<=>?\\@[\]^_`{|}~])[A-Za-z\d!"#$%&'()*+,-.\/:;<=>?\\@[\]^_`{|}~]{10,}$/
        return passwordRegex.test(password)
      },
      
      /**
       * Handles user registration process
       * Validates inputs, creates user account, initializes user data,
       * and sends verification email
       */
      async registerUser() {
        const lowerEmail = this.email.toLowerCase()

        // Validate NUS email domain
        if (!lowerEmail.endsWith('nus.edu') && lowerEmail !== 'testuser@test.com') {
          this.errorMessage = 'Please sign up with NUS Email.'
          return
        }
        
        // Validate password match
        if (this.password !== this.cfmPassword) {
          this.errorMessage = 'Passwords do not match.'
          return
        }
        
        // Validate password strength
        if (lowerEmail !== 'testuser@test.com' && !this.isStrongPassword(this.password)) {
          this.errorMessage = 'Password must be at least 10 characters with uppercase, lowercase, numbers, and special characters.'
          return
        }
  
        try {
          // Create user account
          const userCredential = await createUserWithEmailAndPassword(auth, this.email, this.password)
          const user = userCredential.user
          
          // Initialize user profile in Firestore
          await setDoc(doc(db, 'users', user.uid), {
            userID: user.uid,
            name: this.name,
            email: this.email,
            createdAt: new Date(),
          })
  
          // Initialize user history record
          await setDoc(doc(db, 'History', user.uid), {
            user_id: user.uid,
            found_item_id_list: [],
            lost_item_id_list: [],
          })
          
          // Send verification email
          if (lowerEmail !== 'testuser@test.com') {
            await sendEmailVerification(user)
          }
  
          // Sign out user and redirect to login page
          await signOut(auth)

          if (lowerEmail === 'testuser@test.com') {
            alert('Demo signup successful! You can now log in directly.')
          } else {
            alert('Signup successful! A verification email has been sent to your inbox. Please verify your email before logging in.')
          }

          this.$router.push('/login')
        } catch (error) {
          // Handle registration errors
          if (error.code === 'auth/email-already-in-use') {
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
  /* Layout and container styles */
  .signup-page {
    position: relative;
    min-height: 100vh;
    font-family: Arial, sans-serif;
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
    font-size: 1.25rem;
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
  
  /* Right panel - form area */
  .right-panel {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    background-color: white;
    position: relative;
  }
  
  .back-link {
    text-decoration: none;
    color: #8692a6;
  }
  
  .back-nav {
    position: absolute;
    top: 50px;
    left: 32px;
    font-size: 1.25rem;
  }
  
  .signup-form-container {
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
  
  /* Password field with toggle button */
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
  
  #password,
  #cfmPassword {
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
  
  /* Button styling */
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
  
  /* Error message styling */
  .error-message {
    color: red;
    margin-top: 10px;
    font-size: 1.25rem;
  }
  
  /* Link styling */
  .login-link {
    text-decoration: none;
    color: #2c73eb;
  }
  </style>