<template>
    <div>
        <b-button @click="getRooms"></b-button>
        <ul v-if="rooms">
        <li v-for="(room,rid) in rooms">
            <b-button @click="deleteRoom(room)"></b-button>
            {{ room + rid}}
        </li>
    </ul>
    </div>
</template>

<script setup lang="ts">
import {ref, Ref} from 'vue'
import { io } from "socket.io-client"

const socket = io()
const rooms = ref([])

function getRooms(){
    socket.emit('get-rooms')
}

socket.on("existing-rooms", (roomList) => {
  rooms.value = roomList
})

function deleteRoom(roomId: string){
    socket.emit("delete-room",roomId)
}

</script>