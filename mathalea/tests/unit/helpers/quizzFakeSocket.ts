import type { QuizzSocketLike } from '../../src/modules/quizz/transport/SocketTransport'

/**
 * Fausse socket pour les tests du transport et des sessions multi-joueurs :
 * enregistre les émissions sortantes et permet de simuler les événements
 * entrants du serveur.
 */
export class FakeSocket implements QuizzSocketLike {
  connected = false
  closed = false
  readonly sent: Array<{ event: string; payload?: unknown }> = []
  private readonly listeners = new Map<
    string,
    Set<{ fn: (...args: never[]) => void; once: boolean }>
  >()

  on(event: string, listener: (...args: never[]) => void): void {
    const set = this.listeners.get(event) ?? new Set()
    set.add({ fn: listener, once: false })
    this.listeners.set(event, set)
  }

  once(event: string, listener: (...args: never[]) => void): void {
    const set = this.listeners.get(event) ?? new Set()
    set.add({ fn: listener, once: true })
    this.listeners.set(event, set)
  }

  off(event: string, listener?: (...args: never[]) => void): void {
    if (listener == null) {
      this.listeners.delete(event)
      return
    }
    const set = this.listeners.get(event)
    if (set == null) return
    for (const entry of set) {
      if (entry.fn === listener) set.delete(entry)
    }
  }

  emit(event: string, payload?: unknown): void {
    this.sent.push({ event, payload })
  }

  close(): void {
    this.connected = false
    this.closed = true
  }

  /** Simule l'établissement de la connexion. */
  connect(): void {
    this.connected = true
    this.fire('connect')
  }

  /** Simule un événement entrant (payload transmis aux écouteurs). */
  fire(event: string, payload?: unknown): void {
    const set = this.listeners.get(event)
    if (set == null) return
    for (const entry of [...set]) {
      if (entry.once) set.delete(entry)
      entry.fn(payload as never)
    }
  }

  /** Dernier message sortant pour un événement donné. */
  lastSent(event: string): { event: string; payload?: unknown } | undefined {
    return [...this.sent].reverse().find((message) => message.event === event)
  }
}
