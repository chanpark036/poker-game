<template>
    <div class="playerCards">
        <div class="card-space">{{ myCards[0] }}</div>
        <div class="card-space">{{ myCards[1] }}</div>
        
    </div>
    <div v-if="myTurn">
        <button>Check/Call</button>
        <span>
            <input type="number" placeholder="Enter amount to raise">
            <button>Raise</button>
        </span>
        <button>Fold</button>
    </div>
    
    
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
    height: 120px;
    background-color: #ccc;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
</style>

<script setup lang="ts">
import { computed, ref } from 'vue';
import { Card } from '../../../server/game/model';


    interface Props {
        myId?: string,
        currentTurnPlayerId?: string
        myCards?: Card[]
    }

    // default values for props
    const props = withDefaults(defineProps<Props>(), {
        myId: "all",
        currentTurnPlayerIndex: -1,
    })

    const myTurn = computed(() => props.myId == props.currentTurnPlayerIndex)
    const betAmount = ref()
    const highestBet = ref()
    // if betAmt = highestBet, show check button, else, show call and when clicked, betAmt = highestBet


</script>