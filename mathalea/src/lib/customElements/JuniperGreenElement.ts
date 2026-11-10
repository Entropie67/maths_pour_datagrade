import { context } from '../../modules/context'
import { bleuMathalea, orangeMathalea } from '../colors'
import { miseEnEvidence } from '../outils/embellissements'
import { estPremier } from '../outils/primalite'
import type { IExercice } from '../types'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

/**
 * Le jeu du Juniper Green.
 *
 * Les joueurs choisissent tour à tour un nombre de la grille : chaque nombre
 * doit être un multiple ou un diviseur du précédent et aucun nombre ne peut
 * servir deux fois. La partie s'arrête quand plus aucun multiple ni diviseur
 * du dernier nombre n'est disponible.
 *
 * Le composant est interactif au sens de MathALÉA : cliquer sur « Vérifier
 * les réponses » (ou atteindre la fin de partie, ou une erreur bloquante en
 * mode `arret`) fige la partie telle qu'elle a été jouée et lui attribue un
 * score sur 2 (voir `finalise()` et `verifQuestion()`).
 *
 * @author Rémi Angot
 */

/** Règles de départ de la partie. */
export type ModeDepart =
  /** Le premier nombre est choisi librement par le joueur. */
  | 'libre'
  /** Le premier nombre est choisi librement, mais ne peut pas être premier. */
  | 'libreSansPremier'
  /** Le premier nombre est imposé : tiré au hasard parmi les non premiers. */
  | 'aleatoireSansPremier'

/** Ce qui se passe quand le joueur choisit un nombre interdit. */
export type ModeErreur =
  /** Le message d'erreur sert d'indication : la partie continue. */
  | 'indication'
  /** Le message d'erreur arrête la partie. */
  | 'arret'

export type ReglesJuniperGreen = {
  /** Plus grand nombre de la grille. */
  max: number
  /** Règle appliquée au premier nombre de la partie. */
  modeDepart: ModeDepart
}

export type JuniperGreenOptions = {
  id?: string
  numeroExercice?: number
  questionIndex?: number
  /** Plus grand nombre de la grille. */
  max?: number
  /** Nombre de cases par ligne : 5 ou 10. */
  nombresParLigne?: number
  /** Règle appliquée au premier nombre de la partie. */
  modeDepart?: ModeDepart
  /** Ce qui se passe quand le joueur choisit un nombre interdit. */
  modeErreur?: ModeErreur
  /** Affiche une estimation du nombre maximal de coups encore possibles. */
  decompteCoupsRestants?: boolean
  /** Partie déjà jouée : sert à afficher un exemple dans la correction, ou à imposer un début de partie. */
  suite?: number[]
  /** Dévoile la partie reçue un nombre à la fois, une seconde par nombre. */
  animation?: boolean
  interactivityOn?: boolean
}

const MAX_PAR_DEFAUT = 40
const PAR_LIGNE_PAR_DEFAUT = 10
/** Durée d'affichage d'un nombre de la partie animée. */
const DELAI_ANIMATION_MS = 1000
/** Côté d'une case, en em pour suivre le zoom des vues (voir `construitInterface`). */
const TAILLE_CASE = '2.25em'
/** Score maximal attribué à la question. */
const SCORE_MAX = 2
/** Nombre de cases à choisir pour obtenir 1 point quand la partie n'est pas finie. */
export const NOMBRE_DE_CASES_POUR_UN_POINT = 4

/** La grille commence à 1 : en dessous de 2 nombres il n'y a pas de partie. */
function normaliseMax(valeur: unknown): number {
  const nombre = Math.round(Number(valeur))
  if (!Number.isFinite(nombre)) return MAX_PAR_DEFAUT
  return Math.min(200, Math.max(2, nombre))
}

/** Seules les dispositions 5 et 10 sont proposées par l'exercice. */
function normaliseParLigne(valeur: unknown): number {
  return Math.round(Number(valeur)) === 5 ? 5 : PAR_LIGNE_PAR_DEFAUT
}

function normaliseModeDepart(valeur: unknown): ModeDepart {
  if (valeur === 'libreSansPremier' || valeur === 'aleatoireSansPremier') {
    return valeur
  }
  return 'libre'
}

function normaliseModeErreur(valeur: unknown): ModeErreur {
  return valeur === 'arret' ? 'arret' : 'indication'
}

