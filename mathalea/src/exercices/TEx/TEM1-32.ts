import { createList } from '../../lib/format/lists'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { matriceCompare } from '../../lib/interactif/comparaisonMatrices'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha } from '../../lib/outils/outilString'
import {
  texMembreGauche,
  texSystemeEquations,
} from '../../lib/outils/systemeEquations'
import { texNombre } from '../../lib/outils/texNombre'
import type { IExercice } from '../../lib/types'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Étudier l'évolution d'effectifs avec des matrices"
export const interactifReady = true
export const interactifType = 'mathLive'
export const dateDePublication = '08/10/2026'

/**
 * Des effectifs se répartissent entre plusieurs lieux (salles, stations,
 * zones, villes) : écrire la matrice M telle que U_{n+1}=MU_n et U_0, calculer
 * U_1, puis, en admettant que U_n=M^nU_0, calculer U_k à la calculatrice.
 *
 * @author Arnaud Meistermann
 */
export const uuid = 'ba1c6'

export const refs = {
  'fr-fr': ['TEM1-32'],
  'fr-ch': [],
}

const lettres = ['A', 'B', 'C']

function texPmatrix(table: string[][]): string {
  return `\\begin{pmatrix}${table.map((ligne) => ligne.join(' & ')).join('\\\\')}\\end{pmatrix}`
}

/** Matrice à coefficients décimaux, écrits à la française. */
function texMatrice(table: number[][]): string {
  return texPmatrix(table.map((ligne) => ligne.map((x) => texNombre(x))))
}

function colonne(valeurs: number[]): number[][] {
  return valeurs.map((x) => [x])
}

/** « a », « a et b », « a, b et c ». */
function joinEt(liste: string[]): string {
  return liste.length === 1
    ? liste[0]
    : `${liste.slice(0, -1).join(', ')} et ${liste[liste.length - 1]}`
}

function majuscule(texte: string): string {
  return texte.charAt(0).toUpperCase() + texte.slice(1)
}

/** Effectifs qui se répartissent entre plusieurs lieux (salles, stations…). */
type ContexteEvolution = {
  id: string
  /** Ex. : « Une ville compte trois salles de sport, notées A, B et C. … chaque année : ». */
  intro: (nombre: string, noms: string) => string
  depart: (pct: string, x: string, y: string) => string
  departSuivant: (pct: string, y: string) => string
  reste: (x: string) => string
  notation: (effectifs: string, noms: string) => string
  initial: (noms: string, valeurs: string) => string
  formation: (p: number) => string
  conservation: string
  effectif: () => number
  /** Pour interpréter U_k : « au 1er janvier 2031, les salles A et B compteront… ». */
  moment: (k: number) => string
  lieux: string
  futur: string
  unite: string
}

function premierJanvier(k: number): string {
  return `au $1^{\\text{er}}$ janvier ${2026 + k}`
}

