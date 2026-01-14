import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from './stores/auth'

const routes = [
  {
    path: '/',
    name: 'Dashboard',
    component: () => import('./views/Dashboard.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/login',
    name: 'Login',
    component: () => import('./views/Login.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/register',
    name: 'Register',
    component: () => import('./views/Register.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/verify',
    name: 'Verify',
    component: () => import('./views/Verify.vue'),
    meta: { requiresGuest: true }
  },
  {
    path: '/products',
    name: 'Products',
    component: () => import('./views/Products.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/inventory',
    name: 'Inventory',
    component: () => import('./views/Inventory.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  {
    path: '/admin',
    name: 'Admin',
    component: () => import('./views/Admin.vue'),
    meta: { requiresAuth: true, requiresAdmin: true }
  },
  // Vistas para usuarios finales
  {
    path: '/catalog',
    name: 'ProductCatalog',
    component: () => import('./views/ProductCatalog.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/products/:id',
    name: 'ProductDetail',
    component: () => import('./views/ProductDetail.vue'),
    meta: { requiresAuth: true }
  },
  {
    path: '/cart',
    name: 'ShoppingCart',
    component: () => import('./views/ShoppingCart.vue'),
    meta: { requiresAuth: true, restrictedToCustomers: true }
  },
  {
    path: '/user',
    name: 'User',
    component: () => import('./views/user.vue'),
    meta: { requiresAuth: true }
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach((to, from, next) => {
  const authStore = useAuthStore()
  const isAuthenticated = authStore.isAuthenticated
  const user = authStore.user

  // Si la ruta requiere autenticación y el usuario no está autenticado
  if (to.meta.requiresAuth && !isAuthenticated) {
    next('/login')
  } 
  // Si el usuario está autenticado pero intenta acceder a rutas de invitado
  else if (to.meta.requiresGuest && isAuthenticated) {
    // Redirigir según el rol
    if (user?.role?.name === 'admin') {
      next('/')
    } else {
      next('/catalog')
    }
  } 
  // Si la ruta requiere ser administrador
  else if (to.meta.requiresAdmin && user?.role?.name !== 'admin') {
    next('/catalog')
  } 
  // Si es la ruta raíz y el usuario está autenticado
  else if (to.path === '/' && isAuthenticated) {
    if (user?.role?.name === 'admin') {
      next('/admin')
    } else {
      next('/catalog')
    }
  } 
  // Para cualquier otro caso
  else {
    next()
  }
})

export default router