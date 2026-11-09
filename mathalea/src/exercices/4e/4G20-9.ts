import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer un carré ou une racine carrée'

export const dateDePublication = '12/10/2026'
export const interactifReady = true

export const uuid = '97ff7'
export const refs = {
  'fr-fr': ['4G20-9'],
  'fr-ch': ['9R1NO5B-5', '9R2NO5B-5', '9R3NO5B-5', '10CTNO6A-3', '10LCNO6A-3', '10LSNO6A-3', 'PRQNO03B-10', 'PRQNO07B-3'],
}
/**
 * Compléter 5²=... ,(...)²=49, √64=...
 * choix de 3 types de questions, et de nombres maximum pour les calculs et de nombres entiers ou decimaux
 * @author Olivier Mimeau
 */
export default class nomExercice extends Exercice {
  constructor() {
    super()
    this.consigne = ''
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets  :',
        '1 : x²=...',
        '2 : (...)²=a',
        '3 : √a=...',
      ].join('\n'),
    ]
    this.besoinFormulaire2Numerique = ['Valeur maximale de x', 200]
    this.besoinFormulaire3CaseACocher = ['Nombres entiers', true]
    this.nbQuestions = 3
    this.sup = '1-2-3'
    this.sup2 = 12
    this.sup3 = true
  }

  nouvelleVersion() {
    const typeQuestionsDisponibles = gestionnaireFormulaireTexte({
      saisie: this.sup,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
      listeOfCase: ['xCarre', 'xCarreInverse', 'racineX'],
    })
    //['xCarre', 'xCarreInverse', 'racineX']
    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )

    // this.nombreDeValeurs = contraindreValeur(3, 9, this.sup2, 5)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let leTexte = ''
      let reponseAttendue = ''
      // (…)² = a admet deux solutions : la racine et son opposé
      let reponsesAcceptees: string[] = []
      let clavier = KeyboardType.clavierNumbers
      const decimal = this.sup3 ? 0 : randint(-2, 0) // randint(-2, 2) ?
      const racine = randint(1, this.sup2) * 10 ** decimal
      const carre = racine * racine
      switch (listeTypeQuestions[i]) {
        case 'xCarreInverse':
          reponseAttendue = texNombre(racine, 2)
          reponsesAcceptees = [reponseAttendue, texNombre(-racine, 2)]
          clavier = KeyboardType.clavierDeBase // touche « − » pour l'opposé
          leTexte += `( %{champ1} )^2 = ${texNombre(carre, 4)}`
          texteCorr += `Deux réponses sont possibles : $${miseEnEvidence(reponseAttendue)}^2=${texNombre(carre, 4)}$ ou $\\left(${miseEnEvidence(texNombre(-racine, 2))}\\right)^2=${texNombre(carre, 4)}$.`

          break
        case 'racineX':
          reponseAttendue = texNombre(racine, 2)
          leTexte += `\\sqrt{${texNombre(carre, 4)}} = %{champ1}`
          texteCorr += `$\\sqrt{${texNombre(carre, 4)}}$ = $${miseEnEvidence(reponseAttendue)}$`
          break
        default:
          reponseAttendue = texNombre(carre, 4)
          leTexte += `${texNombre(racine, 2)}^2 = %{champ1}`
          texteCorr += `$${texNombre(racine, 2)}^2$ = $${miseEnEvidence(reponseAttendue)}$`
          break
      }
      texte += remplisLesBlancs(this, i, leTexte, clavier, '\\ldots')
      handleAnswers(this, i, {
        champ1: {
          value:
            reponsesAcceptees.length > 0 ? reponsesAcceptees : reponseAttendue,
        },
      })
      if (this.questionJamaisPosee(i, reponseAttendue, listeTypeQuestions[i])) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
