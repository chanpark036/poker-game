<template>
    <p>My bet: {{ myBet }}</p>
    <p>Highest Bet: {{ highestBet }}</p>

    <div class="playerCards">
        <div v-if="myCards[0]"><img :src="getCardImage(myCards[0]?.rank, myCards[0]?.suit)" class="card-space"></div>
        <div class="cards-space" v-else></div>
        <div v-if="myCards[1]"><img :src="getCardImage(myCards[1]?.rank, myCards[1]?.suit)" class="card-space"></div>
        <div class="cards-space" v-else></div>

    </div>
    <div v-if="myTurn && myTotal">
        <button @click="$emit('action', 'check', 0)" v-if="myBet === highestBet">Check</button>
        <button @click="$emit('action', 'call', highestBet-myBet)" v-else>Call for ${{ highestBet - myBet }}</button>
        <span>
            <input type="number" v-model="raiseAmount" placeholder="Enter amount to raise">
            <button @click="$emit('action', 'raise', raiseAmount)">Raise</button>
        </span>
        <button @click = "$emit('action', 'fold', 0)">Fold</button>
    </div>
    <div v-if="myTurn && myTotal==0">
        <button @click="$emit('action', 'check', 0)">I'm already All In</button>
    </div>
    <p>You have ${{ myTotal }}</p>

    
    
</template>

<style scoped>

.playerCards {
    width: 300px;
    height: 150px;
    background-color: green;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding-top: 10px;
    left: 250px;
  }

  .card-space {
    width: 80px;
    height: 115px;
    background-color: #ffffff;
    border-radius: 10px;
    /* box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1); */
  }
</style>

<script setup lang="ts">
import { Ref, computed, ref } from 'vue';
import { Card, PlayerId, getCardImage } from '../../../server/game/model';


    interface Props {
        myId?: string,
        currentTurnPlayerId?: string
        myCards?: Card[]
        myTotal?: number
        myBet?: number
        highestBet?: number
    }

    // default values for props
    const props = withDefaults(defineProps<Props>(), {
        myId: "all",
        currentTurnPlayerIndex: -1,
        myTotal: 0,
        myBet: 0,
        highestBet: 0
    })

    const myTurn = computed(() => props.myId == props.currentTurnPlayerId)
    const raiseAmount = ref(0)

</script>