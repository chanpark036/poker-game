<template>
  <div class="poker-table">
    <p class="pot-amount">Pot Amount: ${{ potAmount }}</p>
    <div class="card-container">
      <div v-if="communityCards" v-for="(card, index) in communityCards.slice(0, 3)" :key="index" class="card-space">
        <img v-if="card" :src="getCardImage(card.rank, card.suit)" alt="Card" class="card-image">
      </div>
      <!-- Fill empty spaces for top row if less than 3 cards -->
      <div v-if="communityCards && communityCards.length < 3" v-for="i in 3 - communityCards.length" :key="i + 3" class="card-space"></div>
    </div>
    <div class="card-container">
      <!-- Display bottom row (remaining cards) -->
      <div v-if="communityCards" v-for="(card, index) in communityCards.slice(3, 5)" :key="index + 3" class="card-space">
        <img v-if="card" :src="getCardImage(card.rank, card.suit)" alt="Card" class="card-image">
      </div>
      <!-- Fill empty spaces for bottom row if less than 2 cards -->
      <div v-if="communityCards" v-for="i in 2 - communityCards.length" :key="i + 8" class="card-space"></div>
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