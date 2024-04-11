<template>
  <p>Room id: {{ roomId }}</p>
  <p>My id: {{ playerId }}</p>

  <div> 
    <b-button class="mx-2 my-2" size="sm" @click="socket.emit('join-game')">New Game</b-button>
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
import { Card, PlayerId } from "../../../server/game/model"
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

const socket = io()

// All of our state
const cards: Ref<Card[]> = ref([])
const currentTurnPlayerIndex = ref()

currentTurnPlayerIndex.value = 1
// const currentTurnPlayerId = playerIds[currentTurnPlayerIndex.value] 

</script>