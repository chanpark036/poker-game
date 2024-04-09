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

export type GamePhase = "initial-card-dealing" | "play" | "game-over"

export interface GameState {
  playerIds: PlayerId[]
  cardsById: Record<CardId, Card>
  currentTurnPlayerIndex: number
  phase: GamePhase
  playCount: number
  winningPlayers: PlayerId[]
  roomId: RoomId
}
