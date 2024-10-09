<script setup>
    import Card from './Card.vue';

    const props = defineProps({
        discardPile: Array
    });

    
</script>

<template>
    <div>
      <h3>Pilha de descarte</h3>
      <div v-if="discardPile.length > 0">
        <Card
        :value="discardPile[discardPile.length - 1].value"
        :isFlipped="true"
        />

      </div>
      <p v-else>Nenhuma carta descartada</p>
    </div>
</template>
  