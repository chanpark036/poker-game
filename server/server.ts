import http from "http"
import { Server } from "socket.io"
import { Action, createEmptyGame, doAction, filterCardsForPlayerPerspective, Card, Config } from "./model"

const server = http.createServer()
const io = new Server(server)
const port = 8101

let gameState = createEmptyGame(["player1", "player2"], 1, 13)

function emitUpdatedCardsForPlayers(cards: Card[], newGame = false) {
  gameState.playerNames.forEach((_, i) => {
    let updatedCardsFromPlayerPerspective = filterCardsForPlayerPerspective(cards, i)
    if (newGame) {
      updatedCardsFromPlayerPerspective = updatedCardsFromPlayerPerspective.filter(card => card.locationType !== "unused")
    }
    console.log("emitting update for player", i, ":", updatedCardsFromPlayerPerspective)
    io.to(String(i)).emit(
      newGame ? "all-cards" : "updated-cards", 
      updatedCardsFromPlayerPerspective,
    )
  })
}

io.on('connection', client => {
  function emitGameState() {
    client.emit(
      "game-state", 
      gameState.currentTurnPlayerIndex,
      gameState.phase,
      gameState.playCount,
      gameState.winningPlayers,
      gameState.lastPlayed,
      gameState.config
    )
  }
  
  console.log("New client")
  let playerIndex: number | null | "all" = null
  client.on('player-index', n => {
    playerIndex = n
    console.log("playerIndex set", n)
    client.join(String(n))
    if (typeof playerIndex === "number") {
      client.emit(
        "all-cards", 
        filterCardsForPlayerPerspective(Object.values(gameState.cardsById), playerIndex).filter(card => card.locationType !== "unused"),
      )
    } else {
      client.emit(
        "all-cards", 
        Object.values(gameState.cardsById),    
      )
    }
    emitGameState()
  })

  client.on("action", (action: Action) => {
    if (typeof playerIndex === "number") {
      const updatedCards = doAction(gameState, { ...action, playerIndex })
      emitUpdatedCardsForPlayers(updatedCards)
    } else {
      // no actions allowed from "all"
    }
    io.to("all").emit(
      "updated-cards", 
      Object.values(gameState.cardsById),    
    )
    io.emit(
      "game-state", 
      gameState.currentTurnPlayerIndex,
      gameState.phase,
      gameState.playCount,
      gameState.winningPlayers,
      gameState.lastPlayed
    )
  })

  client.on("new-game", () => {
    const config: Config = gameState.config
    gameState = createEmptyGame(["player1", "player2"], config.numDecks, config.numRanks)
    const updatedCards = Object.values(gameState.cardsById)
    emitUpdatedCardsForPlayers(updatedCards, true)
    io.to("all").emit(
      "all-cards", 
      updatedCards,
    )
    io.emit(
      "game-state", 
      gameState.currentTurnPlayerIndex,
      gameState.phase,
      gameState.playCount,
    )
    emitGameState()
  })

  client.on("get-config",() => {
    io.emit("get-config-reply",gameState.config)
  })

  client.on("update-config", (newConfig) =>{
    let updateConfigReturn: boolean = false
    if(typeof newConfig === "object"){
      if(Object.keys(newConfig).length === 2 && typeof newConfig.numDecks === "number" 
      && typeof newConfig.numRanks === "number" && newConfig.numDecks >= 0 && 
      newConfig.numRanks >= 0 && newConfig.numRanks <= 13){
        updateConfigReturn = true
        gameState.config = {numDecks: newConfig.numDecks, numRanks: newConfig.numRanks}
      }
    }
    setTimeout(() => io.emit("update-config-reply", updateConfigReturn), 2000);
    // if(updateConfigReturn){
    //   io.emit("new-game")
    // }
  })


})
server.listen(port)
console.log(`Game server listening on port ${port}`)
