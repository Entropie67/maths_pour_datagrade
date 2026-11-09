import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import {
  ajouteChampTexteMathLive,
  remplisLesBlancs,
} from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { texFractionFromString } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { range1, rangeMinMax } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Passer, de façon automatique, d'une valeur décimale à une valeur fractionnaire et réciproquement sur des valeurs simples"

export const dateDePublication = '27/04/2026'
export const interactifReady = true

export const uuid = 'adfb1'
export const refs = {
  'fr-fr': ['6N3autoC-1', '6AutoF2-2', 'CM1N4C-2', 'CM2N4D-2'],
  'fr-2016': [''],
  'fr-ch': ['9R1NO4F-2', '9R2NO4F-2', '9R3NO4F-2', 'PRQNO11A-15'],
}

/** Relier valeurs décimales et fractions dans ces cas simples (demis, quarts, cinquièmes, dixièmes, et "petits" numérateurs)
 * @author Mireille Gain, sappuyant sur 6N3autoC
 */

export default class DecimaleAFractionnaireBasique extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 6
    this.besoinFormulaireNumerique = [
      'Valeurs à trouver',
      3,
      '1 : Fraction\n2 : Valeur décimale\n3 : Mélange',
    ]
    this.sup = 3
    this.spacing = 2.5
    this.spacingCorr = 2.5
  }

  nouvelleVersion() {
    const unDemi = new FractionEtendue(1, 2).texFraction
    const unQuart = new FractionEtendue(1, 4).texFraction
    const troisQuarts = new FractionEtendue(3, 4).texFraction
    const unDixieme = new FractionEtendue(1, 10).texFraction
    const troisDixiemes = new FractionEtendue(3, 10).texFraction
    const septDixiemes = new FractionEtendue(7, 10).texFraction
    const unCinquieme = new FractionEtendue(1, 5).texFraction
    const deuxCinquiemes = new FractionEtendue(2, 5).texFraction
    const troisCinquiemes = new FractionEtendue(3, 5).texFraction
    const quatreCinquiemes = new FractionEtendue(4, 5).texFraction

    this.consigne =
      this.sup === 1
        ? 'Compléter par un nombre décimal.'
        : this.sup === 2
          ? 'Compléter.'
          : ''

    let typeQuestions =
      this.sup === 1 ? shuffle(range1(6)) : shuffle(rangeMinMax(7, 18))
    if (this.sup === 3) {
      // Je veux qu'il y ait autant de questions 1 à 6 que 7 à 18
      const sousTypeQuestions = combinaisonListes(
        [true, false],
        this.nbQuestions,
      )
      const nbTrue = sousTypeQuestions.filter((v) => v).length
      const nbFalse = this.nbQuestions - nbTrue
      const liste1to6 = combinaisonListes(range1(6), nbTrue)
      const liste7to18 = combinaisonListes(rangeMinMax(7, 18), nbFalse)
      typeQuestions = []
      let index1to6 = 0
      let index7to18 = 0
      for (let i = 0; i < this.nbQuestions; i++) {
        if (sousTypeQuestions[i]) {
          typeQuestions.push(liste1to6[index1to6])
          index1to6++
        } else {
          typeQuestions.push(liste7to18[index7to18])
          index7to18++
        }
      }
    }

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let reponse = ''
      const k = choice([2, 3, 4])
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
          if (k === 2) {
            texteCorr = `$${unDixieme}=`
            reponse = texNombre(0.1)
          } else if (k === 3) {
            texteCorr = `$${troisDixiemes}=`
            reponse = texNombre(0.3)
          } else if (k === 4) {
            texteCorr = `$${septDixiemes}=`
            reponse = texNombre(0.7)
          }
          break

        case 5:
          texteCorr = `$${unCinquieme}=`
          reponse = texNombre(0.2)
          break

        case 6:
          if (k === 2) {
            texteCorr = `$${deuxCinquiemes}=`
            reponse = texNombre(0.4)
          } else if (k === 3) {
            texteCorr = `$${troisCinquiemes}=`
            reponse = texNombre(0.6)
          } else if (k === 4) {
            texteCorr = `$${quatreCinquiemes}=`
            reponse = texNombre(0.8)
          }
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
          if (k === 2) {
            texteCorr = `$${texNombre(0.1)}=`
            texte =
              texteCorr +
              (this.interactif
                ? '$' +
                  remplisLesBlancs(
                    this,
                    i,
                    '\\dfrac{%{champ1}}{10}',
                    KeyboardType.clavierNumbers,
                  )
                : texFractionFromString('\\ldots', 10) + '$')
            reponse = '1'
            texteCorr +=
              texFractionFromString(miseEnEvidence(reponse), 10) + '$'
          } else if (k === 3) {
            texteCorr = `$${texNombre(0.3)}=`
            texte =
              texteCorr +
              (this.interactif
                ? '$' +
                  remplisLesBlancs(
                    this,
                    i,
                    '\\dfrac{%{champ1}}{10}',
                    KeyboardType.clavierNumbers,
                  )
                : texFractionFromString('\\ldots', 10) + '$')
            reponse = '3'
            texteCorr +=
              texFractionFromString(miseEnEvidence(reponse), 10) + '$'
          } else if (k === 4) {
            texteCorr = `$${texNombre(0.7)}=`
            texte =
              texteCorr +
              (this.interactif
                ? '$' +
                  remplisLesBlancs(
                    this,
                    i,
                    '\\dfrac{%{champ1}}{10}',
                    KeyboardType.clavierNumbers,
                  )
                : texFractionFromString('\\ldots', 10) + '$')
            reponse = '7'
            texteCorr +=
              texFractionFromString(miseEnEvidence(reponse), 10) + '$'
          }
          break

        case 14:
          if (k === 2) {
            texteCorr = `$${texNombre(0.1)}=`
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
            reponse = '10'
            texteCorr += texFractionFromString(1, miseEnEvidence(reponse)) + '$'
          } else if (k === 3) {
            texteCorr = `$${texNombre(0.3)}=`
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
            reponse = '10'
            texteCorr += texFractionFromString(3, miseEnEvidence(reponse)) + '$'
          } else if (k === 4) {
            texteCorr = `$${texNombre(0.7)}=`
            texte =
              texteCorr +
              (this.interactif
                ? '$' +
                  remplisLesBlancs(
                    this,
                    i,
                    '\\dfrac{7}{%{champ1}}',
                    KeyboardType.clavierNumbers,
                  )
                : texFractionFromString(7, '\\ldots') + '$')
            reponse = '10'
            texteCorr += texFractionFromString(7, miseEnEvidence(reponse)) + '$'
          }
          break

        case 15:
          texteCorr = `$${texNombre(0.2)}=`
          texte =
            texteCorr +
            (this.interactif
              ? '$' +
                remplisLesBlancs(
                  this,
                  i,
                  '\\dfrac{%{champ1}}{5}',
                  KeyboardType.clavierNumbers,
                )
              : texFractionFromString('\\ldots', 5) + '$')
          reponse = '1'
          texteCorr += texFractionFromString(miseEnEvidence(reponse), 5) + '$'
          break

        case 16:
          texteCorr = `$${texNombre(0.2)}=`
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
          reponse = '5'
          texteCorr += texFractionFromString(1, miseEnEvidence(reponse)) + '$'
          break

        case 17:
          if (k === 2) {
            texteCorr = `$${texNombre(0.4)}=`
            texte =
              texteCorr +
              (this.interactif
                ? '$' +
                  remplisLesBlancs(
                    this,
                    i,
                    '\\dfrac{%{champ1}}{5}',
                    KeyboardType.clavierNumbers,
                  )
                : texFractionFromString('\\ldots', 5) + '$')
            reponse = '2'
            texteCorr += texFractionFromString(miseEnEvidence(reponse), 5) + '$'
          } else {
            if (k === 3) {
              texteCorr = `$${texNombre(0.6)}=`
              texte =
                texteCorr +
                (this.interactif
                  ? '$' +
                    remplisLesBlancs(
                      this,
                      i,
                      '\\dfrac{%{champ1}}{5}',
                      KeyboardType.clavierNumbers,
                    )
                  : texFractionFromString('\\ldots', 5) + '$')
              reponse = '3'
              texteCorr +=
                texFractionFromString(miseEnEvidence(reponse), 5) + '$'
            } else {
              if (k === 4) {
                texteCorr = `$${texNombre(0.8)}=`
                texte =
                  texteCorr +
                  (this.interactif
                    ? '$' +
                      remplisLesBlancs(
                        this,
                        i,
                        '\\dfrac{%{champ1}}{5}',
                        KeyboardType.clavierNumbers,
                      )
                    : texFractionFromString('\\ldots', 5) + '$')
                reponse = '4'
                texteCorr +=
                  texFractionFromString(miseEnEvidence(reponse), 5) + '$'
              }
            }
          }
          break

        case 18:
          if (k === 2) {
            texteCorr = `$${texNombre(0.4)}=`
            texte =
              texteCorr +
              (this.interactif
                ? '$' +
                  remplisLesBlancs(
                    this,
                    i,
                    '\\dfrac{2}{%{champ1}}',
                    KeyboardType.clavierNumbers,
                  )
                : texFractionFromString(2, '\\ldots') + '$')
            reponse = '5'
            texteCorr += texFractionFromString(2, miseEnEvidence(reponse)) + '$'
          } else if (k === 3) {
            texteCorr = `$${texNombre(0.6)}=`
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
            reponse = '5'
            texteCorr += texFractionFromString(3, miseEnEvidence(reponse)) + '$'
          } else if (k === 4) {
            texteCorr = `$${texNombre(0.8)}=`
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
            reponse = '5'
            texteCorr += texFractionFromString(4, miseEnEvidence(reponse)) + '$'
          }
          break
      }

      if (this.questionJamaisPosee(i, typeQuestions[i])) {
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
