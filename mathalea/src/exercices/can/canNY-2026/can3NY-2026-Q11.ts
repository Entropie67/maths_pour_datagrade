import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Écrire sous forme décimale'
export const interactifReady = true

export const uuid = 'zu555'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class ecrireDecimale2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const a = 2026
    const choix = this.canOfficielle
      ? true
      : this.quotaChoice('choix', [true, false])

    if (choix) {
      this.reponse = texNombre(new Decimal(200).add((a % 100) / 100), 3)
      this.question = `Écrire sous forme décimale $\\dfrac{${texNombre(2000)}}{10}+\\dfrac{${a % 100}}{100}$. `
      this.correction = `$\\dfrac{${texNombre(2000)}}{10}+\\dfrac{${a % 100}}{100}=${texNombre(200, 1)}+${texNombre((a % 100) / 100, 2)}=${miseEnEvidence(this.reponse)}$<br>`
    } else {
      this.reponse = texNombre(new Decimal((a % 10) / 100).add(2020 / 10), 3)
      this.question = `Écrire sous forme décimale $\\dfrac{${a % 10}}{100}+\\dfrac{${texNombre(2020)}}{10}$. `
      this.correction = `$\\dfrac{${a % 10}}{100}+\\dfrac{${texNombre(2020)}}{10}=${texNombre((a % 10) / 100, 2)}+${texNombre(2020 / 10, 2)}=${miseEnEvidence(this.reponse)}$<br>`
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
