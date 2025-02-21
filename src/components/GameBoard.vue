<script setup>
import { ref, provide, computed, watch, onMounted } from 'vue';
import Player from './Player.vue';
import Deck from './Deck.vue';
import DiscardPile from './DiscardPile.vue';

import useDeck from '@/composables/useDeck';
import usePlayer from '@/composables/usePlayer';

import { useGameStore } from "../stores/game";
import { useToast } from 'vue-toastification';

import { useRouter } from 'vue-router';



const MAX_SCORE = 35;

const toast = useToast();
const gameStore = useGameStore()
const router = useRouter();

const {
  deck,
  initializeDeck,
  initializeDiscardPile,
  replaceCard,
  chooseDiscardCard,
  hasNotReplacedCard,
  onDeckCardClick,
  drawnCardValue,
  keepCard,
  selectDiscardCard,
  discardCardValue,
  isDrawnCard,
  discardPile,
  discardCard
} = useDeck();

const { handCreation } = usePlayer();

const hasGameEnded = ref(false);
let firstPlayer = null;


const newRound = ref(false);

// Estado para o modo de jogo
const curruntPlayer = ref(0);
const playing = ref(true);

const drawnCard = ref(null);
const cardToPlace = ref(null);
const isSelectingPosition = ref(false);
provide('sharedData', isSelectingPosition);

const allCardsFlipped = ref(false);

const shouldWaitForEvent = ref(false);

const playersReady = ref(false); 
let stopWatch = null;  

let lastPlay = false;

const twoCardsTurned = () => {
  if (gameStore.players.every(player => player.cardsTurned === 2)) {
    gameStore.playersReady = true;
  }
  return gameStore.playersReady;
}

/*const scores = computed(() => 
  gameStore.players.map(player => {
    // Soma o valor das cartas viradas
    return player.cards
      .filter(card => card.isTurned && !card.isHidden) 
      .reduce((sum, card) => sum + parseInt(card.number.number), player.score);
  })
);*/


const everyCardTurned = computed(() =>
  gameStore.players.map(player => player.cards.filter(card => card.isTurned && !card.isHidden))
);

const allCardsTurned = () => {
  return gameStore.players.every(player => player.cards.every(card => card.isTurned));
}



let gameStarted = false;
let selectedCardIndex = null;

let round = 0;


const updateallCardsFlipped = (playerIndex) => {
  players.value[playerIndex].allCardsFlipped = true;

  if (players.value.every(player => player.allCardsFlipped)) {
    newRound.value = true;
  }
};




// Função para atualizar os pontos de um jogador
function updatePlayerPoints(playerIndex, cardValue) {
  if (curruntPlayer.value !== playerIndex && gameStarted) {
    return;
  }

  gameStore.players[playerIndex].points += cardValue;
}




const flipCard = (playerIndex, cardIndex, event) => {

  //debugger
  
  const playerCards = gameStore.players[playerIndex].cards;
  
  
  // Impedir os jogadores de virem mais de 2 cartas, até o jogo começar
  if (!gameStore.playersReady && gameStore.players[playerIndex].cardsTurned === 2) {
    console.log("Não é possível virar mais cartas, até o jogo começar!");
    return;
  }


  // Para atualizar os pontos do jogador, apenas se o jogo/ronda não tiver começado
  if (!gameStore.playersReady && gameStore.players[playerIndex].cardsTurned !== 2) {
    gameStore.players[playerIndex].points += parseInt(playerCards[cardIndex].number.number);
  }



  // Verificar se é a vez do jogador para virar a carta
  if (gameStore.turn !== gameStore.players[playerIndex].name && gameStore.playersReady) {
    toast.info('Não é a sua vez.')
    return;
  }

  //debugger
  // Gerir a interação com o baralho e descarte
  if (replaceCard.value || chooseDiscardCard.value) {
    playerCards[cardIndex].isTurned = false;

    let cardOldValue = playerCards[cardIndex].number.number;

    playerCards[cardIndex].number.number = chooseDiscardCard.value ? discardPile.value[discardPile.value.length - 1] : drawnCardValue.value;
    discardPile.value.push(parseInt(cardOldValue));
    discardCardValue.value = cardOldValue;
    
    
    drawnCard.value = false; // Ver mais tarde se isto é util
    
  }


  
  if (gameStore.playersReady) {

    // Atualiza os pontos do jogador se a carta não estiver virada (VIRA A CARTA)
    if (lastPlay) {
      const playerIndex = gameStore.players.findIndex(player => player.name === gameStore.turn);
      gameStore.players[playerIndex].cards.forEach(card => card.isTurned = true);

    } else if (!playerCards[cardIndex].isTurned && (replaceCard.value || chooseDiscardCard.value || hasNotReplacedCard.value)) {

      playerCards[cardIndex].isTurned = !playerCards[cardIndex].isTurned;
      gameStore.players[playerIndex].cardsTurned++;
      changeTurn();

      hasNotReplacedCard.value = false;
      replaceCard.value = false;
      chooseDiscardCard.value = false;

    } else {
      if (playerCards[cardIndex].isTurned) {
        toast.info('A carta já está virada!')
      }else{
        toast.info('Tem de retirar uma carta do baralho ou descarte primeiro!')
      }
    }


  } else {
    // Vira a carta e atualiza o número de cartas viradas
    playerCards[cardIndex].isTurned = !playerCards[cardIndex].isTurned;
    gameStore.players[playerIndex].cardsTurned++;
  }
  
}








