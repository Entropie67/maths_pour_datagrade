import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../../lib/2d/polygones'
import { texteParPosition } from '../../../lib/2d/textes'
import { milieu, pointAdistance } from '../../../lib/2d/utilitairesPoint'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { creerNomDePolygone } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer une longueur avec le théorème de Pythagore'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication septembre 2021
*/
export const uuid = '31f61'

export const refs = {
  'fr-fr': ['can2G1-03', '2G11-flash2'],
  'fr-ch': ['NR'],
}
export default class CalculCotePythagore extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const nom = creerNomDePolygone(3, ['QD'])
    const a = this.quotaRandint('a', 1, 5) //
    const b = this.quotaRandint('b', 6, 10) //
    const A = pointAbstrait(0, 0, nom[0])
    const B = pointAdistance(A, a, 90, nom[1])
    const C = pointAdistance(B, Math.sqrt(b ** 2 - a ** 2), 0, nom[2])
    const pol = polygoneAvecNom(A, B, C) // polygoneAvecNom s'occupe du placement des noms des sommets
    const objets = []
    const xmin = Math.min(A.x, B.x, C.x) - 1
    const ymin = Math.min(A.y, B.y, C.y) - 1
    const xmax = Math.max(A.x, B.x, C.x) + 1
    const ymax = Math.max(A.y, B.y, C.y) + 1

    objets.push(pol[0], pol[1], codageAngleDroit(A, B, C)) // pol[0], c'est le tracé et pol[1] ce sont les labels
    objets.push(
      texteParPosition(
        `${texNombre(b)}`,
        milieu(A, C).x + 0.2,
        milieu(A, C).y - 0.3,
      ),
      texteParPosition(`${texNombre(a)}`, milieu(A, B).x - 0.3, milieu(A, B).y),
      texteParPosition(
        'x',
        milieu(B, C).x,
        milieu(B, C).y + 0.3,
        0,
        'black',
        1,
        'milieu',
        true,
      ),
    )
    this.question = `Sur cette figure $x=\\sqrt{a}$.<br>
    
    Quelle est la valeur de $a$ ?<br>

    `
    this.question += mathalea2d(
      {
        xmin,
        ymin,
        xmax,
        ymax,
        pixelsParCm: 25,
        mainlevee: false,
        amplitude: 0.3,
        scale: 0.7,
        center: !context.isHtml,
      },
      objets,
    )
    this.correction = ` En utilisant le théorème de Pythagore, on a :<br>
        $${nom[0]}${nom[1]}^2+${nom[1]}${nom[2]}^2=${nom[0]}${nom[2]}^2$, soit
        $${nom[1]}${nom[2]}^2=${nom[0]}${nom[2]}^2-${nom[0]}${nom[1]}^2$. <br>
        On en déduit : $x^2=${b}^2-${a}^2$, d'où $x=\\sqrt{${b}^2-${a}^2}=\\sqrt{${b ** 2 - a ** 2}}$
       <br>
       Ainsi, $a=${miseEnEvidence(b ** 2 - a ** 2)}$.`
    this.reponse = b ** 2 - a ** 2

    this.canReponseACompleter = '$a=\\ldots$'
  }
}
