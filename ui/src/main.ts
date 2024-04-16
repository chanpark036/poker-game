import { createApp } from 'vue'
import { createRouter, createWebHistory, RouteLocationNormalized } from 'vue-router'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue'
import Game from './views/Game.vue'
import Home from './views/Home.vue'
import Waiting from './views/Waiting.vue'
import Profile from './views/Profile.vue'

const routes = [
	{
		path: "/game/:roomId/:playerId",
		component: Game,
		props: (route: RouteLocationNormalized) => ({ 
		roomId: route.params.roomId,
		playerId: route.params.playerId
		})
	},

	{
		path: "/:roomId/:playerId",
		component: Waiting,
		props: (route: RouteLocationNormalized) => ({ 
			roomId: route.params.roomId,
			playerId: route.params.playerId
			})
	},

	{
		path: "/",
		component: Home,
	},

	{
		path: "/profile",
		component: Profile
	}
	
]

const router = createRouter({
	history: createWebHistory(),
	routes,
})

createApp(App)
	.use(router)
	.use(BootstrapVue as any)
	.use(BootstrapVueIcons as any)
	.mount('#app')