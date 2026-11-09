import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Multiplier par $0{,}1$, $0{,}01$ ou $0{,}001$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '21/10/2021'
export const dateDeModifImportante = '03/07/2025'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora & Jean-claude Lhote
 */
export const uuid = '31096'

export const refs = {
  'fr-fr': ['can6C3-05', '6N2B-flash1'],
  'fr-ch': ['NR'],
}
export default class Multiplier extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsChampTexte = { texteAvant: '<br>' }
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    let a, b, resultat
    switch (
      this.quotaChoice('typeDeQuestions', [1, 2]) //, 2, 3
    ) {
      case 1: // entier
        a = this.quotaRandint('a', 2, 1000)
        b = this.quotaChoice('b', [0.1, 0.01, 0.001])
        resultat = texNombre(a * b, 3)
        this.question = `Calculer $${texNombre(a, 0)}\\times${texNombre(b, 3)}$.`
        this.correction = `$${texNombre(a)}\\times ${texNombre(b, 3)} = ${miseEnEvidence(resultat)}$`
        if (b === 0.1) {
          this.correction = `Multiplier par $${texNombre(b, 4)}$ revient à prendre le dixième.<br>
         Ainsi, le chiffre des unités devient le chiffre des dixièmes.<br>`
        } else {
          if (b === 0.01) {
            this.correction = `Multiplier par $${texNombre(b, 4)}$ revient à prendre le centième.<br>
         Ainsi, le chiffre des unités devient le chiffre des centièmes.<br>`
          } else {
            this.correction = `Multiplier par $${texNombre(b, 4)}$ revient à prendre le millième.<br>
         Ainsi, le chiffre des unités devient le chiffre des millièmes.<br>`
          }
        }
        this.correction += `$${texNombre(a)}\\times ${texNombre(b, 3)} = ${miseEnEvidence(resultat)}$`
        this.reponse = resultat
        break
      case 2: // nombre décimal
        a =
          this.quotaRandint('aDecimal', 2, 999) /
          this.quotaChoice('diviseur', [10, 100])
        b = this.quotaChoice('b', [0.1, 0.01, 0.001])
        resultat = texNombre(a * b, 7)
        this.question = `Calculer $${texNombre(a, 4)}\\times${texNombre(b, 3)}$.`
        this.correction = `$${texNombre(a, 4)}\\times ${texNombre(b, 3)} = ${miseEnEvidence(resultat)}$`
        if (b === 0.1) {
          this.correction = `Multiplier par $${texNombre(b, 4)}$ revient à prendre le dixième.<br>
         Ainsi, le chiffre des unités devient le chiffre des dixièmes.<br>`
        } else {
          if (b === 0.01) {
            this.correction = `Multiplier par $${texNombre(b, 4)}$ revient à prendre le centième.<br>
         Ainsi, le chiffre des unités devient le chiffre des centièmes.<br>`
          } else {
            this.correction = `Multiplier par $${texNombre(b, 4)}$ revient à prendre le millième.<br>
         Ainsi, le chiffre des unités devient le chiffre des millièmes.<br>`
          }
        }
        this.correction += `$${texNombre(a, 4)}\\times ${texNombre(b, 3)} = ${miseEnEvidence(resultat)}$`
        this.reponse = resultat
        break
    }
  }
}
