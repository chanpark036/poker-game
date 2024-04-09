<template>
    <div class="table">
        <div class="card-space">{{  card  }}</div>
        <div class="card-space"></div>
        <div class="card-space"></div>
        <div class="card-space"></div>
        <div class="card-space"></div>
    </div>
    <div class="playerCards">
        <div class="card-space"></div>
        <div class="card-space"></div>
    </div>
</template>

<style scoped>
 body {
    margin: 0;
    padding: 0;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 100vh;
    background-color: #f0f0f0;
  }
  
  .table {
    position: relative;
    width: 800px;
    height: 350px;
    background-color: green;
    border-radius: 50%;
    overflow: hidden;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding-top: 10px;
  }
  
  .card-space {
    width: 80px;
    height: 120px;
    background-color: #ccc;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }

  .playerCards {
    position: relative;
    width: 300px;
    height: 150px;
    background-color: green;
    display: flex;
    justify-content: space-around;
    align-items: center;
    padding-top: 10px;
    left: 250px;
  }


</style>

<script setup lang="ts">
    import { Card} from "../../../server/gameLogic/model"

    interface Props {
        card?: Card,
    }

    // default values for props
    const props = withDefaults(defineProps<Props>(), {
        card: undefined,
    })
</script>