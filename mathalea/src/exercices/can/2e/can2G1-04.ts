import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../../lib/2d/polygones'
import { texteParPosition } from '../../../lib/2d/textes'
import { similitude } from '../../../lib/2d/transformations'
import { milieu, pointAdistance } from '../../../lib/2d/utilitairesPoint'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { creerNomDePolygone } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer l’hypoténuse avec le théorème de Pythagore'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication septembre 2021
*/
export const uuid = '6341d'

export const refs = {
  'fr-fr': ['can2G1-04'],
  'fr-ch': [],
}
export default class CalculHypotenusePythagore extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'

    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierFullOperations
  }

  nouvelleVersion() {
    let a, b
    const nom = creerNomDePolygone(3, ['QD'])
    a = randint(2, 7) //
    b = randint(3, 7) //
    const A = pointAbstrait(0, 0, nom[0])
    const B = pointAdistance(A, a, randint(0, 45), nom[1])
    const C = similitude(A, B, 90, b / a, nom[2])
    const pol = polygoneAvecNom(A, B, C) // polygoneAvecNom s'occupe du placement des noms des sommets
    const objets = []
    const xmin = Math.min(A.x, B.x, C.x) - 1
    const ymin = Math.min(A.y, B.y, C.y) - 1
    const xmax = Math.max(A.x, B.x, C.x) + 1
    const ymax = Math.max(A.y, B.y, C.y) + 1
    switch (this.quotaChoice('type', ['a', 'b'])) {
      case 'a':
        objets.push(pol[0], pol[1], codageAngleDroit(A, B, C)) // pol[0], c'est le tracé et pol[1] ce sont les labels
        objets.push(
          texteParPosition(
            'x',
            milieu(A, C).x,
            milieu(A, C).y - 0.3,
            0,
            'black',
            1,
            'milieu',
            true,
          ),
          texteParPosition(
            `${texNombre(a)}`,
            milieu(A, B).x,
            milieu(A, B).y + 0.4,
          ),
          texteParPosition(
            `${texNombre(b)}`,
            milieu(B, C).x + 0.4,
            milieu(B, C).y,
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
            pixelsParCm: 18,
            mainlevee: false,
            amplitude: 0.3,
            scale: 0.5,
            center: !context.isHtml,
          },
          objets,
        )
        this.correction = ` En utilisant le théorème de Pythagore, on a :<br>
        $${nom[0]}${nom[1]}^2+${nom[1]}${nom[2]}^2=${nom[0]}${nom[2]}^2$, soit
        $${a}^2+${b}^2=x^2$, d'où $x=\\sqrt{${a}^2+${b}^2}=\\sqrt{${a ** 2 + b ** 2}}$
       <br>
       Ainsi, $a=${miseEnEvidence(a ** 2 + b ** 2)}$.`
        this.reponse = a ** 2 + b ** 2

        this.canReponseACompleter = '$a=\\ldots$'
        break
      case 'b':
        a = randint(1, 10) //
        b = randint(2, 10, [4, 9]) //
        if (
          a ** 2 + b === 4 ||
          a ** 2 + b === 9 ||
          a ** 2 + b === 16 ||
          a ** 2 + b === 25 ||
          a ** 2 + b === 36 ||
          a ** 2 + b === 49
        ) {
          this.question = `$${nom[0]}${nom[1]}${nom[2]}$ est un triangle rectangle en $${nom[0]}$.<br>
        $${nom[0]}${nom[1]}=${a}$ ; $${nom[0]}${nom[2]}=\\sqrt{${b}}$.<br>
        
        Calculer $${nom[1]}${nom[2]}$.<br>

        (donner le résultat sous la forme $\\sqrt{a}$ ou d'un nombre entier le cas échéant)`
          this.correction = ` En utilisant le théorème de Pythagore dans $${nom[0]}${nom[1]}${nom[2]}$ rectangle en $${nom[0]}$, on obtient :<br>
               $${nom[0]}${nom[1]}^2+${nom[0]}${nom[2]}^2=${nom[1]}${nom[2]}^2$, <br>
               soit $${a}^2+\\sqrt{${b}}^2=${nom[1]}${nom[2]}^2$, d'où $${nom[1]}${nom[2]}^2=${a * a + b}$ soit $${nom[1]}${nom[2]}=\\sqrt{${a * a + b}}=${miseEnEvidence(`${Math.sqrt(a * a + b)}`)}$.
             <br>`
          this.reponse = Math.sqrt(a ** 2 + b)
        } else {
          this.question = `$${nom[0]}${nom[1]}${nom[2]}$ est un triangle rectangle en $${nom[0]}$.<br>

          $${nom[0]}${nom[1]}=${a}$ ; $${nom[0]}${nom[2]}=\\sqrt{${b}}$.<br>
          
          Calculer $${nom[1]}${nom[2]}$.<br>

          (donner le résultat sous la forme $\\sqrt{a}$ ou d'un nombre entier le cas échéant)`
          this.correction = ` En utilisant le théorème de Pythagore dans $${nom[0]}${nom[1]}${nom[2]}$ rectangle en $${nom[0]}$, on obtient :<br>
                 $${nom[0]}${nom[1]}^2+${nom[0]}${nom[2]}^2=${nom[1]}${nom[2]}^2$, <br>
                 soit $${a}^2+\\sqrt{${b}}^2=${nom[1]}${nom[2]}^2$, d'où $${nom[1]}${nom[2]}^2=${a * a + b}$ soit $${nom[1]}${nom[2]}=${miseEnEvidence(`\\sqrt{${a * a + b}}`)}$.
               <br>`
          this.reponse = `\\sqrt{${a ** 2 + b}}`
        }

        this.canReponseACompleter = `$${nom[1]}${nom[2]}=\\ldots$`
        break
    }
  }
}
