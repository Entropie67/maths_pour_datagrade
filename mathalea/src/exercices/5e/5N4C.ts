import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Connaître les cubes parfaits'
export const dateDePublication = '02/09/2026'

export const interactifReady = true
export const amcReady = true
export const amcType = 'AMCNum'

export const uuid = '57538'
export const refs = {
  'fr-fr': ['5N4C'],
  'fr-ch': ['9R1NO5B-4', '9R2NO5B-4', '9R3NO5B-4', 'PRQNO07A-6'],
}

/**
 * @author Éric Elter
 */

export default class CubeDesPremiersEntiers extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : 1',
        '2 : 2',
        '3 : 3',
        '4 : 4',
        '5 : 5',
        '6 : 6',
        '7 : 7',
        '8 : 8',
        '9 : 9',
        '10 : 10',
        '11 : Mélange',
      ].join('\n'),
    ]
    this.sup = '10'
    this.besoinFormulaire2CaseACocher = ['Consigne enrichie', false]
    this.sup2 = false
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    this.consigne = this.sup2
      ? 'Répondre par une valeur entière, sans exposant.'
      : ''
    const typesDeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 10,
      melange: 11,
      defaut: 11,
      nbQuestions: this.nbQuestions,
      enleveDoublons: true,
    }).map(Number)

    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = listeTypeDeQuestions[i]
      let texte = `Quel est le cube de $${a}$ ?`
      texte += ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
      const reponse = a ** 3
      handleAnswers(this, i, {
        reponse: { value: reponse, options: { nombreDecimalSeulement: true } },
      })
      const texteCorr = `Le cube d'un nombre est ce nombre multiplié par lui-même puis encore par lui-même : $${a}\\times${a}\\times${a}=${miseEnEvidence(texNombre(reponse))}$.`

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