// Função para selecionar/deselecionar uma carta da mão
function selectCard(playerIndex, cardIndex, event) {
 
  selectedCardIndex = cardIndex;

  if (curruntPlayer.value !== playerIndex && gameStarted) {
    console.log('Não é a vez do jogador', playerIndex + 1);
    return;
  }

  /*if (players.value[playerIndex].canFlip === false) {
    console.log('O jogador', playerIndex + 1, 'não pode virar cartas agora.');
    return;
  }*/

  // Aqui verificamos se o jogador está a selecionar uma carta para colocar na mão
  if (isSelectingPosition.value) {
    placeCardInHand(playerIndex, cardIndex);
    players.value[playerIndex].hand[cardIndex].isSelected = true;
    players.value[playerIndex].hand[cardIndex].isFlipped = true;
    drawnCard.value = null;
    return;
  }
  console.log("Debug: ", players.value)
  // Se estamos apenas virando uma carta
  players.value[playerIndex].hand[cardIndex].isFlipped =
    !players.value[playerIndex].hand[cardIndex].isFlipped;

  players.value[playerIndex].hand[cardIndex].isSelected =
    !players.value[playerIndex].hand[cardIndex].isSelected;

  players.value[playerIndex].cardsFlipped++;


  if (!shouldWaitForEvent.value) {
    event.stopPropagation(); // Previne a execução do outro ouvinte de evento
  }
    
}



// Função para colocar uma carta na mão
function placeCardInHand(playerIndex, handIndex) {
  if (cardToPlace.value) {
    players.value[playerIndex].hand.splice(handIndex, 1, cardToPlace.value);
    cardToPlace.value = null;
    isSelectingPosition.value = false; // Desativa a seleção
  }
}

// Função para puxar uma carta do baralho
function drawCard() {
  if (deck.value.length > 0) {
    const card = deck.value.pop();
    console.log('Carta puxada: ', card);
    drawnCard.value = card;

    // Lógica para dar a carta a um jogador
    // Aqui você pode decidir a quem dar a carta, se for automático ou baseado em uma lógica
  }
}


const determineFirstPlayer = () => {
  let points = [];

  gameStore.players.forEach(player => {
    points.push(player.points);
  });
  // obter o jogador com a maior pontuação e definir o turno
  const maxPoints = Math.max(...points);
  firstPlayer = gameStore.players.find(player => player.points === maxPoints);
  gameStore.turn = firstPlayer.name;

  toast.info(`O ${firstPlayer.name} começa em primeiro !`);
}


