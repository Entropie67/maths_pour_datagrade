import { repere } from '../../../lib/2d/reperes'
import { latex2d, texteParPosition } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { Spline, spline } from '../../../lib/mathFonctions/Spline'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Déterminer le nombre de solutions d'une équation"
export const interactifReady = true

export const uuid = '6c75e'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class Can2025TQ14 extends ExerciceSimple {
  spline!: Spline
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: 'solution(s)' }
  }

  nouvelleVersion() {
    const noeuds2 = [
      { x: -2, y: -1, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: 0, y: 2, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 2, y: -3, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 4, y: 1, deriveeGauche: 2, deriveeDroit: 2, isVisible: true },
    ]
    const noeuds0 = [
      { x: -2, y: -2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: 4, y: 2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
    ]
    const noeuds1 = [
      { x: -2, y: -2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: 0, y: 2, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 3, y: -1, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
    ]
    const noeuds3 = [
      { x: -2, y: -2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: -1, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 0, y: 0, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 2, y: 2, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 4, y: -1, deriveeGauche: -1, deriveeDroit: -1, isVisible: true },
    ]

    const noeuds4 = [
      { x: -2, y: -2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
      { x: -1, y: 1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 0, y: 0, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 1, y: 2, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 3, y: -1, deriveeGauche: 0, deriveeDroit: 0, isVisible: true },
      { x: 4, y: 2, deriveeGauche: 1, deriveeDroit: 1, isVisible: true },
    ]

    const noeuds5 = [
      { x: -3, y: 2, deriveeGauche: -4, deriveeDroit: -4, isVisible: false },
      { x: -1.8, y: -1.9, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
      { x: 1.5, y: 2.2, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
      { x: 3.2, y: 0.8, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
      { x: 4, y: 2, deriveeGauche: 3, deriveeDroit: 3, isVisible: false },
    ]
    const mesFonctions = this.canOfficielle
      ? [noeuds5]
      : [noeuds0, noeuds1, noeuds2, noeuds3, noeuds4] // noeuds0, noeuds1, noeuds2, noeuds3, noeuds4
    function aleatoiriseCourbe(
      listeFonctions: Array<{
        x: number
        y: number
        deriveeGauche: number
        deriveeDroit: number
        isVisible: boolean
      }>[],
    ) {
      const coeffX = 1 // choice([-1, 1]) // symétries ou pas
      const coeffY = 1 // choice([-1, 1])
      const deltaX = 0 // randint(-2, 2) // translations
      const deltaY = 0 // randint(-2, +2)
      const choix = choice(listeFonctions)
      return choix.map((noeud) =>
        Object({
          x: (noeud.x + deltaX) * coeffX,
          y: (noeud.y + deltaY) * coeffY,
          deriveeGauche: noeud.deriveeGauche * coeffX * coeffY,
          deriveeDroit: noeud.deriveeDroit * coeffX * coeffY,
          isVisible: noeud.isVisible,
        }),
      )
    }

    const o = texteParPosition('O', -0.3, -0.3, 0, 'black', 1)
    const nuage = aleatoiriseCourbe(mesFonctions)
    const theSpline = spline(nuage)
    this.spline = theSpline
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
    const courbef1 = latex2d('\\mathscr{C}_f', -2, 1, { color: bleuMathalea })

    const objetsEnonce = [repere1, courbe1, courbef1]

    this.question =
      `Nombre de solutions de l'équation $f'(x)=0$${this.canOfficielle ? ' sur $[-3\\,;\\,4]$' : ''}.<br>` +
      mathalea2d(
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
      ) // fixeBordures(objetsEnonce))
    this.question += '<br>'
    const extrema = nuage.filter((el) => el.deriveeGauche === 0)
    this.reponse = String(extrema.length)

    this.correction = `On retrouve le nombre de solutions de l'équation $f'(x)=0$ en comptant le nombre de points en lesquels la tangente à la courbe $\\mathscr{C}_f$ est horizontale. <br>
      En parcourant la courbe $\\mathscr{C}_f$, on constate qu'il y a $${this.reponse}$ 
      ${extrema.length < 2 ? 'tangente horizontale' : 'tangentes horizontales'} (au niveau des changmements de variations),
       on en déduit que l'équation $f'(x)=0$ admet $${miseEnEvidence(this.reponse)}$ ${extrema.length < 2 ? 'solution' : 'solutions'}.`
  }
}
