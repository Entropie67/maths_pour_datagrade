import rough from 'roughjs'
import type { Drawable, Options } from 'roughjs/bin/core'
import { context } from '../../modules/context'
import MathaleaCustomElement, {
  registerMathaleaCustomElement,
} from './MathaleaCustomElement'
import {
  STYLE_CHAMP_DISCRET,
  STYLE_SELECT_SANS_FOND,
} from './stylesFormulaires'

/**
 * Paramétrage visuel de la construction animée d'un triangle (exercice P011),
 * affiché en vue enseignante uniquement.
 *
 * L'enseignant choisit une construction, puis complète une figure à main
 * levée : noms des sommets et mesures nécessaires. Comme
 * `questions-de-cours-selecteur`, c'est un custom element *technique* : il ne
 * porte aucune réponse d'élève et se contente d'émettre l'événement DOM
 * `settings` (`sup` : construction, `sup2` : nom, `sup3` : mesures séparées
 * par des espaces). L'exercice est alors régénéré avec la nouvelle animation
 * et l'URL est mise à jour.
 */

/** Une mesure donnée, dans l'ordre des arguments de la macro `Alea2iep`. */
type Mesure =
  | { nature: 'longueur'; sommets: [number, number] }
  | { nature: 'angle'; sommet: number; autres: [number, number] }

type Codage = 'angleDroit' | 'equilateral'

export type ConstructionTriangle = {
  libelle: string
  mesures: Mesure[]
  defauts: number[]
  /** Codages dessinés sur la figure à main levée. */
  codages: Codage[]
  /** Sommets de la figure à main levée, dans le repère du SVG. */
  croquis: [number, number][]
}

const LARGEUR = 400
const HAUTEUR = 290

const CROQUIS_QUELCONQUE: [number, number][] = [
  [70, 235],
  [330, 235],
  [215, 60],
]
const CROQUIS_RECTANGLE: [number, number][] = [
  [80, 235],
  [300, 235],
  [300, 60],
]
const CROQUIS_EQUILATERAL: [number, number][] = [
  [95, 240],
  [305, 240],
  [200, 58],
]

const longueur = (i: number, j: number): Mesure => ({
  nature: 'longueur',
  sommets: [i, j],
})
const angle = (sommet: number, i: number, j: number): Mesure => ({
  nature: 'angle',
  sommet,
  autres: [i, j],
})

/**
 * Les constructions proposées, indexées par la valeur de `sup` (à partir de
 * 1). L'ordre des mesures est celui des arguments de la macro `Alea2iep`
 * correspondante : c'est aussi l'ordre dans `sup3`.
 */
export const CONSTRUCTIONS_TRIANGLE: ConstructionTriangle[] = [
  {
    libelle: 'Triangle connaissant ses trois longueurs',
    mesures: [longueur(0, 1), longueur(0, 2), longueur(1, 2)],
    defauts: [3, 4, 5],
    codages: [],
    croquis: CROQUIS_QUELCONQUE,
  },
  {
    libelle: 'Triangle connaissant une longueur et deux angles',
    mesures: [longueur(0, 1), angle(0, 1, 2), angle(1, 0, 2)],
    defauts: [3, 40, 50],
    codages: [],
    croquis: CROQUIS_QUELCONQUE,
  },
  {
    libelle: "Triangle rectangle connaissant les côtés de l'angle droit",
    mesures: [longueur(0, 1), longueur(1, 2)],
    defauts: [3, 4],
    codages: ['angleDroit'],
    croquis: CROQUIS_RECTANGLE,
  },
  {
    libelle: "Triangle rectangle connaissant un côté et l'hypoténuse",
    mesures: [longueur(0, 1), longueur(0, 2)],
    defauts: [3, 5],
    codages: ['angleDroit'],
    croquis: CROQUIS_RECTANGLE,
  },
  {
    libelle: 'Triangle équilatéral',
    mesures: [longueur(0, 1)],
    defauts: [4],
    codages: ['equilateral'],
    croquis: CROQUIS_EQUILATERAL,
  },
  {
    libelle: "Triangle connaissant deux longueurs et l'angle compris",
    mesures: [longueur(0, 1), longueur(0, 2), angle(0, 1, 2)],
    defauts: [3, 4, 70],
    codages: [],
    croquis: CROQUIS_QUELCONQUE,
  },
]

