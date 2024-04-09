<template>
  <div> 
    <b-button class="mx-2 my-2" size="sm" @click="socket.emit('new-game')">New Game</b-button>
    <b-badge class="mr-2 mb-2" :variant="myTurn ? 'primary' : 'secondary'">turn: {{ currentTurnPlayerIndex }}</b-badge>
    <b-badge class="mr-2 mb-2">{{ phase }}</b-badge>
    <b-button class="mx-2 my-2" size="sm" @click="modalShow = true" :disabled="disableButton"> Open Config</b-button>
    <!-- <AnimatedCard :cards="cards"></AnimatedCard> 
    <div
      v-for="card in cards"
      :key="card.id"
    >
    <AnimatedCard :current-card=card :last-played-card=lastPlayedCard @play-card="playCard"></AnimatedCard>
       <pre>{{ formatCard(card, true) }}</pre> 
    </div> -->

    <div class="table">
      <CardRun 
        :card="cards[0]"
      />
    </div>
    

    <b-button class="mx-2 my-2" size="sm" @click="drawCard" :disabled="!myTurn">Draw Card</b-button>
    <b-modal v-model="modalShow" @shown="socket.emit('get-config')" @ok="handleOk">
      <h2>Config</h2>
      <b-overlay :show="show">
      <b-form>
        <b-form-group
          id="input-group-1"
          label="Configure number of decks"
          label-for="numDecks"
        >
          <b-form-input
            id="numDecks"
            v-model="form.numDecks"
            type='number'
            number
            required/>
        </b-form-group>
        <b-form-group
          id="input-group-2"
          label="Configure number of ranks"
          label-for="numRanks"
        >
          <b-form-input
            id="numRanks"
            v-model="form.numRanks"
            type='number'
            number
            required/>
        </b-form-group>
      </b-form>
      </b-overlay>
    </b-modal>
    <h4>
      Players with one or fewer cards:
    </h4>
    <div v-for="player,ind in winningPlayers" :key="ind">
        {{player}}
    </div>
  </div>
</template>

<style scoped>
.table {
  position: fixed;
  top: 150px; /* Adjust top position as needed */
  left: 70%; /* Adjust left position as needed */
  transform: translateX(-50%); /* Center horizontally */
}
</style>

<script setup lang="ts">
import { computed, onMounted, ref, Ref } from 'vue'
import { io } from "socket.io-client"
import AnimatedCard from "../components/AnimatedCard.vue"
import { Card, GamePhase, Action, formatCard, CardId, Config } from "../../../server/model"
import CardRun from "../components/CardRun.vue"
// props
interface Props {
  playerIndex?: string
}

// default values for props
const props = withDefaults(defineProps<Props>(), {
  playerIndex: "all",
})

const socket = io()
let x = props.playerIndex
let playerIndex: number | "all" = parseInt(x) >= 0 ? parseInt(x) : "all"
console.log("playerIndex", JSON.stringify(playerIndex))
socket.emit("player-index", playerIndex)

const cards: Ref<Card[]> = ref([])
const lastPlayedCard: Ref<Card | undefined> = ref()
const currentTurnPlayerIndex = ref(-1)
const phase = ref("")
const playCount = ref(-1)
const winningPlayers: Ref<string[]> = ref([])

const form: Ref<Config> = ref({numDecks: 1, numRanks: 13})
const disableButton = ref(false)
const show = ref(true)
const modalShow=ref(false)

const myTurn = computed(() => currentTurnPlayerIndex.value === playerIndex && phase.value !== "game-over")


socket.on("all-cards", (allCards: Card[]) => {
  cards.value = allCards
})

socket.on("updated-cards", (updatedCards: Card[]) => {
  applyUpdatedCards(updatedCards)
})

socket.on("game-state", (newCurrentTurnPlayerIndex: number, newPhase: GamePhase, newPlayCount: number, almostWinningPlayers: string[], lastPlayed: Card | undefined) => {
  currentTurnPlayerIndex.value = newCurrentTurnPlayerIndex
  phase.value = newPhase
  playCount.value = newPlayCount
  winningPlayers.value = almostWinningPlayers
  lastPlayedCard.value = lastPlayed
})

socket.on("get-config-reply", (config: Config) => {
  form.value = config
  show.value = false
})

socket.on("update-config-reply", (valid: boolean) => {
  if(valid){
    socket.emit('new-game')
  }
  modalShow.value = false
  show.value=false
  disableButton.value = false
})

function doAction(action: Action) {
  return new Promise<Card[]>((resolve, reject) => {
    socket.emit("action", action)
    socket.once("updated-cards", (updatedCards: Card[]) => {
      resolve(updatedCards)
    })
  })
}

async function drawCard() {
  if (typeof playerIndex === "number") {
    const updatedCards = await doAction({ action: "draw-card", playerIndex })
    if (updatedCards.length === 0) {
      alert("didn't work")
    }
  }
}

async function playCard(cardId: CardId) {
  if (typeof playerIndex === "number") {
    const updatedCards = await doAction({ action: "play-card", playerIndex, cardId })
    if (updatedCards.length === 0) {
      alert("didn't work")
    }
    console.log(updatedCards)
  }
}

async function applyUpdatedCards(updatedCards: Card[]) {
  console.log('applyUpdatedCards',updatedCards)
  for (const x of updatedCards) {
    const existingCard = cards.value.find(y => x.id === y.id)
    if (existingCard) {
      Object.assign(existingCard, x)
    } else {
      cards.value.push(x)
    }

  }
}

function handleOk(bvModalEvent: any){
  disableButton.value = true
  bvModalEvent.preventDefault()
  show.value = true
  socket.emit('update-config',form.value)
}

</script>