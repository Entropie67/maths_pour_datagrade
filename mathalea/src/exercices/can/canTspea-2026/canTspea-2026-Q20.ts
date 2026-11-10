import { repere } from '../../../lib/2d/reperes'
import { texteParPosition } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { Spline, spline } from '../../../lib/mathFonctions/Spline'
import { choice } from '../../../lib/outils/arrayOutils'
import { texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  "Déterminer le signe de $f(a)\\times f'(a)$ par lecture graphique"
export const interactifReady = true

export const uuid = 'gnx1c'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/ export default class Can2026TermQ20 extends ExerciceCan {
  maSpline!: Spline

  enonce(
    noeudsChoisis?: Array<{
      x: number
      y: number
      deriveeGauche: number
      deriveeDroit: number
      isVisible: boolean
    }>,
    xA?: number,
  ): void {
    const noeuds1 = [
      { x: -2, y: -1, deriveeGauche: 1, deriveeDroit: 1, isVisible: false },
      { x: 0, y: 2, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
      { x: 1.5, y: -3, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
      { x: 4, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
    ]

    const noeuds2 = [
      { x: -3, y: 2, deriveeGauche: -1, deriveeDroit: -1, isVisible: false },
      { x: -1, y: -2, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
      { x: 0, y: 1, deriveeGauche: 4, deriveeDroit: 4, isVisible: false },
      { x: 0.5, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
      { x: 1, y: 2, deriveeGauche: -3, deriveeDroit: -3, isVisible: false },
      { x: 3, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
    ]

    const noeuds3 = [
      { x: -4, y: -2, deriveeGauche: 3, deriveeDroit: 3, isVisible: false },
      { x: -2, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
      { x: 0, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
      { x: 2, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
    ]

    let nuage: Array<{
      x: number
      y: number
      deriveeGauche: number
      deriveeDroit: number
      isVisible: boolean
    }>

    if (noeudsChoisis != null && xA != null) {
      nuage = noeudsChoisis
    } else {
      const mesFonctions = [noeuds1, noeuds2, noeuds3]
      nuage = choice(mesFonctions)
      const theSplineTemp = spline(nuage)
      const xMin = Math.min(...nuage.map((n) => n.x))
      const xMax = Math.max(...nuage.map((n) => n.x))
      // On filtre les xA pour lesquels ni f(xA) ni f'(xA) ne sont nuls
      const candidats = []
      for (let x = xMin + 1; x <= xMax - 1; x++) {
        const fVal = theSplineTemp.image(x)
        const fPrime = theSplineTemp.derivee(x)
        if (Math.abs(fVal) > 0.3 && Math.abs(fPrime) > 0.3) {
          candidats.push(x)
        }
      }
      xA = choice(candidats)
    }

    const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
    const theSpline = spline(nuage)
    this.maSpline = theSpline
    const bornes = theSpline.trouveMaxes()
    const repere1 = repere({
      xMin: bornes.xMin - 1,
      xMax: bornes.xMax + 1,
      yMin: bornes.yMin - 1,
      yMax: bornes.yMax + 1,
      grilleX: false,
      grilleY: false,
      grilleSecondaire: true,
      grilleSecondaireYDistance: 1,
      grilleSecondaireXDistance: 1,
      grilleSecondaireYMin: bornes.yMin - 1,
      grilleSecondaireYMax: bornes.yMax + 1,
      grilleSecondaireXMin: bornes.xMin - 1,
      grilleSecondaireXMax: bornes.xMax + 1,
    })
    const courbe1 = theSpline.courbe({
      epaisseur: 1.5,
      ajouteNoeuds: false,
      color: bleuMathalea,
    })
    const labelCf = texteParPosition(
      '$C_f$',
      bornes.xMin + 0.5,
      bornes.yMax,
      0,
      bleuMathalea,
      1.2,
    )
    const objetsEnonce = [repere1, courbe1, labelCf]

    const graphique = mathalea2d(
      Object.assign(
        { pixelsParCm: 30, scale: 0.75, center: !context.isHtml },
        {
          xmin: bornes.xMin - 1,
          ymin: bornes.yMin - 1,
          xmax: bornes.xMax + 1,
          ymax: bornes.yMax + 1,
        },
      ),
      objetsEnonce,
      o,
    )

    const fA = theSpline.image(xA!)
    const fPrimeA = theSpline.derivee(xA!)
    const produit = fA * fPrimeA
    const estPositif = produit >= 0

    const signeFa = fA > 0 ? 'positif' : fA < 0 ? 'négatif' : 'nul'
    const signeFPrimeA =
      fPrimeA > 0
        ? 'positive (fonction croissante)'
        : fPrimeA < 0
          ? 'négative (fonction décroissante)'
          : 'nulle'

    const enonce =
      `Donner le signe de $f(${xA})\\times f'(${xA})$.<br>` + graphique

    this.formatInteractif = 'qcm'
    this.autoCorrection[0] = {
      options: { ordered: true, vertical: !context.isHtml },
      enonce,
      propositions: [
        {
          texte: ' Positif ',
          statut: estPositif,
        },
        {
          texte: ' Négatif ',
          statut: !estPositif,
        },
      ],
    }
    const qcm = propositionsQcm(this, 0)

    this.question = enonce + qcm.texte
    this.correction = `Par lecture graphique :<br>
    $\\bullet$ $f(${xA})$ est ${signeFa} (on lit l'ordonnée du point de la courbe d'abscisse $${xA}$).<br>
    $\\bullet$ $f'(${xA})$ est ${signeFPrimeA} en $x=${xA}$.<br>
    Le produit $f(${xA})\\times f'(${xA})$ est donc ${estPositif ? texteEnCouleurEtGras('positif') : texteEnCouleurEtGras('négatif')}.`

    this.canEnonce =
      `Donner le signe de $f(${xA})\\times f'(${xA})$.<br>` + graphique
    this.canReponseACompleter = 'Entourer la réponse : POSITIF / NÉGATIF'
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) {
      this.enonce(
        [
          {
            x: -4,
            y: 3,
            deriveeGauche: -3,
            deriveeDroit: -3,
            isVisible: false,
          },
          {
            x: -2.5,
            y: 0.5,
            deriveeGauche: 0,
            deriveeDroit: 0,
            isVisible: false,
          },
          { x: 0, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
          {
            x: 2,
            y: -1,
            deriveeGauche: -1,
            deriveeDroit: -1,
            isVisible: false,
          },
        ],
        1,
      )
    } else {
      this.enonce()
    }
  }
}
