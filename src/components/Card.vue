<script setup>
  import { computed } from 'vue';
  
  const props = defineProps({
    value: {
      type: Number,
      required: true,
    },
    isSelected: {
      type: Boolean,
      default: false,
    },
    isFlipped: {
      type: Boolean,
      default: false,
    },
    isHidden: {
      type: Boolean,
      default: false
    }
  });
  
  const emit = defineEmits(['select-card']);


  // Computed para definir a cor de fundo da carta com base no valor
  const cardColor = computed(() => {
    if (props.value >= -2 && props.value <= -1) {
      return '#9B59B6'; // Roxo
    } else if (props.value === 0) {
      return '#5DADE2'; // Azul clarinho
    } else if (props.value >= 1 && props.value <= 4) {
      return '#58D68D'; // Verde
    } else if (props.value >= 5 && props.value <= 8) {
      return '#F4D03F'; // Amarelo
    } else if (props.value >= 9 && props.value <= 12) {
      return '#E74C3C'; // Vermelho
    }
    
  });

  
  function flipCard(event) {
    emit('select-card', event);
  }
</script>


<template>
  <div
    class="card" 
    :class="{ selected: isSelected, flipped: isFlipped, hidden: isHidden }" 
    :style="{ 
      backgroundColor: isFlipped ? cardColor : '#2c3e50',
      visibility: isHidden ? 'hidden' : 'visible', /* Mantém a posição mas esconde visualmente */
      opacity: isHidden ? 0 : 1 /* Adiciona um efeito visual */
    }"
    @click="flipCard"
  >
    <div class="card-content" v-if="isFlipped">
      <div class="card-value">{{ value }}</div>
    </div>
    <div class="card-back" v-else></div>
  </div>
</template>
  
<style>
  .card {
    border: 2px solid #34495e; /* Atualiza a borda para ser a mesma do Deck */
    border-radius: 8px;
    width: 100px;
    height: 150px;
    display: flex;
    justify-content: center;
    align-items: center;
    cursor: pointer;
    transition: transform 0.2s;
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1); /* Sombra leve */
  }

  .card.selected {
    transform: scale(1.1);
  }

  .card.flipped .card-content {
    display: block;
  }

  .card-content {
    text-align: center;
    display: none; /* Esconde o conteúdo da carta quando virada para baixo */
  }

  .card-value {
    font-size: 24px;
    color: white;
  }

  .card-back {
    background-color: #2c3e50;
    border: 2px solid #34495e;
    width: 100%;
    height: 100%;
    border-radius: 8px;
  }


  .card.hidden {
    visibility: hidden;
  }

</style>
  