<script setup>
  import Card from './Card.vue';
  
  const props = defineProps({
    hand: {
      type: Array,
      required: true,
    }
  });
  
  const emit = defineEmits(['select-card']);
  
  function selectCard(index, event) {
    emit('select-card', index, event); 
  }
</script>

<template>
  <div class="player-hand">
    <Card
      v-for="(card, index) in hand"
      :key="index"
      :value="card.number.number"
      :isSelected="card.isSelected"
      :isFlipped="card.isTurned"
      @select-card="selectCard(index, $event)"
    />
  </div>
</template>
  
<style>
.player-hand {
  display: grid;
  grid-template-columns: repeat(4, 1fr); /* 4 colunas */
  grid-template-rows: repeat(3, 1fr); /* 3 linhas */
  gap: 10px; /* Espaçamento entre cartas */
  width: 100%; /* Garante que ocupe 100% da largura do contêiner pai */
  box-sizing: border-box; /* Inclui padding e bordas no cálculo da largura */
}

</style>
  