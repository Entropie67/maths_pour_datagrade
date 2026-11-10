import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import Decimal from 'decimal.js'
import { abs } from '../../../lib/outils/nombres'
export const titre = 'Écrire un décimal sous une forme particulière'
export const interactifReady = true

export const uuid = 'p2htj'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora+Éric Elter
 */
export default class decimalPuisance extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.optionsDeComparaison = {
      fractionIdentique: true,
    }
  }

  nouvelleVersion() {
    const annee = 2026
    const puissance = this.canOfficielle
      ? 2
      : this.quotaRandint('puissance', 1, 5)
    const puissance10 = 10 ** puissance
    const a = this.quotaChoice('a', [annee, -annee])
    const dec = new Decimal(a).div(puissance10)
    this.reponse = [
      (a < 0 ? '-' : '') + `\\dfrac{${abs(a)}}{10^{${puissance}}}`,
      `\\dfrac{${a}}{10^{${puissance}}}`,
      `\\dfrac{${a}}{${10 ** puissance}}`,
    ] // Sans cela, le cas où la fraction est négative ne passe pas.

    this.question = `Écrire $${texNombre(dec, 5)}$ sous la forme $\\dfrac{a}{10^n}$ avec $a\\in \\mathbb{Z}$ et $n\\in \\mathbb{N}$, $n$ le plus petit possible.`
    this.correction = `$${texNombre(dec, 5)}=${miseEnEvidence(`\\dfrac{${texNombre(a, 0)}}{10^{${puissance}}}`)}$`
    if (this.interactif) {
      this.question += `<br>$${texNombre(dec, 5)}=$`
    }

    this.canReponseACompleter = `$${texNombre(dec, 5)}=\\ldots$`
  }
}
