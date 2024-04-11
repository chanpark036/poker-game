<template>
    <div class="playerCards">
        <div class="card-space">{{ myCards[0] }}</div>
        <div class="card-space">{{ myCards[1] }}</div>
    </div>
    <div v-if="myTurn">
        <button >Check/Call</button>
        <span>
            <input type="number" placeholder="Enter amount to raise">
            <button>Raise</button>
        </span>
        <button>Fold</button>
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
    height: 120px;
    background-color: #ccc;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
</style>

<script setup lang="ts">
import { Ref, computed, ref } from 'vue';
import { Card, PlayerId } from '../../../server/game/model';


    interface Props {
        myId?: string,
        currentTurnPlayerId?: string
        myCards?: Card[]
        myTotal?: number
        betsThisPhase?: Record<PlayerId, number>
    }

    // default values for props
    const props = withDefaults(defineProps<Props>(), {
        myId: "all",
        currentTurnPlayerIndex: -1,
        myTotal: 0,
    })

    const myTurn = computed(() => props.myId == props.currentTurnPlayerId)
    const betAmount = ref()
    const highestBetThisPhase: Ref<number> = computed(() => {
        if (!props.betsThisPhase) {
            return 0
        }
        const values = Object.values(props.betsThisPhase);
        return Math.max(...values);
    }
    // if betAmt = highestBet, show check button, else, show call and when clicked, betAmt = highestBet


</script>