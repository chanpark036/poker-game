<template>
  <button @click="newGame">New game</button>
  <p>Room id: {{ roomId }}</p>
  <p>My id: {{ playerId }}</p>

  <div> 
    <p>Current Player: {{ currentTurnPlayerId }}</p>
    <p>Current Phase: {{ gamePhase }}</p>
    <p>Small Blind: {{ smallBlindPlayerId }}</p>
    <p>Small Blind Bet: {{ betsThisPhase[smallBlindPlayerId] }}</p>
    <p>Big Blind: {{ bigBlindPlayerId }}</p>

  </div>
    <!--<b-badge class="mr-2 mb-2" :variant="myTurn ? 'primary' : 'secondary'">turn: {{ currentTurnPlayerIndex }}</b-badge>-->

    <div class="table">
      <CardRun 
        :card="cards[0]"
      />
    </div>
    <div class="playerCards">
      <PlayerHand 
        :myId="playerId"
        :currentTurnPlayerId="currentTurnPlayerId"
        :myCards="myCards"
        :myTotal = "playerStacks[playerId]"
        :myBet = "betsThisPhase[playerId]"
        :highestBet = "highestBet"
      />
    </div>
    
    
</template>

<style scoped>
.table {
  position: fixed;
  top: 10px; /* Adjust top position as needed */
  left: 50%; /* Adjust left position as needed */
  transform: translateX(-50%); /* Center horizontally */
}
.playerCards{
  position: fixed;
  top: 55%; /* Adjust top position as needed */
  left: 50%; /* Adjust left position as needed */
  transform: translateX(-50%); /* Center horizontally */
}
</style>

<script setup lang="ts">
import { computed, onMounted, ref, Ref } from 'vue'
import { io } from "socket.io-client"
import { Card, CardId, PlayerId } from "../../../server/game/model"
import CardRun from "../components/CardRun.vue"
import PlayerHand from "../components/PlayerHand.vue"

// props
interface Props {
  roomId? : string
  playerId?: string
}

// default values for props
const props = withDefaults(defineProps<Props>(), {
  roomId: "0",
  playerId: "all",
})

onMounted(() => {
  socket.emit("get-new-game-state", props.roomId)

})

const socket = io()

// All of our state
const gameState = ref({})
const cards: Ref<Card[]> = ref([])
const currentTurnPlayerIndex = ref()
const playerIds: Ref<PlayerId[]> = ref([])
const myCards: Ref<Card[]> = ref([])
const gamePhase = ref("")
const playerStacks: Ref<Record<PlayerId, number>> = ref({})
const betsThisPhase: Ref<Record<PlayerId, number>> = ref({})
const smallBlindIndex = ref(0)
const potAmount = ref(0)

const currentTurnPlayerId = computed(() => playerIds.value[currentTurnPlayerIndex.value] )
const highestBet = computed(() => {
        const values: number[] = Object.values(betsThisPhase.value);
        console.log(values)
        return Math.max(...values);
      })
const smallBlindPlayerId: Ref<PlayerId> = computed(() => playerIds.value[smallBlindIndex.value])
const bigBlindPlayerId: Ref<PlayerId> = computed(() => {
  if (smallBlindIndex.value == playerIds.value.length - 1) {
    return playerIds.value[0]
  }
  else {
    return playerIds.value[smallBlindIndex.value + 1]
  }
})

function updateBets(newBets: Record<PlayerId, number>) {
  socket.emit("update-bets", gameState, newBets)
}


socket.on("new-game-state", (gameState, cards) => {
  gameState.value = gameState

  playerIds.value = gameState.playerIds
  currentTurnPlayerIndex.value = gameState.currentTurnPlayerIndex
  myCards.value = gameState.cardsByPlayer[props.playerId].map((cardId: CardId) => cards.find((card: Card) => card._id === cardId))
  gamePhase.value = gameState.phase
  playerStacks.value = gameState.playerStacks
  smallBlindIndex.value = gameState.smallBlindIndex
  potAmount.value = gameState.potAmount


  betsThisPhase.value = gameState.betsThisPhase

  betsThisPhase.value[smallBlindPlayerId.value] = 10
  betsThisPhase.value[bigBlindPlayerId.value] = 20
  playerStacks.value[smallBlindPlayerId.value]-=10
  playerStacks.value[bigBlindPlayerId.value]-=20

  currentTurnPlayerIndex.value = (smallBlindIndex.value + 2) % playerIds.value.length

})


function newGame() {
  socket.emit('start-game', props.roomId)
  socket.emit('get-new-game-state', props.roomId)
  
}
</script>