import { MongoClient, ObjectId } from "mongodb"
import { createAdapter } from "@socket.io/mongo-adapter"
import { GameState, RoomId, Card} from "./model"

export const DB = "game"
export const GAMES_COLLECTION = "games"
export const URL = "mongodb://127.0.0.1:27017"

const SOCKET_IO_EVENTS_COLLECTION = "socket.io-adapter-events"
// const GAME_STATE_ID = new ObjectId("000000000000000000000000")

const mongoClient = new MongoClient(process.env.MONGO_URL || URL)
await mongoClient.connect()
const db = mongoClient.db(DB)

export interface MongoGameState extends GameState {
	_id: ObjectId
	version: number
}

export async function setupMongo() {
	// const mongoClient = new MongoClient(process.env.MONGO_URL || "mongodb://localhost")
	
	try {
		await mongoClient.db(DB).createCollection(SOCKET_IO_EVENTS_COLLECTION, {
			capped: true,
			size: 1e6
		})
	} catch (e) {
		// collection already exists; ignore
	}
	const socketIoEventsCollection = db.collection(SOCKET_IO_EVENTS_COLLECTION)
	// const gamesCollection = db.collection(GAMES_COLLECTION)
	// try {
	// 	await gamesCollection.insertOne({ _id: GAME_STATE_ID, version: 0, ...newGameState })
	// } catch (e) {
	// 	// ignore
	// }

	return {
		socketIoAdapter: createAdapter(socketIoEventsCollection),
	}
}


export async function enterNewGameState(gameState: GameState){
	const gamesCollection = db.collection(GAMES_COLLECTION)
	try {
		await gamesCollection.insertOne({ _id: gameState.roomId, ...gameState })
	} catch (e) {
		// ignore
	}
}

export async function getGameState(gameStateId: RoomId) {
	const gamesCollection = db.collection(GAMES_COLLECTION)
	return await gamesCollection.findOne({ _id: gameStateId }) as unknown as MongoGameState
}


export async function tryToUpdateGameState(newGameState: GameState){
	const gamesCollection = db.collection(GAMES_COLLECTION)
	const result = await gamesCollection.replaceOne(
		{ _id: newGameState.roomId},
		{ ...newGameState},
	)
	if (result.modifiedCount > 0) {
		return true
	} else {
		return false
	}
}

export async function getCards(){
	const cardCollection = db.collection("cards")
	const cardArray = await cardCollection.find().toArray()
	return cardArray.map((card) => toCard(card))
}

function toCard(card: any): Card{
	const x: Card = {
		_id:card._id,
		rank:card.rank,
		suit:card.suit,
		picture: card.picture
	}
	return x
}