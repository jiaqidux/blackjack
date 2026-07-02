// game flow

import { state } from "./state.js";

import { createDecks, shuffle, getValue, getAces, reduceAces } from "./deck.js";

import {
    createCard,
    updateUI,
    updateTotalUI,
    displayResult,
    clearIlluminatedButtons
} from "./ui.js";

export function startGame() {
    // reset everything
    dealerTotal = 0;
    dealerAces = 0;
    flipped = false;
    playerTotal = [0, 0];
    playerAces = [0, 0];
    canSplit = true;
    isSplit = false;
    activeHand = 0;
    showingHand = 0;
    handDoubled = [false, false];

    document.querySelector(".dealer-container").style.visibility = "visible";
    document.querySelector(".player-container").style.visibility = "visible";


    document.querySelector(".player-hand-1-container").setAttribute("hidden", "true");
    document.querySelector(".title-hand-0").textContent = "Player: 0";

    document.querySelector(".dealer-hand").innerHTML = "";
    document.querySelector(".player-hand-0").innerHTML = "";
    document.querySelector(".player-hand-1").innerHTML = "";

    // if we have less than one deck, we add more cards
    if (decks.length < 52) {
        decks = createDecks();
        shuffle();
    }

    // deal dealer's cards
    downCard = decks.pop();
    upCard = decks.pop();
    dealerTotal += getValue(upCard);
    dealerAces += getAces(upCard);

    downCardElem = createCard(downCard.suit, downCard.rank, true);
    document.querySelector(".dealer-hand").append(downCardElem);
    document.querySelector(".dealer-hand").append(createCard(upCard.suit, upCard.rank));

    // deal player's cards
    playerCard1 = decks.pop();
    playerCard2 = decks.pop();
    dealToHand(playerCard1, 0);
    dealToHand(playerCard2, 0);

    if (dealerTotal + getValue(downCard) == 21) {
    endGame();
    return;
    }

    // if player is 21, its either draw or win
    // since we peeked and the game continued, it means it's not draw, so it must be win
    if (playerTotal[0] == 21) {
        updateUI();
        endGame();
        return;
    }

    updateUI();
    updateTotalUI();
}

export async function dealerPlay() {
    downCardElem.querySelector('.card-inner').style.transform = "rotateY(0deg)";
    flipped = true;
    dealerTotal += getValue(downCard);
    dealerAces += getAces(downCard);
    [dealerTotal, dealerAces] = reduceAces(dealerTotal, dealerAces);
    updateTotalUI();

    let allBusted = isSplit ? (playerTotal[0] > 21 && playerTotal[1] > 21) : (playerTotal[0] > 21);
    if (!allBusted) {
        // dealer hits on soft ace
        while (dealerTotal < 17 || (dealerTotal === 17 && dealerAces > 0)) {
            await sleep(750);
            
            let card = decks.pop();
            dealerTotal += getValue(card);
            dealerAces += getAces(card);
            [dealerTotal, dealerAces] = reduceAces(dealerTotal, dealerAces);
            document.querySelector(".dealer-hand").append(createCard(card.suit, card.rank));

            updateTotalUI();
        }
    }

    return dealerTotal;
}

export async function endGame() {
    await dealerPlay();
    showingHand = 0;

    if (isSplit) {
        gameState = "showing_results";
    } else {
        gameState = "gameover";
    }

    updateUI();
    updateTotalUI();
    clearIlluminatedButtons();
    displayResult(showingHand);
}
