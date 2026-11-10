import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
export const titre = 'Trouver un inverse ou un opposé'
export const interactifReady = true

export const uuid = '2guhi'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter - Gilles Mora
 */
export default class valeurDecimale2026 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple' // Cette ligne est très importante pour faire un exercice simple !
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    const annee = 2026
    const c = this.canOfficielle ? 4 : this.quotaChoice('c', [2, 4, 5])
    const b = this.canOfficielle ? 1 : randint(1, c - 1)
    const maFraction = new FractionEtendue(b, c)
    const a = annee
    const resultat = maFraction.ajouteEntier(a).valeurDecimale
    this.question = `Quelle est la valeur décimale de  $${texNombre(a, 0)}+${maFraction.texFraction}$ ?`
    this.correction = `$${texNombre(a)}+${maFraction.texFraction} = ${texNombre(a)} + ${texNombre(maFraction.valeurDecimale)}= ${miseEnEvidence(texNombre(resultat, 2))}$`
    this.reponse = resultat

    if (this.interactif) {
      this.question += '<br>'
    }
  }
}
