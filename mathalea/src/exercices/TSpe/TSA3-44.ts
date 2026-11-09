import { tableauDeVariation } from '../../lib/mathFonctions/etudeFonction'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { choice } from '../../lib/outils/arrayOutils'
import { texNombre } from '../../lib/outils/texNombre'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true
export const interactifType = 'mathLive'
export const titre = "Étudier la convexité d'une fonction polynôme"
export const dateDePublication = '17/08/2026'
export const uuid = 'b3475'

export const refs = {
  'fr-fr': ['TSA3-44', 'TCA7-44'],
  'fr-ch': [],
}

/**
 * Étudier la convexité d'une fonction polynôme de degré trois.
 * @author Stéphane Guyon
 */
export default class ConvexitePolynomeDegreTrois extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion(): void {
    const coefficientDominant = choice([-1, 1])
    const abscisseInflexion = randint(-2, 2)
    const ecartExtrema = randint(1, 2)
    const constante = randint(-5, 5)

    // Cette construction fournit un polynôme à coefficients entiers dont
    // l'abscisse du point d'inflexion est entière.
    const coefficientX2 = -3 * coefficientDominant * abscisseInflexion
    const coefficientX =
      3 * coefficientDominant * (abscisseInflexion ** 2 - ecartExtrema ** 2)
    const f = new Polynome({
      coeffs: [constante, coefficientX, coefficientX2, coefficientDominant],
    })
    const fPrime = f.derivee()
    const fSeconde = fPrime.derivee()
    const formeFactoriseeFSeconde = `${6 * coefficientDominant}${
      abscisseInflexion === 0
        ? 'x'
        : `(x${abscisseInflexion > 0 ? '-' : '+'}${Math.abs(abscisseInflexion)})`
    }`
    const imageInflexion = f.image(abscisseInflexion)
    const valeurRemplacee = ecritureParentheseSiNegatif(abscisseInflexion)
    const calculImageInflexion = `${coefficientDominant}\\times ${valeurRemplacee}^3${
      coefficientX2 === 0
        ? ''
        : `${ecritureAlgebrique(coefficientX2)}\\times ${valeurRemplacee}^2`
    }${
      coefficientX === 0
        ? ''
        : `${ecritureAlgebrique(coefficientX)}\\times ${valeurRemplacee}`
    }${ecritureAlgebrique(constante)}`

    const signeFSecondeGauche = coefficientDominant > 0 ? '-' : '+'
    const signeFSecondeDroit = coefficientDominant > 0 ? '+' : '-'
    const convexiteGauche =
      coefficientDominant > 0 ? '\\text{Concave}' : '\\text{Convexe}'
    const convexiteDroite =
      coefficientDominant > 0 ? '\\text{Convexe}' : '\\text{Concave}'

    const ligneFSeconde = [
      'Line',
      20,
      '',
      10,
      signeFSecondeGauche,
      20,
      'z',
      20,
      signeFSecondeDroit,
      10,
    ]
    const ligneConvexite = [
      'Line',
      20,
      '',
      10,
      `$${convexiteGauche}$`,
      30,
      't',
      20,
      `$${convexiteDroite}$`,
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
          `$${texNombre(abscisseInflexion)}$`,
          25,
          '$+\\infty$',
          25,
        ],
      ],
      tabLines: [ligneFSeconde, ligneConvexite],
      espcl: 6,
      deltacl: 0.8,
      lgt: 5.2,
      scale: 1,
      hauteurLignes: [18, 18, 18],
    })

    if (this.interactif) {
      this.listeQuestions[0] = `On considère la fonction $f$ définie sur $\\mathbb R$ par
      $f(x)=${f.toLatex()}$ et on note $\\mathcal{C}_f$ sa courbe représentative.<br><br>
      La courbe $\\mathcal{C}_f$ admet un unique point d'inflexion, noté $I$. Déterminer ses coordonnées :<br>
      ${remplisLesBlancs(this, 0, 'I\\left(%{champ1}\\,;\\,%{champ2}\\right)', KeyboardType.clavierDeBase)}`
    } else {
      this.listeQuestions[0] = `On considère la fonction $f$ définie sur $\\mathbb R$ par
    $f(x)=${f.toLatex()}$ et on note $\\mathcal{C}_f$ sa courbe représentative.<br><br>
    Étudier la convexité de la fonction $f$ sur $\\mathbb R$, puis déterminer les coordonnées de ses éventuels points d'inflexion de $\\mathcal{C}_f$.`
    }

    handleAnswers(this, 0, {
      champ1: { value: texNombre(abscisseInflexion) },
      champ2: { value: texNombre(imageInflexion) },
    })

    this.listeCorrections[0] = `La fonction $f$ est un polynôme, elle est donc deux fois dérivable sur $\\mathbb R$.<br>
    $\\begin{aligned}
    f'(x)&=${fPrime.toLatex()}\\\\
    f''(x)&=${fSeconde.toLatex()}\\\\
    &=${formeFactoriseeFSeconde}.
    \\end{aligned}$<br>
    La dérivée seconde s'annule en $x=${texNombre(abscisseInflexion)}$ et change de signe en cette valeur.<br>
    Elle est ${signeFSecondeGauche === '+' ? 'positive' : 'négative'} sur $]-\\infty\\,;\\,${texNombre(abscisseInflexion)}[$ et ${signeFSecondeDroit === '+' ? 'positive' : 'négative'} sur $]${texNombre(abscisseInflexion)}\\,;\\,+\\infty[$.<br>
    On en déduit le tableau récapitulatif suivant :<br><br>
    ${tableau}<br>
    Ainsi, $f$ est ${coefficientDominant > 0 ? 'concave' : 'convexe'} sur $]-\\infty\\,;\\,${texNombre(abscisseInflexion)}]$ et ${coefficientDominant > 0 ? 'convexe' : 'concave'} sur $[${texNombre(abscisseInflexion)}\\,;\\,+\\infty[$.<br>
    Comme $f''$ change de signe en $${texNombre(abscisseInflexion)}$, la courbe de $f$ admet un unique point d'inflexion d'abscisse $${texNombre(abscisseInflexion)}$. On calcule son ordonnée :<br>
    $\\begin{aligned}
    f(${texNombre(abscisseInflexion)})&=${calculImageInflexion}\\\\
    &=${texNombre(imageInflexion)}.
    \\end{aligned}$<br>
    Le point d'inflexion $I$ de la courbe $\\mathcal{C}_f$ a donc pour coordonnées $${miseEnEvidence(`I\\left(${texNombre(abscisseInflexion)}\\,;\\,${texNombre(imageInflexion)}\\right)`)}$.`

    listeQuestionsToContenu(this)
  }
}
