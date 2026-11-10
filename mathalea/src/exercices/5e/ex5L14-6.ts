import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import ChoisirUneExpressionLitterale from './_Choisir_expression_litterale'

export const titre =
  'Déterminer la dernière opération à effectuer dans une expression numérique'

/**

 * Déterminer la dernière opération à effectuer dans une expression numérique
 * @author Sébastien Lozano
 */
export const uuid = 'd1a2c'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['11CTFA3A-5'],
}
export default class DeterminerDerniereOperationExpNum extends Exercice {
  constructor() {
    super()
    this.besoinFormulaire2CaseACocher = ['Avec décimaux.', false]
    this.besoinFormulaireCaseACocher = [
      'Avec le signe × devant les parenthèses',
      true,
    ]
    this.nbQuestions = 4
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [5] // expressions complexes
    let expn
    let expc
    let decimal = 1
    let nbOperations
    let resultats
    let lastOp
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    if (this.sup2) decimal = 10
    for (
      let i = 0, texte, texteCorr, val1, val2, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      nbOperations = listeTypeDeQuestions[i]
      val1 = randint(2, 5)
      val2 = randint(6, 9)
      resultats = ChoisirUneExpressionLitterale(
        nbOperations,
        decimal,
        val1,
        val2,
        this.sup,
      )
      expn = resultats[1]
      expc = resultats[2]
      lastOp = resultats[4]
      const str = String(expc).split('=')

      if (String(expn).indexOf('ou') > 0)
        expn = String(expn).substring(0, String(expn).indexOf('ou')) // on supprime la deuxième expression fractionnaire
      this.consigne = 'Déterminer la dernière opération à effectuer.'
      texte = `$${str[1]}$`

      texteCorr = '$'
      for (let l = 1; l < str.length - 1; l++) {
        texteCorr += `${str[l]}=`
      }
      texteCorr += `${str[str.length - 1]}`
      texteCorr += `<br>La dernière opération dans $${str[1]}$ est donc une ${texteEnCouleurEtGras(String(lastOp))}.`

      if (this.listeQuestions.indexOf(texte) === -1) {
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
