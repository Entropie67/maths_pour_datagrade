import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { texFractionSigne } from '../../lib/outils/deprecatedFractions'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import { context } from '../../modules/context'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Reconnaitre une fonction affine'
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

/**
 * Reconnaitre une fonction affine
 * @author Stéphane Guyon
 */
export const uuid = '90998'

export const refs = {
  'fr-fr': ['2F21-1'],
  'fr-ch': ['11CTFA2D-3', '11LCFA2D-3', '11LSFA2D-3'],
}
export default class Reconnaitrefonctionaffine extends Exercice {
  constructor() {
    super()

    this.consigne =
      'Déterminer, en expliquant, si les fonctions suivantes sont, ou non, des fonctions affines.'

    this.nbQuestions = 5
  }

  nouvelleVersion() {
    let bonneReponse

    const listeTypeDeQuestions = combinaisonListes(
      [1, 2, 3, 4, 5, 6, 7, 8, 9],
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const typesDeQuestions = listeTypeDeQuestions[i]
      const k = choice([-1, 1])
      const a = randint(2, 9) * k
      const b = randint(1, 9) * k
      const c = choice([2, 3, 5, 7, 10, 11, 13, 15, 17])
      const d = choice([2, 3, 5, 7, 10, 11, 13, 15, 17])
      const e = randint(2, 9)
      let texte = ''
      let texteCorr = ''

      switch (typesDeQuestions) {
        case 1: // Cas f(x)=ax+b
          texte = ` Soit $f$ la fonction définie sur un intervalle $I$ de $\\mathbb R$, par $f(x)=${reduireAxPlusB(a, b)}$` // f(x)=ax + b
          texteCorr = ` $f(x)=${reduireAxPlusB(a, b)}$.<br>`
          texteCorr +=
            "On observe que la fonction $f$ s'écrit bien sous la forme $f(x)= a x+ b$ avec $a$ et $b$ des nombres réels.<br>"
          texteCorr += `Ici, on a : $a=${a}$ et $b=${b}$.<br>`
          texteCorr += `$f$ ${texteEnCouleurEtGras("est donc bien")} une fonction affine.<br>`
          bonneReponse = 'oui'
          break
        case 2: // Cas f(x)=b+a x
          if (a === 1) {
            texte = ` Soit $f$ la fonction définie sur un intervalle $I$ de $\\mathbb R$, par $f(x)=${b}+x$.<br>` // f(x)=b+x
            texteCorr = ` Soit $f$ la fonction définie sur un intervalle $I$ de $\\mathbb R$, par $f(x)=${b}+x$.<br>`
            texteCorr += ` On peut écrire $f$ sous cette forme : $f(x)=x ${ecritureAlgebrique(b)}$.<br>`
          }
          if (a === -1) {
            texte = ` Soit $f$ la fonction définie sur un intervalle $I$ de $\\mathbb R$, par $f(x)=${b}-x$.<br>` // f(x)=b-x}
            texteCorr = ` Soit $f$ la fonction définie sur un intervalle $I$ de $\\mathbb R$, par $f(x)=${b}-x$.<br>`
            texteCorr += ` On peut écrire $f$ sous cette forme : $f(x)=-x ${ecritureAlgebrique(b)}$.<br>`
          }
          if (a !== 0 && a !== 1) {
            texte = ` Soit $f$ la fonction définie sur un intervalle $I$ de $\\mathbb R$, par $f(x)=${b} ${ecritureAlgebrique(a)} x$.<br>` // f(x)=b-x}
            texteCorr = ` Soit $f$ la fonction définie sur un intervalle $I$ de $\\mathbb R$, par $f(x)=${b} ${ecritureAlgebrique(a)} x$.<br>` // f(x)=b-x}
            texteCorr += ` On peut écrire $f$ sous cette forme : $f(x)= ${reduireAxPlusB(a, b)}$.<br>`
          }
          texteCorr +=
            "On observe que la fonction $f$ s'écrit bien sous la forme $f(x)= a x+ b$ avec $a$ et $b$ des nombres réels.<br>"
          texteCorr += `Ici, on a : $a=${a}$ et $b=${b}$.<br>`
          texteCorr += `$f$ ${texteEnCouleurEtGras("est donc bien")} une fonction affine.`
          bonneReponse = 'oui'

          break
        case 3: // Cas f(x)=ax²+bx+c
          texte = ` Soit $f$ la fonction définie sur un intervalle $I$ de $\\mathbb R$, par $f(x)=${a}x^{2}${ecritureAlgebrique(b)} x${ecritureAlgebrique(c)} $.` // f(x)=ax²+bx+c
          texteCorr = ` $f(x)=${a}x^{2}${ecritureAlgebriqueSauf1(b)} x${ecritureAlgebrique(c)} $.<br>`
          texteCorr +=
            "On observe que la fonction $f$ est du second degré, puisqu'il y a un terme en $x^{2}$.<br>"
          texteCorr +=
            "Elle s'écrit sous la forme $f(x)= a x^{2}+ bx+c$ et non pas sous la forme $ax+b$.<br>"
          texteCorr += `$f$ ${texteEnCouleurEtGras("n'est donc pas")} une fonction affine.<br>`
          bonneReponse = 'non'

          break
        case 4:
          texte = ` Soit $f$ la fonction définie sur un intervalle $I$ de $\\mathbb R$, par $f(x)=\\sqrt{${c}}x + \\sqrt{${d}}$.` // f(x)=\sqrt a x + \sqrt b
          texteCorr = ` $f(x)=\\sqrt{${c}}x + \\sqrt{${d}}$.<br>`
          texteCorr +=
            "On observe que la fonction $f$ s'écrit bien sous la forme $f(x)= a x+ b$ avec $a$ et $b$ des nombres réels.<br>"
          texteCorr += `Ici, on a : $a=\\sqrt{${c}}$ et $b=\\sqrt{${d}}$.<br>`
          texteCorr += `$f$ ${texteEnCouleurEtGras("est donc bien")} une fonction affine.<br>`
          bonneReponse = 'oui'

          break
        case 5:
          texte = ` Soit $f$ la fonction définie sur un intervalle $I$ de $\\mathbb R$, par $f(x)=${a}x^{2}${ecritureAlgebrique(c)} $.` // f(x)=ax²+c
          texteCorr = ` $f(x)=${a}x^{2}${ecritureAlgebrique(c)} $.<br>`
          texteCorr +=
            "On observe que la fonction $f$ est du second degré, puisqu'il y a un terme en $x^{2}$.<br>"
          texteCorr +=
            "Elle s'écrit sous la forme $f(x)= a x^{2}+b$ avec $a$ et $b$ des nombres réels, et non pas sous la forme $ax+b$.<br>"
          texteCorr += `$f$ ${texteEnCouleurEtGras("n'est donc pas")} une fonction affine.<br>`
          bonneReponse = 'non'

          break
        case 6:
          texte = `Soit $f$ la fonction définie sur un intervalle $I$ de $\\mathbb R$, par $f(x)=\\dfrac{1}{${a}x${ecritureAlgebrique(b)} }$.` // f(x)=1/(ax+b)
          texteCorr = ` $f(x)=\\dfrac{1}{${a}x${ecritureAlgebrique(b)} }$.<br>`
          texteCorr +=
            "On observe que la fonction $f$ est une fonction rationnelle, puisqu'il y une fraction avec des termes en $x$ au dénominateur.<br>"
          texteCorr += "Elle ne s'écrit pas sous la forme $ax+b$.<br>"
          texteCorr += `$f$ ${texteEnCouleurEtGras("n'est donc pas")} une fonction affine.<br>`
          bonneReponse = 'non'

          break
        case 7: // f(x)=1/a x+1/b
          texte = `Soit $f$ la fonction définie sur un intervalle $I$ de $\\mathbb R$, par $f(x)=${texFractionSigne(1, a)}x+${texFractionSigne(1, e)} $.`
          texteCorr = `$f(x)=${texFractionSigne(1, a)}x+${texFractionSigne(1, e)}$.<br>`
          texteCorr +=
            "On observe que la fonction $f$ s'écrit bien sous la forme $f(x)= a x+ b$ avec $a$ et $b$ des nombres réels.<br>"
          texteCorr += `Ici, on a : $a=${texFractionSigne(1, a)}$ et $b=${texFractionSigne(1, e)}$.<br>`
          texteCorr += `$f$ ${texteEnCouleurEtGras("est donc bien")} une fonction affine.<br>`
          bonneReponse = 'oui'

          break
        case 8: // f(x)=k(ax+b)
          texte = `Soit $f$ la fonction définie sur un intervalle $I$ de $\\mathbb R$, par $f(x)=${c}\\times (${reduireAxPlusB(a, b)}) $.`
          texteCorr = `$f(x)=${c}\\times (${reduireAxPlusB(a, b)}) $.<br>`
          texteCorr +=
            "On peut développer l'expression de $f$ et on obtient alors :<br>"
          texteCorr += `$f(x)=${reduireAxPlusB(a * c, b * c)} $.<br>`
          texteCorr +=
            "On observe que la fonction $f$ s'écrit bien sous la forme $f(x)= a x+ b$ avec $a$ et $b$ des nombres réels.<br>"
          texteCorr += `Ici, on a : $a=${a * c}$ et $b=${b * c}$.<br>`
          texteCorr += `$f$ ${texteEnCouleurEtGras("est donc bien")} une fonction affine.<br>`
          bonneReponse = 'oui'

          break
        case 9: // f(x)= x/a+1/b
        default:
          texte = `Soit $f$ la fonction définie sur un intervalle $I$ de $\\mathbb R$, par $f(x)=\\dfrac{x}{${a}}+${texFractionSigne(1, e)} $.`
          texteCorr = `On a : $f(x)=\\dfrac{x}{${a}}+${texFractionSigne(1, e)} $.`
          texteCorr += `<br>Ce qui revient à écrire que : $f(x)=${texFractionSigne(1, a)}x+${texFractionSigne(1, e)}$.<br>`
          texteCorr +=
            "On observe que la fonction $f$ s'écrit bien sous la forme $f(x)= a x+ b$ avec $a$ et $b$ des nombres réels.<br>"
          texteCorr += `Ici, on a : $a=${texFractionSigne(1, a)}$ et $b=${texFractionSigne(1, e)}$.<br>`
          texteCorr += `$f$ ${texteEnCouleurEtGras("est donc bien")} une fonction affine.<br>`
          bonneReponse = 'oui'

          break
      }
      if (this.interactif || context.isAmc) {
        this.autoCorrection[i] = {}
        this.autoCorrection[i].options = { ordered: true, radio: true }
        this.autoCorrection[i].enonce = `${texte}\n`
        this.autoCorrection[i].propositions = [
          {
            texte: 'Oui',
            statut: bonneReponse !== 'non',
          },
          {
            texte: 'Non',
            statut: bonneReponse !== 'oui',
          },
          {
            texte: 'Je ne sais pas',
            statut: false,
          },
        ]

        if (this.interactif) {
          texte += propositionsQcm(this, i).texte
        }
      }
      if (this.questionJamaisPosee(i, k, a, b, c, d, e)) {
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
