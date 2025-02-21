<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';

const gameMode = ref(null);
const router = useRouter();

const selectGameMode = (mode) => {
  gameMode.value = mode

  if (mode === 'single') {
    router.push('/singleplayer'); 
  } else if (mode === 'multi') {
    router.push('/multiplayer'); 
  }
};

</script>

<template>
    <!-- Seleção do modo de jogo -->
    <div v-if="!gameMode" class="mode-selection">
      <button @click="selectGameMode('single')">Single Player</button>
      <button @click="selectGameMode('multi')">Multiplayer</button>
    </div>
</template>

<style scoped>

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


.mode-selection {
  display: flex;
  gap: 20px;
}

</style>