/** Un premier nombre premier n'est autorisé qu'en mode de départ libre. */
function debutPremierInterdit(modeDepart: ModeDepart): boolean {
  return modeDepart !== 'libre'
}

function nombresDeLaGrille(max: number): number[] {
  return Array.from({ length: max }, (_, index) => index + 1)
}

/** Tous les nombres non premiers de la grille : utile pour un départ imposé. */
export function nombresNonPremiers(max: number): number[] {
  return nombresDeLaGrille(max).filter((nombre) => !estPremier(nombre))
}

/** La couleur du nombre choisi au coup `index` (0 pour le premier coup) : elle alterne à chaque coup. */
function couleurDuCoup(index: number): string {
  return index % 2 === 0 ? bleuMathalea : orangeMathalea
}

/**
 * Le refus opposé au coup, ou `null` si le coup est licite.
 *
 * Les règles du jeu ne sont écrites qu'ici : l'exercice s'en sert pour tirer
 * la partie donnée en exemple dans la correction, le composant pour arbitrer
 * les clics de l'élève.
 */
export function raisonDuRefus(
  suite: readonly number[],
  nombre: number,
  regles: ReglesJuniperGreen,
): string | null {
  if (nombre < 1 || nombre > regles.max) {
    return `${nombre} n'est pas dans la grille.`
  }
  if (suite.includes(nombre)) return `${nombre} a déjà été utilisé.`
  const dernier = suite.at(-1)
  if (dernier === undefined) {
    if (debutPremierInterdit(regles.modeDepart) && estPremier(nombre)) {
      return `Il est interdit de commencer par un nombre premier (c'est à dire un nombre qui possède seulement comme diviseur 1 autre que lui-même), et ${nombre} en est un.`
    }
    return null
  }
  if (nombre % dernier !== 0 && dernier % nombre !== 0) {
    return `${nombre} n'est ni un multiple ni un diviseur de ${dernier}.`
  }
  return null
}

/** Tous les coups encore jouables après `suite`. */
export function coupsPossibles(
  suite: readonly number[],
  regles: ReglesJuniperGreen,
): number[] {
  return nombresDeLaGrille(regles.max).filter(
    (nombre) => raisonDuRefus(suite, nombre, regles) === null,
  )
}

export type EstimationCoupsRestants = {
  /** Longueur du meilleur prolongement trouvé. */
  nombre: number
  /** `true` quand tout l'arbre restant a été exploré. */
  exacte: boolean
}

/** Nombre maximal de sommets explorés avant de rendre une estimation. */
const BUDGET_RECHERCHE_COUPS = 2_000
/** Taille sous laquelle la composante accessible est explorée sans limite, une fois 1 utilisé. */
const SEUIL_RECHERCHE_EXACTE = 14

/**
 * Estime le plus grand nombre de coups qui peuvent encore être joués.
 *
 * La valeur est exacte quand tout l'arbre a été parcouru. Sur un grand état,
 * la recherche s'arrête après un nombre déterministe de nœuds : la valeur
 * obtenue reste alors une borne inférieure (une suite réellement jouable),
 * jamais une prétendue valeur maximale.
 *
 * Une fois 1 utilisé, le graphe des relations diviseur/multiple se fragmente.
 * Si la composante encore accessible est petite, la limite est retirée et le
 * calcul devient exact, même s'il reste beaucoup d'autres cases isolées.
 */
