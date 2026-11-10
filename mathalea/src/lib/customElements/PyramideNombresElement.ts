import { context } from '../../modules/context'
import { orangeMathalea, vertMathalea } from '../colors'
import { miseEnEvidence } from '../outils/embellissements'
import {
  nbCasesDeLEtage,
  type OperationPyramide,
} from '../outils/pyramideNombres'
import type { IExercice } from '../types'
import {
  ajouteResultatCheck,
  cleDeLaCase as cleDeLaCasePartagee,
  verifieLesCases,
  type GrilleDeChiffres,
  type ResultatVerification,
} from './grilleDeChiffres'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'

/**
 * Le barème d'une pyramide : toujours 5 points, comme le nombre d'étages
 * fixé par `EN-pyramide.ts` (`NB_ETAGES`).
 */
const POINTS_MAX_PYRAMIDE = 5

/**
 * Une pyramide de nombres : des cases rondes empilées en triangle, reliées deux
 * à deux par une opération qui donne la case posée juste au-dessus d'elles.
 *
 * L'opération change d'une paire de cases à l'autre : elle est écrite dans une
 * pastille grise posée à la jonction des deux cases concernées, à la hauteur de
 * leur étage. Les cases données par l'énoncé sont écrites d'avance et ne
 * comptent pas dans le score ; les autres attendent un entier, éventuellement
 * négatif.
 *
 * Le composant rend les trois sorties attendues d'un composant d'évaluation :
 * HTML interactif, LaTeX (tikz) et Typst. La solution n'est transmise que dans
 * la correction, pour ne pas la livrer dans le DOM de l'énoncé.
 *
 * @author Rémi Angot
 */

export type PyramideNombresOptions = {
  id?: string
  numeroExercice?: number
  questionIndex?: number
  /** Nombre d'étages de la pyramide. */
  nbEtages: number
  /**
   * `operations[etage][index]` relie les cases `index` et `index + 1` de
   * l'étage (l'étage 0 étant celui du bas) pour donner la case posée au-dessus.
   */
  operations: OperationPyramide[][]
  /** Les valeurs écrites dans l'énoncé, `null` pour une case à trouver. */
  donnees: (number | null)[][]
  /** Solution complète : à ne transmettre que pour la correction. */
  solution?: number[][]
  interactivityOn?: boolean
  /**
   * Affiche la touche « − » du clavier simple : à réserver aux pyramides où
   * une valeur négative est réellement possible, pour ne pas proposer une
   * touche qui ne peut mener qu'à une réponse fausse.
   */
  avecNombresNegatifs?: boolean
}

/** Diamètre d'une case, en em pour suivre le zoom des vues. */
const DIAMETRE = 3.2
/**
 * Écart vertical entre deux étages, en em. Plus petit que le diamètre : les
 * cases de deux étages voisins se chevauchent légèrement, comme sur les
 * pyramides dessinées à la main.
 */
const PAS = DIAMETRE * 0.82
/** Diamètre de la pastille qui porte l'opération, en em. */
const PASTILLE = DIAMETRE * 0.32
/** Épaisseur du trait d'une case, en em. */
const TRAIT = 0.06
/** Taille du symbole d'une opération, en em. */
const TAILLE_SYMBOLE = 0.9

/** Les mêmes longueurs pour les sorties imprimables, en cm. */
const DIAMETRE_TEX = 1
const PAS_TEX = DIAMETRE_TEX * 0.82
const PASTILLE_TEX = DIAMETRE_TEX * 0.32

/** Le symbole affiché de chaque opération. */
const SYMBOLES: Record<OperationPyramide, string> = {
  '+': '+',
  '-': '−',
  '×': '×',
  '÷': '÷',
}

/** Le symbole LaTeX de chaque opération, pour le mode mathématique. */
const SYMBOLES_LATEX: Record<OperationPyramide, string> = {
  '+': '+',
  '-': '-',
  '×': '\\times',
  '÷': '\\div',
}

/** Le symbole Typst de chaque opération, pour le mode mathématique. */
const SYMBOLES_TYPST: Record<OperationPyramide, string> = {
  '+': '+',
  '-': '-',
  '×': 'times',
  '÷': 'div',
}

/**
 * La clé de réponse d'une case, à la convention des tableaux MathALÉA : la
 * ligne 1 est le sommet de la pyramide, la colonne 1 sa case la plus à gauche.
 */
export function cleDeLaCase(
  etage: number,
  index: number,
  nbEtages: number,
): string {
  return cleDeLaCasePartagee(nbEtages - 1 - etage, index)
}

