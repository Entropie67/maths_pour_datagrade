import CoteTriangleRectanglePythagoreQcm from './1A-G03-8'

export const titre =
  "Calculer la longueur de l'hypoténuse d'un triangle rectangle"
export const dateDePublication = '02/11/2026'

export const uuid = 'a9ee8'

export const refs = {
  'fr-fr': ['1A-G03-9', '2A-G4-6'],
  'fr-ch': ['10LCGM3A-5', '10LSGM3A-5', '11CTGM2A-5'],
}

export const interactifReady = true

export const amcReady = true

/**
 * Exercice de calcul de l'hypoténuse d'un triangle rectangle avec le théorème de Pythagore.
 * Le code est celui de 1A-G03-8.
 * @author Stéphane Guyon
 */
export default class HypotenuseTriangleRectanglePythagoreQcm extends CoteTriangleRectanglePythagoreQcm {
  constructor() {
    super()
    this.chercheHypotenuse = true
    this.versionAleatoire()
  }
}
