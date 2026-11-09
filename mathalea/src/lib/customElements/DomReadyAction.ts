import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

export type DomReadyActionContext<TPayload = unknown> = {
  element: DomReadyActionElement
  payload: TPayload
}

export type DomReadyActionCallback<TPayload = unknown> = (
  context: DomReadyActionContext<TPayload>,
) => void | (() => void)

/**
 * @author Jean-Claude Lhote
 */
export class DomReadyActionElement extends MathaleaCustomElement {
  static readonly elementTag = 'mathalea-dom-ready'
  private static readonly callbacks = new Map<string, DomReadyActionCallback>()
  /**
   * Callback dont le nettoyage est en cours d'exécution.
   *
   * Sert à ignorer les désinscriptions obsolètes : quand un énoncé est
   * régénéré, le nouveau callback est inscrit (nouvelleVersion) *avant* que
   * l'ancien élément ne soit retiré du DOM. Sans ce garde-fou, le nettoyage de
   * l'ancien élément supprimerait l'inscription toute fraîche et le composant
   * ne serait jamais monté (cf. figures apigeom qui disparaissaient au clic sur
   * « Nouvel énoncé »).
   */
  private static callbackBeingCleanedUp: DomReadyActionCallback | null = null
  private cleanup: (() => void) | null = null
  /** Callback effectivement exécuté par cet élément (celui que son nettoyage peut désinscrire). */
  private invokedCallback: DomReadyActionCallback | null = null

  static create({
    id,
    action,
    payload,
  }: {
    id?: string
    action: string
    payload?: unknown
  }): string {
    return super.create({ id, action, payload })
  }

  static registerCallback<TPayload>(
    action: string,
    callback: DomReadyActionCallback<TPayload>,
  ): void {
    DomReadyActionElement.callbacks.set(
      action,
      callback as DomReadyActionCallback,
    )
  }

  /**
   * Désinscrit le callback associé à `action`.
   *
   * `callback` permet de ne désinscrire que si l'inscription courante est bien
   * celle qu'on croit : si une inscription plus récente l'a remplacée (énoncé
   * régénéré), la désinscription est ignorée. À défaut d'argument explicite,
   * c'est le callback en cours de nettoyage qui sert de référence.
   */
  static unregisterCallback(
    action: string,
    callback?: DomReadyActionCallback,
  ): void {
    const registered = DomReadyActionElement.callbacks.get(action)
    if (registered === undefined) return
    const owner = callback ?? DomReadyActionElement.callbackBeingCleanedUp
    if (owner !== null && owner !== undefined && registered !== owner) return
    DomReadyActionElement.callbacks.delete(action)
  }

  connectedCallback() {
    this.hydrateCommonAttributes()
    window.requestAnimationFrame(() => {
      if (!this.isConnected) return
      const action = this.getAttribute('action') ?? ''
      const callback = DomReadyActionElement.callbacks.get(action)
      if (!callback) return
      this.runCleanup()
      this.invokedCallback = callback
      this.cleanup =
        callback({
          element: this,
          payload: this.readPayload(),
        }) ?? null
    })
  }

  disconnectedCallback() {
    this.runCleanup()
    super.disconnectedCallback()
  }

  /** Exécute le nettoyage en mémorisant le callback auquel il se rapporte. */
  private runCleanup(): void {
    const cleanup = this.cleanup
    if (cleanup === null) {
      this.invokedCallback = null
      return
    }
    this.cleanup = null
    const previous = DomReadyActionElement.callbackBeingCleanedUp
    DomReadyActionElement.callbackBeingCleanedUp = this.invokedCallback
    try {
      cleanup()
    } finally {
      DomReadyActionElement.callbackBeingCleanedUp = previous
      this.invokedCallback = null
    }
  }

  private readPayload(): unknown {
    const raw = this.getAttribute('payload')
    if (!raw) return undefined
    try {
      return JSON.parse(raw)
    } catch {
      return raw
    }
  }
}

registerMathaleaCustomElement(DomReadyActionElement)
