import { texPrix } from '../../lib/format/style'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'

export const titre =
  'Résoudre des problèmes de type : ... fois plus ou ... fois moins'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

export const dateDePublication = '02/05/2025'

/**
 *
 * @author Mickael Guironnet
 */
export const uuid = 'c71fb'

export const refs = {
  'fr-fr': ['6P3autoB', '6AutoP2'],
  'fr-2016': ['6P11-3'],
  'fr-ch': ['9R1NO7E-9', '9R2NO7E-9', '9R3NO7E-9', 'PRQST02B-15', 'PRQNO15A-9'], // Primaire anciennement :['9NO16-6'],
}
export default class ProblemesDeFoisPlusEtDeFoisMoins extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.sup = 1 // Niveau de difficulté
    this.sup2 = 3
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      '1 : Valeurs entières\n2 : Une décimale\n3 : Deux décimales',
    ]
    this.besoinFormulaire2Texte = [
      'Type de questions',
      `Nombres séparés par des tirets :
  1 : Fois moins que
  2 : Fois plus que
  3 : Mélange`,
    ]
  }

  nouvelleVersion() {
    const typesDeQuestions = gestionnaireFormulaireTexte({
      max: 2,
      defaut: 1,
      melange: 3,
      nbQuestions: this.nbQuestions,
      saisie: this.sup2,
    })
    const n = this.sup - 1

    this.consigne =
      this.nbQuestions > 1
        ? 'Résoudre les problèmes suivants.'
        : 'Résoudre le problème suivant.'

    const listeTypeQuestions = []
    const fois = [2, 3, 4, 5, 10]
    const foisUsed: number[] = []
    for (
      let i = 0, texte, texteCorr, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      if (typesDeQuestions[i] === 1) {
        listeTypeQuestions[i] =
          randint(0, 1) < 1 ? 'foisMoinsQue' : 'combienDeFoisMoins'
      } else if (typesDeQuestions[i] === 2) {
        listeTypeQuestions[i] =
          randint(0, 1) < 1 ? 'foisPlusQue' : 'combienDeFoisPlus'
      }
      // Boucle principale où i+1 correspond au numéro de la question
      const f = choice(fois, foisUsed) // On choisit un nombre de fois aléatoire
      const d = Math.floor(200 / f / 10) // pour éviter d'avoir des résultats supéreieurs à 200
      const resu =
        randint(2, d) * 10 +
        randint(1, 9) +
        (n > 0 ? randint(1, 9) * 0.1 : 0) +
        (n > 1 ? randint(1, 9) * 0.01 : 0)
      const value = resu * f
      switch (
        listeTypeQuestions[i] // Suivant le type de question, le contenu sera différent
      ) {
        case 'combienDeFoisPlus': {
          texte = `J'ai $${texPrix(resu)}$ €. Combien font $${f}$ fois plus${sp()}?`
          if (this.interactif && !context.isAmc) {
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
              {
                texteApres: ' €',
              },
            )
          }
          texteCorr = `$${texPrix(resu)}$ € $\\times ${f}$ = $${texPrix(value)}$ € <br>`
          texteCorr += `Donc le résultat est $${miseEnEvidence(texPrix(value))}$ €.`
          handleAnswers(this, i, { reponse: { value: texPrix(value) } })
          break
        }
        case 'combienDeFoisMoins': {
          texte = `J'ai $${texPrix(value)}$ €. Combien font $${f}$ fois moins${sp()}?`
          if (this.interactif && !context.isAmc) {
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
              {
                texteApres: ' €',
              },
            )
          }
          texteCorr = `$${texPrix(value)}$ € $\\div ${f}$ = $${texPrix(resu)}$ € <br>`
          texteCorr += `Donc le résultat est $${miseEnEvidence(texPrix(resu))}$ €.`
          handleAnswers(this, i, { reponse: { value: texPrix(resu) } })
          break
        }
        case 'foisMoinsQue': {
          texte = `$${f}$ fois moins que $${texPrix(value)}$ €, c'est `
          if (this.interactif && !context.isAmc) {
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
              {
                texteApres: ' €',
              },
            )
          } else {
            texte += '$\\ldots\\ldots$ €'
          }
          texte += '.'
          texteCorr = `$${texPrix(value)}$ € $\\div ${f}$ = $${texPrix(resu)}$ € <br>`
          texteCorr += `Donc le résultat est $${miseEnEvidence(texPrix(resu))}$ €.`
          handleAnswers(this, i, { reponse: { value: texPrix(resu) } })
          break
        }
        case 'foisPlusQue': {
          texte = `$${f}$ fois plus que $${texPrix(resu)}$ €, c'est `
          if (this.interactif && !context.isAmc) {
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierNumbers,
              {
                texteApres: ' €',
              },
            )
          } else {
            texte += '$\\ldots\\ldots$ €'
          }
          texte += '.'
          texteCorr = `$${texPrix(resu)}$ € $\\times ${f}$ = $${texPrix(value)}$ € <br>`
          texteCorr += `Donc le résultat est $${miseEnEvidence(texPrix(value))}$ €.`
          handleAnswers(this, i, { reponse: { value: texPrix(value) } })
          break
        }
      }
      if (this.questionJamaisPosee(i, resu, f)) {
        // Si la question n'a jamais été posée, on en crée une autre
        foisUsed.push(f) // On enlève le nombre de fois utilisé pour ne pas le réutiliser
        if (foisUsed.length === fois.length) foisUsed.splice(0, foisUsed.length) // Si tous les nombres de fois ont été utilisés, on les réinitialise
        this.listeQuestions[i] = texte ?? ''
        this.listeCorrections[i] = texteCorr ?? ''
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
