import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import ExerciceSimple from '../../ExerciceSimple'

import Decimal from 'decimal.js'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
export const titre = "Résoudre un problème d'économie"
export const interactifReady = true

export const dateDePublication = '06/04/2024'
export const uuid = 'b40d5'
export const refs = {
  'fr-fr': ['can6C6-10', '6N2G-flash1'],
  'fr-ch': ['PR-33'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class problemeEconomie extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.optionsChampTexte = { texteApres: '€' }
    this.canOfficielle = true
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const nbreL = this.quotaRandint('nbreL', 2, 5) * 10
    const eco = new Decimal(this.quotaRandint('eco', 2, 9))
    const ecoEuro = eco.div(100)
    this.reponse = eco.mul(nbreL).div(100).toFixed(2)
    this.question = `Dans la station A, le prix du litre d'essence est $${eco}$ centimes moins cher que dans la station B.<br>
    Quelle économie réalise-t-on en se servant dans la station A si on prend $${nbreL}$ litres ?`

    this.canReponseACompleter = '$\\ldots$ €'
    this.correction = `On calcule l'économie par le produit du nombre de litres achetés par l'économie par litre réalisée. <br>
     Comme $${eco}$ centimes est égal à $${texNombre(ecoEuro, 2)}$ €, on obtient :<br> $${texNombre(ecoEuro, 2)}\\times ${nbreL}=${miseEnEvidence(texNombre(eco.mul(nbreL).div(100), 2))}$ €.
    `
  }
}
