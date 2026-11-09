import { texNombre } from '../../../src/lib/outils/texNombre'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import {
  choice,
  combinaisonListes,
  shuffle,
} from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Amplifier ou simplifier une fraction'
export const dateDePublication = '14/03/2024'
export const interactifReady = true

export const uuid = '0e77e'
export const refs = {
  'fr-ch': ['9R1NO4D-4', '9R2NO4D-4', '9R3NO4D-4', 'PRQNO10B-1'],
  'fr-fr': [],
}

/**
 *
 * @author Rémi Angot & Nathan Scheinmann
 */

export default class AmplifierOuReduireFraction extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 6
    this.sup = 3
    this.besoinFormulaireNumerique = [
      'Type de questions',
      3,
      '1 : Amplifier\n2 : Simplifier\n3 : Mélange',
    ]
  }

  nouvelleVersion() {
    let typeQuestionsDisponibles: ('amplifier' | 'simplifier')[]
    if (this.sup === 1) {
      typeQuestionsDisponibles = ['amplifier']
    } else if (this.sup === 2) {
      typeQuestionsDisponibles = ['simplifier']
    } else {
      typeQuestionsDisponibles = shuffle([
        'amplifier',
        'simplifier',
        'amplifier',
        'simplifier',
      ])
    }

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    const a = randint(2, 12)
    const b = randint(2, 12, a)
    const c = randint(2, 12, [a, b])
    const multipleDe10 = choice([20, 30, 40])
    this.comment =
      'Dans cet exercice, le numérateur et le dénominateur de la fraction réduite sont choisis entre 2 et 12 et le coefficient multiplicateur est choisi entre 2-12 ou 20, 30 et 40.'
    const coefficients = combinaisonListes(
      [multipleDe10, a, b, c],
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      const num = randint(1, 12)
      const den = randint(2, 12, num)
      const k = coefficients[i]
      switch (listeTypeQuestions[i]) {
        case 'amplifier':
          texte = `Amplifier la fraction $\\dfrac{${num}}{${den}}$ par $${texNombre(k, 0)}$`
          texteCorr = `La fraction $\\dfrac{${num}}{${den}}$ amplifiée par $${texNombre(k, 0)}$ donne $\\dfrac{${num} \\times ${k}}{${den} \\times ${k}}=${miseEnEvidence(`\\dfrac{${num * k}}{${den * k}}`)}$.`
          if (this.interactif) {
            texte +=
              '<br>' +
              remplisLesBlancs(
                this,
                i,
                `\\dfrac{${num}}{${den}} = \\dfrac{%{champ1}}{%{champ2}}`,
              )
            handleAnswers(
              this,
              i,
              {
                bareme: (listePoints: number[]) => [
                  Math.min(listePoints[0], listePoints[1]),
                  1,
                ],
                champ1: { value: String(k * num) },
                champ2: { value: String(k * den) },
              },
              { formatInteractif: 'fillInTheBlank' },
            )
          } else {
            texte += '.'
          }
          break
        case 'simplifier':
          texte = `Simplifier la fraction $\\dfrac{${num * k}}{${den * k}}$ par $${texNombre(k, 0)}$`
          texteCorr = `La fraction $\\dfrac{${num * k}}{${den * k}}$ simplifiée par $${texNombre(k, 0)}$ donne $\\dfrac{${num * k} \\div ${k}}{${den * k} \\div ${k}}=${miseEnEvidence(`\\dfrac{${num}}{${den}}`)}$.`
          if (this.interactif) {
            texte +=
              '<br>' +
              remplisLesBlancs(
                this,
                i,
                `\\dfrac{${num * k}}{${den * k}} = \\dfrac{%{champ1}}{%{champ2}}`,
              )
            handleAnswers(
              this,
              i,
              {
                bareme: (listePoints: number[]) => [
                  Math.min(listePoints[0], listePoints[1]),
                  1,
                ],
                champ1: { value: String(num) },
                champ2: { value: String(den) },
              },
              { formatInteractif: 'fillInTheBlank' },
            )
          } else {
            texte += '.'
          }
          break
      }

      if (this.questionJamaisPosee(i, num, den, k)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