export function estimeCoupsRestants(
  suite: readonly number[],
  regles: ReglesJuniperGreen,
): EstimationCoupsRestants {
  const dernier = suite.at(-1)
  if (dernier === undefined) return { nombre: 0, exacte: false }

  const utilises = new Set(suite)
  const disponibles = nombresDeLaGrille(regles.max).filter(
    (nombre) => !utilises.has(nombre),
  )
  const voisins = new Map<number, number[]>()
  for (const nombre of [dernier, ...disponibles]) {
    voisins.set(
      nombre,
      disponibles.filter(
        (candidat) =>
          candidat !== nombre &&
          (candidat % nombre === 0 || nombre % candidat === 0),
      ),
    )
  }

  // Les cases hors de cette composante ne pourront jamais être atteintes.
  const accessibles = new Set<number>()
  const aVisiter = [dernier]
  while (aVisiter.length > 0) {
    const nombre = aVisiter.pop()
    if (nombre === undefined || accessibles.has(nombre)) continue
    accessibles.add(nombre)
    for (const voisin of voisins.get(nombre) ?? []) aVisiter.push(voisin)
  }
  accessibles.delete(dernier)

  const sansLimite =
    utilises.has(1) && accessibles.size <= SEUIL_RECHERCHE_EXACTE
  let budget = sansLimite ? Number.POSITIVE_INFINITY : BUDGET_RECHERCHE_COUPS
  let interrompue = false
  let meilleur = 0

  const visite = (
    courant: number,
    restants: ReadonlySet<number>,
    profondeur: number,
  ): void => {
    if (budget <= 0) {
      interrompue = true
      return
    }
    budget -= 1
    if (profondeur > meilleur) meilleur = profondeur

    // Les nombres les plus contraints donnent rapidement de longues suites.
    const suivants = (voisins.get(courant) ?? [])
      .filter((nombre) => restants.has(nombre))
      .sort((a, b) => {
        const degreA = (voisins.get(a) ?? []).filter((n) =>
          restants.has(n),
        ).length
        const degreB = (voisins.get(b) ?? []).filter((n) =>
          restants.has(n),
        ).length
        return degreA - degreB
      })
    for (const suivant of suivants) {
      if (budget <= 0) {
        interrompue = true
        return
      }
      const apres = new Set(restants)
      apres.delete(suivant)
      visite(suivant, apres, profondeur + 1)
    }
  }

  visite(dernier, accessibles, 0)
  return { nombre: meilleur, exacte: !interrompue }
}

function texteSuite(suite: readonly number[], fleche: string): string {
  return suite.length === 0
    ? 'Suite des nombres choisis : aucun pour l’instant.'
    : `Suite des nombres choisis : ${suite.join(fleche)}.`
}

function renderLatexGrille(
  max: number,
  nombresParLigne: number,
  suite: readonly number[],
): string {
  const nombres = nombresDeLaGrille(max)
  const lignes: string[] = []
  for (let debut = 0; debut < nombres.length; debut += nombresParLigne) {
    const ligne = nombres
      .slice(debut, debut + nombresParLigne)
      .map((nombre) => {
        const index = suite.indexOf(nombre)
        return index === -1
          ? `$${nombre}$`
          : `$${miseEnEvidence(nombre, couleurDuCoup(index))}$`
      })
    while (ligne.length < nombresParLigne) ligne.push('')
    lignes.push(`${ligne.join(' & ')} \\\\ \\hline`)
  }
  const grille = [
    '\\begin{center}',
    `\\begin{tabular}{|${'c|'.repeat(nombresParLigne)}}`,
    '\\hline',
    ...lignes,
    '\\end{tabular}',
    '\\end{center}',
  ].join('\n')
  if (suite.length === 0) return grille
  const suiteEnCouleurs = suite
    .map((nombre, index) => miseEnEvidence(nombre, couleurDuCoup(index)))
    .join(' \\to ')
  return `${grille}\nSuite des nombres choisis : $${suiteEnCouleurs}$.`
}

function renderTypstGrille(
  max: number,
  nombresParLigne: number,
  suite: readonly number[],
): string {
  const cellules = nombresDeLaGrille(max)
    .map((nombre) => {
      const index = suite.indexOf(nombre)
      return index === -1
        ? `[$${nombre}$]`
        : `text(fill: rgb("${couleurDuCoup(index)}"), weight: "bold")[$${nombre}$]`
    })
    .join(', ')
  const grille = `#align(center, table(columns: ${nombresParLigne}, align: center + horizon, stroke: 0.5pt, inset: 6pt, ${cellules}))`
  if (suite.length === 0) return grille
  return `${grille}\n\n${texteSuite(suite, ' → ')}`
}

/** Accepte aussi bien un tableau qu'une chaîne JSON (reprise de session). */
function parseSuite(valeur: unknown): number[] {
  let brut: unknown = valeur
  if (typeof valeur === 'string') {
    try {
      brut = JSON.parse(valeur)
    } catch {
      return []
    }
  }
  if (!Array.isArray(brut)) return []
  return brut
    .map((element) => Math.round(Number(element)))
    .filter((nombre) => Number.isFinite(nombre))
}

export class JuniperGreenElement extends MathaleaCustomElement {
  static readonly elementTag = 'juniper-green'

