import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer la forme canonique de $x^2+bx$'
export const interactifReady = true

export const dateDePublication = '25/09/2026'

/**
 * Compléter $x^2+bx=(x+\ldots)^2-\ldots$ avec $b$ entier.
 * @author Gilles Mora

*/
export const uuid = 'a13c1'

export const refs = {
  'fr-fr': ['can1SD3-05'],
  'fr-ch': [],
}
export default class FormeCanoniqueXCarrePlusBx extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.formatInteractif = 'fillInTheBlank'
  }

  nouvelleVersion() {
    const signe = this.quotaChoice('signe', ['+', '-'])
    const b = this.quotaRandint('b', 1, 10)
    const moitie = new FractionEtendue(b, 2).texFractionSimplifiee
    const carreMoitie = new FractionEtendue(b * b, 4).texFractionSimplifiee
    const termeX = `${b === 1 ? '' : b}x`
    const moitieAuCarre =
      b % 2 === 0 ? `${moitie}^2` : `\\left(${moitie}\\right)^2`

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
    x^2${signe}${termeX}&=\\underbrace{x^2${signe}2\\times ${moitie}\\times x+${moitieAuCarre}}_{\\small\\left(x${signe}${moitie.replace('\\dfrac', '\\frac')}\\right)^2}-${moitieAuCarre}\\\\
    &=\\left(x${signe}${moitie}\\right)^2-${moitieAuCarre}\\\\
    &=\\left(x${signe}${miseEnEvidence(moitie)}\\right)^2-${miseEnEvidence(carreMoitie)}
    \\end{aligned}$`

    this.canEnonce = `$x^2${signe}${termeX}=$`
    this.canReponseACompleter = `$\\left(x${signe}\\ldots\\right)^2-\\ldots$`
  }
}
