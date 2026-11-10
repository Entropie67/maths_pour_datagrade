import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { touchesNotationScientifique } from '../../lib/outils/ordreDeGrandeur'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const dateDePublication = '26/10/2026'
export const uuid = '1ea61'
// @Author Stéphane Guyon
export const refs = {
  'fr-fr': ['1A-C05-9', '2A-N5-9'],
  'fr-ch': [],
}
export const interactifReady = true
export const titre = 'Déterminer un ordre de grandeur dans un problème'

type Contexte = {
  enonce: (n1: string, n2: string) => string
  /** Unité de la réponse, en LaTeX (précédée d'une espace) */
  unite: string
  /** Début de la phrase affirmative qui contient le champ de réponse */
  phrase: string
  /** Exposants possibles (de la notation scientifique) du premier et du second nombre */
  exposants1: [number, number]
  exposants2: [number, number]
  /** Plus grand chiffre arrondi possible pour le second nombre (durées, quantités à garder crédibles) */
  maxSecond?: number
  /** Le calcul se fait dans une autre unité que celle de la réponse (décalage d'exposant à la conversion) */
  conversion?: { decalage: number; uniteCalcul: string; relation: string }
}

const contextes: Contexte[] = [
  {
    enonce: (n1, n2) =>
      `Un parpaing pèse $${n1}$ g. $${n2}$ parpaings sont nécessaires à la construction d'un mur.<br>En raisonnant uniquement avec des ordres de grandeur, donner une estimation du poids du mur, en kilogrammes.`,
    unite: '\\text{ kg}',
    conversion: {
      decalage: -3,
      uniteCalcul: '\\text{ g}',
      relation: `1\\text{ kg}=${texNombre(1000, 0)}\\text{ g}`,
    },
    phrase: 'Une estimation du poids du mur est ',
    exposants1: [3, 3],
    exposants2: [2, 2],
  },
  {
    enonce: (n1, n2) =>
      `Un robinet qui fuit perd $${n1}$ mL d'eau par heure.<br>En raisonnant uniquement avec des ordres de grandeur, donner une estimation du volume d'eau perdu en $${n2}$ heures, en litres.`,
    unite: '\\text{ L}',
    conversion: {
      decalage: -3,
      uniteCalcul: '\\text{ mL}',
      relation: `1\\text{ L}=${texNombre(1000, 0)}\\text{ mL}`,
    },
    phrase: "Une estimation du volume d'eau perdu est ",
    exposants1: [2, 3],
    exposants2: [1, 1],
    maxSecond: 4,
  },
  {
    enonce: (n1, n2) =>
      `Un billet d'entrée pour un match coûte $${n1}$ €. Le stade est rempli par $${n2}$ spectateurs.<br>En raisonnant uniquement avec des ordres de grandeur, donner une estimation de la recette, en euros.`,
    unite: '\\text{ €}',
    phrase: 'Une estimation de la recette est ',
    exposants1: [1, 1],
    exposants2: [4, 5],
  },
  {
    enonce: (n1, n2) =>
      `Un livre contient $${n1}$ pages de $${n2}$ mots chacune.<br>En raisonnant uniquement avec des ordres de grandeur, donner une estimation du nombre de mots du livre.`,
    unite: '\\text{ mots}',
    phrase: 'Une estimation du nombre de mots du livre est ',
    exposants1: [2, 2],
    exposants2: [2, 2],
    maxSecond: 5,
  },
  {
    enonce: (n1, n2) =>
      `Une usine produit $${n1}$ bouteilles par jour et fonctionne $${n2}$ jours.<br>En raisonnant uniquement avec des ordres de grandeur, donner une estimation du nombre de bouteilles produites.`,
    unite: '\\text{ bouteilles}',
    phrase: 'Une estimation du nombre de bouteilles produites est ',
    exposants1: [3, 5],
    exposants2: [1, 1],
    maxSecond: 5,
  },
]

/** Couples de chiffres dont le produit est inférieur à 10 ou est un multiple de 10 différent de 10 */
const couples: [number, number][] = [
  [2, 2],
  [2, 3],
  [3, 2],
  [2, 4],
  [4, 2],
  [3, 3],
  [4, 5],
  [5, 4],
  [5, 6],
  [6, 5],
  [5, 8],
  [8, 5],
]

