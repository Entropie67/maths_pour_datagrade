import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceVraiFaux from '../ExerciceVraiFaux'

export const uuid = 'd4595'
export const refs = {
  'fr-fr': ['TSA8-10', 'TCA6-10'],
  'fr-ch': [],
}

export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Connaître le cours sur le calcul intégral'
export const dateDePublication = '4/4/2025'

/*
 * @author Stéphane Guyon
 */
export default class VraiFauxIntegrales extends ExerciceVraiFaux {
  constructor() {
    super()
    this.nbQuestions = 4
  }

  nouvelleVersion() {
    const a = randint(-5, 5)
    const b = randint(a + 1, a + 5)
    const c = randint(1, 8)
    const m = randint(-5, 5)
    const M = randint(m + 1, m + 5, [0, 1])
    this.affirmations = [
      {
        texte: `Pour toute fonction $f$ continue sur $[${a}, ${b}]$, $\\displaystyle\\int_{${a}}^{${b}} f(x) \\,\\mathrm{d}t = -\\displaystyle\\int_{${b}}^{${a}} f(x) \\,\\mathrm{d}t$.`,
        statut: true,
        correction:
          "C'est une propriété de l'intégrale liée à l'orientation de l'intervalle.", // 1
      },
      {
        texte: `Si $\\displaystyle\\int_{${a}}^{${b}} f(x)\\,\\mathrm{d}t \\leqslant 0$ alors pour tout $x\\in[${a};${b}], f(x)\\leqslant 0$.`,
        statut: false,
        correction: `Si pour tout $x\\in[${a};${b}], f(x)\\leqslant 0$ alors $\\displaystyle\\int_{${a}}^{${b}} f(x)\\,\\mathrm{d}t \\leqslant 0$ mais la réciproque est fausse en général.<br>En effet, soit $f$ la fonction affine définie sur définie sur $[${a};${b}]$ par telle que $f(${a})=-2$ et $f(${b})=1$.<br>
           On peut facilement montrer que $\\displaystyle\\int_{${a}}^{${b}} f(x)\\,\\mathrm{d}t<0$ mais $f$ n'est pas négative sur $[${a};${b}]$`,
      },
      {
        texte: `La valeur moyenne d'une fonction $f$ continue sur $[${a}, ${b}]$ est donnée par $\\dfrac{1}{${b}-${ecritureParentheseSiNegatif(a)}}\\displaystyle\\int_{${a}}^{${b}} f(x) \\,\\mathrm{d}t$.`,
        statut: true,
        correction:
          "C'est la définition de la valeur moyenne d'une fonction sur un intervalle.", // 3
      },
      {
        texte: `Si $F$ est une primitive de $f$ sur $[${a}, ${b}]$, alors $\\displaystyle\\int_{${a}}^{${b}} f(t) \\,\\mathrm{d}t = F(${b}) - F(${a})$.`,
        statut: false,
        correction: `C'est $\\displaystyle\\int_{${a}}^{${b}} f(t) \\,\\mathrm{d}t = F(${b}) - F(${a})$.`,
      },
      {
        texte: `Pour toutes fonctions $f$ et $g$ continues sur $[${a}, ${b}]$, $\\displaystyle\\int_{${a}}^{${b}} (f(x) + g(x)) \\,\\mathrm{d}t = \\displaystyle\\int_{${a}}^{${b}} f(x) \\,\\mathrm{d}t + \\displaystyle\\int_{${a}}^{${b}} g(x) \\,\\mathrm{d}t$.`,
        statut: true,
        correction: "C'est la propriété de la linéarité de l'intégrale.",
      },
      {
        texte: `L'aire entre la courbe d'une fonction $f$ et l'axe des abscisses sur $[${a}, ${b}]$ est donnée par $\\displaystyle\\int_{${a}}^{${b}} f(x) \\,\\mathrm{d}t$.`,
        statut: false,
        correction:
          "Ce n'est vrai que si on vérifie que $f$ est une fonction positive.",
      },
      {
        texte:
          "On peut schématiser l'intégration par parties ainsi : $\\displaystyle\\int u'v=[uv']-\\displaystyle\\int uv$.",
        statut: false,
        correction: "$\\displaystyle\\int u'v=[uv]-\\displaystyle\\int u'v$.", // 7
      },
      {
        texte: `On sait que si une fonction $f$ continue sur $[${a};${b}]$, vérifie sur cet intervalle : $${m}\\leqslant f(x)\\leqslant ${M}$.<br> On peut en déduire que $ ${texNombre(m * (b - a))}\\leqslant\\displaystyle\\int_{${a}}^{${b}} f(x) \\,\\mathrm{d}t\\leqslant ${texNombre(M * (b - a))}$.`,
        statut: true,
        correction: `Si une fonction continue admet un minimum $m$ et un maximum $M$ sur $[${a};${b}]$, alors :<br>
          $m(${b}${ecritureAlgebrique(-a)})\\leqslant\\displaystyle\\int_{${a}}^{${b}} f(x) \\,\\mathrm{d}t\\leqslant M(${b}${ecritureAlgebrique(-a)})$.<br>
          On a $m=${m}$ et $M=${M}$, donc on a bien $ ${texNombre(m * (b - a))}\\leqslant\\displaystyle\\int_{${a}}^{${b}} f(x) \\,\\mathrm{d}t\\leqslant ${texNombre(M * (b - a))}$.`,
      },
      {
        texte:
          'La fonction $F$ définie sur $[0;+\\infty]$ par $F(x)=\\displaystyle\\int_0^x \\mathrm{e}^{t^2} \\,\\mathrm{d}t$ change de sens de variation.',
        statut: false,
        correction:
          "$F'(x)=\\mathrm{e}^{x^2}>0$ donc $F$ est croissante sur $[0;+\\infty]$.",
      },
      {
        texte: `Soit $f$ une fonction continue sur $[${a};${b}]$. <br>
          $\\displaystyle\\int_{${a}}^{${b}} \\big(f(t) + ${texNombre(M)} \\big)\\,\\mathrm{d}t=\\displaystyle\\int_{${a}}^{${b}} f(t) \\,\\mathrm{d}t + ${texNombre(M)} $.`,
        statut: false,
        correction: `$\\begin{aligned}
          \\displaystyle\\int_{${a}}^{${b}} \\big(f(t) + ${texNombre(M)}\\big)\\,\\mathrm{d}t&=\\displaystyle\\int_{${a}}^{${b}} f(t) \\,\\mathrm{d}t + \\displaystyle\\int_{${a}}^{${b}} ${texNombre(M)} \\,\\mathrm{d}t\\\\
          &= \\displaystyle\\int_{${a}}^{${b}} f(t) \\,\\mathrm{d}t + ${texNombre(M)}(${b}${ecritureAlgebrique(-a)})\\\\
          &=\\displaystyle\\int_{${a}}^{${b}} f(t) \\,\\mathrm{d}t + ${texNombre(M * (b - a))}\\end{aligned}$.`,
      },
      {
        texte: `$\\displaystyle\\int_{${a}}^{${b}} ${texNombre(M)} \\,\\mathrm{d}t=${texNombre(M * (b - a) + randint(-2, 2, 0))} $.`,
        statut: false,
        correction: `$\\begin{aligned}
          \\displaystyle\\int_{${a}}^{${b}} ${texNombre(M)} \\,\\mathrm{d}t&=[${texNombre(M)}t]_{${a}}^{${b}}\\\\
          &=${texNombre(M)}\\times ${ecritureParentheseSiNegatif(b)}${ecritureAlgebrique(-M)} \\times ${ecritureParentheseSiNegatif(a)} \\\\
          &=${texNombre(M * b)} ${ecritureAlgebrique(-M * a)}\\\\
          &= ${texNombre(M * (b - a))} .\\end{aligned}$`,
      },
      {
        texte: `La valeur moyenne de la fonction $f$ définie sur $[${a};${b}]$ par $f(x)=2x$ est $${texNombre(b ** 2 - a ** 2)}$.`,
        statut: false,
        correction: `On a :<br>$\\begin{aligned}
          \\displaystyle\\int_{${a}}^{${b}} 2x \\,\\mathrm{d}t&=\\left[ x^2 \\right]_{${a}}^{${b}}\\\\
          &= ${texNombre(b ** 2)} ${ecritureAlgebrique(-1 * a ** 2)}\\\\
            &= ${texNombre(b ** 2 - a ** 2)}.
          \\end{aligned}$<br>
          La valeur moyenne de $f$ sur $[${a};${b}]$ est donnée par $\\dfrac{1}{${b}-${ecritureParentheseSiNegatif(a)}}\\displaystyle\\int_{${a}}^{${b}} 2x \\,\\mathrm{d}t=\\dfrac{1}{${b}${ecritureAlgebrique(-a)}} \\times ${ecritureParentheseSiNegatif(b ** 2 - a ** 2)}= ${texNombre((b ** 2 - a ** 2) / (b - a))}$.`,
      },
      {
        texte:
          '$\\displaystyle\\int_{-\\pi}^{\\pi} \\cos(t) \\,\\mathrm{d}t=0 $.',
        statut: true,
        correction:
          '$\\displaystyle\\int_{-\\pi}^{\\pi} \\cos(t) \\,\\mathrm{d}t= [\\sin(t)]_{-\\pi}^{\\pi}=\\sin(\\pi)-\\sin(-\\pi) =0-0=0$.',
      },
      {
        texte:
          '$\\displaystyle\\int_{-\\frac{\\pi}{2}}^{\\frac{\\pi}{2}} \\sin(t) \\,\\mathrm{d}t=0 $.',
        statut: true,
        correction:
          '$\\displaystyle\\int_{-\\frac{\\pi}{2}}^{\\frac{\\pi}{2}} \\sin(t) \\,\\mathrm{d}t= [-\\cos(t)]_{-\\frac{\\pi}{2}}^{\\frac{\\pi}{2}}=-\\cos(\\frac{\\pi}{2})+\\cos(-\\frac{\\pi}{2}) =0+0=0$.',
      },
      {
        texte:
          '$\\displaystyle\\int_{0}^{\\frac{\\pi}{2}} \\cos(t) \\,\\mathrm{d}t=0 $.',
        statut: false,
        correction:
          '$\\displaystyle\\int_{0}^{\\frac{\\pi}{2}} \\cos(t) \\,\\mathrm{d}t= [\\sin(t)]_{0}^{\\frac{\\pi}{2}}=\\sin(\\frac{\\pi}{2})-\\sin(0) =1-0=1$.',
      },
      {
        texte: `$\\displaystyle\\int_{${-c}}^{${c}} t \\,\\mathrm{d}t=0 $.`,
        statut: true,
        correction: `$\\begin{aligned}
          \\displaystyle\\int_{${-c}}^{${c}} t \\,\\mathrm{d}t&=\\left[\\dfrac{t^2}{2}\\right]_{${-c}}^{${c}}\\\\
          &=\\dfrac{${c}^2}{2}-\\dfrac{(-${c})^2}{2}\\\\
          &=0 \\end{aligned}$.`, // 13
      },
    ]
    super.nouvelleVersion()
  }
}
