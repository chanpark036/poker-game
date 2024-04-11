<template>
  <p>Room id: {{ roomId }}</p>
  <p>My id: {{ playerId }}</p>

  <div> 
    <b-button class="mx-2 my-2" size="sm" @click="socket.emit('join-game')">New Game</b-button>
    <div>
     Players
    <ul>
        <li v-for="player in playerIds">{{ player }}</li>
    </ul>
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
      />
    </div>
    
    
  </div>
</template>

<style scoped>
.table {
  position: fixed;
  top: 50px; /* Adjust top position as needed */
  left: 50%; /* Adjust left position as needed */
  transform: translateX(-50%); /* Center horizontally */
}
.playerCards{
  position: fixed;
  top: 70%; /* Adjust top position as needed */
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
  socket.emit("get-game-state", props.roomId)
})

const socket = io()

// All of our state
const cards: Ref<Card[]> = ref([])
const currentTurnPlayerIndex = ref()
const playerIds: Ref<PlayerId[]> = ref([])
const myCards: Ref<CardId[]> = ref([])

const currentTurnPlayerId = playerIds.value[currentTurnPlayerIndex.value] 



socket.on("game-state", (gameState, cards) => {
  playerIds.value = gameState.playerIds
  currentTurnPlayerIndex.value = gameState.currentTurnPlayerIndex
  myCards.value = gameState.cardsByPlayer[props.playerId].map((cardId: CardId) => cards.find((card: Card) => card._id === cardId))
})

</script>