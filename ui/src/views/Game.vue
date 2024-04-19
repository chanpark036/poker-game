<template>
  <div v-if="!roomDeleted" class="game-container">
    <header class="game-header">
      <button class="btn new-game" @click="newGame">New Game</button>
      <div class="game-info">
        <p class="info">Room ID: <span>{{ roomId }}</span></p>
        <p class="info">My ID: <span>{{ playerId }}</span></p>
        <p class="info">Current Phase: <span>{{ gamePhase }}</span></p>
      </div>
    </header>
    <div class="game-stuff">
      <section class="player-list">
        <h3>Last Winner:</h3>
        <p v-for="winner in winners" class="winner-info">{{ winner }}</p>
      </section>
      
    </div>
    <div class="cards">
      <div class="table">
        <CardRun :communityCards="communityCards" :potAmount="potAmount"/>
      </div>
      <div class="player-cards">
        <PlayerHand 
          :myId="playerId"
          :currentTurnPlayerId="currentTurnPlayerId"
          :myCards="myCards"
          :myTotal="playerStacks[playerId]"
          :myBet="betsThisPhase[playerId]"
          :highestBet="highestBet"
          :myHand="playerHandStatuses[playerId]"
          @action="doAction"
        />
      </div>
      <section class="player-list">
        <h3>Players Still In:</h3>
        <ul>
          <li v-for="player in playersStillIn">{{ player }} - ${{ betsThisPhase[player] }}</li>
        </ul>
      </section>
    </div>
  </div>
</template>

<style scoped>
.game-container {
  font-family: 'Arial', sans-serif;
  color: #333;
  background-color: #ffffff; /* Brighter background */
  padding: 20px;
  border-radius: 8px;
  box-shadow: 0 8px 16px rgba(0,0,0,0.15); /* Deeper shadow for a floating effect */
  max-width: 1200px; /* Restrict maximum width for better layout */
  margin: auto; /* Center the game container */
}

.game-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 20px;
  background: linear-gradient(145deg, #4CAF50, #3C9F40);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: background 0.3s ease;
}

.btn:hover {
  background: linear-gradient(145deg, #369636, #4CAF50);
}

.game-info .info {
  margin: 0;
  color: #555; /* Slightly darker text for better readability */
}

.game-info span {
  font-weight: bold;
  color: #222; /* Even darker for emphasis */
}

.game-stuff {
  display: flex;
  justify-content: space-between;
  margin-bottom: 20px; /* Add bottom margin for separation */
}

.player-list {
  background-color: #f9f9f9; /* Lighter background for sections */
  padding: 15px;
  border-radius: 4px;
  box-shadow: 0 4px 8px rgba(0,0,0,0.1);
  flex: 1; /* Flex grow to fill available space */
  margin-right: 20px; /* Space between player lists */
}

.player-list:last-child {
  margin-right: 0; /* Remove margin for the last element */
}

h3 {
  margin-top: 0;
  color: #4CAF50; /* Color to match buttons */
}

ul {
  list-style-type: none;
  padding: 0;
  margin: 0; /* Remove default margin */
}

li {
  padding: 8px;
  border-bottom: 1px solid #ddd;
  transition: background-color 0.3s ease;
}

li:hover {
  background-color: #f0f0f0; /* Hover effect for list items */
}

li:last-child {
  border-bottom: none;
}

.cards {
  display: flex;
  justify-content: space-between;
}

.table, .player-cards {
  flex: 1; /* Flex grow to utilize available space */
}
</style>



<script setup lang="ts">
import { computed, onMounted, ref, Ref } from 'vue'
import { io } from "socket.io-client"
import { Card, CardId, GameState, PlayerId } from "../../model.ts"  
import CardRun from "../components/CardRun.vue"
import PlayerHand from "../components/PlayerHand.vue"
import { useRouter } from "vue-router";


const router = useRouter()
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
  lastPlayerTurnIndex: 0,
  playerHandStatuses: {}
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
const playerHandStatuses: Ref<Record<PlayerId, string>> = ref({})
const roomDeleted = ref(false)

const winners: Ref<PlayerId[]> = ref([])

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


socket.on("winners", (winnersList) => {
  winners.value = winnersList
})

socket.on("room-deleted", (socketRoomId)=>{
  if(socketRoomId == props.roomId){
      alert('Room Deleted Bye Bye')
      router.push(`/`)
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
    playersStillIn.value = newGameState.playerIds
    communityCards.value = []
    
    playerHandStatuses.value = newGameState.playerHandStatuses

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



    const updatedGameState: GameState = { 
      ...gameState.value, 
      betsThisPhase: betsThisPhase.value, 
      playerStacks: playerStacks.value, 
      currentTurnPlayerIndex: currentTurnPlayerIndex.value,
      potAmount: potAmount.value,
      lastPlayerTurnIndex: lastPlayerTurnIndex.value,
      playersStillIn: playersStillIn.value
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
    playerHandStatuses.value = newGameState.playerHandStatuses

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
      console.log("THIS SHOULD FIRE TWICE")
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
    if (amount > playerStacks.value[props.playerId]) {
      amount = playerStacks.value[props.playerId]
    }
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