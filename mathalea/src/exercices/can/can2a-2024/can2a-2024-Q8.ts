/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/viewcan.2024.2e.test.ts ⚠️
 */

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une moyenne'
export const interactifReady = true

export const dateDeModifImportante = '31/10/2026'

export const uuid = '8a4eb'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    if (this.canOfficielle) {
      this.question = `Moyenne de la série : 
      ${sp(2)} $12$ ${sp(2)} ; ${sp(2)} $7$ ${sp(2)} ; ${sp(2)} $8$${sp(2)} ; ${sp(2)} $13$<br>`
      this.correction = `En rassemblant astucieusement, la somme des $4$ nombres est : $\\underbrace{12+8}_{20}+\\underbrace{13+7}_{20} =40$.<br>
            La moyenne est donc $\\dfrac{40}{4}=${miseEnEvidence('10')}$.`
      this.reponse = 10
    } else {
      if (choice([true, false])) {
        const a = randint(2, 6)
        const b = randint(8, 15)
        const d = choice([27, 30, 33, 36, 39, 42])
        const c = d - a - b
        this.question = `Quelle est la moyenne de ces $3$ nombres ?<br>
      $${a}$ ${sp(4)} ; ${sp(4)} $${b}$ ${sp(4)} ; ${sp(4)} $${c}$`
        this.correction = `La somme des $3$ nombres est : $${a}+${b}+${c} =${d}$.<br>
            La moyenne est donc $\\dfrac{${d}}{3}=${miseEnEvidence(texNombre(d / 3, 0))}$.`
        this.reponse = d / 3
      } else {
        const a = randint(2, 5)
        const b = randint(8, 15)
        const d = randint(8, 15)
        const e = choice([32, 36, 40, 44, 48])
        const c = e - a - b - d
        this.question = `Quelle est la moyenne de ces $4$ nombres ?<br>
         $${a}$ ${sp(4)} ; ${sp(4)} $${b}$ ${sp(4)} ; ${sp(4)} $${c}$${sp(4)} ; ${sp(4)} $${d}$`
        this.correction = `La somme des $4$ nombres est : $${a}+${b}+${c} +${d}=${e}$.<br>
               La moyenne est donc $\\dfrac{${e}}{4}=${miseEnEvidence(texNombre(e / 4, 0))}$.`
        this.reponse = e / 4
      }
    }
  }
}
