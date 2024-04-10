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
  cardsByPlayer: Record<PlayerId,CardId[]>,
  cardsById: Record<CardId, Card>
  currentTurnPlayerIndex: number
  phase: GamePhase
  roomId: RoomId

  playersStillIn: PlayerId[]
  betsThisPhase: Record<PlayerId, number>
  potAmount: number
  smallBlindIndex: number
  communityCards: CardId[]

  playerStacks: Record<PlayerId, number>
}

export function createEmptyGame(playerIds: PlayerId[], roomId: RoomId): GameState {

  return{
    playerIds: playerIds,

    cardsById: cardsById,
    currentTurnPlayerIndex: 0,
    phase: "preflop",
    roomId: roomId,
    playersStillIn: playerIds,
    betsThisPhase: {},
    potAmount: 0,
    smallBlindIndex: 0,
  }

  


}