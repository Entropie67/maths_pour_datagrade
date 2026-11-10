import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Effectuer la soustraction de deux entiers'
export const interactifReady = true

export const dateDePublication = '22/08/2024'

/**
 * Soustraire deux entiers
 * @author Jean-claude Lhote

 */
export const uuid = '3751c'
export const refs = {
  'fr-fr': ['CM2N4A-3'],
  'fr-2016': ['c3C10-5'],
  'fr-ch': ['9R1NO6B-2', '9R2NO6B-2', '9R3NO6B-2'],
}

class ExerciceTablesSoustractions extends Exercice {
  constructor() {
    super()
    this.consigne = 'Calculer.'
    this.sup2 = '1'
    this.sup = 20 // Le paramètre accessible à l'utilisateur sera la valeur maximale du total
    this.sup2 = '1'
    this.spacing = 2

    this.besoinFormulaireNumerique = ['Valeur maximale', 99999]
    this.besoinFormulaire2Texte = [
      'Type de question',
      'Nombres séparés par des tirets :\n1 : Calculer la différence\n2 : Calculer le premier terme\n3 : Calculer le deuxième terme\n4 : Calculer un des termes\n5 : Mélange',
    ]
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 4,
      defaut: 1,
      melange: 5,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const total = randint(2, this.sup)
      const operande = randint(1, total)
      let texte: string
      let texteCorr: string
      let value: string
      switch (Number(listeTypeDeQuestions[i])) {
        case 4: // au choix 2 ou 3
          listeTypeDeQuestions[i] = choice([2, 3])
          continue
        case 2:
          texte = remplisLesBlancs(
            this,
            i,
            `%{champ1}-${texNombre(operande, 0)}=${texNombre(total - operande, 0)}`,
          )
          texteCorr = `$${texNombre(total - operande, 0)}+${texNombre(operande, 0)}=${texNombre(total, 0)}$ donc $${miseEnEvidence(texNombre(total, 0))}-${texNombre(operande, 0)}=${texNombre(total - operande, 0)}$`
          value = `${texNombre(total, 0)}`
          break
        case 3:
          texte = remplisLesBlancs(
            this,
            i,
            `${texNombre(total, 0)}-%{champ1}=${texNombre(total - operande, 0)}`,
          )
          texteCorr = `$${texNombre(total, 0)}-${texNombre(operande, 0)}=${texNombre(total - operande, 0)}$ donc $${texNombre(total, 0)}-${miseEnEvidence(texNombre(operande, 0))}=${texNombre(total - operande, 0)}$`
          value = `${texNombre(operande, 0)}`
          break
        default:
          texte = remplisLesBlancs(
            this,
            i,
            `${texNombre(total, 0)}-${texNombre(operande, 0)}=%{champ1}`,
          )
          texteCorr = `$${texNombre(total, 0)}-${texNombre(operande, 0)}=${texNombre(total - operande, 0)}$ 
          donc $${texNombre(total, 0)}-${texNombre(operande, 0)}=${miseEnEvidence(texNombre(total - operande, 0))}$`
          value = `${texNombre(total - operande, 0)}`
          break
      }
      if (this.interactif) {
        handleAnswers(this, i, { champ1: { value } })
      }

      if (
        this.questionJamaisPosee(i, total, operande, listeTypeDeQuestions[i])
      ) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}

export default ExerciceTablesSoustractions
