import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
export const titre = 'Résoudre une inéquation'
export const interactifReady = true

export const uuid = 'k2mzc'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora+Éric Elter

*/
export default class inequationAResoudre extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierEnsemble
    this.optionsDeComparaison = { intervalle: true }
  }

  nouvelleVersion() {
    const annee = 2026
    let solution1
    const a = this.canOfficielle
      ? -annee
      : this.quotaChoice('a', [-annee, annee])
    const b = this.canOfficielle
      ? annee
      : this.quotaChoice('b', [-annee, annee])
    const inégalité = this.canOfficielle
      ? '\\geqslant'
      : this.quotaChoice('inegalite', ['>', '\\geqslant', '<', '\\leqslant'])
    this.question = `Donner l'ensemble $S$ des solutions dans $\\mathbb R$ de l'inéquation
          $${texNombre(a, 0)}(x${ecritureAlgebrique(-b)})^2 ${inégalité} 0$.`

    if (a > 0) {
      this.correction = `Pour tout réel $x$, $${texNombre(a, 0)}(x${ecritureAlgebrique(-b)})^2$ est positif et s'annule en $${texNombre(b)}$.<br>
            Ainsi, l'ensemble $S$ des solutions de l'inéquation est `
    } else {
      this.correction = `Pour tout réel $x$, $${texNombre(a, 0)}(x${ecritureAlgebrique(-b)})^2$ est négatif et s'annule en $${texNombre(b)}$.<br>
            Ainsi, l'ensemble $S$ des solutions de l'inéquation est `
    }
    if ((inégalité === '>' && a > 0) || (inégalité === '<' && a < 0)) {
      solution1 = [
        `\\mathbb{R}\\backslash\\{${b}\\}`,
        `]-\\infty;${b}[\\cup]${b};+\\infty[`,
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
      this.question += '<br>$S=$'
    }
  }
}
