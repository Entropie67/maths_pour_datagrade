import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  ecritureAlgebriqueSauf0,
  ecritureParentheseSiMoins,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'

export const titre = "Utiliser l'inégalité de concentration"
export const interactifReady = true

export const amcReady = true
export const dateDePublication = '22/05/2026'

export const dateDeModifImportante = '31/10/2026'
export const uuid = 'f25ef'
export const refs = {
  'fr-fr': ['TSP4-20'],
  'fr-ch': [],
} /**
 *
 * @author Arnaud Meistermann
 *
 */
export default class Concentration extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Choix des questions',
      '1 : Majorer $\\mathrm{P}\\left(\\lvert M_n-\\mathrm{E}\\left(X\\right)\\rvert \\geqslant a\\right)$ \n2 : Minorer $\\mathrm{P}\\left(M_n \\in ]\\mathrm{E}\\left(X\\right)-a~;~\\mathrm{E}\\left(X\\right)+a[\\right)$  \n3 : Déterminer $n$ pour que $\\mathrm{P}\\left(\\lvert M_n-\\mathrm{E}\\left(X\\right)\\rvert \\geqslant a\\right)\\leqslant p$ \n4 : Mélange des cas précédents',
    ]
    this.sup = '4'

    this.spacing = 1.5
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    const listeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const mu = randint(-10, 10, 0)
      const variance = randint(1, 8) / 10
      const n = randint(10, 100) * 10
      const a = randint(15, 25) / 10
      const acarre = a * a

      const muMinusA = mu - a
      const muPlusA = mu + a

      let texte = ''
      let texteCorr = ''

      switch (listeDeQuestions[i]) {
        case 1:
          {
            const reponse1 = new FractionEtendue(variance, n * a * a)

            texte = `On considère une variable aléatoire $X$ d'espérance $\\mathrm{E}\\left(X\\right)=${mu}$ et de variance $\\mathrm{Var}\\left(X\\right)=${texNombre(variance)}$.<br>`

            texte += `Pour tout entier $i$ vérifiant $1\\leqslant i\\leqslant ${n}$, on considère des variables aléatoires $X_i$ indépendantes et suivant la même loi que $X$.<br>`

            texte += `On pose $M_{${n}} = \\dfrac{X_1 + X_2 + \\cdots + X_{${n}}}{${n}}$, la moyenne d'un échantillon de taille $n=${n}$ de cette variable aléatoire.<br>`

            texte += `Majorer $\\mathrm{P}\\left(M_{${n}} \\in ]-\\infty~;~${texNombre(muMinusA)} ]\\cup [ ${texNombre(muPlusA)}~;~+\\infty[\\right)$ à l'aide de l'inégalité de concentration.<br>`

            if (this.interactif) {
              texte += `$\\mathrm{P}\\left(M_{${n}} \\in ]-\\infty~;~${texNombre(muMinusA)} ]\\cup [ ${texNombre(muPlusA)}~;~+\\infty[\\right)
               \\leqslant $ `
              texte += `${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBaseAvecFraction)}`

              handleAnswers(this, i, {
                reponse: {
                  value: reponse1,
                },
              })
            }

            texteCorr = `$\\begin{aligned}
\\mathrm{P}\\left(M_{${n}} \\in \\left]-\\infty~;~${texNombre(muMinusA)} \\right]\\cup [ ${texNombre(muPlusA)}~;~+\\infty[\\right)
&= \\mathrm{P}\\left(M_{${n}}-${ecritureParentheseSiMoins(mu)}\\in ]-\\infty~;~${texNombre(-a)} ]\\cup [ ${texNombre(a)}~;~+\\infty[\\right) \\\\
&= \\mathrm{P}\\left(\\lvert M_{${n}}-\\mathrm{E}\\left(X\\right)\\rvert \\geqslant ${texNombre(a)}\\right)
\\end{aligned}$<br>`

            texteCorr +=
              "Comme les variables aléatoires sont indépendantes, d'après l'inégalité de concentration, $\\mathrm{P}\\left(\\lvert M_n-\\mathrm{E}\\left(X\\right)\\rvert \\geqslant a\\right) \\leqslant \\dfrac{\\mathrm{Var}\\left(X\\right)}{na^2}$.<br>"

            texteCorr += `On peut donc affirmer que $\\mathrm{P}\\left(\\lvert M_{${n}}-${ecritureParentheseSiMoins(mu)}\\rvert \\geqslant ${texNombre(a)}\\right) \\leqslant \\dfrac{${texNombre(variance)}}{${n} \\times {${texNombre(a)}}^2}$.<br>`

            texteCorr += `Ainsi, $\\mathrm{P}\\left(M_{${n}} \\in ]-\\infty~;~${texNombre(muMinusA)} ]\\cup [ ${texNombre(muPlusA)}~;~+\\infty[\\right) \\leqslant ${miseEnEvidence(reponse1.texFractionSimplifiee)}$.`
          }

          break

        case 2:
          {
            const reponse2 = new FractionEtendue(
              n * a * a - variance,
              n * a * a,
            )

            texte = `On considère une variable aléatoire $X$ d'espérance $\\mathrm{E}\\left(X\\right)=${mu}$ et de variance $\\mathrm{Var}\\left(X\\right)=${texNombre(variance)}$.<br>`

            texte += `Pour tout entier $i$ vérifiant $1\\leqslant i\\leqslant ${n}$, on considère des variables aléatoires $X_i$ indépendantes et suivant la même loi que $X$.<br>`

            texte += `On pose $M_{${n}} = \\dfrac{X_1 + X_2 + \\cdots + X_{${n}}}{${n}}$, la moyenne d'un échantillon de taille $n=${n}$ de cette variable aléatoire.<br>`

            texte += `Minorer $\\mathrm{P}\\left(M_{${n}} \\in ]${texNombre(muMinusA)}~;~${texNombre(muPlusA)}[\\right)$ à l'aide de l'inégalité de concentration.<br> `

            if (this.interactif) {
              texte += `$\\mathrm{P}\\left(M_{${n}} \\in ]${texNombre(muMinusA)}~;~${texNombre(muPlusA)}[\\right) > $ `
              texte += `${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBaseAvecFraction)}`

              handleAnswers(this, i, {
                reponse: {
                  value: reponse2,
                },
              })
            }

            texteCorr = `$\\begin{aligned}
\\mathrm{P}\\left(M_{${n}} \\in ]${texNombre(muMinusA)}~;~${texNombre(muPlusA)}[\\right)
&= \\mathrm{P}\\left(${texNombre(muMinusA)} < M_{${n}} < ${texNombre(muPlusA)}\\right) \\\\
&= \\mathrm{P}\\left(${texNombre(-a)} < M_{${n}}-${ecritureParentheseSiMoins(mu)} < ${texNombre(a)}\\right) \\\\
&= \\mathrm{P}\\left(\\lvert M_{${n}}-\\mathrm{E}\\left(X\\right) \\rvert < ${texNombre(a)}\\right) \\\\
&= 1-\\mathrm{P}\\left(\\lvert M_{${n}}-\\mathrm{E}\\left(X\\right)\\rvert \\geqslant ${texNombre(a)}\\right)
\\end{aligned}$ <br> `

            texteCorr += `Comme les variables aléatoires sont indépendantes, d'après l'inégalité de concentration, $\\mathrm{P}\\left(\\lvert M_n-\\mathrm{E}\\left(X\\right)\\rvert \\geqslant a\\right) \\leqslant \\dfrac{\\mathrm{Var}\\left(X\\right)}{na^2}$.<br>`

            texteCorr += `Ainsi, $\\mathrm{P}\\left(\\lvert M_{${n}}-\\mathrm{E}\\left(X\\right)\\rvert \\geqslant ${texNombre(a)}\\right) \\leqslant \\dfrac{${texNombre(variance)}}{${n} \\times ${texNombre(acarre)}}$.<br>`

            texteCorr += `On peut donc affirmer que $\\mathrm{P}\\left(M_{${n}} \\in ]${texNombre(muMinusA)}~;~${texNombre(muPlusA)}[\\right) > 1 - \\dfrac{${texNombre(variance)}}{${n} \\times {${texNombre(acarre)}}}$.<br>`

            texteCorr += `Ainsi, $\\mathrm{P}\\left(M_{${n}} \\in ]${texNombre(muMinusA)}~;~${texNombre(muPlusA)}[\\right) > ${miseEnEvidence(reponse2.texFractionSimplifiee)}$.`
          }

          break

        case 3:
          {
            const p = randint(1, 9) / 1000
            const nMin = Math.ceil(variance / (p * acarre))
            const valueApprox =
              Math.round((variance / (p * acarre)) * 1000) / 1000

            const reponse3 = nMin

            texte = `On considère une variable aléatoire $X$ d'espérance $\\mathrm{E}\\left(X\\right)=${mu}$ et de variance $\\mathrm{Var}\\left(X\\right)=${texNombre(variance)}$.<br>`

            texte += `Soit $n$, un entier supérieur ou égal à $1$. Pour tout entier $i$ vérifiant $1\\leqslant i\\leqslant n$, on considère des variables aléatoires $X_i$ indépendantes et suivant la même loi que $X$.<br>`

            texte += `On pose $M_n = \\dfrac{X_1 + X_2 + \\cdots + X_n}{n}$, la moyenne d'un échantillon de taille $n$ de cette variable aléatoire.<br>`

            texte += `Trouver le plus petit entier $n$ tel que $\\mathrm{P}\\left(\\lvert M_n ${ecritureAlgebriqueSauf0(-mu)} \\rvert \\geqslant ${texNombre(a)}\\right) \\leqslant ${texNombre(p)}$, quelle que soit la loi de probabilité de $X$.<br>`

            if (this.interactif) {
              texte += `$n = $ `
              texte += `${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)}`

              handleAnswers(this, i, {
                reponse: {
                  value: reponse3,
                },
              })
            }

            texteCorr = `Comme les variables aléatoires sont indépendantes, d'après l'inégalité de concentration, $\\mathrm{P}\\left(\\lvert M_n-\\mathrm{E}\\left(X\\right)\\rvert \\geqslant a\\right) \\leqslant \\dfrac{\\mathrm{Var}\\left(X\\right)}{na^2}$.<br>`

            texteCorr += `Soit $\\mathrm{P}\\left(\\lvert M_n${ecritureAlgebriqueSauf0(-mu)}\\rvert \\geqslant ${texNombre(a)}\\right) \\leqslant \\dfrac{${texNombre(variance)}}{n \\times {${texNombre(a)}}^2}$.<br>`

            texteCorr += `On cherche un entier $n$ tel que $\\dfrac{${texNombre(variance)}}{n \\times {${texNombre(a)}}^2} \\leqslant ${texNombre(p)}$.<br>`

            texteCorr += `Donc $n \\geqslant \\dfrac{${texNombre(variance)}}{{${texNombre(acarre)} \\times ${texNombre(p)}}}$ car $n>0$.<br>`

            if (Number.isInteger(variance / (p * acarre))) {
              texteCorr += `Or $\\dfrac{${texNombre(variance)}}{{${texNombre(acarre)} \\times ${texNombre(p)}}} = ${texNombre(reponse3)}$.<br>`
            } else {
              texteCorr += `Or $\\dfrac{${texNombre(variance)}}{{${texNombre(acarre)} \\times ${texNombre(p)}}} \\approx ${texNombre(valueApprox)}$.<br>`
            }

            texteCorr += `Le plus petit entier $n$ tel que $\\mathrm{P}\\left(\\lvert M_n ${ecritureAlgebriqueSauf0(-mu)} \\rvert \\geqslant ${texNombre(a)}\\right) \\leqslant ${texNombre(p)}$, quelle que soit la loi de probabilité de $X$, est donc $${miseEnEvidence(reponse3)}$.`
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
