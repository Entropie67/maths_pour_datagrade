import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Résoudre une inéquation du second degré'
export const interactifReady = true

export const uuid = '6d3cf'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025N5Q25 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierEnsemble
    this.canOfficielle = true
    this.optionsDeComparaison = { intervalle: true }
  }

  nouvelleVersion() {
    let solution1
    const a = this.canOfficielle ? -2025 : choice([-2025, 2025])
    const b = this.canOfficielle ? 2025 : choice([-2025, 2025])
    const inégalité = this.canOfficielle
      ? '>'
      : choice(['>', '\\geqslant', '<', '\\leqslant'])
    this.question = `$S$ est l'ensemble des solutions de l'inéquation
             $${texNombre(a, 0)}(x${ecritureAlgebrique(-b)})^2 ${inégalité} 0$.<br>`

    if (a > 0) {
      this.correction = `Pour tout réel $x$, $${texNombre(a, 0)}(x${ecritureAlgebrique(-b)})^2$ est positif et s'annule en $${texNombre(b)}$.<br>
               Ainsi, l'ensemble $S$ des solutions de l'inéquation est `
    } else {
      this.correction = `Pour tout réel $x$, $${texNombre(a, 0)}(x${ecritureAlgebrique(-b)})^2$ est négatif et s'annule en $${texNombre(b)}$.<br>
               Ainsi, l'ensemble $S$ des solutions de l'inéquation est `
    }
    if ((inégalité === '>' && a > 0) || (inégalité === '<' && a < 0)) {
      solution1 = [
        `\\mathbb{R}\\\\{${b}\\}`,
        `]-\\infty;${a}[ \\cup ]${a};+\\infty[`,
      ]
      this.correction += ` $${miseEnEvidence(`\\mathbb{R}\\smallsetminus\\{${b}\\}`)}$.`
    } else if (
      (inégalité === '\\geqslant' && a > 0) ||
      (inégalité === '\\leqslant' && a < 0)
    ) {
      solution1 = ['\\mathbb{R}', ']-\\infty;+\\infty[']
      this.correction += ` $${miseEnEvidence('\\mathbb{R}')}$.`
    } else if ((inégalité === '<' && a > 0) || (inégalité === '>' && a < 0)) {
      solution1 = '\\emptyset'
      this.correction += ` $${miseEnEvidence('\\emptyset')}$.`
    } else if (
      (inégalité === '\\leqslant' && a > 0) ||
      (inégalité === '\\geqslant' && a < 0)
    ) {
      solution1 = `\\left\\lbrace${b}\\right\\rbrace`
      this.correction += ` $${miseEnEvidence(`\\{${texNombre(b)}\\}`)}$.`
    }
    this.reponse = solution1
    if (this.interactif) {
      this.question += '$S=$'
    } else {
      this.question += '$S=\\ldots$'
    }
    this.canEnonce = `$S$ est l'ensemble des solutions de l'inéquation
             $${texNombre(a, 0)}(x${ecritureAlgebrique(-b)})^2 ${inégalité} 0$.`
    this.canReponseACompleter = '$S=\\ldots$'
  }
}
