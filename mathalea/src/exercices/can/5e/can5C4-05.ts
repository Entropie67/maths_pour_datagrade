import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import Decimal from 'decimal.js'
import { choice } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
export const titre = "Calculer la fraction d'un décimal"
export const interactifReady = true

export const dateDePublication = '30/04/2024'
export const uuid = '669aa'
export const refs = {
  'fr-fr': ['can5C4-05', '5N3autoI-1'],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class fractionsDecimaux extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    switch (this.quotaChoice('typeDeQuestions', [1, 2, 3])) {
      case 1: // quart
        {
          const b = new Decimal(randint(1, 16, [5, 10])).div(10)
          const a = b.mul(4)
          this.reponse = texNombre(b, 2)
          if (choice([true, false])) {
            this.question = `Calculer le quart de $${texNombre(a, 2)}$.<br>`
            this.correction = `Le quart de $${texNombre(a, 2)}$ est $\\dfrac{1}{4}\\times ${texNombre(a, 2)}=${miseEnEvidence(this.reponse)}$. `
          } else {
            this.question = `Calculer $\\dfrac{1}{4}\\times ${texNombre(a, 2)}$.<br>`
            this.correction = `$\\dfrac{1}{4}\\times${texNombre(a, 2)}=\\dfrac{${texNombre(a, 2)}}{4} =${miseEnEvidence(this.reponse)}$. `
          }
        }
        break
      case 2: // tiers
        {
          const b = new Decimal(randint(1, 14)).div(10)
          const a = b.mul(3)
          this.reponse = texNombre(b, 2)
          if (choice([true, false])) {
            this.question = `Calculer le tiers de $${texNombre(a, 2)}$.<br>`
            this.correction = `Le tiers de $${texNombre(a, 2)}$ est $\\dfrac{1}{3}\\times ${texNombre(a, 2)}=${miseEnEvidence(this.reponse)}$. `
          } else {
            this.question = `Calculer $\\dfrac{1}{3}\\times${texNombre(a, 2)}$.<br>`
            this.correction = `$\\dfrac{1}{3}\\times${texNombre(a, 2)}=\\dfrac{${texNombre(a, 2)}}{3} =${miseEnEvidence(this.reponse)}$. `
          }
        }
        break

      case 3: // cinquième
        {
          const b = new Decimal(2 * randint(1, 14) - 1).div(10)
          const a = b.mul(5)
          this.reponse = texNombre(b, 2)
          if (choice([true, false])) {
            this.question = `Calculer le cinquième de $${texNombre(a, 2)}$.<br>`
            this.correction = `Le cinquième de $${texNombre(a, 2)}$ est $\\dfrac{1}{5}\\times ${texNombre(a, 2)}=${miseEnEvidence(this.reponse)}$. `
          } else {
            this.question = `Calculer $\\dfrac{1}{5}\\times${texNombre(a, 2)}$.<br>`
            this.correction = `$\\dfrac{1}{5}\\times${texNombre(a, 2)}=\\dfrac{${texNombre(a, 2)}}{5} =${miseEnEvidence(this.reponse)}$. `
          }
        }
        break
    }
  }
}
