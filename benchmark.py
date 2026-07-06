import time
from blackjack import simulator, optimal_strategy, random_strategy, calculate_ev

N = 100_000


def summarize(name, results, elapsed):
    n = results["total_rounds"]
    units = results["Units"]
    win_rate = results["Wins"] / n * 100
    lose_rate = results["Loses"] / n * 100
    draw_rate = results["Draws"] / n * 100
    ev_per_hand = units / n

    print(f"\n--- {name} ---")
    print(f"Tiempo de ejecución: {elapsed:.2f}s ({n/elapsed:,.0f} rondas/s)")
    print(f"Wins: {win_rate:.2f}%  Loses: {lose_rate:.2f}%  Draws: {draw_rate:.2f}%")
    print(f"Unidades netas: {units:+}")
    print(f"EV por mano: {ev_per_hand:+.4f}")
    return ev_per_hand


def main():
    print(f"Corriendo {N:,} rondas con optimal_strategy...")
    t0 = time.perf_counter()
    optimal_results = simulator(N, optimal_strategy)
    t_optimal = time.perf_counter() - t0

    print(f"Corriendo {N:,} rondas con random_strategy (control)...")
    t0 = time.perf_counter()
    random_results = simulator(N, random_strategy)
    t_random = time.perf_counter() - t0

    ev_optimal = summarize("OPTIMAL STRATEGY", optimal_results, t_optimal)
    ev_random = summarize("RANDOM STRATEGY (control)", random_results, t_random)

    print("\n=== COMPARATIVA ===")
    diff = ev_optimal - ev_random
    reduction_pct = (1 - abs(ev_optimal) / abs(ev_random)) * 100
    print(f"Diferencia de EV por mano: {diff:+.4f}")
    print(f"Reducción de pérdida esperada vs estrategia aleatoria: {reduction_pct:.1f}%")


    info = calculate_ev.cache_info()
    print(f"\nEstados de decisión únicos calculados (memoización): {info.misses:,}")
    print(f"Reutilizaciones de caché (hits): {info.hits:,}")


if __name__ == "__main__":
    main()