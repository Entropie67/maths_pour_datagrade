import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import ExerciceSimple from '../ExerciceSimple'

export const titre =
  'Écrire sous forme décimale la somme ou la différence d’un entier et d’une fraction'
export const dateDePublication = '25/10/2026'
export const interactifReady = true

export const uuid = '10c06'

export const refs = {
  'fr-fr': ['1A-C04-10'],
  'fr-ch': [],
}

/**
 * @author Gilles Mora
 */

// [numérateur, dénominateur]
const fractions: [number, number][] = [
  [1, 2],
  [1, 4],
  [3, 4],
  [1, 5],
  [2, 5],
  [3, 5],
  [4, 5],
]

export default class Auto1AC4j extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.tip = `
  <p style="margin: 0 0 10px 0;">
    Il faut écrire sous forme décimale un entier auquel on ajoute ou on retranche une fraction.
  </p>
  <ul style="list-style-type: disc; padding-left: 1.5em; margin: 0 0 14px 0; line-height: 2;">
    <li>Écrire la fraction sous forme décimale ($\\dfrac{1}{2}=0,5$, $\\dfrac{1}{4}=0,25$, $\\dfrac{1}{5}=0,2$).</li>
    <li>Effectuer ensuite l'addition ou la soustraction.</li>
  </ul>`
  }

  nouvelleVersion() {
    const entier = this.quotaRandint('entier', 1, 4)
    const [num, den] = this.quotaChoice('fraction', fractions)
    const signe = this.quotaChoice('signe', ['+', '-'])
    const valeurFraction = arrondi(num / den, 2)
    const resultat = arrondi(
      signe === '+' ? entier + valeurFraction : entier - valeurFraction,
      2,
    )
    const fractionTex = `\\dfrac{${num}}{${den}}`

    this.question = `Donner l'écriture décimale de $${entier}${signe}${fractionTex}$.`
    this.correction = `$${entier}${signe}${fractionTex}=${entier}${signe}${texNombre(valeurFraction, 2)}=${miseEnEvidence(texNombre(resultat, 2))}$`
    this.reponse = resultat
  }
}
