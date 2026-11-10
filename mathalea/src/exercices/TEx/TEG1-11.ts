import { estConnexe, figureGraphe, sommets } from '../../lib/2d/graphes'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../lib/interactif/createQuestion'
import type { SubQuestion } from '../../lib/interactif/subQuestions'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Utiliser le vocabulaire des graphes'
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '17/10/2026'
export const dateDeModifImportante = '06/11/2026'

/**
 * Vocabulaire des graphes du programme de maths expertes : ordre, sommets
 * adjacents, degré, nombre d'arêtes, graphe complet, chaîne et longueur,
 * graphe connexe ; pour un graphe orienté, arcs et chemins.
 *
 * @author Arnaud Meistermann
 */
export const uuid = 'b1ba7'

export const refs = {
  'fr-fr': ['TEG1-11'],
  'fr-ch': [],
}

const ouiNon = [
  { label: 'Oui', value: 'oui' },
  { label: 'Non', value: 'non' },
]

/** Les sommets atteignables depuis s en suivant les arcs (s compris). */
function atteignables(adj: number[][], s: number): Set<number> {
  const vus = new Set([s])
  const pile = [s]
  while (pile.length > 0) {
    const i = pile.pop() as number
    adj[i].forEach((a, j) => {
      if (a === 1 && !vus.has(j)) {
        vus.add(j)
        pile.push(j)
      }
    })
  }
  return vus
}

/** Un chemin de s à t (liste de sommets), en suivant les arcs. */
function cheminVers(adj: number[][], s: number, t: number): number[] {
  const parent = new Map<number, number>([[s, s]])
  const file = [s]
  while (file.length > 0) {
    const i = file.shift() as number
    adj[i].forEach((a, j) => {
      if (a === 1 && !parent.has(j)) {
        parent.set(j, i)
        file.push(j)
      }
    })
  }
  const chemin = [t]
  while (chemin[0] !== s) chemin.unshift(parent.get(chemin[0]) as number)
  return chemin
}

/** Chaîne (ou chemin) de k liens sans sommet répété, tirée au hasard. */
function parcoursAleatoire(adj: number[][], k: number): number[] | null {
  const parcours = [randint(0, adj.length - 1)]
  while (parcours.length <= k) {
    const dernier = parcours[parcours.length - 1]
    const suivants = adj[dernier]
      .map((a, j) => (a === 1 && !parcours.includes(j) ? j : -1))
      .filter((j) => j >= 0)
    if (suivants.length === 0) return null
    parcours.push(choice(suivants))
  }
  return parcours
}

/** Paires {i, j} (i < j) vérifiant le critère. */
function paires(
  n: number,
  critere: (i: number, j: number) => boolean,
): [number, number][] {
  const liste: [number, number][] = []
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) if (critere(i, j)) liste.push([i, j])
  }
  return liste
}

/** « A, C et D ». */
function joinEt(liste: string[]): string {
  return liste.length === 1
    ? liste[0]
    : `${liste.slice(0, -1).join(', ')} et ${liste[liste.length - 1]}`
}

const texChaine = (parcours: number[]) =>
  parcours.map((s) => `$${sommets[s]}$`).join(' – ')
const texChemin = (parcours: number[]) =>
  `$${parcours.map((s) => sommets[s]).join('\\to ')}$`

/** Vrai quand la correction s'affiche pour un exercice interactif : la mise en évidence est alors la réponse saisie (oui ou non). */
let correctionInteractive = false

/**
 * Mot ou groupe de mots mis en évidence dans une phrase. En interactif,
 * c'est la réponse « oui » ou « non » qui l'est, car c'est ce que l'élève saisit.
 */
const enEvidence = (mot: string, oui?: boolean) =>
  correctionInteractive && oui !== undefined
    ? `${mot} : la réponse est ${texteEnCouleurEtGras(oui ? 'oui' : 'non')}`
    : texteEnCouleurEtGras(mot)

function reponseOuiNon(oui: boolean) {
  return { value: oui ? 'oui' : 'non' }
}

