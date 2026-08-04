// 어플리케이션 동작하기 위해 초기화하는 작업은 main.js에서 진행
import './assets/main.css'

// Router 등록하기
import { createApp } from 'vue'
import { createPinia } from 'pinia'

import App from './App.vue'
import router from './router' // 아무것도 안 써져 있으면 index.js를 자동으로 찾아서 가져옴
import ElementPlus from 'element-plus'
import 'element-plus/dist/index.css'

const app = createApp(App)

app.use(createPinia())
app.use(router)
app.use(ElementPlus)

app.mount('#app')
