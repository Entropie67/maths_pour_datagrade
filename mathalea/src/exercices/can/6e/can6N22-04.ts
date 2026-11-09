import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Établir une relation entre unité, dixième, centième et millième'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '03/07/2025'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export const uuid = '59129'

export const refs = {
  'fr-fr': ['can6N22-04', '6N2autoA-2', '6AutoN1-1'],
  'fr-ch': ['NR'],
}
export default class RelationUniteDixiemeCentiemeMillieme extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    let a, b, resultat
    switch (
      this.quotaChoice('typeDeQuestions', [1, 2]) //, 2, 3
    ) {
      case 1:
        a = choice([1, 10, 100, 1000])
        b = choice([10, 100, 1000])
        resultat = texNombre(a / b, 3)
        this.question = `Écrire sous la forme d'un décimal ou d'un entier : $\\dfrac{${texNombre(a, 0)}}{${texNombre(b, 0)}}$.`
        this.correction = `$\\dfrac{${texNombre(a, 0)}}{${texNombre(b, 0)}} = ${miseEnEvidence(resultat)}$`
        this.reponse = resultat
        break

      case 2: //
        a = choice([10, 100, 1000])
        b = choice([10, 100, 1000])
        resultat = texNombre(a / b, 3)
        this.question = `Écrire sous la forme d'un décimal ou d'un entier : $${texNombre(a, 0)}\\times\\dfrac{1}{${texNombre(b, 0)}}$.`
        this.correction = `$\\begin{aligned}
        ${texNombre(a, 0)}\\times\\dfrac{1}{${texNombre(b, 0)}} &=   \\dfrac{${texNombre(a, 0)}}{${texNombre(b, 0)}}\\\\
          ${texNombre(a, 0)}\\times\\dfrac{1}{${texNombre(b, 0)}}&=${miseEnEvidence(resultat)}
        \\end{aligned}$`
        this.reponse = resultat
        break
    }
  }
}
