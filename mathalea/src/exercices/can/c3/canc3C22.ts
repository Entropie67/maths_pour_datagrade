import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Multiplier par $10$, $100$, $1\\,000$'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '03/07/2025'

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export const uuid = '4ce49'

export const refs = {
  'fr-fr': ['canc3C22', '5N1autoE-flash2'],
  'fr-ch': [],
}
export default class MultiplierPar10Par100Par1000 extends ExerciceSimple {
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
        a = choice([randint(11, 99), randint(100, 999)])
        b = choice([10, 100, 1000])
        resultat = a * b
        this.question = `Calculer $${texNombre(a, 0)}\\times ${texNombre(b, 0)}$.`
        if (b === 10) {
          this.correction = `Le chiffre des unités dans $${texNombre(a, 4)}$ devient le chiffre des dizaines.<br>`
        } else {
          if (b === 100) {
            this.correction = `Le chiffre des unités dans $${texNombre(a, 4)}$ devient le chiffre des centaines.<br>`
          } else {
            this.correction = `Le chiffre des unités dans $${texNombre(a, 4)}$ devient le chiffre des milliers.<br>`
          }
        }
        this.correction += `$${texNombre(a, 4)}\\times ${texNombre(b, 0)} = ${miseEnEvidence(texNombre(resultat, 3))}$`
        this.reponse = resultat
        break

      case 2: // décimal
        a = choice([randint(11, 99), randint(100, 999)])
        a /= choice([10, 100, 1000, 10000])
        b = choice([10, 100, 1000])
        resultat = texNombre(a * b, 4)
        this.question = `Calculer $${texNombre(a, 4)}\\times ${texNombre(b, 0)}$.`
        if (b === 10) {
          this.correction = `Le chiffre des dixièmes dans $${texNombre(a, 4)}$ devient le chiffre des unités.<br>`
        } else {
          if (b === 100) {
            this.correction = `Le chiffre des centièmes dans $${texNombre(a, 4)}$ devient le chiffre des unités.<br>`
          } else {
            this.correction = `Le chiffre des millième dans $${texNombre(a, 4)}$ devient le chiffre des unités. <br>`
          }
        }
        this.correction += `$${texNombre(a, 4)}\\times ${texNombre(b, 0)} = ${miseEnEvidence(resultat)}$`
        this.reponse = resultat
        break
    }
  }
}
