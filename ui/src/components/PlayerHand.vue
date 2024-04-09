<template>
    <div class="playerCards">
        <div class="card-space"></div>
        <div class="card-space"></div>
    </div>
</template>

<style scoped>

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

  .card-space {
    width: 80px;
    height: 120px;
    background-color: #ccc;
    border-radius: 10px;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  }
</style>