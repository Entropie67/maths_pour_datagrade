import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  ajouteChampTexteMathLive,
  remplisLesBlancs,
} from '../../lib/interactif/questionMathLive'
import { shuffle } from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { range1, rangeMinMax } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Passer, de façon automatique, d'une valeur décimale à une valeur fractionnaire et réciproquement avec demis et quarts"
export const dateDePublication = '10/07/2025'
export const interactifReady = true

export const uuid = '297f9'
export const refs = {
  'fr-fr': ['6N3autoC', '6AutoF2-1', 'CM1N4C-1', 'CM2N4D-1'],
  'fr-2016': ['6N22-5'],
  'fr-ch': ['9R1NO4F-1', '9R2NO4F-1', '9R3NO4F-1', 'PRQNO11A-14'],
}

/** Passer, de façon automatique, d\'une valeur décimale à une valeur fractionnaire (et réciproquement) sur des valeurs simples
 * @author Éric Elter
 */

export default class DecimaleAFractionnaire extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 5

    this.besoinFormulaireNumerique = [
      'Valeurs à trouver',
      3,
      '1 : Fraction\n2 : Valeur décimale\n3 : Mélange',
    ]
    this.sup = 3
  }

  nouvelleVersion() {
    const unDemi = new FractionEtendue(1, 2).texFraction
    const unQuart = new FractionEtendue(1, 4).texFraction
    const troisQuarts = new FractionEtendue(3, 4).texFraction
    const troisDemis = new FractionEtendue(3, 2).texFraction
    const quatreDemis = new FractionEtendue(4, 2).texFraction
    const cinqDemis = new FractionEtendue(5, 2).texFraction

    this.consigne =
      this.sup === 1
        ? 'Compléter par un nombre décimal.'
        : this.sup === 2
          ? 'Compléter.'
          : ''

    const typeQuestions =
      this.sup === 1
        ? shuffle(range1(6))
        : this.sup === 2
          ? shuffle(rangeMinMax(7, 18))
          : shuffle(range1(18))

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse = ''
      switch (typeQuestions[i]) {
        case 1:
          texteCorr = `$${unDemi}=`
          reponse = texNombre(0.5)
          break

        case 2:
          texteCorr = `$${unQuart}=`
          reponse = texNombre(0.25)
          break

        case 3:
          texteCorr = `$${troisQuarts}=`
          reponse = texNombre(0.75)
          break

        case 4:
          texteCorr = `$${troisDemis}=`
          reponse = texNombre(1.5)
          break

        case 5:
          texteCorr = `$${quatreDemis}=`
          reponse = texNombre(2)
          break

        case 6:
          texteCorr = `$${cinqDemis}=`
          reponse = texNombre(2.5)
          break

        case 7:
          texteCorr = `$${texNombre(0.5)}=`
          texte =
            texteCorr +
            (this.interactif
              ? '$' +
                remplisLesBlancs(
                  this,
                  i,
                  '\\dfrac{%{champ1}}{2}',
                  KeyboardType.clavierNumbers,
                )
              : texFractionFromString('\\ldots', 2) + '$')
          reponse = '1'
          texteCorr += texFractionFromString(miseEnEvidence(reponse), 2) + '$'
          break

        case 8:
          texteCorr = `$${texNombre(0.5)}=`
          texte =
            texteCorr +
            (this.interactif
              ? '$' +
                remplisLesBlancs(
                  this,
                  i,
                  '\\dfrac{1}{%{champ1}}',
                  KeyboardType.clavierNumbers,
                )
              : texFractionFromString(1, '\\ldots') + '$')
          reponse = '2'
          texteCorr += texFractionFromString(1, miseEnEvidence(reponse)) + '$'
          break

        case 9:
          texteCorr = `$${texNombre(0.25)}=`
          texte =
            texteCorr +
            (this.interactif
              ? '$' +
                remplisLesBlancs(
                  this,
                  i,
                  '\\dfrac{%{champ1}}{4}',
                  KeyboardType.clavierNumbers,
                )
              : texFractionFromString('\\ldots', 4) + '$')
          reponse = '1'
          texteCorr += texFractionFromString(miseEnEvidence(reponse), 4) + '$'
          break

        case 10:
          texteCorr = `$${texNombre(0.25)}=`
          texte =
            texteCorr +
            (this.interactif
              ? '$' +
                remplisLesBlancs(
                  this,
                  i,
                  '\\dfrac{1}{%{champ1}}',
                  KeyboardType.clavierNumbers,
                )
              : texFractionFromString(1, '\\ldots') + '$')
          reponse = '4'
          texteCorr += texFractionFromString(1, miseEnEvidence(reponse)) + '$'
          break

        case 11:
          texteCorr = `$${texNombre(0.75)}=`
          texte =
            texteCorr +
            (this.interactif
              ? '$' +
                remplisLesBlancs(
                  this,
                  i,
                  '\\dfrac{%{champ1}}{4}',
                  KeyboardType.clavierNumbers,
                )
              : texFractionFromString('\\ldots', 4) + '$')
          reponse = '3'
          texteCorr += texFractionFromString(miseEnEvidence(reponse), 4) + '$'
          break

        case 12:
          texteCorr = `$${texNombre(0.75)}=`
          texte =
            texteCorr +
            (this.interactif
              ? '$' +
                remplisLesBlancs(
                  this,
                  i,
                  '\\dfrac{3}{%{champ1}}',
                  KeyboardType.clavierNumbers,
                )
              : texFractionFromString(3, '\\ldots') + '$')
          reponse = '4'
          texteCorr += texFractionFromString(3, miseEnEvidence(reponse)) + '$'
          break

        case 13:
          texteCorr = `$${texNombre(1.5)}=`
          texte =
            texteCorr +
            (this.interactif
              ? '$' +
                remplisLesBlancs(
                  this,
                  i,
                  '\\dfrac{%{champ1}}{2}',
                  KeyboardType.clavierNumbers,
                )
              : texFractionFromString('\\ldots', 2) + '$')
          reponse = '3'
          texteCorr += texFractionFromString(miseEnEvidence(reponse), 2) + '$'
          break

        case 14:
          texteCorr = `$${texNombre(1.5)}=`
          texte =
            texteCorr +
            (this.interactif
              ? '$' +
                remplisLesBlancs(
                  this,
                  i,
                  '\\dfrac{3}{%{champ1}}',
                  KeyboardType.clavierNumbers,
                )
              : texFractionFromString(3, '\\ldots') + '$')
          reponse = '2'
          texteCorr += texFractionFromString(3, miseEnEvidence(reponse)) + '$'
          break

        case 15:
          texteCorr = `$${texNombre(2)}=`
          texte =
            texteCorr +
            (this.interactif
              ? '$' +
                remplisLesBlancs(
                  this,
                  i,
                  '\\dfrac{%{champ1}}{2}',
                  KeyboardType.clavierNumbers,
                )
              : texFractionFromString('\\ldots', 2) + '$')
          reponse = '4'
          texteCorr += texFractionFromString(miseEnEvidence(reponse), 2) + '$'
          break

        case 16:
          texteCorr = `$${texNombre(2)}=`
          texte =
            texteCorr +
            (this.interactif
              ? '$' +
                remplisLesBlancs(
                  this,
                  i,
                  '\\dfrac{4}{%{champ1}}',
                  KeyboardType.clavierNumbers,
                )
              : texFractionFromString(4, '\\ldots') + '$')
          reponse = '2'
          texteCorr += texFractionFromString(4, miseEnEvidence(reponse)) + '$'
          break

        case 17:
          texteCorr = `$${texNombre(2.5)}=`
          texte =
            texteCorr +
            (this.interactif
              ? '$' +
                remplisLesBlancs(
                  this,
                  i,
                  '\\dfrac{%{champ1}}{2}',
                  KeyboardType.clavierNumbers,
                )
              : texFractionFromString('\\ldots', 2) + '$')
          reponse = '5'
          texteCorr += texFractionFromString(miseEnEvidence(reponse), 2) + '$'
          break

        case 18:
          texteCorr = `$${texNombre(2.5)}=`
          texte =
            texteCorr +
            (this.interactif
              ? '$' +
                remplisLesBlancs(
                  this,
                  i,
                  '\\dfrac{5}{%{champ1}}',
                  KeyboardType.clavierNumbers,
                )
              : texFractionFromString(5, '\\ldots') + '$')
          reponse = '2'
          texteCorr += texFractionFromString(5, miseEnEvidence(reponse)) + '$'
          break
      }

      if (this.questionJamaisPosee(i, typeQuestions[i + 1])) {
        if (typeQuestions[i] < 7) {
          if (this.sup !== 1) {
            texte = 'Compléter par un nombre décimal : '
          }
          texte +=
            texteCorr +
            (this.interactif
              ? '$' +
                ajouteChampTexteMathLive(this, i, KeyboardType.clavierNumbers)
              : '\\ldots$')

          handleAnswers(this, i, {
            reponse: {
              value: reponse,
              options: { nombreDecimalSeulement: true },
            },
          })
          texteCorr += `${miseEnEvidence(reponse)}$`
        } else {
          if (this.sup !== 2) {
            texte = 'Compléter  : ' + texte
          }
          handleAnswers(
            this,
            i,
            { champ1: { value: reponse } },
            { formatInteractif: 'fillInTheBlank' },
          )
        }
        if (this.sup !== 1 && this.sup !== 2) {
          texte += '.'
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
