import { addCribleEratosthene } from '../../lib/customElements/CribleEratostheneElement'
import Exercice from '../Exercice'

export const titre = "Illustrer le crible d'Ératosthène"

export const refs = {
  'fr-fr': ['P029'],
  'fr-ch': [],
}
export const uuid = 'a9f82'

/** Support animé pour présenter le crible d'Ératosthène. */
export default class CribleEratosthene extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.pasDeVersionAleatoire = true
    this.correctionDetailleeDisponible = false
    this.besoinFormulaireTexte = [
      'Nombre maximal affiché dans la grille',
      'Saisir un entier supérieur ou égal à 3.',
    ]
    this.sup = 100
  }

  nouvelleVersion() {
    const max =
      Number.isInteger(Number(this.sup)) && Number(this.sup) >= 3
        ? Number(this.sup)
        : 100
    this.sup = max
    const contenuGenere = addCribleEratosthene(this, 0, { max })
    this.contenu = contenuGenere
    this.listeQuestions[0] = contenuGenere
  }
}
