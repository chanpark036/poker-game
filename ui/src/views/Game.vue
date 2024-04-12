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
        @action = "doAction"
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
import { Card, CardId, GameState, PlayerId } from "../../../server/game/model"
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
const defaultGameState: GameState = {
  playerIds: [],
  cardsByPlayer: {},
  currentTurnPlayerIndex: 0,
  phase: "preflop",
  roomId: "",
  playersStillIn: [],
  betsThisPhase: {},
  potAmount: 0,
  smallBlindIndex: 0,
  communityCards: [],
  deckCards: [],
  playerStacks: {}
}
const gameState: Ref<GameState> = ref(defaultGameState)
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




socket.on("new-game-state", (newGameState: GameState, cards) => {
  gameState.value = newGameState

  playerIds.value = newGameState.playerIds
  currentTurnPlayerIndex.value = newGameState.currentTurnPlayerIndex
  myCards.value = newGameState.cardsByPlayer[props.playerId].map((cardId: CardId) => cards.find((card: Card) => card._id === cardId))
  gamePhase.value = newGameState.phase
  playerStacks.value = newGameState.playerStacks
  smallBlindIndex.value = newGameState.smallBlindIndex
  potAmount.value = newGameState.potAmount


  betsThisPhase.value = newGameState.betsThisPhase

  betsThisPhase.value[smallBlindPlayerId.value] = 10
  betsThisPhase.value[bigBlindPlayerId.value] = 20
  playerStacks.value[smallBlindPlayerId.value]-=10
  playerStacks.value[bigBlindPlayerId.value]-=20

  currentTurnPlayerIndex.value = (smallBlindIndex.value + 2) % playerIds.value.length



  // const updatedGameState: GameState = { ...gameState.value, 
  //                           betsThisPhase: betsThisPhase.value, 
  //                           playerStacks: playerStacks.value, 
  //                           currentTurnPlayerIndex: currentTurnPlayerIndex.value }
  // updateGameState(updatedGameState)

})


socket.on("game-state", (gameState) => {
  console.log("updated-game-state")
  gameState.value = gameState

  playerIds.value = gameState.playerIds
  currentTurnPlayerIndex.value = gameState.currentTurnPlayerIndex
  myCards.value = gameState.cardsByPlayer[props.playerId].map((cardId: CardId) => cards.value.find((card: Card) => card._id === cardId))
  gamePhase.value = gameState.phase
  playerStacks.value = gameState.playerStacks
  smallBlindIndex.value = gameState.smallBlindIndex
  potAmount.value = gameState.potAmount


  betsThisPhase.value = gameState.betsThisPhase
})


function newGame() {
  socket.emit('start-game', props.roomId)
  socket.emit('get-new-game-state', props.roomId)
}

function updateGameState(gameState: GameState) {
  socket.emit("update-game", gameState)
}

function doAction(actionType: string, amount: number) {
  if (actionType == "check") {
    currentTurnPlayerIndex.value = (currentTurnPlayerIndex.value + 1)%playerIds.value.length
    const updatedGameState: GameState = {...gameState.value, currentTurnPlayerIndex: currentTurnPlayerIndex.value}
    updateGameState(updatedGameState)
  }
  
  if (actionType == "call") {
    currentTurnPlayerIndex.value = (currentTurnPlayerIndex.value + 1)%playerIds.value.length
    betsThisPhase.value[props.playerId] += amount
    playerStacks.value[props.playerId] -= amount
    potAmount.value += amount
    const updatedGameState: GameState = {...gameState.value, 
                                        currentTurnPlayerIndex: currentTurnPlayerIndex.value,
                                        betsThisPhase: betsThisPhase.value,
                                        playerStacks: playerStacks.value,
                                        potAmount: potAmount.value 
                      }
    updateGameState(updatedGameState)
  }

  if (actionType == "raise") {

  }

  if (actionType == "fold") {

  }
}
</script>