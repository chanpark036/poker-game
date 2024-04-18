<template>
  <div>
    <b-container class="mt-3">
      <b-jumbotron v-if="user?.name" class="d-flex justify-content-start align-items-center">
        <b-form-input v-model="roomCode" placeholder="Enter Room Code" type="text"></b-form-input>
        <!-- <input type="string" v-model="roomCode" placeholder="Enter Room Code"> -->
        <b-button @click="joinRoom" variant="success">Join</b-button>
      </b-jumbotron>
      <b-jumbotron v-else class="d-flex justify-content-center align-items-center">
        <h1>Please Login To See Content</h1>
      </b-jumbotron>
    </b-container>
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
  if (router) {
    playerId.value = user.value.preferred_username
    const roomId = roomCode.value
    router.push(`/${roomId}/${playerId.value}`)

    socket.emit("join-room", roomId, playerId.value)


  }
  else {
  }
}
</script>