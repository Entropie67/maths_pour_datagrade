import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'

import { bleuMathalea } from '../../../lib/colors'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer le double et la moitié'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021
 */
export const uuid = '88435'

export const refs = {
  'fr-fr': ['can6C1-05', '6P3autoA-8'],
  'fr-ch': [],
}
export default class DoubleEtMoitie extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 1, 25) // variables aléatoires
    this.question = `Le double d'un nombre vaut $${4 * a}$, combien vaut sa moitié ?`
    this.correction = `Sa moitié vaut : $${miseEnEvidence(texNombre(a))}$.<br><br>`
    this.correction += texteEnCouleur(
      ` Mentalement : <br>
    Si le double du nombre est $${4 * a}$, ce nombre est : $${4 * a}\\div 2=${2 * a}$.<br>
    Puisqu'on cherche sa moitié, on le divise par $2$, soit  $${2 * a}\\div 2=${a}$.<br>`,
      bleuMathalea,
    )
    this.reponse = a
  }
}
