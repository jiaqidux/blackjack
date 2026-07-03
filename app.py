from blackjack import Card, optimal_strategy, random_strategy, dealer_strategy, simulator
from flask import Flask, flash, jsonify, redirect, render_template, request, session

app = Flask(__name__)

HARD_TOTALS = []
for i in range(5, 22):
    HARD_TOTALS.append(i)

SOFT_TOTALS = []
for i in range(2, 10):
    SOFT_TOTALS.append((11, i))

PAIRS = []
for i in range(2, 12):
    PAIRS.append((i, i))

DEALER_CARDS = []
for i in range(2, 12):
    DEALER_CARDS.append(i)

STRATEGY_HARD_ROWS = []
for total in HARD_TOTALS:
    actions = []
    for dealer_card in DEALER_CARDS:
        actions.append(optimal_strategy(total, 0, dealer_card, 2, None, False))
    STRATEGY_HARD_ROWS.append({"hand": total, "actions": actions})

STRATEGY_SOFT_ROWS = []
for cards in SOFT_TOTALS:
    actions = []
    total = cards[0] + cards[1]
    for dealer_card in DEALER_CARDS:
        actions.append(optimal_strategy(total, 1, dealer_card, 2, None, False))
    STRATEGY_SOFT_ROWS.append({"hand": cards, "actions": actions})

STRATEGY_PAIRS_ROWS = []
for pair in PAIRS:
    actions = []
    total = 12 if pair[0] == 11 else 2 * pair[0]
    aces = 2 if pair[0] == 11 else 0
    for dealer_card in DEALER_CARDS:
        actions.append(optimal_strategy(total, aces, dealer_card, 2, pair[0], True))
    STRATEGY_PAIRS_ROWS.append({"hand": pair, "actions": actions})

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/get_hint")
def get_hint():
    player_total = request.args.get("player_total", type=int)
    player_aces = request.args.get("player_aces", type=int)
    dealer_card = request.args.get("dealer_card", type=int)
    is_pair = request.args.get("is_pair", type=str) == "true"
    pair_value = request.args.get("pair_value", type=int) if is_pair else None

    best_action = optimal_strategy(player_total, player_aces, dealer_card, 2, pair_value, is_pair)

    return jsonify({"hint": best_action})

@app.route("/strategy")
def strategy():
    return render_template("strategy.html", hard_rows=STRATEGY_HARD_ROWS, soft_rows=STRATEGY_SOFT_ROWS, pairs_rows=STRATEGY_PAIRS_ROWS, dealer_cards=DEALER_CARDS)

@app.route("/simulate")
def simulate():
    try:
        N = int(request.args.get("N", 1000))
    except (TypeError, ValueError):
        return jsonify({"error": "N must be greater than 0"}), 400

    if N < 1 or N > 100000:
        return jsonify({"error": "N must be in the range 1-100000"}), 400

    optimal_data = simulator(N, optimal_strategy)
    random_data = simulator(N, random_strategy)
    dealer_data = simulator(N, dealer_strategy)

    return jsonify({
        "optimal": {
            "results": optimal_data,
            "history": optimal_data.pop("History")
        },
        "random": {
            "results": random_data,
            "history": random_data.pop("History")
        },
        "dealer": {
            "results": dealer_data,
            "history": dealer_data.pop("History")
        }
    })

@app.route("/run_simulator")
def run_simulator():
    return render_template("simulator.html")

if __name__ == "__main__":
    app.run(debug=True)

