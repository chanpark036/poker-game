<template>
    <div>
        <b-container class="mt-3">
            <b-jumbotron v-if="!roomDeleted">
                <template #header>Room {{ roomId }}</template>
                <template #lead> I am Player {{ playerId }} </template>
                <b-card bg-variant="light" text-variant="black" title="Players Waiting in Room">
                    <b-list-group v-for="(player, pid) in waitingPlayers" :key="pid">
                        <b-list-group-item class="d-flex justify-content-start align-items-center" variant="light">
                            Player {{ player }}
                        </b-list-group-item>
                    </b-list-group>
                </b-card>
                <b-button @click="startGame" :disabled="show" class="mt-3" style="float: right" variant="success"> Start Game </b-button>
            </b-jumbotron>
            <div v-else>
                <b-jumbotron title="Sorry Your Room has been Deleted" bg-variant="info" text-variant="white"></b-jumbotron>
            </div>
        </b-container>
    </div>
</template>

<script setup lang="ts">
import { io } from "socket.io-client"
import { PlayerId, RoomId } from "../../model"
import { Ref, onMounted, ref } from "vue";
import { useRouter } from "vue-router";

const socket = io()
const router = useRouter()

const roomDeleted = ref(false)
const waitingPlayers: Ref<PlayerId[]> = ref([])
const show = ref(false)

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
    if (roomId == props.roomId) {
        show.value = true
        router.push(`/game/${props.roomId}/${props.playerId}`)
        show.value = false
    }
})

socket.on("room-deleted", (socketRoomId: RoomId) => {
    console.log(socketRoomId,props.roomId)
    if (socketRoomId === props.roomId) {
        alert('Room Deleted Bye Bye');
        router.push(`/`)
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