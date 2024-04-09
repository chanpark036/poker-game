import { MongoClient, ObjectId } from "mongodb"
import { createAdapter } from "@socket.io/mongo-adapter"
import { GameState} from "./model"

export const DB = "game"
export const GAMES_COLLECTION = "games"
export const URL = "mongodb://127.0.0.1:27017"

const SOCKET_IO_EVENTS_COLLECTION = "socket.io-adapter-events"
const GAME_STATE_ID = new ObjectId("000000000000000000000000")

export interface MongoGameState extends GameState {
	_id: ObjectId
	version: number
}

export async function setupMongo(newGameState: GameState) {
	const mongoClient = new MongoClient(process.env.MONGO_URL || URL)
	// const mongoClient = new MongoClient(process.env.MONGO_URL || "mongodb://localhost")
	await mongoClient.connect()
	
	// try {
	// 	await mongoClient.db(DB).createCollection(SOCKET_IO_EVENTS_COLLECTION, {
	// 		capped: true,
	// 		size: 1e6
	// 	})
	// } catch (e) {
	// 	// collection already exists; ignore
	// }

	const db = mongoClient.db(DB)
	const socketIoEventsCollection = db.collection(SOCKET_IO_EVENTS_COLLECTION)
	const gamesCollection = db.collection(GAMES_COLLECTION)
	try {
		await gamesCollection.insertOne({ _id: GAME_STATE_ID, version: 0, ...newGameState })
	} catch (e) {
		// ignore
	}

	return {
		// socketIoEventsCollection,
		gamesCollection,
		socketIoAdapter: createAdapter(socketIoEventsCollection),
		getGameState: async () => {
			return await gamesCollection.findOne({ _id: GAME_STATE_ID }) as unknown as MongoGameState
		},
		tryToUpdateGameState: async (newGameState: MongoGameState) => {
			const result = await gamesCollection.replaceOne(
				{ _id: GAME_STATE_ID, version: newGameState.version },
				{ ...newGameState, version: newGameState.version + 1 },
			)
			if (result.modifiedCount > 0) {
				++newGameState.version
				return true
			} else {
				return false
			}
		},
	}
}