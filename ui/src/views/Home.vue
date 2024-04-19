<template>
  <div>
    <b-container class="mt-3">
      <b-jumbotron v-if="user?.name" class="d-flex justify-content-start align-items-center">
        <b-form-input v-model="roomCode" placeholder="Enter Room Code" type="text"></b-form-input>
        <!-- <b-form-input v-model="playerId" placeholder="Enter Player Code" type="text"></b-form-input> -->

        <!-- <input type="string" v-model="roomCode" placeholder="Enter Room Code"> -->
        <b-button @click="joinRoom" variant="success">Join</b-button>
      </b-jumbotron>
      <b-jumbotron v-else class="d-flex justify-content-center align-items-center">
        <h1>Please Login To See Content</h1>
      </b-jumbotron>
    </b-container>
  <!-- <div v-if="user?.name">
    <input type="string" v-model="roomCode" placeholder="Enter Room Code">
    
    <input type="string" v-model="playerName" placeholder="Enter Player Id">

    <button @click="joinRoom">Join</button> -->
  </div>
</template>


<script setup lang="ts">
import { ref, Ref, inject } from 'vue'
import { useRouter } from 'vue-router';
// import { io } from "socket.io-client"

// const socket = io()

// const playerName = ref("") // TODO: GET RID OF EVENTUALLY
const roomCode = ref("")
const playerId = ref('')
const router = useRouter()

const user: Ref<any> = inject("user")!
function joinRoom() {
  if (router) {
    playerId.value = user.value.preferred_username
    const roomId = roomCode.value
    router.push(`/${roomId}/${playerId.value}`)



    // router.push(`/${roomId}/${playerName.value}`) // USE CUSTOM PLAYER NAMES FOR TESTING. TODO: CHANGE BACK EVENTUALLY
    
    // socket.emit("join-room", roomId, playerName.value)
  
  }
  else {
  }
}
</script>