/**
 * Graphe non orienté, sans boucle : complet, connexe, ou formé de deux
 * composantes connexes de n - 3 et 3 sommets (la seconde contient une chaîne
 * de longueur 2).
 */
function grapheNonOriente(
  n: number,
  complet: boolean,
  connexe: boolean,
): number[][] | null {
  const adj = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (complet && i !== j ? 1 : 0)),
  )
  if (complet) return adj
  // Sans connexité, les arêtes restent à l'intérieur de deux groupes.
  const groupes = shuffle(Array.from({ length: n }, (_, i) => i))
  const groupe = (s: number) => (connexe || groupes.indexOf(s) < n - 3 ? 0 : 1)
  for (let i = 0; i < n; i++) {
    for (let j = i + 1; j < n; j++) {
      if (groupe(i) !== groupe(j)) continue
      adj[i][j] = randint(1, 10) <= 6 ? 1 : 0
      adj[j][i] = adj[i][j]
    }
  }
  const nbAretes = adj.flat().filter((a) => a === 1).length / 2
  if (nbAretes === (n * (n - 1)) / 2) return null
  if (connexe) {
    if (!estConnexe(adj) || nbAretes < n || nbAretes > 2 * n - 2) return null
  } else {
    // Deux composantes connexes exactement.
    const premiere = atteignables(adj, groupes[0])
    const seconde = atteignables(adj, groupes[n - 3])
    if (premiere.size !== n - 3 || seconde.size !== 3) return null
  }
  return adj
}

/** Graphe orienté sans boucle ni sommet isolé. */
function grapheOriente(n: number): number[][] | null {
  const adj = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      i !== j && randint(1, 10) <= 3 ? 1 : 0,
    ),
  )
  const isole = (s: number) =>
    adj[s].every((a) => a === 0) && adj.every((ligne) => ligne[s] === 0)
  if (adj.some((_, s) => isole(s))) return null
  const nbArcs = adj.flat().filter((a) => a === 1).length
  if (nbArcs < n || nbArcs > 2 * n) return null
  return adj
}

type Question = {
  adj: number[][]
  sousQuestions: SubQuestion[]
  cle: string
}

/**
 * Réponses Oui/Non tirées une fois par question, avant les essais de
 * génération : sinon les cas faciles à obtenir seraient surreprésentés.
 */
type Reponses = {
  complet: boolean
  connexe: boolean
  adjacents: boolean
  arc: boolean
  chemin: boolean
  atteint: boolean
}

