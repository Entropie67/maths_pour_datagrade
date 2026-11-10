import { arc } from '../../lib/2d/Arc'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { rotation } from '../../lib/2d/transformations'
import { pointAdistance } from '../../lib/2d/utilitairesPoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { miseEnEvidence } from '../../lib/outils/embellissements'
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
export const uuid = 'ff386'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': [],
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

    for (
      let i = 0, cpt = 0, texte, texteCorr;
      i < this.nbQuestions && cpt < 50;
    ) {
      texte = ''
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
      switch (listeTypeQuestions[i]) {
        case 1:
          if (this.sup !== 2) {
            // si on ne demande pas les aires
            texteCorr = `La figure est un quart de disque, son périmètre est composé d'un quart de cercle de rayon $${r}$ cm et de $2$ rayons qui ferment la figure.<br>`
            texteCorr += `$\\mathcal{P}_1=(\\dfrac{1}{4}\\times2\\times${r}\\times\\pi)+${r}+${r}=
    ${miseEnEvidence(`${texNombre(r / 2, 1)}\\pi+${2 * r}`)}\\text{ cm}
    \\approx
    ${miseEnEvidence(`${texNombre((r * Math.PI) / 2 + 2 * r, 1)}`)}\\text{ cm}$<br>`
            reponseL1 =
              this.sup === 2
                ? 0
                : arrondi(Math.trunc(((r * Math.PI) / 2 + 2 * r) * 10) / 10)
            reponseL1bis = this.sup === 2 ? 0 : arrondi(reponseL1 + 0.1)
          }

          if (this.sup !== 1) {
            texteCorr += `La figure est un quart de disque de rayon $${r}$ cm.<br>`
            texteCorr += `$\\mathcal{A}_1=\\dfrac{1}{4}\\times${r}\\times${r}\\times\\pi=
      ${miseEnEvidence(`${texNombre((r * r) / 4, 2)}\\pi`)}\\text{ cm}^2
      \\approx
      ${miseEnEvidence(`${texNombre(((r * r) / 4) * Math.PI, 1)}`)}\\text{ cm}^2$<br>`
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
            }$ cm et d'un diamètre qui ferme la figure.<br>`
            texteCorr += `$\\mathcal{P}_2=\\dfrac{1}{2}\\times${
              2 * r
            }\\times\\pi+${2 * r}=
                ${miseEnEvidence(`${r}\\pi+${2 * r}`)}\\text{ cm}
                \\approx
                ${miseEnEvidence(`${texNombre(r * Math.PI + 2 * r, 1)}`)}\\text{ cm}$<br>`
            reponseL1 =
              this.sup === 2
                ? 0
                : arrondi(Math.trunc((r * Math.PI + 2 * r) * 10) / 10)
            reponseL1bis = this.sup === 2 ? 0 : arrondi(reponseL1 + 0.1)
          }

          if (this.sup !== 1) {
            texteCorr += `La figure est la moitié d'un disque de diamètre $${
              2 * r
            }$ cm donc de $${r}$ cm de rayon.<br>`
            texteCorr += `$\\mathcal{A}_2=\\dfrac{1}{2}\\times${r}\\times${r}\\times\\pi=
                ${miseEnEvidence(`${texNombre((r * r) / 2, 2)}\\pi`)}\\text{ cm}^2
                \\approx
                ${miseEnEvidence(`${texNombre(((r * r) / 2) * Math.PI, 1)}`)}\\text{ cm}^2$<br>`
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
            texteCorr = `La figure est trois quarts d'un disque, son périmètre est composé de trois quarts d'un cercle de rayon $${r}$ cm et $2$ rayons qui ferment la figure.<br>`
            texteCorr += `$\\mathcal{P}_3=\\dfrac{3}{4}\\times2\\times${r}\\times\\pi+${r}+${r}=
            ${miseEnEvidence(`${texNombre((6 * r) / 4, 2)}\\pi+${2 * r}`)}\\text{ cm}
            \\approx
            ${miseEnEvidence(`${texNombre(((6 * r) / 4) * Math.PI + 2 * r, 1)}`)}\\text{ cm}$<br>`
            reponseL1 =
              this.sup === 2
                ? 0
                : arrondi(
                    Math.trunc((((6 * r) / 4) * Math.PI + 2 * r) * 10) / 10,
                  )
            reponseL1bis = this.sup === 2 ? 0 : arrondi(reponseL1 + 0.1)
          }

          if (this.sup !== 1) {
            texteCorr += `La figure est trois quarts d'un disque de rayon $${r}$ cm.<br>`
            texteCorr += `$\\mathcal{A}_3=\\dfrac{3}{4}\\times${r}\\times${r}\\times\\pi=
            ${miseEnEvidence(`${texNombre((3 * r * r) / 4, 2)}\\pi`)}\\text{ cm}^2
            \\approx
            ${miseEnEvidence(`${texNombre(((3 * r * r) / 4) * Math.PI, 1)}`)}\\text{ cm}^2$<br>`
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
        handleAnswers(this, this.sup === 3 ? 2 * i : i, {
          reponse: { value: [reponseL1!, reponseL1bis!] },
        })
        texte =
          'Valeur approchée au dixième de $\\text{cm}$ du périmètre : ' +
          ajouteChampTexteMathLive(
            this,
            this.sup === 3 ? 2 * i : i,
            KeyboardType.clavierNumbers,
            {
              texteApres: ' $\\text{cm}$',
            },
          ) +
          '<br>'
      }
      if (this.sup !== 1) {
        handleAnswers(this, this.sup === 3 ? 2 * i + 1 : i, {
          reponse: { value: [reponseA1!, reponseA1bis!] },
        })
        texte +=
          "Valeur approchée au dixième de $\\text{cm}^2$ de l'aire : " +
          ajouteChampTexteMathLive(
            this,
            this.sup === 3 ? 2 * i + 1 : i,
            KeyboardType.clavierNumbers,
            { texteApres: ' $\\text{cm}^2$' },
          )
      }

      if (this.questionJamaisPosee(i, r)) {
        // Si la question n'a jamais été posée, on en créé une autre
        const figure = mathalea2d(
          Object.assign(
            { zoom: 1, scale: 0.6 },
            fixeBordures(objetsEnonce, { rymax: 0, rymin: -0.5 }),
          ),
          objetsEnonce,
        )
        this.listeQuestions[i] = figure + texte
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
