import { centreLoisir } from './centreLoisir'
import { chocolats } from './chocolats'
import { heritage } from './heritage'
import { musique } from './musique'
import { tempsEcran } from './tempsEcran'

export { centreLoisir } from './centreLoisir'
export { chocolats } from './chocolats'
export { heritage } from './heritage'
export { musique } from './musique'
export { default as ProblemeMultiplicatifParts } from './problemesMultiplicatifsPart'
export { tempsEcran } from './tempsEcran'

export const listeDeProblemesMultiplicatifsParts = [
  centreLoisir,
  chocolats,
  tempsEcran,
  heritage,
  musique,
]
