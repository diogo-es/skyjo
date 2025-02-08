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
    initializeDiscardPile
} = useDeck();

const { handCreation } = usePlayer();

// Criação do baralho
//const deck = ref([]);

// Estado dos jogadores
const players = ref([]);

const rounds = ref([Array(players.length).fill(null)]);;
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


const sortedPlayersByPoints = computed(() => {
  return [players.value].sort((a, b) => a.points - b.points);
});


function addNewRow() {
  rounds.value.push(Array(players.length).fill(null));
}


// Função para gerar o baralho
const generateDeck = () => {
  const deckArray = [];

  // Adicionar 5 cartas de valor -2
  for (let i = 0; i < 5; i++) {
    deckArray.push({ value: -2 });
  }

  // Adicionar 10 cartas de valor -1
  for (let i = 0; i < 10; i++) {
    deckArray.push({ value: -1 });
  }

  // Adicionar 15 cartas de valor 0
  for (let i = 0; i < 15; i++) {
    deckArray.push({ value: 0 });
  }

  // Adicionar 10 cartas para cada valor de 1 a 12
  for (let value = 1; value <= 12; value++) {
    for (let i = 0; i < 10; i++) {
      deckArray.push({ value });
    }
  }

  
  return deckArray;
};


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
 
const gameLoop = async () => {
  // Verifica se os jogadores estão definidos e se há pelo menos 2 jogadores
  if (!players.value || players.value.length < 2) {
    console.warn("Não há jogadores suficientes para determinar o primeiro jogador.");
    return; // Sai da função se não houver jogadores suficientes
  }

  // Determina o primeiro jogador
  let firstPlayer = determineFirstPlayer();

  gameStarted = true;
  curruntPlayer.value = firstPlayer;
  

  // Verifica se algum jogador perdeu
  watch(() => players.value.map(player => player.points), (newValues) => {
    const allPlayersPoints = newValues.some(points => points >= 100);
    
    if (allPlayersPoints) {
      playing.value = false;
      console.log("O jogo terminou!");
    }
  });

  shouldWaitForEvent.value = true;

  // Mantém o jogo a correr enquanto a variável "playing" for verdadeira
  while (playing.value) {
    console.log('O jogo está a correr!');
  
    players.value.forEach(player => 
      player.cardsFlipped = 0
    );
    
    
    // Deixa o jogador selecionar uma carta
    await awaitPlayerMove(); 


    // Fazer a troca de jogadores
    if (players.value[curruntPlayer.value].cardsFlipped === 1) {
      curruntPlayer.value = curruntPlayer.value === 0 ? 1 : 0;
      players.value.forEach(player => player.canFlip = false); 
      players.value[curruntPlayer.value].canFlip = true; 
      //console.log('O jogador', curruntPlayer.value + 1, 'passa a ser o atual.');
    }


    if (newRound.value) {
      createNewRound();
      newRound.value = false;
    }

    

  }
  
  
  
};


let round = 0;
const createNewRound = () => {
  // Reseta o estado de cada jogador
  for (let i = 0; i < players.value.length; i++) {
    rounds.value[round][i] = players.value[i].points;
    
    players.value[i].hand = generateHand();   // Gera uma nova mão
    players.value[i].points = 0;              // Reseta pontos
    players.value[i].cardsFlipped = 0;        // Reseta cartas viradas
    players.value[i].allCardsFlipped = false; // Reseta flag de todas cartas viradas
  }
  round++;
  
  addNewRow(); // Adiciona uma nova linha de jogo

  //console.log('Jogador 1: ', players.value[0].cardsFlipped);
  //console.log('Jogador 2: ', players.value[1].cardsFlipped);
  
  // AQUI

  console.log('Jogadores prontos! Iniciando nova rodada...');
};


const updateallCardsFlipped = (playerIndex) => {
  players.value[playerIndex].allCardsFlipped = true;
  //console.log('Todos os jogadores viraram as cartas!', players.value.every(player => player.allCardsFlipped));

  if (players.value.every(player => player.allCardsFlipped)) {
    newRound.value = true;
  }
};









const awaitPlayerMove = () => {
  return new Promise((resolve) => {
    const cards = document.querySelectorAll('.card');
    const onClick = (event) => {
      if (shouldWaitForEvent.value) {
        resolve();
        cards.forEach((card) => card.removeEventListener('click', onClick));
      }
    };

    cards.forEach((card) => card.addEventListener('click', onClick));
  });
};


const selectGameMode = (mode) => {
  gameMode.value = mode;
  initializeGame(); // Chama a função para inicializar o jogo
};


// Função para determinar o primeiro jogador
const determineFirstPlayer = () => {
  if (!players.value || players.value.length < 2) {
    console.warn("Não há jogadores suficientes para determinar o primeiro jogador.");
    return 0; // Retornar um jogador padrão se não houver jogadores
  }

  // O jogador com a maior soma é o primeiro a jogar
  const pointsPlayer1 = players.value[0].points;
  const pointsPlayer2 = players.value[1].points;
  

  if (pointsPlayer1 > pointsPlayer2) {
    return 0;
  }else if (pointsPlayer1 < pointsPlayer2) {
    return 1;
  }else {
    // TODO: Ver as regreas do jogo para desempate
    return Math.floor(Math.random() * 2);
  }


};


// Função para atualizar os pontos de um jogador
function updatePlayerPoints(playerIndex, cardValue) {
  if (curruntPlayer.value !== playerIndex && gameStarted) {
    return;
  }

  players.value[playerIndex].points += cardValue;
}


// Função para selecionar/deselecionar uma carta da mão
function selectCard(playerIndex, cardIndex, event) {
 
  selectedCardIndex = cardIndex;

  if (curruntPlayer.value !== playerIndex && gameStarted) {
    console.log('Não é a vez do jogador', playerIndex + 1);
    return;
  }

  if (players.value[playerIndex].canFlip === false) {
    console.log('O jogador', playerIndex + 1, 'não pode virar cartas agora.');
    return;
  }

  // Aqui verificamos se o jogador está a selecionar uma carta para colocar na mão
  if (isSelectingPosition.value) {
    placeCardInHand(playerIndex, cardIndex);
    players.value[playerIndex].hand[cardIndex].isSelected = true;
    players.value[playerIndex].hand[cardIndex].isFlipped = true;
    drawnCard.value = null;
    return;
  }

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
      @select-card="(cardIndex, event) => selectCard(index, cardIndex, event)"
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
