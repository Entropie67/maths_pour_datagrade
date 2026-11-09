import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import ExerciceSimple from '../../ExerciceSimple'

import { sp } from '../../../lib/outils/outilString'
import FractionEtendue from '../../../modules/FractionEtendue'
export const titre = 'Comparer des fractions'
export const interactifReady = true

export const uuid = '3dff8'
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
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionEgale: true }
  }

  nouvelleVersion() {
    const a = this.quotaRandint('a', 2026, 2027)
    const f1 = new FractionEtendue(a, 2025)
    const f2 = new FractionEtendue(2025, a)
    const listeNombre1 = [f1.texFraction, f2.texFraction, 1]
    const choix = this.quotaChoice('choix', [true, false])
    const Nombre1 = shuffle(listeNombre1)
    this.reponse = choix
      ? new FractionEtendue(a, 2025).toLatex()
      : new FractionEtendue(2025, a).toLatex()
    this.question = `Parmi les nombres ci-dessous, quel est le plus ${choix ? 'grand' : 'petit'} nombre ?<br>`

    this.question += `<br>$${Nombre1[0]}$${sp(4)};${sp(4)}  $${Nombre1[1]}$${sp(4)};${sp(4)}  $${Nombre1[2]}$`
    if (this.interactif) {
      this.question += '<br><br>Recopier ce nombre.'
    }
    this.correction = `$${f1.texFraction} > 1$ et $${f2.texFraction}<1$, donc le plus ${choix ? 'grand' : 'petit'} nombre est : $${miseEnEvidence(this.reponse)}$.`
    this.canEnonce = `Quel est le plus ${choix ? 'grand' : 'petit'} nombre ?<br>
    Entourer ce nombre.`
    this.canReponseACompleter = `$${Nombre1[0]}$${sp(4)};${sp(4)}  $${Nombre1[1]}$${sp(4)};${sp(4)}  $${Nombre1[2]}$`
  }
}
