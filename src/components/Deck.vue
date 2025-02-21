<script setup>
import Card from '@/components/Card.vue';

const props = defineProps({
  deck: Array,
  drawnCard: Number,
  isDrawnCard: Boolean
});

const emit = defineEmits(['draw-card', 'keep-card', 'discard-card']);


const drawCard = () => {
  if (props.deck.length > 0) {
    emit('draw-card');
  }
};

const keepCard = () => {
  emit('keep-card', props.drawnCard);
};

const discardCard = () => {
  emit('discard-card', props.drawnCard);
};
</script>


<template>
  <div class="deck-container">
    <!-- Baralho -->
     <h3>Baralho</h3>
    <div class="deck" @click="drawCard">
      <div v-if="deck.length > 0" class="deck-card-back"></div>
      <p v-else>No more cards</p>
    </div>

    <!-- Carta puxada -->
    <div v-if="isDrawnCard" class="drawn-card">
      <Card :value="drawnCard" :is-flipped="true"/>
      <div class="card-actions">
        <button @click="keepCard">Keep</button>
        <button @click="discardCard">Discard</button>
      </div>
    </div>
  </div>
</template>

<style scoped>
.deck-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20px;
}

.deck {
  width: 100px;
  height: 150px;
  background-color: #2c3e50;
  border: 2px solid #34495e;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Sombra leve */
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.deck-card-back {
  width: 100%;
  height: 100%;
  background-color: #2c3e50; /* Cor da parte de trás, coerente com as cartas */
  border-radius: 8px;
}

.deck:hover {
  transform: scale(1.05); /* Efeito de destaque ao passar o mouse */
}

.drawn-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
}

.card {
  width: 100px;
  height: 150px;
  border: 2px solid #34495e;
  background-color: white;
  display: flex;
  justify-content: center;
  align-items: center;
  font-size: 24px;
  border-radius: 8px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

.card-actions {
  display: flex;
  gap: 10px;
}

button {
  padding: 8px 12px;
  border: none;
  background-color: #007bff;
  color: white;
  cursor: pointer;
  border-radius: 4px;
}

button:hover {
  background-color: #0056b3;
}
</style>
