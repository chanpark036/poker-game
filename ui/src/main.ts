import { createApp } from 'vue'
import { createRouter, createWebHistory } from 'vue-router'
import { BootstrapVue, BootstrapVueIcons } from 'bootstrap-vue'

import 'bootstrap/dist/css/bootstrap.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'

import App from './App.vue'
import Game from './views/Game.vue'

const routes = [
	{
		path: "/game/:roomId/:playerIndex",
		component: Game,
		props (route) {
			return {
				roomId: route.params.roomId,
				playerIndex: route.params.playerIndex
			}
		}
	},
	// {
	// 	path: "/profile/:playerId",
	// 	component: Profile,
	// 	props (route){
			// return{
			// 	playerId: router.params.playerId
			// }
	// 	}
	// }
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
