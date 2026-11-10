import { latex2d } from '../../../lib/2d/textes'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import Pyramide from '../../../modules/pyramide'
import ExerciceSimple from '../../ExerciceSimple'

import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
export const titre = 'Calculer dans une pyramide multiplicative'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '09/05/2022'
/**
 * @author  Jean-claude Lhote
 */
export const uuid = 'a905f'

export const refs = {
  'fr-fr': ['can6C7-03'],
  'fr-ch': [],
}
export default class PyramideMul3Etages extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.typeExercice = 'simple'
  }

  nouvelleVersion() {
    const pyr = new Pyramide({
      operation: '*',
      nombreEtages: 3,
      rangeData: [2, 5],
      exclusions: [0],
      fractionOn: false,
    })
    pyr.isVisible = [[false], [false, false], [true, true, true]]
    const objets = [
      ...pyr.representeMoi(0, 0),
      latex2d('?', 6, 3.75, { letterSize: 'large' }),
    ]
    this.question = `Chaque case contient le produit des deux cases sur lesquelles elle repose. Quel est le nombre qui manque au sommet de la pyramide ?<br>
    ${mathalea2d(Object.assign({ scale: 0.6 }, fixeBordures(objets)), ...objets)}`
    this.reponse = pyr.valeurs[0][0]
    pyr.isVisible = [[true], [true, true], [true, true, true]]
    const objetsCorrection = [...pyr.representeMoi(0, 0)]
    this.correction = `Le nombre qui manque au sommet de la pyramide est : $${miseEnEvidence(this.reponse)}$.<br>
    ${mathalea2d(Object.assign({ scale: 0.6 }, fixeBordures(objetsCorrection)), ...objetsCorrection)}`
  }
}
