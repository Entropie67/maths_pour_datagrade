import { shuffle2tableaux } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { numAlpha, sp } from '../../lib/outils/outilString'
import Exercice from '../Exercice'

import { listeQuestionsToContenu, randint } from '../../modules/outils'

import FractionEtendue from '../../modules/FractionEtendue'
import Trinome from '../../modules/Trinome'
export const titre =
  "Utiliser les différentes formes d'un polynôme du second degré ($3$ formes)"
export const interactifReady = false

export const dateDePublication = '26/06/2023'
export const dateDeModifImportante = '5/11/2023'

/**
 * Forme développée, factorisée ou canonique pour résoudre équations et inéquations
 * @author Gilles Mora
 */
export const uuid = '327cf'

export const refs = {
  'fr-fr': ['2L14-3'],
  'fr-ch': ['1mF3-23'],
}
export default class EtudeTrinome extends Exercice {
  constructor() {
    super()
    this.sup = 1
    this.sup2 = 1
    // 6 questions : la troisième a quatre sous-questions
    this.nbQuestions = 6
    this.nbQuestionsModifiable = false
    this.besoinFormulaireNumerique = [
      'Forme de la fonction de départ',
      3,
      '1 : Développée \n2 : Factorisée\n3 : Canonique',
    ]
    this.besoinFormulaire2Numerique = [
      'Niveau de difficulté',
      3,
      '1 : a=1 \n2 : a différent de 1',
    ]
    this.correctionDetaillee = false
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    let a = randint(-4, 4, [0, 1])
    let correction1 = ''
    let correction2 = ''
    let question1 = ''
    let question2 = ''
    let question3 = ''
    if (this.sup2 === 1) {
      a = 1
    }
    let x1 = randint(-8, 8, 0)
    let x2 = x1 + 2 * randint(1, 6)
    while (x1 === -x2 || x1 === 0 || x2 === 0) {
      // x1 + x2 doit être pair pour n'avoir que des nombres entiers dans les différentes formes
      x1 = randint(-8, 8, 0)
      x2 = x1 + 2 * randint(1, 6)
    }
    const p = new Trinome(0, 0, 0)
    const q = new Trinome(a, -a * (x1 + x2), a * x1 * x2)
    p.defFormeFactorisee(a, x1, x2)
    const etapesDeveloppement = p.arrayTexDevelopperFormeCanonique
    const etapesDeveloppement2 = p.arrayTexDevelopperFormeFactorisee
    if (this.sup === 1) {
      this.introduction = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par $f(x)=${q.tex}$. ${sp(5)} ($\\textit{Forme développée}$)
     `
      question1 = `Montrer que $f(x)$ peut aussi s'écrire $f(x)=${p.texFormeFactorisee}$.${sp(5)} ($\\textit{Forme factorisée}$)`
      question2 = `Montrer que $f(x)$ peut aussi s'écrire $f(x)=${p.texFormeCanonique}$. ${sp(5)} ($\\textit{Forme canonique}$)`
      correction1 = 'On développe la forme factorisée : <br>'
      if (a !== 1) {
        correction1 += `$\\begin{aligned}
    ${p.texFormeFactorisee} &= ${etapesDeveloppement2[0]}${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence('\\textit{On développe avec la double distributivité}')}` : ''}\\\\
     & = ${etapesDeveloppement2[1]} ${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence('\\textit{On développe avec la simple distributivité}')}` : ''}\\\\
    &= ${etapesDeveloppement2[2]}${this.correctionDetaillee === true ? `${sp(20)}${miseEnEvidence('\\textit{ On réduit}')}` : ''}\\\\
    &=f(x)
     \\end{aligned}$<br>`
      } else {
        correction1 += `$\\begin{aligned}
     ${p.texFormeFactorisee} &= ${etapesDeveloppement2[1]}${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence('\\textit{On développe avec la double distributivité}')}` : ''}\\\\
      & = ${etapesDeveloppement2[2]}${this.correctionDetaillee === true ? `${sp(20)}${miseEnEvidence('\\textit{On réduit}')}\\\\&=f(x)` : '\\\\&=f(x)'}
      \\end{aligned}$<br>`
      }
      correction1 += `On retrouve la forme développée, donc on en déduit que $f(x)$ peut s'écrire sous forme factorisée : $f(x)=${miseEnEvidence(p.texFormeFactorisee)}$.`
      correction2 = `On développe la forme canonique : <br>
      $\\begin{aligned}${p.texFormeCanonique} &=${etapesDeveloppement[0]}${
        this.correctionDetaillee === true
          ? `${sp(5)}${miseEnEvidence("\\textit{On développe avec l'égalité remarquable}")}`
          : ''}\\\\
  ${a !== 1
          ? `&=${etapesDeveloppement[1]}${
              this.correctionDetaillee === true
                ? `${sp(5)}${miseEnEvidence('\\textit{On développe avec la simple distributivité}')}`
                : ''}\\\\`
          : ''}&=${etapesDeveloppement[2]}${this.correctionDetaillee === true ? `${sp(20)}${miseEnEvidence('\\textit{On réduit}')}` : ''}
   \\end{aligned}$<br>`
      correction2 += `On en déduit que $f(x)$ s'écrit sous forme canonique : $f(x)=${miseEnEvidence(p.texFormeCanonique)}$.`
    }
    if (this.sup === 2) {
      this.introduction = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par $f(x)=${p.texFormeFactorisee}$. ${sp(5)} ($\\textit{Forme factorisée}$)
     `
      question1 = `Montrer que $f(x)$ peut aussi s'écrire $f(x)=${q.tex}$. ${sp(5)} ($\\textit{Forme développée}$)`
      question2 = `Montrer que $f(x)$ peut aussi s'écrire $f(x)=${p.texFormeCanonique}$. ${sp(5)} ($\\textit{Forme canonique}$)`
      correction1 = 'On développe la forme factorisée : <br>'
      if (a !== 1) {
        correction1 += `$\\begin{aligned}
        f(x)&=${p.texFormeFactorisee}\\\\
     &= ${etapesDeveloppement2[0]}${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence('\\textit{On développe avec la double distributivité}')}` : ''}\\\\
     & = ${etapesDeveloppement2[1]}${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence('\\textit{On développe avec la simple distributivité}')}` : ''}\\\\
    &= ${etapesDeveloppement2[2]}${this.correctionDetaillee === true ? `${sp(20)}${miseEnEvidence('\\textit{On réduit}')}` : ''}
     \\end{aligned}$<br>`
      } else {
        correction1 += `$\\begin{aligned}
        f(x)&=${p.texFormeFactorisee}\\\\
     &= ${etapesDeveloppement2[1]}${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence('\\textit{On développe avec la double distributivité}')}` : ''}\\\\
      & = ${etapesDeveloppement2[2]}${this.correctionDetaillee === true ? `${sp(20)}${miseEnEvidence('\\textit{On réduit}')}` : ''}
      \\end{aligned}$<br>`
      }
      correction1 += `On en déduit que $f(x)$ s'écrit sous forme développée : $f(x)=${miseEnEvidence(p.tex)}$.`
      correction2 = 'On développe la forme canonique : <br>'
      if (a === 1) {
        correction2 += `$\\begin{aligned}
${p.texFormeCanonique} &=${etapesDeveloppement[1]}${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence("\\textit{On développe avec l'égalité remarquable}")}\\\\` : '\\\\'}
&=${etapesDeveloppement[2]}${this.correctionDetaillee === true ? `${sp(20)}${miseEnEvidence('\\textit{On réduit}')}` : ''}
\\end{aligned}$<br>`
      } else {
        correction2 += `$\\begin{aligned}
        ${p.texFormeCanonique} &=${etapesDeveloppement[0]}${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence("\\textit{On développe avec l'égalité remarquable}")}\\\\` : '\\\\'}
  &=${etapesDeveloppement[1]}${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence('\\textit{On développe avec la simple distributivité}')}\\\\` : '\\\\'}
