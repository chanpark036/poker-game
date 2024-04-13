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
  playerHandStatuses: Record<PlayerId, string>
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
    lastPlayerTurnIndex: 0,
    playerHandStatuses: {}
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


export function determineHands({cardsByPlayer, communityCards}:GameState, cards: Card[]): Record<PlayerId, string> {

  const playerStatuses: Record<PlayerId, string> = {}

  for (const player in cardsByPlayer) {
    const combinedHandIds = cardsByPlayer[player].concat(communityCards)
    const combinedHand = combinedHandIds.map(cardId => toCard(cardId, cards))

    console.log(combinedHand)
    if (isRoyalFlush(combinedHand)) {
      playerStatuses[player] = "royal-flush";
    }
    else if (isStraightFlush(combinedHand)) {
      playerStatuses[player] = "straight-flush";
    }
    else if (isQuads(combinedHand)) {
      playerStatuses[player] = "quads";
    }
    else if (isFullHouse(combinedHand)) {
      playerStatuses[player] = "full-house";
    }
    else if (isFlush(combinedHand)) {
      playerStatuses[player] = "flush";
    }
    else if (isStraight(combinedHand)) {
      playerStatuses[player] = "straight";
    }
    else if (hasThreeOfAKind(combinedHand)) {
      playerStatuses[player] = "trips";
    }
    else if (hasTwoPairs(combinedHand)) {
      playerStatuses[player] = "two-pair";
    }
    else if (hasPair(combinedHand)) {
      playerStatuses[player] = "pair";
    }
    else {
      playerStatuses[player] = "high-card"
    }

  }
  return playerStatuses
}

// export function determineWinner({cardsByPlayer, communityCards}:GameState) {
//   // royal flush
//   // straight flush
//   // quads
//   // full house
//   // flush
//   // straight
//   // three of a kind
//   // two pair
//   // pair
//   // high card

//   // using gameState.cardsByPlayer: Record<string, Card[]> and gameState.communityCards: Card[], determine which player won
//   // isRoyalFlush(combinedHand)

//   isStraightFlush(combinedHand)

//   isQuads(combinedHand)

//   isFullHouse(combinedHand)

  



// }

function countCardValues(hand: Card[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const card of hand) {
    counts[card.rank] = (counts[card.rank] || 0) + 1;
  }
  return counts;
}



const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A'];

function isRoyalFlush(hand: Card[]): boolean {
  const flushSuit = hand[0].suit;
  const royalRanks = ['10', 'J', 'Q', 'K', 'A'];
  const royalFlushHand = royalRanks.map(rank => ({ rank, suit: flushSuit }));
  return hand.every(card => royalFlushHand.some(royalCard => card.suit === royalCard.suit && card.rank === royalCard.rank));
}

function isStraightFlush(hand: Card[]): boolean {
  const straightFlushSuit = hand[0].suit;
  const straightHand = hand.sort((a, b) => {
    return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
  });

  for (let i = 0; i < straightHand.length - 4; i++) {
    let isStraightFlush = true;
    for (let j = i; j < i + 4; j++) {
      if (straightHand[j].suit !== straightFlushSuit || rankOrder.indexOf(straightHand[j].rank) + 1 !== rankOrder.indexOf(straightHand[j + 1].rank)) {
        isStraightFlush = false;
        break;
      }
    }
    if (isStraightFlush) return true;
  }
  return false;
}


function isQuads(hand: Card[]): boolean {
  const counts = countCardValues(hand);
  return Object.values(counts).includes(4);
}


function isFullHouse(hand: Card[]): boolean {
  const counts = countCardValues(hand);
  return Object.values(counts).includes(3) && Object.values(counts).includes(2);
}

function isFlush(hand: Card[]): boolean {
  const uniqueSuits = new Set(hand.map(card => card.suit));
  return uniqueSuits.size === 1;
}

function isStraight(hand: Card[]): boolean {
  const straightHand = hand.sort((a, b) => {
    return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
  });

  for (let i = 0; i < straightHand.length - 4; i++) {
    let isStraight = true;
    for (let j = i; j < i + 4; j++) {
      if (rankOrder.indexOf(straightHand[j].rank) + 1 !== rankOrder.indexOf(straightHand[j + 1].rank)) {
        isStraight = false;
        break;
      }
    }
    if (isStraight) return true;
  }
  return false;
}

function hasThreeOfAKind(hand: Card[]): boolean {
  const counts = countCardValues(hand);
  return Object.values(counts).includes(3);
}

function hasTwoPairs(hand: Card[]): boolean {
  const counts = countCardValues(hand);
  let pairCount = 0;
  for (const count of Object.values(counts)) {
    if (count === 2) {
      pairCount++;
    }
  }
  return pairCount === 2;
}

function hasPair(hand: Card[]): boolean {
  const counts = countCardValues(hand);
  return Object.values(counts).includes(2);
}


function toCard(card: string, deckCards: Card[]): Card{
  return deckCards.find(c => c._id === card)
}