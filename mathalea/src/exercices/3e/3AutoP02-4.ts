import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre =
  'Calculer une distance réelle à partir d’une carte à l’échelle'
export const interactifReady = true
export const dateDePublication = '06/10/2026'
export const uuid = 'bb891'
export const refs = {
  'fr-fr': ['3AutoP02-4'],
  'fr-ch': ['10CTFA1F-4', '10LCFA1F-4', '10LSFA1F-4', 'PRQPF03B-4', 'PRQPF04B-4'],
}

export default class RealDistanceFromMap extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = {
      texteAvant: '<br>La distance réelle est de ',
      texteApres: '$\\,\\text{km}$.',
    }
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    // Un centimètre représente 1, 2, 5 ou 10 km pour rester en calcul mental.
    const kilometresPerCentimetre = choice([1, 2, 5, 10])
    const scaleDenominator = kilometresPerCentimetre * 100000
    const mapDistance = randint(2, 9)
    const realDistance = mapDistance * kilometresPerCentimetre

    this.question = `Sur une carte routière à l’échelle $\\dfrac{1}{${texNombre(scaleDenominator, 0)}}$, deux villes sont séparées de $${mapDistance}\\,\\text{cm}$.<br><br>
      Calculer la distance réelle entre ces deux villes, en kilomètres.`
    this.reponse = realDistance
    this.correction = `À cette échelle, $1\\,\\text{cm}$ sur la carte représente $${texNombre(scaleDenominator, 0)}\\,\\text{cm}$ en réalité, soit $${kilometresPerCentimetre}\\,\\text{km}$.<br>
      La distance réelle entre les deux villes est donc :<br>
      $${mapDistance}\\times ${kilometresPerCentimetre}\\,\\text{km}=${miseEnEvidence(realDistance)}\\,\\text{km}$.`
  }
}
