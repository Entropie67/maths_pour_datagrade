import { texteCentre } from '../../lib/format/miseEnPage'
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Trinome from '../../modules/Trinome'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'
export const titre =
  "Déterminer le maximum ou le minimum d'une fonction sur un intervalle"
export const dateDePublication = '25/05/2026'
export const interactifReady = false
export const uuid = '62c1f'
export const refs = {
  'fr-fr': ['1AN20-7'],
  'fr-ch': [],
}

/**
 *
 * @author Gilles Mora
 */

export default class MaxMinFonction extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacing = 2
    this.spacingCorr = 1.5
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 : Fonction $ax+b/x$\n2 : Polynôme du 3e degré\n3 : Polynôme du 2e degré (sans dérivée)\n4 : Mélange',
    ]
    this.sup = '4'
  }

  nouvelleVersion() {
    const listeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      let texteCorr = ''

      switch (listeDeQuestions[i]) {
        case 1:
          {
            // ==========================================
            // Cas 1 : f(x) = ax + b/x sur [m ; n]
            // ==========================================

            // 3 sous-cas :
            // 1 : a > 0, b > 0 (décroît puis croît, minimum local)
            // 2 : a < 0, b < 0 (croît puis décroît, maximum local)
            // 3 : a > 0, b < 0 (strictement croissante, pas d'extremum local)
            const typeVariation = randint(1, 3)

            let coefA: number,
              coefB: number,
              r: number = 0

            if (typeVariation === 1) {
              coefA = randint(1, 3)
              r = randint(2, 5)
              coefB = coefA * r * r
            } else if (typeVariation === 2) {
              coefA = -randint(1, 3)
              r = randint(2, 5)
              coefB = coefA * r * r
            } else {
              coefA = randint(1, 4)
              coefB = -randint(1, 9)
            }

            // Choix de l'intervalle [m ; n]
            let m, n
            if (typeVariation !== 3) {
              m = randint(1, r - 1)
              n = randint(r + 1, r + 5)
            } else {
              m = randint(1, 3)
              n = m + randint(2, 5)
            }

            // Valeurs aux points clés
            const fDeM = new FractionEtendue(
              coefA * m * m + coefB,
              m,
            ).simplifie()
            const fDeN = new FractionEtendue(
              coefA * n * n + coefB,
              n,
            ).simplifie()

            const fDeMTex = fDeM.estEntiere
              ? `${fDeM.num}`
              : fDeM.texFractionSimplifiee
            const fDeNTex = fDeN.estEntiere
              ? `${fDeN.num}`
              : fDeN.texFractionSimplifiee

            const fDeMVal = fDeM.valeurDecimale
            const fDeNVal = fDeN.valeurDecimale

            // Écriture de f(x)
            const fTex = `${rienSi1(coefA)}x${coefB > 0 ? '+' : '-'}\\dfrac{${Math.abs(coefB)}}{x}`

            // Écriture de f'(x) = a - b/x²
            const fPrimeTex = `${coefA}${coefB > 0 ? '-' : '+'}\\dfrac{${Math.abs(coefB)}}{x^2}`

            // Numérateur de f'(x) sous forme ax² - b via ecritureAlgebrique
            const numFPrimeTex = `${rienSi1(coefA)}x^2${ecritureAlgebrique(-coefB)}`

            // --- Énoncé ---
            texte =
              `On considère la fonction $f$ définie sur $[${m}\\,;${n}]$ par${sp()}:` +
              `${texteCentre(`$f(x)=${fTex}$.`)}` +
              `Déterminer le maximum et le minimum de $f$ sur $[${m}\\,;${n}]$.`

            // --- Correction ---
            texteCorr =
              `$f$ est dérivable sur $[${m}\\,;${n}]$ comme somme de fonctions dérivables sur $[${m}\\,;${n}]$.<br>` +
              `Pour tout $x\\in [${m}\\,;${n}]$${sp()}:<br>` +
              `$f'(x)=${fPrimeTex}=\\dfrac{${numFPrimeTex}}{x^2}$.<br>`

            if (typeVariation === 3) {
              // Cas de la fonction strictement croissante
              texteCorr +=
                `Sur $[${m}\\,;${n}]$, $x^2>0$ et $${numFPrimeTex} > 0$, donc $f'(x) > 0$.<br>` +
                `La fonction $f$ est donc strictement croissante sur l'intervalle $[${m}\\,;${n}]$.<br>`

              const ligneFprime = ['Line', 30, '', 0, '+', 20]
              const ligneVar = [
                'Var',
                10,
                `-/$${fDeMTex}$`,
                20,
                `+/$${fDeNTex}$`,
                10,
              ]

              const tableau = tableauDeVariation({
                tabInit: [
                  [
                    ['$x$', 2, 20],
                    ["$f'(x)$", 2, 25],
                    ['$f(x)$', 4, 100],
                  ],
                  [`$${m}$`, 30, `$${n}$`, 30],
                ],
                tabLines: [ligneFprime, ligneVar],
                espcl: 5,
                deltacl: 0.8,
                lgt: 6,
                scale: context.isHtml ? 1 : 0.5,
              })

              texteCorr += `On en déduit le tableau de variations de $f$ sur $[${m}\\,;${n}]$${sp()}:<br><br>${tableau}<br>`

              texteCorr += `D'après le tableau de variations, le minimum de $f$ sur $[${m}\\,;${n}]$ est $f(${m})=${miseEnEvidence(fDeMTex)}$, atteint en $x=${m}$.<br>`
              texteCorr += `Le maximum de $f$ sur $[${m}\\,;${n}]$ est $f(${n})=${miseEnEvidence(fDeNTex)}$, atteint en $x=${n}$.`
            } else {
              // Cas avec extremum local (typeVariation 1 ou 2)
              const fDeR = coefA * r + coefB / r
              const fDeRTex = `${fDeR}`

              texteCorr +=
                `Sur $[${m}\\,;${n}]$, $x^2>0$ donc $f'(x)$ est du signe de $${numFPrimeTex}$.<br>` +
                `$${numFPrimeTex}=0 \\iff x^2=${r * r} \\iff x=${r}$ (car $x>0$).<br>`

              let ligneFprime, ligneVar
              if (coefA > 0) {
                // f' : - 0 + (décroît puis croît)
                ligneFprime = ['Line', 30, '', 0, '-', 20, 'z', 5, '+', 20]
                ligneVar = [
                  'Var',
                  10,
                  `+/$${fDeMTex}$`,
                  20,
                  `-/$${fDeRTex}$`,
                  20,
                  `+/$${fDeNTex}$`,
                  10,
                ]
              } else {
                // f' : + 0 - (croît puis décroît)
                ligneFprime = ['Line', 30, '', 0, '+', 20, 'z', 5, '-', 20]
                ligneVar = [
                  'Var',
                  10,
                  `-/$${fDeMTex}$`,
                  20,
                  `+/$${fDeRTex}$`,
                  20,
                  `-/$${fDeNTex}$`,
                  10,
                ]
              }

              const tableau = tableauDeVariation({
                tabInit: [
                  [
                    ['$x$', 2, 20],
                    ["$f'(x)$", 2, 25],
                    ['$f(x)$', 4, 100],
                  ],
                  [`$${m}$`, 30, `$${r}$`, 20, `$${n}$`, 30],
                ],
                tabLines: [ligneFprime, ligneVar],
                espcl: 5,
                deltacl: 0.8,
                lgt: 6,
                scale: context.isHtml ? 1 : 0.5,
              })

              texteCorr += `On en déduit le tableau de variations de $f$ sur $[${m}\\,;${n}]$${sp()}:<br><br>${tableau}<br>`

              if (coefA > 0) {
                texteCorr += `D'après le tableau de variations, le minimum de $f$ sur $[${m}\\,;${n}]$ est $f(${r})=${miseEnEvidence(fDeRTex)}$, atteint en $x=${r}$.<br>`
                if (fDeMVal >= fDeNVal) {
                  texteCorr += `Le maximum de $f$ sur $[${m}\\,;${n}]$ est $f(${m})=${miseEnEvidence(fDeMTex)}$, atteint en $x=${m}$.`
                } else {
                  texteCorr += `Le maximum de $f$ sur $[${m}\\,;${n}]$ est $f(${n})=${miseEnEvidence(fDeNTex)}$, atteint en $x=${n}$.`
                }
              } else {
                texteCorr += `D'après le tableau de variations, le maximum de $f$ sur $[${m}\\,;${n}]$ est $f(${r})=${miseEnEvidence(fDeRTex)}$, atteint en $x=${r}$.<br>`
                if (fDeMVal <= fDeNVal) {
                  texteCorr += `Le minimum de $f$ sur $[${m}\\,;${n}]$ est $f(${m})=${miseEnEvidence(fDeMTex)}$, atteint en $x=${m}$.`
                } else {
                  texteCorr += `Le minimum de $f$ sur $[${m}\\,;${n}]$ est $f(${n})=${miseEnEvidence(fDeNTex)}$, atteint en $x=${n}$.`
                }
              }
            }
          }
          break

        case 2:
          {
            // ==========================================
            // Cas 2 : polynôme du 3e degré sur [m ; n]
            // ==========================================
            const coefA = randint(-2, 2, 0)

            // On limite les racines pour éviter de trop grandes valeurs
            const r1 = randint(-2, 1)
            const r2 = randint(r1 + 1, 3)

            const k = randint(-3, 3)

            const a3 = 2 * coefA
            const a2 = -3 * coefA * (r1 + r2)
            const a1 = 6 * coefA * r1 * r2
            const a0 = k

            // On resserre l'intervalle pour éviter l'explosion des ordonnées
            const m = randint(r1 - 2, r1 - 1)
            const n = randint(r2 + 1, r2 + 2)

            const fonction = (x: number) =>
              a3 * x ** 3 + a2 * x ** 2 + a1 * x + a0

            const p = new Trinome(
              6 * coefA,
              -6 * coefA * (r1 + r2),
              6 * coefA * r1 * r2,
            )

            const fDeM = fonction(m)
            const fDeN = fonction(n)
            const fDeR1 = fonction(r1)
            const fDeR2 = fonction(r2)

            const valeursEtPoints = [
              { x: m, fx: fDeM },
              { x: r1, fx: fDeR1 },
              { x: r2, fx: fDeR2 },
              { x: n, fx: fDeN },
            ]
            const ptMax = valeursEtPoints.reduce((acc, v) =>
              v.fx > acc.fx ? v : acc,
            )
            const ptMin = valeursEtPoints.reduce((acc, v) =>
              v.fx < acc.fx ? v : acc,
            )

            let ligneFprime
            let ligneVar

            if (coefA > 0) {
              ligneFprime = [
                'Line',
                30,
                '',
                0,
                '+',
                20,
                'z',
                5,
                '-',
                20,
                'z',
                5,
                '+',
                20,
              ]
              ligneVar = [
                'Var',
                10,
                `-/$${fDeM}$`,
                20,
                `+/$${fDeR1}$`,
                20,
                `-/$${fDeR2}$`,
                20,
                `+/$${fDeN}$`,
                10,
              ]
            } else {
              ligneFprime = [
                'Line',
                30,
                '',
                0,
                '-',
                20,
                'z',
                5,
                '+',
                20,
                'z',
                5,
                '-',
                20,
              ]
              ligneVar = [
                'Var',
                10,
                `+/$${fDeM}$`,
                20,
                `-/$${fDeR1}$`,
                20,
                `+/$${fDeR2}$`,
                20,
                `-/$${fDeN}$`,
                10,
              ]
            }

            const tableau = tableauDeVariation({
              tabInit: [
                [
                  ['$x$', 2, 20],
                  ["$f'(x)$", 2, 25],
                  ['$f(x)$', 4, 150],
                ],
                [`$${m}$`, 30, `$${r1}$`, 20, `$${r2}$`, 20, `$${n}$`, 30],
              ],
              tabLines: [ligneFprime, ligneVar],
              espcl: 5,
              deltacl: 0.8,
              lgt: 6,
              scale: context.isHtml ? 1 : 0.5,
            })

            texte =
              `On considère la fonction $f$ définie sur $[${m}\\,;${n}]$ par${sp()}:` +
              `${texteCentre(`$f(x)=${reduirePolynomeDegre3(a3, a2, a1, a0)}$.`)}` +
              `Déterminer le maximum et le minimum de $f$ sur $[${m}\\,;${n}]$.`

            texteCorr =
              `$f$ est une fonction polynôme, donc dérivable sur $[${m}\\,;${n}]$.<br>` +
              `Pour tout $x\\in [${m}\\,;${n}]$, $f'(x)=${reduirePolynomeDegre3(0, 6 * coefA, -6 * coefA * (r1 + r2), 6 * coefA * r1 * r2)}$.<br>` +
              `$f'$ est un polynôme du second degré.<br>`

            if (6 * coefA * r1 * r2 === 0 || -6 * coefA * (r1 + r2) === 0) {
              if (6 * coefA * r1 * r2 === 0) {
                texteCorr +=
                  `En factorisant par $x$, on obtient $f'(x)=x(${reduireAxPlusB(6 * coefA, -6 * coefA * (r1 + r2))})$.<br>` +
                  `Les racines de $f'(x)$ sont $${r1}$ et $${r2}$.<br>`
              } else {
                texteCorr +=
                  `Les racines de $f'(x)$ sont les solutions de $${6 * coefA}x^2${ecritureAlgebrique(6 * coefA * r1 * r2)}=0$, soit $x^2=${r1 ** 2}$.<br>` +
                  `Les solutions sont $${r1}$ et $${r2}$.<br>`
              }
            } else {
              texteCorr +=
                `$\\Delta=${p.texCalculDiscriminant}$<br>` +
                `Le discriminant est strictement positif, donc $f'$ admet deux racines${sp()}:<br>` +
                `$${p.texCalculRacine1(true)}$<br>` +
                `$${p.texCalculRacine2(true)}$<br>`
            }

            texteCorr +=
              `$f'(x)$ est du signe de $${6 * coefA}$ ${6 * coefA > 0 ? '(positif)' : '(négatif)'} sauf entre ses racines.<br>` +
              `On en déduit le tableau de variations de $f$ sur $[${m}\\,;${n}]$${sp()}:<br><br>${tableau}<br>`

            texteCorr +=
              `D'après le tableau de variations${sp()}:<br>` +
              `Le minimum de $f$ sur $[${m}\\,;${n}]$ est $f(${ptMin.x})=${miseEnEvidence(ptMin.fx)}$, atteint en $x=${ptMin.x}$.<br>` +
              `Le maximum de $f$ sur $[${m}\\,;${n}]$ est $f(${ptMax.x})=${miseEnEvidence(ptMax.fx)}$, atteint en $x=${ptMax.x}$.`
          }
          break

        case 3:
          {
            // ==========================================
            // Cas 3 : Polynôme du 2e degré sur [m ; n] (Sans dérivée, via classe Trinome)
            // ==========================================
            const a = randint(-3, 3, 0)
            const alpha = randint(-2, 3) // Sommet de la parabole restreint
            const beta = randint(-5, 5)

            // f(x) = a(x - alpha)^2 + beta = ax^2 - 2a*alpha*x + a*alpha^2 + beta
            const coefA2 = a
            const coefA1 = -2 * a * alpha
            const coefA0 = a * alpha * alpha + beta

            // Instanciation de la classe Trinome
            const p = new Trinome(coefA2, coefA1, coefA0)

            // Choix d'un intervalle resserré entourant alpha pour des valeurs décentes
            const m = alpha - randint(1, 3)
            const n = alpha + randint(1, 3)

            const fonction2 = (x: number) =>
              coefA2 * x ** 2 + coefA1 * x + coefA0
            const fDeM = fonction2(m)
            const fDeN = fonction2(n)

            // Énoncé
            texte =
              `On considère la fonction $f$ définie sur $[${m}\\,;${n}]$ par${sp()}:` +
              `${texteCentre(`$f(x)=${p.tex}$.`)}` +
              `Déterminer le maximum et le minimum de $f$ sur $[${m}\\,;${n}]$.`

            // Correction théorique de la parabole avec les propriétés de la classe Trinome
            texteCorr =
              `$f$ est une fonction polynôme du second degré de la forme $ax^2+bx+c$ avec ` +
              `$a = ${p.a.texFraction}$, $b = ${p.b.texFraction}$ et $c = ${p.c.texFraction}$.<br>` +
              `Le sommet de la parabole représentative de $f$ a pour abscisse ` +
              `$\\alpha = -\\dfrac{b}{2a} = -\\dfrac{${p.b.texFraction}}{2 \\times ${p.a.ecritureParentheseSiNegatif}} = ${alpha}$.<br>`

            let ligneVar
            if (coefA2 > 0) {
              texteCorr += `Comme $a > 0$, la fonction est strictement décroissante sur $]-\\infty\\,;${alpha}]$ puis strictement croissante sur $[${alpha}\\,;+\\infty[$.<br>`
              ligneVar = [
                'Var',
                10,
                `+/$${fDeM}$`,
                20,
                `-/$${beta}$`,
                20,
                `+/$${fDeN}$`,
                10,
              ]
            } else {
              texteCorr += `Comme $a < 0$, la fonction est strictement croissante sur $]-\\infty\\,;${alpha}]$ puis strictement décroissante sur $[${alpha}\\,;+\\infty[$.<br>`
              ligneVar = [
                'Var',
                10,
                `-/$${fDeM}$`,
                20,
                `+/$${beta}$`,
                20,
                `-/$${fDeN}$`,
                10,
              ]
            }

            // Tableau de variations
            const tableau = tableauDeVariation({
              tabInit: [
                [
                  ['$x$', 2, 20],
                  ['$f(x)$', 4, 100],
                ],
                [`$${m}$`, 30, `$${alpha}$`, 20, `$${n}$`, 30],
              ],
              tabLines: [ligneVar],
              espcl: 5,
              deltacl: 0.8,
              lgt: 6,
              scale: context.isHtml ? 1 : 0.5,
            })

            texteCorr += `On dresse le tableau de variations de $f$ restreint à l'intervalle $[${m}\\,;${n}]$${sp()}:<br><br>${tableau}<br>`

            if (coefA2 > 0) {
              const maxVal = Math.max(fDeM, fDeN)
              const xMax = fDeM >= fDeN ? m : n
              texteCorr +=
                `D'après le tableau de variations${sp()}:<br>` +
                `Le minimum de $f$ sur $[${m}\\,;${n}]$ est $f(${alpha}) = ${miseEnEvidence(beta)}$, atteint en $x = ${alpha}$.<br>` +
                `Le maximum de $f$ sur $[${m}\\,;${n}]$ est $f(${xMax}) = ${miseEnEvidence(maxVal)}$, atteint en $x = ${xMax}$.`
            } else {
              const minVal = Math.min(fDeM, fDeN)
              const xMin = fDeM <= fDeN ? m : n
              texteCorr +=
                `D'après le tableau de variations${sp()}:<br>` +
                `Le maximum de $f$ sur $[${m}\\,;${n}]$ est $f(${alpha}) = ${miseEnEvidence(beta)}$, atteint en $x = ${alpha}$.<br>` +
                `Le minimum de $f$ sur $[${m}\\,;${n}]$ est $f(${xMin}) = ${miseEnEvidence(minVal)}$, atteint en $x = ${xMin}$.`
            }
          }
          break
      }

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
