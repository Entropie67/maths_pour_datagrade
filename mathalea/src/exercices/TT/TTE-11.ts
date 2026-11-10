import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import Exercice from '../Exercice'

import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'

export const titre =
  "Déterminer le domaine de définition d'une fonction logarithme"
export const dateDePublication = '22/7/2024'
export const uuid = '450e7'
export const interactifReady = true

export const refs = {
  'fr-fr': ['TTE-11'],
  'fr-ch': [],
}

/**
 * Réduire une expression en fonction de ln/log de x
 * @author  Jean-claude Lhote

 */
export default class DomaineDefFnLog extends Exercice {
  version: string
  constructor() {
    super()
    this.version = 'ln'
    this.nbQuestions = 5
    this.spacingCorr = 3
    this.sup = '1'
    this.sup2 = false
    this.besoinFormulaireTexte = [
      'Type de fonction dans le logarithme',
      'Nombres séparés par des tirets :\n1 : Fonction affine\n2 : Fonction homographique\n3 : Polynôme de degré 2\n4 : Mélange',
    ]
    this.besoinFormulaire2CaseACocher = ['Type de logarithme', true]
  }

  nouvelleVersion() {
    const listeTypeDeQuestion = gestionnaireFormulaireTexte({
      saisie: this.sup,
      nbQuestions: this.nbQuestions,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
    })
    if (this.sup2) this.version = 'ln'
    else this.version = 'log'
    const logString = this.version !== 'ln' ? '\\log' : '\\ln'
    const pluriel = this.nbQuestions > 1 ? 's' : ''
    this.consigne = `Donner le domaine de définition de${this.nbQuestions > 1 ? 's ' : 'la '}fonction${pluriel} suivante${pluriel}.`

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = `$\\mathcal{f}_${i}(x)=`
      let correction = ''
      let a: number
      let b: number
      let c: number
      let d: number
      let fonction: string
      let frac1: FractionEtendue
      let frac2: FractionEtendue
      let answer: string
      let answerReunion = ''
      let texteCorr: string
      let de: number

      // On définit le contenu de l'énoncé
      switch (listeTypeDeQuestion[i]) {
        case 1: // affine
          a = randint(-9, 9, 0)
          b = randint(-9, 9, [0, a, -a])
          c = a
          d = b
          fonction = reduireAxPlusB(a, b)
          correction = `$\\begin{aligned}${fonction}> 0 &\\iff `
          correction += `${rienSi1(a)}x> ${-b}\\\\`
          if (a !== 1) {
            frac1 = new FractionEtendue(-b, a).simplifie()
            if (a > 0) {
              correction += `&\\iff x> ${frac1.texFractionSimplifiee}`
              answer = `\\left]${frac1.texFractionSimplifiee};+\\infty\\right[`
            } else {
              correction += `&\\iff x< ${frac1.texFractionSimplifiee}`
              answer = `\\left]-\\infty;${frac1.texFractionSimplifiee}\\right[`
            }
            correction += '\\end{aligned}$'
          } else {
            correction += '\\end{aligned}$'
            answer = `\\left]${-b};+\\infty\\right[`
          }
          correction += '<br>'
          break
        case 2:
          {
            // homographique
            do {
              a = randint(-3, 3, 0)
              b = randint(-9, 9, [0, a, -a])
              c = randint(-3, 3, [a, 0])
              d = randint(-9, 9, [0, c, -c])
              frac1 =
                -b / a < -d / c
                  ? new FractionEtendue(-b, a).simplifie()
                  : new FractionEtendue(-d, c).simplifie()
              frac2 =
                -b / a > -d / c
                  ? new FractionEtendue(-b, a).simplifie()
                  : new FractionEtendue(-d, c).simplifie()
              de = a * d - b * c //
            } while (de === 0) // On ne veut pas de fonction constante
            fonction = `\\dfrac{${reduireAxPlusB(a, b)}}{${reduireAxPlusB(c, d)}}`
            const ligne1 = [
              '$-\\infty$',
              30,
              `$${frac1.texFractionSimplifiee}$`,
              20,
              `$${frac2.texFractionSimplifiee}$`,
              20,
              '$+\\infty$',
              30,
            ]
            const ligneAxPlusB =
              -b / a < -d / c
                ? [
                    'Line',
                    30,
                    '',
                    0,
                    `${a > 0 ? '-' : '+'}`,
                    20,
                    'z',
                    20,
                    `${a < 0 ? '-' : '+'}`,
                    20,
                    '',
                    20,
                    `${a < 0 ? '-' : '+'}`,
                    20,
                  ]
                : [
                    'Line',
                    30,
                    '',
                    0,
                    `${a > 0 ? '-' : '+'}`,
                    20,
                    '',
                    20,
                    `${a > 0 ? '-' : '+'}`,
                    20,
                    'z',
                    20,
                    `${a < 0 ? '-' : '+'}`,
                    20,
                  ]
            const ligneCxPlusD =
              -b / a > -d / c
                ? [
                    'Line',
                    30,
                    '',
                    0,
                    `${c > 0 ? '-' : '+'}`,
                    20,
                    'z',
                    20,
                    `${c < 0 ? '-' : '+'}`,
                    20,
                    '',
                    20,
                    `${c < 0 ? '-' : '+'}`,
                    20,
                  ]
                : [
                    'Line',
                    30,
                    '',
                    0,
                    `${c > 0 ? '-' : '+'}`,
                    20,
                    '',
                    20,
                    `${c > 0 ? '-' : '+'}`,
                    20,
                    'z',
                    20,
                    `${c < 0 ? '-' : '+'}`,
                    20,
                  ]
            const signes = ['Line', 30, '', 0]
            for (let index = 4; index < 13; index += 2) {
              let signe: string
              if (ligneAxPlusB[index] === ligneCxPlusD[index]) {
                signe = '+'
              } else if (ligneCxPlusD[index] === 'z') {
                signe = 'd'
              } else if (ligneAxPlusB[index] === 'z') {
                signe = 'z'
              } else {
                signe = '-'
              }
              signes.push(signe, 20)
            }
            correction += tableauDeVariation({
              tabInit: [
                [
                  // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                  ['$x$', 2, 30],
                  [`$${reduireAxPlusB(a, b)}$`, 2, 50],
                  [`$${reduireAxPlusB(c, d)}$`, 2, 50],
                  [`$${fonction}$`, 2, 50],
                ],
                // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                ligne1,
              ],
              // tabLines ci-dessous contient les autres lignes du tableau.
              tabLines: [ligneAxPlusB, ligneCxPlusD, signes],
              espcl: 3.5, // taille en cm entre deux antécédents
              deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
              lgt: 8, // taille de la première colonne en cm
              hauteurLignes: [12, 15],
            })
            if (signes[8] === '+') {
              // -/+/-
              answer = `\\left]${frac1.texFractionSimplifiee};${frac2.texFractionSimplifiee}\\right[`
            } else {
              // -d/c<-b/a la fonction décroit et change de signe après la valeur interdite elle est positive sur ]-inf;-d/c[U]-d/c;-b/a[
              answer = `\\left]-\\infty;${frac1.texFractionSimplifiee}\\right[\\cup\\left]${frac2.texFractionSimplifiee};+\\infty\\right[`
            }
          }
          break
        default: {
          // polynôme degré 2
          if (choice([true, true, true, false])) {
            // On provoque une racine double : -d/c = -b/a
            if (choice([true, true, false])) {
              a = randint(-3, 3, 0)
              b = randint(-9, 9, [0, a, -a])
              c = randint(-3, 3, [a, 0])
              d = randint(-9, 9, [0, c, -c])
            } else {
              a = randint(-3, 3, 0)
              b = a * choice([2, 3, 5]) * choice([-1, 1])
              c = choice([-3, -2, 2, 3])
              d = b * c
              c = a * c
            }

            // une fois sur 2 on est certain d'avoir des racines (pouvant être doubles)
            frac1 =
              -b / a < -d / c
                ? new FractionEtendue(-b, a).simplifie()
                : new FractionEtendue(-d, c).simplifie()
            frac2 =
              -d / c > -b / a
                ? new FractionEtendue(-d, c).simplifie()
                : new FractionEtendue(-b, a).simplifie()
            const coeffX2 = a * c
            const coeffX0 = b * d
            const coeffX = a * d + b * c
            a = coeffX2
            b = coeffX
            c = coeffX0
            fonction = reduirePolynomeDegre3(0, a, b, c)
            de = b * b - 4 * a * c
            correction += `$${fonction}$ est un polynôme de degré $2$, calculons son discriminant : <br>`
            correction += `$\\Delta=${ecritureParentheseSiNegatif(b)}^2-4\\times ${ecritureParentheseSiNegatif(a)}\\times ${ecritureParentheseSiNegatif(c)}=${b * b - 4 * a * c}`

            if (de > 0) {
              // deux racines, le polynome est du signe de -a entre les deux racines : frac1 et frac2
              correction += `\\quad x_1=\\dfrac{${-b}-\\sqrt{${de}}}{2\\times ${ecritureParentheseSiNegatif(a)}}=${a > 0 ? frac1.texFractionSimplifiee : frac2.texFractionSimplifiee}$ et $x_2=\\dfrac{${-b}+\\sqrt{${de}}}{2\\times ${ecritureParentheseSiNegatif(a)}}=${a < 0 ? frac1.texFractionSimplifiee : frac2.texFractionSimplifiee}$.<br>`
              correction += `Le discriminant est positif, donc $${fonction}$ s'annule en $${frac1.texFractionSimplifiee}$ et en $${frac2.texFractionSimplifiee}$.<br>`
              if (a > 0) {
                // a>0 donc positif puis négatif puis positif
                correction += tableauDeVariation({
                  tabInit: [
                    [
                      // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                      ['$x$', 2, 30],
                      [`$${fonction}$`, 2, 50],
                    ],
                    // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                    [
                      '$-\\infty$',
                      30,
                      `$${frac1.texFractionSimplifiee}$`,
                      20,
                      `$${frac2.texFractionSimplifiee}$`,
                      20,
                      '$+\\infty$',
                      30,
                    ],
                  ],
                  // tabLines ci-dessous contient les autres lignes du tableau.
                  tabLines: [
                    [
                      'Line',
                      30,
                      '',
                      0,
                      '+',
                      20,
                      'z',
                      20,
                      '-',
                      20,
                      'z',
                      20,
                      '+',
                      20,
                    ],
                  ],
                  espcl: 3.5, // taille en cm entre deux antécédents
                  deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
                  lgt: 8, // taille de la première colonne en cm
                  hauteurLignes: [12, 15],
                })
                correction += `le coefficient de $x^2$ étant positif, $${fonction}\\leqslant 0$ pour $x\\in \\left[${frac1.texFractionSimplifiee};${frac2.texFractionSimplifiee}\\right]$.<br>`
                answer = `\\left]-\\infty;${frac1.texFractionSimplifiee}\\right[\\cup\\left]${frac2.texFractionSimplifiee};+\\infty\\right[`
              } else {
                // a<0 donc positif entre les racines.
                correction += tableauDeVariation({
                  tabInit: [
                    [
                      // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                      ['$x$', 2, 30],
                      [`$${fonction}$`, 2, 50],
                    ],
                    // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                    [
                      '$-\\infty$',
                      30,
                      `$${frac1.texFractionSimplifiee}$`,
                      20,
                      `$${frac2.texFractionSimplifiee}$`,
                      20,
                      '$+\\infty$',
                      30,
                    ],
                  ],
                  // tabLines ci-dessous contient les autres lignes du tableau.
                  tabLines: [
                    [
                      'Line',
                      30,
                      '',
                      0,
                      '-',
                      20,
                      'z',
                      20,
                      '+',
                      20,
                      'z',
                      20,
                      '-',
                      20,
                    ],
                  ],
                  espcl: 3.5, // taille en cm entre deux antécédents
                  deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
                  lgt: 8, // taille de la première colonne en cm
                  hauteurLignes: [12, 15],
                })
                correction += `le coefficient de $x^2$ étant négatif, $${fonction}> 0$ pour $x\\in \\left]${frac1.texFractionSimplifiee};${frac2.texFractionSimplifiee}\\right[$.<br>`
                answer = `\\left]${frac1.texFractionSimplifiee};${frac2.texFractionSimplifiee}\\right[`
              }
            } else {
              // une racine double
              correction +=
                `\\quad x_1=x_2=\\dfrac{${-b}}{2\\times ${ecritureParentheseSiNegatif(a)}}=${frac1.texFractionSimplifiee}$.<br>` +
                tableauDeVariation({
                  tabInit: [
                    [
                      // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                      ['$x$', 2, 30],
                      [`$${fonction}$`, 2, 50],
                    ],
                    // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                    [
                      '$-\\infty$',
                      30,
                      `$${frac1.texFractionSimplifiee}$`,
                      20,
                      '$+\\infty$',
                      30,
                    ],
                  ],
                  // tabLines ci-dessous contient les autres lignes du tableau.
                  tabLines: [
                    [
                      'Line',
                      30,
                      '',
                      0,
                      `${a > 0 ? '+' : '-'}`,
                      20,
                      'z',
                      20,
                      `${a > 0 ? '+' : '-'}`,
                      20,
                    ],
                  ],
                  espcl: 3.5, // taille en cm entre deux antécédents
                  deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
                  lgt: 8, // taille de la première colonne en cm
                  hauteurLignes: [12, 15],
                })
              correction += `Le discriminant est nul, donc $${fonction}$ s'annule en $${frac1.texFractionSimplifiee}$ et est du signe de son coefficient de degré $2$, soit ${a > 0 ? 'positif' : 'négatif'}.<br>`
              answer =
                a > 0
                  ? `\\mathbb{R}\\backslash\\{${frac1.texFractionSimplifiee}\\}`
                  : '\\emptyset'
              if (a > 0) {
                answerReunion = `\\left]-\\infty;${frac1.texFractionSimplifiee}\\right[\\cup\\left]${frac1.texFractionSimplifiee};+\\infty\\right[`
              }
            }
          } else {
            // on veut un Delta négatif.
            do {
              a = randint(-3, 3, 0)
              b = randint(-9, 9, [0, a, -a])
              c = randint(-3, 3, [a, 0])
              d = randint(-9, 9, [0, c, -c])
              de = b * b - 4 * a * c
            } while (de >= 0)
            fonction = reduirePolynomeDegre3(0, a, b, c)
            correction += `$${fonction}$ est un polynôme de degré $2$, calculons son discriminant : <br>`
            correction += `$\\Delta=${ecritureParentheseSiNegatif(b)}^2-4\\times ${ecritureParentheseSiNegatif(a)}\\times ${ecritureParentheseSiNegatif(c)}=${b * b - 4 * a * c}`
            correction += `$.<br>Le discriminant est négatif, donc $${fonction}$ est du signe de son coefficient de degré $2$, soit ${a > 0 ? 'positif' : 'négatif'}.<br>`
            correction += tableauDeVariation({
              tabInit: [
                [
                  // Première colonne du tableau avec le format [chaine d'entête, hauteur de ligne, nombre de pixels de largeur estimée du texte pour le centrage]
                  ['$x$', 2, 30],
                  [`$${fonction}$`, 2, 50],
                ],
                // Première ligne du tableau avec chaque antécédent suivi de son nombre de pixels de largeur estimée du texte pour le centrage
                ['$-\\infty$', 30, '$+\\infty$', 30],
              ],
              // tabLines ci-dessous contient les autres lignes du tableau.
              tabLines: [['Line', 30, '', 0, `${a > 0 ? '+' : '-'}`, 20]],
              espcl: 3.5, // taille en cm entre deux antécédents
              deltacl: 0.8, // distance entre la bordure et les premiers et derniers antécédents
              lgt: 8, // taille de la première colonne en cm
              hauteurLignes: [12, 15],
            })
            answer = a > 0 ? '\\mathbb{R}' : '\\emptyset'
          }
        }
      }
      texte += `${logString}\\left(${fonction}\\right)$<br>`
      texteCorr = `La fonction $${logString}$ est définie sur $\\mathbb{R}_+^*$, donc $x$ doit vérifier $${fonction}>0$<br>`
      correction += `Donc $\\mathcal{D}_{f_${i}}=${miseEnEvidence(answer)}$`
      texteCorr += correction
      if (this.questionJamaisPosee(i, a, b, c, d)) {
        if (this.interactif) {
          texte += ajouteChampTexteMathLive(
            this,
            i,
            `${KeyboardType.clavierEnsemble}`,
          )
          handleAnswers(this, i, {
            reponse: {
              value: answerReunion !== '' ? [answer, answerReunion] : answer,
              options: { intervalle: true },
            },
          })
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
