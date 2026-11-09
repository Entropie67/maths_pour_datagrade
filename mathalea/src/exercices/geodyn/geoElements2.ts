import ExerciceConstructionSegmentDemiDroiteDroite from './geoElements1'
export const titre =
  'Tracer segment, droite et demi-droite (depuis description)'
export const dateDePublication = '29/01/2024'
export const interactifReady = true

export const refs = {
  'fr-fr': ['elements2'],
  'fr-ch': [],
}
export const uuid = 'b1e01'

/**
 * @author Rémi Angot
 */

class ExerciceConstructionSegmentDemiDroiteDroite2 extends ExerciceConstructionSegmentDemiDroiteDroite {
  constructor() {
    super()
    this.sup = true
  }
}

export default ExerciceConstructionSegmentDemiDroiteDroite2
