<script setup>
  import PlayerHand from '@/components/PlayerHand.vue';
  import { useGameStore } from '@/stores/game';

  
  const gameStore = useGameStore()

  const props = defineProps({
    name: {
      type: String,
      required: true,
    },
    hand: {
      type: Array,
      required: true,
    },
    points: {
      type: Number,
      default: 0,
    },
  });

  
  const emit = defineEmits(['select-card']);
  
  function selectCard(cardIndex, event) {
    emit('select-card', cardIndex, event);
  }

  </script>


<template>
  <div class="player">
    
    <h2 :class="name === gameStore.turn ? 'active-player' : ''">
      {{ name }}
    </h2>
    <PlayerHand :hand="hand" @select-card="selectCard" />
    <p>Pontos: {{ points }}</p>
  </div>
</template>
  

<style>
  .player {
    margin-bottom: 20px;
  }

  .active-player {
    color: red;
  }
</style>
  