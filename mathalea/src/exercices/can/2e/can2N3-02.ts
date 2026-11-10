import { codageSegments } from '../../../lib/2d/CodageSegment'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import {
  segment,
  segmentAvecExtremites,
} from '../../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { bleuMathalea, orangeMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { pgcd } from '../../../lib/outils/primalite'
import { stringNombre } from '../../../lib/outils/texNombre'
import { fraction } from '../../../modules/fractions'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre =
  'Calculer le «\u00a0milieu\u00a0» entre $1$ et une fraction'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication sptembre 2021
 */
export const uuid = '5da59'

export const refs = {
  'fr-fr': ['can2N3-02'],
  'fr-ch': [],
}
export default class MilieuEntre1EtFraction extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1

    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = { fractionIrreductible: true }
  }

  nouvelleVersion() {
    const listeFractions1 = [
      [10, 3],
      [5, 4],
      [7, 4],
      [10, 7],
      [11, 7],
      [12, 7],
      [9, 7],
      [13, 7],
      [11, 8],
      [11, 9],
      [7, 6],
      [12, 11],
      [4, 3],
      [7, 5],
      [13, 7],
      [13, 9],
      [13, 11],
      [13, 12],
      [14, 11],
    ] // Couples de nombres premiers entre eux >1
    const fractionR = this.quotaChoice('fractionR', listeFractions1)
    const n = fractionR[0]
    const d = fractionR[1]
    // Ajouts par J-C
    const bonneFraction = fraction(n, d)
    const un = fraction(d, d)
    const unPlusBonneFraction = bonneFraction.sommeFraction(un)
    const half = fraction(1, 2)
    const resultat = unPlusBonneFraction.produitFraction(half)
    // Fin ajouts
    const A = pointAbstrait(0, 0, '1', 'below')
    const C = pointAbstrait(randint(8, 12), 0)
    const B = milieu(A, C, 'M', 'below')
    const objets = []
    objets.push(
      segmentAvecExtremites(A, B),
      segmentAvecExtremites(B, C),
      codageSegments('||', bleuMathalea, A, B, B, C),
    )
    objets.push(texteParPosition(`${stringNombre(1)}`, 0, -0.6))
    objets.push(texteParPosition(`${stringNombre(n)}`, C.x, C.y - 0.5))
    objets.push(
      segment(
        pointAbstrait(C.x - 0.3, C.y - 0.8),
        pointAbstrait(C.x + 0.3, C.y - 0.8),
      ),
    )
    objets.push(texteParPosition('M', B.x, B.y - 0.5))
    // objets.push(texteParPosition(`---`,C.x,C.y-0.7))
    objets.push(texteParPosition(`${stringNombre(d)}`, C.x, C.y - 1.1))
    // objets.push(latexParCoordonnees(fraction(n, d).texFraction, C.x, -1, 'black', 20, 20, 'white', 6))
    //, labelPoint(B)

    this.question = `Donner l'abscisse du point $M$ sous forme d’une fraction irréductible.<br>
    `
    this.question += mathalea2d(
      {
        xmin: -0.5,
        ymin: -2,
        xmax: C.x + 1,
        ymax: 1,
        pixelsParCm: 30,
        mainlevee: false,
        amplitude: 0.4,
        scale: 0.6,
        center: true,
      },
      objets,
    )
    /* Avant
    // this.correction = `On calcule la moyenne de $1$ et $${texFractionFromString(n, d)}$ :<br>
    $x_I=\\dfrac{1+${texFractionFromString(n, d)}}{2}=
    \\dfrac{${texFractionFromString(d, d)}+${texFractionFromString(n, d)}}{2}=
    ${texFractionFromString(n + d, d)}\\times \\dfrac{1}{2}=
      ${texFractionFromString(d + n, 2 * d)} ${simplificationDeFractionAvecEtapes(d + n, 2 * d)}$ <br><br>`
    this.correction += texteEnCouleur(` Mentalement : <br>
      On calcule d'abord  $1+${texFractionFromString(n, d)}$ en n'oubliant pas que $1=\\dfrac{${d}}{${d}}$, puis on multiplie le résultat par $\\dfrac{1}{2}$. `)

      this.reponse = texFractionReduite(d + n, 2 * d)
      */
    // Après
    this.correction = `On calcule la moyenne de $1$ et $${bonneFraction.texFraction}$ :<br>
    $x_M=\\dfrac{1+${bonneFraction.texFraction}}{2}=
    \\dfrac{${un.texFraction}+${bonneFraction.texFraction}}{2}=
        ${unPlusBonneFraction.texFraction}\\times ${half.texFraction}=
        ${pgcd(d + n, 2 * d) === 1 ? `${miseEnEvidence(resultat.texFraction)}` : `${resultat.texFraction}`} ${resultat.texSimplificationAvecEtapes(false, orangeMathalea)}$ <br><br>`
    this.correction += texteEnCouleur(` Mentalement : <br>
        On calcule d'abord $1+${bonneFraction.texFraction}$ en n'oubliant pas que $1=${un.texFraction}$, puis on multiplie le résultat par $${half.texFraction}$.`)

    this.reponse = resultat.simplifie()
  }
}
