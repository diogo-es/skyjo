import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', () => {
    const playersReady = ref(false);
    const turn = ref(null);
    const winner = ref(null);

    const players = ref([
        { name: 'Diogo', score: 0, points: 0, cards: [], cardsTurned: 0 },
        { name: 'Diana', score: 0, points: 0, cards: [], cardsTurned: 0 }
    ]);

    const scores = computed(() => 
        players.value.map(player => {
          // Soma o valor das cartas viradas
          return player.cards
            .filter(card => card.isTurned && !card.isHidden) 
            .reduce((sum, card) => sum + parseInt(card.number.number), player.score);
        })
    );

    return {
        playersReady,
        players,
        turn,
        winner,
        scores
    }
})
