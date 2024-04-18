////////////////////////////////////////////////////////////////////////////////////////////
// data model for cards and game state

export const RANKS = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"]
// export const SUITS = ["♦️", "♥️", "♣️", "♠️"]
export const SUITS = ["diamonds", "hearts", "clubs", "spades"]

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
  bio: string
}

export interface Room{
  _id: RoomId
  playerIds: PlayerId[]
}

export type GamePhase = "preflop" | "flop" | "turn" | "river" | "game-over"

export interface GameState {
  playerIds: PlayerId[] 
  cardsByPlayer: Record<PlayerId,CardId[]>, //
  currentTurnPlayerIndex: number //
  phase: GamePhase //
  roomId: RoomId
  playersStillIn: PlayerId[] //
  betsThisPhase: Record<PlayerId, number> //
  potAmount: number //
  smallBlindIndex: number //
  communityCards: CardId[] //
  deckCards: CardId[] //
  playerStacks: Record<PlayerId, number> //
  lastPlayerTurnIndex: number //
  playerHandStatuses: Record<PlayerId, string> //
}

export function createEmptyGame(playerIds: PlayerId[], roomId: RoomId, cardIds: CardId[]): GameState {
  const playerStacks = {}
  // console.log(playerIds)
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


export function dealCards(playerIds: PlayerId[], cards: CardId[]): Record<string, string[]>{
  const cardsByPlayer: Record<PlayerId,CardId[]> = {}
  //shuffle cards
  for (let i = cards.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [cards[i], cards[j]] = [cards[j], cards[i]];
  }

  playerIds.forEach((player: PlayerId) => {
    cardsByPlayer[player] = []
    for (let i = 0; i < 2; i++) {
      const card = cards.pop(); // Pop a card from the deck
      if (card !== undefined) { // Check if a card was popped successfully
        cardsByPlayer[player].push(card); // Add the card to the player's hand
      }
    }
  });
  return cardsByPlayer
}

export function getCardAmt(cards: CardId[], num: number) {
  const cardies: CardId[] = []

  for (let i = 0; i < num; i++) {
    const card = cards.pop();
    if (card !== undefined) {
      cardies.push(card)
    }
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

    // console.log(combinedHand)
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

export function determineWinner({cardsByPlayer, communityCards, playerHandStatuses, playersStillIn}:GameState, cards: Card[]): PlayerId[] {

  const handRankingOrder = [
    "royal-flush",
    "straight-flush",
    "quads",
    "full-house",
    "flush",
    "straight",
    "trips",
    "two-pair",
    "pair",
    "high-card"
  ];
 
  let winningPlayerIds: PlayerId[] = []
  let bestHandRanking: string | null = null
  for (const playerId in playerHandStatuses) {
    if (!playersStillIn.includes(playerId)) {
      continue
    }

    const playerStatus = playerHandStatuses[playerId]
    
    if (winningPlayerIds.length == 0 || !bestHandRanking) {
      winningPlayerIds = [playerId]
      bestHandRanking = playerStatus
      continue
    }

    const currentPlayerIndex = handRankingOrder.indexOf(playerStatus);
    const winningPlayerIndex = handRankingOrder.indexOf(bestHandRanking);

    if (currentPlayerIndex < winningPlayerIndex) {
      winningPlayerIds = []
      winningPlayerIds.push(playerId)
      bestHandRanking = playerStatus
    }

    else if (currentPlayerIndex === winningPlayerIndex) {
      let playerHighest: number = 0
      let winningHighest: number = 0
      switch (handRankingOrder[currentPlayerIndex]) {
        case "royal-flush":
          winningPlayerIds.push(playerId);
          break;
        case "straight-flush":
          playerHighest = flushHighest(cardsByPlayer[playerId].concat(communityCards), cards);
          winningHighest = flushHighest(cardsByPlayer[winningPlayerIds[0]].concat(communityCards), cards)
          if (winningHighest === playerHighest) {
            winningPlayerIds.push(playerId)
          }
          else if (winningHighest < playerHighest){
            winningPlayerIds = [playerId]
          }
          break;
        case "quads":
          playerHighest = quadHighest(cardsByPlayer[playerId].concat(communityCards), cards);
          winningHighest = quadHighest(cardsByPlayer[winningPlayerIds[0]].concat(communityCards), cards)
          if (winningHighest === playerHighest) {
            winningPlayerIds.push(playerId)
          }
          else if (winningHighest < playerHighest){
            winningPlayerIds = [playerId]
          }
          break;
        case "full-house":
          playerHighest = tripsHighest(cardsByPlayer[playerId].concat(communityCards), cards);
          winningHighest = tripsHighest(cardsByPlayer[winningPlayerIds[0]].concat(communityCards), cards)
          if (winningHighest === playerHighest) {
            winningPlayerIds.push(playerId)
          }
          else if (winningHighest < playerHighest){
            winningPlayerIds = [playerId]
          }
          break;
        case "flush":
          playerHighest = flushHighest(cardsByPlayer[playerId].concat(communityCards), cards);
          winningHighest = flushHighest(cardsByPlayer[winningPlayerIds[0]].concat(communityCards), cards)
          if (winningHighest === playerHighest) {
            winningPlayerIds.push(playerId)
          }
          else if (winningHighest < playerHighest){
            winningPlayerIds = [playerId]
          }
          break;
        case "straight":
          playerHighest = straightHighest(cardsByPlayer[playerId].concat(communityCards), cards);
          winningHighest = straightHighest(cardsByPlayer[winningPlayerIds[0]].concat(communityCards), cards)
          if (winningHighest === playerHighest) {
            winningPlayerIds.push(playerId)
          }
          else if (winningHighest < playerHighest){
            winningPlayerIds = [playerId]
          }
          break;
        case "trips":
          playerHighest = tripsHighest(cardsByPlayer[playerId].concat(communityCards), cards);
          winningHighest = tripsHighest(cardsByPlayer[winningPlayerIds[0]].concat(communityCards), cards);
          if (winningHighest < playerHighest) {
            winningPlayerIds = [playerId]
          }
          else if (winningHighest === playerHighest) {
            // for now i am just splitting, but we should really be mindful of kickers
            winningPlayerIds.push(playerId)
          }
          break;
        case "two-pair":
          playerHighest = pairHighest(cardsByPlayer[playerId].concat(communityCards), cards);
          winningHighest = pairHighest(cardsByPlayer[winningPlayerIds[0]].concat(communityCards), cards);
          if (winningHighest < playerHighest) {
            winningPlayerIds = [playerId]
          }
          else if (winningHighest === playerHighest) {
            // for now i am just splitting, but we should really be mindful of kickers
            winningPlayerIds.push(playerId)
          }
          break;
        case "pair":
          playerHighest = pairHighest(cardsByPlayer[playerId].concat(communityCards), cards);
          winningHighest = pairHighest(cardsByPlayer[winningPlayerIds[0]].concat(communityCards), cards);
          if (winningHighest < playerHighest) {
            winningPlayerIds = [playerId]
          }
          else if (winningHighest === playerHighest) {
            // for now i am just splitting, but we should really be mindful of kickers
            winningPlayerIds.push(playerId)
          }          
          break;
        case "high-card":
          playerHighest = highestCard(cardsByPlayer[playerId].concat(communityCards), cards);
          winningHighest = highestCard(cardsByPlayer[winningPlayerIds[0]].concat(communityCards), cards);
          if (winningHighest < playerHighest) {
            winningPlayerIds = [playerId]
          }
          else if (winningHighest === playerHighest) {
            // for now i am just splitting, but we should really be mindful of kickers
            winningPlayerIds.push(playerId)
          }

      }

    }

    

  }
  return winningPlayerIds

  



}

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
  const foundCard = deckCards.find(c => c._id === card);
  if (foundCard) {
    return foundCard;
  } else {
    throw new Error(`Card with ID ${card} not found in the deck.`);
  }
}

function flushHighest(cardIds: string[], cards: Card[]): number {
  const suitCounts: Record<string, number> = {};
  for (const cardId of cardIds) {
    const card = cards.find(card => card._id === cardId);
    if (card) {
      suitCounts[card.suit] = (suitCounts[card.suit] || 0) + 1;
    }
  }
  let flushSuit: string | null = null;
  for (const suit in suitCounts) {
    if (suitCounts[suit] >= 5) {
      flushSuit = suit;
      break;
    }
  }
  const flushCards = cards.filter(card => cardIds.includes(card._id) && card.suit === flushSuit);
  flushCards.sort((a, b) => b.rank.localeCompare(a.rank));
  return toNumber(flushCards[0].rank);
}

function quadHighest(cardIds: string[], cards: Card[]): number {
  const rankCounts: Record<string, number> = {};
  for (const cardId of cardIds) {
    const card = cards.find(card => card._id === cardId);
    if (card) {
      rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
    }
  }
  let quadRank = "";
  for (const rank in rankCounts) {
    if (rankCounts[rank] === 4) {
      quadRank = rank;
      break;
    }
  }
  return toNumber(quadRank);

}


function straightHighest(cardIds: string[], cards: Card[]): number {
  const straightCards = cardIds.map(cardId => cards.find(card => card._id === cardId));
  if (!straightCards || straightCards.length === 0) {
    return 0;
  }
  straightCards.sort((a, b) => {
    const rankOrder = ['2', '3', '4', '5', '6', '7', '8', '9', 'T', 'J', 'Q', 'K', 'A'];
    if (a && b) { 
      return rankOrder.indexOf(a.rank) - rankOrder.indexOf(b.rank);
    }
    return 0;
  });

  const lastCard = straightCards[straightCards.length - 1];
  if (!lastCard) {
    return 0;
  }
  return toNumber(lastCard.rank);
}

function tripsHighest(cardIds: string[], cards: Card[]): number {
  const rankCounts: Record<string, number> = {};
  for (const cardId of cardIds) {
    const card = cards.find(card => card._id === cardId);
    if (card) {
      rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
    }
  }

  let tripsRank = null;
  for (const rank in rankCounts) {
    if (rankCounts[rank] === 3) {
      tripsRank = rank;
      break;
    }
  }
  if (tripsRank != null) {
    return toNumber(tripsRank);
  }
  return 0;
}

function pairHighest(cardIds: string[], cards: Card[]): number {
  const rankCounts: Record<string, number> = {};
  for (const cardId of cardIds) {
    const card = cards.find(card => card._id === cardId);
    if (card) {
      rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
    }
  }

  let highestRank = 0
  for (const rank in rankCounts) {
    if (rankCounts[rank] === 2 && toNumber(rank) > highestRank) {
      highestRank = toNumber(rank)
    }
  }
  return highestRank;
}

function highestCard(cardIds: string[], cards: Card[]): number {
  const rankCounts: Record<string, number> = {};
  for (const cardId of cardIds) {
    const card = cards.find(card => card._id === cardId);
    if (card) {
      rankCounts[card.rank] = (rankCounts[card.rank] || 0) + 1;
    }
  }

  let highestRank = 0
  for (const rank in rankCounts) {
    if (rankCounts[rank] === 1 && toNumber(rank) > highestRank) {
      highestRank = toNumber(rank)
    }
  }
  return highestRank
}

function toNumber(rank: string): number {
  if (rank == "A") {
    return 14
  }
  else if (rank == "K") {
    return 13
  }
  else if (rank == "Q") {
    return 12
  }
  else if (rank == "J") {
    return 11
  }
  else {
    return Number(rank)
  }
}



export function getCardImage(rank: string, suits: string){
  console.log('../../assets/' + rank + '_of_' + suits+'.svg')
  return '../../assets/' + rank + '_of_' + suits+'.svg'
}