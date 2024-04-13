<template>
  <div v-if="user?.name">
    <input type="string" v-model="roomCode" placeholder="Enter Room Code">
    
    <!-- <input type="string" placeholder="Enter Player Id"> -->
    <button @click="joinRoom">Join</button>
  </div>
</template>


<script setup lang="ts">
import { computed, onMounted, ref, Ref, inject } from 'vue'
import { useRouter } from 'vue-router';
import { io } from "socket.io-client"

const socket = io()

const roomCode = ref("")
const playerId = ref('')
const router = useRouter()

const user: Ref<any> = inject("user")!
function joinRoom() {
  if (router){
    playerId.value = user.value.preferred_username
    const roomId = roomCode.value
    router.push(`/${roomId}/${playerId.value}`)
    
    socket.emit("join-room", roomId, playerId.value)
    

  }
  else {
  }
}
</script>