import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '@/stores/auth'

import LoginView from '@/views/LoginView.vue'
// Usamos Lazy Loading para el resto para mejorar rendimiento
const ProductsView = () => import('@/views/ProductsView.vue')
const InventoryView = () => import('@/views/InventoryView.vue')

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', redirect: '/login' },
    { path: '/login', name: 'login', component: LoginView },
    {
      path: '/productos',
      name: 'products',
      component: ProductsView,
      meta: { requiresAuth: true }, // Esta ruta está protegida
    },
    {
      path: '/inventario',
      name: 'inventory',
      component: InventoryView,
      meta: { requiresAuth: true }, // Esta ruta está protegida
    },
    {
      path: '/registro',
      name: 'register',
      component: () => import('@/views/auth/RegisterView.vue'),
    },
  ],
})

// Guard de navegación global
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()

  if (to.meta.requiresAuth && !authStore.token) {
    next('/login')
  } else {
    next()
  }
})

export default router
