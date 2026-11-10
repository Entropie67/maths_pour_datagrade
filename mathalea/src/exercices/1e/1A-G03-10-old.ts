// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 9f6c1 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { labelPoint } from '../../lib/2d/textes'
import { texteSurSegment } from '../../lib/2d/texteSurSegment'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre =
  'Calculer une longueur dans une figure composée de deux triangles rectangles'
export const dateDePublication = '23/06/2026'

export const uuid = '9f6c1'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

/**
 * Exercice de calcul d'une longueur dans deux triangles rectangles partageant
 * une même hypoténuse.
 * @author Stéphane Guyon
 */
export default class LongueurDeuxTrianglesRectanglesQcmOld extends ExerciceQcmA {
  private racineTex(radicand: number) {
    const racine = Math.sqrt(radicand)
    return Number.isInteger(racine) ? `${racine}` : `\\sqrt{${radicand}}`
  }

  private appliquerLesValeurs(ab: number, bc: number, af: number) {
    const carreAC = ab ** 2 + bc ** 2
    const carreFC = carreAC - af ** 2
    const sommeDesCarres = carreAC + af ** 2
    const oubliDuCarre = carreAC - af
    const longueurCorrecteTex = this.racineTex(carreFC)
    const bonneReponse = `$${longueurCorrecteTex}\\text{ cm}$`
    const distracteurs = [
      `$${this.racineTex(carreAC)}\\text{ cm}$`,
      `$${this.racineTex(sommeDesCarres)}\\text{ cm}$`,
      `$${this.racineTex(oubliDuCarre)}\\text{ cm}$`,
      `$${af}\\text{ cm}$`,
      `$${ab}\\text{ cm}$`,
    ].filter(
      (reponse, index, reponses) =>
        reponse !== bonneReponse && reponses.indexOf(reponse) === index,
    )

    this.reponses = [bonneReponse, ...distracteurs.slice(0, 3)]

    const pointA = pointAbstrait(0, 0, 'A', 'left')
    const pointC = pointAbstrait(6, 0, 'C', 'right')
    const pointB = pointAbstrait(1.5, -2.6, 'B', 'below')
    const pointF = pointAbstrait(4.8, 2.4, 'F', 'above')
    const triangleABC = polygone([pointA, pointB, pointC])
    const triangleAFC = polygone([pointA, pointF, pointC])
    triangleABC.epaisseur = 2
    triangleAFC.epaisseur = 2
    const objets = [
      triangleABC,
      triangleAFC,
      codageAngleDroit(pointA, pointB, pointC),
      codageAngleDroit(pointA, pointF, pointC),
      labelPoint(pointA, pointB, pointC, pointF),
      texteSurSegment(`$${ab}\\text{ cm}$`, pointB, pointA, 'black', 0.7),
      texteSurSegment(`$${bc}\\text{ cm}$`, pointC, pointB, 'black', 0.7),
      texteSurSegment(`$${af}\\text{ cm}$`, pointA, pointF, 'black', 0.7),
      texteSurSegment('$?$', pointC, pointF, 'black', -0.7),
    ]
    const figure = mathalea2d(
      Object.assign(
        { pixelsParCm: 20, scale: 0.9, style: 'margin: auto' },
        fixeBordures(objets, {
          rxmin: -0.6,
          rxmax: 0.6,
          rymin: -0.15,
          rymax: 0.45,
        }),
      ),
      objets,
    )

    this.enonce = `Dans la figure ci-dessous, qui n'est pas représentée à l'échelle, le triangle $ABC$ est rectangle en $B$ et le triangle $AFC$ est rectangle en $F$.<br>
On donne $AB=${ab}\\text{ cm}$, $BC=${bc}\\text{ cm}$ et $AF=${af}\\text{ cm}$.<br>
Quelle est la longueur exacte du segment $[FC]$ ?${figure}`

    this.correction = `Dans le triangle $ABC$ rectangle en $B$, le côté $[AC]$ est l'hypoténuse.<br>
D'après le théorème de Pythagore :<br>
$\\begin{aligned}
AC^2&=AB^2+BC^2\\\\
&=${ab}^2+${bc}^2\\\\
&=${ab ** 2}+${bc ** 2}\\\\
&=${carreAC}
\\end{aligned}$<br>
Dans le triangle $AFC$ rectangle en $F$, le côté $[AC]$ est l'hypoténuse.<br>
D'après le théorème de Pythagore :<br>
$\\begin{aligned}
AC^2&=AF^2+FC^2\\\\
FC^2&=AC^2-AF^2\\\\
&=${carreAC}-${af}^2\\\\
&=${carreAC}-${af ** 2}\\\\
&=${carreFC}
\\end{aligned}$<br>
Comme une longueur est positive, $FC=${miseEnEvidence(`${longueurCorrecteTex}\\text{ cm}`)}$.`
  }

  versionAleatoire = () => {
    const ab = randint(3, 10)
    const bc = randint(3, 10, ab)
    const ac = Math.sqrt(ab ** 2 + bc ** 2)
    const af = randint(2, Math.min(10, Math.floor(ac) - 1), ab)
    this.appliquerLesValeurs(ab, bc, af)
  }

  versionOriginale = () => {
    this.appliquerLesValeurs(6, 8, 7)
  }

  constructor() {
    super()

    this.nbQuestions = 1
    this.versionAleatoire()
  }
}
