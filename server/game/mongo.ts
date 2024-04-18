import { MongoClient, ObjectId } from "mongodb"
import { createAdapter } from "@socket.io/mongo-adapter"
import { GameState, RoomId, Card} from "./model"
import { createHash } from "crypto"

export const DB = "game"
export const GAMES_COLLECTION = "games"
export const URL = "mongodb://127.0.0.1:27017"

const SOCKET_IO_EVENTS_COLLECTION = "socket.io-adapter-events"
// const GAME_STATE_ID = new ObjectId("000000000000000000000000")

const mongoClient = new MongoClient(process.env.MONGO_URL || URL)


export interface MongoGameState extends GameState {
	_id: ObjectId
	version: number
}

export async function setupMongo() {
	await mongoClient.connect()
	const db = mongoClient.db(DB)
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
	await mongoClient.connect()
	const db = mongoClient.db(DB)
	const gamesCollection = db.collection(GAMES_COLLECTION)
	try {
		await gamesCollection.insertOne({ _id: new ObjectId(gameState.roomId), ...gameState })
	} catch (e) {
		// ignore
	}
}

export async function gameStateExists(gameStateId: RoomId) {
	await mongoClient.connect()
	const db = mongoClient.db(DB)
	const gamesCollection = db.collection(GAMES_COLLECTION)
	const hashedId = createHash('sha256').update(gameStateId).digest('hex')
	const objectId = new ObjectId(hashedId.slice(0, 24));
	const document = await gamesCollection.findOne({ _id: objectId })
	if(document){
		return true
	}
	else{
		return false
	}
}
export async function deleteGameState(gameStateId: RoomId) {
	await mongoClient.connect()
	const db = mongoClient.db(DB)
	const gamesCollection = db.collection(GAMES_COLLECTION)
	const hashedId = createHash('sha256').update(gameStateId).digest('hex')
	const objectId = new ObjectId(hashedId.slice(0, 24));
	return (await gamesCollection.deleteOne({ _id: objectId })).deletedCount as number
}


export async function tryToUpdateGameState(newGameState: GameState){
	await mongoClient.connect()
	const db = mongoClient.db(DB)
	const gamesCollection = db.collection(GAMES_COLLECTION)
	const hashedId = createHash('sha256').update(newGameState.roomId).digest('hex')
	const objectId = new ObjectId(hashedId.slice(0, 24));

	// console.log("object id " + objectId)
	// console.log(newGameState)
	const result = await gamesCollection.updateOne(
		
		{ _id: objectId},
		{ $set: {
			playerIds: newGameState.playerIds,
			cardsByPlayer: newGameState.cardsByPlayer,
			currentTurnPlayerIndex: newGameState.currentTurnPlayerIndex,
			phase: newGameState.phase,
			roomId: newGameState.roomId,
			playersStillIn: newGameState.playersStillIn,
			betsThisPhase: newGameState.betsThisPhase,
			potAmount: newGameState.potAmount,
			smallBlindIndex: newGameState.smallBlindIndex,
			communityCards: newGameState.communityCards,
			deckCards: newGameState.deckCards,
			playerStacks: newGameState.playerStacks,
			lastPlayerTurnIndex: newGameState.lastPlayerTurnIndex,
			playerHandStatuses: newGameState.playerHandStatuses
		} },
		
		{
			upsert: true
		}
	)

	// console.log("database modified")

	if (result.modifiedCount > 0) {
		return true
	} else {
		return false
	}
}

export async function getCards(){
	await mongoClient.connect()
	const db = mongoClient.db(DB)
	const cardCollection = db.collection("cards")
	const cardArray = await cardCollection.find().toArray()
	const cards = cardArray.map((card) => toCard(card))
	return cards
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