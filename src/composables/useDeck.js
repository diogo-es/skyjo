import { ref, computed, watch } from 'vue';
import { useToast } from 'vue-toastification';
import { useGameStore } from "../stores/game";
import { nextTick } from "vue";

const deck = ref([]);

export default function useDeck() {
    const toast = useToast();
    const gameStore = useGameStore()

    // deck variables
    const drawnCard = ref(false);           // armazena se a carta foi puxada
    const drawnCardValue = ref(null);       // armazena o valor da carta puxada
    const replaceCard = ref(false);         // armazena se a carta foi substituída

    // discard pile variables
    const discardPile = ref([]);
    const discardCardValue = ref(null);    // armazena o valor da carta descartada
    const chooseDiscardCard = ref(false);  // armazena se a carta descartada foi escolhida
    
    // other variables
    const hasNotReplacedCard = ref(false);


    const initializeDeck = () => {
        const cards = [];
        const cardCounts = {
            '-2': 5, '-1': 10, '0': 15,
            '1': 10, '2': 10, '3': 10,
            '4': 10, '5': 10, '6': 10,
            '7': 10, '8': 10, '9': 10,
            '10': 10, '11': 10, '12': 10
        };

        for (const [value, count] of Object.entries(cardCounts)) {
            for (let i = 0; i < count; i++) {
                cards.push({ id: `${value}-${i}`, number: parseInt(value) });
            }
        }

        deck.value = cards;
        shuffleDeck(); // Mistura o deck
    };
    


    const initializeDiscardPile = () => {
        discardCardValue.value = getCard();
        discardPile.value.push(discardCardValue.value);
    }

    
    const shuffleDeck = () => {
        for (let i = deck.value.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [deck.value[i], deck.value[j]] = [deck.value[j], deck.value[i]];
        }
    };

    const onDeckCardClick = () => { 
        if (!gameStore.playersReady) {
            toast.info('Só é possivel depois de determinado o jogador que vai começar.')
            return
        }

        // Prevent selecting deck if discard pile already chosen
        if (chooseDiscardCard.value) {
            toast.info('Você já escolheu uma carta do descarte. Complete a ação ou passe o turno.')
            return
        }

        // Prevent selecting deck if card action was already taken (keep or discard)
        if (replaceCard.value || hasNotReplacedCard.value) {
            toast.info('Você já escolheu uma ação com a carta anterior. Complete-a selecionando uma carta da mão.')
            return
        }

        if (!drawnCard.value && deck.value.length > 0) {
            drawnCardValue.value = getCard();
            drawnCard.value = true;
        }
    };

    const keepCard = () => {
        replaceCard.value = true;
        drawnCard.value = false;        // reset à variavel, pra voltar a poder tirar uma carta do baralho
        chooseDiscardCard.value = false; // Ensure discard can't be selected after deck choice
    };


    const discardCard = () => {
        discardCardValue.value = drawnCardValue.value;

        discardPile.value.push(discardCardValue.value);
        
        drawnCard.value = false;
        hasNotReplacedCard.value = true;
    };


    const selectDiscardCard = () => {
        if (!gameStore.playersReady) {
            toast.info('Só é possivel depois de determinado o jogador que vai começar.')
            return
        }
        
        // Prevent selecting discard pile if deck already drawn or keep/discard was used
        if (drawnCard.value || replaceCard.value || hasNotReplacedCard.value) {
            toast.info('Você já retirou uma carta do baralho. Complete a ação ou descarte a carta.')
            return
        }
        
        // click listenner da pilha de discarte
        chooseDiscardCard.value = true;
    }


    const getCard = () => {
        return deck.value.length > 0 ? deck.value.pop().number : { value: 'No cards' };
    };


    const getRandomCard = () => {
        
        if (deck.value.length === 0){
            console.error("O deck está vazio ao tentar retirar uma carta.");
            return -99; // Verifica se ainda há cartas no deck
        }

        const randomIndex = Math.floor(Math.random() * deck.value.length);
        const cardValue = deck.value[randomIndex];

        deck.value.splice(randomIndex, 1); // Remove a carta do deck

        return cardValue;
    };

    
    const resetDeck = () => {
        deck.value = [];
    };


    const isDeckEmpty = computed(() => deck.value.length === 0);
    const isDrawnCard = computed(() => drawnCard.value);
    const discardValue = computed(() => discardCardValue.value);


    return {
        deck,
        discardPile,
        discardCardValue,
        initializeDeck,
        getCard,
        drawnCard,
        drawnCardValue,  
        onDeckCardClick,
        isDeckEmpty,
        resetDeck,
        keepCard,
        discardCard,
        replaceCard,
        isDrawnCard,
        hasNotReplacedCard,
        discardValue,
        initializeDiscardPile,
        chooseDiscardCard,
        selectDiscardCard,
        getRandomCard
    };
}
