import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { fraction } from '../../../modules/fractions'
import ExerciceSimple from '../../ExerciceSimple'

type Situation = {
  key: string
  start: string
  itemSing: string
  itemPlur: string
  lab1Sing: string
  lab1Plur: string
  lab2Sing: string
  lab2Plur: string
}

export const titre = 'Calculer une probabilité'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021

*/
export const uuid = '47142'

export const refs = {
  'fr-fr': ['can3S2-01', 'BP2FLUC15', '3AutoS01-2', 'BP1AUTO013', '2P10-flash3'],
  'fr-ch': ['NR'],
}
export default class CalculProbaSimple extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.versionQcmDisponible = true
  }

  nouvelleVersion() {
    const situations: Situation[] = [
      {
        key: 'bonbons',
        start: 'Un sachet de bonbons contient',
        itemSing: 'bonbon',
        itemPlur: 'bonbons',
        lab1Sing: 'un bonbon au citron',
        lab1Plur: 'bonbons au citron',
        lab2Sing: 'un bonbon à la fraise',
        lab2Plur: 'bonbons à la fraise',
      },
      {
        key: 'eleves',
        start: 'On choisit au hasard un élève dans un groupe composé de',
        itemSing: 'élève',
        itemPlur: 'élèves',
        lab1Sing: 'une fille',
        lab1Plur: 'filles',
        lab2Sing: 'un garçon',
        lab2Plur: 'garçons',
      },
      {
        key: 'livres',
        start: 'On choisit un livre au hasard sur un étal présentant',
        itemSing: 'un roman',
        itemPlur: 'romans',
        lab1Sing: 'un roman historique',
        lab1Plur: 'romans historiques',
        lab2Sing: "un roman d'anticipation",
        lab2Plur: "romans d'anticipation",
      },
      {
        key: 'films',
        start: "On choisit un film au hasard parmi ceux à l'affiche proposant",
        itemSing: 'un film',
        itemPlur: '',
        lab1Sing: 'une comédie',
        lab1Plur: 'comédies',
        lab2Sing: 'un drame',
        lab2Plur: 'drames',
      },
      {
        key: 'urne',
        start: 'On tire une boule au hasard dans une urne contenant',
        itemSing: 'boule',
        itemPlur: 'boules',
        lab1Sing: 'une boule noire',
        lab1Plur: 'boules noires',
        lab2Sing: 'une boule blanche',
        lab2Plur: 'boules blanches',
      },
      {
        key: 'cartes',
        start: 'On tire une carte au hasard dans un paquet contenant',
        itemSing: 'carte',
        itemPlur: 'cartes',
        lab1Sing: 'une carte rouge',
        lab1Plur: 'cartes rouges',
        lab2Sing: 'une carte noire',
        lab2Plur: 'cartes noires',
      },
      {
        key: 'tickets',
        start: 'On choisit un ticket au hasard parmi',
        itemSing: 'ticket',
        itemPlur: 'tickets',
        lab1Sing: 'un ticket gagnant',
        lab1Plur: 'tickets gagnants',
        lab2Sing: 'un ticket perdant',
        lab2Plur: 'tickets perdants',
      },
      {
        key: 'billes',
        start: 'On prend au hasard une bille dans un sac contenant',
        itemSing: 'bille',
        itemPlur: 'billes',
        lab1Sing: 'une bille claire',
        lab1Plur: 'billes claires',
        lab2Sing: 'une bille foncée',
        lab2Plur: 'billes foncées',
      },
    ]

    const situ = choice(situations)
    const a = this.quotaRandint('a', 3, 10)
    const k = this.quotaChoice('k', [3, 4, 9])

    // choisir aléatoirement si la question porte sur la première ou la seconde étiquette
    const ciblePremiere = this.quotaChoice('ciblePremiere', [true, false])

    // construction d'une phrase naturelle pour la cible (heuristique)
    const construitPhraseCible = (
      situ: Situation,
      inversion: boolean,
      a: number,
      b: number,
    ) => {
      let lab1Sing: string
      let lab1Plur: string
      let lab2Plur: string

      if (!inversion) {
        lab1Sing = situ.lab1Sing
        lab1Plur = situ.lab1Plur
        lab2Plur = situ.lab2Plur
      } else {
        lab1Sing = situ.lab2Sing
        lab1Plur = situ.lab2Plur
        lab2Plur = situ.lab1Plur
      }
      let phrase = `${situ.start} $${a}$ ${lab1Plur} et $${b}$ ${lab2Plur}.<br>`
      phrase += `Quelle est la probabilité de choisir ${lab1Sing} ?`
      return phrase
    }
    const inversion = choice([true, false])
    const numCorrect = ciblePremiere ? a : k * a
    const denomTotal = a + k * a
    const correctTexSimpl = fraction(
      numCorrect,
      denomTotal,
    ).texFractionSimplifiee
    this.reponse = `${fraction(numCorrect, denomTotal).texFraction}`

    // déterminer la bonne réponse selon que la cible soit la 1ère ou la 2ème étiquette

    // Construction de l'énoncé en utilisant les formes plurielles pour les quantités
    this.question = construitPhraseCible(
      situ,
      inversion,
      numCorrect,
      denomTotal - numCorrect,
    )
    const labelCible = inversion ? situ.lab2Sing : situ.lab1Sing
    this.correction = this.versionQcm
      ? `Il y a en tout : $${a} + ${k * a} = ${denomTotal}$ ${situ.itemPlur}.<br>La probabilité de choisir ${labelCible} est de $${miseEnEvidence(`\\dfrac{${numCorrect}}{${denomTotal}}`)}$.`
      : `Il y a en tout : $${a} + ${k * a} = ${denomTotal}$ ${situ.itemPlur}.<br>La probabilité de choisir ${labelCible} est de $${miseEnEvidence(`\\dfrac{${numCorrect}}{${denomTotal}}`)}$, soit $${miseEnEvidence(correctTexSimpl)}$.`

    // Version QCM : distracteurs plausibles
    if (this.versionQcm) {
      this.reponse = '$' + this.reponse + '$'
      const correctTex = correctTexSimpl
      const candidates: string[] = []

      // erreurs/alternatives courantes adaptées à la cible
      // erreur plausible : confondre a*(k+1) avec a + k
      candidates.push(fraction((k - 1) * a, k * a).texFraction)
      // complémentaire (1 - p)
      candidates.push(
        fraction(denomTotal - (ciblePremiere ? k * a : a), k * a).texFraction,
      )
      // oublier le facteur k (si cible = 2ème étiquette on peut confondre num / a)
      const otherNum = ciblePremiere ? k * a : a
      candidates.push(fraction(otherNum, denomTotal).texFraction) // confondre les deux catégories

      const uniq = Array.from(
        new Set(candidates.filter((s) => s && s !== correctTex)),
      )
      const picked = shuffle(uniq).slice(0, 3)
      this.distracteurs = picked.map((s) => `$${s}$`)
    }
  }
}
