import { MongoClient } from 'mongodb'
import { Card, Player, RANKS, SUITS } from '../game/model'

const DB = "game"
const URL = "mongodb://127.0.0.1:27017"

// Connection URL
const client = new MongoClient(URL)

const cards: Card[] = []
let count = 1
for(let rank of RANKS){
    for(let suit of SUITS){
        cards.push(
            {
                "_id": String(count),
                "rank": rank,
                "suit": suit,
                "locationType": "unused",
                "playerIndex": null,
                "positionInLocation": null,
                "picture": null
            }
        )
        count+=1
    }
}


const players: Player[] = [
  {
    "_id": "1",
    "name": "alice",
    "age": 1,
    "earnings": 100,
    "profilePic": null,
    "gamesPlayed": 0,
    "leaderboardRanking": 0
  },
  {
    "_id": "2",
    "name": "bob",
    "age": 2,
    "earnings": 200,
    "profilePic": null,
    "gamesPlayed": 0,
    "leaderboardRanking": 0
  },
]


async function main() {
  await client.connect()
  console.log('Connected successfully to MongoDB')

  const db = client.db(DB)

  // add data
  console.log("inserting cards", await db.collection("cards").insertMany(cards as any))
  console.log("inserting players", await db.collection("players").insertMany(players as any))

  process.exit(0)
}

main()
