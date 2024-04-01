<template>
    <div>
        <div v-if="currentCard?.locationType === 'player-hand'">
            <div v-if="lastPlayedCard && areCompatible(currentCard,lastPlayedCard)">
                <div @click="$emit('playCard', currentCard?.id)" class="compatible">
                    {{ formatCard(currentCard, true) }}
                </div>
            </div>
            <div v-else>
                <div class="not_compatible">{{ formatCard(currentCard, true) }}</div>
            </div>
        </div>
        <div v-if="currentCard?.locationType === 'last-card-played'" class="last_played">
            {{ formatCard(currentCard, true) }}
        </div>
    </div>
</template>

<script setup lang="ts">
import { computed, onMounted, ref, Ref } from 'vue'
import { io } from "socket.io-client"
import { Card, GamePhase, Action, formatCard, CardId, areCompatible, getLastPlayedCard } from "../../../server/model"
import {emitUpdatedCardsForPlayers} from '../../../server/server.ts'


interface Props {
  currentCard?: Card,
  lastPlayedCard?: Card
}

// default values for props
const props = withDefaults(defineProps<Props>(), {
    currentCard: undefined,
    lastPlayedCard: undefined
})


</script>

<style scoped>
.last_played{
    background-color: yellow !important;
}

.compatible{
    background-color:green;
}

.not_compatible{
    background-color:red;
}
</style>