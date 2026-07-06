# Blackjack Strategy Engine and Simulator
#### Video Demo: https://youtu.be/qSCGZ8rtb5s

---

## Description
A full-stack Blackjack web application built as the final project for [CS50's Introduction to Computer Science](https://cs50.harvard.edu/x/). Beyond a playable game, it includes a real-time optimal strategy advisor and a Monte Carlo simulator, all built on the exact same core probability engine, so the strategy the app recommends is not a rule of thumb but the direct output of a calculation the simulator itself verifies empirically.

---

## How to run
Try it live: https://blackjack-optimal-simulator.onrender.com
 
Or run it locally:
```bash
git clone https://github.com/jiaqidux/blackjack.git
cd project
pip install -r requirements.txt
python app.py
```
Then open http://127.0.0.1:5000/ in your browser.

---

## Design highlights
A few decisions worth calling out, explained in full in [`DESIGN.md`](./DESIGN.md):
* Dynamic programming with memoization to make an exponential problem tractable. `calculate_ev` recursively evaluates hitting, standing, doubling, and splitting, caching every state via Python's `@cache` decorator so that recurring states are computed exactly once rather than re-derived on every call.
* Exact dealer-peek probability adjustment. When the dealer's upcard is an Ace or 10-value card, the code filters out the corresponding cards from the probability distribution to reflect the mathematical guarantee that the dealer doesn't hold Blackjack once play continues, rather than approximating it.
* Precomputed strategy tables at server startup. The three strategy matrices are calculated once when Flask launches, separating expensive static computation from cheap per-request routing, instead of recalculating a full decision tree on every page load.
* An infinite-deck assumption for the probability engine, trading a small amount of theoretical precision for a state space small enough to cache effectively, negligible in practice against a simulated six-deck shoe.

---

## Validation
The strategy engine's claim — that it plays optimally — isn't just asserted, it's tested against a control. `benchmark.py` runs 100,000 Monte Carlo rounds using `optimal_strategy` and, separately, 100,000 rounds using `random_strategy` (uniformly random decisions), then compares expected value per hand between the two.
 
```bash
python benchmark.py
```
 
**Results (example run, N = 100,000):**
 
| Metric | Optimal strategy | Random strategy (control) |
|---|---|---|
| EV per hand | -3.3% | -52.4% |
| Simulation speed | ~72,000 rounds/s | ~105,000 rounds/s |
 
The optimal strategy cuts expected player loss by roughly 94% compared to random play. Since `calculate_ev` is decorated with `@cache`, `calculate_ev.cache_info()` also exposes the size of the underlying decision tree for free: the engine resolves 8,700 unique decision states (hand total × dealer upcard × card count × split eligibility), with over 180,000 cache hits reused from those states across a typical simulation; the memoization isn't just an optimization, it's a direct measure of how much smaller the real problem is than the naive exponential one.
 
> Note: results vary slightly run to run since this is a stochastic simulation, but the loss reduction holds consistently in the 90-95% range across repeated runs.

## Architecture overview

| Component | Purpose |
|---|---|
| `blackjack.py` | The mathematical engine: EV calculation, dealer probability, and the Monte Carlo simulator |
| `benchmark.py` | Validates the strategy engine empirically against a random-decision control |
| `app.py` | Flask routes bridging the engine to the game, hint, and simulation endpoints |
| `static/js/state.js` | Shared runtime state: hand totals, shoe composition, balance, active bet |
| `static/js/deck.js` | Builds and shuffles the six-deck shoe, mirroring the backend's deck configuration |
| `static/js/ui.js` | DOM rendering: cards, scores, button visibility across game phases |
| `static/js/actions.js` | Player mechanics, including split-hand tracking and independent bets |
| `static/js/hints.js` | Real-time strategy hints via async requests to `/get_hint` |
| `static/js/events.js` | Centralized DOM event listeners |
| `static/js/game.js` | Core game loop: dealing, dealer play under soft-17 rule, round resolution |
| `static/images/` | Card sprites and UI assets |
| `templates/` | Jinja2 HTML templates (index, layout, simulator, strategy) |
| `DESIGN.md` | Full design document: the probability model, dynamic programming approach, Flask routing choices, and frontend architecture |

---

## Built with
Python · Flask · JavaScript (ES Modules) · Chart.js · Bootstrap