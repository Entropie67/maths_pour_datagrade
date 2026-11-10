import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import RepereBuilder from '../../lib/2d/RepereBuilder'
import { tracePoint } from '../../lib/2d/TracePoint'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d, type Mathalea2dDisplay } from '../../modules/mathalea2d'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = 'pt6q3'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Déterminer l'équation d'une droite passant par l'origine"
export const dateDePublication = '04/07/2026'
export const dateDeModifImportante = '22/10/2026'

/**
 * @author Stéphane Guyon
 */
export default class AutoQ3PolynesieTechno2026 extends ExerciceQcmACourt {
  private creerFigure(xPoint: number, yPoint: number): string {
    const origine = pointAbstrait(0, 0)
    const point = pointAbstrait(xPoint, yPoint)
    const d = droite(origine, point)
    d.color = colorToLatexOrHTML('blue')
    d.epaisseur = 2
    const repere = new RepereBuilder({
      xMin: -1.2,
      xMax: xPoint + 1.2,
      yMin: -1.2,
      yMax: yPoint + 3.2,
    })
      .setGrille({ grilleX: { dx: 1 }, grilleY: { dy: 1 } })
      .setThickX({ xMin: -1, xMax: xPoint + 1, dx: 1 })
      .setThickY({ yMin: -1, yMax: yPoint + 3, dy: 1 })
      .setLabelsX([{ valeur: 1, texte: '1' }])
      .setLabelsY([{ valeur: 1, texte: '1' }])
      .buildCustom()
    const marquePoint = tracePoint(point, 'red')
    marquePoint.taille = 4
    marquePoint.epaisseur = 2

    return mathalea2d(
      Object.assign(
        { scale: 0.55, display: 'block' as Mathalea2dDisplay },
        fixeBordures([repere, d, marquePoint]),
      ),
      [repere, d, marquePoint],
    )
  }

  private appliquerLesValeurs(xPoint: number, yPoint: number): void {
    const coefficient = new FractionEtendue(yPoint, xPoint).simplifie()
    const equation = `y=${coefficient.texFractionSaufUn}x`
    const figure = this.creerFigure(xPoint, yPoint)

    this.enonce = `Dans un repère, on a tracé la droite passant par l'origine du repère de coordonnées $(0\\,;\\,0)$ et par le point de coordonnées $(${xPoint}\\,;\\,${yPoint})$.<br>
    ${figure}
    Une équation de la droite est :`

    this.reponses = [
      `$${equation}$`,
      `$y=${xPoint}x+${yPoint}$`,
      `$y=${yPoint}x+${xPoint}$`,
      '$y=x$',
    ]

    this.correction = `La droite passe par l'origine, donc son équation est de la forme $y=mx$.<br>
    Comme elle passe par le point $(${xPoint}\\,;\\,${yPoint})$, on a $${yPoint}=m\\times ${xPoint}$, donc $m=\\dfrac{${yPoint}}{${xPoint}}=${coefficient.texFractionSimplifiee}$.<br>
    Une équation de la droite est donc $${miseEnEvidence(equation)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(2, 6)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    const cas: [number, number][] = [
      [2, 4],
      [2, 6],
      [2, 8],
      [2, 10],
      [2, 12],
      [3, 6],
      [3, 3],
      [3, 9],
      [3, 12],
      [4, 4],
      [4, 8],
      [4, 12],
      [5, 10],
      [5, 5],
    ]
    let compteur = 0
    do {
      const [xPoint, yPoint] = choice(cas)
      this.appliquerLesValeurs(xPoint, yPoint)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /(?:L'équation réduite de la droite \$\(d\)\$|Une équation de la droite) est :\s*$/,
        this.interactif
          ? 'Une équation de la droite est '
          : 'Déterminer une équation de la droite.',
      )
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { egaliteExpression: true })
    this.clavierReponseCourte = KeyboardType.lyceeClassique
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