const changeTurn = () => {
  if (gameStore.players.some(player => player.cards.every(card => card.isTurned)) && firstPlayer.name !== gameStore.turn) {

    // as cartas do outro jogador tem de ser viradas automaticamente
    // TODO: Por aqui um setTimeout para virar as cartas automaticamente e um toast para informar o jogador
    const playerIndex = gameStore.players.findIndex(player => player.name === firstPlayer.name);
    gameStore.players[playerIndex].cards.forEach(card => card.isTurned = true);
  }

  if (gameStore.players.some(player => player.cards.every(card => card.isTurned)) && firstPlayer.name === gameStore.turn) {
    // o outro jogador só pode virar mais 1 carta
    lastPlay = true;
  }


  const playerIndex = gameStore.players.findIndex(player => player.name === gameStore.turn);
  const nextPlayerIndex = playerIndex === 0 ? 1 : 0;
  gameStore.turn = gameStore.players[nextPlayerIndex].name;
}



const resetGame = () => {

  gameStore.scores.value.forEach((score, playerIndex) => {
    gameStore.players[playerIndex].score = score;
  });

  gameStore.players.forEach(player => {
    player.cardsTurned = 0;
    player.points = 0;

    player.cards.forEach(card => card.isTurned = false);
    player.cards.forEach(card => card.isHidden = false);
  });

  gameStore.playersReady = false;
  gameStore.turn = null;
  lastPlay = false

}


const determineWinner = () => {
  const minScore = Math.min(...gameStore.scores);
  console.log("Min Score:", minScore, "Scores:", gameStore.scores);

  gameStore.players.forEach( (player, index) => {
    player.score = gameStore.scores[index]
  });

  gameStore.winner = gameStore.players.find(player => Number(player.score) === minScore);
  console.log("Winner:", gameStore.winner);
};



// Monitoriza todos os jogadores viraram 2 cartas, para determinar o primeiro jogador
watch(twoCardsTurned, (value) => {
  if (value) {
    determineFirstPlayer();
  }
});


// Monitoriza se todas as cartas de uma coluna são iguais
watch(everyCardTurned, async (allCardsTurned) => {
  //debugger
  allCardsTurned.forEach((cards, playerIndex) => {
    const sameColumn = cards.filter(card => 
      cards.some(c => c.col === card.col && c.number.number === card.number.number && c.id !== card.id)
    );
    //console.log("Debug: ", sameColumn)
    if (sameColumn.length === 3) {
      sameColumn.forEach(card => {
        card.isHidden = true;
        discardPile.value.push(card.number.number);
      });
      
      
    }
  });
},  { immediate: false });


// Verifica se todas as cartas estão viradas, para determinar o fim da ronda
watch(allCardsTurned, (value) => {
  
  if (!hasGameEnded.value && value) {
    toast.info(`Fim da ${round}ª ronda.`)
    setTimeout(() => {
      round++;
      resetGame();
    }, 2000);
  }
});


// Monitoriza o fim do jogo
watch(hasGameEnded, (gameOver) => {
  toast.info('Fim de jogo')
  if (gameOver) {
    determineWinner();
    router.push('/results')
  }
});



// Monitoriza a pontuação dos jogadores
watch(() => gameStore.scores, (scores) => {
  
  if (scores.some(score => score >= MAX_SCORE && allCardsTurned())) {
    hasGameEnded.value = true;
  } else {
    hasGameEnded.value = false;
  }

});


onMounted(() => {
  console.log(`round: ${round}`);

  initializeDeck();

  initializeDiscardPile();

  handCreation(); 
})

</script>

<template>
  <h1>Skyjo</h1>
  <div class="game-board">

    <!-- Deck, DiscardPile e jogadores -->
    <Deck 
      :deck="deck" 
      :drawnCard="drawnCardValue"
      :isDrawnCard="isDrawnCard" 
      @draw-card="onDeckCardClick" 
      @keep-card="keepCard"
      @discard-card="discardCard"
    />

    <DiscardPile 
      :discardPile="discardPile"
      @select-card="selectDiscardCard"
    />
    
    <Player
      v-for="(player, index) in gameStore.players"
      :key="index"
      :name="player.name"
      :hand="player.cards"
      :points="gameStore.scores[index]"
      :allCardsFlipped="player.allCardsFlipped"
      @select-card="(cardIndex, event) => flipCard(index, cardIndex, event)"
      @update-points="updatePlayerPoints(index, $event)"
      @new-round="updateallCardsFlipped(index)"
    />
  </div>
</template>

<style>
  .game-board {
    display: flex;
    /*flex-direction: column;*/
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
    padding: 20px;
    gap: 40px;
    box-sizing: border-box;
  }
</style>
