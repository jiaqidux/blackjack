// global variables

// variables that might change
export const state = {
    dealerTotal: 0,
    dealerAces: 0,

    downCard: null,
    upCard: null,
    downCardElem: null,
    flipped: false,
    isDealerDrawing: false,

    playerTotal: [0,0],
    playerAces: [0,0],

    playerCard1: null,
    playerCard2: null,

    balance: 2500,
    bet: 0,

    handDoubled: [false,false],

    canSplit: true,
    isSplit: false,

    activeHand: 0,
    showingHand: 0,

    gameState: "betting",

    hintsEnabled: false,

    decks: []
}

export const cardWidth = 71;
export const cardHeight = 95;

export const suits = [0,1,2,3];
export const ranks = [...Array(13).keys()];