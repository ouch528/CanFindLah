<template>
    <div class="main-container">
        <div class="left-panel">
            <img src="@/assets/CFL_signup.png" alt="illustration">
        </div>
        <div class="right-panel">
            <div class="instructions">
                <h1>Account Signup</h1>
                <p>Join the CanFindLah Network - Helping Each Other, One Item at a Time!</p>

                <form @submit.prevent>
                    <label for="name">Name</label>
                    <input type="text">

                    <label for="email">NUS Email Address</label>
                    <input type="email">
                    
                    <label for="password">Password</label>
                    <div class="password-container">
                        <input class="password-input" :type="showPassword ? 'text' : 'password'">
                        <span class="toggle-icon" @click="togglePassword">
                            <i :class="showPassword ? 'pi pi-eye' : 'pi pi-eye-slash'"></i>
                        </span>
                    </div>
                    
                    
                    <label for="cfmpassword">Confirm Password</label>
                    <div class="password-container">
                        <input class="password-input" :type="showCfmPassword ? 'text' : 'password'">
                        <span class="toggle-icon" @click="toggleCfmPassword">
                            <i :class="showCfmPassword ? 'pi pi-eye' : 'pi pi-eye-slash'"></i>
                        </span>
                    </div>
                    <br>
                    
                    <button type="submit">Continue</button>
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
            showPassword: false,
            cfmpassword: "",
            showCfmPassword: false,
        };
    }, 
    methods: {
        togglePassword() {
            this.showPassword = !this.showPassword;
        },
        toggleCfmPassword() {
            this.showCfmPassword = !this.showCfmPassword;
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
}

.instructions {
    max-width: 80%;
}

h1 {
  font-size: 30px;
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
    font-size: 1em;
    padding: 0% 1.5%;
}

.password-container {
    display: flex;
    position: relative;
    align-items: center;
    height: 40px;
    border: 0.5px solid #8692A6;
    border-radius: 5px;
    font-size: 1em;
    padding: 0% 1.5%;
    margin-bottom: 15px;
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
    font-size: 1em;
    color: white;
}
</style>