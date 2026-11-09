import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'

export const titre = "Écrire la liste des premiers multiples d'un entier"
export const interactifReady = true

export const dateDePublication = '02/05/2026'

export const uuid = 'd2d85'
export const refs = {
  'fr-fr': ['5N1I-3'],
  'fr-2016': ['5A10-2'],
  'fr-ch': ['9R1NO1B-1', '9R2NO1B-1', '9R3NO1B-1', 'PRQNO09A-2'],
}
/**
 * @author Éric Elter
 */
export default class ListeMultiples extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.correctionDetailleeDisponible = true
    this.correctionDetaillee = true
  }

  nouvelleVersion() {
    this.consigne = 'Donner la liste des $5$ premiers multiples non nuls '
    this.consigne +=
      this.nbQuestions > 1 ? 'des nombres suivants.' : 'du nombre suivant.'
    const typeQuestionsDisponibles = [
      'multipleDe10',
      'multipleDe6',
      'multipleDe4',
      'multipleDe25',
      'multipleDe100',
    ]
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let n = 0
      switch (listeTypeQuestions[i]) {
        case 'multipleDe10':
          n = 10 * randint(1, 9)
          break
        case 'multipleDe6':
          n = 6 * choice([1, 2, 5])
          break
        case 'multipleDe4':
          n = 4 * randint(1, 6)
          break
        case 'multipleDe25':
          n = 25 * randint(1, 3)
          break
        case 'multipleDe100':
        default:
          n = 100 * randint(1, 9)
          break
      }
      // Get all multiples of n
      const multiplesAffichage = []
      const multiplesReponse = []
      for (let i = 1; i <= 5; i++) {
        multiplesAffichage.push(texNombre(i * n))
        multiplesReponse.push(i * n)
      }
      let texte = `$5$ premiers multiples non nuls de $${n}$ :`
      let texteCorr = this.correctionDetaillee
        ? `Les $5$ premiers multiples non nuls de $${n}$ sont 
$${n} \\times 1,\\ ${n} \\times 2,\\ ${n} \\times 3,\\ ${n} \\times 4$ et $${n} \\times 5$.<br>`
        : ''
      texteCorr += `${texte} $${miseEnEvidence(multiplesAffichage.join(';'))}$.`
      if (this.questionJamaisPosee(i, texte)) {
        if (this.interactif) {
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBaseAvecFractionPuissanceCrochets,
          )
          this.consigne = `Donner la liste des premiers multiples non nuls (${texteGras('séparés par un point-virgule')}) `
          this.consigne +=
            this.nbQuestions > 1
              ? 'des nombres suivants.'
              : 'du nombre suivant.'
          handleAnswers(this, i, {
            reponse: {
              value: multiplesReponse.join(';'),
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