const contextesEvolution: ContexteEvolution[] = [
  {
    id: 'salles',
    intro: (nombre, noms) =>
      `Une ville compte ${nombre} salles de sport, notées ${noms}. Le nombre total d'abonnés reste constant et, chaque année :`,
    depart: (pct, x, y) =>
      `${pct} des abonnés de la salle ${x} la quittent pour la salle ${y}`,
    departSuivant: (pct, y) => `${pct} pour la salle ${y}`,
    reste: (x) => `les autres restent abonnés à la salle ${x}`,
    notation: (effectifs, noms) =>
      `on note ${effectifs} les nombres d'abonnés respectifs des salles ${noms} au $1^{\\text{er}}$ janvier de l'année $2026+n$`,
    initial: (noms, valeurs) =>
      `Au $1^{\\text{er}}$ janvier 2026, les salles ${noms} comptent respectivement ${valeurs} abonnés.`,
    formation: (p) =>
      `Chaque effectif de l'année suivante est formé des abonnés restés dans la salle et de ceux venus ${p === 2 ? "de l'autre salle" : 'des autres salles'}`,
    conservation: "le nombre total d'abonnés",
    effectif: () => 100 * randint(8, 30),
    moment: premierJanvier,
    lieux: 'salles',
    futur: 'compteront',
    unite: 'abonnés',
  },
  {
    id: 'velos',
    intro: (nombre, noms) =>
      `Un service de vélos en libre-service dispose de ${nombre} stations, notées ${noms}. Le nombre total de vélos reste constant et, chaque nuit :`,
    depart: (pct, x, y) =>
      `${pct} des vélos de la station ${x} sont déplacés vers la station ${y}`,
    departSuivant: (pct, y) => `${pct} vers la station ${y}`,
    reste: (x) => `les autres restent à la station ${x}`,
    notation: (effectifs, noms) =>
      `on note ${effectifs} les nombres de vélos respectifs des stations ${noms} au matin du jour $n$`,
    initial: (noms, valeurs) =>
      `Au matin du jour $0$, les stations ${noms} comptent respectivement ${valeurs} vélos.`,
    formation: (p) =>
      `Chaque effectif du lendemain est formé des vélos restés dans la station et de ceux venus ${p === 2 ? "de l'autre station" : 'des autres stations'}`,
    conservation: 'le nombre total de vélos',
    effectif: () => 20 * randint(2, 6),
    moment: (k) => `au matin du jour $${k}$`,
    lieux: 'stations',
    futur: 'compteront',
    unite: 'vélos',
  },
  {
    id: 'reserve',
    intro: (nombre, noms) =>
      `Une réserve naturelle est divisée en ${nombre} zones, notées ${noms}. Le nombre total de cerfs reste constant et, chaque mois :`,
    depart: (pct, x, y) =>
      `${pct} des cerfs de la zone ${x} migrent vers la zone ${y}`,
    departSuivant: (pct, y) => `${pct} vers la zone ${y}`,
    reste: (x) => `les autres restent dans la zone ${x}`,
    notation: (effectifs, noms) =>
      `on note ${effectifs} les nombres de cerfs respectifs des zones ${noms} au bout de $n$ mois`,
    initial: (noms, valeurs) =>
      `Au départ, les zones ${noms} abritent respectivement ${valeurs} cerfs.`,
    formation: (p) =>
      `Chaque effectif du mois suivant est formé des cerfs restés dans la zone et de ceux venus ${p === 2 ? "de l'autre zone" : 'des autres zones'}`,
    conservation: 'le nombre total de cerfs',
    effectif: () => 20 * randint(3, 12),
    moment: (k) => (k === 1 ? "au bout d'un mois" : `au bout de $${k}$ mois`),
    lieux: 'zones',
    futur: 'abriteront',
    unite: 'cerfs',
  },
  {
    id: 'villes',
    intro: (nombre, noms) =>
      `Une région compte ${nombre} villes, notées ${noms}. La population totale reste constante et, chaque année :`,
    depart: (pct, x, y) =>
      `${pct} des habitants de la ville ${x} déménagent dans la ville ${y}`,
    departSuivant: (pct, y) => `${pct} dans la ville ${y}`,
    reste: (x) => `les autres restent dans la ville ${x}`,
    notation: (effectifs, noms) =>
      `on note ${effectifs} les populations respectives des villes ${noms} au $1^{\\text{er}}$ janvier de l'année $2026+n$`,
    initial: (noms, valeurs) =>
      `Au $1^{\\text{er}}$ janvier 2026, les villes ${noms} comptent respectivement ${valeurs} habitants.`,
    formation: (p) =>
      `Chaque population de l'année suivante est formée des habitants restés dans la ville et de ceux venus ${p === 2 ? "de l'autre ville" : 'des autres villes'}`,
    conservation: 'la population totale',
    effectif: () => 1000 * randint(5, 40),
    moment: premierJanvier,
    lieux: 'villes',
    futur: 'compteront',
    unite: 'habitants',
  },
]

/** `relation` remplace « = » devant le champ (par exemple « \approx »). */
type Champ = { nom: string; reponse: string; relation?: string }
/** Une consigne, sa correction et les matrices attendues. */
type Etape = { consigne: string; correction: string; champs: Champ[] }
type Situation = { enonce: string; etapes: Etape[]; cle: string }

function produit(M: number[][], U: number[]): number[] {
  return M.map((ligne) => ligne.reduce((s, m, j) => s + m * U[j], 0))
}

