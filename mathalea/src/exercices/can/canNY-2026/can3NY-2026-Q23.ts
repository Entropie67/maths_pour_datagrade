import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import ExerciceSimple from '../../ExerciceSimple'

import Decimal from 'decimal.js'
export const titre = ''
export const interactifReady = true

export const uuid = 'ncr2v'
export const refs = {
  'fr-fr': [],
  'fr-ch': [''],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class canQ232026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion() {
    const annee = 2026
    const a = this.canOfficielle
      ? 120
      : this.quotaRandint('aDizaines', 7, 29) * 10 +
        this.quotaRandint('aUnites', 1, 9, [annee % 10])
    const exposantannee = this.canOfficielle
      ? 1
      : this.quotaRandint('exposantannee', 1, 2)
    const exposantA = this.canOfficielle
      ? 1
      : this.quotaRandint('exposantA', 1, 2)
    const aDiv = new Decimal(a).div(new Decimal(10).pow(exposantA))
    const NbanneeDiv = new Decimal(annee).div(
      new Decimal(10).pow(exposantannee),
    )

    this.question = `Sachant que $${texNombre(a, 0)} \\times ${texNombre(annee, 0)} = ${texNombre(a * annee, 0)} $, `
    this.question += `quelle est la valeur décimale de $${texNombre(aDiv, 4)} \\times ${texNombre(NbanneeDiv, 4)}$ ?`
    this.reponse = new Decimal(aDiv).mul(NbanneeDiv)
    const reponse = new Decimal(aDiv).mul(NbanneeDiv)
    this.correction = `Comme $${texNombre(aDiv, 4)}=\\dfrac{${texNombre(a, 4)}}{${texNombre(new Decimal(10).pow(exposantA))}}$ 
    et comme $${texNombre(NbanneeDiv, 4)}=\\dfrac{${texNombre(annee, 0)}}{${texNombre(new Decimal(10).pow(exposantannee))}}$, <br><br>
    alors $${texNombre(aDiv, 4)} \\times ${texNombre(NbanneeDiv, 4)}= \\dfrac{${texNombre(a, 4)}}{${texNombre(new Decimal(10).pow(exposantA))}} \\times \\dfrac{${texNombre(annee, 0)}}{${texNombre(new Decimal(10).pow(exposantannee))}} = 
    \\dfrac{${texNombre(a, 0)} \\times ${texNombre(annee, 0)}}{${texNombre(new Decimal(10).pow(exposantA))} \\times ${new Decimal(10).pow(exposantannee)}}= 
    \\dfrac{${texNombre(a * annee, 0)}}{${texNombre(new Decimal(10).pow(exposantA + exposantannee))}}$<br><br>
    et donc $${texNombre(aDiv, 4)} \\times ${texNombre(NbanneeDiv, 4)}=${miseEnEvidence(texNombre(reponse, 5))}$.`

    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
