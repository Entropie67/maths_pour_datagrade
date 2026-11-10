import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { choice } from '../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../lib/outils/ecritures'
import { texNombre } from '../../lib/outils/texNombre'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Étudier la convexité d'une fonction exponentielle"
export const dateDePublication = '17/08/2026'
export const uuid = 'f0316'

export const refs = {
  'fr-fr': ['TSA3-45', 'TCA7-45'],
  'fr-ch': [],
}

function produitCoefficientExponentielle(
  coefficient: number,
  exposant: number,
): string {
  if (coefficient === 0) return '0'
  if (exposant === 0) return texNombre(coefficient)
  const facteur =
    coefficient === 1 ? '' : coefficient === -1 ? '-' : texNombre(coefficient)
  return `${facteur}\\mathrm e^{${texNombre(exposant)}}`
}

/**
 * Étudier la convexité d'une fonction (ax²+bx+c)e^x.
 * @author Stéphane Guyon
 */
export default class ConvexitePolynomeExponentielle extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion(): void {
    const coefficientDominant = choice([-1, 1])
    const racine1 = randint(-3, 1)
    const racine2 = randint(racine1 + 1, 3)

    // On construit P pour que, si f=P e^x, alors
    // f''(x)=a(x-r1)(x-r2)e^x.
    const coefficientX2 = coefficientDominant
    const coefficientX =
      -coefficientDominant * (racine1 + racine2) - 4 * coefficientDominant
    const constante =
      coefficientDominant * racine1 * racine2 -
      2 * coefficientX -
      2 * coefficientDominant
    const p = new Polynome({
      coeffs: [constante, coefficientX, coefficientX2],
    })
    const pPrime = p.derivee()
    const polynomeFPrime = p.add(pPrime)
    const polynomeFSeconde = polynomeFPrime.add(polynomeFPrime.derivee())
    const coefficientTrinomeX = -coefficientDominant * (racine1 + racine2)
    const constanteTrinome = coefficientDominant * racine1 * racine2
    const discriminant =
      coefficientTrinomeX ** 2 - 4 * coefficientDominant * constanteTrinome
    const racineDiscriminant = Math.sqrt(discriminant)
    const racineAvecMoins =
      (-coefficientTrinomeX - racineDiscriminant) / (2 * coefficientDominant)
    const racineAvecPlus =
      (-coefficientTrinomeX + racineDiscriminant) / (2 * coefficientDominant)

    const imageP1 = p.image(racine1)
    const imageP2 = p.image(racine2)
    const calculImage1 = `\\left(${texNombre(coefficientDominant)}\\times\\left(${texNombre(racine1)}\\right)^2+${ecritureParentheseSiNegatif(coefficientX)}\\times\\left(${texNombre(racine1)}\\right)+${ecritureParentheseSiNegatif(constante)}\\right)\\mathrm e^{${texNombre(racine1)}}`
    const calculImage2 = `\\left(${texNombre(coefficientDominant)}\\times\\left(${texNombre(racine2)}\\right)^2+${ecritureParentheseSiNegatif(coefficientX)}\\times\\left(${texNombre(racine2)}\\right)+${ecritureParentheseSiNegatif(constante)}\\right)\\mathrm e^{${texNombre(racine2)}}`
    const ordonnee1 = produitCoefficientExponentielle(imageP1, racine1)
    const ordonnee2 = produitCoefficientExponentielle(imageP2, racine2)

    const signeExterieur = coefficientDominant > 0 ? '+' : '-'
    const signeInterieur = coefficientDominant > 0 ? '-' : '+'
    const convexiteExterieure =
      coefficientDominant > 0 ? '\\text{Convexe}' : '\\text{Concave}'
    const convexiteInterieure =
      coefficientDominant > 0 ? '\\text{Concave}' : '\\text{Convexe}'

    const ligneFSeconde = [
      'Line',
      20,
      '',
      10,
      signeExterieur,
      20,
      'z',
      20,
      signeInterieur,
      20,
      'z',
      20,
      signeExterieur,
      10,
    ]
    const ligneConvexite = [
      'Line',
      20,
      '',
      10,
      `$${convexiteExterieure}$`,
      30,
      't',
      20,
      `$${convexiteInterieure}$`,
      30,
      't',
      20,
      `$${convexiteExterieure}$`,
      30,
    ]
    const tableau = tableauDeVariation({
      tabInit: [
        [
          ['$x$', 2, 20],
          ["$f''(x)$", 2, 35],
          ['$\\text{Convexité de }f$', 2.5, 80],
        ],
        [
          '$-\\infty$',
          25,
          `$${texNombre(racine1)}$`,
          25,
          `$${texNombre(racine2)}$`,
          25,
          '$+\\infty$',
          25,
        ],
      ],
      tabLines: [ligneFSeconde, ligneConvexite],
      espcl: 5,
      deltacl: 0.8,
      lgt: 5.8,
      scale: 1,
      hauteurLignes: [18, 18, 18],
    })

