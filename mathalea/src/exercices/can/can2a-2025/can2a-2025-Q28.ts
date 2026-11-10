import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Résoudre une équation'
export const interactifReady = true

export const uuid = '30b10'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class ResoudreUneEquation extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierEnsemble
    this.optionsDeComparaison = { ensembleDeNombres: true }
    this.optionsChampTexte = { texteAvant: '$S=$' }
  }

  nouvelleVersion() {
    const a = this.canOfficielle
      ? 3
      : choice([2, 5, 7, 10, 11]) * choice([-1, 1])
    this.question = `Résoudre, dans $\\mathbb{R}$, : $x^{2}=${a}$.`
    this.correction = ` On reconnaît une équation du type $x^2=k$ avec $k=${a}$.<br>`
    if (a > 0) {
      this.correction += `Puisque $${a}$ est strictement positif, l'équation a deux solutions : `
      this.correction += ` $-\\sqrt{${a}}$ et $\\sqrt{${a}}$.<br>`
      this.correction += `Ainsi, $S=${miseEnEvidence(`\\{-\\sqrt{${a}}\\,;\\,\\sqrt{${a}}\\}`)}$.`
      this.reponse = `\\{-\\sqrt{${a}};\\sqrt{${a}}\\}`
    } else {
      this.reponse = ['\\emptyset', '\\{\\emptyset\\}']
      this.correction += `Puisque $${a}$ est strictement négatif, l'équation n'a pas de solution.<br>
          Ainsi, $S=${miseEnEvidence('\\emptyset')}$.`
    }
    if (this.interactif) {
      this.question +=
        "<br>S'il y a des solutions, les écrire entre accolades séparées par un point-virgule, sinon écrire $\\emptyset$.<br>"
    }
  }
}
