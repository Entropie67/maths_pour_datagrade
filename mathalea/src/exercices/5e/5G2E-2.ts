import { arc } from '../../lib/2d/Arc'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { rotation } from '../../lib/2d/transformations'
import { pointAdistance } from '../../lib/2d/utilitairesPoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { miseEnEvidenceAvecUnite } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const titre = 'Calculer périmètre et aire de portions de disques'
export const dateDeModifImportante = '23/01/2025'

/**
 * 3 figures sont données, 1 quart de disque, un demi-disque et un 3-quarts de disque
 * * 1 : Calculer les périmètres
 * * 2 : Calculer les aires
 * * 3 : Calculer les périmètres et aires
 * @author Rémi Angot
 */
export const uuid = 'ff387'

export const refs = {
  'fr-fr': ['5G2E-2', 'BP1AUTO110'],
  'fr-2016': ['6M22-2', '5M11-4'],
  'fr-ch': ['10LCGM1B-2', '10LSGM1B-2', 'PRQMG01C-4'],
}
export default class PerimetreAireEtPortionsDeDisques extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      '1 : Périmètres\n2 : Aires\n3 : Les deux',
    ]
    this.besoinFormulaire2Texte = [
      'Type de figures',
      'Nombres séparés par des tirets :\n1 : Quart de disque\n2 : Demi-disque\n3 : Trois quarts de disque\n4 : Mélange',
    ]

    this.sup = 3 // 1 : périmètre, 2 : aire, 3 : périmètres et aires
    this.sup2 = 4
    this.spacing = 2
    this.spacingCorr = context.isHtml ? 3 : 2
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    if (this.sup === 1) {
      this.consigne = 'Calculer le périmètre de'
    } else if (this.sup === 2) {
      this.consigne = "Calculer l'aire de"
    } else {
      this.consigne = "Calculer le périmètre et l'aire de"
    }
    this.consigne +=
      this.nbQuestions === 1
        ? ' la figure suivante.'
        : ' chacune des figures suivantes.'

    for (let i = 0, cpt = 0, texteCorr; i < this.nbQuestions && cpt < 50;) {
      texteCorr = ''
      const objetsEnonce = []
      const C = pointAbstrait(0, 0)
      let r = randint(2, 10)

      const A = pointAdistance(C, listeTypeQuestions[i] === 3 ? 3 : 6, 0)
      const B1 = rotation(A, C, 90)
      const B2 = rotation(A, C, 180)
      const B3 = rotation(A, C, 270)
      const quartDeDisque = arc(A, C, 90, true, 'white', 'black', 0.2)
      const demiDisque = arc(A, C, 180, true, 'white', 'black', 0.2)
      const troisQuartDeDisque = arc(A, C, 270, true, 'white', 'black', 0.2)
      let reponseL1: number, reponseA1: number, reponseL1bis, reponseA1bis
      const questions: string[] = []
      const reponses: [number, number][] = []
      const textesApres: string[] = []
      switch (listeTypeQuestions[i]) {
        case 1:
          if (this.sup !== 2) {
            // si on ne demande pas les aires
            texteCorr = `La figure est un quart de disque, son périmètre est composé d'un quart de cercle de rayon $${r}\\text{ cm}$ et de $2$ rayons qui ferment la figure.<br>`
            texteCorr += `$\\mathcal{P}_1=(\\dfrac{1}{4}\\times2\\times${r}\\times\\pi)+${r}+${r}=
    ${miseEnEvidenceAvecUnite(`${texNombre(r / 2, 1)}\\pi+${2 * r}`, '\\text{ cm}', this.interactif)}
    \\approx
    ${miseEnEvidenceAvecUnite(`${texNombre((r * Math.PI) / 2 + 2 * r, 1)}`, '\\text{ cm}', this.interactif)}$<br>`
            reponseL1 =
              this.sup === 2
                ? 0
                : arrondi(Math.trunc(((r * Math.PI) / 2 + 2 * r) * 10) / 10)
            reponseL1bis = this.sup === 2 ? 0 : arrondi(reponseL1 + 0.1)
          }

          if (this.sup !== 1) {
            texteCorr += `La figure est un quart de disque de rayon $${r}\\text{ cm}$.<br>`
            texteCorr += `$\\mathcal{A}_1=\\dfrac{1}{4}\\times${r}\\times${r}\\times\\pi=
      ${miseEnEvidenceAvecUnite(`${texNombre((r * r) / 4, 2)}\\pi`, '\\text{ cm}^2', this.interactif)}
      \\approx
      ${miseEnEvidenceAvecUnite(`${texNombre(((r * r) / 4) * Math.PI, 1)}`, '\\text{ cm}^2', this.interactif)}$<br>`
            reponseA1 =
              this.sup === 1
                ? 0
                : arrondi(Math.trunc(((r * r) / 4) * Math.PI * 10) / 10)
            reponseA1bis = this.sup === 1 ? 0 : arrondi(reponseA1 + 0.1)
          }
          objetsEnonce.push(
            quartDeDisque,
            codageSegments(
              '//',
              context.isHtml ? bleuMathalea : 'black',
              A,
              C,
              C,
              B1,
            ),
            placeLatexSurSegment(`${r}\\text{ cm}`, A, C),
          )
          break
        case 2: {
          const rayon = r
          r = r / 2
          if (this.sup !== 2) {
            // si on ne demande pas les aires
            texteCorr = `La figure est un demi-disque, son périmètre est composé d'un demi-cercle de diamètre $${
              2 * r
            }\\text{ cm}$ et d'un diamètre qui ferme la figure.<br>`
            texteCorr += `$\\mathcal{P}_2=\\dfrac{1}{2}\\times${
              2 * r
            }\\times\\pi+${2 * r}=
                ${miseEnEvidenceAvecUnite(`${r}\\pi+${2 * r}`, '\\text{ cm}', this.interactif)}
                \\approx
                ${miseEnEvidenceAvecUnite(`${texNombre(r * Math.PI + 2 * r, 1)}`, '\\text{ cm}', this.interactif)}$<br>`
            reponseL1 =
              this.sup === 2
                ? 0
                : arrondi(Math.trunc((r * Math.PI + 2 * r) * 10) / 10)
            reponseL1bis = this.sup === 2 ? 0 : arrondi(reponseL1 + 0.1)
          }

          if (this.sup !== 1) {
            texteCorr += `La figure est la moitié d'un disque de diamètre $${
              2 * r
            }\\text{ cm}$ donc de $${r}\\text{ cm}$ de rayon.<br>`
            texteCorr += `$\\mathcal{A}_2=\\dfrac{1}{2}\\times${r}\\times${r}\\times\\pi=
                ${miseEnEvidenceAvecUnite(`${texNombre((r * r) / 2, 2)}\\pi`, '\\text{ cm}^2', this.interactif)}
                \\approx
                ${miseEnEvidenceAvecUnite(`${texNombre(((r * r) / 2) * Math.PI, 1)}`, '\\text{ cm}^2', this.interactif)}$<br>`
            reponseA1 =
              this.sup === 1
                ? 0
                : arrondi(Math.trunc(((r * r) / 2) * Math.PI * 10) / 10)
            reponseA1bis = this.sup === 1 ? 0 : arrondi(reponseA1 + 0.1)
          }
          objetsEnonce.push(
            demiDisque,
            placeLatexSurSegment(`${rayon}\\text{ cm}`, A, B2),
          )
          break
        }
        case 3:
        default:
          if (this.sup !== 2) {
            texteCorr = `La figure est un trois-quarts de disque, son périmètre est composé de trois quarts d'un cercle de rayon $${r}\\text{ cm}$ et $2$ rayons qui ferment la figure.<br>`
            texteCorr += `$\\mathcal{P}_3=\\dfrac{3}{4}\\times2\\times${r}\\times\\pi+${r}+${r}=
            ${miseEnEvidenceAvecUnite(`${texNombre((6 * r) / 4, 2)}\\pi+${2 * r}`, '\\text{ cm}', this.interactif)}
            \\approx
            ${miseEnEvidenceAvecUnite(`${texNombre(((6 * r) / 4) * Math.PI + 2 * r, 1)}`, '\\text{ cm}', this.interactif)}$<br>`
            reponseL1 =
              this.sup === 2
                ? 0
                : arrondi(
                    Math.trunc((((6 * r) / 4) * Math.PI + 2 * r) * 10) / 10,
                  )
            reponseL1bis = this.sup === 2 ? 0 : arrondi(reponseL1 + 0.1)
          }

          if (this.sup !== 1) {
            texteCorr += `La figure est un trois-quarts de disque de rayon $${r}\\text{ cm}$.<br>`
            texteCorr += `$\\mathcal{A}_3=\\dfrac{3}{4}\\times${r}\\times${r}\\times\\pi=
            ${miseEnEvidenceAvecUnite(`${texNombre((3 * r * r) / 4, 2)}\\pi`, '\\text{ cm}^2', this.interactif)}
            \\approx
            ${miseEnEvidenceAvecUnite(`${texNombre(((3 * r * r) / 4) * Math.PI, 1)}`, '\\text{ cm}^2', this.interactif)}$<br>`
            reponseA1 =
              this.sup === 1
                ? 0
                : arrondi(Math.trunc(((3 * r * r) / 4) * Math.PI * 10) / 10)
            reponseA1bis = this.sup === 1 ? 0 : arrondi(reponseA1 + 0.1)
          }
          objetsEnonce.push(
            troisQuartDeDisque,
            codageSegments(
              'O',
              context.isHtml ? 'green' : 'black',
              A,
              C,
              C,
              B3,
            ),
            placeLatexSurSegment(`${r}\\text{ cm}`, A, C),
          )
          break
      }
      if (this.sup !== 2) {
        questions.push(
          'Valeur approchée au dixième de $\\text{cm}$ du périmètre : ',
        )
        reponses.push([reponseL1!, reponseL1bis!])
        textesApres.push('$\\text{cm}$')
      }
      if (this.sup > 1) {
        questions.push(
          "Valeur approchée au dixième de $\\text{cm}^2$ de l'aire : ",
        )
        reponses.push([reponseA1!, reponseA1bis!])
        textesApres.push('$\\text{cm}^2$')
      }

      if (this.questionJamaisPosee(i, r, listeTypeQuestions[i])) {
        // Si la question n'a jamais été posée, on en créé une autre
        const figure = mathalea2d(
          Object.assign(
            { zoom: 1, scale: 0.6 },
            fixeBordures(objetsEnonce, { rymax: 0, rymin: -0.5 }),
          ),
          objetsEnonce,
        )
        const dataTemplate = questions
          .map(
            (q, j) =>
              `${this.sup2 === 3 ? String.fromCharCode(97 + j) + ')' : ''} ${q} %{champ${j + 1}} ${textesApres[j]}`,
          )
          .join('\n')
        const dataOptions = Object.fromEntries(
          reponses.map((r, j) => [
            `champ${j + 1}`,
            { keyboard: KeyboardType.clavierNumbers, ldots: true },
          ]),
        )
        handleAnswers(
          this,
          i,
          {
            bareme: toutAUnPoint,
            ...Object.fromEntries(
              reponses.map((r, j) => [`champ${j + 1}`, { value: r }]),
            ),
          },
          { formatInteractif: 'multi-mathfield' },
        )

        this.listeQuestions[i] =
          figure + addMultiMathfield(this, i, { dataTemplate, dataOptions })
        this.listeCorrections[i] = texteCorr

        if (context.isAmc) {
          if (this.sup === 1) {
            this.autoCorrectionAMC[i] = {
              enonce: '',
              propositions: [
                {
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: texteCorr,
                      reponse: {
                        texte:
                          'Calculer le périmètre de la figure suivante.<br>' +
                          figure +
                          '<br>Périmètre en $\\text{cm}$ (valeur approchée à 0,1 près)',
                        valeur: [reponseL1!],
                        alignement: 'center',
                        param: {
                          digits: 1,
                          signe: false,
                          decimals: 1,
                          aussiCorrect: reponseL1bis,
                        },
                      },
                    },
                  ],
                },
              ],
            }
            this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
          } else if (this.sup === 2) {
            this.autoCorrectionAMC[i] = {
              enonce: '',
              propositions: [
                {
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: texteCorr,
                      reponse: {
                        texte:
                          "Calculer l'aire de la figure suivante.<br>" +
                          figure +
                          '<br>Aire en $\\text{cm}^2$ (valeur approchée à 0,1 près)',
                        valeur: [reponseA1!],
                        alignement: 'center',
                        param: {
                          digits: 1,
                          signe: false,
                          decimals: 1,
                          aussiCorrect: reponseA1bis,
                        },
                      },
                    },
                  ],
                },
              ],
            }
            this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
          } else {
            this.autoCorrectionAMC[i] = {
              enonce:
                'Calculer le périmètre de la figure suivante.<br>' + figure,
              enonceAvant: false,
              enonceApresNumQuestion: true,
              options: { barreseparation: true },
              propositions: [
                {
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: texteCorr,
                      multicolsBegin: true,
                      reponse: {
                        texte:
                          'Périmètre en $\\text{cm}$ (valeur approchée à 0,1 près)',
                        valeur: [reponseL1!],
                        alignement: 'center',
                        param: {
                          digits: 1,
                          signe: false,
                          decimals: 1,
                          aussiCorrect: reponseL1bis,
                        },
                      },
                    },
                  ],
                },
                {
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: texteCorr,
                      multicolsEnd: true,
                      reponse: {
                        texte:
                          'Aire en $\\text{cm}^2$ (valeur approchée à 0,1 près)',
                        valeur: [reponseA1!],
                        alignement: 'center',
                        param: {
                          digits: 1,
                          signe: false,
                          decimals: 1,
                          aussiCorrect: reponseA1bis,
                        },
                      },
                    },
                  ],
                },
              ],
            }
            this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
          }
        }

        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