/** Effectifs qui se répartissent entre p lieux : U_{n+1}=MU_n. */
function situationEvolution(
  p: number,
  contexte: ContexteEvolution,
): Situation | null {
  const noms = lettres.slice(0, p)
  // pourcentages[i][j] : pourcentage de l'effectif de j qui passe en i.
  const pourcentages = noms.map(() => noms.map(() => 0))
  for (let j = 0; j < p; j++) {
    for (let i = 0; i < p; i++) {
      if (i !== j) pourcentages[i][j] = 5 * randint(1, 6)
    }
  }
  for (let j = 0; j < p; j++) {
    pourcentages[j][j] =
      100 - pourcentages.reduce((s, l, i) => s + (i === j ? 0 : l[j]), 0)
  }
  // Effectifs initiaux multiples de 20 : U_1 est alors à coefficients entiers.
  const initial = noms.map(() => contexte.effectif())
  const suivant = pourcentages.map(
    (l) => l.reduce((s, pct, j) => s + pct * initial[j], 0) / 100,
  )
  const coefficients = pourcentages.map((l) => l.map((pct) => pct / 100))
  const k = randint(3, 10)
  let Uk = initial
  for (let e = 0; e < k; e++) Uk = produit(coefficients, Uk)
  // On écarte les arrondis ambigus (partie décimale trop proche de 0,5).
  if (Uk.some((u) => Math.abs((u % 1) - 0.5) < 1e-3)) return null
  const UkArrondi = Uk.map((u) => Math.round(u))

  const suites = noms.map((x) => x.toLowerCase())
  const texU = texPmatrix(suites.map((u) => [`${u}_{n}`]))
  const M = texMatrice(coefficients)
  const U0 = texMatrice(colonne(initial))
  const U1 = texMatrice(colonne(suivant))
  const texUk = texMatrice(colonne(UkArrondi))
  const pct = (x: number) => `$${x}\\,\\%$`
  const texNoms = joinEt(noms)
  const texValeurs = (valeurs: number[]) =>
    joinEt(valeurs.map((e) => `$${texNombre(e)}$`))
  const interpretation = (n: number, valeurs: number[], environ: boolean) =>
    `${majuscule(contexte.moment(n))}, les ${contexte.lieux} ${texNoms} ${contexte.futur} respectivement ${environ ? 'environ ' : ''}${texValeurs(valeurs)} ${contexte.unite}.`

  const items = noms.map((x, j) => {
    const departs = noms
      .flatMap((y, i) => (i === j ? [] : [{ y, valeur: pourcentages[i][j] }]))
      .map(({ y, valeur }, rang) =>
        rang === 0
          ? contexte.depart(pct(valeur), x, y)
          : contexte.departSuivant(pct(valeur), y),
      )
    const fin = j === p - 1 ? '.' : ' ;'
    return `${joinEt(departs)}, ${contexte.reste(x)}${fin}`
  })
  let enonce = contexte.intro(p === 2 ? 'deux' : 'trois', texNoms)
  enonce += createList({ items, style: 'puces' })
  enonce += `Pour tout entier naturel $n$, ${contexte.notation(joinEt(suites.map((u) => `$${u}_n$`)), texNoms)} et $U_n=${texU}$.<br>`
  enonce += contexte.initial(texNoms, texValeurs(initial))

  const systeme = texSystemeEquations(
    suites.map(
      (u, i) =>
        `${u}_{n+1}&=${texMembreGauche(
          coefficients[i],
          suites.map((v) => `${v}_n`),
        )}`,
    ),
  )
  let correctionM = `${contexte.formation(p)}. On obtient ainsi, pour tout entier naturel $n$ :<br>$${systeme}$<br>`
  correctionM += `Ce système s'écrit $U_{n+1}=MU_n$ avec $M=${miseEnEvidence(M)}$.<br>`
  correctionM += `La somme des coefficients de chaque colonne de $M$ vaut $1$ : ${contexte.conservation} est ${contexte.conservation.startsWith('la') ? 'conservée' : 'conservé'}.`

  return {
    enonce,
    etapes: [
      {
        consigne:
          'Déterminer la matrice carrée $M$ telle que, pour tout entier naturel $n$, $U_{n+1}=MU_n$.',
        correction: correctionM,
        champs: [{ nom: 'M', reponse: M }],
      },
      {
        consigne: 'Donner la matrice $U_0$.',
        correction: `$U_0=${miseEnEvidence(U0)}$`,
        champs: [{ nom: 'U_0', reponse: U0 }],
      },
      {
        consigne: 'Calculer $U_1$ et interpréter le résultat.',
        correction: `$U_1=MU_0=${M}\\times${U0}=${miseEnEvidence(U1)}$<br>${interpretation(1, suivant, false)}`,
        champs: [{ nom: 'U_1', reponse: U1 }],
      },
      {
        consigne: `On admet que, pour tout entier naturel $n$, $U_n=M^nU_0$.<br>Calculer $U_{${k}}$ à l'aide de la calculatrice, en arrondissant ses coefficients à l'unité, puis interpréter le résultat.`,
        correction: `D'après le résultat admis, $U_{${k}}=M^{${k}}U_0$. La calculatrice donne, en arrondissant à l'unité :<br>$U_{${k}}\\approx${miseEnEvidence(texUk)}$<br>${interpretation(k, UkArrondi, true)}`,
        champs: [{ nom: `U_{${k}}`, reponse: texUk, relation: '\\approx' }],
      },
    ],
    cle: [contexte.id, ...pourcentages.flat(), ...initial, k].join('|'),
  }
}

