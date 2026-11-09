import VariationsFonctionComposee from './TSA3-32'

export const titre =
  "Étudier les variations d'une fonction du type $u^n$, $\\mathrm{e}^u$ ou $\\sqrt{u}$"
export const dateDePublication = '02/11/2026'
export const interactifReady = true

export const uuid = 'f5f34'

export const refs = {
  'fr-fr': ['TCA7-32'],
  'fr-ch': [],
}

/**
 * Reprise de TSA3-32 pour les maths complémentaires : $\sqrt{u}$ n'est pas
 * proposé par défaut.
 * @author Arnaud Meistermann
 */
export default class VariationsFonctionComposeeComplementaire extends VariationsFonctionComposee {
  constructor() {
    super()
    this.sup = '1-2'
  }
}
