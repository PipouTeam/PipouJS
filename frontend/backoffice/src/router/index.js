import { createRouter, createWebHistory } from 'vue-router'
import { useAuthStore } from '../stores/auth'

const routes = [
  {
    path: '/login',
    name: 'Login',
    component: () => import('../views/LoginView.vue'),
    meta: { guest: true }
  },
  {
    path: '/',
    component: () => import('../views/AdminLayout.vue'),
    meta: { requiresAuth: true, requiresAdmin: true },
    children: [
      {
        path: '',
        name: 'Dashboard',
        component: () => import('../views/DashboardView.vue')
      },
      {
        path: 'users',
        name: 'Users',
        component: () => import('../views/UsersView.vue')
      },
      {
        path: 'resources',
        name: 'Resources',
        component: () => import('../views/ResourcesView.vue')
      },
      {
        path: 'categories',
        name: 'Categories',
        component: () => import('../views/CategoriesView.vue')
      },
      {
        path: 'relation-types',
        name: 'RelationTypes',
        component: () => import('../views/RelationTypesView.vue')
      },
      {
        path: 'resource-types',
        name: 'ResourceTypes',
        component: () => import('../views/ResourceTypesView.vue')
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore()

  if (!authStore.user && authStore.token) {
    await authStore.fetchUser()
  }

  if (to.meta.requiresAuth && !authStore.isAuthenticated) {
    return next('/login')
  }

  if (to.meta.requiresAdmin && !authStore.isAdmin) {
    return next('/')
  }

  if (to.meta.guest && authStore.isAuthenticated) {
    return next('/')
  }

  next()
})

export default router