import { repere } from '../../../lib/2d/reperes'
import { texteParPosition } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { Spline, spline } from '../../../lib/mathFonctions/Spline'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceCan from '../../ExerciceCan'
export const titre =
  "Donner le nombre de solutions de l'équation $f'(x)=0$ à partir de la courbe représentative de $f$"
export const interactifReady = true

export const uuid = '3smhm'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can1a2026Q21 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { nombreDecimalSeulement: true }
  }

  maSpline!: Spline

  enonce(
    noeudsChoisis?: Array<{
      x: number
      y: number
      deriveeGauche: number
      deriveeDroit: number
      isVisible: boolean
    }>,
  ): void {
    const noeuds1 = [
      { x: -2, y: -1, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: 0, y: 2, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 2, y: -3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 4, y: 1, deriveeGauche: 2, deriveeDroit: 2, isVisible: true },
    ]

    const noeuds2 = [
      { x: -2, y: -2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: -1, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 0, y: 0, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 2, y: 2, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 4, y: -1, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
    ]

    const noeuds3 = [
      { x: -2, y: -2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: -1, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 0, y: 0, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 1, y: 2, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 3, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 4, y: 2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
    ]

    let nuage: Array<{
      x: number
      y: number
      deriveeGauche: number
      deriveeDroit: number
      isVisible: boolean
    }>

    if (noeudsChoisis != null) {
      nuage = noeudsChoisis
    } else {
      const mesFonctions = [noeuds1, noeuds2, noeuds3]
      const coeffX = choice([-1, 1])
      const coeffY = choice([-1, 1])
      const deltaX = randint(-2, 2)
      const deltaY = randint(-2, 2)
      const choix = choice(mesFonctions)
      nuage = choix.map((noeud) => ({
        x: (noeud.x + deltaX) * coeffX,
        y: (noeud.y + deltaY) * coeffY,
        deriveeGauche: noeud.deriveeGauche * coeffX * coeffY,
        deriveeDroit: noeud.deriveeDroit * coeffX * coeffY,
        isVisible: noeud.isVisible,
      }))
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
      ajouteNoeuds: true,
      optionsNoeuds: {
        color: bleuMathalea,
        taille: 2,
        style: 'x',
        epaisseur: 2,
      },
      color: bleuMathalea,
    })
    const objetsEnonce = [repere1, courbe1]

    const xMin = Math.min(...nuage.map((n) => n.x))
    const xMax = Math.max(...nuage.map((n) => n.x))

    const graphique = mathalea2d(
      Object.assign(
        { pixelsParCm: 30, scale: 0.65, center: !context.isHtml },
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

    this.optionsChampTexte = { texteAvant: '<br>', texteApres: '' }

    const extrema = nuage.filter((el) => el.deriveeGauche === 0)
    this.reponse = String(extrema.length)

    this.question =
      `Voici la représentation d'une fonction $f$ définie sur $[${xMin}\\,;\\,${xMax}]$.<br>` +
      graphique +
      `<br>Le nombre de solutions de l'équation $f'(x)=0$ est :`
    if (!this.interactif) {
      this.question += ' $\\ldots$'
    }
    this.correction = `On retrouve le nombre de solutions de l'équation $f'(x)=0$ en comptant le nombre de points en lesquels la tangente à la courbe est horizontale.<br>
     En parcourant la courbe, on constate qu'il y a $${miseEnEvidence(this.reponse)}$ ${extrema.length <= 1 ? 'tangente horizontale' : 'tangentes horizontales'} (au niveau des changements de variations),
     donc l'équation $f'(x)=0$ admet $${miseEnEvidence(this.reponse)}$ ${extrema.length <= 1 ? 'solution' : 'solutions'}.`

    this.canEnonce =
      `Voici la représentation d'une fonction $f$ définie sur $[${xMin}\\,;\\,${xMax}]$.<br>` +
      graphique
    this.canReponseACompleter =
      "Le nombre de solutions de l'équation $f'(x)=0$ est : $\\ldots$."
  }

  nouvelleVersion(): void {
    if (this.canOfficielle) {
      this.enonce([
        { x: -6, y: 3, deriveeGauche: -6, deriveeDroit: -6, isVisible: false },
        { x: -5.5, y: 0, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
        { x: -4, y: 3, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
        { x: -2, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
        { x: -1, y: 2, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
        { x: 0, y: -1, deriveeGauche: -3, deriveeDroit: -3, isVisible: false },
      ])
    } else {
      this.enonce()
    }
  }
}
