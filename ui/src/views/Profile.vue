<template>
    <div>
        <b-container class="mt-3">
            <b-card bg-variant="dark" text-variant="white" title="Input Profile Details">

                <b-card-text>
                    Some quick example text to build on the card title and make up the bulk of the card's content.
                </b-card-text>
            </b-card>
        </b-container>

    </div>
</template>

<script setup lang="ts">
import { watch, ref, inject, Ref, onMounted } from 'vue'
import { Player } from '../../../server/game/model'

const user: Ref<any> = inject("user")!
const playerInfo: Ref<Player | null> = ref(null)
// const playerExists = ref(true)

//if they already have player profile-> display player profile + access to everything else
//if they do not have player profile -> they MUST create player profile first before they can do anything else
async function refresh() {
    if (user.value && !playerInfo.value) {
        try {
            const profileResponse = await fetch("/api/profileInfo");
            if (profileResponse.status === 404) {
                throw new Error('Player does not exist yet');
            }
            else if (profileResponse.status === 500) {
                throw new Error('Failed to fetch player data');
            }
            playerInfo.value = await profileResponse.json();
        } catch (error) {
            console.error(error);
            alert('An error occurred while fetching player data.');
        }
    }
}
onMounted(refresh)

async function save() {
  await fetch(
    "/api/profileInfo/save",
    { method: "POST" }
  )
  await refresh()
}
</script>