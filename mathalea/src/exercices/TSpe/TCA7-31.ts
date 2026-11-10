import TangenteFonctionComposee from './TSA3-31'

export const titre =
  "Déterminer l'équation d'une tangente avec la dérivée d'une fonction composée"
export const dateDePublication = '02/11/2026'
export const interactifReady = true
export const interactifType = 'mathLive'

export const uuid = 'c4914'

export const refs = {
  'fr-fr': ['TCA7-31'],
  'fr-ch': [],
}

/**
 * Reprise de TSA3-31 pour les maths complémentaires : $\sqrt{u}$ n'est pas
 * proposé par défaut.
 * @author Arnaud Meistermann
 */
export default class TangenteFonctionComposeeComplementaire extends TangenteFonctionComposee {
  constructor() {
    super()
    this.sup = '1-2'
  }
}
