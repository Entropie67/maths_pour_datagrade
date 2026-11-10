import {
  choixDeroulant,
  listeDeroulanteToQcm,
} from '../../lib/customElements/ListeDeroulanteElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { texteEnCouleur, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'
import ChoisirExpressionLitterale from './_Choisir_expression_litterale'

export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const dateDeModifImportante = '23/03/2026'

export const titre =
  'Déterminer la dernière opération à effectuer dans une expression littérale'

/**

 * Déterminer la dernière opération à effectuer dans une expression littérale
 * @author Sébastien Lozano fork Jean-claude Lhote
 * Rendu paramétrable et ajout de la structure d'une expression le 14/08/2021 : Guillaume Valmont
 * Interactivite : Olivier Mimeau 23/03/2026
 */
export const uuid = '97f1a'

export const refs = {
  'fr-fr': ['5N5D-1'],
  'fr-2016': ['5L14-4'],
  'fr-ch': ['9R2FA3B-3', '9R3FA3B-3', '10CTFA4A-3', '10LCFA4A-3', '10LSFA4A-3', '11CTFA3A-3', 'PRQAL01A-5'],
}
export default class DeterminerDerniereOperationExpressionLitterale extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Signe × explicite', true]
    this.besoinFormulaire2CaseACocher = ['Avec décimaux.', false]
    this.besoinFormulaire3Texte = [
      "Nombre d'opérations",
      'Nombres séparés par des tirets :\n1 : 1 opération\n2 : 2 opérations\n3 : 3 opérations\n4 : 4 opérations\n5 : Entre 2 et 5 opérations',
    ]
    this.nbQuestions = 4
    this.sup3 = 5
    this.consigne = `Déterminer la dernière opération à effectuer s'il fallait faire le calcul pour des valeurs données de $x$ et de $y$.`
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      max: 5,
      defaut: randint(1, 5),
      nbQuestions: this.nbQuestions,
      saisie: this.sup3,
      melange: 0,
    }).map(Number)

    let expn
    let expc
    let decimal = 1
    let nbOperations
    let resultats
    let lastOp
    let structureExpression
    if (this.sup2) decimal = 10
    for (
      let i = 0, texte, texteCorr, val1, val2, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      nbOperations = listeTypeDeQuestions[i]
      val1 = randint(2, 5)
      val2 = randint(6, 9)
      // resultats=ChoisirUneExpressionLitteraleBis(nbOperations,decimal,val1,val2)
      resultats = ChoisirExpressionLitterale(
        nbOperations,
        decimal,
        val1,
        val2,
        this.sup,
      )
      // expf = resultats[0]
      expn = resultats[1]
      expc = resultats[2]
      // nbval = resultats[3]
      lastOp = resultats[4]
      structureExpression = resultats[6]
      if (typeof expn === 'string') {
        if (expn.indexOf('ou') > 0) expn = expn.substring(0, expn.indexOf('ou')) // on supprime la deuxième expression fractionnaire} // dans le cas où il y a deux expressions fractionnaires, on prend la première
      }
      texte = `${expn}`

      texteCorr = `Pour fixer les idées, choisissons des valeurs pour $x$ et $y$, par exemple $x=${val1}$ et $y=${val2}$.`
      texteCorr += `<br>Le calcul serait le suivant : ${expc}.`
      texteCorr +=
        "<br>Pour n'importe quelles valeurs de $x$ et de $y$ choisies, les étapes sont les mêmes, elles respectent les priorités opératoires."
      texteCorr += `<br>La dernière opération dans ${expn} est une ${texteEnCouleurEtGras(String(lastOp))}.`
      let choix: {
        label: string
        value: string
      }[] = []
      let reponse = ''
      if (
        this.consigne ===
        'Déterminer si ces expressions sont des sommes, des différences, des produits ou des quotients.'
      ) {
        choix = [
          { label: '?', value: '' },
          { label: 'une somme', value: 'une somme' },
          { label: 'une différence', value: 'une différence' },
          { label: 'un produit', value: 'un produit' },
          { label: 'un quotient', value: 'un quotient' },
        ]
        reponse = String(structureExpression)
        texteCorr += texteEnCouleur(
          `<br>Cette expression est donc ${structureExpression}.`,
        )
      } else {
        choix = [
          { label: '?', value: '' },
          { label: 'une addition', value: 'addition' },
          { label: 'une soustraction', value: 'soustraction' },
          { label: 'une multiplication', value: 'multiplication' },
          { label: 'une division', value: 'division' },
        ]
        reponse = String(lastOp)
      }

      if (this.interactif) {
        texte += sp(10) + choixDeroulant(this, i, { choices: choix })
        handleAnswers(
          this,
          i,
          { reponse: { value: reponse } },
          { formatInteractif: 'liste-deroulante' },
        )
      } else if (context.isAmc) {
        const options = { ordered: true, vertical: true }
        listeDeroulanteToQcm(this, i, choix, reponse, options)
      }

      if (this.questionJamaisPosee(i, String(expn))) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
