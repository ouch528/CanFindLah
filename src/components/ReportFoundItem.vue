<template>
  <div class="container">
    <form id="found_form">
      <h2 id="header">Report Found Item</h2>

      <div class="formli">
        <RouterLink to="/">
          <img id="backward_img" src="@/assets/arrow_back.png" alt="Back to Home" />
        </RouterLink>
        <br />

        <label for="cat">Category </label> <br />
        <select v-model="formData.category" id="cat">
          <option value="">--Please choose the category--</option>
          <option value="card">Card</option>
          <option value="waterbottle">Waterbottle</option>
          <option value="adapter">Adapter</option>
          <option value="stationary">Stationary</option>
        </select>
        <br />
        <br />

        <label for="col">Colour </label> <br />
        <input type="color" v-model="formData.color" id="col" required /> <br /><br />

        <label for="brand">Brand </label> <br />
        <input type="text" v-model="formData.brand" id="brand" required placeholder="Enter Brand" />
        <br /><br />

        <label for="loc">Location Found </label> <br />
        <input
          type="text"
          v-model="formData.location"
          id="loc"
          required
          placeholder="Enter Location Lost"
        />
        <br /><br />

        <label for="datetime">Date & Time Found </label> <br />
        <input
          type="datetime-local"
          v-model="formData.datetime"
          id="datetime"
          required
          placeholder="Enter Date & Time Lost"
        />
        <br /><br />

        <label for="desc">Description </label> <br />
        <textarea
          v-model="formData.description"
          name="desc"
          rows="5"
          cols="20"
          placeholder="Enter Description"
        ></textarea>
        <br /><br />

        <label for="img">Upload Image </label> <br />
        <input type="file" @change="handleFileUpload" id="img" accept="image/*" /> <br /><br />

        <div class="save">
          <button id="savebutton" type="button" v-on:click="saveFoundItem">Submit</button>
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
        image: null,
      },
    }
  },
  methods: {
    // handleFileUpload(event) {
    //   this.formData.image = event.target.files[0]
    // },

    async saveFoundItem() {
      if (this.validateForm()) {
        try {
          // If an image is selected, upload it to Firebase Storage
          // let imageUrl = "";
          // if (this.formData.image) {
          //   const imageRef = ref(storage, "found-items/" + this.formData.image.name);
          //   await uploadBytes(imageRef, this.formData.image);
          //   imageUrl = await getDownloadURL(imageRef);
          // }

          await addDoc(collection(db, 'Found Item'), {
            category: this.formData.category,
            color: this.formData.color,
            brand: this.formData.brand,
            location_found: this.formData.location,
            datetime_found: this.formData.datetime,
            description: this.formData.description,
            name: `${this.formData.color} ${this.formData.category}`,
            // imageUrl: imageUrl,
          })

          this.formData = {
            category: '',
            color: '#000000',
            brand: '',
            location: '',
            datetime: '',
            description: '',
            image: null,
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
  height: 775px;
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
