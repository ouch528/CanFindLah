import { defineStore } from "pinia";

export const useUserStore = defineStore("user", {
    state: () => ({
        userId: null, // Store user ID globally
    }),
    actions: {
        setUserId(id) {
            this.userId = id;
        },
        clearUserId() {
            this.userId = null; // Clear user ID on logout
        }
    }
});