  private nombresParLigne = PAR_LIGNE_PAR_DEFAUT
  private regles: ReglesJuniperGreen = {
    max: MAX_PAR_DEFAUT,
    modeDepart: 'libre',
  }
  private modeErreur: ModeErreur = 'indication'
  private decompteCoupsRestants = false
  private numeroExercice = 0
  private questionIndex = 0

  private suite: number[] = []
  /** Nombres de `suite` déjà dévoilés : toute la suite hors animation. */
  private nbAffiches = 0
  private animation = false
  private minuterie: number | null = null
  private avertissement = ''
  /** La partie a été arrêtée par une erreur (mode `arret`). */
  private arretee = false
  /** Coups encore possibles au moment où la partie a été arrêtée par une erreur. */
  private possibilitesAuMomentDeLerreur: number[] = []
  /** La partie a été figée par `finalise()` (bouton « Vérifier » ou arrêt automatique). */
  private verifiee = false
  private scoreFinal = 0
  private cellules = new Map<number, HTMLButtonElement>()
  private zoneSuite: HTMLElement | null = null
  private zoneMessage: HTMLElement | null = null

  static create(options: JuniperGreenOptions = {}): string {
    const max = normaliseMax(options.max)
    const nombresParLigne = normaliseParLigne(options.nombresParLigne)
    const modeDepart = normaliseModeDepart(options.modeDepart)
    const modeErreur = normaliseModeErreur(options.modeErreur)
    const decompteCoupsRestants = options.decompteCoupsRestants ?? false
    const suite = options.suite ?? []
    const animation = options.animation ?? false
    if (context.isTypst) {
      return `<mathalea-typst>${renderTypstGrille(max, nombresParLigne, suite)}</mathalea-typst>`
    }
    if (!context.isHtml) {
      return renderLatexGrille(max, nombresParLigne, suite)
    }
    const numeroExercice = options.numeroExercice ?? 0
    const questionIndex = options.questionIndex ?? 0
    const id =
      options.id ??
      `${JuniperGreenElement.elementTag}Ex${numeroExercice}Q${questionIndex}`
    return super.create({
      id,
      max,
      nombresParLigne,
      modeDepart,
      modeErreur,
      decompteCoupsRestants,
      suite,
      animation,
      interactivityOn: options.interactivityOn ?? true,
      numeroExercice,
      questionIndex,
    })
  }

  connectedCallback(): void {
    this.hydrateCommonAttributes()
    this.nombresParLigne = normaliseParLigne(
      this.getAttribute('nombres-par-ligne'),
    )
    this.regles = {
      max: normaliseMax(this.getAttribute('max')),
      modeDepart: normaliseModeDepart(this.getAttribute('mode-depart')),
    }
    this.modeErreur = normaliseModeErreur(this.getAttribute('mode-erreur'))
    this.decompteCoupsRestants =
      this.getAttribute('decompte-coups-restants') === 'true'
    this.numeroExercice = Number(this.getAttribute('numero-exercice')) || 0
    this.questionIndex = Number(this.getAttribute('question-index')) || 0
    this.animation = this.getAttribute('animation') === 'true'
    this.construitInterface()
    this.update(this.getAttribute('suite'))
  }

  disconnectedCallback(): void {
    this.arreteAnimation()
    this.cellules.clear()
    this.zoneSuite = null
    this.zoneMessage = null
    this.innerHTML = ''
  }

  get value(): number[] {
    return [...this.suite]
  }

  set value(prochaineValeur: unknown) {
    this.update(prochaineValeur)
  }

  /** Rejoue la suite reçue coup par coup pour n'accepter qu'une partie licite. */
  update(prochaineValeur: unknown): void {
    this.arreteAnimation()
    this.suite = []
    for (const nombre of parseSuite(prochaineValeur)) {
      if (raisonDuRefus(this.suite, nombre, this.regles) !== null) break
      this.suite.push(nombre)
    }
    this.avertissement = ''
    this.arretee = false
    this.possibilitesAuMomentDeLerreur = []
    if (this.animation && this.suite.length > 0) this.demarreAnimation()
    else this.nbAffiches = this.suite.length
    this.render()
  }

