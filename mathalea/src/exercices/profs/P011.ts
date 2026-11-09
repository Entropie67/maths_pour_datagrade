import { get } from 'svelte/store'
import { afficheLongueurSegment } from '../../lib/2d/afficheLongueurSegment'
import { afficheMesureAngle } from '../../lib/2d/AfficheMesureAngle'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import type { PointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import {
  ajouteSelecteurConstructionTriangle,
  CONSTRUCTIONS_TRIANGLE,
  mesuresSaisies,
  nomsDesSommets,
  numeroConstruction,
  problemeDeMesures,
} from '../../lib/customElements/ConstructionTriangleSelecteur'
import { globalOptions } from '../../lib/stores/globalOptions'
import Alea2iep from '../../modules/Alea2iep'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import Exercice from '../Exercice'

export const titre = "Construire l'animation d'un triangle"

export const refs = {
  'fr-fr': ['P011'],
  'fr-ch': [],
}
export const uuid = '697a7'

/**
 * Permet de construire un triangle animé à partir de différentes données.
 *
 * Les réglages se font dans l'énoncé, en vue enseignante, avec le custom
 * element `construction-triangle-selecteur` : `sup` est le numéro de la
 * construction, `sup2` le nom du triangle et `sup3` les mesures séparées par
 * des espaces.
 * @author Jean-claude Lhote
 */
export default class ConstruisMonTriangle extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1 // Ici le nombre de questions
    this.nbQuestionsModifiable = false // Active le formulaire nombre de questions
    this.pasDeVersionLatex = true // mettre à true si on ne veut pas de l'exercice dans le générateur LaTeX
    this.sup = 1
    this.sup2 = 'ABC'
    this.sup3 = '3 4 5'
  }

  nouvelleVersion() {
    const type = numeroConstruction(this.sup)
    const construction = CONSTRUCTIONS_TRIANGLE[type - 1]
    const saisies = mesuresSaisies(this.sup3, construction.mesures.length)
    const donnees =
      problemeDeMesures(type, saisies) === '' ? saisies : construction.defauts
    const nom = nomsDesSommets(this.sup2).join('')
    const anim = new Alea2iep()
    const objetsEnonceml = []
    let triangle: PointAbstrait[] = []
    switch (type) {
      case 1:
        triangle = anim.triangle3longueurs(
          nom,
          donnees[0],
          donnees[1],
          donnees[2],
          { description: true, placerNomsSommets: true },
        )
        objetsEnonceml.push(
          afficheLongueurSegment(triangle[1], triangle[0]),
          afficheLongueurSegment(triangle[2], triangle[1]),
          afficheLongueurSegment(triangle[0], triangle[2]),
        )
        break

      case 2:
        triangle = anim.triangle1longueur2angles(
          nom,
          donnees[0],
          donnees[1],
          donnees[2],
          { description: true, placerNomsSommets: true },
        )
        objetsEnonceml.push(
          afficheLongueurSegment(triangle[1], triangle[0]),
          afficheMesureAngle(triangle[2], triangle[0], triangle[1]),
          afficheMesureAngle(triangle[0], triangle[1], triangle[2]),
        )
        break

      case 3:
        triangle = anim.triangleRectangle2Cotes(nom, donnees[0], donnees[1], {
          description: true,
          placerNomsSommets: true,
        })
        objetsEnonceml.push(
          afficheLongueurSegment(triangle[1], triangle[0]),
          afficheLongueurSegment(triangle[2], triangle[1]),
          codageAngleDroit(triangle[0], triangle[1], triangle[2]),
        )
        break

      case 4:
        triangle = anim.triangleRectangleCoteHypotenuse(
          nom,
          Math.min(donnees[0], donnees[1]),
          Math.max(donnees[0], donnees[1]),
          { description: true, placerNomsSommets: true },
        )
        objetsEnonceml.push(
          afficheLongueurSegment(triangle[1], triangle[0]),
          afficheLongueurSegment(triangle[0], triangle[2]),
          codageAngleDroit(triangle[0], triangle[1], triangle[2]),
        )
        break

      case 5:
        triangle = anim.triangleEquilateral(nom, donnees[0], {
          placerNomsSommets: true,
        })
        objetsEnonceml.push(
          afficheLongueurSegment(triangle[1], triangle[0]),
          codageSegments(
            '||',
            'red',
            triangle[0],
            triangle[1],
            triangle[2],
            triangle[0],
            triangle[1],
            triangle[2],
          ),
        )
        break

      case 6:
        triangle = anim.triangle2longueurs1angle(
          nom,
          donnees[0],
          donnees[1],
          donnees[2],
          { placerNomsSommets: true },
        )
        objetsEnonceml.push(
          afficheLongueurSegment(triangle[1], triangle[0]),
          afficheLongueurSegment(triangle[0], triangle[2]),
          afficheMesureAngle(triangle[1], triangle[0], triangle[2]),
        )
        break
    }
    const bouton = anim.htmlBouton(this.numeroExercice ?? 0, 0)
    if (this.estVueProf()) {
      // La figure à main levée du sélecteur remplace celle de l'énoncé.
      this.contenu =
        ajouteSelecteurConstructionTriangle({
          numeroExercice: this.numeroExercice ?? 0,
          construction: type,
          nom,
          mesures: String(this.sup3 ?? ''),
        }) + bouton
    } else {
      const poly = polygoneAvecNom(...triangle)
      objetsEnonceml.push(poly[0], poly[1])
      const paramsEnonce = {
        xmin: Math.min(triangle[0].x - 1, triangle[1].x - 1, triangle[2].x - 1),
        ymin: Math.min(triangle[0].y - 1, triangle[1].y - 1, triangle[2].y - 1),
        xmax: Math.max(triangle[0].x + 1, triangle[1].x + 1, triangle[2].x + 1),
        ymax: Math.max(triangle[0].y + 1, triangle[1].y + 1, triangle[2].y + 1),
        pixelsParCm: 20,
        scale: 1,
        mainlevee: true,
        amplitude: 0.5,
      }
      this.contenu = mathalea2d(paramsEnonce, objetsEnonceml) + '<br>' + bouton
    }
    this.listeQuestions[0] = this.contenu
  }

  /**
   * Le sélecteur n'est proposé qu'à l'enseignant (vue prof et vue TBI),
   * jamais à l'élève.
   */
  private estVueProf(): boolean {
    const vue = get(globalOptions).v
    return (
      context.isHtml &&
      !context.isTypst &&
      !context.isAmc &&
      (vue === undefined || vue === '' || vue === 'tbi')
    )
  }
}