const NOM_PAR_DEFAUT = 'ABC'

/** La construction demandée par `sup`, la première si la valeur est hors liste. */
export function numeroConstruction(sup: unknown): number {
  const numero = Math.round(Number(sup))
  return numero >= 1 && numero <= CONSTRUCTIONS_TRIANGLE.length ? numero : 1
}

/**
 * Les trois noms de sommets lus dans `sup2`. Un nom manquant est remplacé par
 * celui de `ABC` à la même place.
 */
export function nomsDesSommets(sup2: unknown): [string, string, string] {
  const lettres = [...String(sup2 ?? '').replace(/\s/g, '')]
  return [0, 1, 2].map((i) => lettres[i] ?? NOM_PAR_DEFAUT[i]) as [
    string,
    string,
    string,
  ]
}

/**
 * Les mesures lues dans `sup3` (séparées par des espaces, virgule ou point
 * décimal). Une valeur absente ou illisible vaut `NaN`.
 */
export function mesuresSaisies(sup3: unknown, nb: number): number[] {
  const valeurs = String(sup3 ?? '')
    .trim()
    .split(/\s+/)
    .map((texte) => (texte === '' ? NaN : Number(texte.replace(',', '.'))))
  return Array.from({ length: nb }, (_, i) => valeurs[i] ?? NaN)
}

/**
 * Explique pourquoi ces mesures ne permettent pas la construction, ou
 * retourne une chaîne vide si elles conviennent.
 */
export function problemeDeMesures(numero: number, mesures: number[]): string {
  if (mesures.some((mesure) => !Number.isFinite(mesure) || mesure <= 0)) {
    return 'Toutes les mesures doivent être des nombres strictement positifs.'
  }
  switch (numero) {
    case 1: {
      const [a, b, c] = mesures
      const plusGrande = Math.max(a, b, c)
      if (plusGrande >= a + b + c - plusGrande) {
        return 'La plus grande longueur doit être strictement inférieure à la somme des deux autres.'
      }
      return ''
    }
    case 2:
      if (mesures[1] + mesures[2] >= 180) {
        return 'La somme des deux angles doit être strictement inférieure à 180°.'
      }
      return ''
    case 4:
      // La plus grande des deux longueurs sert d'hypoténuse.
      if (mesures[1] === mesures[0]) {
        return "L'hypoténuse doit être strictement plus longue que l'autre côté."
      }
      return ''
    case 6:
      if (mesures[2] >= 180) {
        return "L'angle doit être strictement inférieur à 180°."
      }
      return ''
    default:
      return ''
  }
}

/** L'élément est recréé à chaque régénération : on mémorise le champ actif. */
const champActifParExercice = new Map<number, string>()

export type ConstructionTriangleSelecteurOptions = {
  id?: string
  numeroExercice: number
  /** Valeur de `sup` : numéro de la construction. */
  construction: number
  /** Valeur de `sup2` : noms des sommets. */
  nom: string
  /** Valeur de `sup3` : mesures séparées par des espaces. */
  mesures: string
}

/**
 * @author Rémi Angot
 */
export class ConstructionTriangleSelecteurElement extends MathaleaCustomElement {
  static readonly elementTag = 'construction-triangle-selecteur'

  private numero = 1
  private noms: [string, string, string] = ['A', 'B', 'C']
  private valeurs: number[] = []
  private derniereDemande = ''
  private placements: {
    element: HTMLElement
    /** Centre du champ, connaissant sa demi-taille, dans le repère du SVG. */
    position: (demiTaille: Vecteur) => Vecteur
  }[] = []

  private observateur: ResizeObserver | null = null

  static create({
    id,
    numeroExercice,
    construction,
    nom,
    mesures,
  }: ConstructionTriangleSelecteurOptions): string {
    if (!context.isHtml || context.isTypst) return ''
    return super.create({
      id:
        id ??
        `${ConstructionTriangleSelecteurElement.elementTag}Ex${numeroExercice}`,
      numeroExercice,
      construction,
      nom,
      mesures,
    })
  }

