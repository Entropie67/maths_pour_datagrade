import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  texteEnCouleurEtGras,
  texteGras,
  miseEnEvidence,
} from '../../lib/outils/embellissements'

export const titre = "Écrire la liste de tous les diviseurs d'un entier"
export const interactifReady = true

export const dateDePublication = '13/12/2024'

export const uuid = '108ab'
export const refs = {
  'fr-fr': ['5N1I-2', 'CM2N1I'],
  'fr-2016': ['5A10-1'],
  'fr-ch': ['9R1NO1B-2', '9R2NO1B-2', '9R3NO1B-2', 'PRQNO09A-1'],
}
/**
 * Donner la liste de tous les diviseurs de tête pour des nombres simples
 * @author Rémi Angot
 */
export default class ListeDiviseurs extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    this.consigne = 'Donner la liste de tous les diviseurs '
    this.consigne +=
      this.nbQuestions > 1 ? 'des nombres suivants.' : 'du nombre suivant.'
    const typeQuestionsDisponibles = [
      'multipleDe10',
      'Premier',
      'Pair',
      'ImpairMultipleDe3',
    ]
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let n = 0
      switch (listeTypeQuestions[i]) {
        case 'multipleDe10':
          n = 10 * randint(1, 6)
          break
        case 'Premier':
          n = choice([11, 13, 17, 19, 23, 29])
          break
        case 'Pair':
          n = 2 * randint(6, 14, [10])
          break
        case 'ImpairMultipleDe3':
          n = choice([15, 21, 27, 33, 39, 45])
          break
      }
      // Get all divisors of n
      const divisors = []
      for (let i = 1; i <= n; i++) {
        if (n % i === 0) {
          divisors.push(i)
        }
      }
      let texte = `Diviseurs de $${n}$ :`
      const texteCorr = `${texte} $${miseEnEvidence(divisors.join(' ; '))}$.`
      if (this.questionJamaisPosee(i, texte)) {
        if (this.interactif) {
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
          )
          this.consigne = `Donner la liste de tous les diviseurs (${texteGras('séparés par un point-virgule')}) `
          this.consigne +=
            this.nbQuestions > 1
              ? 'des nombres suivants.'
              : 'du nombre suivant.'
          handleAnswers(this, i, {
            reponse: {
              value: divisors.join(';'),
              options: { suiteDeNombres: true },
            },
          })
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