function questionNonOrientee(
  n: number,
  justifier: string,
  { complet, connexe, adjacents: veutAdjacents }: Reponses,
): Question | null {
  const adj = grapheNonOriente(n, complet, connexe)
  if (adj == null) return null
  const degres = adj.map((ligne) => ligne.reduce((s, a) => s + a, 0))
  const nbAretes = degres.reduce((s, d) => s + d, 0) / 2

  // b) Deux sommets, adjacents ou non selon un tirage préalable.
  const pairesB = paires(n, (i, j) => adj[i][j] === (veutAdjacents ? 1 : 0))
  if (pairesB.length === 0) return null
  const [b1, b2] = choice(pairesB)

  // c) Degré d'un sommet.
  const s = randint(0, n - 1)
  const voisins = adj[s]
    .map((a, j) => (a === 1 ? `$${sommets[j]}$` : ''))
    .filter((x) => x !== '')

  // e) Une paire non adjacente justifie que le graphe n'est pas complet.
  const nonAdjacentes = paires(n, (i, j) => adj[i][j] === 0)

  // f) Chaîne de longueur 2 à 4 (2 sans connexité : la plus grande
  // composante n'a que trois sommets).
  const k = connexe ? randint(2, Math.min(4, n - 1)) : 2
  const chaine = parcoursAleatoire(adj, k)
  if (chaine == null) return null

  // g) Sans connexité, deux sommets qu'aucune chaîne ne relie.
  const composante = atteignables(adj, 0)
  const isole = adj.findIndex((_, j) => !composante.has(j))

  const sousQuestions: SubQuestion[] = [
    {
      question: 'Donner l’ordre du graphe $G$.',
      answer: { value: n },
      field: { keyboard: KeyboardType.clavierDeBase },
      correction: `Le graphe $G$ a $${n}$ sommets, donc son ordre est égal à $${miseEnEvidence(n)}$.`,
    },
    {
      question: `Les sommets $${sommets[b1]}$ et $${sommets[b2]}$ sont-ils adjacents ?${justifier}`,
      answer: reponseOuiNon(veutAdjacents),
      field: { qcm: ouiNon },
      correction: veutAdjacents
        ? `Une arête relie $${sommets[b1]}$ et $${sommets[b2]}$, donc ces sommets sont ${enEvidence('adjacents', true)}.`
        : `Aucune arête ne relie $${sommets[b1]}$ et $${sommets[b2]}$, donc ces sommets ne sont ${enEvidence('pas adjacents', false)}.`,
    },
    {
      question: `Donner le degré du sommet $${sommets[s]}$.`,
      answer: { value: degres[s] },
      field: { keyboard: KeyboardType.clavierDeBase },
      correction:
        degres[s] === 0
          ? `Le sommet $${sommets[s]}$ n’est relié à aucun autre sommet, donc son degré est égal à $${miseEnEvidence(0)}$.`
          : `Le sommet $${sommets[s]}$ est relié à ${joinEt(voisins)}, donc son degré est égal à $${miseEnEvidence(degres[s])}$.`,
    },
    {
      question: 'Donner le nombre d’arêtes du graphe $G$.',
      answer: { value: nbAretes },
      field: { keyboard: KeyboardType.clavierDeBase },
      correction: `La somme des degrés des sommets est égale à $${degres.join('+')}=${2 * nbAretes}$.<br>Cette somme est égale au double du nombre d’arêtes, donc le graphe $G$ a $${miseEnEvidence(nbAretes)}$ arêtes.`,
    },
    {
      question: `Le graphe $G$ est-il complet ?${justifier}`,
      answer: reponseOuiNon(complet),
      field: { qcm: ouiNon },
      correction: complet
        ? `Les sommets de $G$ sont deux à deux adjacents, donc le graphe $G$ est ${enEvidence('complet', true)}.`
        : `Les sommets $${sommets[nonAdjacentes[0][0]]}$ et $${sommets[nonAdjacentes[0][1]]}$ ne sont pas adjacents, donc le graphe $G$ n’est ${enEvidence('pas complet', false)}.`,
    },
    {
      question: `Donner la longueur de la chaîne ${texChaine(chaine)}.`,
      answer: { value: k },
      field: { keyboard: KeyboardType.clavierDeBase },
      correction: `La chaîne ${texChaine(chaine)} est formée de $${k}$ arêtes, donc sa longueur est égale à $${miseEnEvidence(k)}$.`,
    },
    {
      question: `Le graphe $G$ est-il connexe ?${justifier}`,
      answer: reponseOuiNon(connexe),
      field: { qcm: ouiNon },
      correction: connexe
        ? `Deux sommets quelconques de $G$ peuvent être reliés par une chaîne, donc le graphe $G$ est ${enEvidence('connexe', true)}.`
        : `Aucune chaîne ne relie les sommets $${sommets[0]}$ et $${sommets[isole]}$, donc le graphe $G$ n’est ${enEvidence('pas connexe', false)}.`,
    },
  ]
  return { adj, sousQuestions, cle: `nonOriente|${adj.flat().join('')}` }
}