  connectedCallback() {
    this.numero = numeroConstruction(this.getAttribute('construction'))
    this.noms = nomsDesSommets(this.getAttribute('nom'))
    this.valeurs = mesuresSaisies(
      this.getAttribute('mesures'),
      this.construction.mesures.length,
    )
    this.classList.add('block', 'not-prose')
    this.construitInterface()
  }

  private get numeroExercice(): number {
    return Number(this.getAttribute('numero-exercice') ?? 0)
  }

  private get construction(): ConstructionTriangle {
    return CONSTRUCTIONS_TRIANGLE[this.numero - 1]
  }

  private construitInterface() {
    this.innerHTML = ''
    this.placements = []
    const cadre = document.createElement('div')
    // Tailles en `em` : le zoom de la page agrandit la police du conteneur
    // de l'exercice, le sélecteur suit donc le zoom (vue prof comme TBI).
    cadre.className =
      'text-[0.875em] border border-coopmaths-canvas-darkest dark:border-coopmathsdark-canvas-darkest rounded-md p-[0.85em] mb-[1.15em] print-hidden'
    this.appendChild(cadre)

    const choix = document.createElement('select')
    choix.setAttribute('aria-label', 'Construction')
    choix.dataset.champ = 'construction'
    choix.className = STYLE_SELECT_SANS_FOND
    CONSTRUCTIONS_TRIANGLE.forEach((construction, i) => {
      const option = document.createElement('option')
      option.value = String(i + 1)
      option.innerText = construction.libelle
      choix.appendChild(option)
    })
    choix.value = String(this.numero)
    choix.addEventListener('change', () => {
      this.numero = numeroConstruction(choix.value)
      // Les mesures de l'ancienne construction n'ont plus de sens.
      this.valeurs = [...this.construction.defauts]
      this.demandeMiseAJour()
    })
    cadre.appendChild(choix)

    cadre.appendChild(this.figure())

    const probleme = problemeDeMesures(this.numero, this.valeurs)
    if (probleme !== '') {
      const avertissement = document.createElement('p')
      avertissement.className =
        'mt-2 italic text-coopmaths-warn-darkest dark:text-coopmathsdark-warn'
      avertissement.innerText = `${probleme} L'animation utilise les mesures par défaut.`
      cadre.appendChild(avertissement)
    }

    // Mémorise le champ où se trouve l'enseignant, pour le lui rendre après
    // la régénération (y compris quand il passe au champ suivant avec Tab).
    cadre.addEventListener('focusin', (event) => {
      const champ = (event.target as HTMLElement).dataset.champ
      if (champ !== undefined) {
        champActifParExercice.set(this.numeroExercice, champ)
      }
    })
    // Si l'enseignant quitte le sélecteur (clic ailleurs), on ne lui reprend
    // pas le focus à la régénération.
    cadre.addEventListener('focusout', (event) => {
      const suivant = (event as FocusEvent).relatedTarget
      if (this.isConnected && !cadre.contains(suivant as Node | null)) {
        champActifParExercice.delete(this.numeroExercice)
      }
    })
    const champActif = champActifParExercice.get(this.numeroExercice)
    if (champActif !== undefined) {
      const element = cadre.querySelector<HTMLElement>(
        `[data-champ="${champActif}"]`,
      )
      element?.focus()
      if (element instanceof HTMLInputElement) element.select()
    }
  }

