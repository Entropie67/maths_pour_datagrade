import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Écrire une proportion sous la forme d’un pourcentage'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '13/09/2026'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export const uuid = 'fdd72'

export const refs = {
  'fr-fr': ['can5P2-03', '2I10-flash2', '1A-R01-10'],
  'fr-ch': [],
}
export default class ÉcrireProportionPourcentage extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.versionQcmDisponible = true
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  nouvelleVersion() {
    const listeFractions1 = [
      [1, 2],
      [1, 4],
      [3, 4],
      [1, 5],
      [2, 5],
      [3, 5],
      [4, 5],
      [1, 10],
      [3, 10],
      [7, 10],
      [9, 10],
      [3, 25],
      [9, 25],
      [13, 25],
      [9, 50],
      [17, 50],
      [9, 20],
      [3, 20],
      [17, 20],
      [1, 20],
      [7, 20],
      [11, 20],
      [13, 20],
      [19, 20],
      [7, 25],
      [11, 25],
      [19, 25],
      [3, 50],
      [21, 50],
      [1, 200],
      [3, 200],
      [7, 200],
      [11, 200],
      [17, 200],
    ]
    const fraction = choice(listeFractions1)
    const n = fraction[0]
    const d = fraction[1]
    const frac = new FractionEtendue(n, d)

    this.question = this.versionQcm
      ? `$${frac.texFraction}$ est égal à : `
      : `Compléter :<br> $${frac.texFraction}=$`
    if (this.interactif) {
      this.optionsChampTexte = { texteApres: ' $\\%$' }
    } else {
      this.question += this.versionQcm ? `` : `${sp(1)} $\\ldots${sp(1)}\\%$`
    }
    this.correction = `$${frac.texFraction}=\\dfrac{${texNombre(n)}\\times ${texNombre(100 / d)}}{${texNombre(d)}\\times ${texNombre(100 / d)}}=
        \\dfrac{${texNombre((n * 100) / d)}}{100}=${miseEnEvidence(`${texNombre((n * 100) / d)}${sp()}\\%`)}$`
    this.reponse = this.versionQcm
      ? `$${texNombre((n * 100) / d)}\\,\\%$`
      : (n * 100) / d
    this.canEnonce = 'Compléter.'
    this.canReponseACompleter = `$${frac.texFraction}=\\ldots ${sp()}\\%$`
    this.distracteurs = [
      `$${texNombre(n / d, 2)}\\,\\%$`, // Erreur : oubli de multiplier par 100
      `$${texNombre((n * 10) / d, 1)}\\,\\%$`, // Erreur : multiplication par 10 au lieu de 100
      `$${texNombre(n + d / 100, 2, true)}\\,\\%$`, // Erreur : inversion du numérateur et dénominateur
    ]
  }
}
