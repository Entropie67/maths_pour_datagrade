import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { droite } from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { Segment, segment } from '../../lib/2d/segmentsVecteurs'
import { Latex2d, latexParPoint, texteParPosition } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { homothetie, translation } from '../../lib/2d/transformations'
import { vecteur } from '../../lib/2d/Vecteur'
import { amcConvert } from '../../lib/amc/amcBuilders'
import { bleuMathalea } from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texFractionReduite } from '../../lib/outils/deprecatedFractions'
import { ecritureAlgebrique, reduireAxPlusB } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { abs } from '../../lib/outils/nombres'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Déterminer graphiquement l'expression d'une fonction affine"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCHybride'
export const dateDeModifImportante = '25/05/2023'
/**

 */
export const uuid = '93f13'

export const refs = {
  'fr-fr': ['2F21-4'],
  'fr-ch': ['11LCFA2E-4', '11LSFA2E-4'],
}
/**
 * @author = ???
 */
export default class Lecturefonctionaffine extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Choix des questions',
      3,
      '1 : Coefficient directeur entier\n2 :Coefficient directeur fractionnaire\n3 :Mélange',
    ]
    this.nbQuestions = 1 // On complète le nb de questions
    this.sup = 1
    this.correctionDetaillee = false
    this.correctionDetailleeDisponible = true
    this.spacing = 2
    this.besoinFormulaire2CaseACocher = [
      'Énoncé sans le terme fonction affine',
      false,
    ]
  }

  nouvelleVersion() {
    const typeDeQuestionsDisponibles = []
    if (this.sup !== 2) typeDeQuestionsDisponibles.push('typeE1')
    if (this.sup !== 1) typeDeQuestionsDisponibles.push('typeE2')

    const listeTypeQuestions = combinaisonListes(
      typeDeQuestionsDisponibles,
      this.nbQuestions,
    )
    const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
    const listeFractions = [
      [1, 3],
      [2, 3],
      [3, 7],
      [2, 7],
      [4, 3],
      [3, 5],
      [4, 7],
      [1, 5],
      [4, 5],
      [3, 4],
      [1, 4],
      [2, 5],
      [5, 3],
      [6, 5],
      [1, 6],
      [5, 6],
      [1, 7],
    ]
    // const listeTypeDeQuestions = combinaisonListes(typesDeQuestionsDisponibles, this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // on rajoute les variables dont on a besoin
      let texte = ''
      let texteCorr = ''
      switch (
        listeTypeQuestions[i] // Suivant le type de questions, le contenu sera différent
      ) {
        case 'typeE1':
          {
            // coeff entier
            const r = repere({
              xMin: -4,
              xMax: 4,
              xUnite: 2,
              yMin: -5,
              yMax: 6,
              yUnite: 1,
              thickHauteur: 0.1,
              xLabelMin: -3,
              xLabelMax: 3,
              yLabelMax: 5,
              yLabelMin: -4,
              axeXStyle: '->',
              axeYStyle: '->',
              grilleXDistance: 2,
              yLabelDistance: 1,
              yLabelEcart: 0.6,
              grilleSecondaire: true,
              grilleSecondaireYDistance: 1,
              grilleSecondaireXDistance: 2,
              grilleSecondaireYMin: -5.1,
              grilleSecondaireYMax: 6.1,
              grilleSecondaireXMin: -8.1,
              grilleSecondaireXMax: 8.1,
            })
            let a = randint(-4, 4) // coeff dir
            const b = randint(-4, 3) // ord origine
            if (a === 0 && b === 0) {
              a = 1
            } // On évite la fonction nulle
            const c = droite(a / 2, -1, b)
            c.color = colorToLatexOrHTML('red')
            c.epaisseur = 2
            texte = `Déterminer l'expression algébrique de la fonction ${this.sup2 ? '' : 'affine'} $f$ représentée ${this.sup2 ? 'par la droite' : ''} ci-dessous :<br>`
            texte += mathalea2d(
              {
                xmin: -8,
                ymin: -5.1,
                xmax: 8.1,
                ymax: 6,
                pixelsParCm: 25,
                scale: 0.6,
              },
              r,
              c,
              o,
            ) // On trace le graphique
            if (this.interactif) {
              handleAnswers(this, i, {
                reponse: {
                  value: `${reduireAxPlusB(a, b)}`,
                  options: { fonction: true, variable: 'x' },
                },
              })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBaseAvecVariable,
                { texteAvant: '$f(x)=$' },
              )
            } else texte += '$f(x)=\\ldots$'

            texteCorr = this.sup2
              ? 'La fonction $f$ est représentée par une droite (non verticale), donc $f$ est une fonction affine de la forme $f(x)=ax+b$. <br>'
              : 'Puisque $f$ est une fonction affine, on a : $f(x)=ax+b$.<br>'
            if (a === 0) {
              texteCorr += `La droite est horizontale. Elle représente une fonction affine constante ($a=0$).<br>
          Ainsi, $f(x)=${miseEnEvidence(b)}$.`
            } else {
              texteCorr += `$\\bullet$ $b$ est l'ordonnée à l'origine de la droite. On lit $b=${b}$.<br>`
              if (this.correctionDetaillee) {
                texteCorr += `L'ordonnée à l'origine est l'ordonnée du point d'intersection entre la droite et l'axe des ordonnées.<br>
              Ce point est le point $A$ de coordonnées $(0\\,;\\,${b})$.<br>`
              }
              texteCorr += `$\\bullet$ $a$ est le coefficient directeur de la droite.<br>
          Il est donné par le déplacement vertical correspondant à un déplacement horizontal d'une unité. On lit $a=${a}$.<br>`
              if (this.correctionDetaillee) {
                texteCorr += `Le coefficient directeur mesure l'inclinaison de la droite par rapport à l'horizontal (voir les traces graphiques ci-dessous).<br>
          <br> `
              }
              texteCorr +=
                " On peut en déduire que l'expression de la fonction $f$ est "
              texteCorr += `$f(x)=${miseEnEvidence(reduireAxPlusB(a, b))}$.<br>`
              let s1: Segment
              let s2: Segment
              let labs: Latex2d
              let lord: Latex2d
              if (b > -2 || a > 0) {
                s1 = segment(0, b, 2, b, bleuMathalea)
                s2 = segment(2, b, 2, b + a, 'green')
                labs = texteParPosition(
                  '$1$',
                  1,
                  a < 0 ? b + 0.4 : b - 0.8,
                  0,
                  bleuMathalea,
                  1,
                ) as Latex2d
                lord = texteParPosition(
                  `$${a}$`,
                  2.8,
                  (a + 2 * b) / 2,
                  0,
                  'green',
                  1,
                ) as Latex2d
              } else {
                s1 = segment(-4, -2 * a + b, -2, -2 * a + b, bleuMathalea)
                s2 = segment(-2, -2 * a + b, -2, -1 * a + b, 'green')
                labs = texteParPosition(
                  '$1$',
                  -3,
                  -2 * a + b + 0.5,
                  0,
                  bleuMathalea,
                  1,
                ) as Latex2d
                lord = texteParPosition(
                  `$${a}$`,
                  -1.5,
                  (-3 * a + 2 * b) / 2,
                  0,
                  'green',
                  1,
                ) as Latex2d
              }
              s2.epaisseur = 2
              s1.epaisseur = 2
              s2.styleExtremites = '->'
              s1.styleExtremites = '->'
              const A = pointAbstrait(0, b)
              const l = texteParPosition('A', -0.5, b + 0.5, 0, 'red', 1)
              const t = tracePoint(A, 'red') // Variable qui trace les nom s A et B
              t.taille = 3
              t.epaisseur = 2

              if (this.correctionDetaillee) {
                if (a !== 0) {
                  texteCorr += mathalea2d(
                    {
                      xmin: -8,
                      ymin: -5.1,
                      xmax: 8.1,
                      ymax: 6,
                      scale: 0.5,
                    },
                    r,
                    s1,
                    s2,
                    t,
                    c,
                    l,
                    o,
                    labs,
                    lord,
                  ) //, labs, lord
                }
              }
            }
            this.autoCorrectionAMC[i] = {
              enonce: texte,
              propositions: [
                {
                  type: 'AMCNum',
                  propositions: [
                    {
                      texte: texteCorr,
                      statut: '',
                      reponse: {
                        texte: 'coefficient a de $f(x)=ax+b$',
                        valeur: a,
                        param: {
                          digits: 1,
                          decimals: 0,
                          signe: true,
                          approx: 0,
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
                      statut: '',
                      reponse: {
                        texte: 'valeur b de $f(x)=ax+b$',
                        valeur: b,
                        param: {
                          digits: 1,
                          decimals: 0,
                          signe: true,
                          approx: 0,
                        },
                      },
                    },
                  ],
                },
              ],
            }
            this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
          }
          break
        case 'typeE2':
          {
            // cas du coeff directeur fractionnaire
            const b = randint(-3, 3) // ordonnée à l'origine
            const aFrac = choice(listeFractions)
            const a = aFrac[0] * choice([-1, 1]) //
            const d = aFrac[1] //
            const r = repere({
              xMin: -8,
              xMax: 8,
              xUnite: 1,
              yMin: -6,
              yMax: 6,
              yUnite: 1,
              thickHauteur: 0.1,
              xLabelMin: -7,
              xLabelMax: 7,
              yLabelMax: 5,
              yLabelMin: -5,
              axeXStyle: '->',
              axeYStyle: '->',
              yLabelDistance: 1,
              yLabelEcart: 0.6,
              grilleSecondaire: true,
              grilleSecondaireYDistance: 1,
              grilleSecondaireXDistance: 1,
              grilleSecondaireYMin: -6.1,
              grilleSecondaireYMax: 6.1,
              grilleSecondaireXMin: -8.1,
              grilleSecondaireXMax: 8.1,
            })
            const c = droite(a / d, -1, b)
            c.color = colorToLatexOrHTML('red')
            c.epaisseur = 2
            texte = `Déterminer l'expression algébrique de la fonction ${this.sup2 ? '' : 'affine'} $f$ représentée ${this.sup2 ? 'par la droite' : ''} ci-dessous :<br>`
            texte += mathalea2d(
              {
                xmin: -8,
                ymin: -6.1,
                xmax: 8.1,
                ymax: 6,
                pixelsParCm: 25,
                scale: 0.6,
              },
              r,
              c,
              o,
            ) // On trace le graphique
            texteCorr = this.sup2
              ? 'La fonction $f$ est représentée par une droite (non verticale), donc $f$ est une fonction affine de la forme $f(x)=ax+b$. <br>'
              : 'Puisque $f$ est une fonction affine, on a : $f(x)=ax+b$.<br>'
            texteCorr += `$\\bullet$ $b$ est l'ordonnée à l'origine de la droite. On lit $b=${b}$.<br>`
            if (this.correctionDetaillee) {
              texteCorr += `L'ordonnée à l'origine est l'ordonnée du point d'intersection entre la droite et l'axe des ordonnées.<br>
        Ce point est le point $A$ de coordonnées $(0\\,;\\,${b})$.<br>`
            }
            texteCorr += `$\\bullet$ $a$ est le coefficient directeur de la droite.<br>
          $a=\\dfrac{\\text{Dénivelé vertical}}{\\text{Déplacement horizontal}}=${texFractionReduite(a, d)}$.<br>
       `
            if (this.correctionDetaillee) {
              texteCorr +=
                '<br>On cherche un déplacement horizontal (en bleu) correspondant à un déplacement vertical entier (en vert).'
              texteCorr += `<br>On lit que pour un déplacement vers la droite de ${texteEnCouleurEtGras(d + ' unités', bleuMathalea)}, il faut `
              if (a > 0) {
                texteCorr += 'monter de '
              }
              if (a < 0) {
                texteCorr += 'descendre de '
              }
              texteCorr += `${texteEnCouleurEtGras(Math.abs(a) + `${abs(a) === 1 ? ' unité' : ' unités'}`, 'green')}.<br>`
            }
            texteCorr +=
              " On peut en déduire que l'expression de la fonction $f$ est "
            if (b === 0) {
              texteCorr += `$f(x)=${texFractionReduite(a, d)}x$`
            } else {
              texteCorr += `$f(x)=${texFractionReduite(a, d)}x${ecritureAlgebrique(b)}$`
            }
            // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
            const textCorrSplit = texteCorr.split('=')
            let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
            aRemplacer = aRemplacer.replace('$', '')

            texteCorr = ''
            for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
              texteCorr += textCorrSplit[ee] + '='
            }
            texteCorr += `$ $${miseEnEvidence(aRemplacer)}$` + '.<br>'
            // Fin de cette uniformisation

            if (context.isAmc) {
              this.autoCorrectionAMC[i] = {
                enonce: texte,
                propositions: [
                  {
                    type: 'AMCNum',
                    propositions: [
                      {
                        texte: `$${texFractionReduite(a, d)}x${ecritureAlgebrique(b)}$`,
                        statut: '',
                        reponse: {
                          texte:
                            'numérateur (signé) n de $f(x)=\\dfrac{n}{d}x+b$',
                          valeur: a,
                          param: {
                            digits: 1,
                            decimals: 0,
                            signe: true,
                            approx: 0,
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
                        statut: '',
                        reponse: {
                          texte: 'dénominateur d de $f(x)=\\dfrac{n}{d}x+b$',
                          valeur: d,
                          param: {
                            digits: 1,
                            decimals: 0,
                            signe: false,
                            approx: 0,
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
                        statut: '',
                        reponse: {
                          texte: 'valeur b de $f(x)=ax+b$',
                          valeur: b,
                          param: {
                            digits: 1,
                            decimals: 0,
                            signe: true,
                            approx: 0,
                          },
                        },
                      },
                    ],
                  },
                ],
              }
              this.questionsAMC[i] = amcConvert(this.autoCorrectionAMC[i])
            } else if (this.interactif) {
              handleAnswers(this, i, {
                reponse: {
                  value: `${new FractionEtendue(a, d).texFractionSimplifiee}x${ecritureAlgebrique(b)}`,
                  options: { fonction: true, variable: 'x' },
                },
              })
              texte += ajouteChampTexteMathLive(
                this,
                i,
                KeyboardType.clavierDeBaseAvecVariable,
                { texteAvant: '$f(x)=$' },
              )
            } else texte += '$f(x)=\\ldots$'

            let s1: Segment
            let s2: Segment
            let labs: Latex2d
            let lord: Latex2d

            if (a > 0) {
              if (b > 2) {
                s1 = segment(-d, b - a, 0, b - a, bleuMathalea)
                s2 = segment(0, b - a, 0, b, 'green')
                labs = texteParPosition(
                  `$${d}$`,
                  -d / 2,
                  b - a - 0.8,
                  0,
                  bleuMathalea,
                  1,
                ) as Latex2d
                lord = texteParPosition(
                  `$${a}$`,
                  0.5,
                  (2 * b - a) / 2 - 0.3,
                  0,
                  'green',
                  1,
                ) as Latex2d
              } else {
                s1 = segment(0, b, d, b, bleuMathalea)
                s2 = segment(d, b, d, a + b, 'green')
                labs = texteParPosition(
                  `$${d}$`,
                  d / 2,
                  b - 1,
                  0,
                  bleuMathalea,
                  1,
                ) as Latex2d
                lord = texteParPosition(
                  `$${a}$`,
                  d + 0.5,
                  (2 * b + a) / 2 - 0.3,
                  0,
                  'green',
                  1,
                ) as Latex2d
              }
            } else {
              if (b < 1) {
                s1 = segment(-d, -a + b, 0, -a + b, bleuMathalea)
                s2 = segment(0, -a + b, 0, b, 'green')
                labs = texteParPosition(
                  `$${d}$`,
                  -d / 2,
                  -a + b + 0.5,
                  0,
                  bleuMathalea,
                  1,
                ) as Latex2d
                lord = texteParPosition(
                  `$${a}$`,
                  0.5,
                  (2 * b - a) / 2,
                  0,
                  'green',
                  1,
                ) as Latex2d
              } else {
                s1 = segment(0, b, d, b, bleuMathalea)
                s2 = segment(d, b, d, b + a, 'green')
                labs = texteParPosition(
                  `$${d}$`,
                  d / 2,
                  b + 0.5,
                  0,
                  bleuMathalea,
                  1,
                ) as Latex2d
                lord = texteParPosition(
                  `$${a}$`,
                  d + 0.5,
                  (2 * b + a) / 2,
                  0,
                  'green',
                  1,
                ) as Latex2d
              }
            }
            s2.epaisseur = 2
            s1.epaisseur = 2
            s2.styleExtremites = '->'
            s1.styleExtremites = '->'
            const A = pointAbstrait(0, b)

            const l = latexParPoint(
              'A',
              translation(
                A,
                homothetie(vecteur(-a, d), A, 0.5 / Math.sqrt(a ** 2 + d ** 2)),
                'A',
                'center',
              ),
              'red',
              10,
              10,
              '',
            ) // Variable qui trace les points avec une croix
            const t = tracePoint(A, 'red') // Variable qui trace les nom s A et B
            t.taille = 3
            t.epaisseur = 2

            // l.color = colorToLatexOrHTML('red')
            if (this.correctionDetaillee) {
              if (a !== 0) {
                texteCorr += mathalea2d(
                  {
                    xmin: -8,
                    ymin: -6.1,
                    xmax: 8.1,
                    ymax: 6,
                    scale: 0.5,
                  },
                  r,
                  s1,
                  s2,
                  t,
                  l,
                  c,
                  o,
                  labs,
                  lord,
                )
              }
            } // On trace le graphique
          }
          break
      }
      if (this.questionJamaisPosee(i, texteCorr)) {
        // Si la question n'a jamais été posée, on en crée une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