  /** La figure à main levée et ses champs posés par-dessus. */
  private figure(): HTMLElement {
    const { croquis, mesures, codages } = this.construction
    const conteneur = document.createElement('div')
    conteneur.className = 'relative mt-[0.85em] w-full'
    conteneur.style.maxWidth = `${LARGEUR / 14}em`

    let traces = [0, 1, 2]
      .map((i) => coteMainLevee(croquis[i], croquis[(i + 1) % 3], i))
      .join('')
    for (const mesure of mesures) {
      if (mesure.nature === 'angle') {
        traces += arcMainLevee(
          croquis[mesure.sommet],
          croquis[mesure.autres[0]],
          croquis[mesure.autres[1]],
        )
      }
    }
    if (codages.includes('angleDroit')) {
      traces += codageAngleDroit(croquis[1], croquis[0], croquis[2])
    }
    if (codages.includes('equilateral')) {
      for (let i = 0; i < 3; i++) {
        traces += codageEgalite(croquis[i], croquis[(i + 1) % 3])
      }
    }
    conteneur.innerHTML = `<svg viewBox="0 0 ${LARGEUR} ${HAUTEUR}" class="w-full h-auto text-coopmaths-struct dark:text-coopmathsdark-struct" aria-hidden="true">${traces}</svg>`

    // Noms des sommets, à l'extérieur du triangle.
    for (let i = 0; i < 3; i++) {
      const champ = this.champ({
        cle: `sommet${i}`,
        valeur: this.noms[i],
        etiquette: `Nom du sommet ${i + 1}`,
        largeur: 'w-[1.6em]',
        maxLength: 1,
      })
      champ.addEventListener('change', () => {
        const lettre = champ.value.trim()
        this.noms[i] = lettre === '' ? NOM_PAR_DEFAUT[i] : lettre
        this.demandeMiseAJour()
      })
      conteneur.appendChild(champ)
      this.placements.push({
        element: champ,
        position: (taille) =>
          positionSommet(
            croquis[i],
            croquis[(i + 1) % 3],
            croquis[(i + 2) % 3],
            taille,
          ),
      })
    }

    // Mesures : le long des côtés à l'extérieur, dans les angles à l'intérieur.
    mesures.forEach((mesure, rang) => {
      let position: (taille: Vecteur) => Vecteur
      let unite: string
      let etiquette: string
      if (mesure.nature === 'longueur') {
        const [i, j] = mesure.sommets
        const troisieme = croquis[3 - i - j]
        // Les traits d'égalité dépassent du côté : on s'en écarte aussi.
        const debord = codages.includes('equilateral') ? DEMI_TRAIT_EGALITE : 0
        position = (taille) =>
          positionCote(croquis[i], croquis[j], troisieme, taille, debord)
        unite = 'cm'
        etiquette = `Longueur ${this.noms[i]}${this.noms[j]}`
      } else {
        const sommet = croquis[mesure.sommet]
        const [p1, p2] = mesure.autres.map((k) => croquis[k])
        position = (taille) => positionAngle(sommet, p1, p2, taille)
        unite = '°'
        etiquette = `Angle ${this.noms[mesure.autres[0]]}${this.noms[mesure.sommet]}${this.noms[mesure.autres[1]]}`
      }
      const valeur = this.valeurs[rang]
      const champ = this.champ({
        cle: `mesure${rang}`,
        valeur: Number.isFinite(valeur) ? String(valeur).replace('.', ',') : '',
        etiquette,
        largeur: '',
      })
      champ.inputMode = 'decimal'
      // Le champ épouse sa valeur : collée à son unité, et le groupe reste
      // centré là où il a été posé (`ResizeObserver` le replace à la saisie).
      champ.classList.replace('text-center', 'text-right')
      const ajusteLaLargeur = () => {
        champ.style.width = `calc(${Math.max(2, champ.value.length)}ch + 0.5em)`
      }
      ajusteLaLargeur()
      champ.addEventListener('input', ajusteLaLargeur)
      champ.addEventListener('change', () => {
        const texte = champ.value.trim().replace(',', '.')
        this.valeurs[rang] = texte === '' ? NaN : Number(texte)
        this.demandeMiseAJour()
      })
      const groupe = document.createElement('span')
      groupe.className =
        'inline-flex items-center gap-0 text-coopmaths-corpus dark:text-coopmathsdark-corpus'
      const suffixe = document.createElement('span')
      suffixe.innerText = unite
      groupe.append(champ, suffixe)
      conteneur.appendChild(groupe)
      this.placements.push({ element: groupe, position })
    })
    this.observeLesTailles(conteneur)
    return conteneur
  }

