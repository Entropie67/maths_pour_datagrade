import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { afficheMesureAngle } from '../../../lib/2d/AfficheMesureAngle'
import { codageAngleDroit } from '../../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../../lib/2d/CodageSegment'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../../lib/2d/polygones'
import { bleuMathalea } from '../../../lib/colors'
import { creerNomDePolygone } from '../../../lib/outils/outilString'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import ExerciceSimple from '../../ExerciceSimple'

/**
+ * Calcule la tangente d'un angle en degrés
+ */
function degTan(deg: number): number {
  return Math.tan((deg * Math.PI) / 180)
}

export const titre = 'Calculer un angle dans un triangle isocèle'
export const interactifReady = true

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
 */
export const uuid = '7b386'

export const refs = {
  'fr-fr': ['can5G-02', '5G5autoB-1', '2G10-flash1'],
  'fr-ch': [],
}
export default class AngleTriangleIsocele extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'

    this.nbQuestions = 1
  }

  nouvelleVersion() {
    let objets
    const nom = creerNomDePolygone(3, ['QD'])
    const a = this.quotaRandint('a', 8, 14, [12]) * 5
    const hauteur = 2.5 * degTan(a)
    // On varie l'orientation de la figure pour ne pas toujours présenter la base
    // horizontale avec les deux angles égaux en bas.
    let coordA: [number, number] = [0, 0]
    let coordB: [number, number] = [5, 0]
    let coordC: [number, number] = [2.5, hauteur]
    switch (
      this.quotaChoice('orientation', ['bas', 'droite', 'gauche', 'haut'])
    ) {
      case 'haut': // base horizontale, sommet principal au-dessus
        coordA = [0, 0]
        coordB = [5, 0]
        coordC = [2.5, hauteur]
        break
      case 'bas': // base horizontale, sommet principal en dessous
        coordA = [0, 0]
        coordB = [5, 0]
        coordC = [2.5, -hauteur]
        break
      case 'droite': // base verticale, sommet principal à droite
        coordA = [0, 0]
        coordB = [0, 5]
        coordC = [hauteur, 2.5]
        break
      case 'gauche': // base verticale, sommet principal à gauche
        coordA = [0, 0]
        coordB = [0, 5]
        coordC = [-hauteur, 2.5]
        break
    }
    const A = pointAbstrait(coordA[0], coordA[1], nom[0])
    const B = pointAbstrait(coordB[0], coordB[1], nom[1])
    const C = pointAbstrait(coordC[0], coordC[1], nom[2])
    const pol = polygoneAvecNom(A, B, C)

    switch (this.quotaChoice('typeDeQuestions', ['a', 'b'])) {
      case 'a':
        objets = []

        objets.push(pol[0], pol[1])
        objets.push(
          afficheMesureAngle(B, A, C, 'black', 1, a + '^\\circ'),
          codageSegments('||', bleuMathalea, C, A, C, B),
        )
        this.question = `Quelle est la mesure en degré de l'angle $\\widehat{${nom[2]}}$ ? <br>
        `
        this.question += mathalea2d(
          Object.assign(
            {
              pixelsParCm: 20,
              mainlevee: false,
              amplitude: 0.3,
              scale: 1,
              center: !context.isHtml,
            },
            fixeBordures(objets),
          ),
          objets,
        )
        this.optionsChampTexte = { texteApres: ' °' }
        this.correction = ` Le triangle est isocèle. Ses deux angles à la base sont égaux.<br>
        Ainsi $\\widehat{${nom[2]}}=180°-2\\times ${a}°=${miseEnEvidence(texNombre(180 - 2 * a))}°$
    <br>`
        this.reponse = 180 - 2 * a
        break
      case 'b':
        objets = []
        objets.push(pol[0], pol[1])
        objets.push(
          a === 45
            ? codageAngleDroit(A, C, B)
            : afficheMesureAngle(A, C, B, 'black', 1, 180 - 2 * a + '^\\circ'),
          codageSegments('||', bleuMathalea, C, A, C, B),
        )
        this.question = `Quelle est la mesure en degré de l'angle $\\widehat{${nom[1]}}$ ?<br>
            `
        this.question += mathalea2d(
          Object.assign(
            {
              pixelsParCm: 20,
              mainlevee: false,
              amplitude: 0.3,
              scale: 0.8,
              center: !context.isHtml,
            },
            fixeBordures(objets),
          ),
          objets,
        )
        this.optionsChampTexte = { texteApres: ' °' }
        this.correction = ` Le triangle est isocèle. Ses deux angles à la base sont égaux.<br>
          Ainsi $\\widehat{${nom[1]}}=(180-${180 - 2 * a})\\div 2=${miseEnEvidence(texNombre(a))}$.
      <br>`
        this.reponse = a

        break
    }

    this.canReponseACompleter = '$\\ldots ^\\circ$'
  }
}
