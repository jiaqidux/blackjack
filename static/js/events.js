import { state } from "./state.js";

import {
    hit,
    stand,
    double,
    split
} from "./actions.js";

import {
    startGame
} from "./game.js";

import {
    updateUI,
    clearIlluminatedButtons,
    displayResult,
    reset
} from "./ui.js";

import {
    updateActionHints
} from "./hints.js";


document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
        if (state.gameState !== "betting") return;
        let chipValue = parseInt(chip.dataset.value);
        if (state.balance >= chipValue) {
            state.balance -= chipValue;
            state.bet += chipValue;
            document.querySelector(".bet").textContent = `Bet:\n$${state.bet}`;
            document.querySelector(".balance").textContent = `Balance:\n$${state.balance}`;
        } else {
            console.log("Not enough balance");
        }
    });
});

document.querySelector(".undo").addEventListener("click", () => {
    if (state.bet > 0 && state.gameState === "betting") {
        state.balance += state.bet;

        state.bet = 0;

        document.querySelector(".bet").textContent = `Bet:\n$${state.bet}`;
        document.querySelector(".balance").textContent = `Balance:\n$${state.balance}`;
    }
});

document.querySelector(".deal").addEventListener("click", () => {
    if (state.bet <= 0) {
        console.log("Invalid bet");
        return;
    }

    state.gameState = "playing";
    startGame();
    updateUI();
    updateActionHints();
});

const hintToggle = document.getElementById("hintToggle");
hintToggle.addEventListener("click", () => {
    state.hintsEnabled = !state.hintsEnabled;

    if (state.hintsEnabled) {
        hintToggle.classList.add("active");
        hintToggle.innerText = "Hints: ON";
        if (state.gameState === "playing") updateActionHints();
    } else {
        hintToggle.classList.remove("active");
        hintToggle.innerText = "Hints: OFF";
        clearIlluminatedButtons();
    }
});

document.querySelector(".hit").addEventListener("click", hit);
document.querySelector(".stand").addEventListener("click", stand);
document.querySelector(".double").addEventListener("click", double);
document.querySelector(".split").addEventListener("click", split);

document.addEventListener("click", (event) => {
    // safeguard
    if (event.target.tagName.toLowerCase() === 'button' || event.target.tagName.toLowerCase() === 'input') return;

    if (state.isDealerDrawing) return;

    // player's first hand if split
    if (state.gameState === "showing_results") {
        state.showingHand = 1;
        displayResult(state.showingHand);
        state.gameState = "gameover";
    } else if (state.gameState === "gameover") {
        reset();
    }
});