  /**
   * Pose chaque champ au plus près du dessin, d'après sa taille réelle
   * convertie dans le repère du SVG. Elle dépend du zoom, des polices et de
   * la largeur disponible : on la recalcule à chaque changement de taille.
   */
  private observeLesTailles(conteneur: HTMLElement) {
    const positionne = () => {
      const largeurSvg = conteneur.offsetWidth
      if (largeurSvg === 0) return
      const echelle = LARGEUR / largeurSvg
      for (const { element, position } of this.placements) {
        const demiTaille: Vecteur = [
          (element.offsetWidth * echelle) / 2,
          (element.offsetHeight * echelle) / 2,
        ]
        place(element, position(demiTaille))
      }
    }
    this.observateur?.disconnect()
    this.observateur = new ResizeObserver(positionne)
    this.observateur.observe(conteneur)
    for (const { element } of this.placements) {
      place(element, [LARGEUR / 2, HAUTEUR / 2])
      this.observateur.observe(element)
    }
  }

  disconnectedCallback() {
    this.observateur?.disconnect()
    this.observateur = null
  }

  private champ({
    cle,
    valeur,
    etiquette,
    largeur,
    maxLength,
  }: {
    cle: string
    valeur: string
    etiquette: string
    largeur: string
    maxLength?: number
  }): HTMLInputElement {
    const champ = document.createElement('input')
    champ.type = 'text'
    champ.value = valeur
    champ.dataset.champ = cle
    champ.setAttribute('aria-label', etiquette)
    champ.title = etiquette
    if (maxLength !== undefined) champ.maxLength = maxLength
    champ.className = `${STYLE_CHAMP_DISCRET} ${largeur}`
    // Entrée valide la saisie sans quitter le champ.
    champ.addEventListener('keydown', (event) => {
      if (event.key === 'Enter') {
        event.preventDefault()
        champ.dispatchEvent(new Event('change'))
      }
    })
    return champ
  }

  /** Demande à la vue enseignante de régénérer l'exercice. */
  private demandeMiseAJour() {
    const detail = {
      sup: this.numero,
      sup2: this.noms.join(''),
      sup3: this.valeurs
        .map((valeur) => (Number.isFinite(valeur) ? String(valeur) : '?'))
        .join(' '),
    }
    const demande = JSON.stringify(detail)
    const actuel = JSON.stringify({
      sup: Number(this.getAttribute('construction')),
      sup2: this.getAttribute('nom'),
      sup3: this.getAttribute('mesures'),
    })
    // Rien de neuf, ou demande déjà envoyée (Entrée puis sortie du champ).
    if (demande === actuel || demande === this.derniereDemande) return
    this.derniereDemande = demande
    // Le `change` d'un champ est émis avant que Tab ne déplace le focus : on
    // attend ce déplacement pour que `focusin` note le champ suivant avant que
    // la régénération ne remplace l'élément.
    setTimeout(() => {
      this.dispatchEvent(
        new CustomEvent('settings', { detail, bubbles: true, composed: true }),
      )
    })
  }
}

registerMathaleaCustomElement(ConstructionTriangleSelecteurElement)

/** Helper d'injection depuis l'exercice. */
export function ajouteSelecteurConstructionTriangle(
  options: ConstructionTriangleSelecteurOptions,
): string {
  return ConstructionTriangleSelecteurElement.create(options)
}

type Vecteur = [number, number]

const ajoute = (u: Vecteur, v: Vecteur): Vecteur => [u[0] + v[0], u[1] + v[1]]
const soustrait = (u: Vecteur, v: Vecteur): Vecteur => [
  u[0] - v[0],
  u[1] - v[1],
]
const multiplie = (u: Vecteur, k: number): Vecteur => [u[0] * k, u[1] * k]
function unitaire(u: Vecteur): Vecteur {
  const norme = Math.hypot(u[0], u[1])
  return norme === 0 ? [0, 0] : multiplie(u, 1 / norme)
}

/** Centre `element` sur `position`, exprimée dans le repère du SVG. */
function place<T extends HTMLElement>(element: T, position: Vecteur): T {
  element.style.position = 'absolute'
  element.style.left = `${(position[0] / LARGEUR) * 100}%`
  element.style.top = `${(position[1] / HAUTEUR) * 100}%`
  element.style.transform = 'translate(-50%, -50%)'
  return element
}

