import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import Stat from '../../lib/mathFonctions/Stat'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '4637d'
export const refs = {
  'fr-fr': ['1A-S04-9'],
  'fr-ch': ['10CTFA2A-4', '10LCFA2A-4', '10LSFA2A-4'],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre =
  'Calculer la fréquence d’une catégorie à partir d’un diagramme en barres'
export const dateDePublication = '27/10/2026'

type Contexte = {
  presentation: string
  categories: string[]
  questionnes: string
  /** Groupe d'élèves (ou de personnes) concerné par la catégorie, sans article : « élèves qui viennent en vélo » */
  groupe: (categorie: string) => string
  titreDiagramme: string
  labelHorizontal: string
}

const contextes: Contexte[] = [
  {
    presentation:
      'Le diagramme en barres ci-dessous donne le moyen de transport utilisé par des élèves pour venir au lycée.',
    categories: ['Métro', 'Bus', 'Vélo', 'Trottinette', 'Voiture'],
    questionnes: 'élèves',
    groupe: (categorie) => `élèves qui viennent en ${categorie.toLowerCase()}`,
    titreDiagramme: 'Moyen de transport des élèves',
    labelHorizontal: 'Moyen de transport',
  },
  {
    presentation:
      'Le diagramme en barres ci-dessous donne la catégorie de licence des adhérents d’un club de badminton.',
    categories: ['A', 'B', 'C', 'D', 'E'],
    questionnes: 'adhérents',
    groupe: (categorie) => `adhérents de la catégorie ${categorie}`,
    titreDiagramme: 'Catégorie de licence des adhérents',
    labelHorizontal: 'Catégorie',
  },
  {
    presentation:
      'Le diagramme en barres ci-dessous donne le sport pratiqué par des élèves de première.',
    categories: ['Football', 'Tennis', 'Judo', 'Natation', 'Danse'],
    questionnes: 'élèves',
    groupe: (categorie) => `élèves qui pratiquent le sport «\u00a0${categorie}\u00a0»`,
    titreDiagramme: 'Sport pratiqué par les élèves',
    labelHorizontal: 'Sport',
  },
  {
    presentation:
      'Le diagramme en barres ci-dessous donne le fruit préféré des personnes interrogées lors d’une enquête.',
    categories: ['Pomme', 'Banane', 'Fraise', 'Orange', 'Poire'],
    questionnes: 'personnes',
    groupe: (categorie) =>
      `personnes dont le fruit préféré est «\u00a0${categorie}\u00a0»`,
    titreDiagramme: 'Fruit préféré des personnes interrogées',
    labelHorizontal: 'Fruit',
  },
]

// Effectifs totaux dont la fréquence s'écrit avec un décimal : calcul possible sans calculatrice
const effectifsTotaux = [20, 25, 40, 50]
const nombreCategories = 4

/**
 * @author Stéphane Guyon
 */
export default class CalculFrequenceCategorieBarres extends ExerciceQcmACourt {
  private fractionTex(numerateur: number, denominateur: number): string {
    return new FractionEtendue(numerateur, denominateur).texFractionSimplifiee
  }

  private genererEffectifs(total: number, effectifCible: number): number[] {
    // Les autres catégories ont au moins 2 élèves et sont réparties au hasard
    const autres = Array<number>(nombreCategories - 1).fill(2)
    let reste = total - effectifCible - 2 * autres.length
    while (reste > 0) {
      autres[randint(0, autres.length - 1)]++
      reste--
    }
    return [effectifCible, ...autres]
  }

  private appliquerLesValeurs(
    contexte: Contexte,
    categories: string[],
    effectifs: number[],
  ): void {
    const total = effectifs.reduce((somme, effectif) => somme + effectif, 0)
    const effectifCible = effectifs[0]
    const categorie = categories[0]
    // Le diagramme garde l'ordre d'entrée : on mélange pour que la cible ne soit pas toujours à gauche
    const maSerie = new Stat(
      shuffle(categories.map((nom, index) => [nom, effectifs[index]])),
      true,
      false,
    )
    const diagramme = maSerie.diagramme({
      cumul: false,
      barres: true,
      valuesOn: true,
      effectifsOn: true,
      titre: contexte.titreDiagramme,
      labelHorizontal: contexte.labelHorizontal,
      labelVertical: 'Effectif',
    })
    const reponse = this.fractionTex(effectifCible, total)

    const distracteursEffectifs = [
      ...effectifs.slice(1),
      total - effectifCible,
    ].filter((effectif) => effectif !== effectifCible)
    const reponses = [reponse]
    for (const effectif of distracteursEffectifs) {
      const distracteur = this.fractionTex(effectif, total)
      if (!reponses.includes(distracteur)) reponses.push(distracteur)
    }
    const autreDistracteur = this.fractionTex(
      effectifCible,
      total - effectifCible,
    )
    if (!reponses.includes(autreDistracteur)) reponses.push(autreDistracteur)
    while (reponses.length < 4) {
      const candidat = this.fractionTex(
        randint(1, total - 1, [effectifCible]),
        total,
      )
      if (!reponses.includes(candidat)) reponses.push(candidat)
    }
    this.reponses = reponses.slice(0, 4).map((r) => `$${r}$`)

    const sommeTex = effectifs
      .map((effectif) => texNombre(effectif, 0))
      .join('+')
    // Sans simplification possible, on n'écrit pas deux fois la même fraction
    const fractionDepart =
      pgcd(effectifCible, total) === 1
        ? ''
        : `\\dfrac{${effectifCible}}{${total}}=`
    const decimal = texNombre(effectifCible / total, 3)

    const introduction = `${contexte.presentation}<br>
    ${diagramme}<br><br>`
    const consigneReponse =
      "Donner le résultat sous la forme d'une fraction irréductible ou d'un nombre décimal."
    const question = `Quelle est la fréquence des ${contexte.groupe(categorie)} ?`
    // Version QCM et saisie libre non interactive : question ; saisie libre interactive : phrase affirmative à compléter
    this.enonce = `${introduction}${question}`
    this.enonceCourt = () =>
      this.interactif
        ? `${introduction}${consigneReponse}<br>`
        : `${introduction}${question}<br>${consigneReponse}`
    this.texteAvantReponseCourte = `La fréquence des ${contexte.groupe(categorie)} est égale à `

    this.correction = `On commence par calculer l'effectif total : $${sommeTex}=${total}$.<br>
    Il y a $${effectifCible}$ ${contexte.groupe(categorie)} sur un total de $${total}$ ${contexte.questionnes}.<br>
    La fréquence est donc $${fractionDepart}${miseEnEvidence(reponse)}$, soit $${decimal}$ sous forme décimale.`
  }

  versionAleatoire: () => void = () => {
    const n = 4
    do {
      const contexte = choice(contextes)
      const total = choice(effectifsTotaux)
      const effectifCible = randint(3, Math.floor(total / 2))
      const effectifs = this.genererEffectifs(total, effectifCible)
      const categories = shuffle(contexte.categories).slice(0, nombreCategories)
      this.appliquerLesValeurs(contexte, categories, effectifs)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, {
        fractionEgale: true,
        nombreDecimalSeulement: true,
      })
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
    this.champReponseCourteEnLigne = true

    this.versionAleatoire()
  }
}
