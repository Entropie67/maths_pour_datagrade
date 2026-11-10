import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
export const titre = ''
export const interactifReady = true

export const uuid = 'ree46'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class CalculDizCent2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    const a = 2
    const b = 0
    const c = 2
    const d = annee % 10
    const m = this.canOfficielle
      ? 'dizaines'
      : this.quotaChoice('m', ['centaines', 'dizaines'])
    const n = a * 1000 + b * 100 + c * 10 + d
    this.question = `Quel est le nombre entier de ${m} dans $${texNombre(n)}$ ? `
    if (m === 'centaines') {
      this.correction = `Comme $${texNombre(a * 1000 + b * 100 + c * 10 + d)}=${miseEnEvidence(texNombre(a * 10 + b))}\\times 100+${c * 10 + d}$, il y a $${miseEnEvidence(texNombre(a * 10 + b, 0))}$ ${m} dans $${texNombre(a * 1000 + b * 100 + c * 10 + d)}$.`
      this.reponse = a * 10 + b
    } else {
      this.correction = `Comme $${texNombre(a * 1000 + b * 100 + c * 10 + d)}=${miseEnEvidence(texNombre(a * 100 + b * 10 + c))}\\times 10+${d}$, il y a $${miseEnEvidence(texNombre(a * 100 + b * 10 + c, 0))}$ ${m} dans $${texNombre(a * 1000 + b * 100 + c * 10 + d)}$.`
      this.reponse = a * 100 + b * 10 + c
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
