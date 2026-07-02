// to build decks 

import { state, suits, ranks } from "./state.js";

export function createDecks() {
    decks.length = 0; // to empty actual decks
    for (let i = 0; i < 6; i++) {
        for (let suit of suits) {
            for (let rank of ranks) {
                decks.push({rank, suit});
            }
        }
    }
    return decks;
}

export function shuffle() {
    for (let i = 0; i < decks.length; i++) {
        let j = Math.floor(Math.random() * (i + 1));
        let temp = decks[i];
        decks[i] = decks[j];
        decks[j] = temp;
        // [decks[i], decks[j]] = [decks[j], decks[i]];
    }
}

export function getValue(card) {
    let rank = card.rank;
    if (rank === 12) {
        return 11;
    }
    else if (rank >= 9 && rank <= 11) {
        return 10;
    }
    else {
        return rank + 2;
    }
}

export function getAces(card) {
    if (card.rank === 12) {
        return 1;
    }
    return 0;
}

export function reduceAces(total, aces) {
    while (total > 21 && aces > 0) {
        total -= 10;
        aces -= 1;
    }
    return [total, aces];
}