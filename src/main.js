import { createApp } from 'vue'
import './style.css'
import App from './App.vue'
import router from './router'
import { retireLegacyWorker } from './utils/legacyWorker.js'

createApp(App).use(router).mount('#app')
retireLegacyWorker()
