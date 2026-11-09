import { latex2d } from '../../../lib/2d/textes'
import Pyramide from '../../../modules/pyramide'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'

import { fixeBordures } from '../../../lib/2d/fixeBordures'
import type { Complexe } from '../../../lib/mathFonctions/Complexe'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'
export const titre =
  'Calculer dans une pyramide multiplicative de nombres complexes'
export const interactifReady = true

export const dateDePublication = '28/03/2026'
/**
 * @author  Jean-claude Lhote
 */
export const uuid = '10abf'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export default class Pyramide3EtagesComplexes2 extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.complexes
    this.typeExercice = 'simple'
  }

  nouvelleVersion() {
    const pyr = new Pyramide({
      operation: '*',
      nombreEtages: 3,
      rangeData: [-10, 10],
      exclusions: [0],
      fractionOn: false,
      complexOn: true,
    })
    pyr.isVisible = [[false], [false, false], [true, true, true]]
    const objets = pyr.representeMoi(0, 0)
    this.question = `Chaque case contient le produit des deux cases sur lesquelles elle repose. Quel est le nombre au sommet de la pyramide ?<br>
    ${mathalea2d(Object.assign({ scale: 0.6 }, fixeBordures(objets)), [...objets, latex2d('?', 9, 3.75, { letterSize: 'large' })])}`
    this.reponse = pyr.valeurs[0][0]
    pyr.isVisible = [[true], [true, true], [true, true, true]]
    const objetsCorr = pyr.representeMoi(0, 0)
    this.correction = `Le nombre qui se trouve au sommet de la pyramide est : $${miseEnEvidence((this.reponse as Complexe).tex())}$.<br>
    ${mathalea2d(Object.assign({ scale: 0.6 }, fixeBordures(objetsCorr)), objetsCorr)}`
  }
}
