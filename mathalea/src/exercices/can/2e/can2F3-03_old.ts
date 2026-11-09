import { droiteGraduee } from '../../../lib/2d/DroiteGraduee'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { latex2d } from '../../../lib/2d/textes'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { bleuMathalea } from '../../../lib/colors'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import { extraireRacineCarree } from '../../../lib/outils/calculs'
import { texFractionReduite } from '../../../lib/outils/deprecatedFractions'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { sp } from '../../../lib/outils/outilString'
import { mathalea2d } from '../../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../../modules/outils'
import Exercice from '../../Exercice'
export const titre =
  'Résoudre une équation avec une fonction de référence (ancien exercice)'
export const interactifReady = true

// Les exports suivants sont optionnels mais au moins la date de publication semble essentielle
export const dateDePublication = '27/12/2021' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Stéphane Guyon
 * @author Gilles Mora

*/
export const uuid = 'a7515'

export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

function illustrationDistance(a: number, b: number): string {
  const gauche = a - b
  const droite = a + b
  const min = gauche - 1
  const axe = droiteGraduee({
    Unite: 1,
    Min: gauche - 1,
    Max: droite + 1,
    thickDistance: 1,
    labelsPrincipaux: false,
    labelListe: [[a, `${a}`]],
    pointListe: [[a, '']],
    pointStyle: '|',
    pointEpaisseur: 3,
  })
  const solutionGauche = pointAbstrait(gauche - min, 0)
  const solutionDroite = pointAbstrait(droite - min, 0)
  const marqueGauche = tracePoint(solutionGauche, bleuMathalea)
  const marqueDroite = tracePoint(solutionDroite, bleuMathalea)
  marqueGauche.style = '|'
  marqueDroite.style = '|'
  marqueGauche.epaisseur = 3
  marqueDroite.epaisseur = 3
  const labelGauche = latex2d(`${gauche}`, solutionGauche.x, -0.7, {
    color: bleuMathalea,
  })
  const labelDroite = latex2d(`${droite}`, solutionDroite.x, -0.7, {
    color: bleuMathalea,
  })
  const accoladeGauche = latex2d(
    `\\overbrace{\\hspace{${b * 0.55}cm}}^{${b}}`,
    (solutionGauche.x + (a - min)) / 2,
    1,
    { color: bleuMathalea },
  )
  const accoladeDroite = latex2d(
    `\\overbrace{\\hspace{${b * 0.55}cm}}^{${b}}`,
    (a - min + solutionDroite.x) / 2,
    1,
    { color: bleuMathalea },
  )
  const objets = [
    axe,
    marqueGauche,
    marqueDroite,
    labelGauche,
    labelDroite,
    accoladeGauche,
    accoladeDroite,
  ]
  return mathalea2d(
    Object.assign({}, fixeBordures(objets), {
      pixelsParCm: 24,
      scale: 0.8,
    }),
    objets,
  )
}
export default class ResoudreEquationsFonctionDeReference extends Exercice {
  protected typeQuestionFixe?: number

  private casDisponibles(): number[] {
    switch (this.sup3) {
      case 1:
        return [1, 2, 3]
      case 2:
        return [2, 3, 4, 5]
      case 3:
      default:
        return [1, 2, 3, 4, 5]
    }
  }

  constructor() {
    super()

    this.nbQuestions = 1
    this.sup3 = 3
    this.besoinFormulaire3Numerique = [
      'Fonctions proposées',
      3,
      '1 : Nouveau programme 2026\n2 : Années de transition\n3 : Toutes les fonctions de référence',
    ]
    this.spacing = 2
  }

