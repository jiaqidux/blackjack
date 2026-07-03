// implement all game actions

import { state } from "./state.js";

import { getValue, getAces, reduceAces } from "./deck.js";

import {
    createCard,
    updateUI,
    updateTotalUI
} from "./ui.js";

import { updateActionHints } from "./hints.js";

import { endGame } from "./game.js";

export function dealToHand(card, handIndex) {
    state.playerTotal[handIndex] += getValue(card);
    state.playerAces[handIndex] += getAces(card);
    [state.playerTotal[handIndex], state.playerAces[handIndex]] = reduceAces(
        state.playerTotal[handIndex],
        state.playerAces[handIndex]
    );

    document
        .querySelector(`.player-hand-${handIndex}`)
        .append(createCard(card.suit, card.rank));

    updateTotalUI();
}

export function hit() {
    if (state.gameState !== "playing") return;

    dealToHand(state.decks.pop(), state.activeHand);

    if (state.playerTotal[state.activeHand] >= 21) {
        stand();
    }

    updateUI();
    updateActionHints();
}

export function stand() {
    if (state.gameState !== "playing") return;

    if (state.isSplit && state.activeHand === 0) {
        state.activeHand = 1;
        updateUI();
        updateActionHints();
        updateTotalUI();
    } else {
        endGame();
    }
}

export function double() {
    if (state.gameState !== "playing") return;

    // safeguard
    if (state.balance < state.bet) {
        console.log("Not enough balance");
        return;
    }

    state.balance -= state.bet;
    state.handDoubled[state.activeHand] = true;

    document.querySelector(".balance").textContent = `Balance:\n$${state.balance}`;

    dealToHand(state.decks.pop(), state.activeHand);
    stand();
}

export function split() {
    if (state.gameState !== "playing" || !state.canSplit || state.isSplit) return;

    // safeguard
    if (state.playerCard1.rank !== state.playerCard2.rank) {
        console.log("Can't split");
        return;
    }

    if (state.balance < state.bet) {
        console.log("Not enough money to split");
        return;
    }

    state.balance -= state.bet; // bet for second hand

    document.querySelector(".balance").textContent = `Balance:\n$${state.balance}`;

    state.playerTotal = [0, 0];
    state.playerAces = [0, 0];

    state.canSplit = false;
    state.isSplit = true;
    state.activeHand = 0;

    document.querySelector(".player-hand-0").innerHTML = "";
    document.querySelector(".player-hand-1").innerHTML = "";

    // deal first hand
    dealToHand(state.playerCard1, 0);
    dealToHand(state.decks.pop(), 0);

    // deal second hand
    dealToHand(state.playerCard2, 1);
    dealToHand(state.decks.pop(), 1);

    if (state.playerTotal[state.activeHand] >= 21) {
        state.activeHand = 1;

        if (state.playerTotal[state.activeHand] >= 21) {
            endGame();
            return;
        }
    }

    updateUI();
    updateActionHints();
}