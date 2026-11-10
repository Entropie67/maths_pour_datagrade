// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid eae92 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'

import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Connaître les tables de multiplication (de 5 à 9)'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021
 */
export const uuid = 'eae92'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class Tables5A9Old extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 3, 9)
    const b = this.quotaRandint('b', 5, 9)
    this.reponse = a * b
    this.question = `Calculer $${a} \\times ${b}$.`
    this.correction = `$${a} \\times ${b}=${miseEnEvidence(a * b)}$`
  }
}
