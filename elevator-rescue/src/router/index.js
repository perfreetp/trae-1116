import { createRouter, createWebHistory } from 'vue-router'

const routes = [
  {
    path: '/',
    redirect: '/dashboard'
  },
  {
    path: '/dashboard',
    name: 'Dashboard',
    component: () => import('@/views/Dashboard.vue')
  },
  {
    path: '/alarm',
    name: 'Alarm',
    component: () => import('@/views/Alarm.vue')
  },
  {
    path: '/elevator',
    name: 'Elevator',
    component: () => import('@/views/Elevator.vue')
  },
  {
    path: '/dispatch',
    name: 'Dispatch',
    component: () => import('@/views/Dispatch.vue')
  },
  {
    path: '/track',
    name: 'Track',
    component: () => import('@/views/Track.vue')
  },
  {
    path: '/collaboration',
    name: 'Collaboration',
    component: () => import('@/views/Collaboration.vue')
  },
  {
    path: '/maintenance',
    name: 'Maintenance',
    component: () => import('@/views/Maintenance.vue')
  },
  {
    path: '/complaint',
    name: 'Complaint',
    component: () => import('@/views/Complaint.vue')
  },
  {
    path: '/statistics',
    name: 'Statistics',
    component: () => import('@/views/Statistics.vue')
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