/** Le centre d'une case, en unités de diamètre, mesuré depuis le coin haut gauche. */
function centreDeLaCase(
  etage: number,
  index: number,
  nbEtages: number,
  diametre: number,
  pas: number,
): { x: number; y: number } {
  return {
    x: (etage / 2 + index + 0.5) * diametre,
    y: (nbEtages - 1 - etage) * pas + diametre / 2,
  }
}

/** Le centre de la pastille posée entre deux cases voisines d'un étage. */
function centreDeLaPastille(
  etage: number,
  index: number,
  nbEtages: number,
  diametre: number,
  pas: number,
): { x: number; y: number } {
  return {
    x: (etage / 2 + index + 1) * diametre,
    y: (nbEtages - 1 - etage) * pas + diametre / 2,
  }
}

function largeurTotale(nbEtages: number, diametre: number): number {
  return nbEtages * diametre
}

function hauteurTotale(
  nbEtages: number,
  diametre: number,
  pas: number,
): number {
  return (nbEtages - 1) * pas + diametre
}

function normaliseNbEtages(valeur: unknown): number {
  const nombre = Math.round(Number(valeur))
  if (!Number.isFinite(nombre)) return 5
  return Math.min(6, Math.max(2, nombre))
}

/** Accepte aussi bien un objet qu'une chaîne JSON (attribut du DOM). */
function parseJson(valeur: unknown): unknown {
  if (typeof valeur !== 'string') return valeur
  try {
    return JSON.parse(valeur)
  } catch {
    return null
  }
}

function parseOperations(valeur: unknown): OperationPyramide[][] {
  const brut = parseJson(valeur)
  if (!Array.isArray(brut)) return []
  return brut.map((etage) =>
    Array.isArray(etage)
      ? etage.filter(
          (operation): operation is OperationPyramide =>
            operation === '+' ||
            operation === '-' ||
            operation === '×' ||
            operation === '÷',
        )
      : [],
  )
}

function parseDonnees(valeur: unknown): (number | null)[][] {
  const brut = parseJson(valeur)
  if (!Array.isArray(brut)) return []
  return brut.map((etage) =>
    Array.isArray(etage)
      ? etage.map((valeurCase) =>
          typeof valeurCase === 'number' && Number.isFinite(valeurCase)
            ? valeurCase
            : null,
        )
      : [],
  )
}

function parseSolution(valeur: unknown): number[][] | null {
  const brut = parseJson(valeur)
  if (!Array.isArray(brut)) return null
  if (!brut.every((etage) => Array.isArray(etage))) return null
  return brut as number[][]
}

/**
 * La taille du texte d'une case, en em.
 *
 * Une case est ronde : un nombre long déborderait de la corde qui passe par
 * son centre. Il est donc écrit d'autant plus petit qu'il a de caractères, le
 * signe compris.
 */
function tailleDuTexte(texte: string): number {
  if (texte.length <= 3) return 1.1
  if (texte.length === 4) return 0.95
  return 0.8
}

/** Les mêmes trois tailles, dans les commandes de LaTeX. */
const TAILLES_LATEX: Record<number, string> = {
  1.1: '\\large',
  0.95: '\\normalsize',
  0.8: '\\small',
}

/** Les mêmes trois tailles, en points pour Typst. */
const TAILLES_TYPST: Record<number, number> = {
  1.1: 12,
  0.95: 10,
  0.8: 8,
}

/**
 * La valeur à écrire dans une case : celle de l'énoncé, ou celle de la
 * solution quand la pyramide est celle d'une correction.
 */
function contenuDeLaCase(
  etage: number,
  index: number,
  donnees: (number | null)[][],
  solution: number[][] | null,
): { valeur: number; donnee: boolean } | null {
  const donnee = donnees[etage]?.[index]
  if (donnee != null) return { valeur: donnee, donnee: true }
  const trouvee = solution?.[etage]?.[index]
  if (trouvee == null) return null
  return { valeur: trouvee, donnee: false }
}

/* -------------------------------------------------------------------------- */
/* Sorties imprimables                                                         */
/* -------------------------------------------------------------------------- */

function cm(valeur: number): string {
  return `${Number(valeur.toFixed(3))}`
}

