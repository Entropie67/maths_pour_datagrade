/**
 * Minuteur des phases du quizz, porté de Razzia
 * (https://github.com/Ralex91/Razzia) — licence MIT, Copyright (c) 2024 Ralex.
 *
 * `start(seconds)` se résout à l'échéance (ou immédiatement si `abort()`),
 * en émettant chaque seconde le compte restant via le callback `onTick`.
 * `waitUntilAborted()` attend sans échéance ni ticks (questions sans limite
 * de temps) : seul `abort()` la résout.
 * La promesse permet au moteur d'enchaîner les phases avec await.
 */
export class CooldownTimer {
  private active = false
  /** Résolution d'une attente sans échéance en cours, le cas échéant. */
  private resolveWait: (() => void) | null = null

  constructor(private readonly onTick: (remaining: number) => void) {}

  start(seconds: number): Promise<void> {
    if (this.active) {
      return Promise.resolve()
    }
    this.active = true
    let count = seconds - 1
    return new Promise<void>((resolve) => {
      const interval = setInterval(() => {
        if (!this.active || count <= 0) {
          this.active = false
          clearInterval(interval)
          resolve()
          return
        }
        this.onTick(count)
        count -= 1
      }, 1000)
    })
  }

  /**
   * Attente sans échéance et sans ticks (question à temps illimité) :
   * ne se résout que lorsque `abort()` est appelé (tous les joueurs ont
   * répondu, ou interruption par l'enseignant).
   */
  waitUntilAborted(): Promise<void> {
    if (this.active) {
      return Promise.resolve()
    }
    this.active = true
    return new Promise<void>((resolve) => {
      this.resolveWait = () => {
        this.active = false
        resolve()
      }
    })
  }

  abort(): void {
    this.active = false
    const resolve = this.resolveWait
    this.resolveWait = null
    if (resolve != null) resolve()
  }
}
