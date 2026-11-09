/**
 * Connexion à un salon : document Yjs synchronisé par le serveur, présence de
 * chacun (parcours ouvert, élément en cours de modification) et verrous qui
 * en découlent. Chargé seulement quand on est connecté à un salon.
 */
import { HocuspocusProvider } from '@hocuspocus/provider'
import { IndexeddbPersistence } from 'y-indexeddb'
import * as Y from 'yjs'
import type { Lesson, Objective, Parcours } from '../parcoursTypes'
import { salonsSocketUrl } from './salonApi'
import {
  colorOf,
  type Pointer,
  type Presence,
  type SalonSnapshot,
} from './salonPresence'
import {
  addComment,
  addMessage,
  addSalonObjectives,
  readAll,
  readComments,
  readLessons,
  readMessages,
  readSalonObjectives,
  removeLesson,
  removeParcours,
  setResolved,
  writeLesson,
  writeParcours,
  writeSalonObjectives,
} from './salonDoc'

export class SalonConnection {
  readonly doc = new Y.Doc()
  private provider: HocuspocusProvider
  // Copie du salon dans ce navigateur : une modification faite hors ligne
  // survit à la fermeture de l'onglet et part au retour de la connexion
  private saved: IndexeddbPersistence
  private status: SalonSnapshot['status'] = 'connexion'
  private unsynced = 0
  private local: Omit<Presence, 'clientId'>
  // Contenu relu seulement quand le document change (pas à chaque mouvement de souris)
  private content: Pick<
    SalonSnapshot,
    'parcours' | 'fiches' | 'objectives' | 'messages' | 'comments'
  > | null = null

  constructor(
    readonly salon: string,
    token: string,
    readonly user: { id: number; nom: string },
    private onchange: (s: SalonSnapshot) => void,
  ) {
    this.local = {
      nom: user.nom,
      couleur: colorOf(user.id),
      parcours: null,
      element: null,
      depuis: Date.now(),
    }
    this.saved = new IndexeddbPersistence(
      `mathalea-salon-${salon}-${user.id}`,
      this.doc,
    )
    this.provider = new HocuspocusProvider({
      url: salonsSocketUrl(),
      name: `salon:${salon}`,
      document: this.doc,
      token,
      onSynced: () => this.setStatus('connecte'),
      onDisconnect: () => this.setStatus('hors-ligne'),
      onAuthenticationFailed: () => {
        // Plus accès au salon : sa copie dans ce navigateur n'a plus lieu d'être
        void this.saved.clearData()
        this.setStatus('refuse')
      },
      onUnsyncedChanges: ({ number }) => {
        this.unsynced = number
        // Réseau revenu sans coupure de la WebSocket : tout est reçu, on est en ligne
        if (number === 0 && navigator.onLine && this.status === 'hors-ligne')
          this.status = 'connecte'
        this.emit()
      },
    })
    this.provider.setAwarenessField('presence', this.local)
    // Une tentative de connexion qui ne répond pas (serveur ou réseau
    // injoignable) peut rester en attente sans fin : on la relance
    this.watchdog = setInterval(() => {
      if (this.status === 'connecte' || this.status === 'refuse') return
      if (!navigator.onLine) return
      const socket = this.provider.configuration.websocketProvider
      if (socket.status !== 'connected') void socket.connect()
    }, 6000)
    // Le navigateur sait tout de suite qu'il a perdu le réseau ; la WebSocket,
    // elle, peut rester « ouverte » de longues secondes
    window.addEventListener('offline', this.wentOffline)
    window.addEventListener('online', this.cameBack)
    if (!navigator.onLine) this.status = 'hors-ligne'
    this.doc.on('update', () => {
      this.content = null
      this.emit()
    })
    this.provider.awareness?.on('change', () => this.emit())
  }

  private watchdog: ReturnType<typeof setInterval>
  private wentOffline = () => this.setStatus('hors-ligne')
  // Réseau revenu : on resynchronise (ce qui n'est pas arrivé repart)
  private cameBack = () => {
    void this.provider.connect()
    this.provider.forceSync()
  }

  private setStatus(s: SalonSnapshot['status']) {
    this.status = s
    this.emit()
  }

  private emit() {
    this.onchange(this.snapshot())
  }

  snapshot(): SalonSnapshot {
    const me = this.doc.clientID
    const presences: Presence[] = []
    for (const [clientId, state] of this.provider.awareness?.getStates() ??
      []) {
      const p = (state as { presence?: Omit<Presence, 'clientId'> }).presence
      if (clientId !== me && p) presences.push({ ...p, clientId })
    }
    this.content ??= {
      parcours: readAll(this.doc),
      fiches: readLessons(this.doc),
      objectives: readSalonObjectives(this.doc),
      messages: readMessages(this.doc),
      comments: readComments(this.doc),
    }
    return {
      status: this.status,
      unsynced: this.unsynced,
      ...this.content,
      presences,
      me: { ...this.local, clientId: me },
    }
  }

  /** Parcours ouvert et élément en cours de modification (null : aucun) */
  focus(parcours: string | null, element: string | null) {
    if (this.local.parcours === parcours && this.local.element === element)
      return
    this.local = { ...this.local, parcours, element, depuis: Date.now() }
    this.provider.setAwarenessField('presence', this.local)
    this.emit()
  }

  /** Souris : au plus vingt envois par seconde */
  private pointerTimer: ReturnType<typeof setTimeout> | null = null
  private pendingPointer: Pointer | null = null
  pointer(p: Pointer | null) {
    if (!p && !this.pendingPointer && !this.local.pointeur) return
    this.pendingPointer = p
    if (this.pointerTimer) return
    this.pointerTimer = setTimeout(() => {
      this.pointerTimer = null
      this.local = { ...this.local, pointeur: this.pendingPointer }
      this.provider.setAwarenessField('presence', this.local)
    }, 50)
  }

  write(p: Parcours) {
    return writeParcours(this.doc, p)
  }

  remove(id: string) {
    removeParcours(this.doc, id)
  }

  writeLesson(id: string, l: Lesson) {
    return writeLesson(this.doc, id, l)
  }

  removeLesson(id: string) {
    removeLesson(this.doc, id)
  }

  writeObjectives(list: Objective[]) {
    writeSalonObjectives(this.doc, list)
  }

  /** Objectifs absents ajoutés ; renvoie leur nombre */
  addObjectives(list: Objective[]) {
    return addSalonObjectives(this.doc, list)
  }

  message(texte: string) {
    addMessage(this.doc, this.user.nom, texte)
  }

  /** Commentaire sur un élément, ou réponse à un commentaire (`parent`) */
  comment(parcours: string, element: string, texte: string, parent?: string) {
    addComment(this.doc, {
      parcours,
      element,
      auteur: this.user.nom,
      texte,
      ...(parent ? { parent } : {}),
    })
  }

  resolve(id: string, resolu: boolean) {
    setResolved(this.doc, id, resolu)
  }

  /** Copie de ce navigateur effacée (déconnexion) */
  async forget() {
    await this.saved.clearData()
  }

  destroy() {
    clearInterval(this.watchdog)
    window.removeEventListener('offline', this.wentOffline)
    window.removeEventListener('online', this.cameBack)
    if (this.pointerTimer) clearTimeout(this.pointerTimer)
    this.provider.destroy()
    void this.saved.destroy()
    this.doc.destroy()
  }
}