/** La pyramide en tikz. */
export function renderLatexPyramide(
  nbEtages: number,
  operations: OperationPyramide[][],
  donnees: (number | null)[][],
  solution: number[][] | null,
): string {
  const hauteur = hauteurTotale(nbEtages, DIAMETRE_TEX, PAS_TEX)
  // Les ordonnées tikz montent, celles de la géométrie partagée descendent.
  const ordonnee = (y: number): number => hauteur - y
  const cases: string[] = []
  const valeurs: string[] = []
  for (let etage = 0; etage < nbEtages; etage++) {
    for (let index = 0; index < nbCasesDeLEtage(etage, nbEtages); index++) {
      const centre = centreDeLaCase(
        etage,
        index,
        nbEtages,
        DIAMETRE_TEX,
        PAS_TEX,
      )
      cases.push(
        `\\draw[line width=0.6pt] (${cm(centre.x)},${cm(ordonnee(centre.y))}) circle (${cm(DIAMETRE_TEX / 2)});`,
      )
      const contenu = contenuDeLaCase(etage, index, donnees, solution)
      if (contenu === null) continue
      // La valeur trouvée est le résultat de l'élève : elle est mise en
      // évidence, tandis qu'une valeur donnée par l'énoncé reste en noir.
      const texte = contenu.donnee
        ? `${contenu.valeur}`
        : miseEnEvidence(contenu.valeur)
      valeurs.push(
        `\\node[font=${TAILLES_LATEX[tailleDuTexte(String(contenu.valeur))]}] at (${cm(centre.x)},${cm(ordonnee(centre.y))}) {$${texte}$};`,
      )
    }
  }
  const pastilles: string[] = []
  for (let etage = 0; etage < nbEtages - 1; etage++) {
    for (let index = 0; index < (operations[etage]?.length ?? 0); index++) {
      const centre = centreDeLaPastille(
        etage,
        index,
        nbEtages,
        DIAMETRE_TEX,
        PAS_TEX,
      )
      const position = `(${cm(centre.x)},${cm(ordonnee(centre.y))})`
      pastilles.push(
        `\\filldraw[fill=black!20, draw=black, line width=0.4pt] ${position} circle (${cm(PASTILLE_TEX / 2)});`,
        `\\node[font=\\small] at ${position} {$${SYMBOLES_LATEX[operations[etage][index]]}$};`,
      )
    }
  }
  return [
    '\\begin{center}',
    '\\begin{tikzpicture}[x=1cm,y=1cm]',
    ...cases,
    ...pastilles,
    ...valeurs,
    '\\end{tikzpicture}',
    '\\end{center}',
  ].join('\n')
}

function pt(valeur: number): string {
  return `${Number((valeur * 28.35).toFixed(2))}pt`
}

/** La pyramide en Typst : des cercles posés un à un dans un bloc. */
export function renderTypstPyramide(
  nbEtages: number,
  operations: OperationPyramide[][],
  donnees: (number | null)[][],
  solution: number[][] | null,
): string {
  const lignes: string[] = [
    `#align(center)[#block(width: ${pt(largeurTotale(nbEtages, DIAMETRE_TEX))}, ` +
      `height: ${pt(hauteurTotale(nbEtages, DIAMETRE_TEX, PAS_TEX))})[`,
  ]
  const centre = (
    x: number,
    y: number,
    cote: number,
    contenu: string,
  ): string =>
    `  #place(top + left, dx: ${pt(x - cote / 2)}, dy: ${pt(y - cote / 2)}, ` +
    `box(width: ${pt(cote)}, height: ${pt(cote)}, align(center + horizon)[${contenu}]))`
  const valeurs: string[] = []
  for (let etage = 0; etage < nbEtages; etage++) {
    for (let index = 0; index < nbCasesDeLEtage(etage, nbEtages); index++) {
      const position = centreDeLaCase(
        etage,
        index,
        nbEtages,
        DIAMETRE_TEX,
        PAS_TEX,
      )
      lignes.push(
        `  #place(top + left, dx: ${pt(position.x - DIAMETRE_TEX / 2)}, ` +
          `dy: ${pt(position.y - DIAMETRE_TEX / 2)}, ` +
          `circle(radius: ${pt(DIAMETRE_TEX / 2)}, stroke: 0.6pt))`,
      )
      const contenu = contenuDeLaCase(etage, index, donnees, solution)
      if (contenu === null) continue
      const taille = TAILLES_TYPST[tailleDuTexte(String(contenu.valeur))]
      const texte = contenu.donnee
        ? `#text(size: ${taille}pt)[$${contenu.valeur}$]`
        : `#text(size: ${taille}pt, fill: rgb("${orangeMathalea}"), weight: "bold")[$${contenu.valeur}$]`
      valeurs.push(centre(position.x, position.y, DIAMETRE_TEX, texte))
    }
  }
  for (let etage = 0; etage < nbEtages - 1; etage++) {
    for (let index = 0; index < (operations[etage]?.length ?? 0); index++) {
      const position = centreDeLaPastille(
        etage,
        index,
        nbEtages,
        DIAMETRE_TEX,
        PAS_TEX,
      )
      lignes.push(
        `  #place(top + left, dx: ${pt(position.x - PASTILLE_TEX / 2)}, ` +
          `dy: ${pt(position.y - PASTILLE_TEX / 2)}, ` +
          `circle(radius: ${pt(PASTILLE_TEX / 2)}, fill: luma(80%), stroke: 0.4pt))`,
      )
      lignes.push(
        centre(
          position.x,
          position.y,
          PASTILLE_TEX,
          `#text(size: 9pt)[$${SYMBOLES_TYPST[operations[etage][index]]}$]`,
        ),
      )
    }
  }
  lignes.push(...valeurs, ']]')
  return lignes.join('\n')
}

