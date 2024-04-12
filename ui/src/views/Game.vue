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
    <p>Pot: {{ potAmount }}</p>
    <p>LastPlayerturnIndex: {{ lastPlayerTurnIndex }}</p>
    <ul>
      <li v-for="player in playersStillIn">{{ player }}</li>
    </ul>
  </div>

    <div class="table">
      <CardRun 
        :communityCards="communityCards"
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
  // console.log("getting new game state")
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
  playerStacks: {},
  lastPlayerTurnIndex: 0
}


const gameState: Ref<GameState> = ref(defaultGameState)
const deckCards: Ref<Card[]> = ref([])
const currentTurnPlayerIndex = ref()
const playerIds: Ref<PlayerId[]> = ref([])
const myCards: Ref<Card[]> = ref([])
const gamePhase = ref("")
const playerStacks: Ref<Record<PlayerId, number>> = ref({})
const betsThisPhase: Ref<Record<PlayerId, number>> = ref({})
const smallBlindIndex = ref(0)
const potAmount = ref(0)
const playersStillIn: Ref<PlayerId[]> = ref([])
const communityCards: Ref<Card[]> = ref([])
const lastPlayerTurnIndex = ref()

const currentTurnPlayerId = computed(() => playerIds.value[currentTurnPlayerIndex.value] )
const highestBet = computed(() => {
        const values: number[] = Object.values(betsThisPhase.value);
        // console.log(values)
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




socket.on("new-game-state", (newGameState: GameState, cards, roomId) => {
  if (props.roomId == roomId) {
    // console.log("updating game-state")
    gameState.value = newGameState

    playerIds.value = newGameState.playerIds
    currentTurnPlayerIndex.value = newGameState.currentTurnPlayerIndex
    myCards.value = newGameState.cardsByPlayer[props.playerId].map((cardId: CardId) => cards.find((card: Card) => card._id === cardId))


    gamePhase.value = newGameState.phase
    playerStacks.value = newGameState.playerStacks
    smallBlindIndex.value = newGameState.smallBlindIndex
    potAmount.value = newGameState.potAmount
    playersStillIn.value = newGameState.playersStillIn
    communityCards.value = []

    deckCards.value = cards

    betsThisPhase.value = newGameState.betsThisPhase

    for( let player of playerIds.value) {
      betsThisPhase.value[player] = 0
    }
    betsThisPhase.value[smallBlindPlayerId.value] = 10
    betsThisPhase.value[bigBlindPlayerId.value] = 20
    playerStacks.value[smallBlindPlayerId.value]-=10
    playerStacks.value[bigBlindPlayerId.value]-=20
    potAmount.value = 30

    lastPlayerTurnIndex.value = playerIds.value.indexOf(bigBlindPlayerId.value)

    currentTurnPlayerIndex.value = (smallBlindIndex.value + 2) % playerIds.value.length



    const updatedGameState: GameState = { ...gameState.value, 
                              betsThisPhase: betsThisPhase.value, 
                              playerStacks: playerStacks.value, 
                              currentTurnPlayerIndex: currentTurnPlayerIndex.value,
                              potAmount: potAmount.value,
                              lastPlayerTurnIndex: lastPlayerTurnIndex.value
                            }
    updateGameState(updatedGameState)
  }

})


socket.on("game-state", (newGameState, roomId) => {
  if (roomId == props.roomId) {
    // console.log("updated-game-state")
    gameState.value = newGameState

    playerIds.value = newGameState.playerIds
    currentTurnPlayerIndex.value = newGameState.currentTurnPlayerIndex
    gamePhase.value = newGameState.phase
    playerStacks.value = newGameState.playerStacks
    smallBlindIndex.value = newGameState.smallBlindIndex
    potAmount.value = newGameState.potAmount
    playersStillIn.value = newGameState.playersStillIn

    communityCards.value = newGameState.communityCards.map((cardId: CardId) => deckCards.value.find((card: Card) => card._id === cardId))

    lastPlayerTurnIndex.value = newGameState.lastPlayerTurnIndex


    betsThisPhase.value = newGameState.betsThisPhase
  }
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

    if (props.playerId == playerIds.value[lastPlayerTurnIndex.value]) {
      currentTurnPlayerIndex.value = smallBlindIndex.value
      while (playersStillIn.value[currentTurnPlayerIndex.value] == "") {
        currentTurnPlayerIndex.value = (currentTurnPlayerIndex.value + 1)%playersStillIn.value.length
      }
      lastPlayerTurnIndex.value = findPreviousNonEmptyIndex(playersStillIn.value, currentTurnPlayerIndex.value)

      const updatedGameState: GameState = 
      {...gameState.value, 
        currentTurnPlayerIndex: currentTurnPlayerIndex.value,
        lastPlayerTurnIndex: lastPlayerTurnIndex.value
      }

      socket.emit("change-phase", updatedGameState)
      
    }
    else {
      currentTurnPlayerIndex.value = (currentTurnPlayerIndex.value + 1)%playersStillIn.value.length
      while (playersStillIn.value[currentTurnPlayerIndex.value] == "") {
        currentTurnPlayerIndex.value = (currentTurnPlayerIndex.value + 1)%playersStillIn.value.length
      }
      const updatedGameState: GameState = {...gameState.value, currentTurnPlayerIndex: currentTurnPlayerIndex.value}
      updateGameState(updatedGameState)
    }
  }


  
  if (actionType == "call") {
    betsThisPhase.value[props.playerId] += amount
    playerStacks.value[props.playerId] -= amount
    potAmount.value += amount

    if (props.playerId == playerIds.value[lastPlayerTurnIndex.value]) {
      currentTurnPlayerIndex.value = smallBlindIndex.value
      while (playersStillIn.value[currentTurnPlayerIndex.value] == "") {
        currentTurnPlayerIndex.value = (currentTurnPlayerIndex.value + 1)%playersStillIn.value.length
      }
      lastPlayerTurnIndex.value = findPreviousNonEmptyIndex(playersStillIn.value, currentTurnPlayerIndex.value)
      const updatedGameState: GameState = 
      {...gameState.value, 
        currentTurnPlayerIndex: currentTurnPlayerIndex.value,
        lastPlayerTurnIndex: lastPlayerTurnIndex.value,
        betsThisPhase: betsThisPhase.value,
        playerStacks: playerStacks.value,
        potAmount: potAmount.value
      }
      socket.emit("change-phase", updatedGameState)
    }
    else {
      currentTurnPlayerIndex.value = (currentTurnPlayerIndex.value + 1)%playersStillIn.value.length
      while (playersStillIn.value[currentTurnPlayerIndex.value] == "") {
        currentTurnPlayerIndex.value = (currentTurnPlayerIndex.value + 1)%playersStillIn.value.length
      }
    
      const updatedGameState: GameState = {
        ...gameState.value, 
            currentTurnPlayerIndex: currentTurnPlayerIndex.value,
            betsThisPhase: betsThisPhase.value,
            playerStacks: playerStacks.value,
            potAmount: potAmount.value 
        }
      updateGameState(updatedGameState)
    }
  }

  if (actionType == "raise") {
    if (amount > playerStacks.value[props.playerId] || amount < highestBet.value) {
      alert("invalid raise amount")
    }
    else {
      lastPlayerTurnIndex.value = findPreviousNonEmptyIndex(playersStillIn.value, currentTurnPlayerIndex.value)

      currentTurnPlayerIndex.value = (currentTurnPlayerIndex.value + 1)%playersStillIn.value.length
      while (playersStillIn.value[currentTurnPlayerIndex.value] == "") {
        currentTurnPlayerIndex.value = (currentTurnPlayerIndex.value + 1)%playersStillIn.value.length
      }
      betsThisPhase.value[props.playerId] += amount
      playerStacks.value[props.playerId] -= amount
      potAmount.value += amount
      const updatedGameState: GameState = {
        ...gameState.value, 
            currentTurnPlayerIndex: currentTurnPlayerIndex.value,
            betsThisPhase: betsThisPhase.value,
            playerStacks: playerStacks.value,
            potAmount: potAmount.value,
            lastPlayerTurnIndex: lastPlayerTurnIndex.value
        }
      updateGameState(updatedGameState)
    }
  }

  if (actionType == "fold") {
    console.log("fold action")
    playersStillIn.value[currentTurnPlayerIndex.value] = ""
    console.log(playersStillIn.value)
    const win = onlyOnePlayerLeft(playersStillIn.value)
    if (win) {
      const winnerId = findWinner(playersStillIn.value)
      playerStacks.value[winnerId] += potAmount.value
      potAmount.value = 0
      const newPhase = "river"
      const updatedGameState: GameState = 
      {...gameState.value, 
        playerStacks: playerStacks.value,
        potAmount: potAmount.value,
        phase: newPhase,
        playersStillIn: playersStillIn.value
      }
      socket.emit("change-phase", updatedGameState)
    }

    else if (props.playerId == playerIds.value[lastPlayerTurnIndex.value]) {
      currentTurnPlayerIndex.value = smallBlindIndex.value
      while (playersStillIn.value[currentTurnPlayerIndex.value] == "") {
        currentTurnPlayerIndex.value = (currentTurnPlayerIndex.value + 1)%playersStillIn.value.length
      }
      lastPlayerTurnIndex.value = findPreviousNonEmptyIndex(playersStillIn.value, currentTurnPlayerIndex.value)

      const updatedGameState: GameState = 
      {...gameState.value, 
        currentTurnPlayerIndex: currentTurnPlayerIndex.value,
        lastPlayerTurnIndex: lastPlayerTurnIndex.value,
        playersStillIn: playersStillIn.value
      }
      socket.emit("change-phase", updatedGameState)
    }
    else {
      while (playersStillIn.value[currentTurnPlayerIndex.value] == "") {
        currentTurnPlayerIndex.value = (currentTurnPlayerIndex.value + 1)%playersStillIn.value.length
      }

      const updatedGameState: GameState = {
        ...gameState.value, 
          currentTurnPlayerIndex: currentTurnPlayerIndex.value,
          playersStillIn: playersStillIn.value,
        }
        updateGameState(updatedGameState)
      }
  }
}

function findPreviousNonEmptyIndex(arr: string[], smallBlindIndex: number): number {
    for (let i = smallBlindIndex - 1; i >= 0; i--) {
        if (arr[i] !== "") {
            return i;
        }
    }
    for (let i = arr.length - 1; i > smallBlindIndex; i--) {
        if (arr[i] !== "") {
            return i; 
        }
    }
    return -1;
}

function onlyOnePlayerLeft(arr: string[]): boolean {
  let count = 0
  for (let a of arr ) {
    if (a) {
      count += 1
    }
  }
  console.log(count)
  if (count == 1) {
    return true
  }
  else {
    return false
  }
}

function findWinner(arr: string[]): string {
  for (let a of arr ) {
    if (a != "") {
      console.log("winner is " + a)
      return a
    }
  }
  return ""
}
</script>