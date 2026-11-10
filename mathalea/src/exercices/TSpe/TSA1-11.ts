import { bleuMathalea, vertMathalea } from '../../lib/colors'
import { tableauVariationsFonction } from '../../lib/mathFonctions/etudeFonction'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  texteEnCouleur,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu } from '../../modules/outils'
import Trinome from '../../modules/Trinome'
import Exercice from '../Exercice'

export const titre = 'Étudier une suite $u_{n+1}=f(u_n)$ par récurrence'
export const dateDePublication = '25/10/2024'

/**
 * @author Rémi Angot
 * Étude d'une suite par récurrence définie par une fonction polynôme du second degré.
 */

export const uuid = '787b5'
export const refs = {
  'fr-fr': ['TSA1-11'],
  'fr-ch': [],
}

const bleu = context.isHtml ? bleuMathalea : 'black'

export default class EtudeSuiteFonctionRecurrence extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
    this.nbQuestionsModifiable = true
  }

  nouvelleVersion() {
    const i1 = 1
    const i2 = 3
    const coefficients = combinaisonListes(
      [
        [frac(1, 3), frac(-1, 3), frac(1, 1)],
        [frac(1, 3), frac(-2, 3), frac(4, 3)],
        [frac(1, 4), frac(-1, 2), frac(5, 4)],
        [frac(1, 4), frac(-1, 4), frac(1, 1)],
        [frac(1, 5), frac(-1, 5), frac(1, 1)],
        [frac(1, 5), frac(1, 5), frac(3, 5)],
      ],
      this.nbQuestions,
    )

    for (let i = 0; i < this.nbQuestions; i++) {
      const [a, b, c] = coefficients[i]

      const f = new Trinome(a, b, c)
      const alpha = f.alpha.texFractionSimplifiee
      const introduction = `On considère la fonction définie sur $\\R$ par $f(x)=${f.tex}$ et la suite $(u_n)$ définie par $u_0 = ${i2}$ et pour tout $n\\in\\N$,${sp()}$u_{n+1} = f(u_n)$. `
      const questions = [
        `Étudier le sens de variation de $f$ sur $[${i1}\\;;\\;${i2}]$.`,
        `Démontrer par récurrence que, pour tout entier naturel $n$, $${i1} \\leqslant u_n \\leqslant ${i2}$`,
        'Démontrer que la suite $(u_n)$ est décroissante.',
      ]
      let correction1 =
        'La fonction $f$ est une fonction polynôme du second degré. Elle est donc dérivable sur $\\R$ et pour tout $x$ de $\\R$ :'
      correction1 += `<br><br> $f'(x)=${f.derivee.tex}$`
      correction1 += `<br><br> $f'(x) \\geqslant 0 \\Leftrightarrow x \\geqslant ${alpha}$`
      correction1 += `<br><br>donc $f$ est ${texteEnCouleurEtGras('croissante')} sur $[${i1}\\;;\\;${i2}]$.`

      const fonction = (x: FractionEtendue | number) => f.image(x).toNumber()
      const derivee = (x: FractionEtendue | number) =>
        f.derivee.image(x).toNumber()
      correction1 +=
        '<br><br>' +
        tableauVariationsFonction(fonction, derivee, i1, i2, {
          ligneDerivee: true,
          substituts: [
            { antVal: 3, antTex: '3', imgTex: '$ $' },
            { antVal: 1, antTex: '1', imgTex: '$ $' },
          ],
          step: new FractionEtendue(1, 100),
          tolerance: 0.001,
        })

      let correction2 = `Démontrons par récurrence que, pour tout entier naturel $n$, $${i1} \\leqslant u_n \\leqslant ${i2}$`
      correction2 += `<br><br>${texteEnCouleurEtGras('Initialisation :', bleu)}`
      correction2 += `<br><br>$u_0 = ${i2}$, on a bien $${i1} \\leqslant u_0 \\leqslant ${i2}$.`
      correction2 += '<br><br>La propriété est donc vraie au rang $0$.'

      correction2 += `<br><br>${texteEnCouleurEtGras('Hérédité :', bleu)}`
      correction2 += `<br><br>Soit $n$ un entier naturel. Supposons que $${i1} \\leqslant u_n \\leqslant ${i2}$.`
      correction2 += `<br><br>Montrons alors que $${i1} \\leqslant u_{n+1} \\leqslant ${i2}$.`
      correction2 += '<br><br>On a : '
      correction2 += `<br><br>$${i1} \\leqslant u_n \\leqslant ${i2}\\qquad$ ${texteEnCouleur('Hypothèse de récurrence', vertMathalea)}`
      correction2 += `<br><br>$f(${i1}) \\leqslant f(u_n) \\leqslant f(${i2})\\qquad$ ${texteEnCouleur(`Car $f$ est croissante sur $[${i1}\\;;\\;${i2}]$`, vertMathalea)}`
      correction2 += `<br><br>$${f.image(i1).texFractionSimplifiee} \\leqslant f(u_n) \\leqslant ${f.image(i2).texFractionSimplifiee}$`
      correction2 += `<br><br>Or $${f.image(i2).texFractionSimplifiee} \\leqslant ${i2}$.`
      correction2 += '<br><br>Donc la propriété est vraie au rang $n+1$.'

      correction2 += `<br><br>${texteEnCouleurEtGras('Conclusion :', bleu)}`
      correction2 +=
        '<br><br>La propriété est vraie pour $n=0$ et héréditaire à partir de ce rang, donc par récurrence, elle est vraie pour tout entier naturel.'

      let correction3 =
        'Démontrons par récurrence que pour tout $n$ entier naturel : $u_{n+1} \\leqslant u_n$.'
      correction3 += `<br><br>${texteEnCouleurEtGras('Initialisation :', bleu)}`
      correction3 += `<br><br>$u_1 = f(u_0) = f(${i2}) = ${f.image(i2).texFractionSimplifiee} \\leqslant u_0$`
      correction3 += '<br><br>La propriété est donc vraie au rang $0$.'

      correction3 += `<br><br>${texteEnCouleurEtGras('Hérédité :', bleu)}`
      correction3 +=
        '<br><br>Soit $n$ un entier naturel. Supposons que $u_{n+1} \\leqslant u_n$.'
      correction3 += '<br><br>Montrons alors que $u_{n+2} \\leqslant u_{n+1}$.'
      correction3 += '<br><br>On a : '
      correction3 += `<br><br>$u_{n+1} \\leqslant u_n \\qquad$ ${texteEnCouleur('Hypothèse de récurrence', vertMathalea)}`
      correction3 += `<br><br>$f(u_{n+1}) \\leqslant f(u_n)\\qquad$ ${texteEnCouleur(`Car $f$ est croissante sur $[${i1}\\;;\\;${i2}]$`, vertMathalea)}`
      correction3 += '<br><br>$u_{n+2} \\leqslant u_{n+1}$'

      correction3 += `<br><br>${texteEnCouleurEtGras('Conclusion :', bleu)}`
      correction3 +=
        '<br><br>La propriété est vraie pour $n=0$ et héréditaire à partir de ce rang, donc par récurrence, elle est vraie pour tout entier naturel.'

      if (!context.isHtml) {
        correction1 = correction1.replaceAll(vertMathalea, 'black')
        correction2 = correction2.replaceAll(vertMathalea, 'black')
        correction3 = correction3.replaceAll(vertMathalea, 'black')
      }

      const texte = `${introduction}<br><br>1. ${questions[0]}<br>2. ${questions[1]}<br>3. ${questions[2]}`
      const correction = `1. ${correction1}<br><br>2. ${correction2}<br><br>3. ${correction3}`

      this.listeQuestions.push(texte)
      this.listeCorrections.push(correction)
    }

    listeQuestionsToContenu(this)
  }
}

function frac(a: number, b: number) {
  return new FractionEtendue(a, b)
}
