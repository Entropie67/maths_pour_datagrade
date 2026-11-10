import { createList } from '../../lib/format/lists'
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduirePolynomeDegre3,
} from '../../lib/outils/ecritures'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
export const titre =
  "Étudier le sens de variation d'une fonction polynôme du troisième degré (sans discriminant)"
export const dateDePublication = '08/06/2025'
export const dateDeModifImportante = '08/06/2025'
export const interactifReady = false
export const uuid = '73d34'

export const refs = {
  'fr-fr': ['1AN20-4bis', '1Tec-D25'],
  'fr-ch': [],
}

/**
 * Étudier le sens de variation d'une fonction polynôme du troisième degré (sans discriminant)'
 * @author Louis Paternault
 */

export default class EtudeFctPoly3 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  /**
   * Construit le tableau de variations de la fonction.
   */
  tableau(
    fonction: (x: number) => number,
    a: number,
    x1: number,
    x2: number,
    xMin: number,
    xMax: number,
  ) {
    function signe(a: number) {
      if (a < 0) {
        return '-'
      } else {
        return '+'
      }
    }

    return tableauDeVariation({
      tabInit: [
        [
          ['x', 1.5, 10],
          [a.toString(), 2, 10],
          [`$${reduirePolynomeDegre3(0, 0, 1, -x1)}$`, 2, 10],
          [`$${reduirePolynomeDegre3(0, 0, 1, -x2)}$`, 2, 10],
          ["f'(x)", 2, 10],
          ['f', 3, 10],
        ],
        [
          xMin.toString(),
          10,
          Math.min(x1, x2).toString(),
          10,
          Math.max(x1, x2).toString(),
          10,
          xMax.toString(),
          10,
        ],
      ],
      tabLines: [
        [
          'Line',
          30,
          '',
          10,
          signe(a),
          10,
          't',
          10,
          signe(a),
          10,
          't',
          10,
          signe(a),
        ],
        [
          'Line',
          30,
          '',
          10,
          '-',
          10,
          x1 < x2 ? 'z' : 't',
          10,
          x1 < x2 ? '+' : '-',
          10,
          x1 < x2 ? 't' : 'z',
          10,
          '+',
        ],
        [
          'Line',
          30,
          '',
          10,
          '-',
          10,
          x1 < x2 ? 't' : 'z',
          10,
          x1 < x2 ? '-' : '+',
          10,
          x1 < x2 ? 'z' : 't',
          10,
          '+',
        ],
        [
          'Line',
          30,
          '',
          10,
          signe(a),
          10,
          'z',
          10,
          signe(-a),
          10,
          'z',
          10,
          signe(a),
        ],
        [
          'Var',
          10,
          `${signe(-a)}/${texNombre(fonction(xMin))}`,
          10,
          `${signe(a)}/${texNombre(fonction(Math.min(x1, x2)))}`,
          10,
          `${signe(-a)}/${texNombre(fonction(Math.max(x1, x2)))}`,
          10,
          `${signe(a)}/${texNombre(fonction(xMax))}`,
        ],
      ],
    })
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''

      const a = 3 * randint(-3, 3, [0, 1])
      const x1 = randint(-5, 5, 0)
      let x2 = randint(-10, 10, [0, x1, -x1, 1 - x1]) // Pour s'assurer que la somme soit non nulle, différente de 1, et que x1 et x2 soient différents
      if ((x1 + x2) % 2 !== 0) {
        // On veut que la somme soit paire, pour éviter les nombres à virgule
        if (x1 < x2) {
          x2 = x2 + 1
        } else {
          x2 = x2 - 1
        }
      }
      const k = randint(-3, 3, 0) // Constante de la fonction
      const xMin = Math.min(x1, x2) - 2 // Borne gauche de l'intervalle d'étude
      const xMax = Math.max(x1, x2) + 2 // Borne droite de l'intervalle d'étude
      const intervalle = `[${xMin};${xMax}]` // Représentation de l'intervalle de définition comme un texte
      const fonction = (x: number) =>
        (a / 3) * x ** 3 - ((a * (x1 + x2)) / 2) * x ** 2 + a * x1 * x2 * x + k

      texte = `On considère la fonction $f$ définie sur $${intervalle}$ par : $f(x)=${reduirePolynomeDegre3(a / 3, (-a * (x1 + x2)) / 2, a * x1 * x2, k)}$. Le but de l'exercice est d'étudier le sens de variation de la fonction $f$ sur son intervalle de définition, puis de déterminer ses éventuels extremums.`

      texte += createList({
        items: [
          createList({
            items: [
              'Dériver la fonction $f$.',
              `Montrer que pour tout $x\\in${intervalle}$, on a : $f'(x)=${a}(${reduirePolynomeDegre3(0, 0, 1, -x1)})(${reduirePolynomeDegre3(0, 0, 1, -x2)})$.`,
            ],
            style: 'alpha',
          }),
          "Dresser le tableau de signes de la dérivée $f'$, puis en déduire les variations de la fonction $f$.",
          `Donner les extremums de la fonction $f$ sur l'intervalle $${intervalle}$.`,
        ],
        style: 'nombres',
      })

      texteCorr += createList({
        items: [
          createList({
            items: [
              `$f$ est une fonction polynôme du troisième degré, donc dérivable sur son intervalle de définition $${intervalle}$.
                 Donc pour tout $x\\in${intervalle}$, on a : $f^\\prime(x)=${a / 3}\\times 3x^2 ${ecritureAlgebrique((-a * (x1 + x2)) / 2)}\\times 2x ${ecritureAlgebrique(a * x1 * x2)}= ${reduirePolynomeDegre3(0, a, -a * (x1 + x2), a * x1 * x2)}$.`,
              `D'une part, nous venons de montrer que pour tout $x\\in${intervalle}$, on a : $f^\\prime(x)=${reduirePolynomeDegre3(0, a, -a * (x1 + x2), a * x1 * x2)}$.<br><br>
                D'autre part, développons la forme factorisée donnée dans l'énoncé :
                  $${a}(${reduirePolynomeDegre3(0, 0, 1, -x1)})(${reduirePolynomeDegre3(0, 0, 1, -x2)})=${a}\\left(x\\times x ${ecritureAlgebrique(-x2)}\\times x ${ecritureAlgebrique(-x1)}\\times x ${ecritureAlgebrique(-x1)}\\times ${ecritureParentheseSiNegatif(-x2)}\\right)$<br>
                  $\\phantom{${a}(${reduirePolynomeDegre3(0, 0, 1, -x1)})(${reduirePolynomeDegre3(0, 0, 1, -x2)})}=${a}\\left(x^2 ${ecritureAlgebrique(-x1 - x2)}x ${ecritureAlgebrique(x1 * x2)}\\right)$<br>
                  $\\phantom{${a}(${reduirePolynomeDegre3(0, 0, 1, -x1)})(${reduirePolynomeDegre3(0, 0, 1, -x2)})}=${a}x^2 ${ecritureAlgebrique(a)}\\times ${ecritureParentheseSiNegatif(-x1 - x2)}x ${ecritureAlgebrique(a)}\\times ${ecritureParentheseSiNegatif(x1 * x2)}$<br>
                  $\\phantom{${a}(${reduirePolynomeDegre3(0, 0, 1, -x1)})(${reduirePolynomeDegre3(0, 0, 1, -x2)})}=${reduirePolynomeDegre3(0, a, -a * (x1 + x2), a * x1 * x2)}$<br>
                  $\\phantom{${a}(${reduirePolynomeDegre3(0, 0, 1, -x1)})(${reduirePolynomeDegre3(0, 0, 1, -x2)})}=f'(x)$<br>
                  <br>
                  Nous avons donc bien montré que pour tout $x$ de son domaine de définition, $f'(x)=${a}(${reduirePolynomeDegre3(0, 0, 1, -x1)})(${reduirePolynomeDegre3(0, 0, 1, -x2)})$.
                    `,
            ],
            style: 'alpha',
          }),
          `Pour étudier le signe de la dérivée, nous allons étudier le signe de chacun des trois membres de la forme factorisée $f'(x)=${a}(${reduirePolynomeDegre3(0, 0, 1, -x1)})(${reduirePolynomeDegre3(0, 0, 1, -x2)})$.` +
            createList({
              items: [
                `Tout d'abord, le nombre $${a}$ est ${a > 0 ? 'positif' : 'négatif'}.`,
                `Ensuite, le membre $${reduirePolynomeDegre3(0, 0, 1, -x1)}$ est une fonction affine, de coefficient directeur $1$ positif, donc croissante. Elle est donc d'abord négative, puis positive, en changeant de signe lorsque $${reduirePolynomeDegre3(0, 0, 1, -x1)}=0$, c'est-à-dire lorsque $x=${x1}$.`,
                `Enfin, pour les mêmes raisons, le membre $${reduirePolynomeDegre3(0, 0, 1, -x2)}$ est négatif puis positif, et change de signe lorsque $x=${x2}$.`,
              ],
              style: 'puces',
            }) +
            "Cela donne le tableau de signes suivant, que l'on complète avec le tableau de variations de $f$.<br>" +
            this.tableau(fonction, a, x1, x2, xMin, xMax) +
            `<br>Les valeurs des extremums ont été calculées comme les images des abscisses correspondantes par la fonction, par exemple $f(${xMin})=${a / 3}\\times ${ecritureParentheseSiNegatif(xMin)}^3 ${ecritureAlgebrique((-a * (x1 + x2)) / 2)}\\times ${ecritureParentheseSiNegatif(xMin)}^2 ${ecritureAlgebrique(a * x1 * x2)}\\times ${ecritureParentheseSiNegatif(xMin)} ${ecritureAlgebrique(k)}=${texNombre(fonction(xMin))}$.`,
          `D'après le tableau de variations, il y a deux maximums locaux : $${texNombre(a < 0 ? fonction(xMin) : fonction(xMax))}$ (atteint en $x=${a < 0 ? xMin : xMax}$) et $${texNombre(a < 0 ? fonction(Math.max(x1, x2)) : fonction(Math.min(x1, x2)))}$ (atteint en $x=${a < 0 ? Math.max(x1, x2) : Math.min(x1, x2)}$). Le maximum global est le plus grand des deux, c'est à dire $${miseEnEvidence(texNombre(Math.max(fonction(xMin), fonction(xMax), fonction(x1), fonction(x2))))}$.<br>
              De même, le minimum global est $${miseEnEvidence(texNombre(Math.min(fonction(xMin), fonction(xMax), fonction(x1), fonction(x2))))}$.`,
        ],
        style: 'nombres',
      })

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