function questionOrientee(
  n: number,
  justifier: string,
  {
    arc: veutArc,
    adjacents: veutAdjacents,
    chemin: veutChemin,
    atteint: veutAtteint,
  }: Reponses,
): Question | null {
  const adj = grapheOriente(n)
  if (adj == null) return null
  const arcs = adj.flatMap((ligne, i) =>
    ligne.flatMap((a, j) => (a === 1 ? [[i, j]] : [])),
  )

  // b) Un arc d'un sommet vers un autre, présent ou non.
  const couples: [number, number][] = []
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (i !== j && adj[i][j] === (veutArc ? 1 : 0)) couples.push([i, j])
    }
  }
  const [b1, b2] = choice(couples)

  // d) Deux sommets adjacents (arc dans un sens ou dans l'autre) ou non.
  const pairesD = paires(
    n,
    (i, j) => (adj[i][j] === 1 || adj[j][i] === 1) === veutAdjacents,
  )
  if (pairesD.length === 0) return null
  const [d1, d2] = choice(pairesD)

  // e) Une suite de trois sommets distincts, chemin ou non.
  let suite: number[] | null = null
  if (veutChemin) {
    suite = parcoursAleatoire(adj, 2)
  } else {
    const [x, y, z] = shuffle(Array.from({ length: n }, (_, i) => i))
    if (adj[x][y] === 0 || adj[y][z] === 0) suite = [x, y, z]
  }
  if (suite == null) return null
  const [x, y, z] = suite
  const lienManquant = adj[x][y] === 0 ? [x, y] : [y, z]

  // f) Chemin de longueur 2 à 4.
  const k = randint(2, Math.min(4, n - 1))
  const chemin = parcoursAleatoire(adj, k)
  if (chemin == null) return null

  // g) Chemin d'un sommet vers un autre, possible ou non.
  const depart = randint(0, n - 1)
  const accessibles = atteignables(adj, depart)
  const cibles = adj
    .map((_, j) => j)
    .filter((j) => j !== depart && accessibles.has(j) === veutAtteint)
  if (cibles.length === 0) return null
  const cible = choice(cibles)
  const texAccessibles = joinEt(
    [...accessibles]
      .filter((j) => j !== depart)
      .sort((p, q) => p - q)
      .map((j) => `$${sommets[j]}$`),
  )

  const sousQuestions: SubQuestion[] = [
    {
      question: 'Donner l’ordre du graphe $G$.',
      answer: { value: n },
      field: { keyboard: KeyboardType.clavierDeBase },
      correction: `Le graphe $G$ a $${n}$ sommets, donc son ordre est égal à $${miseEnEvidence(n)}$.`,
    },
    {
      question: `Existe-t-il un arc allant de $${sommets[b1]}$ vers $${sommets[b2]}$ ?${justifier}`,
      answer: reponseOuiNon(veutArc),
      field: { qcm: ouiNon },
      correction: veutArc
        ? `Le graphe $G$ contient l’arc $${sommets[b1]}\\to ${sommets[b2]}$, donc la réponse est ${enEvidence('oui')}.`
        : `Aucun arc ne va de $${sommets[b1]}$ vers $${sommets[b2]}$${adj[b2][b1] === 1 ? ` (le seul arc entre ces sommets va de $${sommets[b2]}$ vers $${sommets[b1]}$)` : ''}, donc la réponse est ${enEvidence('non')}.`,
    },
    {
      question: 'Donner le nombre d’arcs du graphe $G$.',
      answer: { value: arcs.length },
      field: { keyboard: KeyboardType.clavierDeBase },
      correction: `Les arcs du graphe $G$ sont $${arcs.map(([i, j]) => `${sommets[i]}\\to ${sommets[j]}`).join('$, $')}$.<br>Le graphe $G$ a donc $${miseEnEvidence(arcs.length)}$ arcs.`,
    },
    {
      question: `Les sommets $${sommets[d1]}$ et $${sommets[d2]}$ sont-ils adjacents ?${justifier}`,
      answer: reponseOuiNon(veutAdjacents),
      field: { qcm: ouiNon },
      correction: veutAdjacents
        ? `Le graphe $G$ contient l’arc $${adj[d1][d2] === 1 ? `${sommets[d1]}\\to ${sommets[d2]}` : `${sommets[d2]}\\to ${sommets[d1]}`}$, donc ces sommets sont ${enEvidence('adjacents', true)}.`
        : `Aucun arc ne relie $${sommets[d1]}$ et $${sommets[d2]}$, dans un sens ou dans l’autre, donc ces sommets ne sont ${enEvidence('pas adjacents', false)}.`,
    },
    {
      question: `La suite de sommets ${texChemin(suite)} est-elle un chemin du graphe $G$ ?${justifier}`,
      answer: reponseOuiNon(veutChemin),
      field: { qcm: ouiNon },
      correction: veutChemin
        ? `Le graphe $G$ contient les arcs $${sommets[x]}\\to ${sommets[y]}$ et $${sommets[y]}\\to ${sommets[z]}$, donc ${texChemin(suite)} ${enEvidence('est un chemin', true)}.`
        : `Le graphe $G$ ne contient pas l’arc $${sommets[lienManquant[0]]}\\to ${sommets[lienManquant[1]]}$, donc ${texChemin(suite)} n’est ${enEvidence('pas un chemin', false)}.`,
    },
    {
      question: `Donner la longueur du chemin ${texChemin(chemin)}.`,
      answer: { value: k },
      field: { keyboard: KeyboardType.clavierDeBase },
      correction: `Le chemin ${texChemin(chemin)} est formé de $${k}$ arcs, donc sa longueur est égale à $${miseEnEvidence(k)}$.`,
    },
    {
      question: `Existe-t-il un chemin allant de $${sommets[depart]}$ vers $${sommets[cible]}$ ?${justifier}`,
      answer: reponseOuiNon(veutAtteint),
      field: { qcm: ouiNon },
      correction: veutAtteint
        ? `${texChemin(cheminVers(adj, depart, cible))} est un chemin allant de $${sommets[depart]}$ vers $${sommets[cible]}$, donc la réponse est ${enEvidence('oui')}.`
        : accessibles.size === 1
          ? `Aucun arc ne part de $${sommets[depart]}$, donc la réponse est ${enEvidence('non')}.`
          : `En suivant les arcs depuis $${sommets[depart]}$, on n’atteint que ${texAccessibles}, donc la réponse est ${enEvidence('non')}.`,
    },
  ]
  return { adj, sousQuestions, cle: `oriente|${adj.flat().join('')}` }
}

