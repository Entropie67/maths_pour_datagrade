import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { toutPourUnPoint } from '../../../lib/interactif/fonctionsBaremes'
import { ecritureAlgebrique, rienSi1 } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  "Donner les coordonnées du sommet à partir d'une forme canonique"
export const interactifReady = true

export const uuid = 'fqsqa'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q9 extends ExerciceCan {
  enonce(a?: number, alpha?: number, beta?: number): void {
    if (a == null || alpha == null || beta == null) {
      a = randint(-5, 5, 0)
      alpha = randint(-9, 9, 0)
      beta = randint(-15, 15, 0)
    }

    this.formatChampTexte = KeyboardType.clavierDeBase
    this.formatInteractif = 'fillInTheBlank'

    this.reponse = {
      bareme: toutPourUnPoint,
      champ1: { value: alpha },
      champ2: { value: beta },
    }

    this.consigne = `Coordonnées du sommet S de la parabole représentant la fonction $f$ définie sur $\\mathbb{R}$ par $f(x)=${rienSi1(a)}(x${ecritureAlgebrique(-alpha)})^2${ecritureAlgebrique(beta)}$.<br>`
    this.question = 'S(%{champ1};%{champ2})'

    this.correction = `On reconnaît la forme canonique d'une fonction polynôme du second degré : $f(x)=a(x-\\alpha)^2+\\beta$.<br>
    Le sommet de la parabole a pour coordonnées $(\\alpha\\,;\\,\\beta)$.<br>
    Ici $\\alpha=${alpha}$ et $\\beta=${beta}$, donc $S(${miseEnEvidence(`${alpha}`)}\\,;\\,${miseEnEvidence(`${beta}`)})$.`
    this.canEnonce = `Coordonnées du sommet S de la parabole représentant la fonction $f$ définie sur $\\mathbb{R}$ par $f(x)=${rienSi1(a)}(x${ecritureAlgebrique(-alpha)})^2${ecritureAlgebrique(beta)}$.`
    this.canReponseACompleter = '$S(\\ldots\\,;\\,\\ldots)$'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(-3, -8, -5)
    else this.enonce()
  }
}
