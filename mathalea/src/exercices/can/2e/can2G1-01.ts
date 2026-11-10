import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { repere } from '../../../lib/2d/reperes'
import { texteParPosition } from '../../../lib/2d/textes'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { arrondi } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'

/** Fraction (numérateur/dénominateur déjà entiers) affichée telle quelle,
 * suivie de sa forme simplifiée quand elle n'est pas déjà irréductible. */
function texFractionAvecSimplification(
  numerateur: number,
  denominateur: number,
): string {
  const brut = `$\\dfrac{${numerateur}}{${denominateur}}$`
  const fraction = new FractionEtendue(numerateur, denominateur)
  if (fraction.estIrreductible) return brut
  return `${brut}, soit $${fraction.texFractionSimplifiee}$`
}
export const titre = "Lire les coordonnées d'un point dans un repère"
export const interactifReady = true

export const dateDePublication = '04/01/2023'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 *
*/
export const uuid = '21bc0'

export const refs = {
  'fr-fr': ['can2G1-01', '2G10-flash2'],
  'fr-ch': ['NR'],
}
export default class LectureCoordonnees extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.spacing = 1.5
  }

  nouvelleVersion() {
    const k2 = this.quotaChoice('k2', [3, 4, 5])
    const k1 = this.quotaChoice('k1', [3, 4, 5])
    const b = this.quotaRandint('b', -5, 5) / k2
    const a = this.quotaRandint('a', -8, 8) / k1
    const r = repere({
      xUnite: 1,
      yUnite: 1,
      xMin: -3,
      xMax: 3,
      yMin: -2,
      yMax: 2,
      thickHauteur: 0.1,
      yLabelEcart: 0.4,
      xLabelEcart: 0.3,
      xLabelMin: -2,
      yLabelMin: -1,
      xLabelMax: 2,
      yLabelMax: 1,
      axeXStyle: '->',
      axeYStyle: '->',
      grilleSecondaire: true,
      grilleSecondaireXDistance: 1 / k1,
      grilleSecondaireYDistance: 1 / k2,
      grilleSecondaireYMin: -2,
      grilleSecondaireYMax: 2,
      grilleSecondaireXMin: -3,
      grilleSecondaireXMax: 3,
    })

    const A = pointAbstrait(a, b)
    const o = texteParPosition('O', -0.2, -0.2, 0, 'black', 1)
    const traceA = tracePoint(A, 'red') // Variable qui trace les points avec une croix
    traceA.taille = 3
    traceA.epaisseur = 2
    this.question = 'Donner les coordonnées du point.<br>'
    this.question += mathalea2d(
      {
        xmin: -3,
        xmax: 3,
        ymin: -2,
        ymax: 2,
        scale: 1,
        pixelsParCm: 50,
        center: !context.isHtml,
      },
      r,
      o,
      traceA,
    )
    this.optionsChampTexte = {
      texteAvant: '<br>Écrire les coordonnées en respectant les notations :',
    }
    this.correction = "L'abscisse du point se lit sur l'axe horizontal.<br>"
    if (k1 === 3) {
      if (arrondi(a, 1) === arrondi(a, 0)) {
        this.correction += ` On lit $${texNombre(a, 2)}$.<br>`
      } else {
        this.correction += ` L'unité (sur l'axe des abscisses) est divisée en $${k1}$. <br>
      Le point a pour abscisse ${texFractionAvecSimplification(arrondi(a * k1, 0), k1)}.<br>`
      }
    } else {
      if (arrondi(a, 1) === arrondi(a, 0)) {
        this.correction += ` On lit $${texNombre(a, 2)}$.<br>`
      } else {
        this.correction += ` L'unité (sur l'axe des abscisses) est divisée en $${k1}$. <br>
      Le point a pour abscisse ${texFractionAvecSimplification(arrondi(a * k1, 0), k1)}.<br>`
      }
    }

    this.correction += "L'ordonnée du point se lit sur l'axe vertical.<br>"
    if (k2 === 3) {
      if (arrondi(b, 1) === arrondi(b, 0)) {
        this.correction += ` On lit $${texNombre(b, 2)}$.<br>`
      } else {
        this.correction += ` L'unité (sur l'axe des ordonnées) est divisée en $${k2}$. <br>
      Le point a pour ordonnée ${texFractionAvecSimplification(arrondi(b * k2, 0), k2)}.<br>`
      }
    } else {
      if (arrondi(b, 1) === arrondi(b, 0)) {
        this.correction += ` On lit $${texNombre(b, 2)}$.<br>`
      } else {
        this.correction += ` L'unité (sur l'axe des ordonnées) est divisée en $${k2}$. <br>
      Le point a pour ordonnée ${texFractionAvecSimplification(arrondi(b * k2, 0), k2)}.<br>`
      }
    }

    const abscisseFinale =
      arrondi(a, 1) === arrondi(a, 0)
        ? texNombre(a, 2)
        : new FractionEtendue(arrondi(a * k1, 0), k1).texFractionSimplifiee
    const ordonneeFinale =
      arrondi(b, 1) === arrondi(b, 0)
        ? texNombre(b, 2)
        : new FractionEtendue(arrondi(b * k2, 0), k2).texFractionSimplifiee
    this.correction += `Les coordonnées du point sont donc $${miseEnEvidence(`\\left(${abscisseFinale}\\,;\\,${ordonneeFinale}\\right)`)}$.`

    this.reponse = [
      `(\\dfrac{${arrondi(a * k1, 0)}}{${k1}};\\dfrac{${arrondi(b * k2, 0)}}{${k2}})`,
      `(${arrondi(a, 2)};${arrondi(b, 2)})`,
      `(\\dfrac{${arrondi(a * k1, 0)}}{${k1}};${arrondi(b, 2)})`,
      `(${arrondi(a, 2)};\\dfrac{${arrondi(b * k2, 0)}}{${k2}})`,
    ]
  }
}
