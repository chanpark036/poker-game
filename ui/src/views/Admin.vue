<template>
    <div>
        <b-container class="mt-3">
            <div v-if="rooms.length > 0">
                <b-card bg-variant="info" text-variant="white" title="Active Rooms with More than One Person">
                    <b-overlay :show="show" rounded="sm">
                    <b-list-group v-for="(room, rid) in rooms" :key="rid">
                        <b-list-group-item class="d-flex justify-content-start align-items-center" variant="light">
                            Room {{ room }}
                            <b-button @click="deleteRoom(room)" style="margin-left:auto"
                                variant="danger">DELETE</b-button>
                        </b-list-group-item>
                    </b-list-group>
                </b-overlay>
                </b-card>
            </div>
            <div v-else>
                <b-card title="No Rooms with More than One Person Yet" bg-variant="info" text-variant="white"></b-card>
            </div>
        </b-container>
    </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from 'vue'
import { io } from "socket.io-client"

const socket = io()
const rooms = ref([])
const show = ref(false)

function getRooms() {
    socket.emit('get-rooms')
}

socket.on("existing-rooms", (roomList) => {
    rooms.value = roomList
})

function deleteRoom(roomId: string) {
    show.value = true
    socket.emit("delete-room", roomId)
    getRooms()
    show.value = false
}

onMounted(getRooms)

</script>