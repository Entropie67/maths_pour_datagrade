import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { listeQuestionsToContenu } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Comparer une fraction avec $1$'
export const interactifReady = true

export const dateDePublication = '04/11/2022'
/**
 * @author Gilles Mora
 */

export const uuid = 'b0fc5'

export const refs = {
  'fr-fr': ['can6C52-02', '6N31-flash2'],
  'fr-ch': [],
}
export default class ComparerFractionAUn extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    this.consigne = 'Compléter avec $>$ ou $<$.'
    const listeFractions1 = [
      [7, 8, 11, 8],
      [5, 8, 7, 8],
      [4, 11, 7, 11],
      [2, 11, 10, 11],
      [8, 15, 13, 15],
      [14, 33, 17, 33],
      [34, 45, 37, 45],
      [18, 35, 19, 35],
      [14, 47, 37, 47],
      [11, 35, 31, 35],
      [12, 25, 16, 25],
      [15, 19, 17, 19],
      [8, 15, 11, 15],
      [14, 27, 17, 27],
      [17, 32, 25, 32],
      [5, 7, 6, 7],
      [16, 35, 21, 35],
      [11, 26, 15, 26],
      [9, 13, 10, 13],
      [21, 40, 27, 40],
      [8, 15, 14, 15],
      [13, 22, 15, 22],
    ]

    const listeFractions2 = [
      [47, 25, 51, 25],
      [9, 8, 11, 8],
      [15, 11, 19, 11],
      [14, 5, 17, 5],
      [9, 7, 15, 7],
      [16, 3, 22, 3],
      [53, 45, 71, 45],
      [49, 45, 52, 45],
      [18, 7, 23, 7],
      [45, 16, 51, 16],
      [19, 3, 25, 3],
      [14, 9, 19, 9],
      [50, 41, 55, 41],
      [53, 46, 59, 46],
      [15, 7, 27, 7],
      [17, 4, 21, 4],
      [19, 4, 25, 4],
      [10, 7, 27, 7],
      [13, 10, 12, 13],
      [27, 12, 35, 12],
      [21, 11, 25, 11],
      [14, 5, 11, 5],
      [7, 3, 11, 3],
    ]
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      const fraction1 = choice(listeFractions1)
      const fraction2 = choice(listeFractions2)
      const a = choice(
        [new FractionEtendue(fraction1[0], fraction1[1])],
        [new FractionEtendue(fraction1[2], fraction1[3])],
      )
      const b = choice(
        [new FractionEtendue(fraction2[0], fraction2[1])],
        [new FractionEtendue(fraction2[2], fraction2[3])],
      )
      if (choice([true, false])) {
        // plus petit que 1
        texte = remplisLesBlancs(
          this,
          i,
          `${a.texFraction}\\quad %{champ1} \\quad 1`,
          KeyboardType.clavierCompare,
        )
        this.correction = `Le numérateur de $${a.texFraction}$ est plus petit que le dénominateur de $${a.texFraction}$.<br>
          On en déduit :    $${a.texFraction} ${miseEnEvidence('<')} 1$.`
        this.reponse = '<'
        handleAnswers(this, i, {
          champ1: { value: '<', options: { texteSansCasse: true } },
        })
        this.canEnonce = 'Compléter avec $>$ ou $<$.'
        this.canReponseACompleter = `$${a.texFraction}$ $\\ldots$ $1$`
      } else {
        // plus grand que 1
        texte = remplisLesBlancs(
          this,
          i,
          `${b.texFraction}\\quad %{champ1} \\quad 1`,
          KeyboardType.clavierCompare,
        )
        this.correction = `Le numérateur de $${b.texFraction}$ est plus grand que le dénominateur de $${b.texFraction}$.<br>
            On en déduit :    $${b.texFraction} ${miseEnEvidence('>')} 1$.`
        handleAnswers(this, i, {
          champ1: { value: '>', options: { texteSansCasse: true } },
        })
        this.reponse = '>'
        this.canEnonce = 'Compléter avec $>$ ou $<$.'
        this.canReponseACompleter = `$${b.texFraction}$ $\\ldots$ $1$`
      }
      if (this.questionJamaisPosee(i, a.texFraction, b.texFraction)) {
        this.listeCorrections[i] = this.correction
        this.listeCanEnonces[i] = this.canEnonce
        this.listeCanReponsesACompleter[i] = this.canReponseACompleter
        if (context.isHtml) {
          this.listeQuestions[i] = texte
        } else {
          this.listeQuestions[i] = this.canReponseACompleter
        }
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
