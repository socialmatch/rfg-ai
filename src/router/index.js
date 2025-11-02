import { createRouter, createWebHistory } from 'vue-router'
import Home from '@/views/Home.vue'
import WalletTest from '@/views/WalletTest.vue'
import Leaderboard from '@/views/Leaderboard.vue'
import Models from '@/views/Models.vue'
import ModelDetail from '@/views/ModelDetail.vue'
import About from '@/views/About.vue'

const routes = [
  {
    path: '/',
    name: 'home',
    component: Home
  },
  {
    path: '/leaderboard',
    name: 'leaderboard',
    component: Leaderboard
  },
  {
    path: '/models',
    name: 'models',
    component: Models
  },
  {
    path: '/models/:slug',
    name: 'model-detail',
    component: ModelDetail
  },
  {
    path: '/wallet-test',
    name: 'wallet-test',
    component: WalletTest
  },
  {
    path: '/about',
    name: 'about',
    component: About
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
