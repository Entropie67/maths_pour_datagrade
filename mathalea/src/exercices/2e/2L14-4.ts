import { shuffle2tableaux } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { bleuMathalea } from '../../lib/colors'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha, sp } from '../../lib/outils/outilString'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Trinome from '../../modules/Trinome'
import Exercice from '../Exercice'
export const titre =
  "Utiliser les différentes formes d'un polynôme du second degré ($2$ formes)"
export const interactifReady = false

export const dateDePublication = '25/10/2024'

/**
 * Forme développée, factorisée ou canonique pour résoudre équations et inéquations
 * @author Gilles Mora
 */
export const uuid = '6b5bc'

export const refs = {
  'fr-fr': ['2L14-4'],
  'fr-ch': ['1mF3-10'],
}
class FormeTrinome extends Exercice {
  // version: number
  constructor() {
    super()
    this.sup = 1
    this.sup2 = 1
    this.sup3 = false
    // 4 questions : la deuxième a trois sous-questions
    this.nbQuestions = 4
    this.spacing = 1.2
    this.spacingCorr = 1.8
    this.nbQuestionsModifiable = false
    this.besoinFormulaireNumerique = [
      'Forme de la fonction de départ',
      2,
      '1 : Développée \n2 : Factorisée',
    ]
    this.besoinFormulaire2Numerique = [
      'Niveau de difficulté',
      3,
      '1 : a=1 \n2 : a différent de 1',
    ]
    this.correctionDetaillee = false
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion(): void {
    let a = randint(-4, 4, [0, 1])
    let question1: string
    let question2: string
    let correction1: string
    let correction2: string

    if (this.sup2 === 1) {
      a = 1
    }
    let x1 = randint(-8, 8, 0)
    let x2 = x1 + 2 * randint(1, 6)
    while (x1 === -x2 || x1 === 0 || x2 === 0) {
      // x1 + x2 doit êter pair pour n'avoir que des nombres entiers dans les différentes formes
      x1 = randint(-8, 8, 0)
      x2 = x1 + 2 * randint(1, 6)
    }
    const p = new Trinome(0, 0, 0)
    const q = new Trinome(a, -a * (x1 + x2), a * x1 * x2)
    p.defFormeFactorisee(a, x1, x2)
    const etapesDeveloppement2 = p.arrayTexDevelopperFormeFactorisee
    switch (this.sup) {
      case 1:
        this.introduction = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par $f(x)=${q.tex}$. ${sp(5)} ($\\textit{Forme développée}$)
        `
        question1 = `Montrer que $f(x)$ peut aussi s'écrire $f(x)=${p.texFormeFactorisee}$.${sp(5)} ($\\textit{Forme factorisée}$)`

        correction1 = 'On développe la forme factorisée : '
        if (a !== 1) {
          correction1 += `<br>$\\begin{aligned}
       ${p.texFormeFactorisee} &= ${etapesDeveloppement2[0]}${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence('\\textit{On développe avec la double distributivité}', bleuMathalea)}` : ''}\\\\
        & = ${etapesDeveloppement2[1]} ${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence('\\textit{On développe avec la simple distributivité}', bleuMathalea)}` : ''}\\\\
       &= ${etapesDeveloppement2[2]}${this.correctionDetaillee === true ? `${sp(20)}${miseEnEvidence('\\textit{ On réduit}', bleuMathalea)}` : ''}\\\\
       &=f(x)
        \\end{aligned}$`
        } else {
          correction1 += `<br>$\\begin{aligned}
        ${p.texFormeFactorisee} &= ${etapesDeveloppement2[1]}${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence('\\textit{On développe avec la double distributivité}', bleuMathalea)}` : ''}\\\\
         & = ${etapesDeveloppement2[2]}${this.correctionDetaillee === true ? `${sp(20)}${miseEnEvidence('\\textit{On réduit}', bleuMathalea)}` : ''}\\\\
         &=f(x)
         \\end{aligned}$`
        }
        correction1 += `<br> On retrouve la forme développée, donc on en déduit que $f(x)$ peut s'écrire sous forme factorisée : $f(x)=${miseEnEvidence(p.texFormeFactorisee)}$.`

        break
      default:
        this.introduction = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par $f(x)=${p.texFormeFactorisee}$. ${sp(5)} ($\\textit{Forme factorisée}$)
        `
        question1 = `Montrer que $f(x)$ peut aussi s'écrire $f(x)=${q.tex}$. ${sp(5)} ($\\textit{Forme développée}$)`
        correction1 = 'On développe la forme factorisée : '
        if (a !== 1) {
          correction1 += `<br>$\\begin{aligned}
           f(x)&=${p.texFormeFactorisee}\\\\
        &= ${etapesDeveloppement2[0]}${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence('\\textit{On développe avec la double distributivité}', bleuMathalea)}` : ''}\\\\
        & = ${etapesDeveloppement2[1]}${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence('\\textit{On développe avec la simple distributivité}', bleuMathalea)}` : ''}\\\\
       &= ${etapesDeveloppement2[2]}${this.correctionDetaillee === true ? `${sp(20)}${miseEnEvidence('\\textit{On réduit}', bleuMathalea)}` : ''}
        \\end{aligned}$`
        } else {
          correction1 += `<br>$\\begin{aligned}
           f(x)&=${p.texFormeFactorisee}\\\\
        &= ${etapesDeveloppement2[1]}${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence('\\textit{On développe avec la double distributivité}', bleuMathalea)}` : ''}\\\\
         & = ${etapesDeveloppement2[2]}${this.correctionDetaillee === true ? `${sp(20)}${miseEnEvidence('\\textit{On réduit}', bleuMathalea)}` : ''}
         \\end{aligned}$`
        }
        correction1 += `<br> On en déduit que $f(x)$ s'écrit sous forme développée : $f(x)=${miseEnEvidence(p.tex)}$.`

        break
    }

