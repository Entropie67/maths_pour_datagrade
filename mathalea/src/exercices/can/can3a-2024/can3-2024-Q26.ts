import { codageSegments } from '../../../lib/2d/CodageSegment'
import { droite } from '../../../lib/2d/droites'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segmentAvecExtremites } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint, latexParCoordonnees } from '../../../lib/2d/textes'
import { tracePointSurDroite } from '../../../lib/2d/TracePointSurDroite'
import { milieu } from '../../../lib/2d/utilitairesPoint'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Exprimer en fonction de ...'
export const interactifReady = true

export const uuid = 'ea5e3'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.optionsChampTexte = {
      texteAvant: '$AB=$',
      texteApres: '$\\text{ cm}$',
    }
    this.canOfficielle = false
  }

  nouvelleVersion() {
    const objets = []
    const pointsSurAB2 = []
    const listeValeurs = this.canOfficielle
      ? [[10, 4]]
      : [
          [10, 2],
          [11, 3],
          [11, 2],
          [9, 4],
          [13, 3],
          [11, 4],
          [1, 3],
          [15, 5],
          [13, 4],
        ] // val1=valeur écrite, val2=nbre de segments de même longueur
    const Valeur = choice(listeValeurs)
    const b = Valeur[1]
    this.reponse = {
      reponse: {
        value: `${Valeur[0]}-${Valeur[1]}x`,
        options: { fonction: true, variable: 'x' },
      },
    }
    const A = pointAbstrait(0, 0, 'A', 'below')
    const B = pointAbstrait(16, 0, 'B', 'below')
    const A3 = pointAbstrait(0, 1, 'A1', 'below')
    const B3 = pointAbstrait(16, 1, 'A1', 'below')
    const B2 = pointAbstrait(7, 0, 'A', 'below')
    const AB = segmentAvecExtremites(A, B) // grand sement de départ
    const AB2 = segmentAvecExtremites(A, B2) // segment qui sera partagé
    AB2.tailleExtremites = 5
    AB.tailleExtremites = 5
    const A3B3 = segmentAvecExtremites(A3, B3) // pour avoir la longueur du  segment du dessus
    A3B3.styleExtremites = '<->'
    AB2.styleExtremites = '|-|'
    AB.styleExtremites = '-|'

    objets.push(labelPoint(B2, B), AB)
    const d = droite(A, B2)

    const Texte2 = latexParCoordonnees(
      `${Valeur[0]} \\text{ cm}`,
      milieu(A3, B3).x,
      milieu(A3, B3).y + 0.7,
      'black',
      0,
      0,
      '',
    )
    for (let i = 1; i < b; i++) {
      pointsSurAB2.push(
        pointAbstrait((i * 7) / b, 0),
        pointAbstrait((i * 7) / b, 0),
      )
      const Texte1 = latexParCoordonnees(
        'x \\text{ cm}',
        3 / b,
        -1.5,
        'black',
        0,
        0,
        '',
      )
      const A4 = pointAbstrait(0, -1, 'A1', 'below')
      const B4 = pointAbstrait(7 / b, -1, 'A1', 'below')
      const A4B4 = segmentAvecExtremites(A4, B4)
      A4B4.styleExtremites = '<->'
      const maTrace = tracePointSurDroite(pointsSurAB2[2 * (i - 1)], d)
      maTrace.taille = 2.5
      objets.push(
        tracePointSurDroite(pointsSurAB2[2 * (i - 1)], d),
        Texte1,
        A4B4,
      )
    }
    objets.push(
      codageSegments('//', bleuMathalea, A, ...pointsSurAB2, B2),
      AB2,
      A3B3,
      Texte2,
    )
    this.question = 'Exprime $AB$ en fonction de $x$.<br>'

    this.question += mathalea2d(
      {
        xmin: -1.5,
        ymin: -2.5,
        xmax: 20,
        ymax: 2,
        scale: 0.4,
      },
      objets,
    )
    // this.question += mathalea2d(Object.assign({ scale: 0.45, style: 'margin: auto' }, fixeBordures(objets)), objets)
    this.correction = `Comme il y a $${b}$ segments de la même longueur $x$, donc  $AB=${miseEnEvidence(`${Valeur[0]}-${Valeur[1]}x`)}\\text{ cm}$.`

    this.canReponseACompleter = '$AB=\\ldots\\text{ cm}$'
    if (!this.interactif) {
      this.question += '$AB=\\ldots\\text{ cm}$'
    }
  }
}
