<template>
  <div class="poker-table">
    <p class="pot-amount">Pot Amount: ${{ potAmount }}</p>
    <div class="cards">
    <div class="card-container">
        <div class="card-space" v-if="communityCards && communityCards[0]"> 
          <img :src="getCardImage(communityCards[0].rank, communityCards[0].suit)" alt="Card" class="card-image">
        </div>
        <div v-else class="card-space"></div>

        <div class="card-space" v-if="communityCards && communityCards[1]"> 
          <img :src="getCardImage(communityCards[1].rank, communityCards[1].suit)" alt="Card" class="card-image">
        </div>
        <div v-else class="card-space"></div>

        <div class="card-space" v-if="communityCards && communityCards[2]"> 
          <img :src="getCardImage(communityCards[2].rank, communityCards[2].suit)" alt="Card" class="card-image">
        </div>
        <div v-else class="card-space"></div>
      </div>

    <div class="card-container">
      <div class="card-space" v-if="communityCards && communityCards[3]"> 
        <img :src="getCardImage(communityCards[3].rank, communityCards[3].suit)" alt="Card" class="card-image">
      </div>
      <div v-else class="card-space"></div>

      <div class="card-space" v-if="communityCards && communityCards[4]"> 
        <img :src="getCardImage(communityCards[4].rank, communityCards[4].suit)" alt="Card" class="card-image">
      </div>
      <div v-else class="card-space"></div>
    </div>
  </div>
  </div>
</template>

<style scoped>
.poker-table {
  width: 90%;
  min-height: 20%;
  background-color: #4CAF50;
  border-radius: 8px;
  padding: 5%;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.25);
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.pot-amount {
  font-size: 18px;
  color: #fff;
  margin-bottom: 15px;
  font-weight: bold;
  text-shadow: 1px 1px 2px #000;
}

.card-container {
  display: flex;
  justify-content: space-around;
  width: 100%;
  margin-bottom: 10px; /* Add margin for separation */
}

.card-space {
  width: 80px;
  height: 115px;
  background-color: #ffffff;
  border-radius: 10px;
  box-shadow: 0 2px 5px rgba(0, 0, 0, 0.15);
  display: flex;
  align-items: center;
  justify-content: center;
}

.cards {
  display: flex;
  flex-direction: column;
}

.card-image {
  width: 100%;
  height: 100%;
  border-radius: 8px;
}
</style>


<script setup lang="ts">
    import { Card, getCardImage } from "../../model"  
    import { defineProps } from 'vue'

    const { communityCards, potAmount } = defineProps<{ communityCards?: Card[], potAmount?: number }>()

</script>