    question2 =
      "Répondre aux questions suivantes en utilisant l'écriture de $f(x)$ la mieux adaptée :"
    correction2 = ''
    const q2a = `Calculer $f(0)$ et $f(${x1})$.`

    let corr2a =
      '$\\bullet$ Pour déterminer $f(0)$, les calculs à partir de la forme développée sont plus rapides : '
    if (a !== 1) {
      const calculImage = p.texCalculImage(0)
      const indexResultat = calculImage.lastIndexOf('=')
      corr2a += `<br>$f(0)= ${calculImage.slice(0, indexResultat)}= ${miseEnEvidence(calculImage.slice(indexResultat + 1).trim())}$ `
    } else {
      corr2a += `<br>$f(0)= 0^2${ecritureAlgebrique(-a * (x1 + x2))}\\times 0${ecritureAlgebrique(-a * (x1 + x2))}${ecritureAlgebrique(a * x1 * x2)}=${miseEnEvidence(a * x1 * x2)}$ `
    }

    corr2a += `<br>$\\bullet$ Pour déterminer $f(${x1})$, les calculs à partir de la forme factorisée sont plus rapides : `

    corr2a += `<br>$f(${x1})= ${rienSi1(a)}(${x1}${ecritureAlgebrique(-x1)})(${x1}${ecritureAlgebrique(-x2)})
    = ${Math.abs(a) === 1 ? '' : `${a}\\times `}0\\times ${ecritureParentheseSiNegatif(x1 - x2)}=${miseEnEvidence(0)}$ `

    const q2b = "Résoudre l'équation $f(x)=0$."
    let corr2b =
      'En utilisant la forme factorisée, cela revient à résoudre une équation produit-nul.'
    // @fixme : p.x1 n'est pas forcément une FractionEtendue : son type est false | number | FractionEtendue (dans les deux premiers cas, le code ci-dessous plante)

    corr2b += `<br>$f(x)=0 \\iff ${p.texFormeFactorisee} = 0${this.correctionDetaillee === true ? `${sp(25)}${miseEnEvidence('\\textit{Équation produit-nul }', bleuMathalea)}` : ''}$`
    corr2b += `<br>$\\phantom{f(x)=0} \\iff x${ecritureAlgebrique(-x1)} = 0 \\text{\\quad ou \\quad} x${ecritureAlgebrique(-x2)} = 0${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence("\\textit{L'un au moins des deux facteurs est nul}", bleuMathalea)}` : ''}$`
    corr2b += `<br>$\\phantom{f(x)=0} \\iff x=${x1} \\text{\\quad ou \\quad} x=${x2}$`
    corr2b += `<br>L'équation a deux solutions : $${miseEnEvidence(x1)}$ et $${miseEnEvidence(x2)}$.`

    const q2c = `Résoudre l'équation $f(x) = ${p.c.simplifie().texFraction}$.`
    let corr2c = `  On remarque que $${p.c.simplifie().texFraction}$ est la constante de la forme développée.<br>
    En utilisant la forme développée, on obtient :`
    corr2c += `<br> $f(x) = ${p.c.simplifie().texFraction} \\iff ${p.tex} = ${p.c.simplifie().texFraction}$`
    corr2c += `<br> $\\phantom{f(x) = ${p.c.simplifie().texFraction}} \\iff ${p.a.simplifie().texFractionSaufUn}x^2 ${p.b.simplifie().texFractionSaufUnSignee}x = 0 ${this.correctionDetaillee === true ? `${sp(30)}${miseEnEvidence('\\textit{Le second membre est nul }', bleuMathalea)}` : ''}$`
    corr2c += `<br> $\\phantom{f(x) = ${p.c.simplifie().texFraction}} \\iff x \\left(${p.a.simplifie().texFractionSaufUn}x ${p.b.simplifie().texFractionSaufUnSignee}\\right) = 0 ${this.correctionDetaillee === true ? `${sp(25)}${miseEnEvidence('\\textit{On met x en facteur }', bleuMathalea)}` : ''}$`
    corr2c += `<br> $\\phantom{f(x) = ${p.c.simplifie().texFraction}} \\iff x = 0 \\text{\\quad ou \\quad} ${p.a.simplifie().texFractionSaufUn}x ${p.b.simplifie().texFractionSaufUnSignee} = 0 ${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence("\\textit{L'un au moins des deux facteurs est nul}", bleuMathalea)}` : ''}$`
    corr2c += `<br> $\\phantom{f(x) = ${p.c.simplifie().texFraction}} \\iff x = 0 \\text{\\quad ou \\quad} x = ${p.b.oppose().diviseFraction(p.a).simplifie().texFraction} $`
    corr2c += `<br>
    L'équation a deux solutions : $${miseEnEvidence(0)}$ et $${miseEnEvidence(p.b.oppose().diviseFraction(p.a).simplifie().texFraction)}$.`
    const [sousQuestions, sousCorrections] = [
      [q2a, q2b, q2c],
      [corr2a, corr2b, corr2c],
    ]
    shuffle2tableaux(sousQuestions, sousCorrections)
    question2 += `<br><br>${numAlpha(0)} ${sousQuestions[0]}`
    correction2 += `${numAlpha(0)} ${sousCorrections[0]}`
    for (let i = 1; i < 3; i++) {
      question2 += `<br><br>${numAlpha(i)} ${sousQuestions[i]}`
      correction2 += `<br><br>${numAlpha(i)} ${sousCorrections[i]}`
    }

    this.listeQuestions = [question1, question2]
    this.listeCorrections = [correction1, correction2]

    listeQuestionsToContenu(this)
  }
}
export default FormeTrinome
