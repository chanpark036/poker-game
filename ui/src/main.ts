import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue'
import Game from './views/Game.vue'
import Home from './views/Home.vue'
import Waiting from './views/Waiting.vue'
import Profile from './views/Profile.vue'
import Admin from './views/Admin.vue'

const routes = [
	{
		path: "/game/:roomId/:playerId",
		component: Game,
		props (route) {
			return {
				roomId: route.params.roomId,
				playerId: route.params.playerId
			}
		}
	},

	{
		path: "/:roomId/:playerId",
		component: Waiting,
		props (route) {
			return {
				roomId: route.params.roomId,
				playerId: route.params.playerId
			}
		}
	},

	{
		path: "/",
		component: Home,
	},

	{
		path: "/profile",
		component: Profile
	},

	{
		path: "/admin",
		component: Admin
	}
	
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

createApp(App)
	.use(BootstrapVue)
	.use(BootstrapVueIcons)
	.use(router)
	.mount('#app')
