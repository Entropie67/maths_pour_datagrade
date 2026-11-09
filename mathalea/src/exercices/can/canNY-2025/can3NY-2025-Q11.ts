import Decimal from 'decimal.js'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Écrire sous forme décimale'
export const interactifReady = true

export const uuid = '2d330'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class ecrireDecimale extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const a = 2025
    const b = this.quotaRandint('b', 11, 59, [20, 30, 40, 50])
    const c = new Decimal(a).div(10)
    const d = new Decimal(b).div(100)
    const e = new Decimal(a).div(100)
    const f = new Decimal(b).div(10)
    if (this.quotaChoice('choix', [true, false])) {
      this.reponse = texNombre(new Decimal(c).add(d), 3)
      this.question = `Écrire sous forme décimale $\\dfrac{${texNombre(a)}}{10}+\\dfrac{${b}}{100}$. `
      this.correction = `$\\dfrac{${texNombre(a)}}{10}+\\dfrac{${b}}{100}=${texNombre(a / 10, 1)}+${texNombre(b / 100, 2)}=${miseEnEvidence(this.reponse)}$<br>`
    } else {
      this.reponse = texNombre(new Decimal(e).add(f), 3)
      this.question = `Écrire sous forme décimale $\\dfrac{${b}}{10}+\\dfrac{${texNombre(a)}}{100}$. `
      this.correction = `$\\dfrac{${b}}{10}+\\dfrac{${texNombre(a)}}{100}=${texNombre(b / 10, 1)}+${texNombre(a / 100, 2)}=${miseEnEvidence(this.reponse)}$<br>`
    }
    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
