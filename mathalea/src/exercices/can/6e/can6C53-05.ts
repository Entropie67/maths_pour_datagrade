import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { ppcm } from '../../../lib/outils/primalite'
import type FractionEtendue from '../../../modules/FractionEtendue'
import { obtenirListeFractionsIrreductibles } from '../../../modules/fractions'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Déterminer le plus petit dénominateur commun'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '06/07/2025'

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export const uuid = '3b4c5'

export const refs = {
  'fr-fr': ['can6C53-05'],
  'fr-ch': [],
}
export default class DenominateurCommun extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    const frac1 = this.quotaChoice(
      'frac1',
      obtenirListeFractionsIrreductibles(),
    )

    let frac2: FractionEtendue
    do {
      frac2 = choice(obtenirListeFractionsIrreductibles())
    } while (frac2.den === frac1.den)

    const resultat = ppcm(frac1.den, frac2.den)

    this.question = `Voici deux fractions : $${frac1.texFraction}$ et $${frac2.texFraction}$.<br>
Quel est le plus petit dénominateur commun de ces deux fractions ?`

    this.correction = `Le dénominateur de la première fraction est $${frac1.den}$, celui de la deuxième fraction est $${frac2.den}$.<br>
On cherche le plus petit dénominateur commun en trouvant le plus petit multiple commun entre ces deux nombres.<br>
Le plus petit multiple commun de $${frac1.den}$ et $${frac2.den}$ (c'est-à-dire le plus petit nombre qui est à la fois dans la table de $${frac1.den}$ et de $${frac2.den}$) est $${miseEnEvidence(resultat)}$.`
    this.reponse = resultat
  }
}
