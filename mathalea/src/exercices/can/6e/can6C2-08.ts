import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { bleuMathalea } from '../../../lib/colors'
export const titre = 'Additionner astucieusement'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '25/10/2023'
/**
 * @author Florence Decool
 */
export const uuid = '792c3'

export const refs = {
  'fr-fr': ['can6C2-08'],
  'fr-ch': [],
}
export default class AdditionnerAstucieusement extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const A = this.quotaRandint('A', 2, 4) * 100
    const B = this.quotaRandint('B', 1, 2) * 100
    const a = this.quotaRandint('a', 1, 5) * 5
    const c = A - a
    const b = randint(1, B)
    const d = B - b
    const e = this.quotaRandint('e', 1, 40)
    const correction = texteEnCouleur(
      'Mentalement : <br>On regroupe astucieusement les termes pour les additionner plus simplement. <br><br><br>',
      bleuMathalea,
    )
    switch (this.quotaChoice('typeDeQuestions', [1, 2, 3, 4])) {
      case 1:
        this.reponse = A + e
        this.question = `Calculer $${texNombre(a, 0)} + ${texNombre(e, 0)} + ${texNombre(c, 0)}$.`
        this.correction = `${correction}`
        this.correction += `$\\begin{aligned}     
        ${a} + ${e}+ ${c}  
        &= \\underbrace{${a}+${c}}_{${a + c}} + ${e} \\\\ 
        &= ${A}+ ${e}\\\\
        &=${miseEnEvidence(this.reponse)}
        \\end{aligned}$`
        break

      case 2:
        this.reponse = B + e
        this.question = `Calculer  $${texNombre(b, 0)} + ${texNombre(e, 0)} + ${texNombre(d, 0)}$.`
        this.correction = `${correction}`
        this.correction += `$\\begin{aligned}     
        ${b} + ${e} + ${d}  
        &= \\underbrace{${b}+${d}}_{${b + d}}+ ${e} \\\\ 
        &= ${B}+ ${e}\\\\
        &=${miseEnEvidence(this.reponse)}
        \\end{aligned}$`
        break

      case 3:
        this.reponse = A + B + e
        this.question = `Calculer $${texNombre(a, 0)} + ${texNombre(b, 0)} + ${texNombre(c, 0)} + ${texNombre(d, 0)} + ${texNombre(e, 0)}$.`
        this.correction = `${correction}`
        this.correction += `$\\begin{aligned}     
        ${a} + ${b} + ${c} + ${d} + ${e} 
        &= \\underbrace{${a}+${c}}_{${a + c}} + \\underbrace{${b}+${d}}_{${b + d}}+ ${e} \\\\ 
        &= ${A} + ${B}+ ${e}\\\\
        &=${miseEnEvidence(this.reponse)}
        \\end{aligned}$`
        break

      case 4:
        this.reponse = A + B + e
        this.question = `Calculer $${texNombre(c, 0)} + ${texNombre(b, 0)} + ${texNombre(e, 0)} + ${texNombre(d, 0)} + ${texNombre(a, 0)}$.`
        this.correction = `${correction}`
        this.correction += `$\\begin{aligned}     
        ${c} + ${b} + ${e} + ${d} + ${a} 
        &= \\underbrace{${c}+${a}}_{${a + a}} + \\underbrace{${b}+${d}}_{${b + d}}+ ${e} \\\\ 
        &= ${A} + ${B}+ ${e}\\\\
        &=${miseEnEvidence(this.reponse)}
        \\end{aligned}$`
        break
    }
  }
}
