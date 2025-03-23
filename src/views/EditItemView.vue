<template>

   <EditItem :lost_item_Id = this.lost_item_Id v-if=" this.status_edit_item == 'searcher'"/>
   <EditItem :found_item_Id = this.found_item_Id v-if=" this.status_edit_item == 'founder'"/>
   <p>hi</p>
   <p>{{ this.lost_item_Id }}</p>

</template>

<script>

    import EditItem from "@/components/EditItem.vue";
    export default {
        components :{
            EditItem,
        },

        data() {
            return {
                lost_item_Id : this.$route.query.edit_item_id,
                status_edit_item : this.$route.query.status_edit_item,
                found_item_Id : this.$route.query.edit_item_id
            
            }
        },


    }


</script>

<style>

</style>