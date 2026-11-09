import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  reduirePolynomeDegre3,
} from '../../lib/outils/ecritures'
import { abs, signe } from '../../lib/outils/nombres'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { sp } from '../../lib/outils/outilString'
export const dateDePublication = '22/05/2023'
export const titre =
  "Montrer qu'un nombre est ou n'est pas solution d'une inéquation"
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

/**
 * Montrer qu'un nombre est ou n'est pas solution d'une inéquation
 * @author Gilles Mora
 * 2L30-4
 */
export const uuid = '2844c'

export const refs = {
  'fr-fr': ['2L30-4', 'BP2RES20', 'BP1INE01'],
  'fr-ch': ['2mIneq-7'],
}
export default class SolInequation extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = combinaisonListes([1, 2, 3], this.nbQuestions) //, 2, 3
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typesDeQuestions = listeTypeDeQuestions[i]

      const x0 = randint(-6, 6)
      const a = randint(-3, 3, 0)
      const b = randint(-10, 10, 0)
      const c = randint(-10, 10, 0)
      const m = randint(-5, 5, [0, 1])
      const p = randint(-10, 10, 0)
      const d = choice([
        a * x0 * x0 + b * x0 + c,
        a * x0 * x0 + b * x0 + c + 1,
        a * x0 * x0 + b * x0 + c - 1,
        a * x0 * x0 + b * x0 + c + 2,
        a * x0 * x0 + b * x0 + c - 2,
      ])
      let texte = ''
      let texteCorr = ''
      let monQcm: { texte: string; texteCorr: string }
      switch (typesDeQuestions) {
        case 1: //
          texte = ` $${x0}$ est-il solution de l'inéquation $${reduirePolynomeDegre3(0, a, b, c)} < ${d}$${sp()}?`
          texteCorr = `Pour $x=${x0}$, on obtient${sp()}:<br>`
          if (context.isDiaporama) {
            texteCorr += `
           $${reduirePolynomeDegre3(0, a, b, c)}=${a === 1 ? '' : `${a}\\times`}${ecritureParentheseSiNegatif(x0)}^2${abs(b) === 1 ? `${signe(b)}` : `${ecritureAlgebrique(b)}\\times`}${ecritureParentheseSiNegatif(x0)}${ecritureAlgebrique(c)}=${a * x0 * x0 + b * x0 + c}
          $`
          } else {
            texteCorr += `
          $\\begin{aligned}
          ${reduirePolynomeDegre3(0, a, b, c)}&=${a === 1 ? '' : `${a}\\times`}${ecritureParentheseSiNegatif(x0)}^2${abs(b) === 1 ? `${signe(b)}` : `${ecritureAlgebrique(b)}\\times`}${ecritureParentheseSiNegatif(x0)}${ecritureAlgebrique(c)}\\\\
          &=${a * x0 * x0 + b * x0 + c}
         \\end{aligned}$`
          }
          if (a * x0 * x0 + b * x0 + c > d) {
            texteCorr += `<br>Or $${a * x0 * x0 + b * x0 + c} >${d}$<br>
          On en déduit que $${x0}$ n'est pas solution de l'inéquation. La réponse est ${texteEnCouleurEtGras('NON')}.`
          }
          if (a * x0 * x0 + b * x0 + c < d) {
            texteCorr += `<br> Or $${a * x0 * x0 + b * x0 + c}<${d}$<br>
          On en déduit que $${x0}$ est solution de l'inéquation. La réponse est ${texteEnCouleurEtGras('OUI')}.`
          }
          if (a * x0 * x0 + b * x0 + c === d) {
            texteCorr += `<br>$${d}$ n'est pas strictement inférieur à $${d}$.<br>
          On en déduit que $${x0}$ n'est pas solution de l'inéquation. La réponse est ${texteEnCouleurEtGras('NON')}.`
          }
          if (a * x0 * x0 + b * x0 + c < d) {
            this.autoCorrection[i] = {
              enonce: texte,
              propositions: [
                {
                  texte: 'OUI',
                  statut: true,
                },
                {
                  texte: 'NON',
                  statut: false,
                },
              ],
            }
          } else {
            this.autoCorrection[i] = {
              enonce: texte,
              propositions: [
                {
                  texte: 'NON',
                  statut: true,
                },
                {
                  texte: 'OUI',
                  statut: false,
                },
              ],
            }
          }
          monQcm = propositionsQcm(this, i)
          if (this.interactif) texte += monQcm.texte
          break

        case 2: //
          texte = ` $${x0}$ est-il solution de l'inéquation $${reduirePolynomeDegre3(0, a, b, c)} \\geqslant ${d}$${sp()}?`
          texteCorr = ` Pour $x=${x0}$, on obtient${sp()}:<br>`
          if (context.isDiaporama) {
            texteCorr += `$${reduirePolynomeDegre3(0, a, b, c)}=${a === 1 ? '' : `${a}\\times`}${ecritureParentheseSiNegatif(x0)}^2${abs(b) === 1 ? `${signe(b)}` : `${ecritureAlgebrique(b)}\\times`}${ecritureParentheseSiNegatif(x0)}${ecritureAlgebrique(c)}=${a * x0 * x0 + b * x0 + c}$
          `
          } else {
            texteCorr += ` $\\begin{aligned}
          ${reduirePolynomeDegre3(0, a, b, c)}&=${a === 1 ? '' : `${a}\\times`}${ecritureParentheseSiNegatif(x0)}^2${abs(b) === 1 ? `${signe(b)}` : `${ecritureAlgebrique(b)}\\times`}${ecritureParentheseSiNegatif(x0)}${ecritureAlgebrique(c)}\\\\
          &=${a * x0 * x0 + b * x0 + c}
          \\end{aligned}$
          `
          }
          if (a * x0 * x0 + b * x0 + c > d || a * x0 * x0 + b * x0 + c === d) {
            texteCorr += `<br> Or $${a * x0 * x0 + b * x0 + c}\\geqslant ${d}$.<br>
          On en déduit que $${x0}$ est solution de l'inéquation. La réponse est ${texteEnCouleurEtGras('OUI')}.`
          } else {
            texteCorr += `<br>Or $${a * x0 * x0 + b * x0 + c}< ${d}$.<br>
          On en déduit que $${x0}$ n'est pas solution de l'inéquation. La réponse est ${texteEnCouleurEtGras('NON')}.`
          }

          if (a * x0 * x0 + b * x0 + c > d || a * x0 * x0 + b * x0 + c === d) {
            this.autoCorrection[i] = {
              enonce: texte,
              propositions: [
                {
                  texte: 'OUI',
                  statut: true,
                },
                {
                  texte: 'NON',
                  statut: false,
                },
              ],
            }
          } else {
            this.autoCorrection[i] = {
              enonce: texte,
              propositions: [
                {
                  texte: 'NON',
                  statut: true,
                },
                {
                  texte: 'OUI',
                  statut: false,
                },
              ],
            }
          }
          monQcm = propositionsQcm(this, i)
          if (this.interactif) texte += monQcm.texte
          break

        case 3: //
          texte = ` $${x0}$ est-il solution de l'inéquation $${reduirePolynomeDegre3(0, a, b, c)} \\leqslant ${reduireAxPlusB(m, p)}$${sp()}?
          `
          if (context.isDiaporama) {
            texteCorr = `Pour $x=${x0}$, on obtient${sp()}:<br>
          $\\bullet$ $${reduirePolynomeDegre3(0, a, b, c)}=${a === 1 ? '' : `${a}\\times`}${ecritureParentheseSiNegatif(x0)}^2${abs(b) === 1 ? `${signe(b)}` : `${ecritureAlgebrique(b)}\\times`}${ecritureParentheseSiNegatif(x0)}${ecritureAlgebrique(c)}=${a * x0 * x0 + b * x0 + c}$<br>
          $\\bullet$ $${reduireAxPlusB(m, p)}=${m}\\times ${x0}${ecritureAlgebrique(p)}=${m * x0 + p}$`
          } else {
            texteCorr = `
          $\\bullet$ Pour $x=${x0}$, on obtient${sp()}:<br>$\\begin{aligned}
          ${reduirePolynomeDegre3(0, a, b, c)}&=${a === 1 ? '' : `${a}\\times`}${ecritureParentheseSiNegatif(x0)}^2${abs(b) === 1 ? `${signe(b)}` : `${ecritureAlgebrique(b)}\\times`}${ecritureParentheseSiNegatif(x0)}${ecritureAlgebrique(c)}\\\\
          &=${a * x0 * x0 + b * x0 + c}
          \\end{aligned}$<br>
          $\\bullet$ Pour $x=${x0}$, on obtient${sp()}:<br>$\\begin{aligned}
          ${reduireAxPlusB(m, p)}&=${m}\\times ${x0}${ecritureAlgebrique(p)}\\\\
          &=${m * x0 + p}
          \\end{aligned}$`
          }

          if (
            a * x0 * x0 + b * x0 + c < m * x0 + p ||
            a * x0 * x0 + b * x0 + c === m * x0 + p
          ) {
            texteCorr += `<br>Comme $${a * x0 * x0 + b * x0 + c}\\leqslant ${m * x0 + p}$, le nombre $${x0}$ est solution de l'inéquation. La réponse est ${texteEnCouleurEtGras('OUI')}.`
          } else {
            texteCorr += `<br>Comme $${a * x0 * x0 + b * x0 + c} > ${m * x0 + p}$, le nombre $${x0}$ n'est pas solution de l'inéquation. La réponse est ${texteEnCouleurEtGras('NON')}.`
          }

          if (
            a * x0 * x0 + b * x0 + c < m * x0 + p ||
            a * x0 * x0 + b * x0 + c === m * x0 + p
          ) {
            this.autoCorrection[i] = {
              enonce: texte,
              propositions: [
                {
                  texte: 'OUI',
                  statut: true,
                },
                {
                  texte: 'NON',
                  statut: false,
                },
              ],
            }
          } else {
            this.autoCorrection[i] = {
              enonce: texte,
              propositions: [
                {
                  texte: 'NON',
                  statut: true,
                },
                {
                  texte: 'OUI',
                  statut: false,
                },
              ],
            }
          }
          monQcm = propositionsQcm(this, i)
          if (this.interactif) texte += monQcm.texte
          break
      }

      if (this.questionJamaisPosee(i, a, b, c, d)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
