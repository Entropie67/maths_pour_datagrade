import { courbe } from '../../lib/2d/Courbe'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import { numAlpha } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Étudier une fonction rationnelle'
export const dateDePublication = '08/08/2026'
export const interactifReady = false

export const uuid = '6b104'
export const refs = {
  'fr-fr': ['TSA2-34', 'TCA2-34'],
  'fr-ch': [],
}

function limiteInfinie(signe: number): '+\\infty' | '-\\infty' {
  return signe > 0 ? '+\\infty' : '-\\infty'
}

/**
 * Étude complète d'une fonction rationnelle quotient de fonctions affines.
 * @author Stéphane Guyon
 */
export default class EtudeFonctionInverse extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = 3
    this.besoinFormulaireNumerique = [
      'Type de fonction',
      3,
      '1 : a/(bx+c)\n2 : (ax+b)/(cx+d)\n3 : Mélange',
    ]
  }

  nouvelleVersion(): void {
    const typeFonction =
      this.sup === 1 || this.sup === 2 ? this.sup : choice([1, 2])
    const alpha = choice([-4, -3, -2, -1, 1, 2, 3, 4])
    const coefficientDenominateur = randint(-4, 4, 0)
    const constanteDenominateur = -coefficientDenominateur * alpha
    const expressionDenominateur = reduireAxPlusB(
      coefficientDenominateur,
      constanteDenominateur,
    )
    let expressionNumerateur: string
    let expression: string
    let numerateurEnAlpha: number
    let numerateurDerivee: number
    let limiteHorizontaleTex: string
    let limiteHorizontale: number
    let fonction: (x: number) => number
    let correctionInfiniCalcul: string
    let calculDerivee: string

    if (typeFonction === 1) {
      const constanteNumerateur = randint(-6, 6, 0)
      expressionNumerateur = `${constanteNumerateur}`
      expression = `\\dfrac{${expressionNumerateur}}{${expressionDenominateur}}`
      numerateurEnAlpha = constanteNumerateur
      numerateurDerivee = -constanteNumerateur * coefficientDenominateur
      limiteHorizontaleTex = '0'
      limiteHorizontale = 0
      fonction = (x: number) =>
        constanteNumerateur /
        (coefficientDenominateur * x + constanteDenominateur)
      correctionInfiniCalcul = `On a $\\displaystyle \\lim_{x\\to-\\infty}(${expressionDenominateur})=${coefficientDenominateur > 0 ? '-\\infty' : '+\\infty'}$ et $\\displaystyle \\lim_{x\\to+\\infty}(${expressionDenominateur})=${coefficientDenominateur > 0 ? '+\\infty' : '-\\infty'}$.<br>
      Par quotient :<br>
      $\\displaystyle \\lim_{x\\to-\\infty}f(x)=0$ et $\\displaystyle \\lim_{x\\to+\\infty}f(x)=0$.`
      calculDerivee = `On utilise la formule $\\left(\\dfrac{1}{u}\\right)'=-\\dfrac{u'}{u^2}$.<br>
      Ici, $u(x)=${expressionDenominateur}$ et $u'(x)=${coefficientDenominateur}$. Ainsi, pour tout $x\\in D_f$ :<br>
      $\\begin{aligned}
        f'(x)&=${constanteNumerateur}\\left(-\\dfrac{${coefficientDenominateur}}{\\left(${expressionDenominateur}\\right)^2}\\right)\\\\
        &=\\dfrac{${numerateurDerivee}}{\\left(${expressionDenominateur}\\right)^2}.
      \\end{aligned}$`
    } else {
      let beta: number
      do {
        beta = randint(-5, 5)
      } while (beta === alpha)
      const coefficientNumerateur = randint(-5, 5, 0)
      const constanteNumerateur = -coefficientNumerateur * beta
      expressionNumerateur = reduireAxPlusB(
        coefficientNumerateur,
        constanteNumerateur,
      )
      expression = `\\dfrac{${expressionNumerateur}}{${expressionDenominateur}}`
      numerateurEnAlpha =
        coefficientNumerateur * alpha + constanteNumerateur
      numerateurDerivee =
        coefficientNumerateur * constanteDenominateur -
        coefficientDenominateur * constanteNumerateur
      const fractionLimite = new FractionEtendue(
        coefficientNumerateur,
        coefficientDenominateur,
      )
      limiteHorizontaleTex = fractionLimite.texFractionSimplifiee
      limiteHorizontale = fractionLimite.toNumber()
      fonction = (x: number) =>
        (coefficientNumerateur * x + constanteNumerateur) /
        (coefficientDenominateur * x + constanteDenominateur)
      correctionInfiniCalcul = `Soit $x\\neq 0$. On a :<br>
      $\\begin{aligned}
        f(x)&=\\dfrac{${expressionNumerateur}}{${expressionDenominateur}}\\\\
        &=\\dfrac{${coefficientNumerateur}+\\dfrac{${constanteNumerateur}}{x}}{${coefficientDenominateur}+\\dfrac{${constanteDenominateur}}{x}}.
      \\end{aligned}$<br>
      D’après les limites de référence, $\\displaystyle \\lim_{x\\to\\pm\\infty}\\dfrac{1}{x}=0$.<br>
      Par somme puis par quotient :<br>
      $\\displaystyle \\lim_{x\\to-\\infty}f(x)=${limiteHorizontaleTex}$ et $\\displaystyle \\lim_{x\\to+\\infty}f(x)=${limiteHorizontaleTex}$.`
      calculDerivee = `On utilise la formule $\\left(\\dfrac{u}{v}\\right)'=\\dfrac{u'v-uv'}{v^2}$.<br>
      Ici, $u(x)=${expressionNumerateur}$, $u'(x)=${coefficientNumerateur}$, $v(x)=${expressionDenominateur}$ et $v'(x)=${coefficientDenominateur}$. Ainsi, pour tout $x\\in D_f$ :<br>
      $\\begin{aligned}
        f'(x)&=\\dfrac{${coefficientNumerateur}\\left(${expressionDenominateur}\\right)-\\left(${expressionNumerateur}\\right)\\times ${ecritureParentheseSiNegatif(coefficientDenominateur)}}{\\left(${expressionDenominateur}\\right)^2}\\\\
        &=\\dfrac{${numerateurDerivee}}{\\left(${expressionDenominateur}\\right)^2}.
      \\end{aligned}$`
    }
    const domaine = `]-\\infty~;~${alpha}[\\cup]${alpha}~;~+\\infty[`
    const sensVariation = numerateurDerivee > 0 ? 'croissante' : 'décroissante'
    const signeDerivee = numerateurDerivee > 0 ? '+' : '-'
    const signeZeroGauche = -coefficientDenominateur
    const signeZeroDroite = coefficientDenominateur
    const zeroGauche = signeZeroGauche > 0 ? '0^+' : '0^-'
    const zeroDroite = signeZeroDroite > 0 ? '0^+' : '0^-'
    const limiteGauche = limiteInfinie(numerateurEnAlpha * signeZeroGauche)
    const limiteDroite = limiteInfinie(numerateurEnAlpha * signeZeroDroite)

    const texte = `Soit $f$ la fonction définie sur $D_f=${domaine}$ par $f(x)=${expression}$.<br>
    On note $\\mathcal C_f$ sa courbe représentative.<br><br>
    ${numAlpha(0)} Étudier le sens de variation de la fonction $f$.<br><br>
    ${numAlpha(1)} Étudier les limites de $f$ en $-\\infty$ et en $+\\infty$, puis en déduire une éventuelle asymptote à $\\mathcal C_f$.<br><br>
    ${numAlpha(2)} Étudier les limites de $f$ en $${alpha}$, en distinguant les cas $x<${alpha}$ et $x>${alpha}$. En déduire une éventuelle asymptote à $\\mathcal C_f$.<br><br>
    ${numAlpha(3)} Dresser le tableau de variations de $f$ et vérifier graphiquement les résultats obtenus.`

    const correctionVariation = `${numAlpha(0)} La fonction $f$ est dérivable sur chacun des intervalles de $D_f$.<br>
    ${calculDerivee}<br>
    Pour tout $x\\in D_f$, $\\left(${expressionDenominateur}\\right)^2>0$ et $${numerateurDerivee}${numerateurDerivee > 0 ? '>0' : '<0'}$.<br>
    Ainsi, $f'(x)${numerateurDerivee > 0 ? '>0' : '<0'}$ sur $D_f$. La fonction $f$ est donc ${sensVariation} sur $]-\\infty~;~${alpha}[$ et sur $]${alpha}~;~+\\infty[$.`

    const correctionInfini = `${numAlpha(1)} ${correctionInfiniCalcul}<br>
    La courbe $\\mathcal C_f$ admet donc une asymptote horizontale d'équation $${miseEnEvidence(`y=${limiteHorizontaleTex}`)}$.`

    const correctionAlpha = `${numAlpha(2)} On a :<br>
    $\\displaystyle \\lim_{x\\to ${alpha}}(${expressionNumerateur})=${numerateurEnAlpha}$.<br>
    $\\displaystyle \\lim_{x\\to ${alpha}^-}(${expressionDenominateur})=${zeroGauche}$ et $\\displaystyle \\lim_{x\\to ${alpha}^+}(${expressionDenominateur})=${zeroDroite}$.<br>
    Par quotient :<br>
    $\\displaystyle \\lim_{x\\to ${alpha}^-}f(x)=${miseEnEvidence(limiteGauche)}$ et $\\displaystyle \\lim_{x\\to ${alpha}^+}f(x)=${miseEnEvidence(limiteDroite)}$.<br>
    La courbe $\\mathcal C_f$ admet donc une asymptote verticale d'équation $${miseEnEvidence(`x=${alpha}`)}$.`

    const ligneSigne = [
      'Line',
      30,
      '',
      0,
      signeDerivee,
      20,
      'd',
      5,
      signeDerivee,
      20,
    ]
    const ligneVariation =
      numerateurDerivee < 0
        ? [
            'Var',
            10,
            `+/$${limiteHorizontaleTex}$`,
            20,
            '-D+/$-\\infty$/$+\\infty$',
            20,
            `-/$${limiteHorizontaleTex}$`,
            10,
          ]
        : [
            'Var',
            10,
            `-/$${limiteHorizontaleTex}$`,
            20,
            '+D-/$+\\infty$/$-\\infty$',
            20,
            `+/$${limiteHorizontaleTex}$`,
            10,
          ]
    const tableau = tableauDeVariation({
      tabInit: [
        [
          ['$x$', 2, 20],
          ["$f'(x)$", 2, 25],
          ['$f(x)$', 4, 100],
        ],
        ['$-\\infty$', 30, `$${alpha}$`, 20, '$+\\infty$', 30],
      ],
      tabLines: [ligneSigne, ligneVariation],
      espcl: 5,
      deltacl: 1.2,
      lgt: 3.5,
      scale: context.isHtml ? 0.85 : 0.7,
      hauteurLignes: [20, 20, 30],
    })

    const xMin = alpha - 7
    const xMax = alpha + 7
    const yMin = Math.floor(limiteHorizontale) - 6
    const yMax = Math.ceil(limiteHorizontale) + 6
    const r = repere({
      xMin,
      xMax,
      yMin,
      yMax,
      xThickDistance: 1,
      yThickDistance: 1,
      grilleXDistance: 1,
      grilleYDistance: 1,
    })
    const brancheGauche = courbe(fonction, {
      repere: r,
      xMin,
      xMax: alpha - 0.08,
      yMin,
      yMax,
      step: 0.02,
      color: bleuMathalea,
      epaisseur: 2,
    })
    const brancheDroite = courbe(fonction, {
      repere: r,
      xMin: alpha + 0.08,
      xMax,
      yMin,
      yMax,
      step: 0.02,
      color: bleuMathalea,
      epaisseur: 2,
    })
    const asymptoteVerticale = segment(alpha, yMin, alpha, yMax)
    asymptoteVerticale.color = colorToLatexOrHTML(orangeMathalea)
    asymptoteVerticale.epaisseur = 2
    asymptoteVerticale.pointilles = 5
    const asymptoteHorizontale = segment(
      xMin,
      limiteHorizontale,
      xMax,
      limiteHorizontale,
    )
    asymptoteHorizontale.color = colorToLatexOrHTML(orangeMathalea)
    asymptoteHorizontale.epaisseur = 2
    asymptoteHorizontale.pointilles = 5
    const nomCourbe = latex2d(
      '\\mathcal C_f',
      alpha + 4.5,
      fonction(alpha + 4.5) + 0.7,
      { color: bleuMathalea, letterSize: 'normalsize' },
    )
    const graphique = mathalea2d(
      {
        xmin: xMin - 0.6,
        xmax: xMax + 0.6,
        ymin: yMin - 0.6,
        ymax: yMax + 0.6,
        pixelsParCm: 25,
        scale: 0.65,
        center: !context.isHtml,
      },
      r,
      asymptoteHorizontale,
      asymptoteVerticale,
      brancheGauche,
      brancheDroite,
      nomCourbe,
    )

    const correctionTableau = `${numAlpha(3)} On obtient le tableau de variations suivant :<br><br>${tableau}<br><br>
    La représentation graphique de $\\mathcal C_f$ confirme les variations et les asymptotes obtenues :<br>${graphique}`

    this.listeQuestions[0] = texte
    this.listeCorrections[0] = `${correctionVariation}<br><br>${correctionInfini}<br><br>${correctionAlpha}<br><br>${correctionTableau}`
    listeQuestionsToContenu(this)
  }
}
