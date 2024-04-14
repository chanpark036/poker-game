<template>
    <div class="table">
        <div v-if="communityCards[0]">
          <img :src="getCardImage(communityCards[0]?.rank, communityCards[0]?.suit)" class="card-space">
        </div>
    
        <div class="card-space" v-else></div>
        <div v-if="communityCards[1]"><img :src="getCardImage(communityCards[1]?.rank, communityCards[1]?.suit)" class="card-space"></div>
        <div class="card-space" v-else></div>
        <div v-if="communityCards[2]"><img :src="getCardImage(communityCards[2]?.rank, communityCards[2]?.suit)" class="card-space"></div>
        <div class="card-space" v-else></div>
        <div v-if="communityCards[3]"><img :src="getCardImage(communityCards[3]?.rank, communityCards[3]?.suit)" class="card-space"></div>
        <div class="card-space" v-else></div>
        <div v-if="communityCards[4]"> <img :src="getCardImage(communityCards[4]?.rank, communityCards[4]?.suit)" class="card-space"></div>
        <div class="card-space" v-else></div>
    </div>
</template>

<style scoped>
 body {
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f0f0;
  }
  
  .table {
    position: relative;
    width: 800px;
    height: 350px;
    background-color: green;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding-top: 10px;
  }
  
  .card-space {
    width: 80px;
    height: 115px;
    background-color: white;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }



</style>

<script setup lang="ts">
    import { Card, getCardImage} from "../../../server/game/model"

    interface Props {
        communityCards?: Card[]
    }

    // default values for props
    const props = withDefaults(defineProps<Props>(), {
    })

</script>