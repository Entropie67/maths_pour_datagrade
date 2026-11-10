import type { MathfieldElement } from 'mathlive'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import type { IExercice } from '../../lib/types'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Connaître les tables de multiplication «\u00a0à l'envers\u00a0»"
export const dateDePublication = '4/4/2024'
export const interactifReady = true

export const uuid = 'ac64a'
export const refs = {
  'fr-fr': ['6N3autoD-6, 5N1autoC', '5N3autoA-2', '5N4autoA-2'],
  'fr-2016': ['6C10-9'],
  'fr-ch': ['9R1NO6A-6', '9R2NO6A-6', '9R3NO6A-6'],
}

/**
 * @author Rémi Angot
 */

export default class nomExercice extends Exercice {
  constructor() {
    super()

    this.sup = '3-4-5-6-7-8-9'
    this.sup2 = 9
    this.comment =
      'Le multiplicande est issu des tables choisies et le multiplicateur est compris entre 2 et la valeur maximale ci-dessus (qui doit être au moins 5).'
    this.besoinFormulaireTexte = [
      'Tables de multiplication (séparées par un tiret)',
      '',
    ]
    this.besoinFormulaire2Numerique = ['Valeur maximale du multiplicande', 99]
  }

  nouvelleVersion() {
    this.consigne = 'Compléter avec deux nombres entiers différents de $1$.'

    const tables = gestionnaireFormulaireTexte({
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
      defaut: 9,
      max: 99,
      min: 2,
      melange: 0,
      enleveDoublons: true,
    }) as number[]
    const facteurMax = Number(this.sup2) > 5 ? Number(this.sup2) : 5
    const facteurs1 = combinaisonListes(tables, this.nbQuestions)
    const facteurs2 = Array.from({ length: facteurMax - 1 }, (_, i) => i + 2)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const a = facteurs1[i]
      const b = choice(facteurs2)
      let texte = ''
      if (context.isDiaporama) {
        this.consigne = ''
      }
      if (this.interactif) {
        texte = remplisLesBlancs(
          this,
          i,
          `${a * b}= ~ %{champ1} ~ \\times ~~ %{champ2}`,
          KeyboardType.clavierNumbers as string,
        )
        handleAnswers(this, i, {
          // bareme: (listePoints) => [listePoints[0] * listePoints[1] + listePoints[2], 2],
          champ1: { value: a },
          champ2: { value: b },
          callback: (exercice: IExercice, question: number) => {
            let feedback = ''
            const mfe = document.querySelector(
              `#champTexteEx${exercice.numeroExercice}Q${question}`,
            ) as MathfieldElement
            if (mfe == null)
              return {
                isOk: false,
                feedback,
                score: { nbBonnesReponses: 0, nbReponses: 0 },
              }
            const saisie1 = (mfe.getPromptValue('champ1') || '').trim()
            const saisie2 = (mfe.getPromptValue('champ2') || '').trim()
            const spanReponseLigne = document.querySelector(
              `#resultatCheckEx${exercice.numeroExercice}Q${question}`,
            )
            if (saisie1 === '' || saisie2 === '') {
              // Une zone vide est une absence de réponse, pas un zéro :
              // on ne produit pas le feedback « n'est pas égal à 0 × 0 ».
              const sansReponse = saisie1 === '' && saisie2 === ''
              if (spanReponseLigne != null) {
                spanReponseLigne.innerHTML = '☹️'
              }
              return {
                isOk: false,
                feedback: sansReponse
                  ? ''
                  : 'Il faut compléter les deux zones avec des nombres entiers différents de 1.',
                score: {
                  nbBonnesReponses: 0,
                  nbReponses: 1,
                },
              }
            }
            // La saisie MathLive est du LaTeX : « 0,5 » arrive sous la forme « 0{,}5 ».
            const versNombre = (saisie: string) =>
              Number(saisie.replace(/\\,|\s|[{}]/g, '').replace(',', '.'))
            const facteur1 = versNombre(saisie1)
            const facteur2 = versNombre(saisie2)
            const isOk =
              facteur1 * facteur2 === a * b && facteur1 !== 1 && facteur2 !== 1
            if (!Number.isInteger(facteur1) || !Number.isInteger(facteur2)) {
              mfe.setPromptState('champ1', 'incorrect', false)
              mfe.setPromptState('champ2', 'incorrect', false)
              if (spanReponseLigne != null) spanReponseLigne.innerHTML = '☹️'
              return {
                isOk: false,
                feedback:
                  'Attention, il faut utiliser des nombres entiers différents de 1.',
                score: { nbBonnesReponses: 0, nbReponses: 1 },
              }
            }
            if (isOk) {
              mfe.setPromptState('champ1', 'correct', true)
              mfe.setPromptState('champ2', 'correct', true)
            } else {
              if ((a * b) % facteur1 === 0 && facteur1 !== 1) {
                mfe.setPromptState('champ1', 'correct', true)
                mfe.setPromptState('champ2', 'incorrect', false)
              } else if ((a * b) % facteur2 === 0 && facteur2 !== 1) {
                mfe.setPromptState('champ1', 'incorrect', false)
                mfe.setPromptState('champ2', 'correct', true)
              } else {
                mfe.setPromptState('champ1', 'incorrect', false)
                mfe.setPromptState('champ2', 'incorrect', false)
              }
              feedback =
                facteur1 * facteur2 === a * b
                  ? 'Attention, il faut utiliser des nombres entiers différents de 1.'
                  : `Attention, ${a * b} n'est pas égal à ${facteur1} × ${facteur2}.`
            }
            if (spanReponseLigne != null) {
              spanReponseLigne.innerHTML = isOk ? '😎' : '☹️'
            }
            return {
              isOk,
              feedback,
              score: { nbBonnesReponses: isOk ? 1 : 0, nbReponses: 1 },
            }
          },
        })
      } else {
        texte = `$${a * b}= \\ldots\\ldots \\times \\ldots\\ldots$`
      }
      const texteCorr = `$${a * b}=${miseEnEvidence(String(a))} \\times ${miseEnEvidence(String(b))}$`

      if (this.questionJamaisPosee(i, a * b)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