/** Écart visé entre un champ et le trait le plus proche, en unités du SVG. */
const ECART = 5
/** Rayon des arcs d'angle. */
const RAYON_ARC = 30
/** Demi-longueur des traits d'égalité. */
const DEMI_TRAIT_EGALITE = 7
/** Débord du tremblé et demi-épaisseur du trait. */
const TREMBLE = 2.5

/** Demi-étendue d'une boîte de demi-taille `demiTaille` dans la direction `u`. */
const etendue = (u: Vecteur, demiTaille: Vecteur) =>
  Math.abs(u[0]) * demiTaille[0] + Math.abs(u[1]) * demiTaille[1]

/**
 * Nom d'un sommet : à l'extérieur, sur la bissectrice extérieure. Toute la
 * boîte est au-delà du sommet dans cette direction, donc loin des deux côtés.
 */
function positionSommet(
  sommet: Vecteur,
  p1: Vecteur,
  p2: Vecteur,
  demiTaille: Vecteur,
): Vecteur {
  const exterieure = unitaire(
    multiplie(
      ajoute(unitaire(soustrait(p1, sommet)), unitaire(soustrait(p2, sommet))),
      -1,
    ),
  )
  const distance = ECART + TREMBLE + etendue(exterieure, demiTaille)
  return ajoute(sommet, multiplie(exterieure, distance))
}

/** Longueur d'un côté : contre le milieu du côté, à l'extérieur du triangle. */
function positionCote(
  p1: Vecteur,
  p2: Vecteur,
  troisieme: Vecteur,
  demiTaille: Vecteur,
  debord: number,
): Vecteur {
  const u = unitaire(soustrait(p2, p1))
  let normale: Vecteur = [-u[1], u[0]]
  const milieu = multiplie(ajoute(p1, p2), 0.5)
  const versTroisieme = soustrait(troisieme, milieu)
  if (normale[0] * versTroisieme[0] + normale[1] * versTroisieme[1] > 0) {
    normale = multiplie(normale, -1)
  }
  const distance =
    ECART + TREMBLE + Math.max(debord, 0) + etendue(normale, demiTaille)
  return ajoute(milieu, multiplie(normale, distance))
}

/**
 * Mesure d'un angle : sur la bissectrice, juste au-delà de l'arc et à `ECART`
 * des deux côtés de l'angle.
 */
function positionAngle(
  sommet: Vecteur,
  p1: Vecteur,
  p2: Vecteur,
  demiTaille: Vecteur,
): Vecteur {
  const u1 = unitaire(soustrait(p1, sommet))
  const u2 = unitaire(soustrait(p2, sommet))
  const bissectrice = unitaire(ajoute(u1, u2))
  const sinDemiAngle = Math.hypot(...soustrait(u1, u2)) / 2
  let distance = RAYON_ARC + ECART + etendue(bissectrice, demiTaille)
  for (const u of [u1, u2]) {
    const normale: Vecteur = [-u[1], u[0]]
    distance = Math.max(
      distance,
      (ECART + TREMBLE + etendue(normale, demiTaille)) / sinDemiAngle,
    )
  }
  return ajoute(sommet, multiplie(bissectrice, distance))
}

/**
 * Les tracés « à main levée » sont ceux de roughjs, comme pour l'option
 * `mainlevee` de `mathalea2d` : un trait par côté, légèrement tremblé. La
 * graine est fixe pour que la figure ne change pas d'un affichage à l'autre,
 * et `preserveVertices` garde les sommets exacts : les côtés se rejoignent
 * sans dépasser.
 */
const generateur = rough.generator()
const TRAIT: Options = {
  seed: 10,
  roughness: 1.2,
  bowing: 1,
  disableMultiStroke: true,
  preserveVertices: true,
  strokeWidth: 1.5,
}

