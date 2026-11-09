import { afficheMesureAngle } from '../../../lib/2d/AfficheMesureAngle'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../../lib/2d/polygones'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { degCos, degSin } from '../../../lib/mathFonctions/radToDeg'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceCan from '../../ExerciceCan'

export const titre =
  'Calculer un angle dans un triangle connaissant les deux autres'
export const interactifReady = true

export const uuid = 'e9ly4'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * @author Gilles Mora

*/
export default class Can52026Q19 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
    this.optionsChampTexte = { texteApres: '$^\\circ$' }
  }

  enonce(angleD?: number, angleF?: number) {
    if (angleD == null || angleF == null) {
      // Configurations [angleD, angleF] avec somme < 180°
      const listeCas = [
        [75, 50], // angleE = 55°
        [65, 45], // angleE = 70°
        [45, 75], // angleE = 60°
        [45, 65], // angleE = 70°
        [75, 45], // angleE = 60°
        [70, 55], // angleE = 55°
        [65, 60], // angleE = 55°
      ]
      const cas = choice(listeCas)
      angleD = cas[0]
      angleF = cas[1]
    }

    const angleE = 180 - angleD - angleF

    // Construction du triangle avec les vrais angles
    // D en bas à gauche, F en bas à droite, E en haut
    const D = pointAbstrait(0, 0, 'D')
    const F = pointAbstrait(5, 0, 'F')

    // Construction géométrique correcte de E
    // À partir de D, on trace un segment à l'angle angleD
    // À partir de F, on trace un segment à l'angle (180 - angleF)
    // E est à l'intersection
    const longueurDF = 5
    // On utilise la loi des sinus pour trouver la hauteur
    // sin(angleD)/longueurEF = sin(angleF)/longueurDE = sin(angleE)/longueurDF
    const hauteur =
      (longueurDF * degSin(angleD) * degSin(angleF)) / degSin(angleE)
    const distanceHorizontale =
      (longueurDF * degSin(angleD) * degCos(angleF)) / degSin(angleE)

    const E = pointAbstrait(distanceHorizontale, hauteur, 'E')

    const pol = polygoneAvecNom(D, F, E)
    const triangle = pol[0] // Le tracé du triangle
    const labels = pol[1] // Les labels des points

    // Affichage de l'angle en D (connu)
    const affAngleD = afficheMesureAngle(
      F,
      D,
      E,
      'black',
      0.8,
      `${angleD}^\\circ`,
    )

    // Affichage de l'angle en F (connu)
    const affAngleF = afficheMesureAngle(
      E,
      F,
      D,
      'black',
      0.8,
      `${angleF}^\\circ`,
    )

    // Affichage de l'angle cherché en E
    const affAngleE = afficheMesureAngle(D, E, F, 'black', 0.5, '?')

    this.reponse = angleE

    const xmin = Math.min(D.x, F.x, E.x) - 1
    const ymin = Math.min(D.y, F.y, E.y) - 1
    const xmax = Math.max(D.x, F.x, E.x) + 1
    const ymax = Math.max(D.y, F.y, E.y) + 1.5

    this.canEnonce = mathalea2d(
      {
        xmin,
        ymin,
        xmax,
        ymax,
        pixelsParCm: 20,
        mainlevee: false,
        amplitude: 0.3,
        scale: 0.7,
        center: !context.isHtml,
      },
      [triangle, labels, affAngleD, affAngleF, affAngleE],
    )

    this.question = this.canEnonce

    this.correction = `La somme des angles d'un triangle est égale à $180^\\circ$.<br>
Dans le triangle $DEF$, on a :<br>
$\\widehat{EDF}+\\widehat{DFE}+\\widehat{FED}=180^\\circ$<br>
$${angleD}^\\circ+${angleF}^\\circ+\\widehat{FED}=180^\\circ$<br>
$${angleD + angleF}^\\circ+\\widehat{FED}=180^\\circ$<br>
$\\widehat{FED}=180^\\circ-${angleD + angleF}^\\circ=${miseEnEvidence(angleE + '^\\circ')}$`

    this.canReponseACompleter = '$?=\\ldots^\\circ$'
    if (this.interactif) {
      this.question += '<br>$?=$'
    } else if (context.isHtml) {
      this.question += '<br>$?=\\ldots^\\circ$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(75, 50)
    else this.enonce()
  }
}
