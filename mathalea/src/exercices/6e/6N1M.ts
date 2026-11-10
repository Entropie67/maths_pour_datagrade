import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi, nombreDeChiffresDe } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { amcConvert } from '../../lib/amc/amcBuilders'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { bleuMathalea } from '../../lib/colors'

export const dateDePublication = '28/09/2022'
export const titre = 'Encadrer un décimal'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
/**
 * * Encadrer_un_decimal_selon_une_precision_donnée
 * @author Mickael Guironnet (rendu AMC par Éric Elter)
 */

export const refs = {
  'fr-fr': ['6N1M'],
  'fr-2016': ['6N31-5'],
  'fr-ch': ['PR-42', '9R1NO2D-7', '9R2NO2D-7', '9R3NO2D-7', 'PRQNO05A-7'],
}
export const uuid = 'a8c22'
export default class EncadrerUnDecimal extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        "1 : Encadrer à l'unité",
        '2 : Encadrer au dixième',
        '3 : Encadrer au centième',
        '4 : Mélange',
      ].join('\n'),
    ]
    this.sup = 4 // Type de questions
    this.nbQuestions = 4
    this.consigneCorrection = 'Encadrer'

    this.spacing = 1.5
    this.spacingCorr = context.isHtml ? 1.2 : 1.5
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      max: 3,
      defaut: 4,
      melange: 4,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
    })

    for (
      let i = 0,
        texte,
        typesDeQuestions,
        texteCorr,
        reponseMin,
        reponseMax,
        cpt = 0;
      i < this.nbQuestions && cpt < 50;
      cpt++
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]
      const m = randint(1, 9)
      const c = randint(1, 9)
      const d = randint(1, 9)
      const u = typesDeQuestions === 1 ? randint(7, 9) : randint(1, 9)
      const di = typesDeQuestions === 2 ? randint(7, 9) : randint(1, 9)
      const ci = typesDeQuestions === 3 ? randint(7, 9) : randint(1, 9)
      const mi = randint(1, 9)

      if (!this.questionJamaisPosee(i, m, c, u, di, ci, mi)) {
        continue
      }

      switch (typesDeQuestions) {
        case 3: {
          // encadrement au centième
          reponseMin =
            m * 1000 + c * 100 + d * 10 + u * 1 + arrondi(di * 0.1 + ci * 0.01)
          reponseMax =
            m * 1000 +
            c * 100 +
            d * 10 +
            u * 1 +
            arrondi(di * 0.1 + (ci + 1) * 0.01)
          texte = `Encadrer $${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + arrondi(di * 0.1 + ci * 0.01 + mi * 0.001))}$ au centième.<br>`
          if (!context.isAmc) {
            texte += remplisLesBlancs(
              this,
              i,
              `%{champ1}~<~${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + arrondi(di * 0.1 + ci * 0.01 + mi * 0.001))}~<~%{champ2}`,
              'fillInTheBlank',
            )
          } else if (context.isAmc) {
            texte +=
              'Ainsi :' +
              sp(15) +
              `$a~<~${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + arrondi(di * 0.1 + ci * 0.01 + mi * 0.001))}~<~b$`
          }

          if (!context.isAmc)
            handleAnswers(this, i, {
              champ1: { value: reponseMin },
              champ2: { value: reponseMax },
            })

          const nombreStr = texNombre(
            m * 1000 +
              c * 100 +
              d * 10 +
              u * 1 +
              arrondi(di * 0.1 + 0 * 0.01 + mi * 0.001),
          ).replace('0', miseEnEvidence(ci, bleuMathalea))
          texteCorr = `au centième${sp()}: $ ${miseEnEvidence(texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + arrondi(di * 0.1 + ci * 0.01)))} < ${nombreStr} < ${miseEnEvidence(texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + arrondi(di * 0.1 + (ci + 1) * 0.01)))}$`
          break
        }
        case 2: {
          // encadrement au dixième
          reponseMin = m * 1000 + c * 100 + d * 10 + u * 1 + arrondi(di * 0.1)
          texte = `Encadrer $${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + arrondi(di * 0.1 + ci * 0.01 + mi * 0.001))}$ au dixième.<br>`
          if (!context.isAmc) {
            texte += remplisLesBlancs(
              this,
              i,
              `%{champ1} < ${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + arrondi(di * 0.1 + ci * 0.01 + mi * 0.001))} < %{champ2}`,
            )
          } else if (context.isAmc) {
            texte +=
              'Ainsi :' +
              sp(15) +
              `$a < ${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + arrondi(di * 0.1 + ci * 0.01 + mi * 0.001))} < b$`
          }
          reponseMax =
            m * 1000 + c * 100 + d * 10 + u * 1 + arrondi((di + 1) * 0.1)
          if (!context.isAmc)
            handleAnswers(this, i, {
              champ1: { value: reponseMin },
              champ2: { value: reponseMax },
            })

          const nombreStr = texNombre(
            m * 1000 +
              c * 100 +
              d * 10 +
              u * 1 +
              arrondi(0 * 0.1 + ci * 0.01 + mi * 0.001),
          ).replace('0', miseEnEvidence(di, bleuMathalea))
          texteCorr = `au dixième${sp()}: $ ${miseEnEvidence(texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + arrondi(di * 0.1)))} < ${nombreStr} < ${miseEnEvidence(texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + arrondi((di + 1) * 0.1)))}$`
          break
        }
        case 1:
        default: {
          // encadrement à l'unité
          reponseMin = m * 1000 + c * 100 + d * 10 + u * 1
          texte = `Encadrer $${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + arrondi(di * 0.1 + ci * 0.01 + mi * 0.001))}$ à l'unité.<br>`
          if (!context.isAmc) {
            texte += remplisLesBlancs(
              this,
              i,
              `%{champ1} < ${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + arrondi(di * 0.1 + ci * 0.01 + mi * 0.001))} < %{champ2}`,
            )
          } else if (context.isAmc) {
            texte +=
              'Ainsi :' +
              sp(15) +
              `$a < ${texNombre(m * 1000 + c * 100 + d * 10 + u * 1 + arrondi(di * 0.1 + ci * 0.01 + mi * 0.001))} < b$`
          }
          reponseMax = m * 1000 + c * 100 + d * 10 + (u + 1) * 1
          if (!context.isAmc)
            handleAnswers(this, i, {
              champ1: { value: reponseMin },
              champ2: { value: reponseMax },
            })

          const nombreStr = texNombre(
            m * 1000 +
              c * 100 +
              d * 10 +
              u * 0 +
              arrondi(di * 0.1 + ci * 0.01 + mi * 0.001),
          ).replace('0', miseEnEvidence(u, bleuMathalea))
          texteCorr = `à l'unité${sp()}: $ ${miseEnEvidence(texNombre(m * 1000 + c * 100 + d * 10 + u * 1))} < ${nombreStr} < ${miseEnEvidence(texNombre(m * 1000 + c * 100 + d * 10 + (u + 1) * 1))}$`
          break
        }
      }
      if (context.isAmc) {
        this.autoCorrectionAMC[i] = {
          enonceAvant: false,
          options: { multicols: true },
          propositions: [
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: texteCorr,
                  reponse: {
                    texte: texte + `<br>Valeur de a${sp()}:`,
                    valeur: reponseMin,
                    param: {
                      signe: false,
                      digits: nombreDeChiffresDe(reponseMin) + 2,
                      decimals: 3,
                    },
                  },
                },
              ],
            },
            {
              type: 'AMCNum',
              propositions: [
                {
                  texte: '',
                  reponse: {
                    texte: `Valeur de b${sp()}:`,
                    valeur: reponseMax,
                    param: {
                      signe: false,
                      digits: nombreDeChiffresDe(reponseMax) + 2,
                      decimals: 3,
                    },
                  },
                },
              ],
            },
          ],
        }
        this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
      }
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
      i++
    }
    listeQuestionsToContenu(this)
  }
}