    const intervalleGauche = `\\left]-\\infty\\,;\\,${texNombre(racine1)}\\right]`
    const intervalleCentral = `[${texNombre(racine1)}\\,;\\,${texNombre(racine2)}]`
    const intervalleDroit = `\\left[${texNombre(racine2)}\\,;\\,+\\infty\\right[`
    const intervallesExterieurs = `${intervalleGauche}\\cup${intervalleDroit}`

    this.listeQuestions[0] = `On considère la fonction $f$ définie sur $\\mathbb R$ par
    $f(x)=\\left(${p.toLatex()}\\right)\\mathrm e^x$. On note $\\mathcal C_f$ sa courbe représentative.<br><br>
    Étudier la convexité de la fonction $f$ sur $\\mathbb R$, puis déterminer si la courbe $\\mathcal C_f$ admet des points d'inflexion et, le cas échéant, donner leurs coordonnées.`

    this.listeCorrections[0] = `On reconnaît un produit $f=uv$ avec
    $u(x)=${p.toLatex()}$ et $v(x)=\\mathrm e^x$.<br>Ces deux fonctions sont dérivables sur $\\mathbb R$. On a alors
    $u'(x)=${pPrime.toLatex()}$ et $v'(x)=\\mathrm e^x$.<br>
    On utilise la formule $(uv)'=u'v+uv'$ :<br><br>
    $\\begin{aligned}
    f'(x)&=\\left(${pPrime.toLatex()}\\right)\\mathrm e^x+\\left(${p.toLatex()}\\right)\\mathrm e^x\\\\
    &=\\left(${polynomeFPrime.toLatex()}\\right)\\mathrm e^x.
    \\end{aligned}$<br>
    Pour calculer $f''$, on reconnaît à nouveau un produit $f'=uv$ avec
    $u(x)=${polynomeFPrime.toLatex()}$ et $v(x)=\\mathrm e^x$.<br>
    On a $u'(x)=${polynomeFPrime.derivee().toLatex()}$ et $v'(x)=\\mathrm e^x$. On applique à nouveau la formule $(uv)'=u'v+uv'$ :<br><br>
    $\\begin{aligned}
    f''(x)&=\\left(${polynomeFPrime.derivee().toLatex()}\\right)\\mathrm e^x+\\left(${polynomeFPrime.toLatex()}\\right)\\mathrm e^x\\\\
    &=\\left(${polynomeFSeconde.toLatex()}\\right)\\mathrm e^x.
    \\end{aligned}$<br>
    Pour tout réel $x$, $\\mathrm e^x>0$. Ainsi, $f''(x)$ est du signe du polynôme $${polynomeFSeconde.toLatex()}$.<br>
    On calcule le discriminant du polynôme du second degré $${polynomeFSeconde.toLatex()}$ :<br><br>
    $\\begin{aligned}
    \\Delta&=${ecritureParentheseSiNegatif(coefficientTrinomeX)}^2-4\\times${ecritureParentheseSiNegatif(coefficientDominant)}\\times${ecritureParentheseSiNegatif(constanteTrinome)}\\\\
    &=${texNombre(discriminant)}.
    \\end{aligned}$<br>
    Comme $\\Delta>0$, ce polynôme admet deux racines :<br><br>
    $\\begin{aligned}
    x_1&=\\dfrac{-${ecritureParentheseSiNegatif(coefficientTrinomeX)}-\\sqrt{${texNombre(discriminant)}}}{2\\times${ecritureParentheseSiNegatif(coefficientDominant)}}=${texNombre(racineAvecMoins)},\\\\
    x_2&=\\dfrac{-${ecritureParentheseSiNegatif(coefficientTrinomeX)}+\\sqrt{${texNombre(discriminant)}}}{2\\times${ecritureParentheseSiNegatif(coefficientDominant)}}=${texNombre(racineAvecPlus)}.
    \\end{aligned}$<br>
    Ce polynôme est du signe de son coefficient dominant $${texNombre(coefficientDominant)}$ à l'extérieur de ses racines.<br>
    On obtient le tableau récapitulatif suivant :<br><br>
    ${tableau}<br>
    Ainsi, $f$ est ${texteEnCouleurEtGras(coefficientDominant > 0 ? 'convexe' : 'concave')} sur $${miseEnEvidence(intervallesExterieurs)}$ et ${texteEnCouleurEtGras(coefficientDominant > 0 ? 'concave' : 'convexe')} sur $${miseEnEvidence(intervalleCentral)}$.<br>
    La dérivée seconde s'annule et change de signe en $${texNombre(racine1)}$ et en $${texNombre(racine2)}$. La courbe $\\mathcal C_f$ admet donc deux points d'inflexion.<br>
    $\\begin{aligned}
    f(${texNombre(racine1)})&=${calculImage1}=${ordonnee1},\\\\
    f(${texNombre(racine2)})&=${calculImage2}=${ordonnee2}.
    \\end{aligned}$<br>
    Les points d'inflexion de la courbe $\\mathcal C_f$ ont donc pour coordonnées
    $I_1\\left(${miseEnEvidence(texNombre(racine1))}\\,;\\,${miseEnEvidence(ordonnee1)}\\right)$ et $I_2\\left(${miseEnEvidence(texNombre(racine2))}\\,;\\,${miseEnEvidence(ordonnee2)}\\right)$.`

    listeQuestionsToContenu(this)
  }
}
