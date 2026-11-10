import { afficheLongueurSegment } from '../../lib/2d/afficheLongueurSegment'
import { cercle } from '../../lib/2d/cercle'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latexParPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { rotation } from '../../lib/2d/transformations'
import { pointAdistance } from '../../lib/2d/utilitairesPoint'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { sp } from '../../lib/outils/outilString'
import { stringNombre, texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Calculer périmètre et/ou aire de disques'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '20/11/2023'

/**
 * 4 cercles sont tracés, 2 dont on connaît le rayon et 2 dont on connaît le diamètre.
 * * 1 : Calculer le périmètre de cercles
 * * 2 : Calculer l'aire de disques
 * * 3 : Calculer le périmètre et l'aire de disques
 * @author Rémi Angot (AMC par EE)
 */
export const uuid = 'f9a02'

export const refs = {
  'fr-fr': [],
  'fr-2016': [],
  'fr-ch': [],
}

/**
 * Fonctions diverses pour la création des exercices
 * @module
 */
export default class PerimetreAireDisques extends Exercice {
  constructor(pa = 3) {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      3,
      '1 : Périmètres\n2 : Aires\n3 : Périmètres et aires',
    ]
    this.besoinFormulaire2CaseACocher = ['Rayon et diamètre entiers', true]
    this.besoinFormulaire3Numerique = [
      'Valeur approchée et/ou exacte',
      4,
      '1 : Que la valeur approchée\n2 : Que la valeur exacte\n3 : Une valeur approchée ou la valeur exacte\n4 : Une valeur approchée et la valeur exacte',
    ]
    this.besoinFormulaire4Numerique = [
      'Rayon ou diamètre',
      3,
      '1 : Que des rayons\n2 : Que des diamètres\n3 : Mélange',
    ]

    this.sup = pa // 1 : périmètre, 2 : aire, 3 : périmètres et aires
    this.sup2 = true // rayon ou périmètre entier
    this.sup3 = 4
    this.sup4 = 3
    this.spacing = 2
    this.spacingCorr = 2
    this.nbQuestions = 4
  }

  nouvelleVersion() {
    for (
      let i = 0,
        cpt = 0,
        r,
        A,
        C,
        M,
        B,
        S,
        texte,
        texteCorr,
        reponseL1,
        reponseL2,
        reponseA1,
        reponseA2,
        reponseL2bis,
        reponseA2bis;
      i < this.nbQuestions && cpt < 50;
    ) {
      const choixValeurApprochee =
        this.sup3 === 1 || this.sup3 === 4
          ? true
          : this.sup3 === 2
            ? false
            : choice([true, false])
      const choixValeurExacte =
        this.sup3 === 2 || this.sup3 === 4
          ? true
          : this.sup3 === 1
            ? false
            : !choixValeurApprochee
      r = this.sup2
        ? randint(2, 9)
        : arrondi(randint(2, 8) + randint(1, 9) / 10, 1)
      A = pointAbstrait(r + 0.5, r + 0.5)
      C = cercle(A, r)
      M = pointAdistance(A, r)
      B = rotation(M, A, 180)
      if ((this.sup4 === 3 && i % 2 === 0) || this.sup4 === 1) {
        S = segment(A, M)
      } else {
        S = segment(M, B)
      }
      S.pointilles = 2
      texte = mathalea2d(
        {
          xmin: 0,
          ymin: 0,
          xmax: 2 * r + 1,
          ymax: 2 * r + 1,
          pixelsParCm: arrondi(50 / r),
          scale: arrondi(2.4 / r, 2),
        },
        C,
        tracePoint(A),
        S,
        afficheLongueurSegment(S.extremite1, S.extremite2),
        latexParPoint(
          '\\mathcal{C}_1',
          pointAdistance(A, 1.25 * r, 135),
          'black',
          20,
          0,
          '',
        ),
      )

      if (this.sup === 1) {
        this.consigne =
          this.nbQuestions > 1
            ? 'Calculer le périmètre (en $\\text{cm}$) des disques suivants.'
            : 'Calculer le périmètre (en $\\text{cm}$) du disque suivant.'
      } else if (this.sup === 2) {
        this.consigne =
          this.nbQuestions > 1
            ? "Calculer l'aire (en $\\text{cm}^2$) des disques suivants."
            : "Calculer l'aire (en $\\text{cm}^2$) du disque suivant."
      } else {
        this.consigne =
          this.nbQuestions > 1
            ? "Calculer le périmètre (en $\\text{cm}$) et l'aire (en $\\text{cm}^2$) des disques suivants."
            : "Calculer le périmètre (en $\\text{cm}$) et l'aire (en $\\text{cm}^2$) du disque suivant."
      }
      reponseL1 = this.sup === 2 ? 0 : arrondi(2 * r, 2)
      reponseL2 =
        this.sup === 2 ? 0 : arrondi(Math.trunc(2 * r * Math.PI * 10) / 10)
      reponseL2bis = this.sup === 2 ? 0 : arrondi(reponseL2 + 0.1)
      reponseA1 = this.sup === 1 ? 0 : arrondi(r * r, 2)
      reponseA2 =
        this.sup === 1 ? 0 : arrondi(Math.trunc(r * r * Math.PI * 10) / 10)
      reponseA2bis = this.sup === 1 ? 0 : arrondi(reponseA2 + 0.1)

      switch (this.sup3) {
        case 1:
          this.consigne +=
            '<br> On donnera une valeur approchée au dixième près '
          if (this.sup === 1) {
            this.consigne += 'de $\\text{cm}$.'
          } else if (this.sup === 2) {
            this.consigne += 'de $\\text{cm}^2$.'
          } else {
            this.consigne += 'des unités respectives ci-dessus.'
          }
          break
        case 2:
          this.consigne += '<br> On donnera la valeur exacte.'
          break
        case 3:
          this.consigne +=
            '<br> On donnera la valeur exacte ou une valeur approchée au dixième près '
          if (this.sup === 1) {
            this.consigne += 'de $\\text{cm}$.'
          } else if (this.sup === 2) {
            this.consigne += 'de $\\text{cm}^2$.'
          } else {
            this.consigne += 'des unités respectives ci-dessus.'
          }
          break
        case 4:
        default:
          this.consigne +=
            '<br> On donnera la valeur exacte puis une valeur approchée au dixième près '
          if (this.sup === 1) {
            this.consigne += 'de $\\text{cm}$.'
          } else if (this.sup === 2) {
            this.consigne += 'de $\\text{cm}^2$.'
          } else {
            this.consigne += 'des unités respectives ci-dessus.'
          }
          break
      }

      texteCorr =
        this.sup === 2
          ? ''
          : `$\\mathcal{P}_1=${i % 2 === 0 ? '2\\times' + texNombre(r) : texNombre(2 * r)}\\times \\pi=${texNombre(
              2 * r,
            )}\\pi\\approx${texNombre(
              arrondi(2 * r * Math.PI, 2),
            )}${sp()}\\text{cm}$<br>`
      texteCorr +=
        this.sup === 2
          ? ''
          : (this.sup3 !== 1
              ? `La valeur exacte du périmètre de ce disque est $${miseEnEvidence(`${texNombre(2 * r)}\\pi`)}${sp()}\\text{cm}$.<br>`
              : '') +
            (this.sup3 !== 2
              ? `Les valeurs approchées au dixième de $\\text{cm}$ du périmètre de ce disque sont $${miseEnEvidence(texNombre(reponseL2))}${sp()}\\text{cm}$ et $${miseEnEvidence(texNombre(reponseL2bis))}${sp()}\\text{cm}$.<br>`
              : '')
      texteCorr +=
        this.sup === 1
          ? ''
          : (this.sup === 3 ? '<br>' : '') +
            `$\\mathcal{A}_1=${i % 2 === 0 ? texNombre(r) + '\\times' + texNombre(r) : '\\dfrac{' + texNombre(2 * r) + '}{2}\\times \\dfrac{' + texNombre(2 * r) + '}{2}'}\\times \\pi=${texNombre(
              r * r,
            )}\\pi\\approx${texNombre(
              arrondi(r * r * Math.PI, 2),
            )}${sp()}\\text{cm}^2$<br>`
      texteCorr +=
        this.sup === 1
          ? ''
          : (this.sup3 !== 1
              ? `La valeur exacte de l'aire de ce disque est $${miseEnEvidence(`${texNombre(r * r)}\\pi`)}${sp()}\\text{cm}^2$.<br>`
              : '') +
            (this.sup3 !== 2
              ? `Les valeurs approchées au dixième de $\\text{cm}^2$ de l'aire de ce disque sont $${miseEnEvidence(texNombre(reponseA2))}${sp()}\\text{cm}^2$ et $${miseEnEvidence(texNombre(reponseA2bis))}${sp()}\\text{cm}^2$.<br>`
              : '')

      if (
        this.questionJamaisPosee(
          i,
          r,
          this.sup,
          this.sup2,
          this.sup3,
          this.sup4,
        )
      ) {
        if (this.sup === 1) {
          if (context.isHtml && this.interactif) {
            if (choixValeurExacte) {
              handleAnswers(
                this,
                this.sup3 === 4 ? 2 * i : i,
                {
                  reponse: {
                    value: [
                      stringNombre(reponseL1) + '\\pi',
                      stringNombre(reponseL1) + '\\times\\pi',
                      '\\pi\\times' + stringNombre(reponseL1),
                    ],
                    options: { texteAvecCasse: true },
                  },
                },
                { formatInteractif: 'mathlive' },
              )
              texte +=
                'Valeur exacte du périmètre : ' +
                ajouteChampTexteMathLive(
                  this,
                  this.sup3 === 4 ? 2 * i : i,
                  KeyboardType.clavierNumbers,
                  { texteApres: ' $\\text{cm}$' },
                )
            }
            if (choixValeurApprochee) {
              handleAnswers(
                this,
                this.sup3 === 4 ? 2 * i + 1 : i,
                { reponse: { value: [reponseL2, reponseL2bis] } },
                { formatInteractif: 'mathlive' },
              )
              texte +=
                (this.sup3 === 4 ? '<br>' : '') +
                'Valeur approchée du périmètre : ' +
                ajouteChampTexteMathLive(
                  this,
                  this.sup3 === 4 ? 2 * i + 1 : i,
                  KeyboardType.clavierNumbers,
                  { texteApres: ' $\\text{cm}$' },
                )
            }
          } else {
            this.autoCorrectionAMC[i] = {
              enonce: '',
              options: { multicolsAll: true, barreseparation: true },
              propositions: [
                {
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: texteCorr,
                      reponse: {
                        texte:
                          'Calculer le périmètre du cercle suivant :<br>' +
                          texte +
                          '<br>Périmètre en cm (valeur exacte en nombre de $\\pi$)',
                        valeur: [reponseL1],
                        param: {
                          digits: this.sup2 ? 2 : 3,
                          decimals: this.sup2 ? 0 : 1,
                          signe: false,
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
                      reponse: {
                        texte: 'Périmètre en cm (valeur approchée à 0,1 près)',
                        valeur: [reponseL2],
                        param: {
                          digits: this.sup2 ? 3 : 4,
                          signe: false,
                          decimals: 1,
                          aussiCorrect: reponseL2bis,
                        },
                      },
                    },
                  ],
                },
              ],
            }
            this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
          }
        } else if (this.sup === 2) {
          if (context.isHtml && this.interactif) {
            if (choixValeurExacte) {
              handleAnswers(
                this,
                this.sup3 === 4 ? 2 * i : i,
                {
                  reponse: {
                    value: [
                      stringNombre(reponseA1) + '\\pi',
                      stringNombre(reponseA1) + '\\times\\pi',
                      '\\pi\\times' + stringNombre(reponseA1),
                    ],
                    options: { texteAvecCasse: true },
                  },
                },
                { formatInteractif: 'mathlive' },
              )
              texte +=
                "Valeur exacte de l'aire : " +
                ajouteChampTexteMathLive(
                  this,
                  this.sup3 === 4 ? 2 * i : i,
                  KeyboardType.clavierNumbers,
                  { texteApres: '$\\text{ cm}^2$' },
                )
            } else if (choixValeurApprochee) {
              handleAnswers(
                this,
                this.sup3 === 4 ? 2 * i + 1 : i,
                { reponse: { value: [reponseA2, reponseA2bis] } },
                { formatInteractif: 'mathlive' },
              )
              texte +=
                (this.sup3 === 4 ? '<br>' : '') +
                "Valeur approchée de l'aire : " +
                ajouteChampTexteMathLive(
                  this,
                  this.sup3 === 4 ? 2 * i + 1 : i,
                  KeyboardType.clavierNumbers,
                  { texteApres: '$\\text{ cm}^2$' },
                )
            }
          } else {
            this.autoCorrectionAMC[i] = {
              enonce: '',
              options: { multicolsAll: true, barreseparation: true },
              propositions: [
                {
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: texteCorr,
                      reponse: {
                        valeur: [reponseA1],
                        texte:
                          "Calculer l'aire du disque suivant :<br>" +
                          texte +
                          '<br>Aire en cm\\up{2} (valeur exacte en nombre de $\\pi$)\\\\',
                        param: {
                          digits: this.sup2 ? 2 : 3,
                          signe: false,
                          decimals: this.sup2 ? 0 : 1,
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
                      reponse: {
                        texte:
                          'Aire en cm\\up{2} (valeur approchée à 0,1 près)',
                        valeur: [reponseA2],
                        param: {
                          digits: this.sup2 ? 3 : 4,
                          signe: false,
                          decimals: 1,
                          aussiCorrect: reponseA2bis,
                        },
                      },
                    },
                  ],
                },
              ],
            }
            this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
          }
        } else {
          if (context.isHtml && this.interactif) {
            if (choixValeurExacte) {
              handleAnswers(
                this,
                this.sup3 === 4 ? 4 * i : 2 * i,
                {
                  reponse: {
                    value: [
                      stringNombre(reponseL1) + '\\pi',
                      stringNombre(reponseL1) + '\\times\\pi',
                      '\\pi\\times' + stringNombre(reponseL1),
                    ],
                    options: { texteAvecCasse: true },
                  },
                },
                { formatInteractif: 'mathlive' },
              )
              texte +=
                'Valeur exacte du périmètre : ' +
                ajouteChampTexteMathLive(
                  this,
                  this.sup3 === 4 ? 4 * i : 2 * i,
                  KeyboardType.clavierNumbers,
                  { texteApres: ' $\\text{cm}$' },
                )
            }
            if (choixValeurApprochee) {
              handleAnswers(
                this,
                this.sup3 === 4 ? 4 * i + 1 : 2 * i,
                { reponse: { value: [reponseL2, reponseL2bis] } },
                { formatInteractif: 'mathlive' },
              )
              texte +=
                (this.sup3 === 4 ? '<br>' : '') +
                'Valeur approchée du périmètre : ' +
                ajouteChampTexteMathLive(
                  this,
                  this.sup3 === 4 ? 4 * i + 1 : 2 * i,
                  KeyboardType.clavierNumbers,
                  { texteApres: ' $\\text{cm}$' },
                )
            }
            if (choixValeurExacte) {
              handleAnswers(
                this,
                this.sup3 === 4 ? 4 * i + 2 : 2 * i + 1,
                {
                  reponse: {
                    value: [
                      stringNombre(reponseA1) + '\\pi',
                      stringNombre(reponseA1) + '\\times\\pi',
                      '\\pi\\times' + stringNombre(reponseA1),
                    ],
                    options: { texteAvecCasse: true },
                  },
                },
                { formatInteractif: 'mathlive' },
              )
              texte +=
                "<br>Valeur exacte de l'aire : " +
                ajouteChampTexteMathLive(
                  this,
                  this.sup3 === 4 ? 4 * i + 2 : 2 * i + 1,
                  KeyboardType.clavierNumbers,
                  { texteApres: '$\\text{ cm}^2$' },
                )
            }
            if (choixValeurApprochee) {
              handleAnswers(
                this,
                this.sup3 === 4 ? 4 * i + 3 : 2 * i + 1,
                { reponse: { value: [reponseA2, reponseA2bis] } },
                { formatInteractif: 'mathlive' },
              )
              texte +=
                "<br>Valeur approchée de l'aire : " +
                ajouteChampTexteMathLive(
                  this,
                  this.sup3 === 4 ? 4 * i + 3 : 2 * i + 1,
                  KeyboardType.clavierNumbers,
                  { texteApres: '$\\text{ cm}^2$' },
                )
            }
          } else {
            this.autoCorrectionAMC[i] = {
              enonce: '',
              options: { multicolsAll: true, barreseparation: true },
              propositions: [
                {
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: texteCorr,
                      reponse: {
                        texte:
                          "Calculer le périmètre et l'aire du disque suivant :<br>" +
                          texte +
                          '<br>Périmètre en cm (valeur exacte en nombre de $\\pi$)',
                        valeur: [reponseL1],
                        param: {
                          digits: this.sup2 ? 2 : 3,
                          decimals: this.sup2 ? 0 : 1,
                          signe: false,
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
                      reponse: {
                        texte: 'Périmètre en cm (valeur approchée à 0,1 près)',
                        valeur: [reponseL2],
                        param: {
                          digits: this.sup2 ? 3 : 4,
                          decimals: 1,
                          signe: false,
                          aussiCorrect: reponseL2bis,
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
                      reponse: {
                        texte:
                          'Aire en cm\\up{2} (valeur exacte en nombre de $\\pi$)\\\\',
                        valeur: [reponseA1],
                        param: {
                          digits: this.sup2 ? 2 : 3,
                          decimals: this.sup2 ? 0 : 1,
                          signe: false,
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
                      reponse: {
                        valeur: [reponseA2],
                        texte:
                          'Aire en cm\\up{2} (valeur approchée au dixième)',
                        param: {
                          digits: this.sup2 ? 3 : 4,
                          decimals: 1,
                          signe: false,
                          aussiCorrect: reponseA2bis,
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

        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
