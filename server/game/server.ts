import http from "http"
import { Server } from "socket.io"
import { Card, GameState } from "./model"
import { setupMongo } from "./mongo"

async function main() {

const server = http.createServer()
const io = new Server(server)

// const { socketIoAdapter: adapter, getGameState, tryToUpdateGameState } = await setupMongo(newGameState)
// const io = new Server(server, { adapter })
// const io = require("socket.io")(server, {
//   cors: {
//     origin: "http://localhost:8101",
//   },
// });
// io.adapter(adapter);

const port = parseInt(process.env.SERVER_PORT || "8101")

// io.on('connection', client => {
//     function emitGameState() {
//       client.emit(
//         "game-state", 
//         gameState.currentTurnPlayerIndex,
//         gameState.phase,
//         gameState.playCount,
//       )
//     }
    
//     console.log("New client")

//     let playerIndex: number | null | "all" = null

//     client.on('player-index', n => {
//       playerIndex = n
//       console.log("playerIndex set", n)
//       client.join(String(n))
//       if (typeof playerIndex === "number") {
//         client.emit(
//           "all-cards", 
//           filterCardsForPlayerPerspective(Object.values(gameState.cardsById), playerIndex).filter(card => card.locationType !== "unused"),
//         )
//       } else {
//         client.emit(
//           "all-cards", 
//           Object.values(gameState.cardsById),    
//         )
//       }
//       emitGameState()
//     })
  
//     client.on("action", (action: Action) => {
//       if (typeof playerIndex === "number") {
//         const updatedCards = doAction(gameState, { ...action, playerIndex })
//         emitUpdatedCardsForPlayers(updatedCards)
//       } else {
//         // no actions allowed from "all"
//       }
//       io.to("all").emit(
//         "updated-cards", 
//         Object.values(gameState.cardsById),    
//       )
//       io.emit(
//         "game-state", 
//         gameState.currentTurnPlayerIndex,
//         gameState.phase,
//         gameState.playCount,
//         gameState.lessThanTwo
//       )
//     })
  
//     client.on("new-game", () => {
//       gameState = createEmptyGame(gameState.playerNames, config.numDecks, config.rankLimit)
//       gameState.currentTurnPlayerIndex = 0
//       const updatedCards = Object.values(gameState.cardsById)
//       emitUpdatedCardsForPlayers(updatedCards, true)
//       io.to("all").emit(
//         "all-cards", 
//         updatedCards,
//       )
//       io.emit(
//         "game-state", 
//         gameState.currentTurnPlayerIndex,
//         gameState.phase,
//         gameState.playCount,
//       )
//     })
  
//     client.on("get-config", () => {
//       io.emit("get-config-reply", config)
//     })
  
//     client.on("update-config", (newConfig: Config) => {
//       if (typeof newConfig.numDecks === "number" && typeof newConfig.rankLimit === "number" && Object.keys(newConfig).length === 2 
//           && newConfig.rankLimit <= 13 && newConfig.rankLimit > 0 && newConfig.numDecks > 0){
  
//         config = newConfig
        
//         setTimeout(() => {
//           gameState = createEmptyGame(gameState.playerNames, config.numDecks, config.rankLimit);
//           const updatedCards = Object.values(gameState.cardsById)
//           emitUpdatedCardsForPlayers(updatedCards, true)
//           io.to("all").emit(
//             "all-cards", 
//             updatedCards,
//           )
//           io.emit(
//             "game-state", 
//             gameState.currentTurnPlayerIndex,
//             gameState.phase,
//             gameState.playCount,
//           )
//           io.emit("update-config-reply", true);
  
//         }, 2000);
  
//       }
//       else {
//         console.log("type of AHHH",typeof newConfig.numDecks)
//         io.emit("update-config-reply", false)
//       }
//     })
//   })



server.listen(port)
console.log(`Game server listening on port ${port}`)
}

main()