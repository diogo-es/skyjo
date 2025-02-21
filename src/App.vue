<script setup>
</script>

<template>
  
  
  <router-view />
  
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
  width: 100%;
  box-sizing: border-box;

  overflow: hidden; /* Adicionado para evitar a barra de rolagem */
}

#app {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  width: 100%;
  height: 100%;
  background-color: #f4f4f4;
  text-align: center;
  box-sizing: border-box;
}

h1 {
  margin-bottom: 20px;
  color: #34495e;
  width: 100%;
  text-align: center;
}

router-view {
  width: 100%;
  height: 100%;
}
</style>
