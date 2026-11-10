// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 7c4e2 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { labelPoint, latex2d } from '../../lib/2d/textes'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre = "Calculer la longueur d'un côté d'un triangle rectangle"
export const dateDePublication = '22/06/2026'

export const uuid = '7c4e2'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

type CoteCherche = 'AB' | 'AC' | 'BC'

/**
 * Exercice de calcul d'un côté dans un triangle rectangle avec le théorème de Pythagore.
 * @author Stéphane Guyon
 */
export default class CoteTriangleRectanglePythagoreQcmOld extends ExerciceQcmA {
  private racineTex(radicand: number) {
    const racine = Math.sqrt(radicand)
    return Number.isInteger(racine) ? `${racine}` : `\\sqrt{${radicand}}`
  }

  private appliquerLesValeurs(
    bc: number,
    longueurDonnee: number,
    coteCherche: CoteCherche,
  ) {
    const chercheHypotenuse = coteCherche === 'BC'
    const coteDonne = coteCherche === 'AB' ? 'AC' : 'AB'
    const ab = chercheHypotenuse
      ? bc
      : coteCherche === 'AB'
        ? 0
        : longueurDonnee
    const ac = chercheHypotenuse
      ? longueurDonnee
      : coteCherche === 'AC'
        ? 0
        : longueurDonnee
    const carreLongueurCorrecte = chercheHypotenuse
      ? bc ** 2 + longueurDonnee ** 2
      : bc ** 2 - longueurDonnee ** 2
    const sommeDesCarres = bc ** 2 + longueurDonnee ** 2
    const oubliDuCarre = chercheHypotenuse
      ? bc ** 2 + longueurDonnee
      : bc ** 2 - longueurDonnee
    const longueurCorrecteTex = this.racineTex(carreLongueurCorrecte)

    this.reponses = chercheHypotenuse
      ? [
          `$${longueurCorrecteTex}\\text{ cm}$`,
          `$${this.racineTex(Math.abs(bc ** 2 - longueurDonnee ** 2))}\\text{ cm}$`,
          `$${this.racineTex(oubliDuCarre)}\\text{ cm}$`,
          `$${bc + longueurDonnee}\\text{ cm}$`,
        ]
      : [
          `$${longueurCorrecteTex}\\text{ cm}$`,
          `$${this.racineTex(sommeDesCarres)}\\text{ cm}$`,
          `$${this.racineTex(oubliDuCarre)}\\text{ cm}$`,
          `$${bc - longueurDonnee}\\text{ cm}$`,
        ]

    const pointA = pointAbstrait(0, 0, 'A', 'below left')
    const pointC = pointAbstrait(0, 3, 'C', 'above left')
    const pointB = pointAbstrait(4, 0, 'B', 'below right')
    const triangle = polygone([pointA, pointC, pointB])
    const angleDroit = codageAngleDroit(pointC, pointA, pointB)
    const etiquetteBC = chercheHypotenuse ? '?' : `${bc}`
    const etiquetteAB = coteCherche === 'AB' ? '?' : `${ab}`
    const etiquetteAC = coteCherche === 'AC' ? '?' : `${ac}`
    const objets = [
      triangle,
      angleDroit,
      labelPoint(pointA, pointC, pointB),
      latex2d(etiquetteBC, 2.7, 1.7, {}),
      latex2d(etiquetteAB, 2, -0.8, {}),
      latex2d(etiquetteAC, -0.8, 1.5, {}),
    ]
    const figure = mathalea2d(
      Object.assign(
        { pixelsParCm: 20, scale: 1 },
        fixeBordures(objets, {
          rxmin: -0.6,
          rxmax: 0.6,
          rymin: -0.15,
          rymax: 0.45,
        }),
      ),
      objets,
    )

    this.enonce = chercheHypotenuse
      ? `Dans le triangle $ABC$ rectangle en $A$, qui n'est pas représenté à l'échelle, on donne $AB=${bc}\\text{ cm}$ et $AC=${longueurDonnee}\\text{ cm}$. <br>Quelle est la longueur exacte du segment $[BC]$ ?${figure}`
      : `Dans le triangle $ABC$ rectangle en $A$, qui n'est pas représenté à l'échelle, on donne $BC=${bc}\\text{ cm}$ et $${coteDonne}=${longueurDonnee}\\text{ cm}$. <br>Quelle est la longueur exacte du segment $[${coteCherche}]$ ?${figure}`

    this.correction = chercheHypotenuse
      ? `Le triangle $ABC$ est rectangle en $A$. D'après le théorème de Pythagore :<br>
$BC^2=AB^2+AC^2$.<br>
Donc $BC^2=${bc}^2+${longueurDonnee}^2=${bc ** 2}+${longueurDonnee ** 2}=${carreLongueurCorrecte}$.<br>
Comme une longueur est positive, $BC=${miseEnEvidence(`${longueurCorrecteTex}\\text{ cm}`)}$.`
      : `Le triangle $ABC$ est rectangle en $A$. D'après le théorème de Pythagore :<br>
$BC^2=AB^2+AC^2$.<br>
Donc $${coteCherche}^2=BC^2-${coteDonne}^2=${bc}^2-${longueurDonnee}^2=${bc ** 2}-${longueurDonnee ** 2}=${carreLongueurCorrecte}$.<br>
Comme une longueur est positive, $${coteCherche}=${miseEnEvidence(`${longueurCorrecteTex}\\text{ cm}`)}$.`
  }

  versionAleatoire = () => {
    const typeQuestion = this.sup2 === 3 ? choice([1, 2]) : this.sup2
    if (typeQuestion === 2) {
      const ab = randint(2, 10)
      const ac = randint(2, 10, ab)
      this.appliquerLesValeurs(ab, ac, 'BC')
    } else {
      const hypotenuse = randint(5, 12)
      const longueurDonnee = randint(2, hypotenuse - 1)
      this.appliquerLesValeurs(
        hypotenuse,
        longueurDonnee,
        choice<CoteCherche>(['AB', 'AC']),
      )
    }
  }

  constructor() {
    super()

    this.nbQuestions = 1
    this.sup2 = 3
    this.besoinFormulaire2Numerique = [
      'Côté à déterminer',
      3,
      "1 : Chercher un côté de l'angle droit\n2 : Chercher l'hypoténuse\n3 : Mélange",
    ]
    this.versionAleatoire()
  }
}
