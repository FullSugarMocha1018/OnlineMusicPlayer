import { createRouter, createWebHistory } from 'vue-router';

// auth模块
import Login from '@/views/auth/Login.vue';
import Register from '@/views/auth/Register.vue';

// user模块
import UserDashboard from '@/views/user/Dashboard.vue';
import UserProfile from '@/views/user/Profile.vue';
import UserVehicles from '@/views/user/Vehicles.vue';
import RepairOrders from '@/views/user/RepairOrders.vue';
import RepairOrderDetail from '@/views/user/RepairOrderDetail.vue';
import CreateOrder from '@/views/user/CreateOrder.vue';
import RepairHistory from '@/views/user/RepairHistory.vue';

// mechanic模块
import MechanicDashboard from '@/views/mechanic/Dashboard.vue';
import MechanicProfile from '@/views/mechanic/Profile.vue';
import MechanicRepairOrders from '@/views/mechanic/RepairOrders.vue';
import MechanicRepairOrderDetail from '@/views/mechanic/RepairOrderDetail.vue';
import MechanicRepairHistory from '@/views/mechanic/RepairHistory.vue';

// admin模块
import AdminDashboard from '@/views/admin/Dashboard.vue';
import UserManagement from '@/views/admin/UserManagement.vue';
import MechanicManagement from '@/views/admin/MechanicManagement.vue';
import VehicleManagement from '@/views/admin/VehicleManagement.vue';
import RepairOrderManagement from '@/views/admin/RepairOrderManagement.vue';
import Statistics from '@/views/admin/Statistics.vue';

const routes = [

  // auth模块
  {
    path: '/',
    redirect: '/login'
  },
  {
    path: '/login',
    name: 'Login',
    component: Login
  },
  {
    path: '/register',
    name: 'Register',
    component: Register
  },

  // user模块
  {
    path: '/user/dashboard',
    name: 'UserDashboard',
    component: UserDashboard,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/profile',
    name: 'UserProfile',
    component: UserProfile,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/vehicles',
    name: 'UserVehicles',
    component: UserVehicles,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/repair-orders',
    name: 'RepairOrders',
    component: RepairOrders,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/repair-orders/:id',
    name: 'RepairOrderDetail',
    component: RepairOrderDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/create-order',
    name: 'CreateOrder',
    component: CreateOrder,
    meta: { requiresAuth: true }
  },
    {
    path: '/user/repair-orders/:id',
    name: 'RepairOrderDetail',
    component: RepairOrderDetail,
    meta: { requiresAuth: true }
  },
  {
    path: '/user/repair-history',
    name: 'RepairHistory',
    component: RepairHistory,
    meta: { requiresAuth: true }
  },

  // mechanic模块
  {
    path: '/mechanic/dashboard',
    name: 'MechanicDashboard',
    component: MechanicDashboard,
    meta: { requiresAuth: true, role: 'MECHANIC' }
  },
  {
    path: '/mechanic/profile',
    name: 'MechanicProfile',
    component: MechanicProfile,
    meta: { requiresAuth: true, role: 'MECHANIC' }
  },
  {
    path: '/mechanic/repair-orders',
    name: 'MechanicRepairOrders',
    component: MechanicRepairOrders,
    meta: { requiresAuth: true, role: 'MECHANIC' }
  },
  {
    path: '/mechanic/repair-orders/:id',
    name: 'MechanicRepairOrderDetail',
    component: MechanicRepairOrderDetail,
    meta: { requiresAuth: true, role: 'MECHANIC' }
  },
  {
    path: '/mechanic/history',
    name: 'MechanicRepairHistory',
    component: MechanicRepairHistory,
    meta: { requiresAuth: true, role: 'MECHANIC' }
  },

  // admin模块
  {
    path: '/admin/dashboard',
    name: 'AdminDashboard',
    component: AdminDashboard,
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  {
    path: '/admin/users',
    name: 'UserManagement',
    component: UserManagement,
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  {
    path: '/admin/mechanics',
    name: 'MechanicManagement',
    component: MechanicManagement,
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  {
    path: '/admin/vehicles',
    name: 'VehicleManagement',
    component: VehicleManagement,
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  {
    path: '/admin/repair-orders',
    name: 'RepairOrderManagement',
    component: RepairOrderManagement,
    meta: { requiresAuth: true, role: 'ADMIN' }
  },
  {
    path: '/admin/statistics',
    name: 'Statistics',
    component: Statistics,
    meta: { requiresAuth: true, role: 'ADMIN' }
  },

];

const router = createRouter({
  history: createWebHistory(process.env.BASE_URL),
  routes
});

export default router;
