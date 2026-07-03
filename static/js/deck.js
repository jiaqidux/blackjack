// to build decks

import { state, suits, ranks } from "./state.js";

export function createDecks() {
    state.decks.length = 0; // to empty actual decks

    for (let i = 0; i < 6; i++) {
        for (let suit of suits) {
            for (let rank of ranks) {
                state.decks.push({ rank, suit });
            }
        }
    }

    return state.decks;
}

export function shuffle() {
    for (let i = 0; i < state.decks.length; i++) {
        let j = Math.floor(Math.random() * (i + 1));

        let temp = state.decks[i];
        state.decks[i] = state.decks[j];
        state.decks[j] = temp;

        // [state.decks[i], state.decks[j]] = [state.decks[j], state.decks[i]];
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