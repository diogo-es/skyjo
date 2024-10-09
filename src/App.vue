<script setup>
  import GameBoard from './components/GameBoard.vue';

  import { ref } from 'vue';

  // Estado para o modo de jogo escolhido
  const gameMode = ref(null);


  // Função para escolher o modo de jogo
  const selectGameMode = (mode) => {
    gameMode.value = mode;
  };
</script>

<template>
  
  <h1>Jogo de Cartas</h1>
  
  <GameBoard />
  
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  box-sizing: border-box;

  overflow: hidden; /* Adicionado para evitar a barra de rolagem */
}

#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f4f4f4;
  text-align: center;
  padding: 20px;
  box-sizing: border-box;
}

.mode-selection {
  display: flex;
  gap: 20px;
}


button {
  padding: 10px 20px;
  font-size: 18px;
  cursor: pointer;
  background-color: #3498db;
  color: white;
  border: none;
  border-radius: 8px;
  transition: background-color 0.2s ease;
}

button:hover {
  background-color: #2980b9;
}

h1 {
  margin-bottom: 20px;
  color: #34495e;
  width: 100%;
  text-align: center;
}
</style>
