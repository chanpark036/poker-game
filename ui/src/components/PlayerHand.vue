<template>
    <div class="poker-game">
        <div class="bet-info">
            <p>My Bet: ${{ myBet }}</p>
            <p>Highest Bet: ${{ highestBet }}</p>
            <p>My Hand: {{ myHand }}</p>
        </div>
        <div class="player-cards" v-if="myCards">
            <div v-if="myCards[0]">
                <img :src="getCardImage(myCards[0]?.rank, myCards[0]?.suit)" alt="Card" class="card-image">
            </div>
            <div v-if="myCards[1]">
                <img :src="getCardImage(myCards[1]?.rank, myCards[1]?.suit)" alt="Card" class="card-image">
            </div>
        </div>
        <div class="game-controls" v-if="myTurn">
            <div v-if="myTotal>=0">
                <button @click="$emit('action', 'check', 0)" v-if="myBet === highestBet">Check</button>
                <button @click="$emit('action', 'call', highestBet-myBet)" v-else>Call ${{ highestBet - myBet }}</button>
                <div class="raise-control">
                    <button @click="$emit('action', 'raise', raiseAmount)">Raise</button>
                    <div class="raise">
                        <input type="number" v-model="raiseAmount" placeholder="Raise amount">
                    </div>
                </div>
                <button @click="$emit('action', 'fold', 0)">Fold</button>
            </div>
            <div v-else>
                <button @click="$emit('action', 'check', 0)">I'm All In</button>
            </div>
        </div>
        <p class="total-amount">You have ${{ myTotal }}</p>
    </div>
</template>

<style scoped>
.poker-game {
    max-width: 500px;
    background-color: #f3f4f6;
    padding-left: 10%;
    border-radius: 8px;
    box-shadow: 0 4px 8px rgba(0,0,0,0.1);
    font-family: Arial, sans-serif;
    padding-right:10%;
    margin-right: 10%;
}

.bet-info p, .total-amount {
    color: #333;
    font-size: 16px;
    margin: 5px 0;
}

.player-cards {
    display: flex;
    justify-content: space-around;
    margin-top: 20px;
}

.card-image {
    width: 80px;
    height: 115px;
    background-color: #fff;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.game-controls {
    display: flex;
    justify-content: space-between;
    margin-top: 20px;
    align-items: center;
}

.game-controls button {
    padding: 8px 12px;
    background-color: #4CAF50;
    color: white;
    border: none;
    border-radius: 4px;
    cursor: pointer;
    transition: background-color 0.3s;
}

.game-controls button:hover {
    background-color: #45a049;
}

.raise-control {
    display: flex;
    align-items: center;
}

.raise-control input {
    padding: 8px;
    margin-right: 10px;
    border: 1px solid #ccc;
    border-radius: 4px;
}

input {
    width: 50%;
}
.raise {
    padding: 2%;
}
</style>


<script setup lang="ts">
import { computed, ref } from 'vue';
import { Card, getCardImage } from "../../model";

    interface Props {
        myId?: string,
        currentTurnPlayerId?: string
        myCards?: Card[]
        myTotal?: number
        myBet?: number
        highestBet?: number
        myHand?: string
    }

    // default values for props
    const props = withDefaults(defineProps<Props>(), {
        myId: "all",
        currentTurnPlayerIndex: -1,
        myTotal: 0,
        myBet: 0,
        highestBet: 0,
        myHand: ""
    })

    const myTurn = computed(() => props.myId == props.currentTurnPlayerId)
    const raiseAmount = ref(0)

</script>