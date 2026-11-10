import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  'Calculer une baisse globale après deux baisses successives'
export const interactifReady = true

export const uuid = 'bdscv'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q19 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteApres: '$\\,\\%$.' }
  }

  enonce(taux?: number): void {
    if (taux == null) {
      taux = choice([10, 20, 25, 30, 40])
    }

    this.formatChampTexte = KeyboardType.clavierDeBase

    // Après deux baisses de taux%, la valeur finale est : valeur × (1 - taux/100)²
    // La baisse globale est : 1 - (1 - taux/100)²
    const coefficientBaisse = 1 - taux / 100
    const coefficientGlobal = coefficientBaisse * coefficientBaisse
    const baisseGlobale = (1 - coefficientGlobal) * 100

    this.reponse = texNombre(baisseGlobale, 2)

    this.question = `Deux baisses successives de $${taux}\\,\\%$ correspondent à une baisse globale de`

    this.correction = `Le coefficient multiplicateur associé à une baisse de $${taux}\\,\\%$ est : <br>
    $CM=1-${texNombre(taux / 100, 2)}=${texNombre(1 - taux / 100, 2)}$.<br>
     Ainsi, le coefficient multiplicateur global après deux baisses successives de $${taux}\\,\\%$ est : <br>
    $CM_G=CM\\times CM=${texNombre(1 - taux / 100, 2)}\\times ${texNombre(1 - taux / 100, 2)}=${texNombre(coefficientGlobal, 4)}$.<br>
    Le taux d'évolution associé à ce coefficient multiplicateur est : <br>$CM_G-1=${texNombre(coefficientGlobal, 4)}-1=${texNombre(coefficientGlobal - 1, 4)}$.<br><br>
    
    La baisse globale est donc de $${miseEnEvidence(texNombre(baisseGlobale, 2))}\\,\\%$.`

    this.canReponseACompleter = '$\\ldots\\,\\%$'

    if (!this.interactif) {
      this.question += ' $\\ldots\\,\\%$.'
    }
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(50)
    else this.enonce()
  }
}
