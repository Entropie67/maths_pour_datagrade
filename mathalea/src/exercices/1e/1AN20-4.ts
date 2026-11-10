import { tableauVariationsFonction } from '../../lib/mathFonctions/etudeFonction'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  egalOuApprox,
  reduireAxPlusB,
  reduirePolynomeDegre3,
} from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Trinome from '../../modules/Trinome'
import Exercice from '../Exercice'
export const titre =
  "Étudier le sens de variation d'une fonction polynôme du troisième degré (avec discriminant)"
export const dateDePublication = '08/07/2024'
export const dateDeModifImportante = '26/09/2024'
export const interactifReady = false
export const uuid = 'e1890'
export const refs = {
  'fr-fr': ['1AN20-4', 'TSA3-14', 'TCA7-14'],
  'fr-ch': ['3mA3-1'],
}

/**
 * Étudier le sens de variation d'une fonction polynôme du troisième degré (avec discriminant)'
 * @author Gilles Mora
 */

export default class EtudeFctPoly3 extends Exercice {
  constructor() {
    super()
    // Déclaré explicitement pour le contrôle des corrections minimales : tableau de variations à dresser : pas de réponse courte.
    this.reponseCourteDisponible = false
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 : Dérivée avec des racines entières\n2 : Dérivée sans racine\n3 : Dérivée avec des racines non forcément entières\n4: Mélange',
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
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let fonction // La fonction étudiée
      let derivee // Sa dérivée
      let xMin // La borne gauche de l'intervalle d'étude (prévoir une valeur de remplacement pour les infinis + et -)
      let xMax // La borne droite de l'intervalle d'étude
      let substituts = [] // les valeur de substitution pour xMin ou xMax...
      let tolerance // la tolérance doit être réglée au cas par cas, car pour la dérivée de 1/x entre 17 et 19 par exemple, il y a trop peu de différence avec zéro !
      switch (listeDeQuestions[i]) {
        case 1: //
          {
            const a = randint(-2, 2, 0)
            const x1 = randint(-3, 3)
            const x2 = randint(-5, 5, x1)
            const k = randint(-3, 3)
            const p = new Trinome(6 * a, -6 * a * (x1 + x2), 6 * a * x1 * x2)
            fonction = (x: number) =>
              2 * a * x ** 3 -
              3 * a * x1 * x ** 2 -
              3 * a * x2 * x ** 2 +
              6 * a * x1 * x2 * x +
              k
            derivee = (x: number) =>
              6 * a * x ** 2 - 6 * a * x1 * x - 6 * a * x2 * x + 6 * a * x1 * x2
            tolerance = 0.005
            xMin = -10
            xMax = 10
            substituts = [
              {
                antVal: -10,
                antTex: '$-\\infty$',
                imgTex: ' ',
              },
              {
                antVal: 10,
                antTex: '$+\\infty$',
                imgTex: ' ',
              },
            ]
            const tableau = tableauVariationsFonction(
              fonction as (x: FractionEtendue | number) => number,
              derivee as (x: FractionEtendue | number) => number,
              xMin,
              xMax,
              { ligneDerivee: true, substituts, step: 1, tolerance },
            )

            texte = `On considère la fonction $f$ définie sur $\\mathbb{R}$ par : $f(x)=${reduirePolynomeDegre3(2 * a, -3 * a * x1 - 3 * a * x2, 6 * a * x1 * x2, k)}$.<br>
      Étudier le sens de variation de la fonction $f$ sur $\\mathbb{R}$.
      `

            texteCorr += `$f$ est une fonction polynôme du troisième degré, dérivable sur $\\mathbb{R}$.<br>
            Pour tout $x\\in\\mathbb{R}$, $f^\\prime(x)=${reduirePolynomeDegre3(0, 6 * a, -6 * a * (x1 + x2), 6 * a * x1 * x2)}$.<br><br>
            $f^\\prime$ est une fonction polynôme du second degré. <br><br>`
            if (6 * a * x1 * x2 === 0 || -6 * a * (x1 + x2) === 0) {
              if (6 * a * x1 * x2 === 0) {
                texteCorr += `En factorisant par $x$, on obtient $f'(x)=x(${reduireAxPlusB(6 * a, -6 * a * (x1 + x2))})$.<br>
       Les racines de $f'(x)$ sont les solutions de l'équation produit-nul : $x(${reduireAxPlusB(6 * a, -6 * a * (x1 + x2))})=0$.<br>
       Cette équation a pour solution $${x1 > x2 ? `${x2}` : `${x1}`}$ et $${x1 > x2 ? `${x1}` : `${x2}`}$.<br><br>
       `
              } else {
                texteCorr += `Les racines de $f'(x)$ sont les solutions de l'équation $${6 * a}x^2${ecritureAlgebrique(6 * a * x1 * x2)}=0$, soit $x^2=${x1 ** 2}$.<br>
    Cette équation a pour solutions  $${x1 > x2 ? `${x2}` : `${x1}`}$ et $${x1 > x2 ? `${x1}` : `${x2}`}$.<br><br>

    `
              }
            } else {
              texteCorr += `Comme $\\Delta=${p.texCalculDiscriminant}$, le discriminant est strictement positif, donc le polynôme a deux racines.`
              texteCorr += `<br><br>$${p.texCalculRacine1(true)}$`
              texteCorr += `<br><br>$${p.texCalculRacine2(true)}$<br><br>`
            }
            texteCorr += ` $f'(x)$ est du signe de $${6 * a}$ ${6 * a > 0 ? 'donc positif' : 'donc négatif'} sauf entre ses racines. <br><br>
        On en déduit le tableau de signes de $f'(x)$ et le tableau de variations de $f$ :<br><br>`
            texteCorr += `${tableau}`
          }
          break

        case 2: //
          {
            let a = randint(-5, 5, 0)
            let b = randint(-4, 4)
            let c = randint(-5, 5, 0)
            let d = randint(-3, 3, 0)
            do {
              a = randint(-5, 5, 0)
              b = randint(-4, 4)
              c = randint(-5, 5, 0)
              d = randint(-3, 3)
            } while (4 * b ** 2 - 12 * a * c >= 0)
            const p = new Trinome(3 * a, 2 * b, c)
            const sol = new FractionEtendue(-c, 3 * a)
            fonction = (x: number) => a * x ** 3 + b * x ** 2 + c * x + d
            derivee = (x: number) => 3 * a * x ** 2 + 2 * b * x + c
            tolerance = 0.005
            xMin = -10
            xMax = 10
            substituts = [
              {
                antVal: -10,
                antTex: '$-\\infty$',
                imgTex: ' ',
              },
              { antVal: 10, antTex: '$+\\infty$', imgTex: ' ' },
            ]
            const tableau = tableauVariationsFonction(
              fonction as (x: FractionEtendue | number) => number,
              derivee as (x: FractionEtendue | number) => number,
              xMin,
              xMax,
              { ligneDerivee: true, substituts, step: 1, tolerance },
            )

            texte = `On considère la fonction $f$ définie sur $\\mathbb{R}$ par : $f(x)=${reduirePolynomeDegre3(a, b, c, d)}$.<br>
      Étudier le sens de variation de la fonction $f$ sur $\\mathbb{R}$.`
            texteCorr = `$f$ est une fonction polynôme du troisième degré, dérivable sur $\\mathbb{R}$.<br>
      Pour tout  $x\\in\\mathbb{R}$, $f^\\prime(x)=${reduirePolynomeDegre3(0, 3 * a, 2 * b, c)}$.<br><br>
      $f^\\prime$ est une fonction polynôme du second degré. <br>`

            if (2 * b === 0) {
              texteCorr += `Les racines de $f'(x)$ sont les solutions de l'équation $${reduirePolynomeDegre3(0, 3 * a, 2 * b, c)}=0$, soit $x^2=${sol.simplifie().texFraction}$.<br>
      Cette équation n'a pas de solution et par suite $f'(x)$ n'a pas de racine.`
            } else {
              texteCorr += `Comme $\\Delta=${p.texCalculDiscriminant}$, le discriminant est strictement négatif, donc $f'(x)$ n'a pas de racine.`
            }

            texteCorr += `<br><br> $f'(x)$ est  du signe de   $${3 * a}$ ${3 * a > 0 ? 'donc positif' : 'donc négatif'} sur $\\mathbb{R}$. <br><br>
        On en déduit le tableau de signes de $f'(x)$ et le tableau de variations de $f$ :<br><br>`
            texteCorr += `${tableau}`
          }
          break

        case 3: //
          {
            let a = randint(-5, 5, 0)
            let b = randint(-5, 5, 0)
            let c = randint(-5, 5, 0)
            const d = randint(-5, 5, 0)
            let p = new Trinome(3 * a, 2 * b, c)
            while (4 * b ** 2 - 12 * a * c <= 0) {
              a = randint(-5, 5, 0)
              b = randint(-5, 5, 0)
              c = randint(-5, 5, 0)
              p = new Trinome(3 * a, 2 * b, c)
            }
            fonction = (x: number) => a * x ** 3 + b * x ** 2 + c * x + d
            derivee = (x: number) => 3 * a * x ** 2 + 2 * b * x + c
            tolerance = 0.005
            xMin = -10
            xMax = 10

            texte = `On considère la fonction $f$ définie sur $\\mathbb{R}$ par : $f(x)=${reduirePolynomeDegre3(a, b, c, d)}$.<br>
      Étudier le sens de variation de la fonction $f$ sur $\\mathbb{R}$.
      `

            texteCorr += `$f$ est une fonction polynôme du troisième degré, dérivable sur $\\mathbb{R}$.<br>
            Pour tout $x\\in\\mathbb{R}$, $f^\\prime(x)=${p}$.<br><br>
             $f^\\prime$ est une fonction polynôme du second degré. <br><br>`

            if (4 * b ** 2 - 12 * a * c > 0) {
              const calculs1 = p.texCalculRacine1(true).split('=')
              const calculs2 = p.texCalculRacine2(true).split('=')
              // Attention : la tolérance étant de 0.005, il faut aller au dix-millième pour les valeurs de p.x1 et p.x2
              const valX1 =
                p.x1 instanceof FractionEtendue
                  ? Math.round(p.x1.valeurDecimale * 10000) / 10000
                  : p.x1
                    ? Number(p.x1.toFixed(4))
                    : NaN
              const valX2 =
                p.x2 instanceof FractionEtendue
                  ? Math.round(p.x2.valeurDecimale * 10000) / 10000
                  : p.x2
                    ? Number(p.x2.toFixed(4))
                    : NaN
              const texX1 = calculs1[calculs1.length - 1]
              const texX2 = calculs2[calculs2.length - 1]
              const fDeX1 =
                p.x1 instanceof FractionEtendue
                  ? p.x1
                      .puissanceFraction(3)
                      .multiplieEntier(a)
                      .sommeFraction(
                        p.x1.puissanceFraction(2).multiplieEntier(b),
                      )
                      .sommeFraction(p.x1.multiplieEntier(c))
                      .ajouteEntier(d)
                  : fonction(Number(p.x1))
              const fDeX2 =
                p.x2 instanceof FractionEtendue
                  ? p.x2
                      .puissanceFraction(3)
                      .multiplieEntier(a)
                      .sommeFraction(
                        p.x2.puissanceFraction(2).multiplieEntier(b),
                      )
                      .sommeFraction(p.x2.multiplieEntier(c))
                      .ajouteEntier(d)
                  : fonction(Number(p.x2))
              texteCorr += `Comme $\\Delta=${p.texCalculDiscriminant}$, le discriminant est strictement positif, donc le polynôme a deux racines :`
              texteCorr += `<br><br>$${p.texCalculRacine1(true)}$`
              texteCorr += `<br><br>$${p.texCalculRacine2(true)}$<br><br>`
              texteCorr += `$\\begin{aligned}\\alpha_1&=f\\Big(${p.texX1}\\Big)\\\\
              &=${Math.abs(a) === 1 ? (a < 0 ? '-' : '') : `${a}\\times `}${p.texX1.startsWith('-') || p.texX1.startsWith('\\dfrac') ? `\\Big(${p.texX1}\\Big)^3` : `${p.texX1}^3`}${Math.abs(b) === 1 ? (b < 0 ? '-' : '+') : `${ecritureAlgebrique(b)}\\times `} ${p.texX1.startsWith('-') || p.texX1.startsWith('\\dfrac') ? `\\Big(${p.texX1}\\Big)^2` : `${p.texX1}^2`}${Math.abs(c) === 1 ? (c < 0 ? '-' : '+') : `${ecritureAlgebriqueSauf1(c)}\\times `}${p.texX1.startsWith('-') ? `\\Big(${p.texX1}\\Big)` : `${p.texX1}`}${ecritureAlgebrique(d)}\\\\
              &${fDeX1 instanceof FractionEtendue ? `=${fDeX1.texFractionSimplifiee}` : `${egalOuApprox(fonction(Number(p.x1)), 4)}${texNombre(fonction(Number(p.x1)), 4)}`}\\end{aligned}$<br><br>
            $\\begin{aligned}\\alpha_2&=f\\Big(${p.texX2}\\Big)\\\\
            &=${Math.abs(a) === 1 ? (a < 0 ? '-' : '') : `${a}\\times `}${p.texX2.startsWith('-') || p.texX2.startsWith('\\dfrac') ? `\\Big(${p.texX2}\\Big)^3` : `${p.texX2}^3`}${Math.abs(b) === 1 ? (b < 0 ? '-' : '+') : `${ecritureAlgebrique(b)}\\times `} ${p.texX2.startsWith('-') || p.texX2.startsWith('\\dfrac') ? `\\Big(${p.texX2}\\Big)^2` : `${p.texX2}^2`}${Math.abs(c) === 1 ? (c < 0 ? '-' : '+') : `${ecritureAlgebriqueSauf1(c)}\\times `}${p.texX2.startsWith('-') ? `\\Big(${p.texX2}\\Big)` : `${p.texX2}`}${ecritureAlgebrique(d)}\\\\
            &${fDeX2 instanceof FractionEtendue ? `=${fDeX2.texFractionSimplifiee}` : `${egalOuApprox(fonction(Number(p.x2)), 4)}${texNombre(fonction(Number(p.x2)), 4)}`}\\end{aligned}$<br><br>`
              substituts = [
                { antVal: -10, antTex: '$-\\infty$', imgTex: ' ' },
                {
                  antVal: valX1,
                  antTex: texX1,
                  imgVal: fonction(Number(p.x1)),
                  imgTex: '$\\alpha_1$',
                },
                {
                  antVal: valX2,
                  antTex: texX2,
                  imgVal: fonction(Number(p.x2)),
                  imgTex: '$\\alpha_2$',
                },
                { antVal: 10, antTex: '$+\\infty$', imgTex: ' ' },
              ]
            } else {
              texteCorr += ''
              substituts = [
                { antVal: -10, antTex: '$-\\infty$', imgTex: ' ' },
                { antVal: 10, antTex: '$+\\infty$', imgTex: ' ' },
              ]
            }
            const tableau = tableauVariationsFonction(
              fonction as (x: FractionEtendue | number) => number,
              derivee as (x: FractionEtendue | number) => number,
              xMin,
              xMax,
              { ligneDerivee: true, substituts, step: 0.1, tolerance },
            )

            texteCorr += `${tableau}`
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