  nouvelleVersion() {
    let texte, texteCorr, a, k, b, c, props, typeQuestion
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      a = 0
      b = 0
      c = 0
      k = 0
      typeQuestion = this.typeQuestionFixe ?? choice(this.casDisponibles())
      switch (typeQuestion) {
        case 1: {
          const distance = randint(1, 6)
          a = randint(-6, 6, [0, distance])
          b = distance * choice([-1, 1, 1, 1, 1])
          const solutionGauche = a - b
          const solutionDroite = a + b
          const distracteurGauche = b - a
          const membreValeurAbsolue = `|x${ecritureAlgebrique(-a)}|`
          texte = `L'ensemble des solutions $S$ de l'équation $${membreValeurAbsolue}=${b}$ est :`
          const propositions =
            b > 0
              ? [
                  {
                    texte: `$S=\\{${solutionGauche}${sp(1)};${sp(1)}${solutionDroite}\\}$`,
                    statut: true,
                  },
                  {
                    texte: `$S=\\{${distracteurGauche}${sp(1)};${sp(1)}${solutionDroite}\\}$`,
                    statut: false,
                  },
                  {
                    texte: `$S=\\{${solutionGauche}${sp(1)};${sp(1)}${distracteurGauche}\\}$`,
                    statut: false,
                  },
                  { texte: '$S=\\emptyset$', statut: false },
                ]
              : [
                  { texte: '$S=\\emptyset$', statut: true },
                  {
                    texte: `$S=\\{${solutionGauche}${sp(1)};${sp(1)}${solutionDroite}\\}$`,
                    statut: false,
                  },
                  {
                    texte: `$S=\\{${distracteurGauche}${sp(1)};${sp(1)}${solutionDroite}\\}$`,
                    statut: false,
                  },
                  { texte: `$S=\\{${solutionDroite}\\}$`, statut: false },
                ]
          this.autoCorrection[i] = { enonce: texte, propositions }
          props = propositionsQcm(this, i)
          if (this.interactif) texte += props.texte
          else {
            texte = `Résoudre, dans $\\mathbb{R}$, :<br>$${membreValeurAbsolue}=${b}$.`
          }

          if (b > 0) {
            texteCorr = `<strong>Résolution géométrique :</strong><br>$${membreValeurAbsolue}=${b}$ signifie que la distance entre $x$ et $${a}$ est égale à $${b}$. Sur une droite graduée, il existe exactement deux abscisses situées à une distance de $${b}$ unités de $${a}$ : $${solutionGauche}$ et $${solutionDroite}$.<br>${illustrationDistance(a, b)}<br>`
            texteCorr += `<strong>Résolution analytique :</strong><br>$${membreValeurAbsolue}=${b}\\iff x${ecritureAlgebrique(-a)}=${b}\\text{ ou }x${ecritureAlgebrique(-a)}=-${b}$.<br>`
            texteCorr += `On résout donc les deux équations :<br>$x${ecritureAlgebrique(-a)}=${b}\\iff x=${solutionDroite}$ ;<br>$x${ecritureAlgebrique(-a)}=-${b}\\iff x=${solutionGauche}$.<br>`
            texteCorr += `Ainsi, $S=${miseEnEvidence(`\\{${solutionGauche}${sp(1)};${sp(1)}${solutionDroite}\\}`)}$.`
          } else {
            texteCorr = `Une valeur absolue est toujours positive ou nulle. Elle ne peut donc pas être égale au nombre négatif $${b}$.<br>Ainsi, $S=${miseEnEvidence('\\emptyset')}$.`
          }
          this.canEnonce = `Résoudre, dans $\\mathbb{R}$, l'équation $${membreValeurAbsolue}=${b}$.`
          break
        }
        case 2:
          a = randint(0, 10) ** 2
          b = choice([2, 3, 5, 7, 10, 11, 13, 14, 15, 17, 19, 21, 23])
          c = choice([
            -1, -2, -3, -5, -7, -10, -11, -13, -14, -15, -4, -9, -16, -25, -36,
            -49, -64, -81, -100,
          ])
          k = choice([a, a, b, b, c])
          texte = `L'ensemble des solutions $S$ de l'équation $x^2=${k}$ est :
                 `
          if (k === a) {
            if (k === 0) {
              this.autoCorrection[i] = {
                enonce: texte,

                propositions: [
                  {
                    texte: '$S=\\{0\\}$',
                    statut: true,
                  },
                  {
                    texte: '$S=\\emptyset$',
                    statut: false,
                  },
                  {
                    texte: '$S=\\{1\\}$',
                    statut: false,
                  },
                ],
              }
            } else {
              this.autoCorrection[i] = {
                enonce: texte,

                propositions: [
                  {
                    texte: `$S=\\{-${Math.sqrt(k)};${Math.sqrt(k)}\\}$`,
                    statut: true,
                  },
                  {
                    texte: `$S=\\{${Math.sqrt(k)}\\}$`,
                    statut: false,
                  },
                  {
                    texte: `$S=\\{${k}\\}$`,
                    statut: false,
                  },
                ],
              }
            }
          }
          if (k === b) {
            this.autoCorrection[i] = {
              enonce: texte,

              propositions: [
                {
                  texte: `$S=\\{-\\sqrt{${k}};\\sqrt{${k}}\\}$`,
                  statut: true,
                },
                {
                  texte: `$S=\\{\\sqrt{${k}}\\}$`,
                  statut: false,
                },
                {
                  texte: '$S=\\emptyset$',
                  statut: false,
                },
              ],
            }
          }
          if (k === c) {
            this.autoCorrection[i] = {
              enonce: texte,

              propositions: [
                {
                  texte: '$S=\\emptyset$',
                  statut: true,
                },
                {
                  texte: `$S=\\{-\\sqrt{${-k}};\\sqrt{${-k}}\\}$`,
                  statut: false,
                },
                {
                  texte: `$S=\\{\\sqrt{${-k}}\\}$`,
                  statut: false,
                },
              ],
            }
          }

          props = propositionsQcm(this, i)
          if (this.interactif) texte += props.texte
          else {
            texte = `Résoudre, dans $\\mathbb{R}$, :<br>
  
         $x^2=${k}$`
          }

          texteCorr = ''
          if (k > 0) {
            texteCorr += `L'équation est de la forme $x^2=k$ avec $k=${k}$. Comme $${k}>0$ alors l'équation admet deux solutions : $-\\sqrt{${k}}$ et $\\sqrt{${k}}$.<br>
            `
            if (extraireRacineCarree(k)[1] === k) {
              if (k === 1) {
                texteCorr += `Comme $-\\sqrt{${k}}=-${Math.sqrt(k)}$ et $\\sqrt{${k}}=${Math.sqrt(k)}$ alors
            les solutions de l'équation peuvent s'écrire plus simplement : $-${Math.sqrt(k)}$ et $${Math.sqrt(k)}$.<br>
            Ainsi, $S=${miseEnEvidence(`\\{-${Math.sqrt(k)}${sp(1)};${sp(1)}${Math.sqrt(k)}\\}`)}$.`
              } else {
                texteCorr += `Ainsi, $S=${miseEnEvidence(`\\{-\\sqrt{${k}}${sp(1)};${sp(1)}\\sqrt{${k}}\\}`)}$.`
              }
            } else {
              if (k === a) {
                texteCorr += `Comme $-\\sqrt{${k}}=-${Math.sqrt(k)}$ et $\\sqrt{${k}}=${Math.sqrt(k)}$ alors
            les solutions de l'équation peuvent s'écrire plus simplement : $-${Math.sqrt(k)}$ et $${Math.sqrt(k)}$.<br>
            Ainsi, $S=${miseEnEvidence(`\\{-${Math.sqrt(k)}${sp(1)};${sp(1)}${Math.sqrt(k)}\\}`)}$.`
              } else {
                texteCorr += `Comme $-\\sqrt{${k}}=-${extraireRacineCarree(k)[0]}\\sqrt{${extraireRacineCarree(k)[1]}}$ et $\\sqrt{${k}}=${extraireRacineCarree(k)[0]}\\sqrt{${extraireRacineCarree(k)[1]}}$ alors
                les solutions de l'équation peuvent s'écrire plus simplement : $-${extraireRacineCarree(k)[0]}\\sqrt{${extraireRacineCarree(k)[1]}}$ et $${extraireRacineCarree(k)[0]}\\sqrt{${extraireRacineCarree(k)[1]}}$.<br>
                Ainsi, $S=${miseEnEvidence(`\\{-${extraireRacineCarree(k)[0]}\\sqrt{${extraireRacineCarree(k)[1]}}${sp(1)};${sp(1)}${extraireRacineCarree(k)[0]}\\sqrt{${extraireRacineCarree(k)[1]}}\\}`)}$.`
              }
            }
          } else {
            if (k === 0) {
              texteCorr += `L'équation est de la forme $x^2=k$ avec $k=${k}$. Comme $k=${k}$ alors L'équation admet une unique solution : $0$.<br>
            Ainsi, $S=${miseEnEvidence(`\\{0\\}`)}$.`
            } else {
              texteCorr += `L'équation est de la forme $x^2=k$. Comme $k=${k}$ et $${k}<0$, alors l'équation n'admet aucune solution.<br>
              Ainsi, $S=${miseEnEvidence(`\\emptyset`)}$.`
            }
          }
          this.canEnonce = `Résoudre, dans $\\mathbb{R}$, l'équation $x^2=${k}$.`

          break
        case 4: {
          const solution = choice([-5, -4, -3, -2, 2, 3, 4, 5])
          k = solution ** 3
          texte = `L'ensemble des solutions $S$ de l'équation $x^3=${k}$ est :`
          this.autoCorrection[i] = {
            enonce: texte,
            propositions: [
              {
                texte: `$S=\\{${solution}\\}$`,
                statut: true,
              },
              {
                texte: `$S=\\{${-solution}\\}$`,
                statut: false,
              },
              {
                texte: `$S=\\{${k}\\}$`,
                statut: false,
              },
              {
                texte: '$S=\\emptyset$',
                statut: false,
              },
            ],
          }
          props = propositionsQcm(this, i)
          if (this.interactif) texte += props.texte
          else texte = `Résoudre, dans $\\mathbb{R}$, :<br>$x^3=${k}$.`

          texteCorr = `La fonction cube est strictement croissante sur $\\mathbb{R}$. L'équation $x^3=${k}$ admet donc une unique solution.<br>Or $${ecritureParentheseSiNegatif(solution)}^3=${k}$. Ainsi, $S=${miseEnEvidence(`\\{${solution}\\}`)}$.`
          this.canEnonce = `Résoudre, dans $\\mathbb{R}$, l'équation $x^3=${k}$.`
          break
        }
        case 5:
          k = randint(-5, 10)
          texte = `L'ensemble des solutions $S$ de l'équation $\\sqrt{x}=${k}$ est :
                   `
          if (k > 0) {
            if (k !== 1) {
              if (k !== 1) {
                if (k === 2) {
                  this.autoCorrection[i] = {
                    enonce: texte,

                    propositions: [
                      {
                        texte: `$S=\\{${k ** 2}\\}$`,
                        statut: true,
                      },
                      {
                        texte: '$S=\\emptyset$',
                        statut: false,
                      },
                      {
                        texte: `$S=\\{${k}\\}$`,
                        statut: false,
                      },
                    ],
                  }
                } else {
                  this.autoCorrection[i] = {
                    enonce: texte,

                    propositions: [
                      {
                        texte: `$S=\\{${k ** 2}\\}$`,
                        statut: true,
                      },
                      {
                        texte: `$S=\\{${2 * k}\\}$`,
                        statut: false,
                      },
                      {
                        texte: `$S=\\{${k}\\}$`,
                        statut: false,
                      },
                    ],
                  }
                }
              }
            } else {
              this.autoCorrection[i] = {
                enonce: texte,

                propositions: [
                  {
                    texte: `$S=\\{${k}\\}$`,
                    statut: true,
                  },
                  {
                    texte: '$S=\\emptyset$',
                    statut: false,
                  },
                  {
                    texte: `$S=\\{${2 * k}\\}$`,
                    statut: false,
                  },
                ],
              }
            }
          }

          if (k < 0) {
            this.autoCorrection[i] = {
              enonce: texte,

              propositions: [
                {
                  texte: '$S=\\emptyset$',
                  statut: true,
                },
                {
                  texte: `$S=\\{\\sqrt{${-k}}\\}$`,
                  statut: false,
                },
                {
                  texte: `$S=\\{${k ** 2}\\}$`,
                  statut: false,
                },
              ],
            }
          }
          if (k === 0) {
            this.autoCorrection[i] = {
              enonce: texte,

              propositions: [
                {
                  texte: '$S=\\{0\\}$',
                  statut: true,
                },
                {
                  texte: `$S=\\{${k + 1}\\}$`,
                  statut: false,
                },
                {
                  texte: '$S=\\emptyset$',
                  statut: false,
                },
              ],
            }
          }

          props = propositionsQcm(this, i)
          if (this.interactif) texte += props.texte
          else {
            texte = `Résoudre dans $[0${sp(1)};${sp(1)}+\\infty[$ :<br>
  
                $\\sqrt{x}=${k}$`
          }

          texteCorr = `Pour tout réel $x$ positif ou nul, l'équation $\\sqrt{x}=k$ admet :<br>
              $\\bullet~$ une solution si $k\\geqslant 0$ : $k^2$ ;<br>
              $\\bullet~$ aucune solution si $k<0$.<br>
             `

          if (k < 0) {
            texteCorr += `L'équation est de la forme $\\sqrt{x}=k$. Comme $k=${k}$ et $${k}<0$ alors l'équation n'admet pas de solution.<br>
            Ainsi, $S=${miseEnEvidence(`\\emptyset`)}$.
            `
          }
          if (k > 0 || k === 0) {
            texteCorr += `$k=${k}$ et $${k}>0$ donc l'équation admet une solution : $${k}^2=${k ** 2}$.<br>
             Ainsi $S=${miseEnEvidence(`\\{${k ** 2}\\}`)}$.
            `
          }
          this.canEnonce = `Résoudre dans $[0${sp(1)};${sp(1)}+\\infty[$ l'équation $\\sqrt{x}=${k}$.`

          break

        case 3:
        default:
          k = randint(-10, 10)
          texte = `L'ensemble des solutions $S$ de l'équation $\\dfrac{1}{x}=${k}$ est :
                     `
          if (k !== 0) {
            if (k === 1) {
              this.autoCorrection[i] = {
                enonce: texte,

                propositions: [
                  {
                    texte: `$S=\\left\\{${texFractionReduite(1, k)}\\right\\}$`,
                    statut: true,
                  },
                  {
                    texte: `$S=\\left\\{${texFractionReduite(1, -k)}\\right\\}$`,
                    statut: false,
                  },
                  {
                    texte: '$S=\\emptyset$',
                    statut: false,
                  },
                ],
              }
            } else {
              this.autoCorrection[i] = {
                enonce: texte,

                propositions: [
                  {
                    texte: `$S=\\left\\{${texFractionReduite(1, k)}\\right\\}$`,
                    statut: true,
                  },
                  {
                    texte: `$S=\\left\\{${texFractionReduite(1, -k)}\\right\\}$`,
                    statut: false,
                  },
                  {
                    texte: `$S=\\left\\{${k}\\right\\}$`,
                    statut: false,
                  },
                ],
              }
            }
          }
          if (k === 0) {
            this.autoCorrection[i] = {
              enonce: texte,

              propositions: [
                {
                  texte: '$S=\\emptyset$',
                  statut: true,
                },
                {
                  texte: '$S=\\left\\{0\\right\\}$',
                  statut: false,
                },
                {
                  texte: '$S=\\left\\{-1\\right\\}$',
                  statut: false,
                },
              ],
            }
          }
          props = propositionsQcm(this, i)
          if (this.interactif) texte += props.texte
          else {
            texte = `Résoudre dans $\\mathbb{R}^*$ :<br>
  
                  $\\dfrac{1}{x}=${k}$`
          }

          texteCorr = `L'équation $\\dfrac{1}{x}=k$ admet :<br>
            $\\bullet~$ une unique solution si $k\\neq 0$ : $\\dfrac{1}{k}$.<br>
            $\\bullet~$ aucune solution si $k= 0$.<br>`

          if (k === 0) {
            texteCorr += `L'équation est de la forme $\\dfrac{1}{x}=k$ avec $k=${k}$. Comme $k=${k}$, alors l'équation n'admet pas de solution.<br>
              Ainsi, $S=${miseEnEvidence(`\\emptyset`)}$.
              `
          }
          if (k !== 0) {
            texteCorr += `L'équation est de la forme $\\dfrac{1}{x}=k$ avec $k=${k}$. Comme $${k}\\neq 0$ alors l'équation admet une solution :
              $${texFractionReduite(1, k)}$.<br>
             Ainsi $S=${miseEnEvidence(`\\left\\{${texFractionReduite(1, k)}\\right\\}`)}$.
            `
          }
          this.canEnonce = `Résoudre dans $\\mathbb{R}^*$ l'équation $\\dfrac{1}{x}=${k}$.`

          break
      }
      if (this.questionJamaisPosee(i, typeQuestion, a, b, k, c)) {
        // Si la question n'a jamais été posée, on la stocke dans la liste des questions
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr

        listeQuestionsToContenu(this)
        i++
      }
      cpt++
    }
  }
}
