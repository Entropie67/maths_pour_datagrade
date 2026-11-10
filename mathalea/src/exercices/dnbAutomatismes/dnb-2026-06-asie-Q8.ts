import { miseEnEvidence } from '../../lib/outils/embellissements'
import { afficheMesureAngle } from '../../lib/2d/AfficheMesureAngle'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import { choice } from '../../lib/outils/arrayOutils'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'cfbaa'
export const refs = {
  'fr-fr': ['3AutoG03-3'],
  'fr-ch': ['9R1ES2A-9', '9R2ES2A-9', '9R3ES2A-9', 'PRQES01C-6'],
}
export const interactifReady = true
export const titre = 'Calculer un angle complémentaire'
export const dateDePublication = '11/08/2026'

const triangle = (angle: number) => {
  const C = pointAbstrait(0, 0, 'C')
  const B = pointAbstrait(0, 5, 'B')
  const A = pointAbstrait(5 * Math.tan((angle * Math.PI) / 180), 0, 'A')
  const objets = []
  objets.push(polygoneAvecNom(A, B, C))
  objets.push(codageAngleDroit(A, C, B))
  objets.push(afficheMesureAngle(C, B, A))

  return mathalea2d(Object.assign({}, fixeBordures(objets)), objets)
}
/**
 * DNB Asie juin 2026 - Question 8
 * @author Jean-Claude Lhote
 */
export default class AutoQ8Asiebrevet2026 extends ExerciceCan {
  constructor() {
    super()
  }

  enonce(angle?: number) {
    if (angle == null) {
      angle = choice([randint(2, 8) * 10, randint(3, 15) * 5])
    }
    const colonne1 = `Quelle est la mesure de l'angle $\\widehat{BAC}$ ?`
    const colonne2 = triangle(angle)
    this.question = deuxColonnesResp(colonne1, colonne2, {
      largeur1: 80,
      widthmincol1: '400px',
      widthmincol2: '200px',
    })

    this.reponse = `${90 - angle}`
    this.correction = `L'angle $\\widehat{BAC}$ est complémentaire de l'angle $\\widehat{ABC}$, donc :<br>
$\\widehat{BAC} = 90^\\circ - \\widehat{ABC} = 90^\\circ - ${angle}^\\circ = ${miseEnEvidence(`${90 - angle}`)}^\\circ$`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) {
      this.enonce(40)
    } else {
      this.enonce()
    }
  }
}
