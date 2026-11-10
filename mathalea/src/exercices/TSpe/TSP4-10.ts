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
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'

export const titre = "Utiliser l'inégalité de Bienaymé-Tchebychev"
export const interactifReady = true

export const amcReady = true
export const dateDePublication = '17/05/2026' // La date de publication initiale au format 'jj/mm/aaaa' pour affichage temporaire d'un tag

export const uuid = '6da5f'
export const refs = {
  'fr-fr': ['TSP4-10'],
  'fr-ch': [],
} /**
 *
 * @author Arnaud Meistermann

*/
export default class Tcheby extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.besoinFormulaireTexte = [
      'Choix des questions',
      '1 : Majorer $P(\\lvert{X-E(X)}\\rvert \\geqslant a)$ \n2 : Minorer $P(X \\in ]E(X)-a;E(X)+a[)$  \n3 : Majorer $P(\\lvert{S_n-E(S_n)}\\rvert \\geqslant a)$  \n4 : Déterminer $n$ pour que $P(\\lvert{M_n-E(X)}\\rvert \\geqslant a)\\leqslant p$ \n5 : Mélange des cas précédents',
    ]
    this.sup = '5'

    this.spacing = 1.5 // Interligne des questions
    this.spacingCorr = 2 // Interligne des réponses
  }

  nouvelleVersion() {
    const listeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 3,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      // Generate new values for each exercise
      const mu = randint(-10, 10)
      let variance = randint(1, 8) / 10
      const a = randint(15, 25) / 10
      const acarre = a * a
      // Round floating-point calculations to avoid precision errors
      const muMinusA = mu - a
      const muPlusA = mu + a
      let texte = ''
      let texteCorr = ''
      // Boucle principale où i+1 correspond au numéro de la question
      switch (listeDeQuestions[i]) {
        case 1: // jeu de cartes
          {
            const reponse1 = new FractionEtendue(variance, a * a)
            texte = `On considère une variable aléatoire $X$ d'espérance $E(X)=${mu}$ et de variance $Var(X)=${texNombre(variance)}$.<br>`
            texte += `Majorer $P \\left (X \\in ]-\\infty;${texNombre(muMinusA)} ]\\cup [${texNombre(muPlusA)};+\\infty[ \\right)$ à l'aide de l'inégalité de Bienaymé-Tchebychev.<br>`
            if (this.interactif) {
              texte += `$P \\left (X \\in ]-\\infty;${texNombre(muMinusA)} ]\\cup [${texNombre(muPlusA)};+\\infty[ \\right) \\leqslant $ `
              texte += `${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBaseAvecFraction)}`
              handleAnswers(this, i, {
                reponse: {
                  value: reponse1,
                },
              })
            }
            texteCorr = `$\\begin{aligned} P(X \\in \\left]-\\infty;${texNombre(muMinusA)} \\right]\\cup [${texNombre(muPlusA)};+\\infty[) &=P(X-${ecritureParentheseSiMoins(mu)}\\in ]-\\infty;${texNombre(-a)} ]\\cup [${texNombre(a)};+\\infty[) \\\\ &=P(\\lvert{X-E(X)}\\rvert \\geqslant ${texNombre(a)}) \\end{aligned}$<br>`
            texteCorr +=
              "Or, d'après l'inégalité de Bienaymé-Tchebychev, $P(\\lvert{X-E(X)}\\rvert \\geqslant a) \\leqslant \\dfrac{Var(X)}{a^2}$.<br>"
            texteCorr += `On peut donc affirmer que $P(\\lvert{X-E(X)}\\rvert \\geqslant ${texNombre(a)}) \\leqslant \\dfrac{${texNombre(variance)}}{{${texNombre(a)}}^2}$.<br>`
            texteCorr += `Ainsi, $P \\left (X \\in ]-\\infty;${texNombre(muMinusA)} ]\\cup [${texNombre(muPlusA)};+\\infty[ \\right) \\leqslant ${miseEnEvidence(reponse1.texFractionSimplifiee)} $.`
          }

          break

        case 2: //
          {
            const reponse2 = new FractionEtendue(a * a - variance, a * a)
            texte = `On considère une variable aléatoire $X$ d'espérance $E(X)=${mu}$ et de variance $Var(X)=${texNombre(variance)}$.<br>`
            texte += `Minorer  $P\\left(X\\in ]${texNombre(muMinusA)};${texNombre(muPlusA)}[ \\right)$  à l'aide de l'inégalité de Bienaymé-Tchebychev.<br> `
            if (this.interactif) {
              texte += `$P\\left(X\\in ]${texNombre(muMinusA)};${texNombre(muPlusA)}[ \\right) >$ `
              texte += `${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBaseAvecFraction)}`
              handleAnswers(this, i, {
                reponse: {
                  value: reponse2,
                },
              })
            }
            texteCorr = `$\\begin{aligned} P(X\\in ]${texNombre(muMinusA)};${texNombre(muPlusA)}[) &=P(${texNombre(muMinusA)}< X <${texNombre(muPlusA)}) \\\\ &=P(${texNombre(-a)}< X-${ecritureParentheseSiMoins(mu)} <${texNombre(a)}) \\\\ &= P(\\lvert X-E(X) \\rvert < ${texNombre(a)}) \\\\ &= 1-P(\\lvert{X-E(X)}\\rvert \\geqslant ${texNombre(a)}) \\end{aligned}$ <br> `
            texteCorr += `Or, d'après l'inégalité de Bienaymé-Tchebychev, $P(\\lvert{X-E(X)}\\rvert \\geqslant a) \\leqslant \\dfrac{Var(X)}{a^2}$.<br>`
            texteCorr += `Ainsi,  $P(\\lvert{X-E(X)}\\rvert \\geqslant ${texNombre(a)}) \\leqslant \\dfrac{${texNombre(variance)}}{${texNombre(acarre)}}$.<br>`
            texteCorr += `On peut donc affirmer que $P \\left(X \\in ]${texNombre(muMinusA)};${texNombre(muPlusA)}[\\right) > 1 - \\dfrac{${texNombre(variance)}}{{${texNombre(acarre)}}}$.<br>`
            texteCorr += `Ainsi, $P \\left(X \\in ]${texNombre(muMinusA)};${texNombre(muPlusA)}[\\right) > ${miseEnEvidence(new FractionEtendue(acarre - variance, acarre).texFractionSimplifiee)} $.`
          }
          break

        case 3: // somme de 100 VA indépendantes
          {
            variance = Number(variance / 100)
            const n = Number(100)
            const varZ = Number(n * variance)
            const muZ = Number(n * mu)
            const reponse3 = new FractionEtendue(varZ, acarre)
            texte = `On considère une variable aléatoire $X$ d'espérance $E(X)=${mu}$ et de variance $Var(X)=${texNombre(variance)}$.<br>`
            texte += `Pour tout entier $i$ vérifiant $1\\leqslant i\\leqslant 100$, on considère des variables aléatoires $X_i$ indépendantes et suivant la même loi que $X$.<br>`
            texte += `On pose $Z = X_1 + X_2 + \\cdots + X_{${n}}$.<br>`
            texte += `Majorer $P \\left (\\lvert Z ${ecritureAlgebriqueSauf0(-muZ)}  \\rvert \\geqslant ${texNombre(a)} \\right)$ à l'aide de l'inégalité de Bienaymé-Tchebychev.<br>`
            if (this.interactif) {
              texte += `$P\\left (\\lvert Z ${ecritureAlgebriqueSauf0(-muZ)}  \\rvert \\geqslant ${texNombre(a)} \\right) \\leqslant $ `
              texte += `${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBaseAvecFraction)}`
              handleAnswers(this, i, {
                reponse: {
                  value: reponse3,
                },
              })
            }
            texteCorr = `Puisque pour tout entier $1 \\leqslant i \\leqslant 100$, les variables aléatoires $X_i$ suivent la même loi que $X$, <br> $\\begin{aligned} E(Z) &= E(X_1+X_2+\\ldots+X_n) \\\\ &= E(X_1)+E(X_2)+\\ldots+E(X_n)\\quad \\text{par linéarité de l'espérance} \\\\ &= n \\times ${ecritureParentheseSiNegatif(mu)} \\\\ &= ${texNombre(muZ)} \\end{aligned}$.<br>`
            texteCorr += `$\\begin{aligned} Var(Z) &= Var(X_1+X_2+\\ldots+X_n) \\\\ &= Var(X_1)+Var(X_2)+\\ldots+Var(X_n)\\quad \\text{car les variables aléatoires sont indépendantes } \\\\ &= n \\times Var(X) \\\\ &= ${n} \\times ${texNombre(variance)} \\\\ &= ${texNombre(varZ)} \\end{aligned}$.<br>`
            texteCorr += `D'après l'inégalité de Bienaymé-Tchebychev, $P(\\lvert{Z-E(Z)}\\rvert \\geqslant a) \\leqslant \\dfrac{Var(Z)}{a^2}$.<br>`
            texteCorr += `On peut donc affirmer que $P(\\lvert{Z${ecritureAlgebriqueSauf0(-muZ)}}\\rvert \\geqslant ${texNombre(a)}) \\leqslant \\dfrac{${texNombre(varZ)}}{{${texNombre(a)}}^2}$.<br>`
            texteCorr += `Ainsi, $P \\left (\\lvert Z ${ecritureAlgebriqueSauf0(-muZ)} \\rvert \\geqslant ${texNombre(a)} \\right) \\leqslant ${miseEnEvidence(reponse3.texFractionSimplifiee)} $.`
          }
          break

        case 4: // trouver n pour moyenne empirique
          {
            const p = randint(1, 9) / 1000
            const n = Math.ceil(variance / (p * acarre))
            const valueApprox =
              Math.round((variance / (p * acarre)) * 1000) / 1000
            const reponse4 = n
            texte = `On considère une variable aléatoire $X$ d'espérance $E(X)=${mu}$ et de variance $Var(X)=${texNombre(variance)}$.<br>`
            texte += `Soit $n$, un entier supérieur ou égal à $1$. Pour tout entier $i$ vérifiant $1\\leqslant i\\leqslant n$, on considère des variables aléatoires $X_i$ indépendantes et suivant la même loi que $X$.<br>`
            texte += `On pose $M_n = \\dfrac{X_1 + X_2 + \\cdots + X_n}{n}$.<br>`
            texte += `Trouver le plus petit entier $n$ vérifiant $P \\left (\\lvert M_n ${ecritureAlgebriqueSauf0(-mu)} \\rvert \\geqslant ${texNombre(a)} \\right) \\leqslant ${texNombre(p)}$.<br>`
            if (this.interactif) {
              texte += `$n = $ `
              texte += `${ajouteChampTexteMathLive(this, i, KeyboardType.clavierDeBase)}`
              handleAnswers(this, i, {
                reponse: {
                  value: reponse4,
                },
              })
            }
            texteCorr = `Puisque pour tout entier $1 \\leqslant i \\leqslant n$, les variables aléatoires $X_i$  suivent la même loi que $X$, <br> $\\begin{aligned} E(M_n) &= E\\left(\\dfrac{1}{n}(X_1+X_2+\\ldots+X_n)\\right) \\\\ &= \\dfrac{1}{n}(E(X_1)+E(X_2)+\\ldots+E(X_n))\\quad \\text{par linéarité de l'espérance} \\\\ &= \\dfrac{1}{n} nE(X) \\\\ &= E(X) \\\\ &= ${mu} \\end{aligned}$.<br>`
            texteCorr += `$\\begin{aligned} Var(M_n) &= Var\\left(\\dfrac{1}{n}(X_1+X_2+\\ldots+X_n)\\right) \\\\ &= \\dfrac{1}{n^2}(Var(X_1+X_2+\\ldots+X_n)) \\\\&= \\dfrac{1}{n^2}(Var(X_1)+Var(X_2)+\\ldots+Var(X_n)) \\quad \\text{car les variables aléatoires sont indépendantes }\\\\ &= \\dfrac{nVar(X)}{n^2} \\\\ &= \\dfrac{Var(X)}{n} \\\\ &= \\dfrac{${texNombre(variance)}}{n} \\end{aligned}$.<br>`
            texteCorr += `D'après l'inégalité de Bienaymé-Tchebychev, $P(\\lvert{M_n-E(M_n)}\\rvert \\geqslant a) \\leqslant \\dfrac{Var(M_n)}{a^2}$.<br>`
            texteCorr += `Soit $P(\\lvert{M_n${ecritureAlgebriqueSauf0(-mu)}}\\rvert \\geqslant ${texNombre(a)}) \\leqslant \\dfrac{${texNombre(variance)}}{n \\times {${texNombre(a)}}^2}$.<br>`
            texteCorr += `On cherche un entier $n$ tel que $\\dfrac{${texNombre(variance)}}{n \\times {${texNombre(a)}}^2} \\leqslant ${texNombre(p)}$.<br>`
            texteCorr += `Donc $n \\geqslant \\dfrac{${texNombre(variance)}}{{${texNombre(acarre)} \\times ${texNombre(p)}}}$ car $n>0$.<br>`
            if (Number.isInteger(variance / (p * acarre))) {
              texteCorr += `Or $\\dfrac{${texNombre(variance)}}{{${texNombre(acarre)} \\times ${texNombre(p)}}} = ${texNombre(reponse4)}$.<br>`
            } else {
              texteCorr += `Or $\\dfrac{${texNombre(variance)}}{{${texNombre(acarre)} \\times ${texNombre(p)}}} \\approx ${texNombre(valueApprox)}$.<br>`
            }
            texteCorr += `Le plus petit entier $n$ tel que $P \\left (\\lvert M_n ${ecritureAlgebriqueSauf0(-mu)} \\rvert \\geqslant ${texNombre(a)} \\right) \\leqslant ${texNombre(p)}$ est donc $${miseEnEvidence(reponse4)}$.`
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
