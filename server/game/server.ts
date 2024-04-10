import http from "http"
import { Server } from "socket.io"
import { Card, GameState, PlayerId, RoomId, createEmptyGame, CardId } from "./model"
import { setupMongo, getCards, enterNewGameState} from "./mongo"

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



async function createNewGame(roomId: RoomId, playerIds: PlayerId[]){
    const cards: Card[] = await getCards()
    const cardIds: CardId[] = cards.map((x:Card) => x._id)

    const gameState: GameState = createEmptyGame(playerIds, roomId, cardIds)
    enterNewGameState(gameState)
    
}





server.listen(port)
console.log(`Game server listening on port ${port}`)
}

main()