<template>
  <div>
    <input type="number" v-model="roomCode" placeholder="Enter Room Code">
    <button @click="joinRoom">Join</button>
  </div>
</template>


<script setup lang="ts">
import { computed, onMounted, ref, Ref } from 'vue'
import { useRouter } from 'vue-router';
const roomCode = ref(0)
const router = useRouter()


function joinRoom() {
  if (router){
    const roomId = roomCode.value
    const playerIndex = 1
    router.push(`/game/${roomId}/${playerIndex}`)
    console.log("switching")
  }
  else {
    console.log("NO")
  }
}
</script>