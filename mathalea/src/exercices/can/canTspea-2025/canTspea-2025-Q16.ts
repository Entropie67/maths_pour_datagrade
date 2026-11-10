import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Résoudre une équation trigonométrique'
export const interactifReady = true

export const uuid = 'df264'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025TQ16 extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.grecTrigo

    this.optionsChampTexte = { texteAvant: '<br>$S=\\{$', texteApres: '$\\}$' }
    this.canOfficielle = true
  }

  nouvelleVersion() {
    const a = this.canOfficielle
      ? '-\\dfrac{\\sqrt{3}}{2}'
      : choice([
          '\\dfrac{1}{2}',
          '-\\dfrac{1}{2}',
          '\\dfrac{\\sqrt{2}}{2}',
          '-\\dfrac{\\sqrt{2}}{2}',
          '\\dfrac{\\sqrt{3}}{2}',
        ])

    this.question = `Solution(s) de l'équation $\\cos(x)=${a}$ sur $[-\\pi\\,;\\,\\pi[$`
    if (a === '-\\dfrac{\\sqrt{3}}{2}') {
      this.reponse = [
        '-\\dfrac{5\\pi}{6};\\dfrac{5\\pi}{6}',
        '\\dfrac{5\\pi}{6};-\\dfrac{5\\pi}{6}',
      ]
      this.correction = ` $S={\\${miseEnEvidence('-\\dfrac{5\\pi}{6};\\dfrac{5\\pi}{6}')}\\}$`
    } else if (a === '\\dfrac{\\sqrt{3}}{2}') {
      this.reponse = [
        '-\\dfrac{\\pi}{6};\\dfrac{\\pi}{6}',
        '\\dfrac{\\pi}{6};-\\dfrac{\\pi}{6}',
      ]
      this.correction = ` $S=\\{${miseEnEvidence('-\\dfrac{\\pi}{6};\\dfrac{\\pi}{6}')}\\}$`
    } else if (a === '\\dfrac{1}{2}') {
      this.reponse = [
        '-\\dfrac{\\pi}{3};\\dfrac{\\pi}{3}',
        '\\dfrac{\\pi}{3};-\\dfrac{\\pi}{3}',
      ]
      this.correction = ` $S={\\${miseEnEvidence('-\\dfrac{\\pi}{3};\\dfrac{\\pi}{3}')}\\}$`
    } else if (a === '-\\dfrac{1}{2}') {
      this.reponse = [
        '-\\dfrac{2\\pi}{3};\\dfrac{2\\pi}{3}',
        '\\dfrac{2\\pi}{3};-\\dfrac{2\\pi}{3}',
      ]
      this.correction = ` $S=\\{${miseEnEvidence('-\\dfrac{2\\pi}{3};\\dfrac{2\\pi}{3}')}\\}$`
    } else if (a === '\\dfrac{\\sqrt{2}}{2}') {
      this.reponse = [
        '-\\dfrac{\\pi}{4};\\dfrac{\\pi}{4}',
        '\\dfrac{\\pi}{4};-\\dfrac{\\pi}{4}',
      ]
      this.correction = ` $S=\\{${miseEnEvidence('-\\dfrac{\\pi}{4};\\dfrac{\\pi}{4}')}\\}$`
    } else {
      this.reponse = [
        '-\\dfrac{3\\pi}{4};\\dfrac{3\\pi}{4}',
        '\\dfrac{3\\pi}{4};-\\dfrac{3\\pi}{4}',
      ]
      this.correction = ` $S=\\{${miseEnEvidence('-\\dfrac{3\\pi}{4};\\dfrac{3\\pi}{4}')}\\}$`
    }

    this.canReponseACompleter = '$S=\\{\\ldots\\ldots \\}$'
  }
}
