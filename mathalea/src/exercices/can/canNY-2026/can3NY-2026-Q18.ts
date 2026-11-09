import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import {
  ecritureAlgebrique,
  reduireAxPlusB,
  reduirePolynomeDegre3,
} from '../../../lib/outils/ecritures'
import { abs, signe } from '../../../lib/outils/nombres'
export const titre = 'Développer une expression'
export const interactifReady = true

export const uuid = '1v1ud'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class developper2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
  }

  nouvelleVersion() {
    const annee = 2026
    const choix = this.canOfficielle ? 1 : this.quotaChoice('choix', [1, 2, 3])
    const a = this.canOfficielle ? 1 : this.quotaRandint('a', -2, 2, [0])
    const b = this.canOfficielle ? 2 : this.quotaRandint('b', -5, 5, [0])
    let reponse1 = ''
    this.question = 'Développer '
    if (choix === 1) {
      reponse1 = `${reduireAxPlusB(annee, a * annee)}`
      this.reponse = reponse1
      this.question += `$A=${texNombre(annee, 0)}(x${ecritureAlgebrique(a)})$.`
      this.correction = `On développe $A$ :<br>
      $\\begin{aligned}
      A&=${texNombre(annee, 0)}\\times x ${signe(a)}${texNombre(annee, 0)}\\times ${abs(a)}\\\\
      &=${miseEnEvidence(this.reponse)}
      \\end{aligned}$`
    } else if (choix === 2) {
      reponse1 = `${reduirePolynomeDegre3(0, annee, a * annee, 0)}`
      this.reponse = [reponse1, reponse1.replace('x^2', 'x \\times x ')]
      this.question += `$A=${texNombre(annee, 0)}x(x${ecritureAlgebrique(a)})$.`
      this.correction = `On développe $A$ :<br>
      $\\begin{aligned}
      A&=${texNombre(annee, 0)}x\\times x ${signe(a)}${texNombre(annee, 0)}x\\times ${abs(a)}\\\\
      &=${miseEnEvidence(reponse1)}
      \\end{aligned}$`
    } else {
      reponse1 = `${reduirePolynomeDegre3(0, annee, b, 0)}`
      this.reponse = [reponse1, reponse1.replace('x^2', 'x \\times x ')]
      this.question += `$A=x(${texNombre(annee, 0)}x${ecritureAlgebrique(b)})$.`
      this.correction = `On développe $A$ :<br>
      $\\begin{aligned}
      A&=x\\times${texNombre(annee, 0)}x ${signe(b)}x\\times ${abs(b)}\\\\
       &=${miseEnEvidence(reponse1)}
      \\end{aligned}$`
    }
    if (this.interactif) {
      this.question += '<br>$A=$'
    }
  }
}