/**
 * Un côté du triangle tracé d'une main qui tremble : il passe par des points
 * intermédiaires légèrement écartés de la droite (écarts pseudo-aléatoires à
 * graine fixe), mais part et arrive exactement aux sommets. Les côtés se
 * rejoignent donc sans se prolonger au-delà.
 */
function coteMainLevee(depart: Vecteur, arrivee: Vecteur, rang: number) {
  const direction = soustrait(arrivee, depart)
  const unite = unitaire(direction)
  const normale: Vecteur = [-unite[1], unite[0]]
  const nbTroncons = Math.max(3, Math.round(Math.hypot(...direction) / 34))
  const hasard = pseudoHasard(rang + 1)
  const points: Vecteur[] = [depart]
  for (let k = 1; k < nbTroncons; k++) {
    const ecart = (hasard() - 0.5) * 2.4
    points.push(
      ajoute(
        ajoute(depart, multiplie(direction, k / nbTroncons)),
        multiplie(normale, ecart),
      ),
    )
  }
  points.push(arrivee)
  return traceMainLevee(
    generateur.curve(points, {
      ...TRAIT,
      roughness: 0.4,
      strokeWidth: 2,
      seed: 10 + rang,
    }),
  )
}

/**
 * Générateur pseudo-aléatoire (mulberry32) à graine fixe, indépendant de la
 * graine de l'exercice : la figure est la même à chaque affichage.
 */
function pseudoHasard(graine: number): () => number {
  let etat = graine >>> 0
  return () => {
    etat = (etat + 0x6d2b79f5) >>> 0
    let t = etat
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

function traceMainLevee(dessin: Drawable): string {
  return generateur
    .toPaths(dessin)
    .map(
      ({ d, strokeWidth }) =>
        `<path d="${d}" fill="none" stroke="currentColor" stroke-width="${strokeWidth}" stroke-linecap="round" stroke-linejoin="round"/>`,
    )
    .join('')
}

/** L'arc d'un angle donné, tracé au sommet entre ses deux côtés. */
function arcMainLevee(sommet: Vecteur, p1: Vecteur, p2: Vecteur): string {
  const diametre = 2 * RAYON_ARC
  let debut = Math.atan2(p1[1] - sommet[1], p1[0] - sommet[0])
  let fin = Math.atan2(p2[1] - sommet[1], p2[0] - sommet[0])
  if (fin < debut) [debut, fin] = [fin, debut]
  // roughjs parcourt l'arc de `debut` à `fin` : on prend le plus petit.
  if (fin - debut > Math.PI) [debut, fin] = [fin, debut + 2 * Math.PI]
  return traceMainLevee(
    generateur.arc(
      sommet[0],
      sommet[1],
      diametre,
      diametre,
      debut,
      fin,
      false,
      { ...TRAIT, roughness: 0.8 },
    ),
  )
}

/** Le petit carré de l'angle droit au sommet `sommet`. */
function codageAngleDroit(sommet: Vecteur, p1: Vecteur, p2: Vecteur): string {
  const cote = 16
  const u = multiplie(unitaire(soustrait(p1, sommet)), cote)
  const v = multiplie(unitaire(soustrait(p2, sommet)), cote)
  const a = ajoute(sommet, u)
  return traceMainLevee(
    generateur.linearPath([a, ajoute(a, v), ajoute(sommet, v)], {
      ...TRAIT,
      roughness: 0.5,
    }),
  )
}

/** Deux petits traits au milieu d'un côté pour coder l'égalité des longueurs. */
function codageEgalite(p1: Vecteur, p2: Vecteur): string {
  const direction = unitaire(soustrait(p2, p1))
  const normale: Vecteur = [-direction[1], direction[0]]
  const milieu = multiplie(ajoute(p1, p2), 0.5)
  return [-3, 3]
    .map((decalage) => {
      const centre = ajoute(milieu, multiplie(direction, decalage))
      const a = ajoute(centre, multiplie(normale, DEMI_TRAIT_EGALITE))
      const b = ajoute(centre, multiplie(normale, -DEMI_TRAIT_EGALITE))
      return traceMainLevee(
        generateur.line(a[0], a[1], b[0], b[1], { ...TRAIT, roughness: 0.5 }),
      )
    })
    .join('')
}
