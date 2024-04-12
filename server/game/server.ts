import http from "http"
import { Server } from "socket.io"
import { Card, GameState, PlayerId, RoomId, createEmptyGame, CardId, getCardAmt } from "./model"
import { setupMongo, getCards, enterNewGameState, tryToUpdateGameState, getGameState} from "./mongo"

async function main() {

const server = http.createServer()
const { socketIoAdapter: adapter } = await setupMongo()
const io = new Server(server, { adapter })
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
const waitingPlayers: Record<RoomId, PlayerId[]> = {}
io.on("connection", function(socket){
    
    socket.on("create-room", (roomId: RoomId)=>{
        socket.join(roomId);
        // console.log("room " + roomId + "created by player")
        // console.log("socket id is " + socket.id)
    })

    socket.on("join-room", (roomId: RoomId, playerId: PlayerId)=>{
        // socket.join(roomId);
        if (waitingPlayers[roomId]){
            waitingPlayers[roomId].push(playerId)
        }
        else {
            waitingPlayers[roomId] = [playerId]
        }
        // console.log("room " + roomId + " joined by player " + playerId)
        // console.log("socket id is " + socket.id)
        // console.log(waitingPlayers[roomId])
        io.emit("player-joined", roomId, waitingPlayers[roomId])
    })

    socket.on("refresh", (roomId) => {
        // console.log(waitingPlayers[roomId])
        io.emit("player-joined", roomId, waitingPlayers[roomId])
    })

    socket.on("start-game", async (roomId: RoomId) => {
        // console.log("start-game received")
        const cards: Card[] = await getCards()
        const cardIds: CardId[] = cards.map((x:Card) => x._id)
    
        const gameState: GameState = createEmptyGame(waitingPlayers[roomId], roomId, cardIds)
        await tryToUpdateGameState(gameState)
        io.emit("game-started", roomId)
    })
    
    socket.on("get-new-game-state", async (roomId) => {
        const cards = await getCards()
        const cardIds: CardId[] = cards.map((x:Card) => x._id) 
        const gameState: GameState = createEmptyGame(waitingPlayers[roomId], roomId, cardIds)        

        // console.log(cards[0])
        socket.emit("new-game-state", gameState, cards, roomId)
    })

    socket.on("update-game", async (gameState) => {
        await tryToUpdateGameState(gameState)
        io.emit("game-state", gameState, gameState.roomId)
    })

    socket.on("change-phase", (gameState) => {
        if (gameState.phase == "preflop") {
            console.log("changing to flop")
            const newPhase = "flop"
            const flop = getCardAmt(gameState.deckCards, 3)
            const newGameState = {...gameState, phase: newPhase, communityCards: flop}
            console.log(newGameState)
            io.emit("game-state", newGameState, newGameState.roomId)
        }

    })

  })

server.listen(port)
console.log(`Game server listening on port ${port}`)
}

main()