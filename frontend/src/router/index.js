// src/router/index.js
import { createRouter, createWebHistory } from 'vue-router'
import Login from '../views/Login.vue'
import Cadastro from '../views/Cadastro.vue'
import Agendamento from '../views/Agendamento.vue'
import MeusAgendamentos from '../views/MeusAgendamentos.vue'
import Painel from '../views/Painel.vue'

const routes = [
  { path: '/', redirect: '/login' },
  { path: '/login', component: Login, meta: { publica: true } },
  { path: '/cadastro', component: Cadastro, meta: { publica: true } },
  { path: '/agendamento', component: Agendamento, meta: { requerAuth: true } },
  { path: '/meus-agendamentos', component: MeusAgendamentos, meta: { requerAuth: true } },
  { path: '/painel', component: Painel, meta: { requerAuth: true, admin: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})

router.beforeEach((to, _from, next) => {
  const token = localStorage.getItem('token')
  const usuario = JSON.parse(localStorage.getItem('usuario') || 'null')

  if (to.meta.requerAuth && !token) return next('/login')
  if (to.meta.admin && usuario?.perfil === 'paciente') return next('/meus-agendamentos')
  next()
})

export default router
