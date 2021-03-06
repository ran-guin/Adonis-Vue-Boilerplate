import Vue from 'vue'
import Router from 'vue-router'

import Login from '@/default/pages/Login.vue'
import Data from '@/default/pages/Data.vue'
import Construction from '@/default/pages/Construction.vue'

// Customized pages:
import Home from '@/default/pages/Home.vue'
import Public from '@/default/pages/Public.vue'
import Contact from '@/default/pages/ContactUs.vue'
import Dashboard from '@/default/pages/Dashboard.vue'
import Admin from '@/default/pages/Admin.vue'
import Profile from '@/default/pages/Profile.vue'

Vue.use(Router)

export default new Router({
  // mode: 'history',
  // base: process.env.BASE_URL,
  routes: [
    {
      path: '/',
      name: 'default',
      component: Public
    },
    {
      path: '/home',
      name: 'home',
      component: Home
    },
    {
      path: '/Login',
      name: 'Login',
      component: Login,
      props: {
        page: 'Login'
      }
    },
    {
      path: '/Logout',
      name: 'Logout',
      component: Login,
      props: {
        page: 'Logout'
      }
    },
    {
      path: '/SignUp',
      name: 'SignUp',
      component: Login,
      props: {
        page: 'SignUp'
      },
    },
    {
      path: '/Register',
      name: 'Register',
      component: Login,
      props: {
        page: 'SignUp'
      }
    },
    {
      path: '/Recover',
      name: 'Recover',
      component: Login,
      props: {
        page: 'Recover'
      }
    },
    {
      path: '/Public',
      name: 'Public',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: Public
    },
    {
      path: '/About',
      name: 'About',
      // route level code-splitting
      // this generates a separate chunk (about.[hash].js) for this route
      // which is lazy-loaded when the route is visited.
      component: () => import('@/default/pages/About.vue')
    },
    {
      path: '/data',
      name: 'data',
      component: Data
    },
    {
      path: '/contact',
      name: 'contact',
      component: Contact
    },
    {
      path: '/dashboard',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/admin',
      name: 'admin',
      component: Admin
    },
    {
      path: '/profile',
      name: 'profile',
      component: Profile
    },
    {
      path: '/construction',
      name: 'construction',
      component: Construction
    }
  ]
})
