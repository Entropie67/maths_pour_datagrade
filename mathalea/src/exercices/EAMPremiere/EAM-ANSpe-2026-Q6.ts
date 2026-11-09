import { droite } from '../../lib/2d/droites'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { milieu } from '../../lib/2d/utilitairesPoint'
import { deuxColonnes } from '../../lib/format/miseEnPage'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'
import { choice } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const uuid = '1dabe'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Déterminer l'équation d'une droite à partir de son graphique"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ6ANs2026 extends ExerciceQcmACourt {
  // abscisseZero : abscisse du point où la droite coupe l'axe des x (2, 3, 4 ou 5)
  // ordonneeOrigine : ordonnée à l'origine (10, 15, 20, 25 ou 30)
  // pasY : graduation / pas de grille sur l'axe des ordonnées (5 ou 10)
  private genererExercice(
    abscisseZero: number,
    ordonneeOrigine: number,
    pasY: number,
  ): void {
    const a = abscisseZero
    const b = ordonneeOrigine
    const m = -b / a

    const ux = 1
    const uy = b % 10 === 0 ? 0.1 : 0.2
    const P = (x: number, y: number) => pointAbstrait(x * ux, y * uy)

    const A = P(0, b)
    const B = P(a, 0)

    // Variables pour tracer le chemin de gauche à droite
    let P1, P2, PCorner
    let deltaX: number, deltaY: number
    let ptDep: string, ptArr: string

    if (a > 0) {
      // Si a est positif, A(0,b) est à gauche et B(a,0) est à droite (droite descendante)
      P1 = A
      P2 = B
      PCorner = P(a, b)
      deltaX = a
      deltaY = -b
      ptDep = 'A'
      ptArr = 'B'
    } else {
      // Si a est négatif, B(a,0) est à gauche et A(0,b) est à droite (droite montante, comme sur l'image)
      P1 = B
      P2 = A
      PCorner = P(0, 0)
      deltaX = -a
      deltaY = b
      ptDep = 'B'
      ptArr = 'A'
    }

    // Bornes en unités mathématiques dynamiques
    const xMinMath = Math.min(-2, a - 1)
    const xMaxMath = Math.max(5, a + 1)
    const yMinMath = -10
    const yMaxMath = b % 10 === 0 ? 40 : 45

    // Fenêtre mathalea2d en unités "écran"
    const xmin = xMinMath * ux
    const xmax = xMaxMath * ux
    const ymin = -10 * uy
    const ymax = yMaxMath * uy

    const o = latex2d('0', -0.3, -0.3, { letterSize: 'scriptsize' })

    const d = droite(A, B, '', 'red')
    d.epaisseur = 2.5

    const r1 = repere({
      xMin: xMinMath,
      xMax: xMaxMath,
      xUnite: ux,
      yMin: yMinMath,
      yMax: yMaxMath,
      yUnite: uy,
      thickHauteur: 0.1,
      xThickDistance: 1,
      yThickDistance: 10,
      xThickMin: xMinMath + 1,
      xThickMax: xMaxMath - 1,
      yThickMin: 10,
      yThickMax: Math.floor(yMaxMath / 10) * 10,
      xLabelDistance: 1,
      yLabelDistance: 10,
      xLabelMin: xMinMath + 1,
      xLabelMax: xMaxMath - 1,
      yLabelMin: 10,
      yLabelMax: Math.floor(yMaxMath / 10) * 10,
      axeXStyle: '->',
      axeYStyle: '->',
      yLabelEcart: 0.5,
      grilleSecondaire: false,
      grilleSecondaireXDistance: 1,
      grilleSecondaireYDistance: 5,
      grilleSecondaireOpacite: 0.5,
      grilleSecondaireXMin: xMinMath,
      grilleSecondaireXMax: xMaxMath,
      grilleSecondaireYMin: yMinMath,
      grilleSecondaireYMax: yMaxMath,
    })

    const traceA = tracePoint(A, 'black')
    traceA.taille = 3
    traceA.epaisseur = 2
    const traceB = tracePoint(B, 'black')
    traceB.taille = 3
    traceB.epaisseur = 2

    const objet = mathalea2d(
      {
        xmin: xmin - 0.1,
        xmax: xmax + 0.5,
        ymin,
        ymax,
        pixelsParCm: b % 10 === 0 ? 40 : 30,
        scale: 0.7,
        center: !context.isHtml,
      },
      r1,
      d,
      traceA,
      traceB,
      o,
    )

    const sHoriz = segment(P1, PCorner)
    sHoriz.epaisseur = 2
    sHoriz.pointilles = 5
    const sVert = segment(PCorner, P2)
    sVert.epaisseur = 2
    sVert.pointilles = 5

    // Positionnement dynamique des labels de correction
    const decB = a > 0 ? 0.2 : -0.4

    // Modification des décalages pour répondre à la demande :
    // Quand la droite monte (a<0), on veut +deltaX au-dessus et +deltaY à DROITE.
    // Quand la droite descend (a>0), on ne change rien (par défaut, ils sont déjà à l'extérieur : au-dessus et à DROITE).
    const decYHoriz = 0.4 // Toujours au-dessus du segment horizontal
    const decXVert = 0.3 // Toujours à droite du segment vertical

    const lA = latex2d('A', 0.2, b * uy + 0.4, { letterSize: 'scriptsize' })
    const lB = latex2d('B', a + decB, 0.5, { letterSize: 'scriptsize' })

    const lHoriz = latex2d(
      `+${deltaX}`,
      milieu(P1, PCorner).x,
      milieu(P1, PCorner).y + decYHoriz,
      {
        color: 'red',
        letterSize: 'scriptsize',
      },
    )
    const lVertStr = deltaY > 0 ? `+${deltaY}` : `${deltaY}`
    const lVert = latex2d(
      lVertStr,
      PCorner.x + decXVert,
      milieu(PCorner, P2).y,
      {
        color: 'blue',
        letterSize: 'scriptsize',
      },
    )

    const objetC = mathalea2d(
      {
        xmin: xmin - 0.1,
        xmax: xmax + 0.5,
        ymin,
        ymax,
        pixelsParCm: 30,
        scale: 0.7,
        center: !context.isHtml,
      },
      r1,
      d,
      sHoriz,
      sVert,
      traceA,
      traceB,
      lA,
      lB,
      lHoriz,
      lVert,
      o,
    )

    this.enonce = `${deuxColonnes(
      `Soit $f$ une fonction affine dont on a tracé la représentation graphique dans le repère ci-contre.<br><br>
      Une expression algébrique de $f$ est :`,
      `${objet}`,
    )}`

    const penteInverse = new FractionEtendue(-a, b)
    this.reponses = [
      `$f(x)=${reduireAxPlusB(m, b)}$`,
      `$f(x)=${reduireAxPlusB(m > 0 ? 1 : -1, b)}$`,
      `$f(x)=${reduireAxPlusB(b, a)}$`,
      `$f(x)=${penteInverse.texFractionSimplifiee}x+${b}$`,
    ]

    // Préparation du texte de correction
    const texteCorrection = `Attention, le repère n'est pas orthonormé : on lit les coordonnées des points, on ne compte pas les carreaux.<br>
La droite coupe l'axe des ordonnées en $A(0\\,;\\,${b})$ : l'ordonnée à l'origine est $${b}$.<br>
Elle coupe l'axe des abscisses en $B(${a}\\,;\\,0)$.<br>
On calcule à l'aide de la formule du coefficient directeur :<br>
$m=\\dfrac{y_${ptArr}-y_${ptDep}}{x_${ptArr}-x_${ptDep}}=\\dfrac{${miseEnEvidence(
      String(deltaY),
      'blue',
    )}}{${miseEnEvidence(String(deltaX), 'red')}}=${m}$<br>
    

On en déduit $${miseEnEvidence(`f(x)=${reduireAxPlusB(m, b)}`)}$.`

    this.correction = texteCorrection + '<br>' + `${objetC}`
  }

  versionOriginale: () => void = () => {
    this.genererExercice(3, 30, 10)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    const donnees = [
      [10, 2],
      [15, 3],
      [20, 2],
      [20, 4],
      [25, 5],
      [30, 3],
    ]
    const [b, absA] = choice(donnees)
    const a = choice([-1, 1]) * absA

    const pasY = b % 10 === 0 ? 10 : 5
    this.genererExercice(a, b, pasY)
  }

  constructor() {
    super()
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /Une expression algébrique de \$f\$ est :/,
        'Déterminer une expression algébrique de $f$.',
      )
    // La bonne réponse du QCM est de la forme « $f(x)=-5x+25$ » : on ne garde que le second membre
    this.reponseCourte = () =>
      this.reponses[0].replace(/^\$f\(x\)=/, '').replace(/\$$/, '')
    // Une expression réduite est attendue : ni calcul, ni forme développable non réduite
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, {
        expressionsForcementReduites: true,
      })
    this.texteAvantReponseCourte = '$f(x)=$'
    this.clavierReponseCourte = KeyboardType.lyceeClassique
    this.options = { vertical: true }
  }
}
