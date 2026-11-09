import { combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  texteEnCouleur,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Étudier une suite par récurrence'
export const dateDePublication = '25/10/2024'

/**
 * @author Rémi Angot
 * Étude d\'une suite par récurrence
 */

export const uuid = '7f24e'
export const refs = {
  'fr-fr': ['TSA1-10'],
  'fr-ch': [],
}

const bleuMathalea = context.isHtml ? '#216D9A' : 'black'

export default class EtudeSuiteRecurrence extends Exercice {
  constructor() {
    super()

    this.nbQuestions = 1
    this.nbQuestionsModifiable = true
    this.sup = 5
    this.besoinFormulaireNumerique = [
      'Type de question',
      5,
      '1 : a + 1/un\n2 : aun + b croissante\n3 : aun + b décroissante\n4 : racine(aun + b) décroissante\n5: Aléatoire',
    ]
  }

  nouvelleVersion() {
    const typesDeQuestionsDisponibles = [
      'a + 1/un',
      'aun + b croissante',
      'aun + b décroissante',
      'sqrt(aun + b) décroissante',
    ]
    const typesDeQuestions = combinaisonListes(
      this.sup <= typesDeQuestionsDisponibles.length
        ? [typesDeQuestionsDisponibles[this.sup - 1]]
        : typesDeQuestionsDisponibles,
      this.nbQuestions,
    )

    for (let i = 0; i < this.nbQuestions; i++) {
      let texte = ''
      let texteCorr = ''

      switch (typesDeQuestions[i]) {
        case 'a + 1/un':
          {
            const u0 = randint(2, 10)
            texte = `Soit $(u_n)$ la suite définie par $u_0 = ${u0}$ et pour tout $n\\in\\N$,${sp()}$u_{n+1} = ${u0 - 1} + \\dfrac{1}{u_n}$. `
            texte += `<br>Démontrer par récurrence que, pour tout entier naturel $n$,${sp()}$${u0 - 1} \\leqslant u_n \\leqslant ${u0}$.`

            texteCorr = `${texteEnCouleurEtGras('Initialisation :', bleuMathalea)}`
            texteCorr += `<br><br>$u_0 = ${u0}$, on a bien $${u0 - 1} \\leqslant u_0 \\leqslant ${u0}$.`
            texteCorr += '<br><br>La propriété est donc vraie pour $n=0$.'
            texteCorr += `<br><br>${texteEnCouleurEtGras('Hérédité :', bleuMathalea)}`
            texteCorr += `<br><br>Soit $n$ un entier naturel. Supposons que : $${u0 - 1} \\leqslant u_n \\leqslant ${u0}$.`
            texteCorr += `<br><br> Montrons alors que : $${u0 - 1} \\leqslant u_{n+1} \\leqslant ${u0}$.`
            texteCorr += `<br><br>$${u0 - 1} \\leqslant u_n \\leqslant ${u0}\\qquad$ ${texteEnCouleur('Par hypothèse de récurrence.', 'forestgreen')}`
            texteCorr += `<br><br>$\\dfrac{1}{${u0 - 1}} \\geqslant \\dfrac{1}{u_n} \\geqslant \\dfrac{1}{${u0}}\\qquad$ ${texteEnCouleur('La fonction inverse est strictement décroissante sur $]0 ; +\\infty[$.', 'forestgreen')}`
            texteCorr += `<br><br>$ ${u0 - 1} + \\dfrac{1}{${u0 - 1}} \\geqslant  ${u0 - 1} + \\dfrac{1}{u_n} \\geqslant  ${u0 - 1} + \\dfrac{1}{${u0}} \\qquad$ ${texteEnCouleur(`On ajoute ${u0 - 1}.`, 'forestgreen')}`
            texteCorr += `<br><br>$\\dfrac{${u0 ** 2 - 2 * u0 + 2}}{${u0 - 1}} \\geqslant u_{n+1} \\geqslant \\dfrac{${u0 ** 2 - u0 + 1}}{${u0}}$`
            texteCorr += `<br><br>Comme $\\dfrac{${u0 ** 2 - 2 * u0 + 2}}{${u0 - 1}} \\leqslant ${u0}$ et $\\dfrac{${u0 ** 2 - u0 + 1}}{${u0}} \\geqslant ${u0 - 1}$, on a bien :`
            texteCorr += `<br><br>$${u0 - 1} \\leqslant u_{n+1} \\leqslant ${u0}$.`
            texteCorr += `<br><br>${texteEnCouleurEtGras('Conclusion :', bleuMathalea)}`
            texteCorr +=
              '<br><br>La propriété est vraie pour $n=0$ et héréditaire à partir de ce rang, donc par récurrence, elle est vraie pour tout entier naturel.'
          }
          break
        case 'aun + b croissante':
          {
            const denA = randint(2, 7)
            const numA = randint(1, denA - 1)
            const a = new FractionEtendue(numA, denA)
            const b = randint(1, 9)
            const l = a
              .multiplieEntier(-1)
              .ajouteEntier(1)
              .inverse()
              .multiplieEntier(b)
            const u0 = randint(1, Math.ceil(l.toNumber()) - 1)

            texte = `Soit $(u_n)$ la suite définie par $u_0 = ${u0}$ et pour tout $n\\in\\N$,${sp()}$u_{n+1} = ${a.texFraction}u_n + ${b}$. `
            texte += `<br>Démontrer par récurrence que, pour tout entier naturel $n$,${sp()}$${u0} \\leqslant u_n \\leqslant u_{n+1} \\leqslant ${l.texFractionSimplifiee}$.`

            texteCorr = `${texteEnCouleurEtGras('Initialisation :', bleuMathalea)}`
            texteCorr += `<br><br>$u_0 = ${u0}$ et $u_1 = ${a.texFraction} \\times u_0 + ${b} = ${a.multiplieEntier(u0).ajouteEntier(b).texFractionSimplifiee}$.`
            texteCorr += `<br><br>On a bien $${u0} \\leqslant u_0 \\leqslant u_1 \\leqslant ${l.texFractionSimplifiee}$.`
            texteCorr += '<br><br>La propriété est donc vraie pour $n=0$.'
            texteCorr += `<br><br>${texteEnCouleurEtGras('Hérédité :', bleuMathalea)}`
            texteCorr += `<br><br>Soit $n$ un entier naturel. Supposons que : $${u0} \\leqslant u_n \\leqslant u_{n+1} \\leqslant ${l.texFractionSimplifiee}$.`
            texteCorr += `<br><br> Montrons alors que : $${u0} \\leqslant u_{n+1} \\leqslant u_{n+2} \\leqslant ${l.texFractionSimplifiee}$.`
            texteCorr += `<br><br>$${u0} \\leqslant u_n \\leqslant u_{n+1} \\leqslant ${l.texFractionSimplifiee}\\qquad$ ${texteEnCouleur('Par hypothèse de récurrence.', 'forestgreen')}`
            texteCorr += `<br><br>$${a.texFraction} \\times ${u0} \\leqslant ${a.texFraction} \\times u_n \\leqslant ${a.texFraction} \\times u_{n+1} \\leqslant ${a.texFraction} \\times ${l.texFractionSimplifiee}\\qquad$ ${texteEnCouleur('Multiplication par un nombre strictement positif.', 'forestgreen')}`
            texteCorr += `<br><br>$${a.multiplieEntier(u0).texFractionSimplifiee} \\leqslant ${a.texFraction} u_n \\leqslant ${a.texFraction} u_{n+1} \\leqslant ${a.produitFraction(l).texFractionSimplifiee}$`
            texteCorr += `<br><br>$${a.multiplieEntier(u0).texFractionSimplifiee} + ${b} \\leqslant ${a.texFraction} u_n + ${b} \\leqslant ${a.texFraction} u_{n+1} + ${b} \\leqslant ${a.produitFraction(l).texFractionSimplifiee} + ${b} \\qquad$ ${texteEnCouleur(`On ajoute ${b}.`, 'forestgreen')}`
            texteCorr += `<br><br>$${a.multiplieEntier(u0).ajouteEntier(b).texFractionSimplifiee} \\leqslant u_{n+1} \\leqslant u_{n+2} \\leqslant ${a.produitFraction(l).ajouteEntier(b).texFractionSimplifiee}$`
            texteCorr += `<br><br>Comme $ ${u0} \\leqslant ${a.multiplieEntier(u0).ajouteEntier(b).texFractionSimplifiee}$, on a bien :`
            texteCorr += `<br<br> $${u0} \\leqslant u_{n+1} \\leqslant u_{n+2} \\leqslant ${l.texFractionSimplifiee}$.`
            texteCorr += `<br><br>${texteEnCouleurEtGras('Conclusion :', bleuMathalea)}`
            texteCorr +=
              '<br><br>La propriété est vraie pour $n=0$ et héréditaire à partir de ce rang, donc par récurrence, elle est vraie pour tout entier naturel.'
          }
          break
        case 'aun + b décroissante':
          {
            const denA = randint(2, 7)
            const numA = randint(1, denA - 1)
            const a = new FractionEtendue(numA, denA)
            const b = randint(1, 9)
            const l = a
              .multiplieEntier(-1)
              .ajouteEntier(1)
              .inverse()
              .multiplieEntier(b)
            const u0 = randint(
              Math.floor(l.toNumber()) + 1,
              Math.floor(l.toNumber()) + 10,
            )

            texte = `Soit $(u_n)$ la suite définie par $u_0 = ${u0}$ et pour tout $n\\in\\N$,${sp()}$u_{n+1} = ${a.texFraction}u_n + ${b}$. `
            texte += `<br>Démontrer par récurrence que, pour tout entier naturel $n$,${sp()}$${u0} \\geqslant u_n \\geqslant u_{n+1} \\geqslant ${l.texFractionSimplifiee}$.`

            texteCorr = `${texteEnCouleurEtGras('Initialisation :', bleuMathalea)}`
            texteCorr += `<br><br>$u_0 = ${u0}$ et $u_1 = ${a.texFraction} \\times u_0 + ${b} = ${a.multiplieEntier(u0).ajouteEntier(b).texFractionSimplifiee}$.`
            texteCorr += `<br><br>On a bien $${u0} \\geqslant u_0 \\geqslant u_1 \\geqslant ${l.texFractionSimplifiee}$.`
            texteCorr += '<br><br>La propriété est donc vraie pour $n=0$.'
            texteCorr += `<br><br>${texteEnCouleurEtGras('Hérédité :', bleuMathalea)}`
            texteCorr += `<br><br>Soit $n$ un entier naturel. Supposons que : $${u0} \\geqslant u_n \\geqslant u_{n+1} \\geqslant ${l.texFractionSimplifiee}$.`
            texteCorr += `<br><br> Montrons alors que : $${u0} \\geqslant u_{n+1} \\geqslant u_{n+2} \\geqslant ${l.texFractionSimplifiee}$.`
            texteCorr += `<br><br>$${u0} \\geqslant u_n \\geqslant u_{n+1} \\geqslant ${l.texFractionSimplifiee}\\qquad$ ${texteEnCouleur('Par hypothèse de récurrence.', 'forestgreen')}`
            texteCorr += `<br><br>$${a.texFraction} \\times ${u0} \\geqslant ${a.texFraction} \\times u_n \\geqslant ${a.texFraction} \\times u_{n+1} \\geqslant ${a.texFraction} \\times ${l.texFractionSimplifiee}\\qquad$ ${texteEnCouleur('Multiplication par un nombre strictement positif.', 'forestgreen')}`
            texteCorr += `<br><br>$${a.multiplieEntier(u0).texFractionSimplifiee} \\geqslant ${a.texFraction} u_n \\geqslant ${a.texFraction} u_{n+1} \\geqslant ${a.produitFraction(l).texFractionSimplifiee}$`
            texteCorr += `<br><br>$${a.multiplieEntier(u0).texFractionSimplifiee} + ${b} \\geqslant ${a.texFraction} u_n + ${b} \\geqslant ${a.texFraction} u_{n+1} + ${b} \\geqslant ${a.produitFraction(l).texFractionSimplifiee} + ${b} \\qquad$ ${texteEnCouleur(`On ajoute ${b}.`, 'forestgreen')}`
            texteCorr += `<br><br>$${a.multiplieEntier(u0).ajouteEntier(b).texFractionSimplifiee} \\geqslant u_{n+1} \\geqslant u_{n+2} \\geqslant ${a.produitFraction(l).ajouteEntier(b).texFractionSimplifiee}$`
            texteCorr += `<br><br>Comme $ ${u0} \\geqslant ${a.multiplieEntier(u0).ajouteEntier(b).texFractionSimplifiee}$, on a bien :`
            texteCorr += `<br<br> $${u0} \\geqslant u_{n+1} \\geqslant u_{n+2} \\geqslant ${l.texFractionSimplifiee}$.`
            texteCorr += `<br><br>${texteEnCouleurEtGras('Conclusion :', bleuMathalea)}`
            texteCorr +=
              '<br><br>La propriété est vraie pour $n=0$ et héréditaire à partir de ce rang, donc par récurrence, elle est vraie pour tout entier naturel.'
          }
          break
        case 'sqrt(aun + b) décroissante':
          {
            const b = randint(1, 4)
            const a = randint(2 * b, 12)
            const racine = (a + Math.sqrt(a ** 2 + 4 * b)) / 2
            const u0 = randint(Math.floor(racine) + 1, Math.floor(racine) + 10)

            texte = `Soit $(u_n)$ la suite définie par $u_0 = ${u0}$ et pour tout $n\\in\\N$,${sp()}$u_{n+1} = \\sqrt{${a}u_n + ${b}}$. `
            texte += `<br>Démontrer par récurrence que, pour tout entier naturel $n$,${sp()}$0 \\leqslant u_{n+1} \\leqslant u_{n}$.`

            texteCorr = `${texteEnCouleurEtGras('Initialisation :', bleuMathalea)}`
            texteCorr += `<br><br>$u_0 = ${u0}$ et $u_1 =\\sqrt{${a}u_0 + ${b}} \\approx ${texNombre(Math.sqrt(a * u0 + b), 2)}$.`
            texteCorr += '<br><br>On a bien $0 \\leqslant u_1 \\leqslant u_0$.'
            texteCorr += '<br><br>La propriété est donc vraie pour $n=0$.'
            texteCorr += `<br><br>${texteEnCouleurEtGras('Hérédité :', bleuMathalea)}`
            texteCorr +=
              '<br><br>Soit $n$ un entier naturel. Supposons que : $0 \\leqslant u_{n+1} \\leqslant u_{n}$.'
            texteCorr +=
              '<br><br> Montrons alors que : $0 \\leqslant u_{n+2} \\leqslant u_{n+1}$.'
            texteCorr += `<br><br>$0 \\leqslant u_{n+1} \\leqslant u_{n} \\qquad$ ${texteEnCouleur('Par hypothèse de récurrence.', 'forestgreen')}`
            texteCorr += `<br><br>$${a}\\times0 \\leqslant ${a}u_{n+1} \\leqslant ${a}u_{n} \\qquad$ ${texteEnCouleur('Multiplication par un nombre strictement positif.', 'forestgreen')}`
            texteCorr += `<br><br>$0 + ${b} \\leqslant ${a}u_{n+1} + ${b} \\leqslant ${a}u_{n} + ${b} \\qquad$ ${texteEnCouleur(`On ajoute ${b}.`, 'forestgreen')}`
            texteCorr += `<br><br>$ \\sqrt{${b}} \\leqslant \\sqrt{${a}u_{n+1} + ${b}} \\leqslant \\sqrt{${a}u_{n} + ${b}} \\qquad$ ${texteEnCouleur('La fonction racine est strictement croissante sur $]0 ; +\\infty[$.', 'forestgreen')}`
            texteCorr += `<br><br>$\\sqrt{${b}} \\leqslant u_{n+2} \\leqslant u_{n+1}$`
            texteCorr += `<br><br>Comme $0 \\leqslant \\sqrt{${b}}$, on a bien :`
            texteCorr += '<br><br>$0 \\leqslant u_{n+2} \\leqslant u_{n+1}$.'
            texteCorr += `<br><br>${texteEnCouleurEtGras('Conclusion :', bleuMathalea)}`
            texteCorr +=
              '<br><br>La propriété est vraie pour $n=0$ et héréditaire à partir de ce rang, donc par récurrence, elle est vraie pour tout entier naturel.'
          }
          break
      }

      if (!context.isHtml) {
        texteCorr = texteCorr.replaceAll('forestgreen', 'black')
      }
      this.listeQuestions.push(texte)
      this.listeCorrections.push(texteCorr)
    }

    listeQuestionsToContenu(this)
  }
}
