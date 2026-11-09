import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'

import { combinaisonListes } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Connaître les tables de multiplication (de $5$ à $9$)'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Jean-claude Lhote
 * Créé pendant l'été 2021
 */
export const dateDeModifImportante = '18/10/2026'

export const uuid = '47e81'

export const refs = {
  'fr-fr': ['can6C1-03', '5N3autoA-6', '5N4autoA-6'],
  'fr-ch': [],
}
export default class Tables5A9 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    // Un seul plan pour les couples (a, b) : avec deux plans indépendants,
    // un couple déjà posé pouvait revenir à chaque nouvel essai.
    const [a, b] = this.fromQuestionPlan('ab', (n) => {
      const couples: [number, number][] = []
      for (let x = 3; x <= 9; x++) {
        for (let y = 5; y <= 9; y++) couples.push([x, y])
      }
      return combinaisonListes(couples, n)
    })
    this.reponse = a * b
    this.question = `Calculer $${a} \\times ${b}$.`
    this.correction = `$${a} \\times ${b}=${miseEnEvidence(a * b)}$`
  }
}
