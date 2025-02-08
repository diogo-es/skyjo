import { createApp } from 'vue'
import App from './App.vue'

import Toast from "vue-toastification"
import "vue-toastification/dist/index.css"
import { createPinia } from 'pinia'
import router from './router';


const app = createApp(App);

// Default/Global Toast configuration
app.use(Toast, {
    position: "top-center",
    timeout: 3000,
    closeOnClick: true,
    pauseOnFocusLoss: true,
    pauseOnHover: true,
    draggable: true,
    draggablePercent: 0.6,
    showCloseButtonOnHover: true,
    hideProgressBar: true,
    closeButton: "button",
    icon: true,
    rtl: false
})
app.use(createPinia())
app.use(router);

app.mount('#app');
