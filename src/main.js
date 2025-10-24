import { createApp } from 'vue'
import { createPinia } from 'pinia'
import router from './router'
import App from './App.vue'
import './styles/tailwind.css'
import './styles/main.styl'

// 添加Buffer polyfill for ethereumjs-util
import { Buffer } from 'buffer'
globalThis.Buffer = Buffer

// 添加process polyfill for ethereumjs-util
globalThis.process = globalThis.process || {
  env: {},
  version: '',
  versions: {},
  nextTick: (fn) => setTimeout(fn, 0),
  browser: true
}

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
