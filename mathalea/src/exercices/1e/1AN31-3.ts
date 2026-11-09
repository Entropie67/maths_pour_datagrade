import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf0Sauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Calculer la dérivée d'une fonction avec $\\mathrm{e}^{kx}$"
export const dateDePublication = '05/09/2026'
export const interactifReady = true

/**
 * Calculer la dérivée d'une fonction avec e^(kx)
 * @author Arnaud Meistermann (exo issu de 1AN31-3)
 */

export const dateDeModifImportante = '31/10/2026'
export const uuid = '55b38'

export const refs = {
  'fr-fr': ['1AN31-3'],
  'fr-ch': [''],
}

export default class DeriveeExp1AN313bis extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 : $\\mathrm{e}^{kx}$\n2 : $a\\mathrm{e}^{kx}+bx+c$\n3 : $(ax+b)\\mathrm{e}^{kx}$\n4 : $\\dfrac{m\\mathrm{e}^{kx}}{ax+b}$\n5 : $\\dfrac{ax+b}{\\mathrm{e}^{kx}}$\n6 : $(ax^2+bx+c)\\mathrm{e}^{kx}$\n7 : $\\dfrac{m\\mathrm{e}^{kx}}{ax^2+c}$\n8 : $\\dfrac{ax^2+bx+c}{\\mathrm{e}^{kx}}$\n9 : Mélange',
    ]
    this.sup = '9'
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    const listeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 8,
      melange: 9,
      defaut: 9,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let value = ''
      const texteIntro =
        'On considère la fonction $f$ définie et dérivable sur $\\mathbb{R}$ par '
      switch (listeDeQuestions[i]) {
        case 1: // e^(kx)
          {
            const k = randint(-10, 10, [0, 1])
            texte =
              texteIntro +
              `$f(x)=\\mathrm{e}^{${rienSi1(k)}x}$.<br>
             Calculer $f'(x)$.`
            texteCorr = `Pour tout $x$ de $\\mathbb{R}$, $f'(x)=${miseEnEvidence(`${rienSi1(k)}\\mathrm{e}^{${rienSi1(k)}x}`)}$.`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminales,
              { texteAvant: "<br>$f'(x)=$" },
            )
            value = `${rienSi1(k)}\\mathrm{e}^{${rienSi1(k)}x}`
          }
          handleAnswers(this, i, { reponse: { value } })
          break

        case 2: // ae^(kx)+bx+c
          {
            const a = randint(-10, 10, [0])
            const b = randint(-5, 5, [0])
            const c = randint(-5, 5)
            const k = randint(-10, 10, [0, 1])
            texte =
              texteIntro +
              `$f(x)=${rienSi1(a)}\\mathrm{e}^{${rienSi1(k)}x}${ecritureAlgebriqueSauf0Sauf1(b)}x${ecritureAlgebrique(c)}$.<br>
             Calculer $f'(x)$.`
            texteCorr = `Pour tout $x$ de $\\mathbb{R}$, <br>
            $\\begin{aligned}
            f'(x)&=${a}\\times${ecritureParentheseSiNegatif(k)}\\mathrm{e}^{${rienSi1(k)}x}${ecritureAlgebrique(b)}+0\\\\
            &=${miseEnEvidence(`${rienSi1(a * k)}\\mathrm{e}^{${rienSi1(k)}x}${ecritureAlgebrique(b)}`)}.
            \\end{aligned}$`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminales,
              { texteAvant: "<br>$f'(x)=$" },
            )
            value = `${a * k}\\mathrm{e}^{${rienSi1(k)}x}+${b}`
          }
          handleAnswers(this, i, { reponse: { value } })
          break

        case 3: // (ax+b)e^(kx)
          {
            const a = randint(-5, 5, [0])
            const b = randint(-5, 5, [a, -a])
            const k = randint(-5, 5, [0, 1])
            texteCorr = `On reconnaît que $f$ est de la forme $u\\times v$ avec $u(x)=${reduireAxPlusB(a, b)}$ et $v(x)=\\mathrm{e}^{${rienSi1(k)}x}$.<br>
            On a donc $u'(x)=${a}$ et $v'(x)=${rienSi1(k)}\\mathrm{e}^{${rienSi1(k)}x}$.<br>
            $f'$ est de la forme $u'\\times v+v'\\times u$.<br>
            Par conséquent,<br>`

            texte =
              texteIntro +
              ` $f(x)=${b === 0 ? '' : '('}${reduireAxPlusB(a, b)}${b === 0 ? '' : ')'}\\mathrm{e}^{${rienSi1(k)}x}$.<br>
            Calculer $f'(x)$ et écrire son expression sous forme factorisée.`
            texteCorr += `
                $\\begin{aligned}
              f'(x)&=${a}\\times\\mathrm{e}^{${rienSi1(k)}x}+(${reduireAxPlusB(a, b)})\\times${ecritureParentheseSiNegatif(k)}\\mathrm{e}^{${rienSi1(k)}x}\\\\
                &=${rienSi1(a)}\\mathrm{e}^{${rienSi1(k)}x}+(${reduireAxPlusB(k * a, k * b)})\\mathrm{e}^{${rienSi1(k)}x}\\\\
                &=\\mathrm{e}^{${rienSi1(k)}x}\\left(${a}+(${reduireAxPlusB(k * a, k * b)})\\right)\\\\
                &= ${miseEnEvidence(`\\mathrm{e}^{${rienSi1(k)}x}(${reduireAxPlusB(k * a, a + k * b)})`)}.
                \\end{aligned}$`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminales,
              { texteAvant: "<br>$f'(x)=$" },
            )
            value = `(${reduireAxPlusB(k * a, a + k * b)})\\mathrm{e}^{${rienSi1(k)}x}`
            handleAnswers(this, i, {
              reponse: { value, options: { factorisation: true } },
            })
          }
          break

        case 4: // me^(kx)/(ax+b)
          {
            const a = randint(-10, 10, [0])
            const b = randint(-10, 10)
            const m = randint(1, 5)
            const k = randint(-5, 5, [0, 1])
            const denominateur = reduireAxPlusB(a, b)
            const numerateur = reduireAxPlusB(k * a, k * b - a)
            const valeurInterdite = new FractionEtendue(-b, a).simplifie()
            texte = `On considère la fonction $f$ définie et dérivable sur $\\mathbb{R}\\setminus\\left\\{${valeurInterdite.texFractionSimplifiee}\\right\\}$ par $f(x)=\\dfrac{${rienSi1(m)}\\mathrm{e}^{${rienSi1(k)}x}}{${denominateur}}$.<br>Calculer $f'(x)$.`
            texteCorr = `On reconnaît que $f$ est de la forme $\\dfrac{u}{v}$ avec $u(x)=${rienSi1(m)}\\mathrm{e}^{${rienSi1(k)}x}$ et $v(x)=${denominateur}$.<br>
            On a donc $u'(x)=${rienSi1(m * k)}\\mathrm{e}^{${rienSi1(k)}x}$ et $v'(x)=${a}$.<br>
            $f'$ est de la forme $\\dfrac{u'v-v'u}{v^2}$.<br>
            Par conséquent,<br>
            $\\begin{aligned}
            f'(x)&=\\dfrac{${rienSi1(m * k)}\\mathrm{e}^{${rienSi1(k)}x}(${denominateur})-${ecritureParentheseSiNegatif(a)}\\times${rienSi1(m)}\\mathrm{e}^{${rienSi1(k)}x}}{(${denominateur})^2}\\\\
            &=\\dfrac{${rienSi1(m * k * a)}x\\mathrm{e}^{${rienSi1(k)}x}${b === 0 ? '' : `${ecritureAlgebriqueSauf0Sauf1(m * k * b)}\\mathrm{e}^{${rienSi1(k)}x}`}${ecritureAlgebriqueSauf0Sauf1(-a * m)}\\mathrm{e}^{${rienSi1(k)}x}}{(${denominateur})^2}\\\\
            &= ${miseEnEvidence(`\\dfrac{${rienSi1(m)}\\mathrm{e}^{${rienSi1(k)}x}(${numerateur})}{(${denominateur})^2}`)}.
            \\end{aligned}$`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminales,
              { texteAvant: "<br>$f'(x)=$" },
            )
            value = `\\dfrac{${m}\\mathrm{e}^{${rienSi1(k)}x}(${numerateur})}{(${denominateur})^2}`
            handleAnswers(this, i, {
              reponse: { value, options: { fonction: true } },
            })
          }
          break

        case 5: // (ax+b)/e^(kx)
          {
            const a = randint(-10, 10, [0])
            const b = randint(-10, 10)
            const k = randint(-5, 5, [0, 1])
            const numerateur = reduireAxPlusB(a, b)
            const derivee = reduireAxPlusB(-k * a, a - k * b)
            texte =
              texteIntro +
              `$f(x)=\\dfrac{${numerateur}}{\\mathrm{e}^{${rienSi1(k)}x}}$.<br>Calculer $f'(x)$.`
            texteCorr = `On reconnaît que $f$ est de la forme $\\dfrac{u}{v}$ avec $u(x)=${numerateur}$ et $v(x)=\\mathrm{e}^{${rienSi1(k)}x}$.<br>
            On a donc $u'(x)=${a}$ et $v'(x)=${rienSi1(k)}\\mathrm{e}^{${rienSi1(k)}x}$.<br>
            $f'$ est de la forme $\\dfrac{u'v-v'u}{v^2}$.<br>
            Par conséquent,<br>
            $\\begin{aligned}
            f'(x)&=\\dfrac{${a}\\mathrm{e}^{${rienSi1(k)}x}-${k < 0 ? `(${rienSi1(k)}\\mathrm{e}^{${rienSi1(k)}x})` : `${rienSi1(k)}\\mathrm{e}^{${rienSi1(k)}x}`}(${numerateur})}{(\\mathrm{e}^{${rienSi1(k)}x})^2}\\\\
            &=\\dfrac{${a}\\mathrm{e}^{${rienSi1(k)}x}${ecritureAlgebriqueSauf0Sauf1(-k * a)}x\\mathrm{e}^{${rienSi1(k)}x}${b === 0 ? '' : `${ecritureAlgebriqueSauf0Sauf1(-k * b)}\\mathrm{e}^{${rienSi1(k)}x}`}}{(\\mathrm{e}^{${rienSi1(k)}x})^2}\\\\
            &=\\dfrac{\\mathrm{e}^{${rienSi1(k)}x}(${derivee})}{(\\mathrm{e}^{${rienSi1(k)}x})^2}\\\\
            &= ${miseEnEvidence(`\\dfrac{${derivee}}{\\mathrm{e}^{${rienSi1(k)}x}}`)}.
            \\end{aligned}$`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminales,
              { texteAvant: "<br>$f'(x)=$" },
            )
            value = `\\dfrac{${derivee}}{\\mathrm{e}^{${rienSi1(k)}x}}`
            handleAnswers(this, i, {
              reponse: { value, options: { fonction: true } },
            })
          }
          break

        case 6: // (ax^2+bx+c)e^(kx)
          {
            const a = randint(-10, 10, [0])
            const b = randint(-10, 10)
            const c = randint(-10, 10)
            const k = randint(-5, 5, [0, 1])
            const polynome = reduirePolynomeDegre3(0, a, b, c)
            const derivee = reduirePolynomeDegre3(
              0,
              k * a,
              2 * a + k * b,
              b + k * c,
            )
            texte =
              texteIntro +
              `$f(x)=(${polynome})\\mathrm{e}^{${rienSi1(k)}x}$.<br>Calculer $f'(x)$ et écrire son expression sous forme factorisée.`
            texteCorr = `On reconnaît que $f$ est de la forme $u\\times v$ avec $u(x)=${polynome}$ et $v(x)=\\mathrm{e}^{${rienSi1(k)}x}$.<br>
            On a donc $u'(x)=${reduireAxPlusB(2 * a, b)}$ et $v'(x)=${rienSi1(k)}\\mathrm{e}^{${rienSi1(k)}x}$.<br>
            $f'$ est de la forme $u'\\times v+v'\\times u$.<br>
            Par conséquent,<br>
            $\\begin{aligned}
            f'(x)&=(${reduireAxPlusB(2 * a, b)})\\mathrm{e}^{${rienSi1(k)}x}+(${polynome})\\times${ecritureParentheseSiNegatif(k)}\\mathrm{e}^{${rienSi1(k)}x}\\\\
            &=${2 * a}x\\mathrm{e}^{${rienSi1(k)}x}${ecritureAlgebriqueSauf0Sauf1(b)}\\mathrm{e}^{${rienSi1(k)}x}${ecritureAlgebriqueSauf0Sauf1(k * a)}x^2\\mathrm{e}^{${rienSi1(k)}x}${ecritureAlgebriqueSauf0Sauf1(k * b)}x\\mathrm{e}^{${rienSi1(k)}x}${ecritureAlgebriqueSauf0Sauf1(k * c)}\\mathrm{e}^{${rienSi1(k)}x}\\\\
            &=${rienSi1(k * a)}x^2\\mathrm{e}^{${rienSi1(k)}x}${ecritureAlgebriqueSauf0Sauf1(2 * a + k * b)}x\\mathrm{e}^{${rienSi1(k)}x}${ecritureAlgebriqueSauf0Sauf1(b + k * c)}\\mathrm{e}^{${rienSi1(k)}x}\\\\
            &=${miseEnEvidence(`\\mathrm{e}^{${rienSi1(k)}x}(${derivee})`)}.
            \\end{aligned}$`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminales,
              { texteAvant: "<br>$f'(x)=$" },
            )
            value = `(${derivee})\\mathrm{e}^{${rienSi1(k)}x}`
            handleAnswers(this, i, {
              reponse: { value, options: { factorisation: true } },
            })
          }
          break

        case 7: // me^(kx)/(ax^2+c)
          {
            const a = randint(1, 5)
            const c = randint(2, 6)
            const m = randint(1, 7)
            const k = randint(-5, 5, [0, 1])
            const polynome = reduirePolynomeDegre3(0, a, 0, c)
            const derivee = reduirePolynomeDegre3(0, k * a, -2 * a, k * c)
            texte =
              texteIntro +
              `$f(x)=\\dfrac{${rienSi1(m)}\\mathrm{e}^{${rienSi1(k)}x}}{${polynome}}$.<br>Calculer $f'(x)$.`
            texteCorr = `On reconnaît que $f$ est de la forme $\\dfrac{u}{v}$ avec $u(x)=${rienSi1(m)}\\mathrm{e}^{${rienSi1(k)}x}$ et $v(x)=${polynome}$.<br>
            On a donc $u'(x)=${rienSi1(m * k)}\\mathrm{e}^{${rienSi1(k)}x}$ et $v'(x)=${2 * a}x$.<br>
            $f'$ est de la forme $\\dfrac{u'v-v'u}{v^2}$.<br>
            Par conséquent,<br>
            $\\begin{aligned}
            f'(x)&=\\dfrac{${m * k < 0 ? `(${rienSi1(m * k)}\\mathrm{e}^{${rienSi1(k)}x})` : `${rienSi1(m * k)}\\mathrm{e}^{${rienSi1(k)}x}`}(${polynome})-${2 * a}x\\times(${rienSi1(m)}\\mathrm{e}^{${rienSi1(k)}x})}{(${polynome})^2}\\\\
            &=\\dfrac{${rienSi1(m * k * a)}x^2\\mathrm{e}^{${rienSi1(k)}x}${ecritureAlgebriqueSauf0Sauf1(m * k * c)}\\mathrm{e}^{${rienSi1(k)}x}${ecritureAlgebriqueSauf0Sauf1(-2 * a * m)}x\\mathrm{e}^{${rienSi1(k)}x}}{(${polynome})^2}\\\\
            &=${miseEnEvidence(`\\dfrac{${rienSi1(m)}\\mathrm{e}^{${rienSi1(k)}x}(${derivee})}{(${polynome})^2}`)}.
            \\end{aligned}$`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminales,
              { texteAvant: "<br>$f'(x)=$" },
            )
            value = `\\dfrac{${m}\\mathrm{e}^{${rienSi1(k)}x}(${derivee})}{(${polynome})^2}`
            handleAnswers(this, i, {
              reponse: { value, options: { fonction: true } },
            })
          }
          break

        case 8: // (ax^2+bx+c)/e^(kx)
        default:
          {
            const a = randint(-10, 10, [0])
            const b = randint(-10, 10)
            const c = randint(-10, 10)
            const k = randint(-5, 5, [0, 1])
            const polynome = reduirePolynomeDegre3(0, a, b, c)
            const derivee = reduirePolynomeDegre3(
              0,
              -k * a,
              2 * a - k * b,
              b - k * c,
            )
            texte =
              texteIntro +
              `$f(x)=\\dfrac{${polynome}}{\\mathrm{e}^{${rienSi1(k)}x}}$.<br>Calculer $f'(x)$.`
            texteCorr = `On reconnaît que $f$ est de la forme $\\dfrac{u}{v}$ avec $u(x)=${polynome}$ et $v(x)=\\mathrm{e}^{${rienSi1(k)}x}$.<br>
            On a donc $u'(x)=${reduireAxPlusB(2 * a, b)}$ et $v'(x)=${rienSi1(k)}\\mathrm{e}^{${rienSi1(k)}x}$.<br>
            $f'$ est de la forme $\\dfrac{u'v-v'u}{v^2}$.<br>
            Par conséquent,<br>
            $\\begin{aligned}
            f'(x)&=\\dfrac{(${reduireAxPlusB(2 * a, b)})\\mathrm{e}^{${rienSi1(k)}x}-${k < 0 ? `(${rienSi1(k)}\\mathrm{e}^{${rienSi1(k)}x})` : `${rienSi1(k)}\\mathrm{e}^{${rienSi1(k)}x}`}(${polynome})}{(\\mathrm{e}^{${rienSi1(k)}x})^2}\\\\
            &=\\dfrac{${rienSi1(2 * a)}x\\mathrm{e}^{${rienSi1(k)}x}${ecritureAlgebriqueSauf0Sauf1(b)}\\mathrm{e}^{${rienSi1(k)}x}${ecritureAlgebriqueSauf0Sauf1(-k * a)}x^2\\mathrm{e}^{${rienSi1(k)}x}${ecritureAlgebriqueSauf0Sauf1(-k * b)}x\\mathrm{e}^{${rienSi1(k)}x}${ecritureAlgebriqueSauf0Sauf1(-k * c)}\\mathrm{e}^{${rienSi1(k)}x}}{(\\mathrm{e}^{${rienSi1(k)}x})^2}\\\\
            &=\\dfrac{\\mathrm{e}^{${rienSi1(k)}x}(${derivee})}{(\\mathrm{e}^{${rienSi1(k)}x})^2}\\\\
            &=${miseEnEvidence(`\\dfrac{${derivee}}{\\mathrm{e}^{${rienSi1(k)}x}}`)}.
            \\end{aligned}$`
            texte += ajouteChampTexteMathLive(
              this,
              i,
              KeyboardType.clavierFonctionsTerminales,
              { texteAvant: "<br>$f'(x)=$" },
            )
            value = `\\dfrac{${derivee}}{\\mathrm{e}^{${rienSi1(k)}x}}`
            handleAnswers(this, i, {
              reponse: { value, options: { fonction: true } },
            })
          }
          break
      }
      texteCorr =
        `Rappel  : pour tout réel $k$ constant et tout $x\\in\\mathbb{R}$,  $\\left(\\mathrm{e}^{kx}\\right)'=k \\mathrm{e}^{kx}$.<br>` +
        texteCorr
      if (this.questionJamaisPosee(i, value)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
