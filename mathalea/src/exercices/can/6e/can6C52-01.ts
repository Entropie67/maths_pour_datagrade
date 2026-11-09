import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { listeQuestionsToContenu } from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre = 'Comparer des fractions de même dénominateur/numérateur'
export const interactifReady = true

export const dateDePublication = '04/11/2022'
/**
 * @author Gilles Mora
 */

export const uuid = '99b96'

export const refs = {
  'fr-fr': ['can6C52-01', '6N3I-flash1', '5N3autoF-4'],
  'fr-ch': [],
}
export default class ComparerFraction extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireNumerique = [
      'Choix du dénominateur',
      3,
      [
        '1 : Même dénominateur',
        '2 : Même numérateur',
        "3 : L'un ou l'autre",
      ].join('\n'),
    ]
    this.spacingCorr = 1.5
    this.sup = 3
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
      [10, 13, 12, 13],
      [27, 12, 35, 12],
      [21, 11, 25, 11],
      [11, 5, 14, 5],
      [7, 3, 11, 3],
    ]
    let a, b, fraction1
    const typeDeQuestionsDisponibles =
      this.sup === 1
        ? combinaisonListes([1], this.nbQuestions)
        : this.sup === 2
          ? combinaisonListes([2], this.nbQuestions)
          : combinaisonListes([1, 2], this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      switch (typeDeQuestionsDisponibles[i]) {
        case 1: // même dénominateur
          fraction1 = choice(listeFractions1)
          a = new FractionEtendue(
            Math.min(fraction1[0], fraction1[2]),
            fraction1[1],
          )
          b = new FractionEtendue(
            Math.max(fraction1[0], fraction1[2]),
            fraction1[1],
          )

          if (choice([true, false])) {
            texte = remplisLesBlancs(
              this,
              i,
              `${a.texFraction} \\quad %{champ1} \\quad ${b.texFraction}`,
              KeyboardType.clavierCompare,
            )
            handleAnswers(this, i, {
              champ1: { value: '<', options: { texteSansCasse: true } },
            })

            this.correction = `Les deux fractions ont le même dénominateur, la plus grande est celle qui a le plus grand numérateur.<br>
          Ainsi, $${a.texFraction}${miseEnEvidence(' < ')}${b.texFraction}$.`
            this.reponse = '<'
            this.canEnonce = 'Compléter avec $>$ ou $<$.'
            this.canReponseACompleter = `$${a.texFraction}$ $\\ldots$ $${b.texFraction}$`
          } else {
            texte = remplisLesBlancs(
              this,
              i,
              `${b.texFraction} \\quad %{champ1} \\quad ${a.texFraction}`,
              KeyboardType.clavierCompare,
            )
            handleAnswers(this, i, {
              champ1: { value: '>', options: { texteSansCasse: true } },
            })
            this.correction = `Les deux fractions ont le même dénominateur, la plus grande est celle qui a le plus grand numérateur.<br>
          Ainsi, $${b.texFraction}${miseEnEvidence(' > ')}${a.texFraction}$.`
            this.reponse = '>'
            this.canEnonce = 'Compléter avec $>$ ou $<$.'
            this.canReponseACompleter = `$${b.texFraction}$ $\\ldots$ $${a.texFraction}$`
          }
          break

        case 2: // même numérateur
        default:
          fraction1 = choice(listeFractions1)
          a = new FractionEtendue(
            fraction1[1],
            Math.min(fraction1[0], fraction1[2]),
          )
          b = new FractionEtendue(
            fraction1[1],
            Math.max(fraction1[0], fraction1[2]),
          )

          if (choice([true, false])) {
            texte = remplisLesBlancs(
              this,
              i,
              `${a.texFraction} \\quad %{champ1} \\quad ${b.texFraction}`,
              KeyboardType.clavierCompare,
            )
            handleAnswers(this, i, {
              champ1: { value: '>', options: { texteSansCasse: true } },
            })
            this.correction = `Les deux fractions ont le même numérateur, la plus grande est celle qui a le plus petit dénominateur.<br>
         Ainsi, $${a.texFraction} ${miseEnEvidence('>')} ${b.texFraction}$.`
            this.reponse = '>'
            this.canEnonce = 'Compléter avec $>$ ou $<$.'
            this.canReponseACompleter = `$${a.texFraction}$ $\\ldots$ $${b.texFraction}$`
          } else {
            texte = remplisLesBlancs(
              this,
              i,
              `${b.texFraction} \\quad %{champ1} \\quad ${a.texFraction}`,
              KeyboardType.clavierCompare,
            )
            handleAnswers(this, i, {
              champ1: { value: '<', options: { texteSansCasse: true } },
            })
            this.correction = `Les deux fractions ont le même numérateur, la plus grande est celle qui a le plus petit dénominateur.<br>
          Ainsi, $${b.texFraction} ${miseEnEvidence('<')} ${a.texFraction}$.`
            this.reponse = '<'
            this.canEnonce = 'Compléter avec $>$ ou $<$.'
            this.canReponseACompleter = `$${b.texFraction}$ $\\ldots$ $${a.texFraction}$`
          }
          break
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
