import { coureur2 } from './coureur'
import { courses1 } from './courses'
import { lecture } from './lecture'
import { nageur } from './nageur'
import { plantation } from './plantation'
import { recette1 } from './recette'
import { soif } from './soif'
import { sportif } from './sportif'
import { transports } from './transports'

export { coureur2 } from './coureur'
export { courses1 } from './courses'
export { lecture } from './lecture'
export { nageur } from './nageur'
export { plantation } from './plantation'
export { default as ProblemeAdditif } from './problemesAdditifsTout'
export { recette1 } from './recette'
export { soif } from './soif'
export { sportif } from './sportif'
export { transports } from './transports'

export const listeDeProblemesAdditifsTout = [
  courses1,
  coureur2,
  recette1,
  soif,
  nageur,
  transports,
  plantation,
  sportif,
  lecture,
]
