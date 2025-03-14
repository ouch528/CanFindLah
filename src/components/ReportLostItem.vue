<template>
  <div class="container">
    <form id="lost_form">
      <h2 id="header">Report Lost Item</h2>

      <div class="formli">
        <RouterLink to="/">
          <img id="backward_img" src="@/assets/arrow_back.png" alt="Back to Home" />
        </RouterLink>

        <label for="cat">Category </label> <br />
        <select name="cat" id="cat">
          <option value="">--Please choose the category--</option>
          <option value="card">Card</option>
          <option value="waterbottle">Waterbottle</option>
          <option value="adapter">Adapter</option>
          <option value="stationary">Stationary</option>
        </select>
        <br />
        <br />

        <label for="col">Colour: </label> <br />
        <input type="color" id="col" required="" placeholder="Enter Colour" /> <br /><br />

        <label for="brand">Brand: </label> <br />
        <input type="text" id="brand" required="" placeholder="Enter Brand" /> <br /><br />

        <label for="loc">Location Lost: </label> <br />
        <input type="text" id="loc" required="" placeholder="Enter Location Lost" /> <br /><br />

        <label for="datetime">Date & Time Lost: </label> <br />
        <input
          type="datetime-local"
          id="datetime"
          required=""
          placeholder="Enter Date & Time Lost"
        />
        <br /><br />

        <label for="desc">Description: </label> <br />
        <textarea name="desc" rows="5" cols="20">Enter Description</textarea> <br /><br />

        <div class="save">
          <button id="savebutton" type="button" v-on:click="savetofs()">Submit</button>
        </div>
      </div>
    </form>
  </div>
</template>

<script>
export default {}
</script>

<style scoped>
#header {
  font-family: Arial;
  font-size: 2rem;
}

.formli {
  display: inline-block;
  text-align: left;
  border-radius: 3rem;
  background-color: orange;
  padding: 3rem;
  font-family: Arial;
}

form {
  text-align: center;
  align-items: center;
  margin: auto;
}

.save {
  text-align: center;
  margin-top: 1rem;
  border-radius: 2rem;
}

#backward_img {
  width: 34px;
  height: 34px;
}
</style>