/* -------------------------------------------------------------------------- */
/* Le composant                                                                */
/* -------------------------------------------------------------------------- */

function em(valeur: number): string {
  return `${Number(valeur.toFixed(3))}em`
}

/** Adapte la taille d'un champ à ce qu'il contient, pour ne rien tronquer. */
function ajusteLaTaille(champ: HTMLInputElement): void {
  champ.style.fontSize = em(tailleDuTexte(champ.value))
}

export class PyramideNombresElement
  extends MathaleaCustomElement
  implements GrilleDeChiffres
{
  static readonly elementTag = 'pyramide-nombres'

  private nbEtages = 5
  private operations: OperationPyramide[][] = []
  private donnees: (number | null)[][] = []
  private solution: number[][] | null = null
  private avecNombresNegatifs = false
  /** Les champs de saisie, indexés par `etage * nbEtages + index`. */
  private champs = new Map<number, HTMLInputElement>()
  private zoneMessage: HTMLElement | null = null
  /** Le clavier virtuel simple, affiché tant qu'une case a le focus. */
  private clavier: HTMLElement | null = null
  /** La dernière case ayant reçu le focus : la cible des touches du clavier. */
  private champActif: HTMLInputElement | null = null

  static create(options: PyramideNombresOptions): string {
    const nbEtages = normaliseNbEtages(options.nbEtages)
    const operations = options.operations ?? []
    const donnees = options.donnees ?? []
    const solution = options.solution ?? null
    const interactivityOn = options.interactivityOn ?? true
    // La vue Typst régénère l'exercice avec `isHtml` encore vrai : ce cas doit
    // donc être traité avant la branche HTML.
    if (context.isTypst) {
      return `<mathalea-typst>${renderTypstPyramide(nbEtages, operations, donnees, interactivityOn ? null : solution)}</mathalea-typst>`
    }
    if (!context.isHtml) {
      return renderLatexPyramide(
        nbEtages,
        operations,
        donnees,
        interactivityOn ? null : solution,
      )
    }
    const numeroExercice = options.numeroExercice ?? 0
    const questionIndex = options.questionIndex ?? 0
    const id =
      options.id ??
      `${PyramideNombresElement.elementTag}Ex${numeroExercice}Q${questionIndex}`
    const elementHtml = super.create({
      id,
      nbEtages,
      operations,
      donnees,
      solution: interactivityOn ? null : solution,
      interactivityOn,
      avecNombresNegatifs: options.avecNombresNegatifs ?? false,
      numeroExercice,
      questionIndex,
    })
    return ajouteResultatCheck(
      elementHtml,
      interactivityOn,
      numeroExercice,
      questionIndex,
    )
  }

  connectedCallback(): void {
    this.hydrateCommonAttributes()
    this.nbEtages = normaliseNbEtages(this.getAttribute('nb-etages'))
    this.operations = parseOperations(this.getAttribute('operations'))
    this.donnees = parseDonnees(this.getAttribute('donnees'))
    this.solution = parseSolution(this.getAttribute('solution'))
    this.avecNombresNegatifs =
      this.getAttribute('avec-nombres-negatifs') === 'true'
    this.construitInterface()
    this.render()
  }

  disconnectedCallback(): void {
    this.champs.clear()
    this.zoneMessage = null
    this.clavier = null
    this.champActif = null
    this.innerHTML = ''
  }

  get value(): Record<string, string> {
    const valeurs: Record<string, string> = {}
    for (const [reference, champ] of this.champs) {
      valeurs[this.cleDeLaReference(reference)] = champ.value.trim()
    }
    return valeurs
  }

  set value(prochaineValeur: unknown) {
    this.update(prochaineValeur)
  }

  update(prochaineValeur: unknown): void {
    const brut = parseJson(prochaineValeur)
    if (brut == null || typeof brut !== 'object') return
    const saisies = brut as Record<string, unknown>
    for (const [reference, champ] of this.champs) {
      const saisie = saisies[this.cleDeLaReference(reference)]
      if (saisie == null) continue
      champ.value = String(saisie)
      ajusteLaTaille(champ)
    }
    this.render()
  }

  protected onInteractivityChanged(isOn: boolean): void {
    for (const champ of this.champs.values()) {
      champ.readOnly = !isOn
      champ.tabIndex = isOn ? 0 : -1
      champ.style.cursor = isOn ? 'text' : 'default'
    }
    if (!isOn) this.masqueClavier()
  }

  render(): string | void {
    if (!context.isHtml || context.isTypst) return this.renderLatex()
    // La pyramide est construite une fois pour toutes : l'affichage ne dépend
    // ensuite que des saisies, que le navigateur tient à jour lui-même.
    return ''
  }

  protected renderLatex(): string {
    return renderLatexPyramide(
      this.nbEtages,
      this.operations,
      this.donnees,
      this.interactivityOn ? null : this.solution,
    )
  }

  protected renderTypst(): string {
    return renderTypstPyramide(
      this.nbEtages,
      this.operations,
      this.donnees,
      this.interactivityOn ? null : this.solution,
    )
  }

  /** La référence interne d'une case, qui sert de clé aux champs de saisie. */
  private referenceDeLaCase(etage: number, index: number): number {
    return etage * this.nbEtages + index
  }

  private cleDeLaReference(reference: number): string {
    return cleDeLaCase(
      Math.floor(reference / this.nbEtages),
      reference % this.nbEtages,
      this.nbEtages,
    )
  }

  /**
   * Toutes les longueurs sont en `em`, jamais en `rem` ni en classe Tailwind de
   * taille fixe : le zoom des vues prof, élève et TBI pose une `font-size` en
   * rem sur le conteneur de l'énoncé, donc seul le relatif suit
   * l'agrandissement demandé par l'enseignant.
   */
  private construitInterface(): void {
    this.innerHTML = ''
    this.champs.clear()
    this.classList.add('block', 'not-prose')
    this.style.margin = '1em 0'

    const cadre = document.createElement('div')
    cadre.style.maxWidth = '100%'
    cadre.style.overflowX = 'auto'
    cadre.style.padding = '0.2em'

    const pyramide = document.createElement('div')
    pyramide.className = 'relative'
    pyramide.style.width = em(largeurTotale(this.nbEtages, DIAMETRE))
    pyramide.style.height = em(hauteurTotale(this.nbEtages, DIAMETRE, PAS))
    pyramide.addEventListener('keydown', this.toucheEnfoncee)
    pyramide.addEventListener('input', this.saisie)

    for (let etage = 0; etage < this.nbEtages; etage++) {
      for (
        let index = 0;
        index < nbCasesDeLEtage(etage, this.nbEtages);
        index++
      ) {
        pyramide.appendChild(this.construitCase(etage, index))
      }
    }
    // Les pastilles sont ajoutées après les cases : elles recouvrent ainsi le
    // croisement des traits des cases voisines, comme sur le dessin à la main.
    for (let etage = 0; etage < this.nbEtages - 1; etage++) {
      for (
        let index = 0;
        index < (this.operations[etage]?.length ?? 0);
        index++
      ) {
        pyramide.appendChild(this.construitPastille(etage, index))
      }
    }
    cadre.appendChild(pyramide)
    this.appendChild(cadre)

    this.zoneMessage = document.createElement('div')
    this.zoneMessage.style.marginTop = '0.5em'
    this.zoneMessage.style.fontSize = '0.875em'
    this.zoneMessage.setAttribute('aria-live', 'polite')
    this.appendChild(this.zoneMessage)

    // Le clavier n'a de sens que devant des cases à remplir : la version
    // figée de la correction n'en construit aucune.
    if (this.interactivityOn && this.champs.size > 0) {
      this.clavier = this.construitClavier()
      this.appendChild(this.clavier)
    }

    this.onInteractivityChanged(this.interactivityOn)
  }

  private construitCase(etage: number, index: number): HTMLElement {
    const centre = centreDeLaCase(etage, index, this.nbEtages, DIAMETRE, PAS)
    const cellule = document.createElement('div')
    cellule.className =
      'absolute rounded-full flex items-center justify-center ' +
      'border-coopmaths-corpus dark:border-coopmathsdark-corpus'
    cellule.dataset.case = `${etage}-${index}`
    cellule.style.left = em(centre.x - DIAMETRE / 2)
    cellule.style.top = em(centre.y - DIAMETRE / 2)
    cellule.style.width = em(DIAMETRE)
    cellule.style.height = em(DIAMETRE)
    cellule.style.borderStyle = 'solid'
    cellule.style.borderWidth = em(TRAIT)

    const contenu = contenuDeLaCase(etage, index, this.donnees, this.solution)
    if (contenu !== null) {
      // Une valeur écrite n'est pas à trouver : elle ne compte pas dans le score.
      const valeur = document.createElement('span')
      valeur.className = 'font-bold'
      valeur.style.fontSize = em(tailleDuTexte(String(contenu.valeur)))
      if (!contenu.donnee) valeur.style.color = orangeMathalea
      valeur.textContent = String(contenu.valeur)
      cellule.appendChild(valeur)
      return cellule
    }

    const champ = this.creeChampDeSaisie(etage, index)
    cellule.appendChild(champ)
    this.champs.set(this.referenceDeLaCase(etage, index), champ)
    return cellule
  }

  private construitPastille(etage: number, index: number): HTMLElement {
    const centre = centreDeLaPastille(
      etage,
      index,
      this.nbEtages,
      DIAMETRE,
      PAS,
    )
    const pastille = document.createElement('div')
    pastille.className =
      'absolute rounded-full flex items-center justify-center leading-none ' +
      'bg-coopmaths-canvas-moredark dark:bg-coopmathsdark-canvas-moredark ' +
      'text-coopmaths-corpus dark:text-coopmathsdark-corpus ' +
      'border-coopmaths-corpus dark:border-coopmathsdark-corpus'
    pastille.dataset.operation = `${etage}-${index}`
    pastille.style.left = em(centre.x - PASTILLE / 2)
    pastille.style.top = em(centre.y - PASTILLE / 2)
    pastille.style.width = em(PASTILLE)
    pastille.style.height = em(PASTILLE)
    pastille.style.borderStyle = 'solid'
    pastille.style.borderWidth = em(TRAIT / 2)
    pastille.setAttribute('aria-hidden', 'true')
    // Le symbole porte sa propre taille : posée sur la pastille, elle
    // changerait la valeur de l'em qui dimensionne et positionne celle-ci.
    const symbole = document.createElement('span')
    symbole.style.fontSize = em(TAILLE_SYMBOLE)
    symbole.textContent = SYMBOLES[this.operations[etage][index]]
    pastille.appendChild(symbole)
    return pastille
  }

  private creeChampDeSaisie(etage: number, index: number): HTMLInputElement {
    const champ = document.createElement('input')
    champ.type = 'text'
    champ.inputMode = 'text'
    champ.autocomplete = 'off'
    champ.maxLength = 5
    champ.dataset.etage = String(etage)
    champ.dataset.index = String(index)
    champ.setAttribute(
      'aria-label',
      `Étage ${etage + 1} en partant du bas, case ${index + 1}`,
    )
    champ.className = 'text-center bg-transparent focus:outline-none font-bold'
    // La case est ronde : le champ occupe la corde la plus large, celle qui
    // passe par le centre, pour qu'un nombre à plusieurs chiffres ou précédé
    // d'un signe s'y écrive en entier.
    champ.style.width = '88%'
    champ.style.height = '100%'
    champ.style.padding = '0'
    champ.style.border = 'none'
    ajusteLaTaille(champ)
    champ.addEventListener('focus', () => {
      this.champActif = champ
      this.afficheClavier()
    })
    // Le focus qui suit peut retomber sur une autre case de la pyramide (clic,
    // tabulation) : le clavier ne se masque que si aucune case ne l'a repris,
    // ce qui laisse le temps au nouveau focus de se poser.
    champ.addEventListener('blur', () => {
      window.setTimeout(() => {
        if (!this.uneCaseALeFocus()) this.masqueClavier()
      })
    })
    return champ
  }

  /**
   * Seuls un entier et son éventuel signe ont un sens dans une case : le reste
   * de la saisie est effacé au fil de la frappe.
   */
  private readonly saisie = (evenement: Event): void => {
    const champ = evenement.target
    if (!(champ instanceof HTMLInputElement)) return
    const nettoye = champ.value
      .replace(/[−–—]/g, '-')
      .replace(/[^\d-]/g, '')
      .replace(/(?!^)-/g, '')
    if (nettoye !== champ.value) champ.value = nettoye
    ajusteLaTaille(champ)
  }

  /**
   * Les flèches du clavier déplacent le curseur d'une case à l'autre : une
   * pyramide ne se remplit pas dans l'ordre de lecture, l'élève passe d'un
   * étage à l'autre au gré de ses déductions.
   */
  private readonly toucheEnfoncee = (evenement: KeyboardEvent): void => {
    const champ = evenement.target
    if (!(champ instanceof HTMLInputElement)) return
    const deplacements: Record<string, [number, number]> = {
      ArrowRight: [0, 1],
      ArrowLeft: [0, -1],
      ArrowUp: [1, 0],
      ArrowDown: [-1, 0],
    }
    const deplacement = deplacements[evenement.key]
    if (deplacement === undefined) return
    evenement.preventDefault()
    this.deplaceLeFocus(
      Number(champ.dataset.etage),
      Number(champ.dataset.index),
      deplacement[0],
      deplacement[1],
    )
  }

  /** Donne le focus au prochain champ de saisie, en sautant les cases écrites. */
  private deplaceLeFocus(
    etage: number,
    index: number,
    pasEtage: number,
    pasIndex: number,
  ): void {
    let prochainEtage = etage
    let prochainIndex = index
    for (let essai = 0; essai < this.nbEtages * this.nbEtages; essai++) {
      prochainEtage += pasEtage
      prochainIndex += pasIndex
      if (prochainEtage < 0 || prochainEtage >= this.nbEtages) return
      const nbCases = nbCasesDeLEtage(prochainEtage, this.nbEtages)
      if (prochainIndex < 0 || prochainIndex >= nbCases) return
      const suivant = this.champs.get(
        this.referenceDeLaCase(prochainEtage, prochainIndex),
      )
      if (suivant != null) {
        suivant.focus()
        suivant.select()
        return
      }
    }
  }

  /**
   * Le clavier virtuel simple : chiffres, signe moins et effacement, posé au
   * bas de l'écran comme le clavier des exercices classiques. Une pyramide
   * n'attend qu'un entier par case, pas une expression mathématique : ce
   * clavier n'a donc pas besoin d'opérations, de fractions ni de variables.
   */
  private construitClavier(): HTMLElement {
    const clavier = document.createElement('div')
    clavier.hidden = true
    // Taille et espacement en rem, jamais en em : à la différence de la
    // pyramide, ce clavier ne doit pas grossir avec le zoom de l'énoncé, au
    // risque de ne plus tenir sur l'écran d'une tablette.
    clavier.style.fontSize = '1rem'
    clavier.className =
      'fixed bottom-0 left-0 right-0 z-[9999] flex justify-center p-2 ' +
      'bg-coopmaths-canvas-dark dark:bg-coopmathsdark-canvas-dark ' +
      'drop-shadow-[0_-3px_5px_rgba(130,130,130,0.25)] ' +
      'dark:drop-shadow-[0_-3px_5px_rgba(250,250,250,0.25)]'
    // Un clic sur une touche ne doit jamais retirer le focus de la case en
    // cours de saisie : c'est le rôle du gestionnaire `mousedown`, avant que
    // le clic ne se produise (voir le clavier des exercices classiques).
    clavier.addEventListener('mousedown', (evenement) =>
      evenement.preventDefault(),
    )

    const grille = document.createElement('div')
    grille.className = 'grid gap-1'
    grille.style.gridTemplateColumns = 'repeat(3, 2.75rem)'
    grille.style.gridAutoRows = '2.75rem'

    const rangees: (string | null)[][] = [
      ['7', '8', '9'],
      ['4', '5', '6'],
      ['1', '2', '3'],
      [this.avecNombresNegatifs ? '-' : null, '0', 'effacer'],
    ]
    for (const rangee of rangees) {
      for (const touche of rangee) {
        grille.appendChild(this.construitToucheClavier(touche))
      }
    }
    clavier.appendChild(grille)
    return clavier
  }

  /** Une touche du clavier virtuel, ou un espace réservé si `touche` est `null`. */
  private construitToucheClavier(touche: string | null): HTMLElement {
    if (touche === null) {
      const espace = document.createElement('div')
      espace.setAttribute('aria-hidden', 'true')
      return espace
    }
    const bouton = document.createElement('button')
    bouton.type = 'button'
    const speciale = touche === 'effacer'
    bouton.className =
      'rounded-md font-mono font-bold shadow-[2px_2px_4px_rgba(180,180,180,0.5)] ' +
      'text-coopmaths-corpus dark:text-coopmathsdark-corpus-light ' +
      'active:bg-coopmaths-action active:text-coopmaths-canvas ' +
      `dark:active:bg-coopmathsdark-action dark:active:text-coopmathsdark-canvas ${
        speciale
          ? 'bg-coopmaths-canvas-moredark dark:bg-coopmathsdark-canvas-moredark'
          : 'bg-coopmaths-canvas-darkest dark:bg-coopmathsdark-canvas'
      }`
    if (touche === 'effacer') {
      bouton.textContent = '⌫'
      bouton.setAttribute('aria-label', 'Effacer le dernier caractère')
      bouton.addEventListener('click', this.effaceCaractere)
    } else if (touche === '-') {
      bouton.textContent = '−'
      bouton.setAttribute('aria-label', 'Signe moins')
      bouton.addEventListener('click', () => this.insereCaractere('-'))
    } else {
      bouton.textContent = touche
      bouton.addEventListener('click', () => this.insereCaractere(touche))
    }
    return bouton
  }

  private afficheClavier(): void {
    if (this.clavier != null) this.clavier.hidden = false
  }

  private masqueClavier(): void {
    if (this.clavier != null) this.clavier.hidden = true
    this.champActif = null
  }

  /** Vrai si le focus est encore sur une case de la pyramide. */
  private uneCaseALeFocus(): boolean {
    const actif = document.activeElement
    for (const champ of this.champs.values()) {
      if (champ === actif) return true
    }
    return false
  }

  /**
   * Insère un caractère dans la case active, à la position du curseur, comme
   * le ferait la frappe au clavier physique : `saisie()` se charge ensuite de
   * n'en garder que ce qui a un sens dans une case.
   */
  private readonly insereCaractere = (caractere: string): void => {
    const champ = this.champActif
    if (champ == null) return
    const debut = champ.selectionStart ?? champ.value.length
    const fin = champ.selectionEnd ?? champ.value.length
    champ.value = champ.value.slice(0, debut) + caractere + champ.value.slice(fin)
    champ.setSelectionRange(debut + caractere.length, debut + caractere.length)
    champ.dispatchEvent(new Event('input', { bubbles: true }))
  }

  /** Efface le caractère avant le curseur, ou la sélection si elle n'est pas vide. */
  private readonly effaceCaractere = (): void => {
    const champ = this.champActif
    if (champ == null) return
    const debut = champ.selectionStart ?? champ.value.length
    const fin = champ.selectionEnd ?? champ.value.length
    const curseur = debut === fin ? Math.max(0, debut - 1) : debut
    if (curseur === fin) return
    champ.value = champ.value.slice(0, curseur) + champ.value.slice(fin)
    champ.setSelectionRange(curseur, curseur)
    champ.dispatchEvent(new Event('input', { bubbles: true }))
  }

  /** Colore chaque case selon que sa valeur est juste ou non. */
  marqueLesCases(etats: Map<string, boolean>): void {
    for (const [reference, champ] of this.champs) {
      const etat = etats.get(this.cleDeLaReference(reference))
      if (etat === undefined) continue
      champ.style.color = etat ? vertMathalea : orangeMathalea
      champ.parentElement?.style.setProperty(
        'background-color',
        `${etat ? vertMathalea : orangeMathalea}33`,
      )
    }
  }

  afficheLeScore(nbBonnesReponses: number, nbReponses: number): void {
    if (this.zoneMessage == null) return
    this.zoneMessage.style.color = orangeMathalea
    const pluriel = nbBonnesReponses > 1 ? 's' : ''
    this.zoneMessage.textContent = `${nbBonnesReponses} case${pluriel} correctement remplie${pluriel} sur ${nbReponses}.`
  }

  /**
   * Vérification interactive : la note est la proportion de cases
   * correctement remplies, multipliée par le barème de la pyramide et
   * arrondie à l'entier inférieur. Les valeurs données ne comptent pas :
   * elles ne figurent pas dans les réponses attendues construites par
   * l'exercice.
   */
  static verifQuestion(
    exercice: IExercice,
    questionIndex: number,
  ): ResultatVerification {
    const id = `${PyramideNombresElement.elementTag}Ex${exercice.numeroExercice ?? 0}Q${questionIndex}`
    return verifieLesCases(
      exercice,
      questionIndex,
      document.getElementById(id) as PyramideNombresElement | null,
      POINTS_MAX_PYRAMIDE,
    )
  }

  static pointsMaxQuestion(
    _exercice: IExercice,
    _questionIndex: number,
  ): number {
    return POINTS_MAX_PYRAMIDE
  }
}

registerMathaleaCustomElement(PyramideNombresElement)

/** Helper d'injection depuis l'exercice. */
export function ajoutePyramide(
  exercice: IExercice,
  questionIndex: number,
  options: PyramideNombresOptions,
): string {
  return PyramideNombresElement.create({
    ...options,
    numeroExercice: exercice.numeroExercice ?? 0,
    questionIndex,
  })
}