&=${etapesDeveloppement[2]}${this.correctionDetaillee === true ? `${sp(20)}${miseEnEvidence('\\textit{On réduit}')}` : ''}
\\end{aligned}$<br>`
      }

      correction2 += `On en déduit que $f(x)$ s'écrit sous forme canonique : $f(x)=${miseEnEvidence(p.texFormeCanonique)}$.`
    }
    if (this.sup === 3) {
      this.introduction = `Soit $f$ la fonction définie sur $\\mathbb{R}$ par $f(x)=${p.texFormeCanonique}$. ${sp(5)} ($\\textit{Forme canonique}$)
     `
      question1 = `Montrer que $f(x)$ peut aussi s'écrire $f(x)=${q.tex}$. ${sp(5)} ($\\textit{Forme développée}$)`
      question2 = `Montrer que $f(x)$ peut aussi s'écrire $f(x)=${p.texFormeFactorisee}$. ${sp(5)} ($\\textit{Forme factorisée}$)`

      correction1 = 'On développe la forme canonique : <br>'
      if (a === 1) {
        correction1 += `
      $\\begin{aligned}
    f(x)&=${p.texFormeCanonique}\\\\
  &=${etapesDeveloppement[1]}${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence("\\textit{On développe avec l'égalité remarquable}")}` : ''}\\\\
 &=${etapesDeveloppement[2]}${this.correctionDetaillee === true ? `${sp(20)}${miseEnEvidence('\\textit{On réduit}')}` : ''}
 \\end{aligned}$<br>`
      } else {
        correction1 += `
        $\\begin{aligned}
        f(x)&=${p.texFormeCanonique}\\\\
      &=${etapesDeveloppement[0]}${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence("\\textit{On développe avec l'égalité remarquable}")}` : ''}\\\\
      &=${etapesDeveloppement[1]}${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence('\\textit{On développe avec la simple distributivité}')}` : ''}\\\\
      &=${etapesDeveloppement[2]}${this.correctionDetaillee === true ? `${sp(20)}${miseEnEvidence('\\textit{On réduit}')}` : ''}
     \\end{aligned}$<br>`
      }
      correction1 += `On en déduit que $f(x)$ s'écrit sous forme développée : $f(x)=${miseEnEvidence(`${rienSi1(p.a)}x^2${ecritureAlgebrique(p.b)}x${x1 === 0 || x2 === 0 ? '' : `${ecritureAlgebrique(p.c)}`}`)}$.`

      correction2 = 'On développe la forme factorisée :<br> '
      if (a !== 1) {
        correction2 += `$${p.texFormeFactorisee} = ${etapesDeveloppement2[0]}${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence('\\textit{On développe avec la double distributivité}')}<br>` : ''}$<br>`
        correction2 += `$\\phantom{${p.texFormeFactorisee}} = ${etapesDeveloppement2[1]}${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence('\\textit{On développe avec la simple distributivité}')}` : ''}$<br>`
        correction2 += `$\\phantom{${p.texFormeFactorisee}} = ${etapesDeveloppement2[2]}${this.correctionDetaillee === true ? `${sp(20)}${miseEnEvidence('\\textit{On réduit}')}` : ''}$<br>`
        correction2 += `$\\phantom{${p.texFormeFactorisee}} = f(x)$<br>`
      } else {
        correction2 += `$${p.texFormeFactorisee} = ${etapesDeveloppement2[1]}${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence('\\textit{On développe avec la double distributivité}')}` : ''}$<br>`
        correction2 += `$\\phantom{${p.texFormeFactorisee}} = ${etapesDeveloppement2[2]}${this.correctionDetaillee === true ? `${sp(20)}${miseEnEvidence('\\textit{On réduit}')}` : ''}$<br>`
        correction2 += `$\\phantom{${p.texFormeFactorisee}} = f(x)$<br>`
      }
      correction2 += `On retrouve la même forme développée que celle de la question précédente donc on a bien $f(x)=${miseEnEvidence(p.texFormeFactorisee)}$.<br>`
    }
    question3 =
      "Répondre aux questions suivantes en utilisant l'écriture de $f(x)$ la mieux adaptée :<br>"
    let correction3 = ''

    const q3a = `Calculer $f(0)$, $f(${x1})$ puis $f(${p.alpha.simplifie().texFraction})$.`
    let corr3a =
      '$\\bullet$ Pour déterminer $f(0)$, les calculs à partir de la forme développée sont plus rapides :<br>'
    if (a !== 1) {
      corr3a += `$f(0)= ${p.texCalculImage(0)}$<br>`
    } else {
      corr3a += `$f(0)= 0^2${ecritureAlgebrique(-a * (x1 + x2))}\\times 0${ecritureAlgebrique(-a * (x1 + x2))}${ecritureAlgebrique(a * x1 * x2)}=${a * x1 * x2}$ <br>`
    }

    corr3a += `$\\bullet$ Pour déterminer $f(${x1})$, les calculs à partir de la forme factorisée sont plus rapides : <br>`
    corr3a += `$f(${x1})= ${rienSi1(a)}(${x1}${p.x1 instanceof FractionEtendue ? p.x1.oppose().simplifie().texFractionSignee : -p.x1})(${x1}${p.x2 instanceof FractionEtendue ? p.x2.oppose().simplifie().texFractionSignee : -p.x2})
    = ${rienSi1(a)}\\times 0\\times ${ecritureParentheseSiNegatif(x1 - x2)}=0$ <br>`
    corr3a += `$\\bullet$ Pour déterminer $f(${p.alpha.simplifie().texFraction})$, les calculs à partir de la forme canonique sont plus rapides :<br> `
    corr3a += `$f(${p.alpha.simplifie().texFraction})= ${p.a.simplifie().texFractionSaufUn}\\left(${p.alpha.simplifie().texFraction}${p.alpha.oppose().simplifie().texFractionSignee} \\right)^2${p.beta.simplifie().texFractionSignee}=0${p.beta.simplifie().texFractionSignee}=${p.beta.simplifie().texFraction}$.`
    corr3a += `<br>Ainsi, $f(0)=${miseEnEvidence(p.c.simplifie().texFraction)}$, $f(${x1})=${miseEnEvidence('0')}$ et $f(${p.alpha.simplifie().texFraction})=${miseEnEvidence(p.beta.simplifie().texFraction)}$.`

    const q3b = "Résoudre l'équation $f(x)=0$."
    let corr3b =
      'En utilisant la forme factorisée, cela revient à résoudre une équation produit-nul.<br>'
    corr3b += `$f(x)=0 \\iff ${p.texFormeFactorisee} = 0${this.correctionDetaillee === true ? `${sp(25)}${miseEnEvidence('\\textit{Équation produit-nul }')}` : ''}$<br>`
    corr3b += `$\\phantom{f(x)=0} \\iff x${p.x1 instanceof FractionEtendue ? p.x1.simplifie().oppose().texFractionSignee : -p.x1} = 0 \\text{\\quad ou \\quad} x${p.x2 instanceof FractionEtendue ? p.x2.simplifie().oppose().texFractionSignee : -p.x2} = 0${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence("\\textit{L'un au moins des deux facteurs est nul}")}` : ''}$<br>`
    corr3b += `$\\phantom{f(x)=0} \\iff x=${p.x1 instanceof FractionEtendue ? p.x1.simplifie().texFraction : p.x1} \\text{\\quad ou \\quad} x=${p.x2 instanceof FractionEtendue ? p.x2.simplifie().texFraction : p.x2}$<br>`
    corr3b += `L'équation a deux solutions : $${miseEnEvidence(String(p.x1 instanceof FractionEtendue ? p.x1.simplifie().texFraction : p.x1))}$ et $${miseEnEvidence(String(p.x2 instanceof FractionEtendue ? p.x2.simplifie().texFraction : p.x2))}$.`

    const q3c = `Résoudre l'équation $f(x)=${p.beta.simplifie().texFraction}$.`
    let corr3c =
      'En utilisant la forme canonique, cela revient à résoudre une équation avec un carré isolé.<br>'
    corr3c += `$f(x)= ${p.beta.simplifie().texFraction}\\iff ${p.texFormeCanonique} =${p.beta.simplifie().texFraction}$`

    if (a === 1) {
      corr3c += `$\\phantom{f(x)= ${p.beta.simplifie().texFraction}} \\iff ${p.a.simplifie().texFractionSaufUn}\\left( x ${p.alpha.oppose().simplifie().texFractionSignee} \\right)^2=0${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence('\\textit{Équation avec un carré isolé }')}` : ''}$`
    } else {
      corr3c += `$\\phantom{f(x)= ${p.beta.simplifie().texFraction}} \\iff ${p.a.simplifie().texFractionSaufUn}\\left( x ${p.alpha.oppose().simplifie().texFractionSignee} \\right)^2=0$`
    }

    if (a !== 1) {
      corr3c += `$\\phantom{f(x)= ${p.beta.simplifie().texFraction}} \\iff\\left( x ${p.alpha.oppose().simplifie().texFractionSignee} \\right)^2=0${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence('\\textit{Équation avec un carré isolé }')}` : ''}$`
    } else {
      corr3c += ''
    }
    corr3c += `$\\phantom{f(x)= ${p.beta.simplifie().texFraction}} \\iff x ${p.alpha.oppose().simplifie().texFractionSignee}=0$<br>`
    corr3c += `$\\phantom{f(x)= ${p.beta.simplifie().texFraction}} \\iff x=${p.alpha.simplifie().texFraction}$<br>`
    corr3c += `L'équation a une solution : $${miseEnEvidence(p.alpha.simplifie().texFraction)}$.`

    const q3d = `Résoudre l'équation $f(x) = ${p.c.simplifie().texFraction}$.`
    let corr3d = ` On remarque que $${p.c.simplifie().texFraction}$ est la constante de la forme développée.<br>
    En utilisant la forme développée, on obtient :<br> `
    corr3d += `$f(x) = ${p.c.simplifie().texFraction} \\iff ${p.tex} = ${p.c.simplifie().texFraction}$<br>`
    corr3d += `$\\phantom{f(x) = ${p.c.simplifie().texFraction}} \\iff ${p.a.simplifie().texFractionSaufUn}x^2 ${p.b.simplifie().texFractionSaufUnSignee}x = 0 ${this.correctionDetaillee === true ? `${sp(30)}${miseEnEvidence('\\textit{Le second membre est nul }')}` : ''}$<br>`
    corr3d += `$\\phantom{f(x) = ${p.c.simplifie().texFraction}} \\iff x \\left(${p.a.simplifie().texFractionSaufUn}x ${p.b.simplifie().texFractionSaufUnSignee}\\right) = 0 ${this.correctionDetaillee === true ? `${sp(25)}${miseEnEvidence('\\textit{On met x en facteur }')}` : ''}$<br>`
    corr3d += `$\\phantom{f(x) = ${p.c.simplifie().texFraction}} \\iff x = 0 \\text{\\quad ou \\quad} ${p.a.simplifie().texFractionSaufUn}x ${p.b.simplifie().texFractionSaufUnSignee} = 0 ${this.correctionDetaillee === true ? `${sp(5)}${miseEnEvidence("\\textit{L'un au moins des deux facteurs est nul}")}` : ''}$<br>`
    corr3d += `$\\phantom{f(x) = ${p.c.simplifie().texFraction}} \\iff x = 0 \\text{\\quad ou \\quad} x = ${p.b.oppose().diviseFraction(p.a).simplifie().texFraction} $`
    corr3d += `L'équation a deux solutions : $${miseEnEvidence('0')}$ et $${miseEnEvidence(p.b.oppose().diviseFraction(p.a).simplifie().texFraction)}$.`

    const [sousQuestions, sousCorrections] = [
      [q3a, q3b, q3c, q3d],
      [corr3a, corr3b, corr3c, corr3d],
    ]
    shuffle2tableaux(sousQuestions, sousCorrections)
    for (let i = 0; i < 4; i++) {
      question3 += `${numAlpha(i)} ${sousQuestions[i]}<br>`
      correction3 += `${numAlpha(i)} ${sousCorrections[i]}<br>`
    }
    this.listeQuestions = [question1, question2, question3]
    this.listeCorrections = [correction1, correction2, correction3]

    listeQuestionsToContenu(this)
  }
}
