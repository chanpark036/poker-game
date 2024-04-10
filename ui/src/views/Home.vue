<template>
  <div>
    <input type="string" v-model="roomCode" placeholder="Enter Room Code">
    <button @click="joinRoom">Join</button>
  </div>
</template>


<script setup lang="ts">
import { computed, onMounted, ref, Ref } from 'vue'
import { useRouter } from 'vue-router';
import { io } from "socket.io-client"

const socket = io()

const roomCode = ref("")
const router = useRouter()


function joinRoom() {
  if (router){
    const roomId = roomCode.value
    const playerId = "1"
    router.push(`/game/${roomId}`)
    console.log("switching")
    
    socket.emit("join-room", roomId, playerId)
    

  }
  else {
    console.log("NO")
  }
}
</script>