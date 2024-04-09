////////////////////////////////////////////////////////////////////////////////////////////
// data model for cards and game state

export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
export const SUITS = ["♦️", "♥️", "♣️", "♠️"]

export type CardId = string
export type PlayerId = string
export type RoomId = string
export type LocationType = "unused" | "player-hand" | "community"

export interface Card {
  _id: CardId
  rank: typeof RANKS[number]
  suit: typeof SUITS[number]
  locationType: LocationType
  playerIndex: number | null
  positionInLocation: number | null
  picture: string | null
}

export interface Player {
  _id: PlayerId
  name: string
  age: number
  earnings: number
  profilePic: string | null
  gamesPlayed: number
  leaderboardRanking?: number
}

export interface Room{
  _id: RoomId
  playerIds: PlayerId[]
}

export type GamePhase = "preflop" | "flop" | "turn" | "river" | "game-over"

export interface GameState {
  playerIds: PlayerId[]
  cardsById: Record<CardId, Card>
  currentTurnPlayerIndex: number
  phase: GamePhase
  winningPlayers: PlayerId[]
  roomId: RoomId

  // I added these -Will
  playersStillIn: PlayerId[]
  betsThisPhase: Record<PlayerId, number>
  potAmount: number
  dealer: PlayerId 

  playerStacks: Record<PlayerId, number>
}


// export function createEmptyGame(playerNames: string[]): GameState {
//   const cardsById: Record<CardId, Card> = {}
//   let cardId = 0

//   for (let i = 0; i < numberOfDecks; i++) {
//     for (const suit of SUITS) {
//       for (const rank of RANKS.slice(0, rankLimit)) {
//         const card: Card = {
//           suit,
//           rank,
//           _id: String(cardId++),
//           locationType: "unused",
//           playerIndex: null,
//           positionInLocation: null,
//         }
//         cardsById[card.id] = card
//       }
//     }
//   }

//   return {
//     playerNames,
//     cardsById,
//     currentTurnPlayerIndex: 0,
//     phase: "initial-card-dealing",
//     playCount: 0,
//     lessThanTwo: []
//   }
// }