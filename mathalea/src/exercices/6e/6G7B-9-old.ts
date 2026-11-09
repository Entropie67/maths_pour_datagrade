// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid f0a09 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
// Version publiée jusqu'au 10/10/2026 (commit 7391ebad1).
import SymetrieProprietes from '../5e/5G3B-3-old'

export const titre = 'Utiliser les propriétés de conservation de la symétrie'
export const dateDePublication = '07/07/2026'
export const interactifReady = true

/**
 * @author Éric Elter
 */

export const uuid = 'f0a09'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export default class SymetrieAxialeProprietesOld extends SymetrieProprietes {
  constructor() {
    super()
    this.besoinFormulaire3Numerique = false
    this.sup3 = 2
  }
}
