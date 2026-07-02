// all changes to ui

document.querySelectorAll(".chip").forEach(chip => {
    chip.addEventListener("click", () => {
        if (gameState !== "betting") return;
        let chipValue = parseInt(chip.dataset.value);
        if (balance >= chipValue) {
            balance -= chipValue;
            bet += chipValue;
            document.querySelector(".bet").textContent = `Bet:\n$${bet}`;
            document.querySelector(".balance").textContent = `Balance:\n$${balance}`;
        } else {
            console.log("Not enough balance");
        }
    });
});

document.querySelector(".undo").addEventListener("click", () => {
    if (bet > 0 && gameState === "betting") {
        balance += bet;

        bet = 0;

        document.querySelector(".bet").textContent = `Bet:\n$${bet}`;
        document.querySelector(".balance").textContent = `Balance:\n$${balance}`;
    }
});

document.querySelector(".deal").addEventListener("click", () => {
    if (bet <= 0) {
        console.log("Invalid bet");
        return;
    }

    gameState = "playing";
    startGame();
    updateUI();
});

const hintToggle = document.getElementById("hintToggle");
hintToggle.addEventListener("click", () => {
    hintsEnabled = !hintsEnabled;

    if (hintsEnabled) {
        hintToggle.classList.add("active");
        hintToggle.innerText = "Hints: ON";
        if (gameState === "playing") updateActionHints();
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

export function createCard(suit, rank, faceDown=false) {
    // we create the card with front and back
    const cardElem = document.createElement('div');
    const cardInnerElem = document.createElement('div');
    const cardFrontElem = document.createElement('div');
    const cardBackElem = document.createElement('div');

    cardElem.classList.add('card-container');
    cardInnerElem.classList.add('card-inner');
    cardFrontElem.classList.add('card-front');
    cardBackElem.classList.add('card-back');

    const scale = 1.8;
    let x = -(rank * cardWidth * scale);
    let y = -(suit * cardHeight * scale);
    let bgX = -(1 * cardWidth * scale);
    let bgY = 0;
    cardFrontElem.style.backgroundPosition = `${x}px ${y}px, ${bgX}px ${bgY}px`;

    cardElem.appendChild(cardInnerElem);
    cardInnerElem.appendChild(cardFrontElem);
    cardInnerElem.appendChild(cardBackElem);

    if (faceDown) {
        cardInnerElem.style.transform = 'rotateY(180deg)';
    }

    return cardElem;
}

// show and hide buttons
export function updateUI() {
    const dealCont = document.querySelector(".deal-action-container");
    const actionCont = document.querySelector(".action-button-container"); // hit, double, stand
    const splitButton = document.querySelector(".split");
    const doubleButton = document.querySelector(".double");

    if (gameState === "playing") {
        dealCont.style.display = "none";
        actionCont.style.visibility = "visible";
        updateActionHints();

        // only show split button if hand can split
        if (playerCard1.rank === playerCard2.rank && canSplit && !isSplit && activeHand === 0) {
            splitButton.style.display = "inline-block";
        } else {
            splitButton.style.display = "none";
        }

        //  hide double button if not enough balance
        if (balance >= bet) {
            doubleButton.style.display = "inline-block";
        } else {
            doubleButton.style.display = "none";
        }
    } else {
        actionCont.style.visibility = "hidden";
        splitButton.style.display = "none";

        if (gameState === "betting") {
            dealCont.style.display = "flex";
        } else {
            dealCont.style.display = "none";
        }
    }
}

export function updateTotalUI() {
    const dealerHeader = document.querySelector(".dealer-container h3");
    const titleHand0 = document.querySelector(".title-hand-0");
    const titleHand1 = document.querySelector(".title-hand-1");
    const hand1Container = document.querySelector(".player-hand-1-container");

    if (!flipped) {
        dealerHeader.textContent = `Dealer: ${getValue(upCard)}`;
    } else {
        dealerHeader.textContent = `Dealer: ${dealerTotal}`;
    }

    if (!isSplit) {
        titleHand0.textContent = `Player: ${playerTotal[0]}`;
        hand1Container.setAttribute("hidden", "true");
    } else {
        hand1Container.removeAttribute("hidden");
        let showArrow1 = (gameState === "playing" && activeHand === 0) ? "  ❮❮" : "";
        let showArrow2 = (gameState === "playing" && activeHand === 1) ? "  ❮❮" : "";

        titleHand0.textContent = `Hand 1: ${playerTotal[0]}${showArrow1}`;
        titleHand1.textContent = `Hand 2: ${playerTotal[1]}${showArrow2}`;
    }
}

export function showMessage(text) {
    const message = document.querySelector(".message");
    message.textContent = text;
    message.style.display = "flex";
}

export function displayResult(index) {
    let multiplier = 0;
    let message;
    if (playerTotal[index] > 21) {
        message = "You lost";
    } else if (dealerTotal > 21) {
        message = "You won!"
        multiplier = 2;
    } else if (playerTotal[index] === dealerTotal) {
        message = "Draw"
        multiplier = 1;
    } else if (playerTotal[index] > dealerTotal) {
        message = "You won!"
        multiplier = 2;
    } else {
        message = "You lost"
    }

    let prefix = isSplit ? `Hand ${index + 1}: ` : "";
    showMessage(prefix + message);

    let handStake = handDoubled[index] ? bet * 2 : bet;
    balance += multiplier * handStake;
    document.querySelector(".balance").textContent = `Balance:\n$${balance}`;
}

export function reset() {
    document.querySelector(".message").style.display = "none";
    document.querySelector(".dealer-hand").innerHTML = "";
    document.querySelector(".player-hand-0").innerHTML = "";
    document.querySelector(".player-hand-1").innerHTML = "";

    document.querySelector(".dealer-container").style.visibility = "hidden";
    document.querySelector(".player-container").style.visibility = "hidden";

    bet = 0;
    document.querySelector(".bet").textContent = `Bet:\n$${bet}`;
    document.querySelector(".balance").textContent = `Balance:\n$${balance}`;

    gameState = "betting";
    updateUI();
}

export function clearIlluminatedButtons() {
    document.querySelectorAll(".action-button-container button").forEach(btn => {
        btn.classList.remove("illuminated");
    });
}
