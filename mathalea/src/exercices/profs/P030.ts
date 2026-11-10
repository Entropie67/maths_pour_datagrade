import {
  addSchemaEnBarre,
  type SchemaEnBarreType,
} from '../../lib/customElements/SchemaEnBarreElement'
import Exercice from '../Exercice'

export const titre = 'Créer un schéma en barre'

export const refs = {
  'fr-fr': ['P030'],
  'fr-ch': [],
}
export const uuid = 'a9f83'

/** Numéros du formulaire : ceux de 1 à 4 sont déjà dans des liens partagés. */
const TYPES_PAR_NUMERO: SchemaEnBarreType[] = [
  'additif-parties-tout',
  'additif-comparaison',
  'multiplicatif-parties-tout',
  'multiplicatif-comparaison',
  'additif-comparaison-total',
  'multiplicatif-comparaison-total',
]

/**
 * Outil du professeur pour afficher et compléter un schéma en barre (additif
 * ou multiplicatif ; parties-tout, comparaison ou comparaison avec total), par
 * exemple pour modéliser un problème au tableau.
 * @author Rémi Angot
 */
export default class CreateurSchemaEnBarre extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.pasDeVersionLatex = true
    this.pasDeVersionAleatoire = true
    this.correctionDetailleeDisponible = false
    this.besoinFormulaireNumerique = [
      'Type de schéma',
      6,
      '0 : Au choix\n1 : Additif parties-tout\n2 : Additif comparaison\n3 : Multiplicatif parties-tout\n4 : Multiplicatif comparaison\n5 : Additif comparaison avec total\n6 : Multiplicatif comparaison avec total',
    ]
    this.sup = 0
  }

  nouvelleVersion() {
    const choix = Number(this.sup)
    const typeImpose = TYPES_PAR_NUMERO[choix - 1]
    const contenuGenere = addSchemaEnBarre(this, 0, { typeImpose })
    this.contenu = contenuGenere
    this.listeQuestions[0] = contenuGenere
  }
}
