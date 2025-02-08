<script setup>
import { ref, provide, computed, watch, onMounted } from 'vue';
import Player from './Player.vue';
import Deck from './Deck.vue';
import DiscardPile from './DiscardPile.vue';

import useDeck from '@/composables/useDeck';
import usePlayer from '@/composables/usePlayer';

import { useGameStore } from "../stores/game";



const gameStore = useGameStore()

const {
    deck,
    initializeDeck,
    initializeDiscardPile,
    replaceCard,
    chooseDiscardCard
} = useDeck();

const { handCreation } = usePlayer();

// Criação do baralho
//const deck = ref([]);

// Estado dos jogadores
//const players = ref([]);


const newRound = ref(false);

// Estado para o modo de jogo
//const gameMode = ref(null);
const curruntPlayer = ref(0);
const playing = ref(true);

const discardPile = ref([]);
const drawnCard = ref(null);
const cardToPlace = ref(null);
const isSelectingPosition = ref(false);
provide('sharedData', isSelectingPosition);

const allCardsFlipped = ref(false);
//provide('allCardsFlipped', allCardsFlipped);

const shouldWaitForEvent = ref(false);

const playersReady = ref(false); 
let stopWatch = null;  



// Função para inicializar a mão dos jogadores
/*function generateHand() {
  // Retirar 12 cartas do deck aleatoriamente
  return Array.from({ length: 12 }, () => {
    const randomIndex = Math.floor(Math.random() * deck.value.length);
    return deck.value.splice(randomIndex, 1)[0]; // Remove e retorna a carta
  });
}*/


// Função para inicializar o jogo
/*const initializeGame = () => {
  // Inicializa o deck
  deck.value = generateDeck();

  // Inicializa os jogadores
  players.value = [
    { 
      name: 'Player 1', hand: generateHand(),
      points: 0, cardsFlipped: 0, canFlip: true, allCardsFlipped: false
    },
    { 
      name: 'Player 2', hand: generateHand(),
      points: 0, cardsFlipped: 0, canFlip: true, allCardsFlipped: false
    },
  ];

  // Chama o gameLoop após a inicialização dos jogadores
  // Assista o estado dos jogadores para verificar quando eles virarem duas cartas
  watch(() => players.value.map(player => player.cardsFlipped), (newValues) => {
    const allPlayersFlippedTwoCards = newValues.every(flipped => flipped >= 2);
    
    if (allPlayersFlippedTwoCards) {
      // Pode chamar o restante da lógica do jogo aqui
      gameLoop(); // Inicia o loop do jogo apenas depois de todos virarem 2 cartas
    }
  });
};*/


let gameStarted = false;
let selectedCardIndex = null;

let round = 0;


const updateallCardsFlipped = (playerIndex) => {
  players.value[playerIndex].allCardsFlipped = true;
  //console.log('Todos os jogadores viraram as cartas!', players.value.every(player => player.allCardsFlipped));

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

// Função para descartar uma carta
function discardCard(card) {
  console.log('Carta descartada: ', card);
  discardPile.value.push(card);
  drawnCard.value = null;
}

// Função para guardar uma carta
function keepCard(card) {
  if (drawnCard.value) {
    console.log('Carta guardada: ', card);
    cardToPlace.value = card;
    isSelectingPosition.value = true;
  }
}


onMounted(() => {
  console.log(`round: ${round}`);

  initializeDeck();

  initializeDiscardPile();

  handCreation(); 
})

</script>

<template>
  <div class="game-board">

    <!-- Deck, DiscardPile e jogadores -->
    <Deck 
      :deck="deck" 
      :drawnCard="drawnCard" 
      @draw-card="drawCard" 
      @keep-card="keepCard"
      @discard-card="discardCard"
    />
    <DiscardPile :discardPile="discardPile" />
    
    <Player
      v-for="(player, index) in gameStore.players"
      :key="index"
      :name="player.name"
      :hand="player.cards"
      :points="player.points"
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
    justify-content: space-evenly;
    align-items: flex-start;
    width: 100%;
    padding: 20px;
    gap: 40px;
  }
</style>
