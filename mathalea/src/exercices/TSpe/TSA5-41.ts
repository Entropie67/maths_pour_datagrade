import { createList } from '../../lib/format/lists'
import {
  brent,
  tableauDeVariation,
} from '../../lib/mathFonctions/etudeFonction'
import { enleveDoublonNum } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { abs, arrondi, signe } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Travailler un sujet de synthèse la fonction logarithme'
export const interactifReady = false

export const dateDePublication = '19/04/2026'

export const uuid = 'c541a'

/**
 * @author Stéphane Guyon
 */

export const refs = {
  'fr-fr': ['TSA5-41', 'TCA4-35'],
  'fr-ch': [],
}

export default class EtudeCompleteFonctionLogarithmeAffine extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Limites en $0$ et $+\\infty$',
        '2 : Calcul de la dérivée',
        '3 : Étude de variations',
        '4 : Étude de la convexité',
        "5 : Déterminer les éventuels points d'inflexion",
        "6 : Résolution de l'équation $f(x)=0$",
        '7 : Toutes les questions',
      ].join('\n'),
    ]
    this.sup = '7'
    this.spacing = 2
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = enleveDoublonNum(
      gestionnaireFormulaireTexte({
        saisie: this.sup,
        max: 6,
        melange: 7,
        defaut: 7,
        nbQuestions: 6,
        shuffle: false,
      }).map(Number),
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let b: number

      const a = randint(-5, 5, 0)
      const k = -Math.sign(a) * randint(2, 5)
      const abscisseExtremum = new FractionEtendue(-k, a)
      const x0 = abscisseExtremum.valeurDecimale
      const seuil = k - k * Math.log(x0) // abscisse de l'extrémum de f(x) = ax + b + k ln(x)
      // f(x0) = b - seuil On doit donc s'assurer que b - seuil est de signe opposé à a pour que f(x)=0 admette des solutions.
      if (a > 0) {
        b = Math.floor(seuil) - randint(1, 3)
      } else {
        b = Math.ceil(seuil) + randint(1, 3)
      }

      const f = (x: number) => a * x + b + k * Math.log(x)
      const extremum = f(x0)

      let borneGauche = x0 / 2
      while (borneGauche > 1e-12 && f(borneGauche) * extremum > 0) {
        borneGauche /= 2
      }
      borneGauche = Math.max(borneGauche, 1e-12)

      let borneDroite = Math.max(2 * x0, 1)
      while (borneDroite < 1e6 && f(borneDroite) * extremum > 0) {
        borneDroite *= 2
      }

      const { root: x1 } = brent(f, borneGauche, x0, 1e-10, 200)
      const { root: x2 } = brent(f, x0, borneDroite, 1e-10, 200)

      const questions: string[] = []
      const corrections: string[] = []

      if (this.questionJamaisPosee(i, a, b, k)) {
        const texte = `Soit $f$ la fonction définie sur $]0; +\\infty[$ par
        $f(x)=${reduireAxPlusB(a, b)}${ecritureAlgebrique(k)}\\ln(x)$.`

        for (let j = 0; j < typesDeQuestionsDisponibles.length; j++) {
          let question = ''
          let correction = ''

          switch (typesDeQuestionsDisponibles[j]) {
            case 1: {
              question +=
                ' Étudier les limites de la fonction $f$ en $0$ et en $+\\infty$.'
              const corr1a = `On a : $\\displaystyle\\lim_{x\\to 0^+} ${reduireAxPlusB(a, b)}= ${b}$.<br> D'autre part, on sait que $\\displaystyle\\lim_{x\\to 0^+}\\ln(x)= -\\infty$ 
    
                  donc $\\displaystyle\\lim_{x\\to 0^+}${k}\\ln(x)= ${signe(-k)}\\infty$.<br>
                  Par somme, $${miseEnEvidence('\\displaystyle\\lim_{x\\to 0^+} f(x)=' + signe(-k) + '\\infty')}$.`

              let corr1b = `On a : $\\displaystyle\\lim_{x\\to +\\infty} ${reduireAxPlusB(a, b)}= ${signe(a)}\\infty$.<br>`
              corr1b += `D'autre part, on sait que $\\displaystyle\\lim_{x\\to +\\infty}\\ln(x)= +\\infty$ <br>
                    donc $\\displaystyle\\lim_{x\\to +\\infty}${k}\\ln(x)= ${signe(k)}\\infty$.<br>`
              if (a * k > 0) {
                corr1b += `On déduit par somme que $\\displaystyle\\lim_{x\\to +\\infty} f(x)= ${signe(k)}\\infty$.<br>`
              } else {
                corr1b += `Nous observons une forme indéterminée du type $+\\infty - \\infty$. <br>
                    Pour la lever, on factorise l'expression par $x$.<br>
                    Soit $x\\in ]0; +\\infty[$,<br> $\\begin{aligned}
                    f(x)&= ${reduireAxPlusB(a, b)} + ${k}\\ln(x)\\\\
                    &= x\\left(${a} + \\dfrac{${b}}{x} + \\dfrac{${k}\\ln(x)}{x}\\right)
                    \\end{aligned}
                    $<br>
                    Or, $\\displaystyle\\lim_{x\\to +\\infty} \\dfrac{${b}}{x}=0$ et ${texteEnCouleurEtGras('par croissance comparée', 'black')}, $\\displaystyle\\lim_{x\\to +\\infty} \\dfrac{\\ln(x)}{x}=0$.<br>
                    Ainsi, $\\displaystyle\\lim_{x\\to +\\infty} \\left(${a} + \\dfrac{${b}}{x} + \\dfrac{${k}\\ln(x)}{x}\\right)=${a}$. Finalement, par produit,
                    $${miseEnEvidence('\\displaystyle\\lim_{x\\to +\\infty} f(x)=' + signe(a) + '\\infty')}$.`
              }

              correction += createList({
                style: 'fleches',
                items: [corr1a, corr1b],
              })
              break
            }
            case 2: {
              question += ` Calculer la dérivée $f'$ de la fonction $f$.`
              const corr2 = `Pour tout $x\\in ]0; +\\infty[$, la fonction $f$ est dérivable et
              $\\ln'(x)=\\dfrac1x$.<br>
              On obtient donc :<br>
              $\\begin{aligned}
              f'(x)&=${a}${signe(k)}\\dfrac{${abs(k)}}{x}\\\\
              &=\\dfrac{${rienSi1(a)}x${ecritureAlgebrique(k)}}{x}
              \\end{aligned}$.<br>
              Ainsi, pour tout $x>0$, $${miseEnEvidence(`f'(x)=\\dfrac{${rienSi1(a)}x${ecritureAlgebrique(k)}}{x}.`)}$<br>`
              correction += corr2
              break
            }
            case 3: {
              const ligneFprime =
                a > 0
                  ? ['Line', 20, 'd', 20, '-', 20, 'z', 20, '+', 20]
                  : ['Line', 20, 'd', 20, '+', 20, 'z', 20, '-', 20]
              const ligneVariation =
                a > 0
                  ? [
                      'Var',
                      30,
                      'D+/$+\\infty$',
                      30,
                      `-/$${texNombre(arrondi(extremum, 2))}$`,
                      20,
                      '+/$+\\infty$',
                    ]
                  : [
                      'Var',
                      30,
                      'D-/$-\\infty$',
                      30,
                      `+/$f(${abscisseExtremum.texFractionSimplifiee})$`,
                      20,
                      '-/$-\\infty$',
                    ]

              question += ` Dresser le tableau de variations de la fonction $f$ sur $]0; +\\infty[$.`
              let corr3 = `Pour tout $x>0$, le signe de $f'(x)=\\dfrac{${rienSi1(a)}x${ecritureAlgebrique(k)}}{x}$ est celui du numérateur
              $${rienSi1(a)}x${ecritureAlgebrique(k)}$.<br>
              On résout :<br>`
              if (a > 0) {
                corr3 += `
              $\\begin{aligned}
             &${rienSi1(a)}x${ecritureAlgebrique(k)}>0\\\\
              \\iff&${rienSi1(a)}x>${-k}\\\\
              \\iff&x>${abscisseExtremum.texFractionSimplifiee}
              \\end{aligned}$<br>`
              } else {
                corr3 += ` $\\begin{aligned}
             &${rienSi1(a)}x${ecritureAlgebrique(k)}>0\\\\
              \\iff&${rienSi1(a)}x>${-k}\\\\
              \\iff&x<${abscisseExtremum.texFractionSimplifiee}
              \\end{aligned}$<br>`
              }
              if (a > 0) {
                corr3 += `
                Ainsi, $f'(x)>0$ pour $x>${abscisseExtremum.texFractionSimplifiee}$ et
                $f'(x)<0$ pour $x<${abscisseExtremum.texFractionSimplifiee}$.<br>`
              } else {
                corr3 += `Ainsi, $f'(x)>0$ pour $x<${abscisseExtremum.texFractionSimplifiee}$ et
                $f'(x)<0$ pour $x>${abscisseExtremum.texFractionSimplifiee}$.<br>`
              }
              corr3 +=
                'On en déduit alors le tableau de variations de la fonction $f$ :<br>'
              corr3 += tableauDeVariation({
                tabInit: [
                  [
                    ['x', 2, 20],
                    ["f'(x)", 2, 30],
                    ['f(x)', 4, 30],
                  ],
                  [
                    '$0$',
                    20,
                    `$${abscisseExtremum.texFractionSimplifiee}$`,
                    20,
                    '$+\\infty$',
                    30,
                  ],
                ],
                tabLines: [ligneFprime, ligneVariation],
                espcl: 8,
                deltacl: 1,
                lgt: 3.5,
                hauteurLignes: [30, 30, 30],
              })
              corr3 += `<br>La fonction $f$ admet donc un extremum en $x_0=${abscisseExtremum.texFractionSimplifiee}$,`
              if (x0 === 1) {
                corr3 += ` qui vaut $${miseEnEvidence(`f(1)=${texNombre(extremum)}`)}$.`
              } else
                corr3 += ` qui vaut environ $${miseEnEvidence(`f(${abscisseExtremum.texFractionSimplifiee})\\approx ${texNombre(arrondi(extremum, 1))}`)}$.`
              correction += corr3
              break
            }
            case 4: {
              question += ` Étudier la convexité de la fonction $f$.`
              let corr4 = `Pour tout $x>0$, la fonction $f$ est deux fois dérivable. Pour étudier sa convexité, on étudie le signe de sa dérivée seconde :<br>
              On a $f'(x)=${a}${signe(k)}\\dfrac{${abs(k)}}{x}$ donc $f''(x)=\\dfrac{${-k}}{x^2}$.<br>`
              if (k > 0) {
                corr4 += `Donc $f''(x)<0$ sur $]0; +\\infty[$.<br>
                La fonction $f$ est donc ${texteEnCouleurEtGras('concave')} sur $]0; +\\infty[$.<br>`
              } else {
                corr4 += `Donc $f''(x)>0$ sur $]0; +\\infty[$.<br>La fonction $f$ est donc ${texteEnCouleurEtGras('convexe')} sur $]0; +\\infty[$.<br>`
              }
              correction += corr4
              break
            }
            case 5:
              {
                question += ` Déterminer les éventuels points d'inflexion de la courbe représentative de $f$.`
                let corr5 = `Pour déterminer les points d'inflexion, on étudie les changements de signes de la dérivée seconde.<br> Or, $f''(x)=\\dfrac{${-k}}{x^2}$ ne s'annule jamais et est de signe constant sur $]0; +\\infty[$.<br>`

                corr5 += `Ainsi, la courbe représentative de $f$ n'admet ${texteEnCouleurEtGras("pas de point d'inflexion")}.`
                correction += corr5
                break
              }

              break

            case 6: {
              const natureExtremum = a > 0 ? 'minimum' : 'maximum'
              const variationGauche =
                a > 0 ? 'strictement décroissante' : 'strictement croissante'
              const variationDroite =
                a > 0 ? 'strictement croissante' : 'strictement décroissante'
              const limZero = k > 0 ? '-\\infty' : '+\\infty'
              const limInf = a > 0 ? '+\\infty' : '-\\infty'
              const intervalle1 =
                a > 0
                  ? `]0; ${abscisseExtremum.texFractionSimplifiee}[`
                  : `[${abscisseExtremum.texFractionSimplifiee}; +\\infty[`
              const intervalle2 =
                a > 0
                  ? `[${abscisseExtremum.texFractionSimplifiee}; +\\infty[`
                  : `]0; ${abscisseExtremum.texFractionSimplifiee}[`
              const image1 =
                a > 0
                  ? `\\left[f\\left(${abscisseExtremum.texFractionSimplifiee}\\right);+\\infty\\right[`
                  : `\\left]-\\infty; f\\left(${abscisseExtremum.texFractionSimplifiee}\\right)\\right]`

              question += `Déterminer, en justifiant, le nombre de solution(s) de l'équation $f(x)=0$, puis donner, à aide de la calculatrice les valeurs approchées de chacune d'elles.<br>
              On donnera le cas échéant, les solutions approchées au centième près.`
              let corr6 = `D'après l'étude précédente, la fonction $f$ admet un ${natureExtremum} en
              $x_0=${abscisseExtremum.texFractionSimplifiee}$ et
              $f(x_0)\\approx ${texNombre(arrondi(extremum, 1))}$.<br>
              De plus,
              $\\displaystyle\\lim_{x\\to 0^+}f(x)=${limZero}$ et
              $\\displaystyle\\lim_{x\\to +\\infty}f(x)=${limInf}$.<br>`
              corr6 += createList({
                style: 'fleches',
                items: [
                  `Sur $${intervalle1}$ :<br>
                  $f$ est dérivable donc continue.<br>
                   la fonction $f$ est ${variationGauche}.<br>
                   $0\\in ${image1}$ <br>
                   D'après le corollaire du théorème des valeurs intermédiaires, l'équation $f(x)=0$ admet une unique solution sur cet intervalle.`,
                  `Sur $${intervalle2}$ : <br>
                    $f$ est dérivable donc continue.<br>
                    la fonction $f$ est ${variationDroite}.<br>
                  $0\\in ${image1}$ <br>
                   D'après le corollaire du théorème des valeurs intermédiaires, l'équation $f(x)=0$ admet une unique solution sur cet intervalle.`,
                ],
              })
              corr6 += `L'équation $f(x)=0$ admet donc exactement deux solutions sur $]0; +\\infty[$.<br>
              À la calculatrice, on obtient : <br>
              $${miseEnEvidence(`x_1\\approx ${texNombre(x1, 2)}`)}$ et
              $${miseEnEvidence(`x_2\\approx ${texNombre(x2, 2)}`)}$.`
              correction += corr6
              break
            }
          }

          questions.push(question)
          corrections.push(correction)
        }

        this.listeQuestions[i] =
          texte + createList({ style: 'alpha', items: questions })
        this.listeCorrections[i] = createList({
          style: 'alpha',
          items: corrections,
        })
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
