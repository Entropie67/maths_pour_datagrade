import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { droite } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { nommePolygone, polygone } from '../../lib/2d/polygones'
import { polyline } from '../../lib/2d/Polyline'
import { projectionOrtho, rotation } from '../../lib/2d/transformations'
import {
  addObjetsCliquables,
  type ObjetCliquableData,
} from '../../lib/customElements/ObjetsCliquablesElement'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { gestionnaireFormulaireTexte, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Identifier les côtés d’un triangle rectangle'
export const interactifReady = true

export const dateDeModifImportante = '24/07/2026'

export const uuid = '40d57'

export const refs = {
  'fr-fr': ['4G20-0'],
  'fr-ch': ['10LCGM3A-1', '10LSGM3A-1', '11CTGM2A-1', 'PRQMG03A-3'],
}

function correctionCote(
  terme: string,
  triangle: string,
  sommetDroit: string,
  sommetAngle: string,
  angle: string,
  hypotenuse: string,
  coteAttendu: string,
): string {
  const reponse = `$${miseEnEvidence(`[${coteAttendu}]`)}$.`
  if (terme === 'hypoténuse') {
    return `Le triangle $${triangle}$ est rectangle en $${sommetDroit}$. L'hypoténuse est le côté opposé au sommet $${sommetDroit}$ : c'est ${reponse}`
  }
  if (terme === 'adjacent') {
    return `Le triangle $${triangle}$ est rectangle en $${sommetDroit}$, donc son hypoténuse est $[${hypotenuse}]$. Le côté adjacent à l'angle $\\widehat{${angle}}$ touche le sommet $${sommetAngle}$ sans être l'hypoténuse : c'est ${reponse}`
  }
  return `Le côté opposé à l'angle $\\widehat{${angle}}$ est le seul côté du triangle $${triangle}$ qui ne touche pas le sommet $${sommetAngle}$ : c'est ${reponse}`
}

/**
 * @author Jean-Claude Lhote
 */
export default class IdentifierCoteTriangleRectangle extends Exercice {
  constructor() {
    super()
    this.sup = '1'
    this.besoinFormulaireTexte = [
      'Niveau de difficulté',
      '0: Mélange\n1 : Un seul triangle\n2 : Plusieurs triangles',
    ]
    this.besoinFormulaire2Texte = [
      'Choix des côtés',
      'Nombres séparés par des tirets\n1 : côté adjacent\n2 : côté opposé\n3 : hypoténuse\n0 : Mélange',
    ]
    this.sup2 = '0'
  }
  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 2,
      melange: 0,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    }).map(Number)
    const listeTermes = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      nbQuestions: this.nbQuestions,
      defaut: 0,
      min: 1,
      max: 3,
      melange: 0,
    }).map((n) => ['adjacent', 'opposé', 'hypoténuse'][Number(n) - 1])

    for (let i = 0; i < this.nbQuestions;) {
      const terme = listeTermes[i]
      const indexSommet = choice([0, 2])
      let question = ''
      let correction = ''
      const nom = creerNomDePolygone(6)

      const A = pointAbstrait(0, 0, nom[0])
      const B = pointAbstrait(6, 0, nom[1])
      const angle = randint(30, 60)
      const C = pointAbstrait(
        B.x,
        (B.y + 6 * Math.sin((angle * Math.PI) / 180)) * randint(-1, 1, 0),
        nom[2],
      )
      switch (listeTypeDeQuestions[i]) {
        case 1: // Un seul triangle
          {
            const AB = nom[0] + nom[1]
            const AC = nom[0] + nom[2]
            const BC = nom[1] + nom[2]
            const turnTriangle = randint(0, 360)
            const triangle = rotation(polygone([A, B, C]), A, turnTriangle)
            question =
              context.isHtml && this.interactif
                ? `Dans le triangle rectangle $${nom[0]}${nom[1]}${nom[2]}$, cliquer sur ${terme === 'hypoténuse' ? "l'hypoténuse" : `le côté ${terme} à l'angle $\\widehat{${nom[2 - indexSommet]}${nom[indexSommet]}${nom[1]}}$`}.`
                : `Dans le triangle rectangle $${nom[0]}${nom[1]}${nom[2]}$, ${terme === 'hypoténuse' ? "l'hypoténuse" : `le côté ${terme} à l'angle $\\widehat{${nom[2 - indexSommet]}${nom[indexSommet]}${nom[1]}}$`} est :`
            const objetsFigure = [
              triangle,
              codageAngleDroit(
                triangle.listePoints[0],
                triangle.listePoints[1],
                triangle.listePoints[2],
              ),
              nommePolygone(triangle, nom.slice(0, 3)),
            ]
            const figureId = `figEx${this.numeroExercice}Q${i}`
            question += mathalea2d(
              Object.assign({ id: figureId }, fixeBordures(objetsFigure)),
              objetsFigure,
            )
            const objets: ObjetCliquableData[] = [
              {
                type: 'segment',
                id: AB,
                x1: triangle.listePoints[0].x,
                y1: triangle.listePoints[0].y,
                x2: triangle.listePoints[1].x,
                y2: triangle.listePoints[1].y,
                etat: false,
              },
              {
                type: 'segment',
                id: AC,
                x1: triangle.listePoints[0].x,
                y1: triangle.listePoints[0].y,
                x2: triangle.listePoints[2].x,
                y2: triangle.listePoints[2].y,
                etat: false,
              },
              {
                type: 'segment',
                id: BC,
                x1: triangle.listePoints[1].x,
                y1: triangle.listePoints[1].y,
                x2: triangle.listePoints[2].x,
                y2: triangle.listePoints[2].y,
                etat: false,
              },
            ]
            const coteAttendu =
              terme === 'hypoténuse'
                ? AC
                : (terme === 'adjacent' && indexSommet === 0) ||
                    (terme === 'opposé' && indexSommet === 2)
                  ? AB
                  : BC
            const objetAttendu = objets.map((objet) => ({
              ...objet,
              etat: objet.id === coteAttendu,
            }))
            correction = correctionCote(
              terme,
              nom.slice(0, 3),
              nom[1],
              nom[indexSommet],
              `${nom[2 - indexSommet]}${nom[indexSommet]}${nom[1]}`,
              AC,
              coteAttendu,
            )
            if (this.interactif) {
              question += addObjetsCliquables(this, i, { figureId, objets })
            }
            handleAnswers(
              this,
              i,
              { reponse: { value: JSON.stringify(objetAttendu) } },
              { formatInteractif: 'objets-cliquables' },
            )
          }
          break
        case 2:
          {
            const H = projectionOrtho(B, droite(A, C), nom[3])
            const AB = nom[0] + nom[1]
            const AC = nom[0] + nom[2]
            const BC = nom[1] + nom[2]
            const BH = nom[1] + nom[3]
            const CH = nom[2] + nom[3]
            const AH = nom[0] + nom[3]
            const turnTriangles = randint(0, 360)
            const triangles = rotation(
              polyline(A, B, C, H, A, B, H),
              A,
              turnTriangles,
            )
            const Hrotated = rotation(H, A, turnTriangles)
            const listeTriangles = [
              nom.slice(0, 3), // ABC
              nom[0] + nom[3] + nom[1], // AHC
              nom[1] + nom[3] + nom[2], // BHC
            ]
            const indexTriangle = randint(0, 2)
            const choixTriangle = listeTriangles[indexTriangle]
            question =
              context.isHtml && this.interactif
                ? `Dans le triangle rectangle $${choixTriangle}$, cliquer sur ${terme === 'hypoténuse' ? "l'hypoténuse" : `le côté ${terme} à l'angle $\\widehat{${choixTriangle[2 - indexSommet]}${choixTriangle[indexSommet]}${choixTriangle[1]}}$`}.`
                : `Dans le triangle rectangle $${choixTriangle}$, ${terme === 'hypoténuse' ? "l'hypoténuse" : `le côté ${terme} à l'angle $\\widehat{${choixTriangle[2 - indexSommet]}${choixTriangle[indexSommet]}${choixTriangle[1]}}$`} est :`
            const objetsFigure = [
              triangles,
              codageAngleDroit(
                triangles.listePoints[0],
                triangles.listePoints[1],
                triangles.listePoints[2],
              ),
              codageAngleDroit(
                triangles.listePoints[0],
                Hrotated,
                triangles.listePoints[1],
              ),
              nommePolygone(
                polygone(triangles.listePoints.slice(0, 4)),
                nom.slice(0, 4),
              ),
            ]
            const figureId = `figEx${this.numeroExercice}Q${i}`
            question += mathalea2d(
              Object.assign({ id: figureId }, fixeBordures(objetsFigure)),
              objetsFigure,
            )
            const coteAttendu =
              terme === 'hypoténuse'
                ? choixTriangle === listeTriangles[0]
                  ? AC
                  : choixTriangle === listeTriangles[1]
                    ? AB
                    : BC
                : choixTriangle === listeTriangles[0]
                  ? (terme === 'adjacent' && indexSommet === 0) ||
                    (terme === 'opposé' && indexSommet === 2)
                    ? AB
                    : BC
                  : choixTriangle === listeTriangles[1]
                    ? (terme === 'adjacent' && indexSommet === 0) ||
                      (terme === 'opposé' && indexSommet === 2)
                      ? AH
                      : BH
                    : (terme === 'adjacent' && indexSommet === 0) ||
                        (terme === 'opposé' && indexSommet === 2)
                      ? BH
                      : CH
            correction = correctionCote(
              terme,
              choixTriangle,
              choixTriangle === listeTriangles[0] ? nom[1] : nom[3],
              choixTriangle[indexSommet],
              `${choixTriangle[2 - indexSommet]}${choixTriangle[indexSommet]}${choixTriangle[1]}`,
              choixTriangle === listeTriangles[0]
                ? AC
                : choixTriangle === listeTriangles[1]
                  ? AB
                  : BC,
              coteAttendu,
            )
            const objets: ObjetCliquableData[] = [
              {
                type: 'segment',
                id: AB,
                x1: triangles.listePoints[0].x,
                y1: triangles.listePoints[0].y,
                x2: triangles.listePoints[1].x,
                y2: triangles.listePoints[1].y,
                etat: false,
              },
              {
                type: 'segment',
                id: AC,
                x1: triangles.listePoints[0].x,
                y1: triangles.listePoints[0].y,
                x2: triangles.listePoints[2].x,
                y2: triangles.listePoints[2].y,
                etat: false,
              },
              {
                type: 'segment',
                id: BC,
                x1: triangles.listePoints[1].x,
                y1: triangles.listePoints[1].y,
                x2: triangles.listePoints[2].x,
                y2: triangles.listePoints[2].y,
                etat: false,
              },
              {
                type: 'segment',
                id: BH,
                x1: triangles.listePoints[1].x,
                y1: triangles.listePoints[1].y,
                x2: Hrotated.x,
                y2: Hrotated.y,
                etat: false,
              },
              {
                type: 'segment',
                id: CH,
                x1: triangles.listePoints[2].x,
                y1: triangles.listePoints[2].y,
                x2: Hrotated.x,
                y2: Hrotated.y,
                etat: false,
              },
              {
                type: 'segment',
                id: AH,
                x1: triangles.listePoints[0].x,
                y1: triangles.listePoints[0].y,
                x2: Hrotated.x,
                y2: Hrotated.y,
                etat: false,
              },
            ]
            const objetsCliquables =
              choixTriangle === listeTriangles[0]
                ? objets.filter((objet) => objet.id !== AH && objet.id !== CH)
                : objets
            const objetAttendu = objetsCliquables.map((objet) => ({
              ...objet,
              etat: objet.id === coteAttendu,
            }))
            if (this.interactif) {
              question += addObjetsCliquables(this, i, {
                figureId,
                objets: objetsCliquables,
              })
            }
            handleAnswers(
              this,
              i,
              { reponse: { value: JSON.stringify(objetAttendu) } },
              { formatInteractif: 'objets-cliquables' },
            )
          }

          break
      }
      this.listeQuestions.push(question)
      this.listeCorrections.push(correction)
      i++
    }
  }
}
