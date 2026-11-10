import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const titre = "Nom de l'exercice"

export const dateDePublication = '20/10/2025' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

export const uuid = 'jnapmep1'
export const refs = {
  'fr-fr': ['EssaiJNAPMEP1'],
  'fr-ch': [],
}

/**
 *
 * @author

*/
export default class NomExercice extends Exercice {
  constructor() {
    super()
    this.consigne = 'Consigne'
    this.besoinFormulaireCaseACocher = ['Nombres entiers']
    this.sup = false
    this.besoinFormulaire2Texte = [
      'Types de calculs',
      'Nombres séparés par des tirets : \n1 : Type1\n2 : Type2\n3 : Type3\n4 : Mélange',
    ]
    this.sup2 = '4  '
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 3,
      defaut: 3,
      melange: 4,
      nbQuestions: this.nbQuestions,
    })

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse
      const a = randint(-10, 10)
      switch (listeTypeQuestions[i]) {
        case 1:
          texte = `Question ${i + 1} de type 1 avec ${a}`
          texteCorr = `Correction ${i + 1} de type 1`
          reponse = 123
          break
        case 2:
          texte = `Question ${i + 1} de type 2`
          texteCorr = `Correction ${i + 1} de type 2`
          reponse = 456
          break
        default: // On termine toujours par default qui ici correspond à '3':
          texte = `Question ${i + 1} de type 3`
          texteCorr = `Correction ${i + 1} de type 3`
          reponse = 789
          break
      }
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecFraction,
      )
      handleAnswers(this, i, { reponse: { value: reponse } })
      if (this.questionJamaisPosee(i, a)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