/**
 * Tire les écarts (en dixièmes) des deux nombres à leur chiffre arrondi, de façon que les
 * erreurs d'arrondi se compensent : le produit exact reste à moins de 4 % du produit des
 * arrondis, donc il s'arrondit au même chiffre significatif (33 × 29 000 ≈ 3 × 3 × 10^5).
 */
function ecartsQuiSeCompensent(a: number, b: number): [number, number] {
  let ecart1 = 0
  let ecart2 = 0
  let essais = 0
  do {
    ecart1 = randint(-3, 3)
    ecart2 = randint(-3, 3)
    essais++
  } while (
    essais < 1000 &&
    Math.abs(((10 * a + ecart1) * (10 * b + ecart2)) / (100 * a * b) - 1) > 0.04
  )
  return [ecart1, ecart2]
}

/** Nombre à deux chiffres significatifs : `(10 × chiffre + ecart) × 10^(exposant - 1)` */
function nombreProcheDe(chiffre: number, ecart: number, exposant: number) {
  return texNombre((chiffre * 10 + ecart) * 10 ** (exposant - 1), 0)
}

/**
 * Ordre de grandeur d'un produit tiré d'un contexte : on arrondit chaque nombre à un chiffre
 * significatif. La réponse attendue est de la forme `a×10^n`, avec `a` entier à un chiffre : l'énoncé le dit, car `3,21×10^4` serait aussi une notation scientifique.
 */
export default class OrdreDeGrandeurProbleme extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierEntierementPersonnalisable
    this.optionsDeComparaison = { ecritureScientifique: true }
  }

  nouvelleVersion() {
    const contexte = choice(contextes)
    let a = 0
    let b = 0
    let e1 = 0
    let e2 = 0
    let n1 = ''
    let n2 = ''
    let produit = 0
    let supplement = 0
    let exposantCalcul = 0
    // après conversion, l'exposant de la réponse ne doit pas être nul ou négatif
    for (let essais = 0; essais < 100; essais++) {
      ;[a, b] = choice(
        couples.filter(([, second]) => second <= (contexte.maxSecond ?? 9)),
      )
      e1 = randint(...contexte.exposants1)
      e2 = randint(...contexte.exposants2)
      const [ecart1, ecart2] = ecartsQuiSeCompensent(a, b)
      n1 = nombreProcheDe(a, ecart1, e1)
      n2 = nombreProcheDe(b, ecart2, e2)
      produit = a * b
      supplement = produit >= 10 ? 1 : 0
      exposantCalcul = e1 + e2 + supplement
      if (exposantCalcul + (contexte.conversion?.decalage ?? 0) >= 1) break
    }
    const chiffre = produit >= 10 ? produit / 10 : produit
    const exposant = exposantCalcul + (contexte.conversion?.decalage ?? 0)
    const attendu = `${chiffre}\\times10^{${exposant}}`
    this.question = `${contexte.enonce(n1, n2)}<br>Écrire la réponse sous la forme $a\\times10^{n}$, où $a$ est un entier à un chiffre.`
    this.optionsChampTexte = {
      dataKeys: touchesNotationScientifique,
      texteAvant: `<br>${contexte.phrase}`,
      texteApres: `$${contexte.unite}$.`,
    }
    this.reponse = attendu
    const etapeProduit =
      supplement === 1
        ? `${produit}\\times10^{${e1 + e2}}=${chiffre}\\times10^{${exposantCalcul}}`
        : `${produit}\\times10^{${e1 + e2}}`
    this.correction = `On arrondit chaque nombre à un seul chiffre significatif : $${n1}\\approx${a}\\times10^{${e1}}$ et $${n2}\\approx${b}\\times10^{${e2}}$.<br>
  Donc $${n1}\\times${n2}\\approx${a}\\times10^{${e1}}\\times${b}\\times10^{${e2}}=${a}\\times${b}\\times10^{${e1}+${e2}}=${etapeProduit}$.<br>
  ${
    contexte.conversion == null
      ? `Un ordre de grandeur est donc $${miseEnEvidence(attendu)}$ $${contexte.unite}$.`
      : `Un ordre de grandeur est donc $${chiffre}\\times10^{${exposantCalcul}}$ $${contexte.conversion.uniteCalcul}$.<br>
  Comme $${contexte.conversion.relation}$, on divise par $${texNombre(1000, 0)}$ : $${chiffre}\\times10^{${exposantCalcul}}\\div10^{3}=${miseEnEvidence(attendu)}$ $${contexte.unite}$.`
  }`
  }
}
