import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Déterminer la forme canonique de $x^2+bx$ avec une fraction'
export const interactifReady = true

export const dateDePublication = '25/09/2026'

/**
 * Compléter $x^2+bx=(x+\ldots)^2-\ldots$ avec $b$ fraction irréductible.
 * @author Gilles Mora

*/
export const uuid = 'db800'

export const refs = {
  'fr-fr': ['can1SD3-06'],
  'fr-ch': [],
}
export default class FormeCanoniqueXCarrePlusBxFraction extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.formatInteractif = 'fillInTheBlank'
  }

  nouvelleVersion() {
    // Fractions irréductibles [numérateur, dénominateur] utilisées pour b
    const fractions = [
      [1, 3],
      [1, 4],
      [1, 5],
      [1, 6],
      [1, 7],
      [1, 8],
      [1, 9],
      [1, 10],
      [1, 2],
      [3, 2],
      [5, 2],
      [1, 3],
      [2, 3],
      [4, 3],
      [5, 3],
      [8, 3],
      [1, 4],
      [3, 4],
      [5, 4],
      [1, 5],
      [2, 5],
      [3, 5],
      [4, 5],
      [6, 5],
      [8, 5],
      [2, 7],
      [4, 7],
      [6, 7],
    ]
    const signe = this.quotaChoice('signe', ['+', '-'])
    const [p, q] = this.quotaChoice('b', fractions)
    const b = new FractionEtendue(p, q).texFraction
    const moitie = new FractionEtendue(p, 2 * q).texFractionSimplifiee
    const carreMoitie = new FractionEtendue(p * p, 4 * q * q)
      .texFractionSimplifiee
    const termeX = `${b}x`
    const moitieAuCarre = `\\left(${moitie}\\right)^2`

    this.reponse = {
      bareme: toutPourUnPoint,
      champ1: { value: moitie },
      champ2: { value: carreMoitie },
    }
    this.consigne = "Compléter l'égalité."
    this.question = `x^2${signe}${termeX}=\\left(x${signe}%{champ1}\\right)^2-%{champ2}`

    this.correction = `On fait apparaître le début du développement d'une identité remarquable : $x^2${signe}${termeX}=x^2${signe}2\\times ${moitie}\\times x$.<br>
    On ajoute et on retranche $${moitieAuCarre}$ :<br>
    $\\begin{aligned}
    x^2${signe}${termeX}&=\\underbrace{x^2${signe}2\\times ${moitie}\\times x+${moitieAuCarre}}_{\\small\\left(x${signe}${moitie}\\right)^2}-${moitieAuCarre}\\\\
    &=\\left(x${signe}${moitie}\\right)^2-${moitieAuCarre}\\\\
    &=\\left(x${signe}${miseEnEvidence(moitie)}\\right)^2-${miseEnEvidence(carreMoitie)}
    \\end{aligned}$`

    this.canEnonce = ` $x^2${signe}${termeX}=$.`
    this.canReponseACompleter = `$\\left(x${signe}\\ldots\\right)^2-\\ldots$`
  }
}
