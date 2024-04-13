import http from "http"
import { Server } from "socket.io"
import { Card, GameState, PlayerId, RoomId, createEmptyGame, CardId, getCardAmt, determineHands, determineWinner, dealCards } from "./model"
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
        io.emit("new-game-state", gameState, cards, roomId)
    })

    socket.on("update-game", async (gameState) => {
        await tryToUpdateGameState(gameState)
        io.emit("game-state", gameState, gameState.roomId)
    })

    socket.on("change-phase", async (gameState) => {

        for( let player of gameState.playerIds) {
            gameState.betsThisPhase[player] = 0
          }

        const cards = await getCards()

        if (gameState.phase == "preflop") {
            console.log("changing to flop")
            const newPhase = "flop"
            const flop = getCardAmt(gameState.deckCards, 3)
            let newGameState = {...gameState, phase: newPhase, communityCards: flop}

            const playerHandStatuses = determineHands(newGameState, cards)
            newGameState = {...newGameState, playerHandStatuses: playerHandStatuses}
            // console.log(newGameState)
            io.emit("game-state", newGameState, newGameState.roomId)
        }

        if (gameState.phase == "flop") {
            // console.log("changing to turn")
            const newPhase = "turn"
            const turn = getCardAmt(gameState.deckCards, 1)
            let newGameState = {...gameState, phase: newPhase, communityCards: gameState.communityCards.concat(turn)}

            const playerHandStatuses = determineHands(newGameState, cards)
            newGameState = {...newGameState, playerHandStatuses: playerHandStatuses}
            // console.log(newGameState)
            io.emit("game-state", newGameState, newGameState.roomId)
        }

        if (gameState.phase == "turn") {
            // console.log("changing to flop")
            const newPhase = "river"
            const river= getCardAmt(gameState.deckCards, 1)
            let newGameState = {...gameState, phase: newPhase, communityCards: gameState.communityCards.concat(river)}
            const playerHandStatuses = determineHands(newGameState, cards)
            newGameState = {...newGameState, playerHandStatuses: playerHandStatuses}
            // console.log(newGameState)
            io.emit("game-state", newGameState, newGameState.roomId)
        }

        if (gameState.phase == "river") {
            // console.log("determine a winner")

            const winnerList: PlayerId[] = determineWinner(gameState, cards)
            console.log(winnerList)
            if (typeof(winnerList) != null) {
                const winningsPerPlayer: number = gameState.potAmount / winnerList.length
                gameState.potAmount = 0
                for (let player of winnerList) {
                    // console.log(gameState.playerStacks)

                    gameState.playerStacks[player] += winningsPerPlayer
                    // console.log(gameState.playerStacks)
                    // console.log("adding " + winningsPerPlayer + " to " + player)
                }
            }

            const newPhase = "preflop"
            const newCards = await getCards()
            const newCardIds: CardId[] = newCards.map((x:Card) => x._id)

            const cardsByPlayer = dealCards(gameState.playerIds, newCardIds)

            const newGameState = {
                ...gameState,
                phase: newPhase, 
                currentTurnPlayerIndex: -1 ,
                playerStacks: gameState.playerStacks,
                potAmount: gameState.potAmount,
                smallBlindIndex: (gameState.smallBlindIndex + 1) % gameState.playerIds.length,
                cardsByPlayer: cardsByPlayer,
                deckCards: newCardIds,
                playerHandStatuses: {},
                communityCards: []
            }
            // console.log(newGameState)
            io.emit("new-game-state", newGameState, newCards, newGameState.roomId)
            io.emit("winners", winnerList)
        }

    })

  })

server.listen(port)
console.log(`Game server listening on port ${port}`)
}

main()