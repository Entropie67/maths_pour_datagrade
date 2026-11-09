import { fixeBordures } from '../../lib/2d/fixeBordures'
import RepereBuilder from '../../lib/2d/RepereBuilder'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d, type Mathalea2dDisplay } from '../../modules/mathalea2d'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '9efa5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Déterminer graphiquement l'équation réduite d'une droite"
export const dateDePublication = '29/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Jean-Claude Lhote
 *
 */
export default class AutoQ7AGt2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    abscisseAOrigine: number,
    ordonneeAOrigine: number,
  ): void {
    const coefficientDirecteur = -ordonneeAOrigine / abscisseAOrigine
    const coeffBis = -abscisseAOrigine / ordonneeAOrigine
    const sol = `y=${texNombre(coefficientDirecteur, 2)}x+${texNombre(ordonneeAOrigine, 2)}`
    const dist1 = `y=${texNombre(coefficientDirecteur, 2)}x${ecritureAlgebrique(abscisseAOrigine)}`
    const dist2 = `y=${texNombre(coeffBis, 2)}x+${texNombre(ordonneeAOrigine, 2)}`
    const dist3 = `y=${texNombre(coeffBis, 2)}x${ecritureAlgebrique(abscisseAOrigine)}`

    // Bornes du cadre de tracé
    const xmin = -6
    const xmax = 7
    const ymin = -1
    const ymax = 5
    const clamp = (v: number, lo: number, hi: number) =>
      Math.max(lo, Math.min(hi, v))

    // Points d'intersection de la droite y = m x + p avec le cadre : on trace
    // uniquement le segment visible, pour ne jamais déborder de la fenêtre.
    const p = ordonneeAOrigine
    const pts: Array<[number, number]> = []
    const yGauche = coefficientDirecteur * xmin + p
    if (yGauche >= ymin && yGauche <= ymax) pts.push([xmin, yGauche])
    const yDroite = coefficientDirecteur * xmax + p
    if (yDroite >= ymin && yDroite <= ymax) pts.push([xmax, yDroite])
    if (coefficientDirecteur !== 0) {
      const xBas = (ymin - p) / coefficientDirecteur
      if (xBas > xmin && xBas < xmax) pts.push([xBas, ymin])
      const xHaut = (ymax - p) / coefficientDirecteur
      if (xHaut > xmin && xHaut < xmax) pts.push([xHaut, ymax])
    }
    pts.sort((u, v) => u[0] - v[0])
    const P1 = pts[0]
    const P2 = pts[pts.length - 1]

    const d = segment(P1[0], P1[1], P2[0], P2[1], 'red')
    d.epaisseur = 1.5

    // Étiquette (d) : près de l'extrémité haute du segment, mais gardée dans le cadre
    const haut = P1[1] >= P2[1] ? P1 : P2
    const bas = P1[1] >= P2[1] ? P2 : P1
    const lx = clamp(
      haut[0] + 0.15 * (bas[0] - haut[0]) - 0.5,
      xmin + 0.3,
      xmax - 0.8,
    )
    const ly = clamp(
      haut[1] + 0.15 * (bas[1] - haut[1]),
      ymin + 0.3,
      ymax - 0.3,
    )
    const labelD = latex2d('(d)', lx, ly, { letterSize: 'small', color: 'red' })

    const x = latex2d('x', 6.5, -0.4, { letterSize: 'small' })
    const y = latex2d('y', -0.5, 4.8, { letterSize: 'small' })
    const rep = new RepereBuilder({
      xMin: -6,
      xMax: 7,
      yMin: -1,
      yMax: 5,
    })
      .setGrille({
        grilleX: { dx: 1 },
        grilleY: { dy: 1 },
      })
      .setThickX({ xMax: 6, xMin: -6, dx: 1 })
      .setThickY({ yMax: 4, yMin: -1, dy: 1 })
      .setLabelsX([{ valeur: 1, texte: '1' }])
      .setLabelsY([{ valeur: 1, texte: '1' }])
      .buildCustom()

    const objets = [rep, d, x, labelD, y]
    const figure = mathalea2d(
      Object.assign(
        { scale: 0.5, display: 'block' as Mathalea2dDisplay },
        fixeBordures([rep, x, labelD, y], {
          rxmin: 0,
          rxmax: 0,
          rymin: 0,
          rymax: 0,
        }),
      ),
      objets,
    )

    this.reponses = [sol, dist1, dist2, dist3].map((x) => `$${x}$`)
    this.enonce = `Dans le repère ci-dessous, on a représenté une droite $(d)$ :<br>
    ${figure}
    L'équation réduite de cette droite est :<br>`

    this.correction = `La droite $(d)$ passe par les points $A(${texNombre(abscisseAOrigine, 2)};0)$ et $B(0;${texNombre(ordonneeAOrigine, 2)})$.<br>
    Son coefficient directeur est donc :<br>
    $a=\\dfrac{y_B-y_A}{x_B-x_A}=\\dfrac{${texNombre(ordonneeAOrigine, 2)}-0}{0-${ecritureParentheseSiNegatif(-abscisseAOrigine)}}=\\dfrac{${texNombre(ordonneeAOrigine, 2)}}{${ecritureAlgebrique(-abscisseAOrigine)}}=${texNombre(coefficientDirecteur, 2)}$<br>
   Son ordonnée à l'origine est : $y_B=${ordonneeAOrigine}$<br>
    L'équation réduite de la droite $(d)$ est donc :<br>
    $${miseEnEvidence(`y=${texNombre(coefficientDirecteur, 2)}x+${texNombre(ordonneeAOrigine, 2)}`)}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(4, 2)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const abs = choice([2, 4, -2, -4, 5, -5])
      const ord = choice([1, 2, 4], Math.abs(abs))
      this.appliquerLesValeurs(abs, ord)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /L'équation réduite de cette droite est :<br>\s*$/,
        "Déterminer l'équation réduite de la droite $(d)$.",
      )
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { egaliteExpression: true })
    this.clavierReponseCourte = KeyboardType.lyceeClassique
  }
}
