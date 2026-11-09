import DeriveeFonctionComposee from './TSA3-30'

export const titre =
  'Dériver une fonction du type $u^n$, $\\mathrm{e}^u$ ou $\\sqrt{u}$'
export const dateDePublication = '02/11/2026'
export const interactifReady = true
export const interactifType = 'mathLive'

export const uuid = '819e8'

export const refs = {
  'fr-fr': ['TCA7-30'],
  'fr-ch': [],
}

/**
 * Reprise de TSA3-30 pour les maths complémentaires : $\sqrt{u}$ n'est pas
 * proposé par défaut.
 * @author Arnaud Meistermann
 */
export default class DeriveeFonctionComposeeComplementaire extends DeriveeFonctionComposee {
  constructor() {
    super()
    this.sup = '1-2'
  }
}
