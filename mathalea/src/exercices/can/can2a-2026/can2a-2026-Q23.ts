import { grille } from '../../../lib/2d/Grille'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { droite } from '../../../lib/2d/droites'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../../lib/2d/textes'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { bleuMathalea, orangeMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceCan from '../../ExerciceCan'
export const titre = "Déterminer le coefficient directeur d'une droite"
export const interactifReady = true

export const uuid = '0r9uf'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2a2026Q23 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  enonce(xA?: number, yA?: number, deltaX?: number, deltaY?: number): void {
    if (xA == null || yA == null || deltaX == null || deltaY == null) {
      // Cas prédéfinis pour l'aléatoire
      const casValides: [number, number, number, number][] = [
        [-3, 0, 2, 1], // m = 1/2
        [-3, 0, 2, -1], // m = -1/2
        [-3, 1, 3, 1], // m = 1/3
        [-3, 1, 3, -1], // m = -1/3
        [-3, 1, 3, 2], // m = 2/3
        [-3, 0, 3, -2], // m = -2/3
        [-2, 0, 4, 1], // m = 1/4
        [-2, 0, 4, -1], // m = -1/4
        [-3, 0, 5, -2], // m = -2/5
        [-3, -1, 5, 2], // m = 2/5
        [-3, 0, 4, -3], // m = -3/4
        [-2, -1, 4, 3], // m = 3/4
      ]

      const cas = choice(casValides)
      xA = cas[0]
      yA = cas[1]
      deltaX = cas[2]
      deltaY = cas[3]
    }

    const xB = xA + deltaX
    const yB = yA + deltaY

    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsDeComparaison = {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    }

    const A = pointAbstrait(xA, yA)
    const B = pointAbstrait(xB, yB)
    const Bx = pointAbstrait(xB, yA)
    const sABx = segment(A, Bx)
    const sBBx = segment(B, Bx)
    const m = new FractionEtendue(deltaY, deltaX)
    sBBx.epaisseur = 2
    sBBx.pointilles = 5
    sABx.epaisseur = 2
    sABx.pointilles = 5

    const lA = latex2d('A', xA + 0.1, yA + 0.5, {
      color: 'black',
      backgroundColor: '',
      letterSize: 'normalsize',
    })
    const traceA = tracePoint(A, 'black')
    traceA.taille = 3
    traceA.epaisseur = 2

    const lB = latex2d('B', xB + 0.1, yB + 0.5, {
      color: 'black',
      backgroundColor: '',
      letterSize: 'normalsize',
    })
    const traceB = tracePoint(B, 'black')
    traceB.taille = 2
    traceB.epaisseur = 2

    let lABx
    if (deltaY > 0) {
      lABx = latex2d(`${deltaX}`, milieu(A, Bx).x, yA - 0.3, {
        color: 'red',
        backgroundColor: '',
        letterSize: 'scriptsize',
      })
    } else {
      lABx = latex2d(`${deltaX}`, milieu(A, Bx).x, yA + 0.3, {
        color: 'red',
        backgroundColor: '',
        letterSize: 'scriptsize',
      })
    }
    const lBBx = latex2d(`${deltaY}`, xB + 0.5, milieu(B, Bx).y, {
      color: bleuMathalea,
      backgroundColor: '',
      letterSize: 'scriptsize',
    })

    const d = droite(A, B, '', 'black')
    d.epaisseur = 2

    // Grille 8×8 bien centrée
    const xmin = -4
    const ymin = -4
    const xmax = 4.05
    const ymax = 4.05

    const laGrille = grille(xmin, ymin, xmax, ymax, 'gray', 1, 1)

    // Vecteurs de base i et j en haut à droite
    const origineBase = pointAbstrait(3, 2) // <-- On a remplacé -2 par 2 pour la hauteur (y)

    // Remplacement de vecteur().represente() par un segment avec flèche
    const ptI = pointAbstrait(origineBase.x + 1, origineBase.y)
    const vecI = segment(origineBase, ptI, 'black')
    vecI.styleExtremites = '->'
    vecI.epaisseur = context.isHtml ? 2 : 1

    const labelI = latex2d(
      '\\vec{\\imath}',
      origineBase.x + 0.5,
      origineBase.y - 0.4,
      {
        color: 'black',
        backgroundColor: '',
        letterSize: 'normalsize',
      },
    )

    const ptJ = pointAbstrait(origineBase.x, origineBase.y + 1)
    const vecJ = segment(origineBase, ptJ, 'black')
    vecJ.styleExtremites = '->'
    vecJ.epaisseur = context.isHtml ? 2 : 1

    const labelJ = latex2d(
      '\\vec{\\jmath}',
      origineBase.x - 0.4,
      origineBase.y + 0.5,
      {
        color: 'black',
        backgroundColor: '',
        letterSize: 'normalsize',
      },
    )

    const objet = mathalea2d(
      {
        xmin,
        xmax,
        ymin,
        ymax,
        pixelsParCm: 28,
        scale: 0.65,
        center: !context.isHtml,
      },
      laGrille,
      d,
      traceA,
      lA,
      lB,
      traceB,
      vecI,
      vecJ,
      labelI,
      labelJ,
    )

    const objetC = mathalea2d(
      {
        xmin,
        xmax,
        ymin,
        ymax,
        pixelsParCm: 28,
        scale: 0.65,
        center: !context.isHtml,
      },
      laGrille,
      d,
      traceA,
      lA,
      lB,
      traceB,
      sABx,
      sBBx,
      lABx,
      lBBx,
      vecI,
      vecJ,
      labelI,
      labelJ,
    )

    this.question = 'Coefficient directeur de la droite $(AB)$.<br>'
    this.question += `${objet}`
    this.optionsChampTexte = { texteAvant: '' }

    this.correction = `Le coefficient directeur $m$ de la droite $(AB)$ est donné par :<br><br>
    $m=\\dfrac{\\text{déplacement vertical}}{\\text{déplacement horizontal}}=\\dfrac{${miseEnEvidence(deltaY, bleuMathalea)}}{${miseEnEvidence(deltaX, 'red')}}${m.estIrreductible && m.num * m.den > 0 ? `=${miseEnEvidence(m.texFraction)}` : m.texSimplificationAvecEtapes(false, orangeMathalea)}$.<br><br>`
    this.correction += `${objetC}`

    this.canEnonce = `Coefficient directeur de la droite $(AB)$.<br>${objet}`

    this.reponse = m.texFractionSimplifiee
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) this.enonce(-3, 1, 3, -2)
    else this.enonce()
  }
}
