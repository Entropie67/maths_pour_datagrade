import type { QuizzPlayer } from '../types'

/**
 * Gestionnaire des joueurs du quizz (version locale allégée de Razzia).
 * En V1 : un seul joueur virtuel local (« Moi » en solo, « La classe » en
 * projection). L'interface publique reste compatible avec une future
 * version multi-joueurs adossée à un serveur.
 */
export class QuizzPlayerManager {
  private players: QuizzPlayer[] = []

  add(player: QuizzPlayer): void {
    this.players.push(player)
  }

  getAll(): QuizzPlayer[] {
    return this.players
  }

  count(): number {
    return this.players.length
  }

  findById(playerId: string): QuizzPlayer | undefined {
    return this.players.find((p) => p.id === playerId)
  }

  replace(players: QuizzPlayer[]): void {
    this.players = players
  }
}
