import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import Decimal from 'decimal.js'
import { texNombre } from '../../../lib/outils/texNombre'
export const titre = ''
export const interactifReady = true

export const uuid = '9t36i'
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
    const annee = 2026
    const oliveK = this.canOfficielle
      ? 100
      : this.quotaChoice('oliveK', [100, 200])
    const nbreBouteilles = this.canOfficielle
      ? 20
      : this.quotaChoice('nbreBouteilles', [20, 25, 10])
    const oliveParBouteille = new Decimal(oliveK).div(nbreBouteilles)
    this.reponse = new Decimal(annee).div(oliveParBouteille).floor()
    const reponse = texNombre(new Decimal(annee).div(oliveParBouteille).floor())
    this.question = `Pour remplir $${nbreBouteilles}$ bouteilles d'huile d'olive, Stéphane utilise $${oliveK}$ kg d'olives.<br>
      Combien va-t-il remplir de bouteilles pleines avec ses $${texNombre(annee, 0)}$ kg d'olives cueillies ?`
    this.correction = `Pour remplir $${nbreBouteilles}$ bouteilles d'huile d'olive, Stéphane utilise $${oliveK}$ kg d'olives.<br> Cela signifie que pour remplir $1$ bouteille d'huile, il utilise $${oliveParBouteille}$ kg d'olives car $${oliveK} \\div  ${nbreBouteilles} = ${oliveParBouteille}$.<br>`
    if (new Decimal(annee).modulo(oliveParBouteille).equals(0)) {
      this.correction += `On a  : <br>
      $\\begin{aligned}
      ${texNombre(annee, 0)}&=${texNombre(2000)}+${texNombre(annee % 100)}\\\\
      &=${texNombre(new Decimal(2000).div(oliveParBouteille))}\\times ${oliveParBouteille}+${texNombre(new Decimal(annee % 100).div(oliveParBouteille).floor())}\\times ${oliveParBouteille}\\\\
      &=${reponse}\\times ${oliveParBouteille}
      \\end{aligned}$<br>
      Il peut remplir $${miseEnEvidence(reponse)}$ bouteilles d'huile d'olive.`
    } else {
      this.correction += `On a :<br> 
      $\\begin{aligned}
      ${texNombre(annee)}&=${texNombre(2000)}+${texNombre(annee % 100)}\\\\
      &=${texNombre(new Decimal(2000).div(oliveParBouteille))}\\times ${oliveParBouteille}+${texNombre(new Decimal(annee % 100).div(oliveParBouteille).floor())}\\times ${oliveParBouteille}+${texNombre(new Decimal(annee % 100).modulo(oliveParBouteille))}\\\\
      &=${reponse}\\times ${oliveParBouteille}+${texNombre(new Decimal(annee).modulo(oliveParBouteille))}
      \\end{aligned}$<br>
      Il peut remplir $${miseEnEvidence(reponse)}$ bouteilles d'huile d'olive.`
    }
    if (this.interactif) {
      this.question += '<br>'
    }

    this.canReponseACompleter = '$\\ldots$ bouteilles'
  }
}
