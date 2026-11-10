import { couverture } from './couvertures'
import { distribution } from './distribution'
import { gelHA } from './gelHydroalcolique'
import { gourdes } from './gourdesEmbalees'
import { repas } from './repas'

export { couverture } from './couvertures'
export { distribution } from './distribution'
export { gelHA } from './gelHydroalcolique'
export { gourdes } from './gourdesEmbalees'
export { default as ProblemeMultiplicatifsComplexes } from './problemesMultiplicatifsComplexes'
export { repas } from './repas'

export const listeDeProblemesMultiplicatifsComplexes = [
  couverture,
  distribution,
  gelHA,
  gourdes,
  repas,
]
