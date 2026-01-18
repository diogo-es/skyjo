import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', () => {
    const playersReady = ref(false);
    const turn = ref(null);
    const winner = ref(null);
    const currentRound = ref(1);

    const players = ref([
        { name: 'Diogo', cumulativeScore: 0, roundScore: 0, points: 0, cards: [], cardsTurned: 0 },
        { name: 'Diana', cumulativeScore: 0, roundScore: 0, points: 0, cards: [], cardsTurned: 0 }
    ]);

    // Current round score (visible cards sum)
    const scores = computed(() => 
        players.value.map(player => {
          return player.cards
            .filter(card => card.isTurned && !card.isHidden) 
            .reduce((sum, card) => sum + parseInt(card.number.number), 0);
        })
    );

    // Update cumulative scores at end of round
    const updateCumulativeScores = () => {
        players.value.forEach((player, index) => {
            player.roundScore = scores.value[index];
            player.cumulativeScore += player.roundScore;
        });
    };

    return {
        playersReady,
        players,
        turn,
        winner,
        scores,
        currentRound,
        updateCumulativeScores
    }
})
