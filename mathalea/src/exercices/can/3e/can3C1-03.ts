import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texteParPosition } from '../../../lib/2d/textes'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import type FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'
import Pyramide from '../../../modules/pyramide'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer dans une pyramide additive de fractions'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '09/05/2022'
/**
 * @author  Jean-claude Lhote
 *
 *
 */
export const uuid = '140ad'

export const refs = {
  'fr-fr': ['can3C1-03'],
  'fr-ch': ['NR'],
}
export default class Pyramide3EtagesAdditionFractions extends ExerciceSimple {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.nbQuestions = 1

    this.typeExercice = 'simple'
  }

  nouvelleVersion() {
    const pyr = new Pyramide({
      operation: '+',
      nombreEtages: 3,
      rangeData: [
        [-3, 3],
        [5, 10],
      ],
      exclusions: [0],
      fractionOn: true,
    })
    pyr.isVisible = [[false], [false, false], [true, true, true]]
    this.question = `Chaque case contient la somme des deux cases sur lesquelles elle repose. Quel est le nombre qui correspond à * ?<br>
    
    ${mathalea2d({ xmin: 0, ymin: 0, xmax: 12, ymax: 7, scale: 0.7 }, pyr.representeMoi(0, 0), texteParPosition('*', 6, 5))}`
    this.reponse = (pyr.valeurs[0][0] as FractionEtendue).texFractionSimplifiee
    pyr.isVisible = [[true], [true, true], [true, true, true]]
    this.correction = `Le nombre qui se trouve au sommet de la pyramide est : $${miseEnEvidence(this.reponse)}$<br>
    
    ${mathalea2d({ xmin: 0, ymin: 0, xmax: 12, ymax: 7, scale: 0.7 }, pyr.representeMoi(0, 0))}`
  }
}
