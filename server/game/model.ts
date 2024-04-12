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
  currentTurnPlayerIndex: number
  phase: GamePhase
  roomId: RoomId
  playersStillIn: PlayerId[]
  betsThisPhase: Record<PlayerId, number>
  potAmount: number
  smallBlindIndex: number
  communityCards: CardId[]
  deckCards: CardId[]
  playerStacks: Record<PlayerId, number>
  lastPlayerTurnIndex: number
}

export function createEmptyGame(playerIds: PlayerId[], roomId: RoomId, cardIds: CardId[]): GameState {
  const playerStacks = {}
  console.log(playerIds)
  for(const playerId of playerIds){
    fillPlayerStack(playerId,playerStacks)
  }

  const cardsByPlayer = dealCards(playerIds, cardIds)

  return{
    playerIds: playerIds,
    cardsByPlayer: cardsByPlayer,
    currentTurnPlayerIndex: 0,
    phase: "preflop",
    roomId: roomId,
    playersStillIn: playerIds,
    betsThisPhase: {},
    potAmount: 0,
    smallBlindIndex: 0,
    communityCards: [],
    deckCards: cardIds,
    playerStacks: playerStacks,
    lastPlayerTurnIndex: 0
  }
}


function dealCards(playerIds: PlayerId[], cards: CardId[]){
  const cardsByPlayer: Record<PlayerId,CardId[]> = {}
  //shuffle cards
  for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  playerIds.forEach((player: PlayerId) => {
    cardsByPlayer[player] = []
    cardsByPlayer[player].push(cards.pop());
    cardsByPlayer[player].push(cards.pop());
  });
  return cardsByPlayer
}

export function getCardAmt(cards: CardId[], num: number) {
  const cardies: CardId[] = []

  for (let i = 0; i < num; i++) {
    cardies.push(cards.pop())
  }
  return cardies
}


function fillPlayerStack(playerId: PlayerId, currentPlayerStacks: Record<PlayerId, number>, amount: number = 500){
  //api call dealing with subtracting amount from player profile
  if(playerId in currentPlayerStacks){
    currentPlayerStacks[playerId] += amount
  }
  else{
    currentPlayerStacks[playerId] = amount
  }
}