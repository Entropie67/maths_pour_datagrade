import { amcConvert } from '../../../lib/amc/amcBuilders'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Trouver la bonne unité'
export const dateDePublication = '5/11/2021'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCOpen'

/**
 * @author Jean-claude Lhote
 */
export const uuid = 'd0314'

export const refs = {
  'fr-fr': ['canc3M01'],
  'fr-ch': [],
}
export default class TrouverLaBonneUnite extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.typeExercice = 'simple'
    this.optionsDeComparaison = { texteSansCasse: true }
    this.formatChampTexte = KeyboardType.alphanumeric
  }

  nouvelleVersion() {
    const prefixes = [
      [10, 'd'],
      [100, 'c'],
      [1000, 'm'],
      [10, 'da'],
      [100, 'h'],
      [1000, 'k'],
    ]
    const unite = this.quotaChoice('unite', ['g', 'm', 'L'])
    const typeDeQuestion = this.quotaRandint('typeDeQuestion', 0, 1)
    const a = this.quotaRandint('a', 1, 9)
    switch (typeDeQuestion) {
      case 0:
        {
          const indicePrefixe = randint(0, 2)
          this.question = `Compléter avec l'unité qui convient : <br>$${a}\\text{ ${unite} }= ${texNombre(a * Number(prefixes[indicePrefixe][0]))}$ ${this.interactif ? '' : '$\\ldots$'}`
          this.reponse = `${prefixes[indicePrefixe][1]}${unite}`
          this.correction = `$${a}\\text{ ${unite} }= ${texNombre(a * Number(prefixes[indicePrefixe][0]))}$ ${texteEnCouleurEtGras(this.reponse)}`
          this.canReponseACompleter = `$${a}\\text{ ${unite} }= ${texNombre(a * Number(prefixes[indicePrefixe][0]))}$ $\\ldots$`
        }
        break
      case 1:
        {
          const indicePrefixe = randint(3, 5)
          this.question = `Compléter avec l'unité qui convient : <br>$${a}\\text{ ${unite} }= ${texNombre(a / Number(prefixes[indicePrefixe][0]))}$ ${this.interactif ? '' : '$\\ldots$'}`
          this.reponse = `${prefixes[indicePrefixe][1]}${unite}`
          this.correction = `$${a}\\text{ ${unite} }= ${texNombre(a / Number(prefixes[indicePrefixe][0]))}$ ${texteEnCouleurEtGras(this.reponse)}`
          this.canReponseACompleter = `$${a}\\text{ ${unite} }= ${texNombre(a / Number(prefixes[indicePrefixe][0]))}$ $\\ldots$`
        }
        break
    }
    this.canEnonce = "Compléter avec l'unité qui convient. "

    if (context.isAmc) {
      this.autoCorrectionAMC = [
        {
          enonce: this.question,
          propositions: [
            {
              texte: this.correction,
              statut: 0,
              feedback: '',
            },
          ],
        },
      ]
      this.questionsAMC = this.autoCorrectionAMC.map((questionAMC) =>
        amcConvert(questionAMC),
      )
    }
  }
}
