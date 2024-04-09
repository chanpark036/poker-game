import http from "http"
import { Server } from "socket.io"
import { Card, GameState, getEmptyGameState } from "./model"
import { setupMongo } from "./mongo"

async function main() {

const server = http.createServer()
const { socketIoAdapter: adapter, getGameState, tryToUpdateGameState } = await setupMongo(newGameState)
// const { socketIoAdapter: adapter } = await setupRedis()
const io = new Server(server, { adapter })
// const io = require("socket.io")(server, {
//   cors: {
//     origin: "http://localhost:8101",
//   },
// });
// io.adapter(adapter);

const port = parseInt(process.env.SERVER_PORT || "8101")





server.listen(port)
console.log(`Game server listening on port ${port}`)
}

main()