<template>
  <div class="container">
    <form id="lost_form">
      <h2 id="header">Report Lost Item</h2>

      <div class="formli">
        <RouterLink to="/">
          <img id="backward_img" src="@/assets/arrow_back.png" alt="Back to Home" />
        </RouterLink>
        <br />

        <label for="cat">Category </label> <br />
        <select name="cat" id="cat" v-model="formData.category">
          <option value="">--Please choose the category--</option>
          <option value="card">Card</option>
          <option value="waterbottle">Waterbottle</option>
          <option value="adapter">Adapter</option>
          <option value="stationary">Stationary</option>
        </select>
        <br />
        <br />

        <label for="col">Colour: </label> <br />
        <input type="color" id="col" v-model="formData.color" required /> <br /><br />

        <label for="brand">Brand: </label> <br />
        <input type="text" id="brand" v-model="formData.brand" required placeholder="Enter Brand" />
        <br /><br />

        <label for="loc">Location Lost: </label> <br />
        <input
          type="text"
          id="loc"
          v-model="formData.location"
          required
          placeholder="Enter Location Lost"
        />
        <br /><br />

        <label for="datetime">Date & Time Lost: </label> <br />
        <input
          type="datetime-local"
          id="datetime"
          v-model="formData.datetime"
          required
          :max="maxDateTime"
          placeholder="Enter Date & Time Lost"
        />
        <br /><br />

        <label for="desc">Description: </label> <br />
        <textarea
          name="desc"
          v-model="formData.description"
          rows="5"
          cols="20"
          placeholder="Enter Description"
        >
Enter Description</textarea
        >
        <br /><br />

        <div class="save">
          <button id="savebutton" type="button" @click="saveLostItem()">Submit</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
import firebaseApp from '../firebase.js'
import { getFirestore } from 'firebase/firestore'
import { collection, addDoc } from 'firebase/firestore'
const db = getFirestore(firebaseApp)

export default {
  data() {
    return {
      formData: {
        category: '',
        color: '#000000',
        brand: '',
        location: '',
        datetime: '',
        description: '',
      },
      maxDateTime: new Date().toISOString().slice(0, 16),
    }
  },
  methods: {
    hexToColorName(hex) {
      const colorMap = {
        '#000000': 'Black',
        '#FFFFFF': 'White',
        '#FF0000': 'Red',
        '#00FF00': 'Green',
        '#0000FF': 'Blue',
        '#FFFF00': 'Yellow',
        '#FFA500': 'Orange',
        '#800080': 'Purple',
        '#FFC0CB': 'Pink',
      }

      return colorMap[hex] || 'Unknown'
    },

    async saveLostItem() {
      if (this.validateForm()) {
        try {
          const colorName = this.hexToColorName(this.formData.color)

          await addDoc(collection(db, 'Lost Item'), {
            category: this.formData.category,
            color: colorName,
            brand: this.formData.brand,
            location_found: this.formData.location,
            datetime_found: this.formData.datetime,
            description: this.formData.description,
            claimed_status: false,
            name: `${colorName} ${this.formData.category}`,
          })

          this.formData = {
            category: '',
            color: '#000000',
            brand: '',
            location: '',
            datetime: '',
            description: '',
          }

          alert('Item reported successfully!')
        } catch (error) {
          console.error('Error saving item:', error)
          alert('Failed to report item. Please try again.')
        }
      }
    },

    validateForm() {
      if (
        !this.formData.category ||
        !this.formData.color ||
        !this.formData.brand ||
        !this.formData.location ||
        !this.formData.datetime ||
        !this.formData.description
      ) {
        alert('Please fill all required fields.')
        return false
      }

      const selectedDateTime = new Date(this.formData.datetime)
      const now = new Date()

      if (selectedDateTime > now) {
        alert('Date & Time must be in the past.')
        return false
      }

      return true
    },
  },
}
</script>

<style scoped>
#header {
  font-family: Arial;
  font-size: 48px;
  color: #684545;
}

form {
  text-align: center;
  align-items: center;
  margin: auto;
}

.formli {
  display: inline-block;
  text-align: left;
  border-radius: 1rem;
  background-color: wheat;
  font-family: Arial;
  width: 582px;
  height: 700px;
}

.formli label {
  margin-left: 93px;
  display: inline-block;
  width: 397px;
  height: 28px;
  font-size: 20px;
  font-weight: 600;
}

.formli input,
.formli select,
.formli textarea {
  margin-left: 93px;
  width: 397px;
  height: 32px;
}

.formli textarea {
  height: 97px;
}

select,
input,
textarea::placeholder {
  color: #888;
  font-size: 14px;
  font-family: Arial;
}

.save {
  text-align: center;
  margin-top: 1rem;
  border-radius: 2rem;
}

#savebutton {
  width: 82px;
  height: 32px;
  border-radius: 10px;
  background-color: #ff8844;
  color: black;
  font-weight: 600;
}

#backward_img {
  width: 34px;
  height: 34px;
  margin-left: 16px;
  margin-top: 16px;
}
</style>
