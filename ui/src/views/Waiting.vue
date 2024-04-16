<template>
This is Room {{ roomId }}
I am Player {{ playerId }}
<button @click="startGame"> Start Game </button>

<div>
    Waiting Players
    <ul>
        <li v-for="player in waitingPlayers">{{ player }}</li>
    </ul>
</div>
</template>

<script setup lang="ts">
import { io } from "socket.io-client"
import { PlayerId, RoomId } from "../../model.ts"  ;
import { Ref, onMounted, ref } from "vue";
import { useRouter } from "vue-router";
const socket = io()
const router = useRouter()


let waitingPlayers: Ref<PlayerId[]> = ref([])

socket.on("player-joined", (roomId: RoomId, waitingPlayers1: PlayerId[]) => {
    if (roomId == props.roomId) {
        waitingPlayers.value = waitingPlayers1
        // console.log(waitingPlayers.value)
    }
})


interface Props {
    roomId?: string
    playerId?: string
}

// default values for props
const props = withDefaults(defineProps<Props>(), {
    roomId: "",
    playerId: ""
})

socket.on("game-started", (roomId) => {
    if (roomId == props.roomId){
        router.push(`/game/${props.roomId}/${props.playerId}`)
    }
})

function startGame() {
    console.log("game started")
    socket.emit('start-game', props.roomId)

    // console.log("roomId " + props.roomId + "player " + props.playerId)
}

onMounted(() => {
    socket.emit('refresh', props.roomId)
})
</script>