import { sp } from '../../lib/outils/outilString'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
export const titre = 'Simuler des lancers de dés'

export const refs = {
  'fr-fr': ['P016'],
  'fr-ch': [],
}
export const uuid = 'bc372'
export const dateDePublication = '06/04/2022'

/**
 * Simule des lancers de dés
 * @author Jean-claude Lhote

*/
export default class SimulateurDes extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Liste des dés séparés par des tirets (de 4 à 20, par défaut 6)',
      '',
    ]

    this.nbQuestions = 1

    this.sup = '6' // liste de dés
  }

  nouvelleVersion() {
    let texte
    const liste = gestionnaireFormulaireTexte({
      melange: 0,
      saisie: this.sup,
      min: 4,
      max: 20,
      defaut: 6,
      shuffle: false,
      nbQuestions: this.sup.split('-').length,
    }).map(Number)
    texte = 'Vous jetez les dés et vous obtenez : <br><br>'
    for (let j = 0; j < this.nbQuestions; j++) {
      let somme = 0
      texte += `tirage N°$${j + 1}$ : ${sp(3)}`
      for (let i = 0; i < liste.length; i++) {
        const tirage = randint(1, liste[i])
        somme += tirage
        texte += `$${tirage.toString()}$`
        texte += sp(3)
      }
      texte += `(somme des dés : $${somme}$)<br>`
    }
    this.listeQuestions = [texte]
    this.listeCorrections = ['']
    listeQuestionsToContenu(this)
  }
}
