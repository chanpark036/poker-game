import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue'
import Game from './views/Game.vue'
import Home from './views/Home.vue'
import Waiting from './views/Waiting.vue'

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
		path: "/game/:roomId",
		component: Waiting,
		props (route) {
			return {
				roomId: route.params.roomId
			}
		}
	},

	{
		path: "/",
		component: Home,
	},
	
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
