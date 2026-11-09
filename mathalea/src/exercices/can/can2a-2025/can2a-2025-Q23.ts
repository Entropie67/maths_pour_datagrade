import { grille } from '../../../lib/2d/Grille'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { labelPoint } from '../../../lib/2d/textes'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'
import { sp } from '../../../lib/outils/outilString'

export const titre = 'Déterminer un vecteur égal sur une grille'
export const interactifReady = true

export const uuid = '57688'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class VecteurEgal extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = true
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.alphanumeric
    this.formatInteractif = 'fillInTheBlank'
  }

  nouvelleVersion() {
    const a = grille(0, 0, 7, 5, 'gray', 1, 1)
    const A = pointAbstrait(1, 1, 'A', 'below')
    const B = pointAbstrait(3, 2, 'B', 'above')
    const C = pointAbstrait(3, 1, 'C', 'below')
    const D = pointAbstrait(6, 4, 'D', 'above')
    const E = pointAbstrait(2, 2, 'E', 'above')
    const F = pointAbstrait(5, 2, 'F', 'above')
    const G = pointAbstrait(5, 3, 'G', 'above') // unite
    const H = pointAbstrait(4, 3, 'H', 'above') // unite
    const PositionPt = tracePoint(A, B, C, D, E, F, G, H)
    const LabelsPt = labelPoint(A, B, C, D, E, F, G, H)
    const xmin = -1
    const ymin = 0
    const xmax = 7
    const ymax = 5.3
    const objets = []
    objets.push(a, PositionPt, LabelsPt)
    this.reponse = { champ1: { value: 'G' } }
    this.consigne =
      mathalea2d(
        {
          xmin,
          ymin,
          xmax,
          ymax,
          pixelsParCm: 20,
          mainlevee: false,
          amplitude: 0.5,
          scale: 0.5,
          center: !context.isHtml,
        },
        objets,
      ) + `<br>Compléter${sp()}:`
    this.question = '\\overrightarrow{AB}=\\overrightarrow{B{%{champ1}}}'
    this.correction = `Le vecteur d'origine $B$ égal au vecteur $\\overrightarrow{AB}$ est le vecteur $\\overrightarrow{BG}$. <br>
    Ainsi, $\\overrightarrow{AB}=\\overrightarrow{B${miseEnEvidence('G')}}$.`

    this.canEnonce = mathalea2d(
      {
        xmin,
        ymin,
        xmax,
        ymax,
        pixelsParCm: 20,
        mainlevee: false,
        amplitude: 0.5,
        scale: 0.5,
        center: !context.isHtml,
      },
      objets,
    )
    this.canReponseACompleter =
      `Compléter${sp()}: <br>$\\overrightarrow{AB}=\\overrightarrow{B\\ldots}$`
    this.canNumeroLie = 23
    this.canLiee = [24]
  }
}
