import { miseEnEvidence } from '../../lib/outils/embellissements'
import { createList } from '../../lib/format/lists'
import { texteCentre } from '../../lib/format/miseEnPage'
import {
  tableauDeVariation,
  tableauSignesFonction,
} from '../../lib/mathFonctions/etudeFonction'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduirePolynomeDegre3,
} from '../../lib/outils/ecritures'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Trinome from '../../modules/Trinome'
import Exercice from '../Exercice'
export const titre =
  'Étudier une fonction rationnelle avec une fonction auxiliaire'
export const dateDePublication = '05/05/2026'
export const interactifReady = false
export const uuid = 'bd636'
export const refs = {
  'fr-fr': ['1AN20-6'],
  'fr-ch': [],
}

/**
 * Étudier le sens de variation d'une fonction polynôme du troisième degré (avec discriminant)'
 * @author Gilles Mora
 */

export default class EtudeFctPoly3 extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacing = 2
    this.spacingCorr = 2
    this.besoinFormulaireTexte = [
      "Choix de l'intervalle",
      'Nombres séparés par des tirets :\n1 : Intervalle $]a\\,;+\\infty[$ (minimum)\n2 : Intervalle $]-\\infty\\,;a[$ (maximum)\n3 : Intervalle $\\mathbb{R}\\setminus\\{-a\\}$ (max et min locaux)\n4 : Mélange',
    ]
    this.sup = '4'
  }

  nouvelleVersion() {
    const listeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const cas = listeDeQuestions[i]

      // --- Tirage des paramètres ---
      // f(x) = (x² + b·x + c) / (x + a), pôle en -a.
      // P(x) = x² + 2a·x + (a·b - c), racines symétriques autour de -a.
      // On pose x1 = -a - k, x2 = -a + k avec k entier ≥ 1.
      const a = randint(-4, 4, 0)
      const k = randint(1, 5)
      const x1 = -a - k // racine à gauche du pôle
      const x2 = -a + k // racine à droite du pôle
      // Produit des racines : x1·x2 = a² - k² = a·b - c
      let b = randint(-3, 3)
      let c = a * b - x1 * x2
      let tentatives = 0
      while (Math.abs(c) > 12 && tentatives < 10) {
        b = randint(-3, 3)
        c = a * b - x1 * x2
        tentatives++
      }

      // Description de l'intervalle
      let intervalleTex = ''
      let intervalleMaths = ''
      if (cas === 1) {
        intervalleTex = `$]${-a}\\,;+\\infty[$`
        intervalleMaths = `]${-a}\\,;+\\infty[`
      } else if (cas === 2) {
        intervalleTex = `$]-\\infty\\,;${-a}[$`
        intervalleMaths = `]-\\infty\\,;${-a}[`
      } else {
        intervalleTex = `$\\mathbb{R}\\smallsetminus\\{${-a}\\}$`
        intervalleMaths = `\\mathbb{R}\\setminus\\{${-a}\\}`
      }

      // Fonction P (utilisée pour le tableau de signes en Q1)
      const polyP = (x: number) => x ** 2 + 2 * a * x + (a * b - c)

      // Point de tangence : 0, 1 ou 2, dans l'intervalle et ≠ -a
      const candidatsTangente: number[] = []
      for (const x of [0, 1, 2]) {
        if (x === -a) continue
        if (cas === 1 && x <= -a) continue
        if (cas === 2 && x >= -a) continue
        if (x === x1 || x === x2) continue
        candidatsTangente.push(x)
      }
      if (candidatsTangente.length === 0) {
        cpt++
        continue
      }
      const x0 = candidatsTangente[randint(0, candidatsTangente.length - 1)]

      // Coefficient directeur de la tangente (fraction exacte)
      const numDerivee = (2 * x0 + b) * (x0 + a) - (x0 ** 2 + b * x0 + c)
      const denDerivee = (x0 + a) ** 2
      const coeffDir = new FractionEtendue(numDerivee, denDerivee).simplifie()

      // P(x) = x² + 2a·x + (a·b - c)
      const coeffPx = 2 * a
      const cstPx = a * b - c
      const pDeX0 = polyP(x0)
      const p = new Trinome(1, coeffPx, cstPx) // P comme objet Trinome

      // Dénominateur de f
      const denomTex =
        a === 1 ? 'x+1' : a === -1 ? 'x-1' : `x${ecritureAlgebrique(a)}`
      const denomCarreTex =
        a === 1
          ? '(x+1)^2'
          : a === -1
            ? '(x-1)^2'
            : `(x${ecritureAlgebrique(a)})^2`

      // Tableau de signes de P (Q1) : sur R entier, racines x1 < x2
      const tableauSignes = tableauSignesFonction(
        polyP as (x: FractionEtendue | number) => number,
        -10,
        10,
        {
          step: 1,
          tolerance: 0.1,
          substituts: [
            { antVal: -10, antTex: '-\\infty' },
            { antVal: 10, antTex: '+\\infty' },
          ],
        },
      )

      // --- Énoncé ---
      const texte =
        `On considère la fonction $f$ définie sur ${intervalleTex} par : ` +
        `${texteCentre(`$f(x)=\\dfrac{${reduirePolynomeDegre3(0, 1, b, c)}}{${denomTex}}$.`)}` +
        ` On note $\\mathscr{C}_f$ sa courbe représentative dans un repère orthogonal du plan. <br>` +
        `On admet que la fonction $f$ est dérivable sur  ${intervalleTex}.<br>` +
        createList({
          items: [
            `Étudier le signe de la fonction $P$ définie sur $\\mathbb{R}$ par $P(x)=${reduirePolynomeDegre3(0, 1, coeffPx, cstPx)}$.`,
            `Montrer que pour tout réel $x$ de  ${intervalleTex}, $f'(x)=\\dfrac{P(x)}{${denomCarreTex}}$ où $f'$ est la fonction dérivée de $f$.`,
            `Étudier le signe de $f'(x)$ sur ${intervalleTex} et construire le tableau de variations de $f$ sur ${intervalleTex}.`,
            `Donner ${cas === 1 ? 'le minimum' : cas === 2 ? 'le maximum' : 'les extremums locaux'} de la fonction $f$ sur ${intervalleTex} et la valeur pour laquelle ${cas === 3 ? 'ils sont atteints' : 'il est atteint'} (on donnera les valeurs exactes).`,
            `Déterminer l'équation réduite de la tangente $T$ à la courbe $\\mathscr{C}_f$ au point d'abscisse $${x0}$.`,
          ],
          style: 'nombres',
        })

      // --- Correction ---
      // Q1 : signe de P avec discriminant (Trinome) et tableau de signes
      let correctionQ1 = `$P(x)=${reduirePolynomeDegre3(0, 1, coeffPx, cstPx)}$ est un polynôme du second degré.<br>`

      if (coeffPx === 0) {
        // Cas x² + cstPx : on factorise directement x² - k² = (x-k)(x+k) si cstPx = -k²
        correctionQ1 +=
          `Les racines de $P(x)$ sont les solutions de l'équation $x^2${ecritureAlgebrique(cstPx)}=0$, soit $x^2=${-cstPx}$.<br>` +
          `Cette équation a pour solutions $${x1}$ et $${x2}$.<br>`
      } else if (cstPx === 0) {
        // Cas x² + 2ax = x(x + 2a) : factorisation par x
        correctionQ1 +=
          `En factorisant par $x$, on obtient $P(x)=x(x${ecritureAlgebrique(coeffPx)})$.<br>` +
          `Les racines de $P(x)$ sont $${x1}$ et $${x2}$.<br>`
      } else {
        correctionQ1 +=
          `$\\Delta=${p.texCalculDiscriminant}$<br>` +
          `Le discriminant est strictement positif, donc $P$ admet deux racines :<br>` +
          `$${p.texCalculRacine1(true)}$<br>` +
          `$${p.texCalculRacine2(true)}$<br>`
      }
      correctionQ1 +=
        `$P$ est un polynôme du second degré de coefficient dominant $1>0$, donc $P(x)$ est positif sauf entre ses racines.<br>` +
        `On en déduit le tableau de signes de $P$ :<br>${tableauSignes}`

      // Q2 : dérivée du quotient
      const uTex = reduirePolynomeDegre3(0, 1, b, c)
      const uPrimeTex = b === 0 ? '2x' : `2x${ecritureAlgebrique(b)}`

      const correctionQ2 =
        `$f$ est dérivable sur ${intervalleTex} comme quotient de fonctions dérivables dont le dénominateur ne s'annule pas sur ${intervalleTex}.<br>` +
        `On pose $u(x)=${uTex}$ et $v(x)=${denomTex}$, d'où $u'(x)=${uPrimeTex}$ et $v'(x)=1$.<br>` +
        `Pour tout $x\\in ${intervalleMaths}$ : <br>` +
        `$\\begin{aligned}
f'(x)&=\\dfrac{u'(x)v(x)-u(x)v'(x)}{(v(x))^2}\\\\
&=\\dfrac{(${uPrimeTex})(${denomTex})-\\left(${uTex}\\right)}{${denomCarreTex}}\\\\
&=\\dfrac{${reduirePolynomeDegre3(0, 2, 2 * a + b, a * b)}${reduirePolynomeDegre3(0, -1, -b, -c)}}{${denomCarreTex}}\\\\
&=\\dfrac{${reduirePolynomeDegre3(0, 1, 2 * a, a * b - c)}}{${denomCarreTex}}
\\end{aligned}$<br>` +
        `On obtient bien $f'(x)=\\dfrac{P(x)}{${denomCarreTex}}$.`

      // Q3 : signe de f' et tableau de variations (construction manuelle)
      // Codes : 'z' = zéro, 't' = trait, 'd' = double barre (valeur interdite)
      // Ligne variation : '+D-' / '-D+' = flèche avec double barre
      const fDeX1Tex = new FractionEtendue(
        x1 ** 2 + b * x1 + c,
        x1 + a,
      ).simplifie().texFractionSimplifiee
      const fDeX2Tex = new FractionEtendue(
        x2 ** 2 + b * x2 + c,
        x2 + a,
      ).simplifie().texFractionSimplifiee

      let tableauVar = ''

      if (cas === 1) {
        // ]-a ; +inf[ : 3 bornes (-a, x2, +inf). Double barre sur -a (valeur interdite).
        // P : - 0 +   ;   (x+a)² : + +   ;   f' : - 0 +   ;   f : décroit puis croit (min en x2)
        const ligneP = ['Line', 30, 't', 0, '-', 20, 'z', 5, '+', 20]
        const ligneDen = ['Line', 30, 'z', 0, '+', 20, 't', 5, '+', 20]
        const ligneFprime = ['Line', 30, 'd', 0, '-', 20, 'z', 5, '+', 20]
        const ligneVar = ['Var', 10, 'D+/', 20, `-/$${fDeX2Tex}$`, 20, '+/', 10]
        tableauVar = tableauDeVariation({
          tabInit: [
            [
              ['$x$', 2, 20],
              ['$P(x)$', 2, 25],
              [`$${denomCarreTex}$`, 2, 30],
              ["$f'(x)$", 2, 25],
              ['$f(x)$', 4, 100],
            ],
            [`$${-a}$`, 30, `$${x2}$`, 20, '$+\\infty$', 30],
          ],
          tabLines: [ligneP, ligneDen, ligneFprime, ligneVar],
          espcl: 5,
          deltacl: 0.8,
          lgt: 6,
          scale: context.isHtml ? 1 : 0.5,
        })
      } else if (cas === 2) {
        // ]-inf ; -a[ : 3 bornes (-inf, x1, -a). Double barre sur -a (valeur interdite).
        // P : + 0 -   ;   (x+a)² : + +   ;   f' : + 0 -   ;   f : croit puis décroit (max en x1)
        const ligneP = ['Line', 30, '', 0, '+', 20, 'z', 5, '-', 20, 't', 0]
        const ligneDen = ['Line', 30, '', 0, '+', 20, 't', 5, '+', 20, 'z', 0]
        const ligneFprime = [
          'Line',
          30,
          '',
          0,
          '+',
          20,
          'z',
          5,
          '-',
          20,
          'd',
          0,
        ]
        const ligneVar = ['Var', 10, '-/', 20, `+/$${fDeX1Tex}$`, 20, '-D/', 10]
        tableauVar = tableauDeVariation({
          tabInit: [
            [
              ['$x$', 2, 20],
              ['$P(x)$', 2, 25],
              [`$${denomCarreTex}$`, 2, 30],
              ["$f'(x)$", 2, 25],
              ['$f(x)$', 4, 100],
            ],
            ['$-\\infty$', 30, `$${x1}$`, 20, `$${-a}$`, 30],
          ],
          tabLines: [ligneP, ligneDen, ligneFprime, ligneVar],
          espcl: 5,
          deltacl: 0.8,
          lgt: 6,
          scale: context.isHtml ? 1 : 0.5,
        })
      } else {
        // R\{-a} : 5 bornes (-inf, x1, -a, x2, +inf)
        // P : + 0 - | - 0 +   ;   (x+a)² : + + | + +   ;   f' : + 0 - | - 0 +
        // f : croit puis décroit avec D en -a puis croit (max local en x1, min local en x2)
        const ligneP = [
          'Line',
          30,
          '',
          0,
          '+',
          20,
          'z',
          5,
          '-',
          20,
          't',
          5,
          '-',
          20,
          'z',
          5,
          '+',
          20,
        ]
        const ligneDen = [
          'Line',
          30,
          '',
          0,
          '+',
          20,
          't',
          5,
          '+',
          20,
          'z',
          5,
          '+',
          20,
          't',
          5,
          '+',
          20,
        ]
        const ligneFprime = [
          'Line',
          30,
          '',
          0,
          '+',
          20,
          'z',
          5,
          '-',
          20,
          'd',
          5,
          '-',
          20,
          'z',
          5,
          '+',
          20,
        ]
        const ligneVar = [
          'Var',
          10,
          '-/',
          20,
          `+/$${fDeX1Tex}$`,
          20,
          '-D+/ /',
          30,
          `-/$${fDeX2Tex}$`,
          20,
          '+/',
          10,
        ]
        tableauVar = tableauDeVariation({
          tabInit: [
            [
              ['$x$', 2, 20],
              ['$P(x)$', 2, 25],
              [`$${denomCarreTex}$`, 2, 30],
              ["$f'(x)$", 2, 25],
              ['$f(x)$', 4, 200],
            ],
            [
              '$-\\infty$',
              30,
              `$${x1}$`,
              20,
              `$${-a}$`,
              20,
              `$${x2}$`,
              20,
              '$+\\infty$',
              30,
            ],
          ],
          tabLines: [ligneP, ligneDen, ligneFprime, ligneVar],
          espcl: 5,
          deltacl: 0.8,
          lgt: 6,
          scale: context.isHtml ? 1 : 0.5,
        })
      }

      const correctionQ3 =
        `Pour tout $x\\in$ ${intervalleTex}, $${denomCarreTex}>0$, donc $f'(x)$ est du signe de $P(x)$.<br>` +
        `D'après le signe de $P$ établi à la question $1$, on en déduit le signe de $f'(x)$ sur ${intervalleTex} puis le tableau de variations de $f$ :<br>${tableauVar}`

      // Q4 : extremums (valeurs exactes) - réutilise fDeX1Tex/fDeX2Tex de Q3
      let correctionQ4 = ''
      if (cas === 1) {
        correctionQ4 = `D'après le tableau de variations, $f$ admet un minimum sur ${intervalleTex} atteint en $x=${miseEnEvidence(x2)}$, égal à $f(${x2})=${miseEnEvidence(fDeX2Tex)}$.`
      } else if (cas === 2) {
        correctionQ4 = `D'après le tableau de variations, $f$ admet un maximum sur ${intervalleTex} atteint en $x=${miseEnEvidence(x1)}$, égal à $f(${x1})=${miseEnEvidence(fDeX1Tex)}$.`
      } else {
        correctionQ4 =
          `D'après le tableau de variations, $f$ admet sur ${intervalleTex} :<br>` +
          `$\\bullet$ un maximum local en $x=${miseEnEvidence(x1)}$, égal à $f(${x1})=${miseEnEvidence(fDeX1Tex)}$ ;<br>` +
          `$\\bullet$ un minimum local en $x=${miseEnEvidence(x2)}$, égal à $f(${x2})=${miseEnEvidence(fDeX2Tex)}$.`
      }

      // Q5 : équation réduite de la tangente en x0
      // T : y = f'(x0)(x - x0) + f(x0)
      const x0PlusATex = x0 === 0 ? `${a}` : `${x0}${ecritureAlgebrique(a)}`
      const coeffDirTex = coeffDir.estEntiere
        ? `${coeffDir.num}`
        : coeffDir.texFractionSimplifiee

      // f(x0) = (x0² + b·x0 + c) / (x0 + a) en fraction exacte
      const fDeX0 = new FractionEtendue(
        x0 ** 2 + b * x0 + c,
        x0 + a,
      ).simplifie()
      const fDeX0Tex = fDeX0.estEntiere
        ? `${fDeX0.num}`
        : fDeX0.texFractionSimplifiee

      // Ordonnée à l'origine de la tangente : p = f(x0) - f'(x0)·x0
      // p = fDeX0 - coeffDir * x0
      const ordOrigine = fDeX0
        .differenceFraction(coeffDir.multiplieEntier(x0))
        .simplifie()
      const ordOrigineTex = ordOrigine.estEntiere
        ? `${ordOrigine.num}`
        : ordOrigine.texFractionSimplifiee

      let correctionQ5 = `L'équation réduite de la tangente $T$ à $\\mathscr{C}_f$ au point d'abscisse $${x0}$ est donnée par $y=f'(${x0})(x${ecritureAlgebrique(-x0)})+f(${x0})$.<br>`

      // Calcul de f'(x0)
      correctionQ5 += `$f'(${x0})=\\dfrac{P(${x0})}{${x0 === 0 ? `${ecritureParentheseSiNegatif(x0 + a)}^2` : `(${x0PlusATex})^2`}}=\\dfrac{${pDeX0}}{${denDerivee}}=${coeffDirTex}$.<br>`

      // Calcul de f(x0)
      correctionQ5 += `$f(${x0})=\\dfrac{${x0}^2${ecritureAlgebrique(b)}\\times ${x0}${ecritureAlgebrique(c)}}{${x0PlusATex}}=\\dfrac{${x0 ** 2 + b * x0 + c}}{${x0 + a}}=${fDeX0Tex}$.<br>`

      // Équation réduite
      if (x0 === 0) {
        // y = f'(0)·x + f(0) = coeffDir·x + fDeX0
        correctionQ5 += `L'équation réduite de la tangente est $y=${miseEnEvidence(`${coeffDirTex}x${ordOrigine.s >= 0 ? '+' : ''}${ordOrigineTex}`)}$.`
      } else {
        correctionQ5 += `$y=${coeffDirTex}(x${ecritureAlgebrique(-x0)})${ecritureAlgebrique(fDeX0)}$`
        // Forme réduite y = coeffDir·x + ordOrigine
        if (ordOrigine.num === 0) {
          correctionQ5 += `, soit $y=${miseEnEvidence(`${coeffDirTex}x`)}$.`
        } else {
          correctionQ5 += `, soit $y=${miseEnEvidence(`${coeffDirTex}x${ordOrigine.s >= 0 ? '+' : ''}${ordOrigineTex}`)}$.`
        }
      }

      const texteCorr = createList({
        items: [
          correctionQ1,
          correctionQ2,
          correctionQ3,
          correctionQ4,
          correctionQ5,
        ],
        style: 'nombres',
      })

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
