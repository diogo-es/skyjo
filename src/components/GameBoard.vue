<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import Player from '@/components/Player.vue';
import Deck from '@/components/Deck.vue';
import DiscardPile from '@/components/DiscardPile.vue';

import useDeck from '@/composables/useDeck';
import usePlayer from '@/composables/usePlayer';

import { useGameStore } from "@/stores/game";

import { useToast } from 'vue-toastification';
import { useRouter } from 'vue-router';



const MAX_SCORE = 100; // Cumulative score threshold - game ends when a player reaches this

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
const drawnCard = ref(null);

let lastPlay = false;
let firstPlayer = null;


const twoCardsTurned = () => {
  if (gameStore.players.every(player => player.cardsTurned === 2)) {
    gameStore.playersReady = true;
  }
  return gameStore.playersReady;
}


const everyCardTurned = computed(() =>
  gameStore.players.map(player => player.cards.filter(card => card.isTurned && !card.isHidden))
);

const allCardsTurned = () => {
  return gameStore.players.some(player => player.cards.every(card => card.isTurned));
}



const onCardClick = (playerIndex, cardIndex, event) => {
  
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
  gameStore.players.forEach(player => {
    player.cardsTurned = 0;
    player.points = 0;
    player.roundScore = 0;

    player.cards.forEach(card => card.isTurned = false);
    player.cards.forEach(card => card.isHidden = false);
  });

  gameStore.playersReady = false;
  gameStore.turn = null;
  lastPlay = false;
  
  // Move to next round
  gameStore.currentRound++;
}


const determineWinner = () => {
  const cumulativeScores = gameStore.players.map(p => p.cumulativeScore);
  const minScore = Math.min(...cumulativeScores);
  
  console.log("Cumulative Scores:", cumulativeScores);
  console.log("Winner Score:", minScore);

  gameStore.winner = gameStore.players.find(player => player.cumulativeScore === minScore);
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
  
  allCardsTurned.forEach((cards, playerIndex) => {
    const sameColumn = cards.filter(card => 
      cards.some(c => c.col === card.col && c.number.number === card.number.number && c.id !== card.id)
    );
    
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
    // Update cumulative scores for this round
    gameStore.updateCumulativeScores();
    
    // Check if any player reached MAX_SCORE
    if (gameStore.players.some(player => player.cumulativeScore >= MAX_SCORE)) {
      // Game ends
      toast.info(`Fim da ronda ${gameStore.currentRound}. Fim de jogo!`);
      hasGameEnded.value = true;
    } else {
      // Continue to next round
      toast.info(`Fim da ronda ${gameStore.currentRound}. Próxima ronda começará em breve...`);
      
      // Find players who have finished (all cards turned)
      const finishedPlayers = gameStore.players.filter(player => 
        player.cards.every(card => card.isTurned)
      );
      
      // For players who haven't finished, turn their remaining face-down cards
      gameStore.players.forEach(player => {
        // Skip if this player has finished
        if (finishedPlayers.includes(player)) {
          return;
        }
        
        // Turn remaining face-down cards
        player.cards.forEach(card => {
          if (!card.isTurned && !card.isHidden) {
            card.isTurned = true;
          }
        });
      });
      
      setTimeout(() => {
        resetGame();
        initializeDeck();
        initializeDiscardPile();
        handCreation();
      }, 5000);
    }
  }
});


// Monitoriza o fim do jogo
watch(hasGameEnded, (gameOver) => {
  if (gameOver) {
    determineWinner();
    setTimeout(() => {
      router.push('/results');
    }, 5000);
  }
});



onMounted(() => {
  console.log(`Starting Round: ${gameStore.currentRound}`);

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
      @select-card="(cardIndex, event) => onCardClick(index, cardIndex, event)"
    />
  </div>
</template>

<style>
  .game-board {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 100%;
    height: 100vh;
    padding: 20px;
    gap: 40px;
    box-sizing: border-box;
  }
</style>
