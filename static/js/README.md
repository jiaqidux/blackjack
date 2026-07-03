# Blackjack Strategy Engine and Simulator

#### Video Demo: https://youtu.be/qSCGZ8rtb5s

---

## Description

This project is a comprehensive full-stack web application that combines an interactive, playable game of Blackjack with a mathematical backend capable of computing the game's optimal strategy from first principles. Built using Python for the computational backend, Flask for the web server, and a modular HTML, CSS, and vanilla JavaScript architecture for the frontend, it demonstrates the underlying probability theory of casino blackjack. 

The application consists of three integrated components driven by the exact same underlying probability calculations:
* A playable Blackjack table featuring an optional, real-time hint system.
* A dynamic strategy matrix page showing the mathematically optimal action for every possible hand combination.
* A Monte Carlo simulation platform that executes thousands of automated rounds under different strategy profiles and visualizes comparative performance analytics using Chart.js.

---

## How to Run Locally

To run this application on your local machine, follow these setup steps:

1. **Clone the repository:**
   ```bash
   git clone https://github.com/jiaqidux/blackjack.git
   cd project
   ```

2. **Install dependencies:**
   Ensure you have Python installed, then install the required backend modules via your terminal:
   ```bash
   pip install -r requirements.txt
   ```

3. **Launch the Flask server:**
   Run the main application script:
   ```bash
   python app.py
   ```

4. **Access the application:**
   Open your preferred web browser and navigate to:
   http://127.0.0.1:5000/

---

## The Mathematical Core

The heart of the project relies on probability theory and dynamic programming implemented in Python to resolve the optimal path through any given blackjack hand. The system evaluates the Expected Value (EV) of every possible decision to prove that adhering to mathematically optimal play minimizes long-term losses compared to arbitrary or dealer-mimicking strategies.

### Dealer Probability Distribution
The `dealer_prob` function uses recursion to calculate the exact probability of every possible final state the dealer can reach (17, 18, 19, 20, 21, or bust) based on their single visible upcard. Because the dealer follows a fixed casino rule (draw on 16 or less, and hit on a soft 17), the function explores every path the dealer's hand can take. 

At each step, it considers every next card draw under an infinite-deck assumption, meaning each rank has a fixed probability, with 10-valued cards four times as likely as any other rank. For each card, it computes the new total, demotes an ace from 11 to 1 if the hand would otherwise bust, multiplies the running probability by that card's probability, and recurses. When a terminal state is reached, the accumulated probability is added to a results dictionary, forming a weighted tree search that terminates because the dealer's total strictly increases and is bounded above.

### Expected Value and Conditional Probability
The `compare_stand` function calculates the Expected Value (EV) of choosing to stand on a given total against a given dealer upcard, measured in bet units where a win pays +1, a loss costs -1, and a push pays 0. 

A critical component of this calculation is handling the dealer blackjack peek rule. If the dealer upcard is an Ace or a 10-value card, the dealer checks the hidden hole card before the player acts, ending the hand immediately if it completes a blackjack. If the game continues to the player's turn, it mathematically guarantees the dealer does not have Blackjack. To model this accurately, the function excludes the corresponding hole cards from the initial distribution and renormalizes the remaining probabilities, applying conditional probability to ensure perfect analytical precision.

### Dynamic Programming for Optimal Play
The `calculate_ev` function determines the mathematical value of hitting, standing, doubling, and splitting. It applies recursion with memoization via Python's `@cache` decorator to traverse the entire decision tree. 
* Standing scales directly with the outputs of `compare_stand`.
* Hitting operates recursively: for each possible next card, it computes the new hand state and recursively calls itself to find the best EV from that state onward, weighted by probability.
* Doubling considers each possible card and records either a loss of two units on a bust or the standing EV at double stakes otherwise.
* Splitting recursively evaluates the best EV from each of the two resulting hands after one more card each, as a split hand is played independently.

Because these functions call each other recursively and the same states recur often, caching ensures any given state is computed exactly once and reused, making the calculation tractable rather than exponential. Finally, `optimal_strategy` compares the four actions and selects the specific string label matching the maximum value.

---

## Simulating Strategies

To confirm that the analytically computed strategy performs better in practice, the project includes a `simulator(N, strategy)` function, which plays N complete automated rounds using a given strategy profile and records the running history.