  /** Dévoile le premier nombre, puis les suivants une seconde par nombre. */
  private demarreAnimation(): void {
    this.nbAffiches = 1
    this.minuterie = window.setInterval(() => {
      if (this.nbAffiches >= this.suite.length) {
        this.arreteAnimation()
        return
      }
      this.nbAffiches += 1
      this.render()
    }, DELAI_ANIMATION_MS)
  }

  private arreteAnimation(): void {
    if (this.minuterie === null) return
    window.clearInterval(this.minuterie)
    this.minuterie = null
  }

  protected onInteractivityChanged(): void {
    this.render()
  }

  render(): string | void {
    if (!context.isHtml || context.isTypst) return this.renderLatex()
    this.rafraichitGrille()
    this.rafraichitSuite()
    this.rafraichitMessage()
    return ''
  }

  protected renderLatex(): string {
    return renderLatexGrille(
      this.regles.max,
      this.nombresParLigne,
      this.interactivityOn ? [] : this.suite,
    )
  }

  private get nombresAffiches(): number[] {
    return this.suite.slice(0, this.nbAffiches)
  }

  private get dernier(): number | undefined {
    return this.suite.at(-1)
  }

  private get partieTerminee(): boolean {
    if (this.suite.length === 0) return false
    return coupsPossibles(this.suite, this.regles).length === 0
  }

  /** La partie ne peut plus être jouée : soit terminée, soit arrêtée par une erreur. */
  private get partieBloquee(): boolean {
    return this.partieTerminee || this.arretee
  }

  /**
   * Toutes les longueurs sont en `em`, jamais en `rem` ni en classe Tailwind
   * de taille fixe : le zoom des vues prof, élève et TBI pose une `font-size`
   * en rem sur le conteneur de l'énoncé (voir `resizeContent()`), donc seul le
   * relatif suit l'agrandissement demandé par l'enseignant.
   */
  private construitInterface(): void {
    this.innerHTML = ''
    this.cellules.clear()
    this.classList.add('block', 'not-prose')
    this.style.margin = '1em 0'

    // Une grille agrandie par le zoom, ou large de 10 colonnes sur un écran
    // étroit, dépasse la colonne de l'énoncé : elle défile plutôt que d'être
    // rognée. Le padding laisse la place au liseré du dernier nombre joué.
    const cadre = document.createElement('div')
    cadre.style.maxWidth = '100%'
    cadre.style.overflowX = 'auto'
    cadre.style.padding = '0.2em'

    const grille = document.createElement('div')
    grille.className = 'grid w-fit'
    grille.style.gap = '0.25em'
    grille.style.gridTemplateColumns = `repeat(${this.nombresParLigne}, ${TAILLE_CASE})`
    for (const nombre of nombresDeLaGrille(this.regles.max)) {
      const cellule = document.createElement('button')
      cellule.type = 'button'
      cellule.dataset.nombre = String(nombre)
      cellule.textContent = String(nombre)
      cellule.className =
        'flex items-center justify-center rounded-md border ' +
        'border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest ' +
        'font-semibold leading-none'
      // Largeur et hauteur en em plutôt qu'un `aspect-ratio` déduit de la
      // colonne : les deux dimensions suivent alors directement le zoom.
      cellule.style.fontSize = '1em'
      cellule.style.width = TAILLE_CASE
      cellule.style.height = TAILLE_CASE
      cellule.addEventListener('click', this.clicCellule)
      grille.appendChild(cellule)
      this.cellules.set(nombre, cellule)
    }
    cadre.appendChild(grille)
    this.appendChild(cadre)

    this.zoneSuite = document.createElement('div')
    this.zoneSuite.className =
      'text-coopmaths-corpus dark:text-coopmathsdark-corpus'
    this.zoneSuite.style.marginTop = '1em'
    this.appendChild(this.zoneSuite)

    this.zoneMessage = document.createElement('div')
    this.zoneMessage.style.marginTop = '0.5em'
    this.zoneMessage.style.fontSize = '0.875em'
    this.zoneMessage.setAttribute('aria-live', 'polite')
    this.appendChild(this.zoneMessage)
  }

