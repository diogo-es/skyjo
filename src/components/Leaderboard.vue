<script setup>
    import { useGameStore } from "@/stores/game";
    const gameStore = useGameStore()
</script>

<template>
    <div class="resultsContainer">
        <h1 class="title">🏆 Resultado do Jogo 🏆</h1>

        <div class="players">
            <div id="playerOne" class="player winner">
                <h4 v-if="gameStore.players[0].name == gameStore.winner.name">Vencedor 🎉</h4>
                <h3> {{ gameStore.players[0].name }} </h3>
                <h2> {{ gameStore.scores[0] }} Pontos</h2>
            </div>

            <div id="playerTwo" class="player">
                <h4 v-if="gameStore.players[1].name == gameStore.winner.name">Vencedor 🎉</h4>
                <h3> {{ gameStore.players[1].name }} </h3>
                <h2> {{ gameStore.scores[1] }} Pontos</h2>
            </div>
        </div>
    </div>
</template>

<style scoped>
    /* Estilos gerais */
    .resultsContainer {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        height: 100vh; /* Garante que ocupa toda a tela */
        width: 100vw;
        background-color: #1e1e2f;
        color: white;
        font-family: Arial, sans-serif;
        padding: 20px;
        box-sizing: border-box;
    }


    .title {
        font-size: 3rem;
        margin-bottom: 30px;
    }

    .players {
        display: flex;
        justify-content: space-evenly;
        align-items: center;
        width: 90%;
        height: 60%; /* Faz os cartões crescerem */
    }

    .player {
        background-color: #2c2c3e;
        width: 45%; /* Ocupa quase metade da largura */
        height: 100%; /* Ocupa toda a altura da seção */
        color: white;
        border-radius: 15px;
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        text-align: center;
        box-shadow: 0px 4px 10px rgba(0, 0, 0, 0.3);
        transition: transform 0.3s ease-in-out;
    }

    .player:hover {
        transform: scale(1.05);
    }

    .winner {
        background-color: #007bff;
        box-shadow: 0px 4px 15px rgba(0, 123, 255, 0.5);
    }

    h4 {
        font-size: 2rem;
        margin-bottom: 10px;
    }

    h3 {
        font-size: 2.2rem;
        margin-bottom: 10px;
    }

    h2 {
        font-size: 3rem;
        font-weight: bold;
    }
</style>
