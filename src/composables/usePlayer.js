import { ref } from 'vue';
import useDeck from './useDeck';
import { useGameStore } from "../stores/game";

export default function usePlayer() {
    const NUMBER_OF_PLAYERS = 2;
    const NUMBER_OF_CARDS = 12;

    const gameStore = useGameStore()

    const { getRandomCard } = useDeck();


    const handCreation = () => {

        for (let i = 0; i < NUMBER_OF_PLAYERS; i++) {
            gameStore.players[i].cards = Array.from({ length: NUMBER_OF_CARDS }, (_, j) => ({
                id: j + 1,
                lin: Math.floor(j / 4),
                col: j % 4,
                number: getRandomCard(),
                isTurned: false,
                isHidden: false,
            }));
        }
    }

    return {
        handCreation
    };

}