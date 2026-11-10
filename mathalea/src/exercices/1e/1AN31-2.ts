import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf0,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs, signe } from '../../lib/outils/nombres'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Calculer la dérivée d'une fonction avec $\\mathrm{e}^x$"
export const dateDePublication = '06/08/2025'
export const dateDeModifImportante = '20/10/2026'
export const interactifReady = true

/**
 * Calculer la dérivée d'une fonction avec exp
 * @author Gilles Mora et Stéphane Guyon
 */

export const uuid = 'e531b'

export const refs = {
  'fr-fr': ['1AN31-2', 'TSA3-25', 'TCA7-25'],
  'fr-ch': [''],
}

export default class DeriveeExp1AN312 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n0: Mélange\n1 : $a*e^x+bx+c$\n2 : $(ax+b)e^x  $\n3 : $\\dfrac{k*e^x}{a*x+b}$\n4 : $\\dfrac{ax+b}{e^x}$\n5 :   $(ax^2+bx+c)e^x$\n6 : $\\dfrac{k*e^x}{ax^2+b}$\n7 : $\\dfrac{ax^2+bx+c}{e^x}$',
    ]
    this.sup = '0'
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    const listeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 7,
      melange: 0,
      defaut: 0,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let value = ''
      const texteIntro =
        'On considère la fonction $f$ définie et dérivable sur $\\mathbb{R}$ par :'
      switch (listeDeQuestions[i]) {
        case 1: // aexp(x)+bx+c
          {
            const a = randint(-10, 10, 0)
            const b = randint(-5, 5)
            const c = randint(-5, 5, b)
            const choix = choice([true, false])
            texteCorr = `La fonction $f$ est dérivable sur $\\mathbb{R}$ comme somme de fonctions dérivables sur $\\mathbb{R}$.<br><br>
            Pour tout $x$ de $\\mathbb{R}$, `
            if (choix === true) {
              texte =
                texteIntro +
                ` $f(x)=${rienSi1(a)}\\mathrm{e}^x${b === 0 ? `${ecritureAlgebrique(c)}` : `${signe(b)}${reduireAxPlusB(abs(b), c)}`}$.<br>
            Calculer $f'(x)$.`
              texteCorr += `$f'(x)=${miseEnEvidence(`${rienSi1(a)}\\mathrm{e}^x${b === 0 ? '' : `${ecritureAlgebrique(b)}`}`)}$.`
            } else {
              texte =
                texteIntro +
                ` $f(x)=${reduireAxPlusB(b, c)}${signe(a)}${rienSi1(abs(a))}\\mathrm{e}^x$.<br>
            Calculer $f'(x)$.`
              texteCorr += `$f'(x)=${miseEnEvidence(`${b === 0 ? '' : `${b}`}${ecritureAlgebriqueSauf1(a)}\\mathrm{e}^x`)}$.`
            }
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminales,
              { texteAvant: "<br>$f'(x)=$" },
            )
            value = `${`${a}e^x+${b}`}`
            handleAnswers(this, i, { reponse: { value } })
          }
          break
        case 2: //e^x * (a*x+b)
          {
            const a = randint(-10, 10, 0)
            const b = randint(-10, 10)
            texte =
              texteIntro +
              ` $f(x) = (${reduireAxPlusB(a, b)})\\mathrm{e}^x  $.<br> Calculer $f'(x)$.`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminales,
              { texteAvant: "<br>$f'(x)=$" },
            )
            texteCorr = `On reconnaît que $f = u\\times v$ avec $u(x) = \\mathrm{e}^x$ et $v(x) = ${reduireAxPlusB(a, b)}$. <br>
          On a $u'(x) = \\mathrm{e}^x$ et $v'(x) = ${a}$. <br>
          Par conséquent, <br>$\\begin{aligned}f'(x) &= u'(x) \\times v(x) + u(x) \\times v'(x)\\\\
          & = \\mathrm{e}^x \\times (${reduireAxPlusB(a, b)}) + \\mathrm{e}^x \\times ${ecritureParentheseSiNegatif(a)} \\\\
           & = \\mathrm{e}^x \\left(${reduireAxPlusB(a, b)}  ${ecritureAlgebriqueSauf0(a)}\\right) \\\\
          &=  ${miseEnEvidence(`(${reduireAxPlusB(a, a + b)})\\mathrm{e}^x`)}
          \\end{aligned}$.`
            value = `(${reduireAxPlusB(a, a + b)})\\mathrm{e}^x`
            handleAnswers(this, i, { reponse: { value } })
          }
          break
        case 3: // ke^x / (a*x+b)
          {
            const a = randint(-10, 10, 0)
            const b = randint(-10, 10)
            const k = randint(-5, 5, [0, 1, -1])
            const racine = new FractionEtendue(-b, a).simplifie()
            texte = `Soit $f$ la fonction définie et dérivable sur $\\mathbb{R}\\setminus\\left\\{${racine.texFractionSimplifiee}\\right\\}$ par $f(x) = \\dfrac{${k}\\mathrm{e}^x}{${reduireAxPlusB(a, b)}}$. <br> Calculer $f'(x)$.`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminales,
              { texteAvant: "<br>$f'(x)=$" },
            )
            texteCorr = `On reconnaît que $f = \\dfrac{u}{v}$ avec $u(x) = ${k}\\mathrm{e}^x$ et $v(x) = ${reduireAxPlusB(a, b)}$. <br>
          On a $u'(x) = ${k}\\mathrm{e}^x$ et $v'(x) = ${a}$. <br>
          Par conséquent, <br>$\\begin{aligned}f'(x) &= \\dfrac{u'(x) \\times v(x) - u(x) \\times v'(x)}{v(x)^2}\\\\
          & = \\dfrac{${k}\\mathrm{e}^x \\times (${reduireAxPlusB(a, b)}) - ${ecritureParentheseSiNegatif(k)}\\mathrm{e}^x \\times ${ecritureParentheseSiNegatif(a)}}{(${reduireAxPlusB(a, b)})^2} \\\\
           & = \\dfrac{${k}\\mathrm{e}^x \\left(${reduireAxPlusB(a, b)}  ${ecritureAlgebriqueSauf0(-a)}\\right)}{(${reduireAxPlusB(a, b)})^2} \\\\
          &=  ${miseEnEvidence(`\\dfrac{ ${k}\\mathrm{e}^x(${reduireAxPlusB(a, b - a)})}{(${reduireAxPlusB(a, b)})^2}`)}
          \\end{aligned}$.`
            value = `\\dfrac{${k}\\mathrm{e}^x(${reduireAxPlusB(a, b - a)})}{(${reduireAxPlusB(a, b)})^2}`
            handleAnswers(this, i, { reponse: { value } })
          }
          break
        case 4: // (a*x+b)/e^x
          {
            const a = randint(-10, 10, 0)
            const b = randint(-10, 10)
            const k = randint(-5, 5, [0, 1, -1])
            texte =
              texteIntro +
              ` $f(x) = \\dfrac{${reduireAxPlusB(a, b)}}{${k}\\mathrm{e}^x}$. <br> Calculer $f'(x)$ .`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminales,
              { texteAvant: "<br>$f'(x)=$" },
            )
            texteCorr = `On reconnaît que $f = \\dfrac{u}{v}$ avec $u(x) = ${reduireAxPlusB(a, b)}$ et $v(x) = ${k}\\mathrm{e}^x$. <br>
          On a $u'(x) = ${a}$ et $v'(x) = ${k}\\mathrm{e}^x$. <br>
          Par conséquent, <br>$\\begin{aligned}f'(x) &= \\dfrac{u'(x) \\times v(x) - u(x) \\times v'(x)}{v(x)^2}\\\\
          & = \\dfrac{${a}\\times${ecritureParentheseSiNegatif(k)}\\mathrm{e}^x   -  (${reduireAxPlusB(a, b)})\\times${ecritureParentheseSiNegatif(k)}\\mathrm{e}^x}{\\left(${k}\\mathrm{e}^x\\right)^2} \\\\
          & = \\dfrac{${k}\\mathrm{e}^x \\left(${a} - (${reduireAxPlusB(a, b)})\\right)}{\\left(${k}\\mathrm{e}^x\\right)^2} \\\\
           &=  \\dfrac{${k}\\mathrm{e}^x(${reduireAxPlusB(-a, a - b)})}{${k * k}\\mathrm{e}^{2x}} \\\\
           &=  ${miseEnEvidence(`\\dfrac{${reduireAxPlusB(-a, a - b)}}{${k}\\mathrm{e}^x}`)}
          \\end{aligned}$.`
            value = `\\dfrac{${reduireAxPlusB(-a, a - b)}}{${k}\\mathrm{e}^x}`
            handleAnswers(this, i, { reponse: { value } })
          }
          break

        case 5: //  (ax^2+bx+c)e^x
          {
            const a = randint(-10, 10, 0)
            const b = randint(-10, 10)
            const c = randint(-10, 10)
            const poly = new Polynome({
              rand: true,
              coeffs: [c, b, a],
            }) // ax+b
            const polyF = new Polynome({
              rand: true,
              coeffs: [c + b, 2 * a + b, a],
            })

            texteCorr = `La fonction $f$ est dérivable sur $\\mathbb{R}$ comme produit de fonctions dérivables sur $\\mathbb{R}$.<br>
            $f$ est de la forme $u\\times v$ avec $u(x)=${poly}$ et $v(x)=\\mathrm{e}^x$, donc sa fonction dérivée est donnée par 
            $f'=u'\\times v+ u\\times v'$.<br><br>
            Pour tout $x$ de $\\mathbb{R}$, <br>`
            texte =
              texteIntro +
              ` $f(x)=${poly.isMon() ? `${poly}\\mathrm{e}^x` : `(${poly})\\mathrm{e}^x`}$.<br>
            Calculer $f'(x)$ et écrire son expression sous forme factorisée.`
            texteCorr += `
              $\\begin{aligned}
              f'(x)&=\\underbrace{${poly.derivee()}}_{u'(x)}\\times \\underbrace{\\mathrm{e}^x}_{v(x)}+\\underbrace{(${poly})}_{u(x)}\\times \\underbrace{\\mathrm{e}^x}_{v'(x)}\\\\${
                poly.isMon()
                  ? ''
                  : `
              &=\\mathrm{e}^x(${poly.derivee()}+(${poly}))\\\\`
              }
              &= ${miseEnEvidence(`\\mathrm{e}^x(${polyF})`)}.
              \\end{aligned}$`

            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminales,
              { texteAvant: "<br>$f'(x)=$" },
            )
            value = `${`(${polyF})e^x`}`
            handleAnswers(this, i, {
              reponse: { value, options: { factorisation: true } },
            })
          }
          break

        case 6: // (m*e^x)/(ax^2+b)
          {
            const a = randint(1, 5)
            const b = 0
            const c = randint(1, 6)
            const m = randint(1, 7)
            const poly = new Polynome({
              rand: true,
              coeffs: [c, b, a],
            }) // ax^2+bx+c
            const polyDer = poly.derivee()
            const polySol = new Polynome({
              rand: true,
              coeffs: [c - b, b - 2 * a, a],
            })
            const value = `\\dfrac{${rienSi1(m)}(${polySol})\\mathrm{e}^{x}}{(${poly})^2}`
            texteCorr = `La fonction $f$ est dérivable sur $\\mathbb{R}$ comme quotient de fonctions dérivables sur $\\mathbb{R}$ dont le dénominateur ne s'annule pas sur $\\mathbb{R}$.<br>
          $f$ est de la forme $\\dfrac{u}{v}$ avec $u(x)=${rienSi1(m)}\\mathrm{e}^{x}$ et $v(x)=${poly}$, donc sa fonction dérivée est donnée par 
          $f'=\\dfrac{u'\\times v- u\\times v'}{v^2}$.<br><br>
          Soit $x$ de $\\mathbb{R}$, <br>`
            texte = ` On considère la fonction $f$ définie sur $\\mathbb{R}$ par : 
          $f(x)=\\dfrac{${rienSi1(m)}\\mathrm{e}^{x}}{${poly}}$.<br>
          Calculer $f'(x)$.`
            texteCorr += ` 
            $\\begin{aligned}
            f'(x)&=\\dfrac{\\overbrace{${rienSi1(m)}\\mathrm{e}^{x}}^{u'(x)}\\times (\\overbrace{${poly}}^{v(x)})-\\overbrace{${rienSi1(m)}\\mathrm{e}^{x}}^{u(x)}\\times \\overbrace{(${polyDer})}^{v'(x)}}{\\underbrace{(${poly})^2}_{(v(x))^2}}\\\\
       &=\\dfrac{ ${rienSi1(m)}\\mathrm{e}^{x}\\left(${poly}- (${polyDer})\\right)}{(${poly})^2} \\\\
      &=${miseEnEvidence(value)}.
            \\end{aligned}$`

            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminales,
              { texteAvant: "<br>$f'(x)=$" },
            )
            handleAnswers(this, i, {
              reponse: { value, options: { fonction: true } },
            })
          }
          break
        case 7: // \dfrac{ax^2+bx+c}{e^x}
          {
            const a = randint(-10, 10, 0)
            const b = randint(-10, 10)
            const c = randint(-10, 10, 0)
            texte =
              texteIntro +
              ` $f(x) = \\dfrac{${reduirePolynomeDegre3(0, a, b, c)}}{\\mathrm{e}^x}$. <br> Calculer $f'(x)$ .`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminales,
              { texteAvant: "<br>$f'(x)=$" },
            )
            texteCorr = `On reconnaît que $f = \\dfrac{u}{v}$ avec $u(x) = ${reduirePolynomeDegre3(0, a, b, c)}$ et $v(x) = \\mathrm{e}^x$. <br>
          On a $u'(x) = ${reduireAxPlusB(2 * a, b)}$ et $v'(x) = \\mathrm{e}^x$. <br>
          Par conséquent, <br>$\\begin{aligned}f'(x) &= \\dfrac{u'(x) \\times v(x) - u(x) \\times v'(x)}{v(x)^2}\\\\
          & = \\dfrac{(${reduireAxPlusB(2 * a, b)})\\times\\mathrm{e}^x   -  (${reduirePolynomeDegre3(0, a, b, c)})\\times\\mathrm{e}^x}{\\left(\\mathrm{e}^x\\right)^2} \\\\
          & = \\dfrac{\\mathrm{e}^x \\left(${reduireAxPlusB(2 * a, b)} - (${reduirePolynomeDegre3(0, a, b, c)})\\right)}{\\left(\\mathrm{e}^x\\right)^2} \\\\
           &=  \\dfrac{\\mathrm{e}^x(${reduirePolynomeDegre3(0, -a, 2 * a - b, b - c)})}{\\mathrm{e}^{2x}} \\\\
           &=  ${miseEnEvidence(`\\dfrac{${reduirePolynomeDegre3(0, -a, 2 * a - b, b - c)}}{\\mathrm{e}^x}`)}
          \\end{aligned}$.`
            value = `\\dfrac{${reduirePolynomeDegre3(0, -a, 2 * a - b, b - c)}}{\\mathrm{e}^x}`
            handleAnswers(this, i, { reponse: { value } })
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