/**
 * Renvoie une fonction qui donne le contexte suivant : un contexte ne revient
 * pas avant que tous aient servi.
 */
function serieDeContextes<T>(contextes: T[]): () => T {
  let file: T[] = []
  return () => {
    if (file.length === 0) file = shuffle(contextes)
    return file.shift() as T
  }
}

/** Première situation obtenue, en changeant de contexte si un tirage échoue. */
function premiereSituation<T>(
  suivant: () => T,
  generer: (contexte: T) => Situation | null,
): Situation | null {
  for (let c = 0; c < 5; c++) {
    const contexte = suivant()
    for (let essai = 0; essai < 1000; essai++) {
      const situation = generer(contexte)
      if (situation != null) return situation
    }
  }
  return null
}

/** Énoncé, champs de réponse et correction d'une situation (nbChamps champs par question). */
function assembler(
  exercice: IExercice,
  i: number,
  situation: Situation,
  nbChamps: number,
): { texte: string; texteCorr: string } {
  let texte = situation.enonce
  if (exercice.interactif) {
    texte += "<br>Saisir les matrices à l'aide de la touche «\u00a0Matrice\u00a0»."
  }
  let texteCorr = ''
  let champ = 0
  situation.etapes.forEach((etape, k) => {
    texte += `<br>${numAlpha(k)}${etape.consigne}`
    texteCorr += `${k > 0 ? '<br>' : ''}${numAlpha(k)}${etape.correction}`
    for (const { nom, reponse, relation = '=' } of etape.champs) {
      if (exercice.interactif) {
        texte +=
          '<br>' +
          ajouteChampTexteMathLive(
            exercice,
            nbChamps * i + champ,
            KeyboardType.clavierMatrice,
            { texteAvant: `$${nom}${relation}$` },
          )
      }
      handleAnswers(exercice, nbChamps * i + champ, {
        reponse: { value: reponse, compare: matriceCompare },
      })
      champ++
    }
  })
  return { texte, texteCorr }
}

export default class EvolutionDEffectifsAvecDesMatrices extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = [
      'Ordre de M',
      3,
      '1 : 2\n2 : 3\n3 : Mélange',
    ]
    this.sup = 3
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const tailles = combinaisonListes(
      this.sup === 3 ? [2, 3] : [this.sup + 1],
      this.nbQuestions,
    )
    const suivantEvolution = serieDeContextes(contextesEvolution)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const p = tailles[i]
      const situation = premiereSituation(suivantEvolution, (c) =>
        situationEvolution(p, c),
      )
      if (situation == null || !this.questionJamaisPosee(i, situation.cle)) {
        continue
      }
      const { texte, texteCorr } = assembler(this, i, situation, 4)
      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
      i++
    }
    listeQuestionsToContenu(this)
  }
}