The simulation engine manages a full six-deck shoe, tracking deck penetration and reshuffling automatically when cards run low. It handles every branch of live play, including hitting, doubling down, and splitting. Splitting is resolved using a queue system (`hands_to_play`) to process split hands sequentially against the same dealer hand, allowing split branches to be hit further and evaluated independently.

Net profit or loss is tracked in bet units rather than currency, keeping results independent of stake size. Two alternative strategies were implemented for baseline comparison:
* A random strategy that chooses uniformly among legal actions.
* A naive dealer-style strategy that hits on any total below 17 and stands otherwise.

Running all three profiles over thousands of rounds confirms empirically that the analytically computed strategy minimizes long-run losses, even though it does not eliminate the house edge entirely.

---

## Web Server Integration (Flask)

The `app.py` file serves as the bridge between the mathematical backend and the client interface.

To prevent severe performance bottlenecks, the three canonical strategy matrices (Hard Totals, Soft Totals, and Pairs) are pre-calculated as global variables when the server initially starts. Running the deep recursive tree for every matrix cell upon every individual page load would be computationally prohibitive.

The server features distinct architectural choices for routing:
* The `/get_hint` route calls `optimal_strategy` directly on the exact state of the player's current hand sent as query parameters, since a live hand can reach intermediate states beyond the canonical ones displayed in the static table.
* The `/run_simulator` endpoint acts as a template renderer, serving the static HTML interface where the user sets up simulation parameters.
* The `/simulate` endpoint functions as a RESTful JSON API. It accepts the user's N parameter, validates it to prevent server crashes, invokes the simulation engine three times (optimal, dealer, and random strategies), and packages the comparative tracking arrays into a single JSON response.

The templates leverage Jinja2 inheritance and loops. `layout.html` defines a shared navbar shell, `strategy.html` is generated by nested loops over precomputed rows with CSS classes for action color-coding, and `simulator.html` embeds the JavaScript charting logic.

---

## Frontend Architecture

The game itself is implemented in vanilla JavaScript using ES modules, introduced midway through development after the original single-file script became difficult to debug. Responsibility is decoupled across distinct modules:

* **state.js:** Holds a single shared object containing the global runtime state of the active game, including hand totals, shoe composition, balance, current bet, and split tracking flags.
* **deck.js:** Mimics the backend deck configurations by building and shuffling the six-deck shoe and translating drawn cards into their respective Blackjack values.
* **ui.js:** Manages all DOM manipulations, including rendering card elements from a custom sprite sheet, updating display scores, and toggling button visibility states across different game phases.
* **actions.js:** Implements the core player mechanics. Splitting is the most intricate component: it resets hand totals, deals a card to each split branch, handles independent bets, tracks doubled-down flags, and manages an active-hand pointer to route subsequent actions to the correct sub-hand.
* **hints.js:** Handles real-time hints by tracking the current hand state and performing asynchronous API `fetch` requests to the `/get_hint` endpoint whenever it is the player's turn.
* **events.js:** Centralizes all DOM event listeners, including chip selection, action buttons, and a global document-level click listener that advances game phases or triggers cleanups.
* **game.js:** Controls the core operational game loop. `startGame` initializes round variables and deals opening cards. `dealerPlay` reveals the hole card and resolves the dealer's hand under the soft-17 rule with automated time delays. `endGame` drives the evaluation transition, while `reset` clears the table graphics and returns the interface to the pristine betting state.

---

## Design Reflections

Several engineering decisions in this project required weighing theoretical correctness against real-world computational performance. 

The infinite-deck assumption used throughout the probability calculations, rather than tracking the exact shifting composition of a finite shoe, keeps the state space small enough for the recursive EV calculations to terminate quickly and cache effectively. This comes at the cost of a minor amount of theoretical precision that becomes statistically negligible when simulating a standard casino six-deck shoe.

Precomputing the strategy tables once at server startup, rather than on each individual request, reflects a broader architectural principle applied throughout the backend: separating expensive, static computation from cheap, per-request routing logic wherever the two can be cleanly divided. On the frontend, migrating from a monolithic script to ES modules organized strictly by responsibility was a choice made to keep testing and debugging tractable as the scale of the codebase grew.

Building the strategy engine, the interactive game, and the statistical simulator on top of the exact same core probability functions was the central architectural choice of the project. It ensures that the interface makes a genuine, verifiable claim: the strategy it recommends to the user is not an arbitrary rule of thumb, but the direct output of an exact calculation that the simulator itself verifies empirically.