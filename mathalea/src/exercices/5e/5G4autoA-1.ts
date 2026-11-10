import { KeyboardType } from '../../lib/interactif/claviers/keyboard'

import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true
export const dateDePublication = '17/08/2024'

export const titre =
  "Calculer des mesures d'angles adjacents, supplémentaires ou complémentaires"
export const uuid = 'ed9f4'
export const refs = {
  'fr-fr': ['5G4autoA-1', '3AutoG03-2'],
  'fr-2016': ['5G30-0', '3AutoG03-2'],
  'fr-ch': ['1mG1-6', '11LCES1A-3', '11LSES1A-3'],
}
/**
 * Utiliser le vocabulaire complémentaires et supplémentaires pour qualifier des paires d'angles ou calculer des mesures d'angles
 * @author Jean-claude Lhote
 */
export default class AnglesEtVocabulaire extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    this.besoinFormulaireTexte = [
      'Type de questions',
      'Nombres séparés par des tirets  :\n1 : Qcm vocabulaire\n2 : Calculer le complémentaire\n3 : Calculer le supplémentaire\n4 : Mélange',
    ]
    this.sup = '4'
  }

  nouvelleVersion() {
    const listeTypesDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      defaut: 4,
      melange: 4,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0; i < this.nbQuestions;) {
      let a = randint(21, 79, [30, 40, 50, 60, 70])
      let b: number
      let texte: string
      let texteCorr: string
      let goodAnswer: string
      switch (listeTypesDeQuestions[i]) {
        case 1:
          {
            const choix = randint(1, 3)
            switch (choix) {
              case 1: // ni l'un ni l'autre
                b = choice([
                  90 - a + 10,
                  90 - a - 10,
                  180 - a + 110,
                  180 - a - 10,
                ])
                goodAnswer = 'aucun'
                break
              case 2: // complémentaires
                b = 90 - a
                goodAnswer = 'complémentaires'
                break
              default: // supplémentaires
                b = 180 - a
                goodAnswer = 'supplémentaires'
            }
            texte = `Les angles $\\widehat{xOy}$ et $\\widehat{yOz}$ sont adjacents.<br>
            L'angle $\\widehat{xOy}$ mesure $${a}^\\circ$ et l'angle $\\widehat{yOz}$ mesure $${b}^\\circ$.<br>
            Que sont-ils l'un pour l'autre ?`
            this.autoCorrection[i] = {
              propositions: [
                {
                  texte: 'complémentaires',
                  statut: goodAnswer === 'complémentaires',
                },
                {
                  texte: 'supplémentaires',
                  statut: goodAnswer === 'supplémentaires',
                },
                {
                  texte: "ni l'un, ni l'autre",
                  statut: goodAnswer === 'aucun',
                },
              ],
              options: {
                ordered: true,
              },
            }
            const monQcm = propositionsQcm(this, i)
            texte += monQcm.texte
            texteCorr = `$\\widehat{xOy}+\\widehat{yOz}=${a}^\\circ+${b}^\\circ=${a + b}^\\circ$.<br>`
            if (goodAnswer === 'complémentaires') {
              texteCorr +=
                `Les deux angles sont ${texteEnCouleurEtGras('complémentaires')} car leurs côtés non communs forment un angle droit.`
            } else if (goodAnswer === 'supplémentaires') {
              texteCorr +=
                `Les deux angles sont ${texteEnCouleurEtGras('supplémentaires')} car leurs côtés non communs forment un angle plat.`
            } else {
              texteCorr +=
                `Les deux angles ${texteEnCouleurEtGras('ne sont ni complémentaires ni supplémentaires')} car leurs côtés non communs ne forment ni un angle droit, ni un angle plat.`
            }
          }
          break
        case 2:
          b = 90 - a
          texte = `Les angles $\\widehat{xOy}$ et $\\widehat{yOz}$ sont adjacents.<br>
          L'angle $\\widehat{xOy}$ mesure $${a}^\\circ$.<br>
          Combien mesure l'angle $\\widehat{yOz}$ s'ils sont complémentaires l'un de l'autre ?`
          texteCorr = `Deux angles adjacents complémentaires sont deux angles dont les côtés non communs forment un angle droit.<br>
          Alors $\\widehat{yOz}=90^\\circ-${a}^\\circ=${miseEnEvidence(`${String(90 - a)}^\\circ`)}$.`
          goodAnswer = `${90 - a}^\\circ`
          break

        default:
          a = 2 * a + choice([0, 1]) // Ainsi, on peut avoir a>90
          b = 180 - a
          texte = `Les angles $\\widehat{xOy}$ et $\\widehat{yOz}$ sont adjacents.<br>
          L'angle $\\widehat{xOy}$ mesure $${a}^\\circ$.<br>
          Combien mesure l'angle $\\widehat{yOz}$ s'ils sont supplémentaires l'un de l'autre ?`
          texteCorr = `Deux angles adjacents supplémentaires sont deux angles dont les côtés non communs forment un angle plat.
          Alors $\\widehat{yOz}=180^\\circ-${a}^\\circ=${miseEnEvidence(`${String(180 - a)}^\\circ`)}$.`
          goodAnswer = `${180 - a}^\\circ`
          break
      }
      if (this.questionJamaisPosee(i, a, b, listeTypesDeQuestions[i])) {
        if (listeTypesDeQuestions[i] !== 1) {
          texte += ajouteChampTexteMathLive(
            this,
            i,
            ` ${KeyboardType.nombresEtDegre}`,
            { texteApres: '<em class="ml-2">(Une unité est attendue.)</em>' },
          )
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        if (listeTypesDeQuestions[i] !== 1) {
          handleAnswers(this, i, {
            reponse: {
              value: goodAnswer,
              options: { unite: true },
            },
          })
        }
        i++
      }
    }
  }
}
