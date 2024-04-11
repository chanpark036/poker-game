<template>
    <div>
        <b-container class="mt-3">
            <b-card bg-variant="dark" text-variant="white" title="Profile Details" v-if="user">

                <b-card-text class="d-flex justify-content-start align-items-center">
                    <h5>Your PlayerId: {{ user.preferred_username }}</h5>
                    <b-button :pressed.sync="editMode" variant="primary" style="margin-left:auto" class="mb-2">Edit Mode</b-button>
                </b-card-text>
                

                <b-card-text v-if="playerInfo && !editMode">
                    <p>Name: {{ playerInfo.name }}</p>
                    <p>Age: {{ playerInfo.age }}</p>
                    <p>Amount: {{ playerInfo.earnings }}</p>
                </b-card-text>
                <b-card-text v-else>
                    <b-form @submit="save">
                        <b-form-group id="input-group-1" label="Your Name:" label-for="input-1" description="First and Last">
                            <b-form-input id="input-1" v-model="form.name" placeholder="Enter name" required></b-form-input>
                        </b-form-group>

                        <b-form-group id="input-group-2" label="Your Age:" label-for="input-2">
                            <b-form-input id="input-2" v-model="form.age" placeholder="Enter age" required></b-form-input>
                        </b-form-group>

                        <b-form-group id="input-group-3" label="Amount:" label-for="input-3">
                            <b-form-input id="input-3" v-model="form.earnings" placeholder="Amount in Account" required></b-form-input>
                        </b-form-group>

                        <b-button type="submit" variant="primary">Submit</b-button>
                    </b-form>
                </b-card-text>

            </b-card>
        </b-container>
    </div>
</template>

<script setup lang="ts">
import { watch, ref, inject, Ref, onMounted } from 'vue'
import { Player } from '../../../server/game/model'
import {PlayerProfileInfo} from '../../../server/site/data'

const user: Ref<any> = inject("user")!
const playerInfo: Ref<Player | null> = ref(null)
// const playerExists = ref(true)
const form: Ref<PlayerProfileInfo> = ref({
    name: '',
    age: 0,
    earnings: 0,
    profilePic: null,
    gamesPlayed: 0
})
const editMode = ref(false)

//if they already have player profile-> display player profile + access to everything else
//if they do not have player profile -> they MUST create player profile first before they can do anything else
async function refresh() {
    if (user.value && !playerInfo.value) {
        try {
            const profileResponse = await fetch("/api/profileInfo");
            if (profileResponse.status === 404) {
                console.log('Player does not exist yet');
            }
            else if (profileResponse.status === 500) {
                throw new Error('Failed to fetch player data');
            }
            else {
                playerInfo.value = await profileResponse.json();
                form.value.name = playerInfo.value?.name || ''
                form.value.age = playerInfo.value?.age || 0
                form.value.earnings = playerInfo.value?.earnings || 0
                form.value.profilePic = playerInfo.value?.profilePic || ''
                form.value.gamesPlayed = playerInfo.value?.gamesPlayed || 0
                console.log(playerInfo.value)
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while fetching player data.');
        }
    }
}
onMounted(refresh)

async function save() {
    console.log(form)
    await fetch(
        "/api/profileInfo/save",
        { method: "POST",
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(form.value)}
    )
    await refresh()
}
</script>