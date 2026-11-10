import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
  rienSi1,
} from '../../lib/outils/ecritures'
import { factorisation } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import {
  carreParfait,
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Trinome from '../../modules/Trinome'
import Exercice from '../Exercice'
export const titre = "Étudier le sens de variation d'une fonction rationnelle"
export const dateDePublication = '05/05/2025'
export const interactifReady = false
export const uuid = 'b0576'
export const refs = {
  'fr-fr': ['1AN20-5', 'TSA3-15', 'TCA7-15'],
  'fr-ch': [],
}

/**
 * Étudier le sens de variation d'une fonction polynôme du troisième degré'
 * @author Gilles Mora avec l'aide précieuse de Jean-claude Lhote
 */

function rationnelleDegre2(
  simple = false,
  choix = true,
  deltaPositif = true,
): { a: number; b: number; c: number; d: number; e: number } {
  const elements = [
    { nb: 12, decomp: [2, 2, 3] },
    { nb: 18, decomp: [2, 3, 3] },
    { nb: 20, decomp: [2, 2, 5] },
    { nb: 28, decomp: [2, 2, 7] },
    { nb: 30, decomp: [2, 3, 5] },
    { nb: 42, decomp: [2, 3, 7] },
    { nb: 45, decomp: [3, 3, 5] },
  ]
  const elementsSimple = [
    { nb: 4, decomp: [2, 2] },
    { nb: 6, decomp: [2, 3] },
    { nb: 9, decomp: [3, 3] },
    { nb: 10, decomp: [2, 5] },
    { nb: 14, decomp: [2, 7] },
    { nb: 15, decomp: [3, 5] },
  ]
  let a: number
  let b: number
  let c: number
  let d: number
  let e: number
  let deltaIsOk: boolean
  let tropGrand = false
  do {
    const signe1 = choice([-1, 1])
    const signe2 = choice([-1, 1])
    const signe3 = choice([-1, 1])
    const signe4 = signe1 * signe2 * signe3
    const el = choice(simple ? elementsSimple : elements)
    const nombre = el.nb
    let facteurs = el.decomp
    facteurs = shuffle(facteurs)
    let n1: number
    let n2: number
    let n3: number
    let n4: number
    n1 = Number(facteurs.pop())
    n2 = nombre / n1
    if (deltaPositif) {
      if (choix) {
        // 1er choix (true) : be=cd
        if (simple) {
          n3 = 1
          n4 = nombre
        } else {
          n3 = choice(facteurs, [n1])
          n4 = nombre / n3
        }
        n1 *= signe1
        n2 *= signe2
        n3 *= signe3
        n4 *= signe4
        const [couple1, couple2] = shuffle([
          shuffle([n1, n2]),
          shuffle([n3, n4]),
        ])
        ;[b, e] = couple1
        ;[c, d] = couple2
        a = randint(1, 5) * choice([-1, 1])
      } else {
        // 2e choix (false) ae = bd avec ac carré parfait
        if (simple) {
          // on n'a pas le choix, n1 et n2 sont les deux facteurs n1*n2 peut être un carré
          n3 = 1
          n4 = nombre
          if (carreParfait(nombre)) {
            // ça veut dire n1=n2 !
            if (choice([true, false])) {
              // bd=n3*n4
              ;[b, d] = shuffle([n3 * signe3, n4 * signe4])
              a = n1 * signe1
              e = n2 * signe2
              c = n1 * signe1 * choice([1, 4, 9])
            } else {
              // bd = n1*n2 ce qui veut dire que a sera ou 1 ou nombre qui sont des carrés à signe3 près
              ;[b, d] = shuffle([n1 * signe1, n2 * signe2])
              ;[a, e] = shuffle([n3 * signe3, n4 * signe4])
              c =
                (a > 1 ? choice([1, 4]) : choice([1, 4, 9, 16])) *
                (a > 0 ? 1 : -1)
            }
          } else {
            // nombre n'est pas un carré parfait
            if (choice([true, false])) {
              // bd=n3*n4 soit 1*nombre n1 et n2 sont les deux facteurs premiers différents
              const avecUn = choice([true, false])
              if (avecUn) {
                n3 = 1
                n4 = nombre
              } else {
                n3 = choice(facteurs, [n1])
                n4 = nombre / n3
              }
              ;[b, d] = shuffle([n3 * signe3, n4 * signe4])
              ;[a, e] = shuffle([n1 * signe1, n2 * signe2])
              c = signe1 * Math.abs(a) * choice([1, 4, 9])
            } else {
              // bd = n1*n2 ce qui veut dire que a sera ou 1 ou nombre qui n'est pas un carré
              ;[b, d] = shuffle([n1 * signe1, n2 * signe2])
              ;[a, e] = shuffle([n3 * signe3, n4 * signe4])
              c =
                (a !== 1
                  ? choice([1, 4]) * Math.abs(a)
                  : choice([1, 4, 9, 16])) * (a > 0 ? 1 : -1) // a*c doit être un carré donc positif
            }
          }
        } else {
          // ici la décomposition a plus de deux facteurs
          const avecUn = choice([true, false])
          const el = choice(elements)
          const nombre = el.nb
          let facteurs = el.decomp
          facteurs = shuffle(facteurs)
          n1 = Number(facteurs.pop())
          n2 = nombre / n1
          if (avecUn) {
            n3 = 1
            n4 = nombre
          } else {
            n3 = choice(facteurs, [n1])
            n4 = nombre / n3
          }
          n1 *= signe1
          n2 *= signe2
          n3 *= signe3
          n4 *= signe4
          const [couple1, couple2] = shuffle([
            shuffle([n1, n2]),
            shuffle([n3, n4]),
          ])
          ;[b, d] = couple1
          ;[a, e] = couple2
          if (Math.abs(a) === 1) {
            c = choice([1, 4, 9, 16]) * (a > 0 ? 1 : -1) // a=1 ou -1 donc on choisit un carré avec le signe de a devant
          } else {
            // a différent de 1 ou -1
            // On doit extraire le plus grand carré de Math.abs(a)
            const decompo = factorisation(Math.abs(a)).filter(
              (el) => el[1] % 2 !== 0,
            ) // on ne conserve que les facteurs avec un exposant impair
            const facteurComp = decompo
              .map((el) => el[0])
              .reduce((acc, el) => acc * el, 1) // on multiplie les facteurs
            c = (a > 0 ? 1 : -1) * facteurComp
          }
        }
      }
    } else {
      const signe5 = choice([-1, 1])
      a = randint(1, 4) * signe1
      b = randint(1, 10) * signe2
      c = randint(1, 12) * signe3
      d = randint(2, 6) * signe4
      e = randint(1, 10) * signe5
    }

    const deltaSur4 = a * a * e * e - d * a * (b * e - d * c)
    deltaIsOk = deltaPositif ? deltaSur4 > 0 : deltaSur4 <= 0
    tropGrand =
      Math.max(...[d * a, b * e - d * c, 2 * a * e].map(Math.abs)) > 100
  } while (!deltaIsOk || tropGrand)
  return { a, b, c, d, e }
}

export default class EtudeFctRatio extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.besoinFormulaireTexte = [
      'Choix des questions',
      '\n1 : Fonction (ax+b)/(cx+d)\n2 : Fonction a/(cx+d)\n3 : Fonction a/(bx^2+c) sur R\n4: Fonction (ax^2+bx+c)/(dx+e)\n5: Mélange',
    ]
    this.sup = '1'
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    const listeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 5,
      nbQuestions: this.nbQuestions,
    })
    for (
      let i = 0, ligne1, ligne2, ligne3, ligneVar, cpt = 0;
      i < this.nbQuestions && cpt < 50;
    ) {
      let texte = ''
      let texteCorr = ''
      switch (listeDeQuestions[i]) {
        case 1: //
          {
            let a = randint(-5, 8, 0)
            let b = randint(-5, 10, 0)
            let c = randint(-2, 6, 0)
            let d = randint(-5, 5, 0) * c
            const lignePP = ['Line', 30, '', 0, '+', 20, 't', 5, '+', 20]
            const lignePPz = ['Line', 30, '', 0, '+', 20, 'z', 5, '+', 20]
            const ligneMM = ['Line', 30, '', 0, '-', 20, 't', 5, '-', 20]
            const ligneMMd = ['Line', 30, '', 0, '-', 20, 'd', 5, '-', 20]
            const lignePPd = ['Line', 30, '', 0, '+', 20, 'd', 5, '+', 20]
            do {
              a = randint(-5, 8, 0)
              b = randint(-5, 10)
              c = randint(-3, 3, 0)
              d = randint(-5, 5, 0) * c
            } while (a * d - b * c === 0)
            if (a * d - b * c > 0) {
              ligne1 = lignePP
              ligne2 = lignePPz
              ligne3 = lignePPd
              ligneVar = ['Var', 10, '-/', 20, '+D-/ /', 20, '+/', 10]
            } else {
              // Sinon, la deuxième ligne change de signe en premier
              ligne1 = ligneMM
              ligne2 = lignePPz
              ligne3 = ligneMMd
              ligneVar = ['Var', 10, '+/', 20, '-D+/ /', 20, '-/', 10]
            }

            texte = `On considère la fonction $f$ définie sur $\\mathbb{R}\\smallsetminus\\{${texNombre(-d / c, 0)}\\}$ par : $f(x)=\\dfrac{${reduireAxPlusB(a, b)}}{${reduireAxPlusB(c, d)}}$.<br>
      Étudier le sens de variation de la fonction $f$ sur son ensemble de définition.<br>`
            texteCorr +=
              `$f$ est le quotient de deux fonctions dérivables sur $\\mathbb{R}\\smallsetminus\\{${texNombre(-d / c, 0)}\\}$ dont le dénominateur ne s'annule pas sur $\\mathbb{R}\\smallsetminus\\{${texNombre(-d / c, 0)}\\}$.<br>
            On en déduit que $f$ est dérivable sur $\\mathbb{R}\\smallsetminus\\{${texNombre(-d / c, 0)}\\}$.<br>
            Pour tout $x\\in\\mathbb{R}\\smallsetminus\\{${texNombre(-d / c, 0)}\\}$, <br>
            $\\begin{aligned}
            f'(x)&=\\dfrac{${a}\\times(${reduireAxPlusB(c, d)})-(${reduireAxPlusB(a, b)})\\times${ecritureParentheseSiNegatif(c)}}{(${reduireAxPlusB(c, d)})^2}\\\\
            &=\\dfrac{${rienSi1(a * c)}x${ecritureAlgebrique(a * d)}${ecritureAlgebriqueSauf1(-a * c)}x${b === 0 ? '' : `${ecritureAlgebrique(-c * b)}`}}{(${reduireAxPlusB(c, d)})^2}\\\\
            &=\\dfrac{${a * d - c * b}}{(${reduireAxPlusB(c, d)})^2}
            \\end{aligned}$<br>
            On en déduit le tableau de variations suivant : <br><br> ` +
              tableauDeVariation({
                tabInit: [
                  [
                    ['$x$', 1.5, 20],
                    [`$${a * d - c * b}$`, 2, 25],
                    [`$(${reduireAxPlusB(c, d)})^2$`, 2, 25],
                    ["$f'(x)$", 2, 25],
                    ['$f(x)$', 4, 200],
                  ],
                  [
                    '$-\\infty$',
                    30,
                    `$${texNombre(-d / c, 0)}$`,
                    20,
                    '$+\\infty$',
                    30,
                  ],
                ],
                tabLines: [ligne1, ligne2, ligne3, ligneVar],
                espcl: 6,
                deltacl: 0.8,
                lgt: 6,
                scale: context.isHtml ? 1 : 0.4,
              })
          }

          break

        case 2: //
          {
            const a = randint(-10, 10, 0)
            const c = randint(-2, 6, 0)
            const d = randint(-5, 5, 0) * c
            const lignePP = ['Line', 30, '', 0, '+', 20, 't', 5, '+', 20]
            const lignePPz = ['Line', 30, '', 0, '+', 20, 'z', 5, '+', 20]
            const ligneMM = ['Line', 30, '', 0, '-', 20, 't', 5, '-', 20]
            const ligneMMd = ['Line', 30, '', 0, '-', 20, 'd', 5, '-', 20]
            const lignePPd = ['Line', 30, '', 0, '+', 20, 'd', 5, '+', 20]
            if (-a * c > 0) {
              ligne1 = lignePP
              ligne2 = lignePPz
              ligne3 = lignePPd
              ligneVar = ['Var', 10, '-/', 20, '+D-/ /', 20, '+/', 10]
            } else {
              // Sinon, la deuxième ligne change de signe en premier
              ligne1 = ligneMM
              ligne2 = lignePPz
              ligne3 = ligneMMd
              ligneVar = ['Var', 10, '+/', 20, '-D+/ /', 20, '-/', 10]
            }

            texte = `On considère la fonction $f$ définie sur $\\mathbb{R}\\smallsetminus\\{${texNombre(-d / c, 0)}\\}$ par : $f(x)=\\dfrac{${a}}{${reduireAxPlusB(c, d)}}$.<br>
      Étudier le sens de variation de la fonction $f$ sur son ensemble de définition.<br>`
            texteCorr +=
              `$f$ est le quotient de deux fonctions dérivables sur $\\mathbb{R}\\smallsetminus\\{${texNombre(-d / c, 0)}\\}$ dont le dénominateur ne s'annule pas sur $\\mathbb{R}\\smallsetminus\\{${texNombre(-d / c, 0)}\\}$.<br>
            On en déduit que $f$ est dérivable sur $\\mathbb{R}\\smallsetminus\\{${texNombre(-d / c, 0)}\\}$.<br>
            Comme $f(x)=${a}\\times \\dfrac{1}{${reduireAxPlusB(c, d)}}$, on calcule  $f'(x)$ en utilisant la formule $${a}\\times \\left(\\dfrac{1}{u}\\right)'=${a}\\times\\left(-\\dfrac{u'}{u^2}\\right)$.<br>
            Pour tout $x\\in\\mathbb{R}\\smallsetminus\\{${texNombre(-d / c, 0)}\\}$, <br>
            $\\begin{aligned}
            f'(x)&=${a}\\times\\dfrac{${-c}}{(${reduireAxPlusB(c, d)})^2}\\\\
            &=\\dfrac{${-a * c}}{(${reduireAxPlusB(c, d)})^2}\
            \\end{aligned}$<br>
            On en déduit le tableau de variations suivant : <br><br> ` +
              tableauDeVariation({
                tabInit: [
                  [
                    ['$x$', 1.5, 20],
                    [`$${-a * c}$`, 2, 25],
                    [`$(${reduireAxPlusB(c, d)})^2$`, 2, 25],
                    ["$f'(x)$", 2, 25],
                    ['$f(x)$', 4, 200],
                  ],
                  [
                    '$-\\infty$',
                    30,
                    `$${texNombre(-d / c, 0)}$`,
                    20,
                    '$+\\infty$',
                    30,
                  ],
                ],
                tabLines: [ligne1, ligne2, ligne3, ligneVar],
                espcl: 6,
                deltacl: 0.8,
                lgt: 6,
                scale: context.isHtml ? 1 : 0.4,
              })
          }
          break

        case 3: //
          {
            const a = randint(-10, 10, 0)
            const c = randint(1, 6, 0)
            const d = randint(1, 10)
            const ext = new FractionEtendue(a, d).simplifie()
            const lignePP = ['Line', 30, '', 0, '+', 20, 't', 5, '+', 20]
            const ligneMP = ['Line', 30, '', 0, '-', 20, 'z', 5, '+', 20]
            const lignePM = ['Line', 30, '', 0, '+', 20, 'z', 5, '-', 20]
            if (a * c < 0) {
              ligne1 = ligneMP
              ligne2 = lignePP
              ligne3 = ligneMP
              ligneVar = [
                'Var',
                10,
                '+/',
                10,
                `-/$${ext.texFSD}$`,
                10,
                '+/',
                10,
              ]
            } else {
              // Sinon, la deuxième ligne change de signe en premier
              ligne1 = lignePM
              ligne2 = lignePP
              ligne3 = lignePM
              ligneVar = [
                'Var',
                10,
                '-/',
                10,
                `+/$${ext.texFSD}$`,
                10,
                '-/',
                10,
              ]
            }

            texte = `On considère la fonction $f$ définie sur $\\mathbb{R}$ par : $f(x)=\\dfrac{${a}}{${rienSi1(c)}x^2${ecritureAlgebrique(d)}}$.<br>
     Étudier le sens de variation de la fonction $f$ sur son ensemble de définition.<br>`
            texteCorr +=
              `$f$ est le quotient de deux fonctions dérivables sur $\\mathbb{R}$ dont le dénominateur ne s'annule pas sur $\\mathbb{R}$.<br>
           On en déduit que $f$ est dérivable sur $\\mathbb{R}$.<br>
           Comme $f(x)=${a}\\times \\dfrac{1}{${rienSi1(c)}x^2${ecritureAlgebrique(d)}}$, on calcule  $f'(x)$ en utilisant la formule $${a}\\times \\left(\\dfrac{1}{u}\\right)'=${a}\\times\\left(-\\dfrac{u'}{u^2}\\right)$.<br>
           Pour tout $x\\in\\mathbb{R}$, <br>
           $\\begin{aligned}
           f'(x)&=${a}\\times\\dfrac{${-2 * c}x}{(${rienSi1(c)}x^2${ecritureAlgebrique(d)})^2}\\\\
           &=\\dfrac{${-2 * a * c}x}{(${rienSi1(c)}x^2${ecritureAlgebrique(d)})^2}\
           \\end{aligned}$<br>
           On en déduit le tableau de variations suivant : <br><br> ` +
              tableauDeVariation({
                tabInit: [
                  [
                    ['$x$', 1.5, 20],
                    [`$${-2 * a * c}x$`, 2, 25],
                    [`$(${rienSi1(c)}x^2${ecritureAlgebrique(d)})^2$`, 2, 25],
                    ["$f'(x)$", 2, 25],
                    ['$f(x)$', 4, 200],
                  ],
                  ['$-\\infty$', 30, '$0$', 20, '$+\\infty$', 30],
                ],
                tabLines: [ligne1, ligne2, ligne3, ligneVar],
                espcl: 6,
                deltacl: 0.8,
                lgt: 6,
                scale: context.isHtml ? 1 : 0.4,
              })
          }
          break

        case 4: //
          switch (randint(1, 2)) {
            case 1:
              {
                const { a, b, c, d, e } = rationnelleDegre2(
                  choice([true, false]),
                  choice([true, false]),
                  true,
                )
                const image = function (r: FractionEtendue) {
                  const dxpluse = r.multiplieEntier(d).ajouteEntier(e)
                  const denominateur = dxpluse
                  const numerateur = r
                    .produitFraction(r)
                    .multiplieEntier(a)
                    .sommeFraction(r.multiplieEntier(b))
                    .ajouteEntier(c)
                  return numerateur.diviseFraction(denominateur).simplifie()
                }
                const p = new Trinome(a, b, c)
                const valInterdite = new FractionEtendue(-e, d).simplifie()
                const pPrime = new Trinome(a * d, 2 * a * e, b * e - d * c)
                const lignePMMP = [
                  'Line',
                  30,
                  '',
                  0,
                  '+',
                  20,
                  'z',
                  5,
                  '-',
                  5,
                  't',
                  5,
                  '-',
                  5,
                  'z',
                  5,
                  '+',
                  20,
                ]

                const lignePMMPd = [
                  'Line',
                  30,
                  '',
                  0,
                  '+',
                  20,
                  'z',
                  5,
                  '-',
                  5,
                  'd',
                  5,
                  '-',
                  5,
                  'z',
                  5,
                  '+',
                  20,
                ]

                const ligneMPPM = [
                  'Line',
                  30,
                  '',
                  0,
                  '-',
                  20,
                  'z',
                  5,
                  '+',
                  5,
                  't',
                  5,
                  '+',
                  5,
                  'z',
                  5,
                  '-',
                  20,
                ]
                const ligneMPPMd = [
                  'Line',
                  30,
                  '',
                  0,
                  '-',
                  20,
                  'z',
                  5,
                  '+',
                  5,
                  'd',
                  5,
                  '+',
                  5,
                  'z',
                  5,
                  '-',
                  20,
                ]
                const lignePPPP = [
                  'Line',
                  30,
                  '',
                  0,
                  '+',
                  20,
                  't',
                  5,
                  '+',
                  5,
                  'z',
                  5,
                  '+',
                  5,
                  't',
                  5,
                  '+',
                  20,
                ]
                const x1 =
                  pPrime.x1 instanceof FractionEtendue
                    ? pPrime.x1
                    : fraction(Number(pPrime.x1), 1)
                const x2 =
                  pPrime.x2 instanceof FractionEtendue
                    ? pPrime.x2
                    : fraction(Number(pPrime.x2), 1)
                const val1 = image(x1)
                const val2 = image(x2)

                if (a * d > 0) {
                  ligne1 = lignePMMP
                  ligne2 = lignePPPP
                  ligne3 = lignePMMPd
                  ligneVar = [
                    'Var',
                    10,
                    '-/',
                    10,
                    `+/$${val1.texFraction}$`,
                    20,
                    '-D+/ /',
                    30,
                    `-/$${val2.texFraction}$`,
                    10,
                    '+/',
                    10,
                  ]
                } else {
                  // Sinon, la deuxième ligne change de signe en premier
                  ligne1 = ligneMPPM
                  ligne2 = lignePPPP
                  ligne3 = ligneMPPMd
                  ligneVar = [
                    'Var',
                    10,
                    '+/',
                    10,
                    `-/$${val1.texFraction}$`,
                    20,
                    '+D-/ /',
                    30,
                    `+/$${val2.texFraction}$`,
                    10,
                    '-/',
                    10,
                  ]
                }
                texte = `On considère la fonction $f$ définie sur $\\mathbb{R}\\smallsetminus\\left\\{${valInterdite.texFSD}\\right\\}$ par : $f(x)=\\dfrac{${p}}{${reduireAxPlusB(d, e)}}$.<br>
       Étudier le sens de variation de la fonction $f$ sur son ensemble de définition.<br>`
                texteCorr += `$f$ est le quotient de deux fonctions dérivables sur $\\mathbb{R}\\smallsetminus\\left\\{${valInterdite.texFSD}\\right\\}$ dont le dénominateur ne s'annule pas sur $\\mathbb{R}\\smallsetminus\\left\\{${valInterdite.texFSD}\\right\\}$.<br>
            On en déduit que $f$ est dérivable sur $\\mathbb{R}\\smallsetminus\\left\\{${valInterdite.texFSD}\\right\\}$.<br>

            Pour tout $x\\in\\mathbb{R}\\smallsetminus\\left\\{${valInterdite.texFSD}\\right\\}$, <br>
            $\\begin{aligned}
            f'(x)&=\\dfrac{(${2 * a}x${ecritureAlgebrique(b)})\\times(${reduireAxPlusB(d, e)})-(${p})\\times${ecritureParentheseSiNegatif(d)}}{(${reduireAxPlusB(d, e)})^2}\\\\
            &=\\dfrac{${2 * a * d}x^2${ecritureAlgebrique(2 * a * e)}x${ecritureAlgebrique(b * d)}x${ecritureAlgebrique(b * e)}-(${a * d}x^2${ecritureAlgebrique(b * d)}x${ecritureAlgebrique(c * d)})}{(${reduireAxPlusB(d, e)})^2}\\\\
            &=\\dfrac{${2 * a * d}x^2${ecritureAlgebrique(2 * a * e)}x${ecritureAlgebrique(b * d)}x${ecritureAlgebrique(b * e)}${ecritureAlgebrique(-a * d)}x^2${ecritureAlgebrique(-b * d)}x${ecritureAlgebrique(-c * d)}}{(${reduireAxPlusB(d, e)})^2}\\\\
            &=\\dfrac{${pPrime}}{(${reduireAxPlusB(d, e)})^2}
            \\end{aligned}$<br>
            Le numérateur est un polynôme du second degré. <br>`
                if (b * e - d * c === 0) {
                  texteCorr += `$${pPrime}=0$ s'écrit $x(${rienSi1(a * d)}x${ecritureAlgebrique(2 * a * e)})=0$.<br>
                  Cette équation a deux solutions : $${x1.texFraction}$ et $${x2.texFraction}$ qui sont les racines de $${pPrime}$.<br>`
                } else {
                  texteCorr += `  $\\Delta=b^2-4ac=${pPrime.texCalculDiscriminant} > 0$. <br>On en déduit deux racines : <br>
 $${pPrime.texCalculRacine1(true)}$<br>
 $${pPrime.texCalculRacine2(true)}$<br>`
                }
                texteCorr +=
                  `Un polynôme du second degré est du signe de $a$ sauf entre ses racines. <br>
            Ici, $a=${a * d}$, ainsi :<br>` +
                  tableauDeVariation({
                    tabInit: [
                      [
                        ['$x$', 2, 20],
                        [`$${pPrime}$`, 2, 25],
                        [`$(${reduireAxPlusB(d, e)})^2$`, 2, 25],
                        ["$f'(x)$", 2, 25],
                        ['$f(x)$', 4, 200],
                      ],
                      [
                        '$-\\infty$',
                        30,
                        `$${pPrime.x1 instanceof FractionEtendue ? pPrime.x1.texFractionSimplifiee : pPrime.x1}$`,
                        20,
                        `$${valInterdite.texFSD}$`,
                        20,
                        `$${pPrime.x2 instanceof FractionEtendue ? pPrime.x2.texFractionSimplifiee : pPrime.x2}$`,
                        20,
                        '$+\\infty$',
                        30,
                      ],
                    ],
                    tabLines: [ligne1, ligne2, ligne3, ligneVar],
                    espcl: 5,
                    deltacl: 0.8,
                    lgt: 6,
                    scale: context.isHtml ? 1 : 0.5,
                  })
              }
              break

            case 2:
              {
                const { a, b, c, d, e } = rationnelleDegre2(
                  choice([true, false]),
                  choice([true, false]),
                  false,
                )

                const p = new Trinome(a, b, c)
                const valInterdite = new FractionEtendue(-e, d).simplifie()
                const pPrime = new Trinome(a * d, 2 * a * e, b * e - d * c)
                const lignePP = ['Line', 30, '', 0, '+', 20, 't', 5, '+', 20]
                const ligneMM = ['Line', 30, '', 0, '-', 20, 't', 5, '-', 20]
                const lignePPz = ['Line', 30, '', 0, '+', 20, 'z', 5, '+', 20]
                const lignePPd = ['Line', 30, '', 0, '+', 20, 'd', 5, '+', 20]
                const ligneMMd = ['Line', 30, '', 0, '-', 20, 'd', 5, '-', 20]
                if (a * d > 0) {
                  ligne1 = lignePP
                  ligne2 = lignePPz
                  ligne3 = lignePPd
                  ligneVar = ['Var', 10, '-/', 20, '+D-/ /', 20, '+/', 10]
                } else {
                  // Sinon, la deuxième ligne change de signe en premier
                  ligne1 = ligneMM
                  ligne2 = lignePPz
                  ligne3 = ligneMMd
                  ligneVar = ['Var', 10, '+/', 20, '-D+/ /', 20, '-/', 10]
                }
                texte = `On considère la fonction $f$ définie sur $\\mathbb{R}\\smallsetminus\\left\\{${valInterdite.texFSD}\\right\\}$ par : $f(x)=\\dfrac{${p}}{${reduireAxPlusB(d, e)}}$.<br>
       Étudier le sens de variation de la fonction $f$ sur son ensemble de définition.<br>`
                texteCorr += `$f$ est le quotient de deux fonctions dérivables sur $\\mathbb{R}\\smallsetminus\\left\\{${valInterdite.texFSD}\\right\\}$ dont le dénominateur ne s'annule pas sur $\\mathbb{R}\\smallsetminus\\left\\{${valInterdite.texFSD}\\right\\}$.<br>
            On en déduit que $f$ est dérivable sur $\\mathbb{R}\\smallsetminus\\left\\{${valInterdite.texFSD}\\right\\}$.<br>
            Pour tout $x\\in\\mathbb{R}\\smallsetminus\\left\\{${valInterdite.texFSD}\\right\\}$, <br>
            $\\begin{aligned}
            f'(x)&=\\dfrac{(${2 * a}x${ecritureAlgebrique(b)})\\times(${reduireAxPlusB(d, e)})-(${p})\\times${ecritureParentheseSiNegatif(d)}}{(${reduireAxPlusB(d, e)})^2}\\\\
            &=\\dfrac{${2 * a * d}x^2${ecritureAlgebrique(2 * a * e)}x${ecritureAlgebrique(b * d)}x${ecritureAlgebrique(b * e)}-(${a * d}x^2${ecritureAlgebrique(b * d)}x${ecritureAlgebrique(c * d)})}{(${reduireAxPlusB(d, e)})^2}\\\\
            &=\\dfrac{${2 * a * d}x^2${ecritureAlgebrique(2 * a * e)}x${ecritureAlgebrique(b * d)}x${ecritureAlgebrique(b * e)}${ecritureAlgebrique(-a * d)}x^2${ecritureAlgebrique(-b * d)}x${ecritureAlgebrique(-c * d)}}{(${reduireAxPlusB(d, e)})^2}\\\\
            &=\\dfrac{${pPrime}}{(${reduireAxPlusB(d, e)})^2}
            \\end{aligned}$<br><br>
            Le numérateur est un polynôme du second degré. <br>`
                texteCorr +=
                  `  $\\Delta=b^2-4ac=${pPrime.texCalculDiscriminant} < 0$. <br>
                  On en déduit $${pPrime}$ est toujours du signe de $a$. <br>
            Ici, $a=${a * d}$, ainsi :<br>` +
                  tableauDeVariation({
                    tabInit: [
                      [
                        ['$x$', 2, 20],
                        [`$${pPrime}$`, 2, 25],
                        [`$(${reduireAxPlusB(d, e)})^2$`, 2, 25],
                        ["$f'(x)$", 2, 25],
                        ['$f(x)$', 4, 200],
                      ],
                      [
                        '$-\\infty$',
                        30,
                        `$${valInterdite.texFSD}$`,
                        20,
                        '$+\\infty$',
                        30,
                      ],
                    ],
                    tabLines: [ligne1, ligne2, ligne3, ligneVar],
                    espcl: 5,
                    deltacl: 0.8,
                    lgt: 7,
                    scale: context.isHtml ? 1 : 0.5,
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
