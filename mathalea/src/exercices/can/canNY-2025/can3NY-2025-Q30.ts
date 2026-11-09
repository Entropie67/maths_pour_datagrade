import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import Decimal from 'decimal.js'
import { texNombre } from '../../../lib/outils/texNombre'
export const titre = ''
export const interactifReady = true

export const uuid = '91304'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class ComparerFractions extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.optionsChampTexte = { texteApres: ' bouteilles' }
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const oliveK = this.quotaChoice('oliveK', [100, 200])
    const nbreBouteilles = this.quotaChoice('nbreBouteilles', [20, 25, 10])
    const oliveParBouteille = new Decimal(oliveK).div(nbreBouteilles)
    this.reponse = new Decimal(2025).div(oliveParBouteille).floor()
    const reponse = texNombre(new Decimal(2025).div(oliveParBouteille).floor())
    this.question = `Pour remplir $${nbreBouteilles}$ bouteilles d'huile d'olive, Stéphane utilise $${oliveK}$ kg d'olives.<br>
      Combien va-t-il remplir de bouteilles pleines avec ses $${texNombre(2025, 0)}$ kg d'olives cueillies ?`
    this.correction = `Pour remplir $${nbreBouteilles}$ bouteilles d'huile d'olive, Stéphane utilise $${oliveK}$ kg d'olives.<br> Cela signifie que pour remplir $1$ bouteille d'huile, il utilise $${oliveParBouteille}$ kg d'olives car $${oliveK} \\div  ${nbreBouteilles} = ${oliveParBouteille}$.<br>`
    if (new Decimal(2025).modulo(oliveParBouteille).equals(0)) {
      this.correction += `On a  : <br>
      $\\begin{aligned}
      ${texNombre(2025, 0)}&=${texNombre(2000)}+${texNombre(25)}\\\\
      &=${texNombre(new Decimal(2000).div(oliveParBouteille))}\\times ${oliveParBouteille}+${texNombre(new Decimal(25).div(oliveParBouteille).floor())}\\times ${oliveParBouteille}\\\\
      &=${reponse}\\times ${oliveParBouteille}
      \\end{aligned}$<br>
      Il peut remplir $${miseEnEvidence(reponse)}$ bouteilles d'huile d'olive.`
    } else {
      this.correction += `On a :<br> 
      $\\begin{aligned}
      ${texNombre(2025)}&=${texNombre(2000)}+${texNombre(25)}\\\\
      &=${texNombre(new Decimal(2000).div(oliveParBouteille))}\\times ${oliveParBouteille}+${texNombre(new Decimal(25).div(oliveParBouteille).floor())}\\times ${oliveParBouteille}+${texNombre(new Decimal(25).modulo(oliveParBouteille))}\\\\
      &=${reponse}\\times ${oliveParBouteille}+${texNombre(new Decimal(2025).modulo(oliveParBouteille))}
      \\end{aligned}$<br>
      Il peut remplir $${miseEnEvidence(reponse)}$ bouteilles d'huile d'olive.`
    }
    if (this.interactif) {
      this.question += '<br>'
    }

    this.canReponseACompleter = '$\\ldots$ bouteilles'
  }
}
