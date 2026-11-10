/**
 * Habillage sonore du quizz.
 *
 * Fichiers mp3 adaptés de Razzia (https://github.com/Ralex91/Razzia)
 * — licence MIT, Copyright (c) 2024 Ralex (voir NOTICE à la racine) —
 * copiés dans public/assets/sounds/quizz/.
 *
 * Le mapping statut → son reprend celui du client Razzia :
 * - ticks du compte à rebours initial : boump ;
 * - affichage de la question : show ;
 * - phase de réponse : musique d'attente en boucle, pop à chaque réponse ;
 * - révélation : results ;
 * - podium : séquence three / second / snearRoll / first.
 */

const SOUNDS_BASE = 'assets/sounds/quizz'

export type QuizzSoundName =
  | 'answersMusic'
  | 'answersSound'
  | 'boump'
  | 'first'
  | 'results'
  | 'second'
  | 'show'
  | 'snearRoll'
  | 'three'

const VOLUMES: Record<QuizzSoundName, number> = {
  answersMusic: 0.2,
  answersSound: 0.1,
  boump: 0.2,
  first: 0.1,
  results: 0.2,
  second: 0.1,
  show: 0.5,
  snearRoll: 0.1,
  three: 0.1,
}

export class QuizzSounds {
  private enabled: boolean
  private readonly players = new Map<QuizzSoundName, HTMLAudioElement>()
  private music: HTMLAudioElement | null = null

  constructor(enabled: boolean) {
    this.enabled = enabled
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
    if (!enabled) this.stopMusic()
  }

  private player(name: QuizzSoundName): HTMLAudioElement {
    let audio = this.players.get(name)
    if (audio == null) {
      audio = new Audio(`${SOUNDS_BASE}/${name}.mp3`)
      audio.volume = VOLUMES[name]
      this.players.set(name, audio)
    }
    return audio
  }

  /** Joue un effet (sans effet si les sons sont coupés). */
  play(name: QuizzSoundName): void {
    if (!this.enabled) return
    const audio = this.player(name)
    audio.currentTime = 0
    void audio.play().catch(() => {
      // Politique autoplay : le premier geste utilisateur déverrouille l'audio
    })
  }

  /** Démarre la musique d'attente en boucle (phase SELECT_ANSWER). */
  startMusic(): void {
    if (!this.enabled) return
    if (this.music == null) {
      this.music = new Audio(`${SOUNDS_BASE}/answersMusic.mp3`)
      this.music.volume = VOLUMES.answersMusic
      this.music.loop = true
    }
    this.music.currentTime = 0
    void this.music.play().catch(() => {})
  }

  stopMusic(): void {
    if (this.music != null) {
      this.music.pause()
      this.music.currentTime = 0
    }
  }
}
