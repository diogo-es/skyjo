<script setup>
  import { computed, watch, inject } from 'vue';
  import PlayerHand from './PlayerHand.vue';


  
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
    allCardsFlipped: {
      type: Boolean,
      default: false,
    },
  });

  //const allCardsFlipped = inject('allCardsFlipped');

  const computedAllCardsFlipped = computed(() => {
    return props.hand.every(card => card.isFlipped);
  });
  
  const emit = defineEmits(['select-card', 'update-points', 'new-round']);
  
  function selectCard(cardIndex, event) {
    emit('select-card', cardIndex, event);
    emit('update-points', props.hand[cardIndex].value);
  }


  watch(computedAllCardsFlipped, (newValue) => {
    if (newValue) {
      emit('new-round');
    }
  });

  </script>


<template>
  <div class="player">
    <h2>{{ name }}</h2>
    <PlayerHand :hand="hand" @select-card="selectCard" />
    <p>Pontos: {{ points }}</p>
  </div>
</template>
  

<style>
  .player {
    margin-bottom: 20px;
  }
</style>
  