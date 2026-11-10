import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { repere } from '../../../lib/2d/reperes'
import { texteParPosition } from '../../../lib/2d/textes'
import { bleuMathalea } from '../../../lib/colors'
import { spline, type NoeudSpline } from '../../../lib/mathFonctions/Spline'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceCan from '../../ExerciceCan'
export const titre = 'Déterminer des antécédents graphiquement'
export const interactifReady = true

export const uuid = 'qhl3g'
/**
 * Question 28 du sujet de la course aux nombres de Seconde de mai 2024
 * @author Rémi Angot
 */
export default class Can2a2024MaiQ28 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierEnsemble
    this.optionsDeComparaison = { suiteDeNombres: true }
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    const noeuds: NoeudSpline[] = [
      { x: -6, y: -2.5, deriveeGauche: 0, deriveeDroit: 0, isVisible: false },
      { x: -3, y: 0, deriveeGauche: 0.5, deriveeDroit: 0.75, isVisible: false },
      { x: -2, y: 3, deriveeGauche: 1.5, deriveeDroit: -1, isVisible: false },
      { x: 0, y: 1, deriveeGauche: -1, deriveeDroit: -1, isVisible: false },
      { x: 1, y: 0, deriveeGauche: -1, deriveeDroit: -3, isVisible: false },
      { x: 2, y: -2, deriveeGauche: -1, deriveeDroit: -1, isVisible: false },
      {
        x: 4,
        y: -3,
        deriveeGauche: -0.25,
        deriveeDroit: -0.25,
        isVisible: false,
      },
      {
        x: 6,
        y: -4,
        deriveeGauche: -0.25,
        deriveeDroit: -0.25,
        isVisible: false,
      },
    ]
    const textO = texteParPosition('O', -0.3, -0.3, 0.5, 'black', 1)
    const theSpline = spline(noeuds)
    const repere1 = repere({
      xMin: -6.5,
      xMax: 6.5,
      yMin: -5.5,
      yMax: 4.5,
      grilleX: false,
      grilleY: false,
      grilleSecondaire: true,
      grilleSecondaireYDistance: 1,
      grilleSecondaireXDistance: 1,
      grilleSecondaireYMin: -7,
      grilleSecondaireYMax: 7,
      grilleSecondaireXMin: -6,
      grilleSecondaireXMax: 6,
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
    const graphique = mathalea2d(
      {
        pixelsParCm: 30,
        scale: 0.55,
        center: !context.isHtml,
        xmin: -6,
        ymin: -5,
        xmax: 6,
        ymax: 4,
      },
      [repere1, courbe1, textO],
    )
    this.reponse = '-3;1'
    this.question =
      "On donne le graphique d'une fonction $f$ : <br>" +
      graphique +
      'Quels sont les antécédents de $0$ par $f$ ?<br>(Les séparer avec un point-virgule.)'
    this.correction = `Les antécédents de $0$ par $f$ sont $${miseEnEvidence('-3\\;;\\;1')}$.`
  }
}