export default class VocabulaireGraphes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = [
      'Type de graphe',
      3,
      '1 : Orienté\n2 : Non orienté\n3 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Nombre de sommets',
      3,
      '1 : 4 sommets\n2 : 5 sommets\n3 : Mélange',
    ]
    this.sup = 3
    this.sup2 = 3
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const listeOriente = combinaisonListes(
      this.sup === 3 ? [true, false] : [this.sup === 1],
      this.nbQuestions,
    )
    const listeOrdres = combinaisonListes(
      this.sup2 === 3 ? [4, 5] : [this.sup2 + 3],
      this.nbQuestions,
    )
    const interactif = this.interactif && context.isHtml && !context.isTypst
    correctionInteractive = interactif
    const justifier = interactif ? '' : ' Justifier.'
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const oriente = listeOriente[i]
      const n = listeOrdres[i]
      const complet = !oriente && randint(1, 4) === 1
      const reponses: Reponses = {
        complet,
        connexe: complet || choice([true, false]),
        adjacents: complet || choice([true, false]),
        arc: choice([true, false]),
        chemin: choice([true, false]),
        atteint: choice([true, false]),
      }
      let question: Question | null = null
      for (let essai = 0; essai < 1000 && question == null; essai++) {
        question = oriente
          ? questionOrientee(n, justifier, reponses)
          : questionNonOrientee(n, justifier, reponses)
      }
      if (question == null) continue
      if (!this.questionJamaisPosee(i, question.cle)) continue

      createQuestion(this, i, {
        question: `On considère le graphe ${oriente ? 'orienté' : 'non orienté'} $G$ ci-dessous.<br>${figureGraphe(question.adj, oriente)}`,
        subQuestions: question.sousQuestions,
      })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