  private readonly clicCellule = (evenement: Event): void => {
    if (!this.interactivityOn || this.partieBloquee) return
    const cellule = evenement.currentTarget as HTMLButtonElement
    const nombre = Number(cellule.dataset.nombre)
    const refus = raisonDuRefus(this.suite, nombre, this.regles)
    if (refus === null) {
      this.avertissement = ''
      this.suite.push(nombre)
      this.nbAffiches = this.suite.length
    } else if (this.modeErreur === 'arret') {
      this.possibilitesAuMomentDeLerreur = coupsPossibles(
        this.suite,
        this.regles,
      )
      this.avertissement = refus
      this.arretee = true
    } else {
      this.avertissement = refus
    }
    this.render()
    // Fin de partie ou erreur bloquante : la partie s'arrête d'elle-même, il
    // n'y a donc plus besoin d'attendre que l'élève clique sur « Vérifier ».
    if (this.partieBloquee) this.declencheVerification()
  }

  /**
   * Déclenche le bouton « Vérifier les réponses » de l'exercice, comme un
   * clic de l'élève. Son id dépend de la vue qui héberge l'exercice : vue
   * élève (`buttonScoreEx…`) ou vue prof/aperçu (`verif…`).
   */
  private declencheVerification(): void {
    const bouton =
      document.querySelector<HTMLButtonElement>(
        `#buttonScoreEx${this.numeroExercice}`,
      ) ??
      document.querySelector<HTMLButtonElement>(`#verif${this.numeroExercice}`)
    bouton?.click()
  }

  /**
   * Fige la partie telle qu'elle a été jouée et lui attribue un score sur
   * `SCORE_MAX` : la partie terminée (plus aucun coup possible) rapporte le
   * score maximal, sinon le score dépend du nombre de cases déjà choisies.
   * Appelée par `verifQuestion()`, que ce soit sur un clic « Vérifier », une
   * fin de partie naturelle ou une erreur bloquante (mode `arret`).
   */
  finalise(): number {
    if (this.verifiee) return this.scoreFinal
    this.scoreFinal = this.partieTerminee
      ? SCORE_MAX
      : this.suite.length >= NOMBRE_DE_CASES_POUR_UN_POINT
        ? 1
        : 0
    this.verifiee = true
    // Le setter déclenche onInteractivityChanged() -> render() : la grille se
    // fige et le message affiche le score.
    this.interactivityOn = false
    return this.scoreFinal
  }

  private rafraichitGrille(): void {
    const jouable = this.interactivityOn && !this.partieBloquee
    const affiches = this.nombresAffiches
    for (const [nombre, cellule] of this.cellules) {
      const index = affiches.indexOf(nombre)
      const utilise = index !== -1
      cellule.style.backgroundColor = utilise ? couleurDuCoup(index) : ''
      cellule.style.color = utilise ? '#ffffff' : ''
      cellule.style.cursor = jouable ? 'pointer' : 'default'
      cellule.style.outline =
        this.interactivityOn && nombre === this.dernier
          ? `2px solid ${orangeMathalea}`
          : ''
      cellule.style.outlineOffset =
        this.interactivityOn && nombre === this.dernier ? '2px' : ''
      cellule.setAttribute('aria-pressed', utilise ? 'true' : 'false')
      cellule.disabled = !jouable
    }
  }

  private rafraichitSuite(): void {
    const zoneSuite = this.zoneSuite
    if (zoneSuite === null) return
    const nombres = this.nombresAffiches
    if (nombres.length === 0) {
      zoneSuite.textContent = texteSuite(nombres, ' → ')
      return
    }
    zoneSuite.replaceChildren(
      document.createTextNode('Suite des nombres choisis : '),
    )
    nombres.forEach((nombre, index) => {
      if (index > 0) zoneSuite.append(' → ')
      const nombreEnCouleur = document.createElement('span')
      nombreEnCouleur.dataset.indexCoup = String(index)
      nombreEnCouleur.style.color = couleurDuCoup(index)
      nombreEnCouleur.style.fontWeight = 'bold'
      nombreEnCouleur.textContent = String(nombre)
      zoneSuite.appendChild(nombreEnCouleur)
    })
    zoneSuite.append('.')
  }

  /** « La suite compte N nombre(s). », ou une formulation dédiée quand elle est vide. */
  private texteTailleSuite(): string {
    if (this.suite.length === 0) return 'Aucun nombre n’a encore été choisi.'
    const pluriel = this.suite.length > 1 ? 's' : ''
    return `La suite compte ${this.suite.length} nombre${pluriel}.`
  }

