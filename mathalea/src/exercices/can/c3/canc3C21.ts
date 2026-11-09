import { gestionnaireFormulaireTexte, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { ajouteQuestionMathlive } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
export const titre = 'Ajouter ou soustraire des dizaines à un près'
export const interactifReady = true

export const dateDePublication = '03/02/2025'
/**
 * @author Jean-claude Lhote
 */
export const uuid = '416xx'

export const refs = {
  'fr-fr': ['canc3C21'],
  'fr-ch': [],
}
export default class AjouterDizainesAUnPres extends Exercice {
  constructor() {
    super()
    this.sup = '5'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.besoinFormulaireTexte = [
      'Types de questions',
      'Nombres séparés par des tirets  :\n1: Ajouter 9 ou 99\n2: Soustraire 9 ou 99\n3: Ajouter x9\n4: Soustraire x9\n5: Ajouter xx9\n6: Soustraire xx9\n7: Mélange',
    ]
  }

  nouvelleVersion() {
    const typeDeQuestion = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 6,
      melange: 7,
      defaut: 7,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let nb1: number
      let nb2: number
      let enonce: string
      let reponse: number
      let correction: string
      switch (typeDeQuestion[i]) {
        case 5: // ajouter xx9
          nb1 = randint(1, 6) * 10 + randint(1, 9)
          nb2 = randint(1, 5) * 100 + 9 + choice([10, 20, 30])
          enonce = `$${nb1}+${nb2}$`
          reponse = nb1 + nb2
          break
        case 6: // soustraire xx9
          nb2 = 9 + choice([10, 20, 30]) + randint(1, 5) * 100
          nb1 = nb2 + randint(1, 6) * 10 + randint(1, 9)
          enonce = `$${nb1}-${nb2}$`
          reponse = nb1 - nb2
          break
        case 1: // ajouter 9 ou 99
          nb1 = randint(1, 6) * 10 + randint(1, 9)
          nb2 = choice([9, 99])
          enonce = `$${nb1}+${nb2}$`
          reponse = nb1 + nb2

          break
        case 2: // soustraire 9 ou 99
          nb2 = choice([9, 99])
          nb1 = nb2 + randint(1, 8) * 10 + randint(1, 9)
          enonce = `$${nb1}-${nb2}$`
          reponse = nb1 - nb2
          break
        case 3: // ajouter x9
          nb1 = randint(1, 6) * 10 + randint(1, 9)
          nb2 = 9 + choice([10, 20, 30])
          enonce = `$${nb1}+${nb2}$`
          reponse = nb1 + nb2
          break
        case 4:
        default:
          // soustraire x9
          nb2 = 9 + choice([10, 20, 30])
          nb1 = nb2 + randint(1, 8) * 10 + randint(1, 9)
          enonce = `$${nb1}-${nb2}$`
          reponse = nb1 - nb2
          correction = `$${nb1}-${nb2}=${miseEnEvidence(reponse)}$`
          break
      }
      if (typeDeQuestion[i] % 2 === 1) {
        correction = `Ajouter $${nb2}$, c'est ajouter $${nb2 + 1}$ et soustraire $1$, donc<br>
        $\\begin{aligned}${nb1}+${nb2}&=${nb1}+${nb2 + 1}-1\\\\
        &=${nb1 + nb2 + 1}-1\\\\
        &=${miseEnEvidence(reponse)}\\end{aligned}$`
      } else {
        correction = `Soustraire $${nb2}$, c'est soustraire $${nb2 + 1}$ et ajouter $1$, donc<br>
        $\\begin{aligned}${nb1}-${nb2}&=${nb1}-${nb2 + 1}+1\\\\
        &=${nb1 - nb2 - 1}+1\\\\
        &=${miseEnEvidence(reponse)}\\end{aligned}$`
      }
      enonce += ajouteQuestionMathlive({
        exercice: this,
        question: i,
        typeInteractivite: 'mathlive',
        reponseParams: { formatInteractif: 'mathalea-mathfield' },
        objetReponse: { reponse: { value: reponse } },
      })
      if (this.questionJamaisPosee(i, nb1, nb2, typeDeQuestion[i])) {
        this.listeQuestions.push(enonce)
        this.listeCorrections.push(correction)
        i++
      }
      cpt++
    }
  }
}
