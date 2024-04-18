<template>
    <div>
        <b-container class="mt-3">
            <b-card bg-variant="dark" text-variant="white" title="Profile Details" v-if="user">

                <b-card-text class="d-flex justify-content-start align-items-center">
                    <h5>Your PlayerId: {{ user.preferred_username }}</h5>
                    <b-button :pressed.sync="editMode" variant="primary" style="margin-left:auto" class="mb-2">Edit Mode</b-button>
                </b-card-text>
                <b-card-text v-if="profilePic">
                    <img :src="'data:image/png;base64,' + profilePic" width="100" height="100">
                </b-card-text>

                <b-card-text v-if="playerInfo && !editMode">
                    <p>Name: {{ playerInfo.name }}</p>
                    <p>Age: {{ playerInfo.age }}</p>
                    <p>Bio: {{ playerInfo.bio }}</p>
                </b-card-text>
                <b-card-text v-else>
                    <b-form>
                        <b-form-group id="input-group-1" label="Your Name:" label-for="input-1">
                            <b-form-input id="input-1" v-model="form.name" placeholder="What is your name?" required></b-form-input>
                        </b-form-group>

                        <b-form-group id="input-group-2" label="Your Age:" label-for="input-2">
                            <b-form-input id="input-2" v-model="form.age" placeholder="What is your age" required></b-form-input>
                        </b-form-group>

                        <b-form-group id="input-group-3" label="Enter a bio:" label-for="input-3">
                            <b-form-input id="input-3" v-model="form.bio" placeholder="Tell us about yourself" required></b-form-input>
                        </b-form-group>

                        <b-form-file v-model="file" class="mt-3" plain accept="image/png" name="file"></b-form-file>
                        <div class="mt-3">Selected file: {{ file ? file.name : '' }}</div>

                        <!-- <b-button type="submit" variant="primary">Submit</b-button> -->
                        <b-button @click="save" variant="success">SUBMIT</b-button>
                        <!-- <b-button @click="saveImage" variant="primary">save image</b-button> -->
                        <!-- <b-button @click="getImage" variant="primary">get image</b-button> -->
                        
                    </b-form>
                </b-card-text>

            </b-card>
        </b-container>
    </div>
</template>

<script setup lang="ts">
import { ref, inject, Ref, onMounted} from 'vue'
import { Player } from '../../../server/game/model'
import {PlayerProfileInfo} from '../../../server/site/data'

const user: Ref<any> = inject("user")!
const playerInfo: Ref<Player | null> = ref(null)
// const playerExists = ref(true)
const form: Ref<PlayerProfileInfo> = ref({
    name: '',
    age: 0,
    bio: ''
})
const editMode = ref(false)
const file: Ref<File | null> = ref(null)
const profilePic = ref('')

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
                form.value.bio = playerInfo.value?.bio || ''

                console.log(playerInfo.value)
                await getImage()
            }
        } catch (error) {
            console.error(error);
            alert('An error occurred while fetching player data.');
        }
    }
    editMode.value=false
}
onMounted(refresh)
// watch(user, refresh, { immediate: true })

async function save() {
    console.log(form)
    await fetch(
        "/api/profileInfo/save",
        { method: "POST",
        headers: { "Content-Type": "application/json" }, 
        body: JSON.stringify(form.value)}
    )
    await saveImage()
    console.log("done saving")
    await refresh()
}

async function saveImage() {
    console.log(file.value)
    if(user.value && file.value != null)
    {
        if(file.value.size > 3000000){
            alert('File too large try again');
        }
        else{
            const newFile = new File([file.value], user.value.preferred_username+'.png', {type: file.value.type});
            const formData = new FormData()
            formData.append('file',newFile)
            formData.forEach((value, key) => {
            console.log("key %s: value %s", key, value);
            })
            console.log(profilePic.value)
            try{
                if(profilePic.value){
                    await fetch("/api/profileInfo/deletePicture",{ method: "DELETE" , body: formData})          
                }
            }
            catch(e){
                console.log('No image found')
            }
            finally{
                console.log('uploading Picture')
                await fetch(
                "/api/profileInfo/uploadPicture",
                { method: "POST",
                body: formData})
            }
        }
    }
}

async function getImage() {
    if(user.value){
        const profilePicDataResponse = await fetch("/api/profileInfo/getPicture")
        const profilePicData = await profilePicDataResponse.json()
        console.log(profilePicData)
        console.log(profilePicDataResponse.status)
        if(profilePicDataResponse.status === 200)
        {
            profilePic.value = profilePicData.body
        }
    }
}

</script>