  private texteArretee(): string {
    const possibilites = this.possibilitesAuMomentDeLerreur
    const texteChoix =
      possibilites.length === 0
        ? 'Aucun autre nombre n’était encore disponible.'
        : `Les nombres encore possibles étaient : ${possibilites.join(', ')}.`
    return `Partie arrêtée : ${this.avertissement} ${texteChoix} ${this.texteTailleSuite()}`
  }

  private texteTerminee(prefixe = ''): string {
    return (
      `${prefixe}Partie terminée : aucun multiple ni diviseur de ${this.dernier} ` +
      `n'est encore disponible. ${this.texteTailleSuite()}`
    )
  }

  /** Message affiché une fois la partie figée par `finalise()`. */
  private texteVerification(): string {
    if (this.partieTerminee) return `${this.texteTerminee('Bravo ! ')}`
    if (this.arretee) return `${this.texteArretee()}`
    return `Partie arrêtée. ${this.texteTailleSuite()}`
  }

  private rafraichitMessage(): void {
    if (!this.zoneMessage) return
    // Dans la correction (exemple de partie donné tout joué), il n'y a ni
    // consigne de coup suivant, ni annonce de fin de partie.
    if (!this.interactivityOn && !this.verifiee) {
      this.zoneMessage.textContent = ''
      return
    }
    if (this.verifiee) {
      this.zoneMessage.style.color = orangeMathalea
      this.zoneMessage.textContent = this.texteVerification()
      return
    }
    if (this.arretee) {
      this.zoneMessage.style.color = orangeMathalea
      this.zoneMessage.textContent = this.texteArretee()
      return
    }
    if (this.partieTerminee) {
      this.zoneMessage.style.color = orangeMathalea
      this.zoneMessage.textContent = this.texteTerminee()
      return
    }
    if (this.avertissement !== '') {
      this.zoneMessage.style.color = orangeMathalea
      this.zoneMessage.textContent = this.avertissement
      return
    }
    this.zoneMessage.style.color = ''
    const consigne =
      this.dernier === undefined
        ? debutPremierInterdit(this.regles.modeDepart)
          ? 'Choisir un premier nombre, sans choisir un nombre premier.'
          : 'Choisir un premier nombre.'
        : `Choisir un multiple ou un diviseur de ${this.dernier}.`
    if (this.dernier === undefined || !this.decompteCoupsRestants) {
      this.zoneMessage.textContent = consigne
      return
    }
    const estimation = estimeCoupsRestants(this.suite, this.regles)
    const pluriel = estimation.nombre > 1 ? 's' : ''
    const verbe = estimation.nombre > 1 ? 'sont' : 'est'
    const indication = estimation.exacte
      ? `Au maximum, ${estimation.nombre} coup${pluriel} ${verbe} encore possible${pluriel}.`
      : `Au moins ${estimation.nombre} coup${pluriel} ${verbe} encore possible${pluriel}.`
    this.zoneMessage.textContent = `${consigne} ${indication}`
  }

  /**
   * Vérification interactive : appelée par le moteur MathALÉA sur un clic
   * « Vérifier les réponses ». Fige la partie et lui attribue son score,
   * qu'elle ait déjà été figée automatiquement (fin de partie, erreur
   * bloquante) ou non (l'élève arrête volontairement une partie en cours).
   */
  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): {
    isOk: boolean
    feedback: string
    score: { nbBonnesReponses: number; nbReponses: number }
  } {
    const id = `${JuniperGreenElement.elementTag}Ex${exercice.numeroExercice ?? 0}Q${questionIndex}`
    const element = document.getElementById(id) as JuniperGreenElement | null
    if (element == null) {
      return {
        isOk: false,
        feedback: '',
        score: { nbBonnesReponses: 0, nbReponses: SCORE_MAX },
      }
    }
    exercice.answers ??= {}
    exercice.answers[element.id] = JSON.stringify(element.value)
    const score = element.finalise()
    return {
      isOk: score === SCORE_MAX,
      feedback: '',
      score: { nbBonnesReponses: score, nbReponses: SCORE_MAX },
    }
  }

  static pointsMaxQuestion(): number {
    return SCORE_MAX
  }
}

registerMathaleaCustomElement(JuniperGreenElement)

/** Helper d'injection depuis l'exercice. */
export function ajouteJuniperGreen(
  exercice: IExercice,
  questionIndex: number,
  options: JuniperGreenOptions = {},
): string {
  return JuniperGreenElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
  })
}
