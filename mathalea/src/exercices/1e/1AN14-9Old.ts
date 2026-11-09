import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiMoins,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { abs, signe } from '../../lib/outils/nombres'
import { pgcd } from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Calculer la dérivée d'une fonction avec exponentielle"
export const dateDePublication = '06/08/2025'
export const interactifReady = true

/**
 * Calculer la dérivée d'une fonction avec exp
 * @author Gilles Mora
 */

export const uuid = 'd2a2d'

export const refs = {
  'fr-fr': [''],
  'fr-ch': [''],
}

export default class DeriveeExpOld extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 : a*e^x+bx+c\n2 : e^u avec u affine\n3 :  e^u avec u poly second degré\n4 : u*e^x\n5 : (ax+b)*e^mx\n6 : (m*e^x)/(ax+b) ou  (m*e^x)/(ax^2+b) \n7 : Mélange',
    ]
    this.sup = '7'
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    const listeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 6,
      melange: 7,
      defaut: 7,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let value = ''
      const texteIntro =
        'On considère la fonction $f$ définie sur $\\mathbb{R}$ par :'
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
        case 2: // exp(u) avec u affine
          {
            const listeab = [
              [randint(-10, 10, [0, 1]), 0],
              [randint(-30, 30, [0, 10]) / 10, 0],
              [randint(-5, 5, 0), randint(-10, 10, 0)],
              [randint(-30, 30, [0, 10]) / 10, randint(-30, 30, [0, 10]) / 10],
            ] // a puis b
            const ab = choice(listeab)
            const poly = new Polynome({ rand: true, coeffs: [ab[1], ab[0]] }) // ax+b
            const derivee = poly.derivee()
            texte =
              texteIntro +
              `$f(x)=\\mathrm{e}^{${poly}}$.<br>
             Calculer $f'(x)$.`
            texteCorr = `La fonction $f$ est dérivable sur $\\mathbb{R}$ comme composée de fonctions dérivables sur $\\mathbb{R}$.<br>
            $f$ est de la forme $\\mathrm{e}^u$ avec $u(x)=${poly}$, donc sa fonction dérivée est donnée par $f'=u'\\mathrm{e}^u$.<br><br>
            Pour tout $x$ de $\\mathbb{R}$, `
            texteCorr += `${derivee.isMon() ? `$f'(x)=${miseEnEvidence(`${derivee}\\mathrm{e}^{${poly}}`)}$` : `$f'(x)=${miseEnEvidence(`(${derivee})\\mathrm{e}^{${poly}}`)}$`}.`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminales,
              { texteAvant: "<br>$f'(x)=$" },
            )
            value = `${`${derivee}e^{${poly}}`}`
          }
          handleAnswers(this, i, { reponse: { value } })
          break

        case 3: // exp(u) avec u second degré
          // switch (randint(2,2)) {
          {
            const listeabc = [
              [randint(-10, 10, 0), 0, 0],
              [randint(-2, 2, 0), randint(-2, 2, 0), 0],
              [randint(-2, 2, 0), 0, randint(-2, 2, 0)],
              [randint(-2, 2, 0), randint(-5, 5, 0), randint(-2, 2, 0)],
              [randint(-30, 30, [-20, -10, 0, 10, 20]) / 10, 0, 0],
            ] // a puis b
            const abc = choice(listeabc)
            const poly = new Polynome({
              rand: true,
              coeffs: [abc[2], abc[1], abc[0]],
            })
            const derivee = poly.derivee()
            texte =
              texteIntro +
              `$f(x)=\\mathrm{e}^{${poly}}$.<br>
             Calculer $f'(x)$.`
            texteCorr = `La fonction $f$ est dérivable sur $\\mathbb{R}$ comme composée de fonctions dérivables sur $\\mathbb{R}$.<br>
            $f$ est de la forme $\\mathrm{e}^u$ avec $u(x)=${poly}$, donc sa fonction dérivée est donnée par $f'=u'\\mathrm{e}^u$.<br><br>
            Pour tout $x$ de $\\mathbb{R}$, `
            texteCorr += `${derivee.isMon() ? `$f'(x)=${miseEnEvidence(`${derivee}\\mathrm{e}^{${poly}}`)}$` : `$f'(x)=${miseEnEvidence(`(${derivee})\\mathrm{e}^{${poly}}`)}$`}.`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminales,
              { texteAvant: "<br>$f'(x)=$" },
            )
            value = `${`${derivee}e^{${poly}}`}`
          }
          handleAnswers(this, i, { reponse: { value } })
          break

        case 4: // (ax+b)e^x ou (ax^2+bx+c)e^x
          switch (randint(1, 2)) {
            case 1:
              {
                const listeab = [
                  [randint(-10, 10, 0), 0],
                  [randint(-29, 29, 0) / 10, 0],
                  [randint(-10, 10, 0), randint(-10, 10, 0)],
                ] // a puis b
                const ab = choice(listeab)
                const poly = new Polynome({
                  rand: true,
                  coeffs: [ab[1], ab[0]],
                }) // ax+b

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
              &= ${miseEnEvidence(`${ab[0] + ab[1] === 0 ? `${ab[0]}\\mathrm{e}^x` : `\\mathrm{e}^x(${reduireAxPlusB(ab[0], ab[0] + ab[1])})`}`)}.
              \\end{aligned}$`

                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierFonctionsTerminales,
                  { texteAvant: "<br>$f'(x)=$" },
                )
                value = `${`(${reduireAxPlusB(ab[0], ab[0] + ab[1])})e^x`}`
                handleAnswers(this, i, {
                  reponse: { value, options: { factorisation: true } },
                })
              }
              break

            case 2:
            default:
              {
                const listeabc = [
                  [randint(-10, 10, 0), 0, 0],
                  [randint(-2, 2, 0), randint(-2, 2, 0), 0],
                  [randint(-2, 2, 0), 0, randint(-2, 2, 0)],
                  [randint(-2, 2, 0), randint(-5, 5, 0), randint(-2, 2, 0)],
                  [randint(-30, 30, [-20, -10, 0, 10, 20]) / 10, 0, 0],
                ] // a puis b
                const abc = choice(listeabc)
                const poly = new Polynome({
                  rand: true,
                  coeffs: [abc[2], abc[1], abc[0]],
                })
                const derivee = poly.derivee()
                const polyF = new Polynome({
                  rand: true,
                  coeffs: [abc[2] + abc[1], 2 * abc[0] + abc[1], abc[0]],
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
              f'(x)&=\\underbrace{${derivee.isMon() ? `${derivee}` : `(${derivee})`}}_{u'(x)}\\times \\underbrace{\\mathrm{e}^x}_{v(x)}+\\underbrace{(${poly})}_{u(x)}\\times \\underbrace{\\mathrm{e}^x}_{v'(x)}\\\\${
                derivee.isMon()
                  ? `
           &=${miseEnEvidence(`\\mathrm{e}^x(${polyF})`)}.`
                  : `
           &=\\mathrm{e}^x(${derivee}+(${poly}))\\\\
              &=${miseEnEvidence(`\\mathrm{e}^x(${polyF})`)}.`
              }
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
          }
          break

        case 5: // (ax+b)e^mx
          {
            const listeab = [
              [randint(-10, 10, [0, 1]), 0],
              [randint(-29, 29, 0) / 10, 0],
              [randint(-10, 10, 0), randint(-10, 10, 0)],
            ] // a puis b
            const ab = choice(listeab)
            const poly = new Polynome({ rand: true, coeffs: [ab[1], ab[0]] }) // b+ax
            const derivee = poly.derivee()
            const m = randint(-10, 10, [0, 1])
            const polyF = new Polynome({
              rand: true,
              coeffs: [ab[0] + m * ab[1], m * ab[0]],
            })
            texteCorr = `La fonction $f$ est dérivable sur $\\mathbb{R}$ comme produit de fonctions dérivables sur $\\mathbb{R}$.<br>
            $f$ est de la forme $u\\times v$ avec $u(x)=${poly}$ et $v(x)=\\mathrm{e}^{${rienSi1(m)}x}$, donc sa fonction dérivée est donnée par 
            $f'=u'\\times v+ u\\times v'$.<br><br>
            Pour tout $x$ de $\\mathbb{R}$, <br>`

            texte =
              texteIntro +
              ` $f(x)=${poly.isMon() ? `${poly}\\mathrm{e}^{${rienSi1(m)}x}` : `(${poly})\\mathrm{e}^{${rienSi1(m)}x}`}$.<br>
            Calculer $f'(x)$ et écrire son expression sous forme factorisée.`
            texteCorr += `
              $\\begin{aligned}
              f'(x)&=\\underbrace{${derivee}}_{u'(x)}\\times \\underbrace{\\mathrm{e}^{${rienSi1(m)}x}}_{v(x)}+\\underbrace{(${poly})}_{u(x)}\\times \\underbrace{${ecritureParentheseSiMoins(m)}\\mathrm{e}^{${rienSi1(m)}x}}_{v'(x)}\\\\${
                poly.isMon()
                  ? `
              &=${derivee}\\mathrm{e}^{${rienSi1(m)}x}${ecritureAlgebriqueSauf1(ab[0] * m)}x\\mathrm{e}^{${rienSi1(m)}x}\\\\`
                  : `
              &=\\mathrm{e}^{${rienSi1(m)}x}(${derivee}+${m}(${poly}))\\\\`
              }
              &= ${miseEnEvidence(`\\mathrm{e}^{${rienSi1(m)}x}(${polyF})`)}.
              \\end{aligned}$`

            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminales,
              { texteAvant: "<br>$f'(x)=$" },
            )
            value = `${`(${polyF})e^{${m}x}`}`
            handleAnswers(this, i, {
              reponse: { value, options: { factorisation: true } },
            })
          }
          break

        case 6: // (m*e^x)/(ax+b)ou (m*e^x)/(ax^2+b)
          switch (randint(1, 2)) {
            case 1:
              {
                const listeab = [
                  [randint(1, 3), 0],
                  [randint(1, 10), randint(-4, 4, 0)],
                ] // a puis b
                let ab = choice(listeab)
                let m = randint(1, 5)
                do {
                  ab = choice(listeab)
                  m = randint(1, 7)
                } while (pgcd(m, ab[0]) !== 1)
                const poly = new Polynome({
                  rand: true,
                  coeffs: [ab[1], ab[0]],
                }) // b+ax
                const polyNum = poly.multiply(m).add(-m * ab[0])
                const vi = new FractionEtendue(-ab[1], ab[0]).simplifie()
                texteCorr = `La fonction $f$ est dérivable sur $\\mathbb{R}$ comme quotient de fonctions dérivables sur $\\mathbb{R}\\smallsetminus\\left\\{${vi.texFraction}\\right\\}$ dont le dénominateur ne s'annule pas sur $\\mathbb{R}\\smallsetminus\\left\\{${vi.texFraction}\\right\\}$.<br>
            $f$ est de la forme $\\dfrac{u}{v}$ avec $u(x)=${rienSi1(m)}\\mathrm{e}^{x}$ et $v(x)=${poly}$, donc sa fonction dérivée est donnée par 
            $f'=\\dfrac{u'\\times v- u\\times v'}{v^2}$.<br><br>
            Pour tout $x$ de $\\mathbb{R}\\smallsetminus\\left\\{${vi.texFraction}\\right\\}$, <br>`
                texte = ` On considère la fonction $f$ définie sur $\\mathbb{R}\\smallsetminus\\left\\{${vi.texFraction}\\right\\}$ par : 
            $f(x)=\\dfrac{${rienSi1(m)}\\mathrm{e}^{x}}{${poly}}$.<br>
            Calculer $f'(x)$.`
                texteCorr += ` 
              $\\begin{aligned}
              f'(x)&=\\dfrac{\\overbrace{${rienSi1(m)}\\mathrm{e}^{x}}^{u'(x)}\\times \\overbrace{${poly.isMon() ? `${poly}` : `(${poly})`}}^{v(x)}-\\overbrace{${rienSi1(m)}\\mathrm{e}^{x}}^{u(x)}\\times \\overbrace{${ecritureParentheseSiNegatif(ab[0])}}^{v'(x)}}{\\underbrace{(${poly})^2}_{(v(x))^2}}\\\\
         &=\\dfrac{  ${poly.multiply(m)}\\mathrm{e}^{x}- ${m * ab[0]}\\mathrm{e}^{x}}{(${poly})^2} \\\\
        &=${miseEnEvidence(`\\dfrac{${polyNum.isMon() ? ` ${polyNum}` : `(${polyNum})`}\\mathrm{e}^{x}}{${ab[0] === 1 && ab[1] === 0 ? `${poly}^2` : `(${poly})^2`}}`)}.
              \\end{aligned}$`

                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierFonctionsTerminales,
                  { texteAvant: "<br>$f'(x)=$" },
                )
                value = `${`\\dfrac{(${polyNum})e^{x}}{(${poly})^2}`}`
                handleAnswers(this, i, {
                  reponse: { value, options: { fonction: true } },
                })
              }
              break
            case 2:
            default:
              {
                const listeabc = [
                  [randint(1, 10, 0), 0, 0],
                  [randint(1, 10, 0), 0, randint(1, 10)],
                ]
                let abc = choice(listeabc)
                let m = randint(1, 7)

                do {
                  abc = choice(listeabc)
                  m = randint(1, 7)
                } while (pgcd(m, abc[0]) !== 1)
                const poly = new Polynome({
                  rand: true,
                  coeffs: [abc[2], abc[1], abc[0]],
                }) // c+bx+ax^2
                const derivee = poly.derivee()
                const polyF = new Polynome({
                  rand: true,
                  coeffs: [abc[2] * m, -2 * abc[0] * m, m * abc[0]],
                })
                texteCorr = `La fonction $f$ est dérivable sur $${abc[2] !== 0 ? '\\mathbb{R}' : '\\mathbb{R}^*'}$ comme quotient de fonctions dérivables sur ${abc[2] !== 0 ? '$\\mathbb{R}$' : "$\\mathbb{R}^*$ dont le dénominateur ne s'annule pas sur $\\mathbb{R}^*$"}.<br>
            $f$ est de la forme $\\dfrac{u}{v}$ avec $u(x)=${rienSi1(m)}\\mathrm{e}^{x}$ et $v(x)=${poly}$, donc sa fonction dérivée est donnée par 
            $f'=\\dfrac{u'\\times v- u\\times v'}{v^2}$.<br><br>
            Pour tout $x$ de $\\mathbb{R}$, <br>`
                texte = `
               On considère la fonction $f$ définie sur $\\mathbb{R}$ par : 
            $f(x)=\\dfrac{${rienSi1(m)}\\mathrm{e}^{x}}{${poly}}$.<br>
            Calculer $f'(x)$.`
                texteCorr += ` 
              $\\begin{aligned}
              f'(x)&=\\dfrac{\\overbrace{${rienSi1(m)}\\mathrm{e}^{x}}^{u'(x)}\\times \\overbrace{${poly.isMon() ? `${poly}` : `(${poly})`}}^{v(x)}-\\overbrace{${rienSi1(m)}\\mathrm{e}^{x}}^{u(x)}\\times \\overbrace{${derivee}}^{v'(x)}}{\\underbrace{(${poly})^2}_{(v(x))^2}}\\\\
        &=${miseEnEvidence(`\\dfrac{${polyF.isMon() ? ` ${polyF}` : `(${polyF})`}\\mathrm{e}^{x}}{(${poly})^2}`)}.
              \\end{aligned}$`

                texte += ajouteChampTexteMathLive(
                  this,
                  i,
                  KeyboardType.clavierFonctionsTerminales,
                  { texteAvant: "<br>$f'(x)=$" },
                )
                value = `${`\\dfrac{(${polyF})e^{x}}{(${poly})^2}`}`
                handleAnswers(this, i, {
                  reponse: { value, options: { fonction: true } },
                })
              }
              break
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
