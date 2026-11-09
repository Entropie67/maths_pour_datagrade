import { codageAngle } from '../../../lib/2d/angles'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { rapporteur } from '../../../lib/2d/Rapporteur'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { rotation } from '../../../lib/2d/transformations'
import { pointSurSegment } from '../../../lib/2d/utilitairesPoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = "Déterminer la mesure d'un angle sur un rapporteur"
export const interactifReady = true

export const uuid = 'ddd9d'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Éric Elter pour le rapporteur et Gilles Mora pour essayer d'en faire quelque chose de bien...

*/
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsChampTexte = { texteApres: ' °' }

    this.canOfficielle = false
  }

  nouvelleVersion() {
    const objetsEnonce = []
    const tailleRapporteur = 6
    const a = this.canOfficielle ? 7 : randint(4, 8)

    // Commentaires pour Gilles concernant Q25 de la CAN officielle

    const posA = 'below' // posA est la position de A autour du point. Ici, 'below' (en dessous)
    const A = pointAbstrait(0, 0, 'C', posA) // Le point A se nomme C dans ton cas.

    const angRapporteurAvecHorizontale = this.canOfficielle
      ? 20
      : randint(5, 25)
    const angB = this.canOfficielle
      ? 50
      : angRapporteurAvecHorizontale + choice([10, 20, 30, 40, 50, 70, 80]) // angB est l'angle de A avec l'horizontale.
    const B1 = rotation(pointAbstrait(tailleRapporteur + 0.5, 0), A, angB)
    const posB = 'right'
    const B = pointSurSegment(A, B1, tailleRapporteur + 0.5, 'A', posB) // Le point B se nomme A dans ton cas

    const angC = a * 10 // angC est donc la valeur de l'angle à trouver
    // const posC = 'left'
    const C1 = rotation(B1, A, angC)
    // const C = pointSurSegment(A, C1, tailleRapporteur + 0.5, 'B', posC)  Le point C se nomme B dans ton cas

    const AB = segment(A, B1)
    const AC = segment(A, C1)

    const R = rapporteur({
      x: 0,
      y: 0,
      taille: tailleRapporteur,
      depart: angRapporteurAvecHorizontale,
      semi: true,
      avecNombre: 'unSens',
      precisionAuDegre: 10,
      stepGraduation: 90,
      rayonsVisibles: false,
    })
    objetsEnonce.push(
      R,
      AB,
      AC,
      codageAngle(
        B,
        A,
        angC,
        1,
        '',
        'black',
        2,
        1,
        'none',
        0,
        false,
        true,
        '?',
        2,
      ),
    ) //, labelPoint(A, B, C), tracePoint(A, B, C)
    this.question = 'Donne la mesure de cet angle.'

    this.question +=
      '<br>' +
      mathalea2d(
        Object.assign({ scale: 0.5 }, fixeBordures(objetsEnonce)),
        objetsEnonce,
      )
    // Object.assign({}, fixeBordures(objetsEnonce))

    this.reponse = a * 10

    this.correction = `Chaque graduation mesure $10^\\circ$. On en déduit que l'angle $\\widehat{BCA}$ a une mesure de $${miseEnEvidence(a * 10)}^\\circ$. `

    this.canReponseACompleter = '? $= \\ldots ^\\circ$'
  }
}
