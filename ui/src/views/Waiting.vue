<template>
This is Room {{ roomId }}
<button @click="socket.emit('start-game')"> Start Game </button>
<div>
    Waiting Players
    <ul>
        <li v-for="(player, index) in waitingPlayers" :key="index">{{ player }}</li>
    </ul>
</div>
</template>

<script setup lang="ts">
import { io } from "socket.io-client"
import { PlayerId } from "../../../server/game/model";
import { Ref, ref } from "vue";
const socket = io()

const waitingPlayers: Ref<PlayerId[]> = ref([])


socket.on("player-joined", (roomId, playerId) => {
    console.log("hi")
    waitingPlayers.value.push(playerId)
})

interface Props {
    roomId?: string
}

// default values for props
const props = withDefaults(defineProps<Props>(), {
    roomId: "",
})
</script>