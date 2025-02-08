import { ref, computed, inject } from 'vue'
import { defineStore } from 'pinia'

export const useGameStore = defineStore('game', () => {
    const playersReady = ref(false);
    const turn = ref(null);

    const players = ref([
        { name: 'Jogador 1', score: 0, points: 0, cards: [], cardsTurned: 0 },
        { name: 'Jogador 2', score: 0, points: 0, cards: [], cardsTurned: 0 }
    ]);

    return {
        playersReady,
        players,
        turn
    }
})
