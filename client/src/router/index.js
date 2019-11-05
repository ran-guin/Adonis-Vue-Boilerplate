import Vue from 'vue'
import Router from 'vue-router'
import Home from './pages/Home.vue'
import Data from './pages/Data.vue'
import Public from './pages/Public.vue'
import Login from './pages/Login.vue'
import Contact from './pages/ContactUs.vue'
import Admin from './pages/Admin.vue'
import Construction from './pages/Construction.vue'

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
      name: 'Login',
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
      component: () => import('./pages/About.vue')
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
      path: '/admin',
      name: 'admin',
      component: Admin
    },
    {
      path: '/construction',
      name: 'construction',
      component: Construction
    }
  ]
})
