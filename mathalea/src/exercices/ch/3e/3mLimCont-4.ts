import {
    genererReconstruction,
    initialiserReconstruction,
} from '../../../lib/mathFonctions/reconstructionRationnelle'
import Exercice from '../../Exercice'

export const titre =
  'Construire une fonction rationnelle à partir de ses asymptotes'
export const dateDePublication = '16/10/2026'
export const uuid = '3f961'
export const interactifReady = true
export const interactifType = 'mathLive'
export const refs = { 'fr-fr': [], 'fr-ch': ['3mLimCont-4'] }

/** @author Nathan Scheinmann */
export default class ConstruireFonctionRationnelle extends Exercice {
  constructor() {
    super()
    initialiserReconstruction(this)
  }

  nouvelleVersion() {
    genererReconstruction(this)
  }
}
