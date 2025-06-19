import { createRouter, createWebHistory } from 'vue-router'
import mainView from '../views/mainView.vue'
import loginView from '../views/loginView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'main',
      component: mainView,
    },
    {
      path: '/login',
      name: 'login',
      component: loginView,
    },
  ],
})

export default router
