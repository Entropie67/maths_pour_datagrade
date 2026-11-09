import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Faire une somme avec des fractions décimales'
export const interactifReady = true

export const uuid = '19067'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase

    this.canOfficielle = false
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.reponse = '205,037'
      this.question = `Écriture décimale de : <br> $205+\\dfrac{3}{100}+\\dfrac{7}{${texNombre(1000)}}$ `
      this.correction = `$205+\\dfrac{3}{100}+\\dfrac{7}{${texNombre(1000)}}=205+0,3+0,007=${miseEnEvidence('205,037')}$`
    } else {
      const u = this.quotaRandint('u', 21, 99)
      const a = this.quotaRandint('a', 1, 9)
      const c = this.quotaRandint('c', 1, 9)
      const partieDec1 = new Decimal(a).div(100)
      const partieDec2 = new Decimal(c).div(1000)
      const partieDec3 = new Decimal(a).div(10)

      if (this.quotaChoice('cas', [true, false])) {
        if (choice([true, false])) {
          this.question = `Écriture décimale de : <br> $${u}+\\dfrac{${a}}{100}+\\dfrac{${c}}{${texNombre(1000, 0)}}$ `
          this.correction = `$${u}+\\dfrac{${a}}{100}+\\dfrac{${c}}{${texNombre(1000, 0)}}=${u}+${texNombre(a / 100)}+${texNombre(c / 1000, 3)}=${miseEnEvidence(texNombre(u + a / 100 + c / 1000, 3))}$`
        } else {
          this.question = `Écriture décimale de : <br> $${u}+\\dfrac{${c}}{${texNombre(1000)}}+\\dfrac{${a}}{100}$ `
          this.correction = `$${u}+\\dfrac{${c}}{${texNombre(1000, 0)}}+\\dfrac{${a}}{100}=${u}+${texNombre(c / 1000, 3)}+${texNombre(a / 100)}=${miseEnEvidence(texNombre(u + a / 100 + c / 1000, 3))}$`
        }
        this.reponse = new Decimal(u).add(partieDec1).add(partieDec2)
      } else {
        if (choice([true, false])) {
          this.question = `Écriture décimale de : <br> $${u}+\\dfrac{${c}}{${texNombre(1000, 0)}}+\\dfrac{${a}}{10}$ `
          this.correction = `$${u}+\\dfrac{${c}}{${texNombre(1000, 0)}}+\\dfrac{${a}}{10}=${u}+${texNombre(c / 1000, 3)}+${texNombre(a / 10, 1)}=${miseEnEvidence(texNombre(u + a / 10 + c / 1000, 3))}$
           `
        } else {
          this.question = `Écriture décimale de : <br> $${u}+\\dfrac{${a}}{10}+\\dfrac{${c}}{${texNombre(1000, 0)}}$ `
          this.correction = `$${u}+\\dfrac{${a}}{10}+\\dfrac{${c}}{${texNombre(1000, 0)}}=${u}+${texNombre(a / 10, 1)}+${texNombre(c / 1000, 3)}=${miseEnEvidence(texNombre(u + a / 10 + c / 1000, 3))}$
            `
        }
        this.reponse = new Decimal(u).add(partieDec2).add(partieDec3)
      }
    }

    if (this.interactif) {
      this.question += ' $=$'
    }
  }
}
