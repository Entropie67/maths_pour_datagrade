import { context } from '../../../modules/context'
/**
 * ⚠️ Cet exercice est utilisé dans le test : tests/e2e/tests/view/viewcan.2024.2e.test.ts ⚠️
 */

import { afficheLongueurSegment } from '../../../lib/2d/afficheLongueurSegment'
import { codageAngle } from '../../../lib/2d/angles'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../../lib/2d/polygones'
import { pointAdistance } from '../../../lib/2d/utilitairesPoint'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Calculer l'aire d'un triangle rectangle"
export const interactifReady = true

export const uuid = '1e8ea'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 */
export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()

    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    this.optionsChampTexte = { texteApres: '$\\text{cm}^2$' }
    let tri
    if (this.canOfficielle) {
      const objets = []
      const A = pointAbstrait(0, 0)
      const B = pointAdistance(A, 4, 0) // triplet[1] sera la longueur c
      const C = pointAdistance(B, 3, 90) // triplet[0] sera la longueur a
      const pol = polygoneAvecNom(A, B, C) // donc triplet[2] sera la longueur b
      const lc = afficheLongueurSegment(B, A)
      const la = afficheLongueurSegment(C, B)
      const lb = afficheLongueurSegment(A, C)
      this.reponse = 6
      objets.push(pol[0], la, lb, lc, codageAngle(A, B, C))
      this.question =
        'Aire du triangle <br>' +
        mathalea2d(
          {
            xmin: -1,
            xmax: 5,
            ymin: -1,
            ymax: 4,
            scale: 0.6,
            center: !context.isHtml,
          },
          objets,
        )
      this.correction = `L'aire est donnée par le produit des deux plus petits côtés divisé par $2$, soit : $\\dfrac{3\\times 4}{2}=${miseEnEvidence(this.reponse)}\\text{ cm}^2$.`
    } else {
      if (choice([true, false])) {
        tri = shuffle(['3', '4', '5'])
        this.reponse = 6
        this.correction = `L'aire est donnée par le produit des deux plus petits côtés divisé par $2$, soit : $\\dfrac{3\\times 4}{2}=${miseEnEvidence(this.reponse)}\\text{ cm}^2$.`
      } else {
        tri = shuffle(['5', '12', '13'])
        this.reponse = 30
        this.correction = `L'aire est donnée par le produit des  deux plus petits côtés divisé par $2$, soit : $\\dfrac{5\\times 12}{2}=${miseEnEvidence(this.reponse)}\\text{ cm}^2$.`
      }
      this.question = `Aire d'un triangle rectangle dont les côtés mesurent $${tri[0]}\\text{ cm}$, $${tri[1]}\\text{ cm}$ et $${tri[2]}\\text{ cm}$.`
      this.canReponseACompleter = '$ \\ldots\\text{ cm}^2$'
    }
  }
}
