<script setup>
  import Card from './Card.vue';
  import useDeck from '@/composables/useDeck';

  const { discardCardValue } = useDeck()

  const props = defineProps({
      discardPile: Object
  });

  const emit = defineEmits(['select-card']);

  const selectDiscardCard = (event) => {
    emit('select-card', event);
  }

</script>

<template>
    <div>
      <h3>Pilha de descarte</h3>
      <div v-if="discardPile.length > 0">
        <Card
        :value="discardPile[discardPile.length - 1]"
        :isFlipped="true"
        @select-card="selectDiscardCard"
        />

      </div>
      <p v-else>Nenhuma carta descartada</p>
    </div>
</template>
  