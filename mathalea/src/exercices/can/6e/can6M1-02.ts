import { bleuMathalea } from '../../../lib/colors'
import Decimal from 'decimal.js'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { cercle } from '../../../lib/2d/cercle'
import { polygoneAvecNom } from '../../../lib/2d/polygones'
import { texteParPosition } from '../../../lib/2d/textes'
import { longueur } from '../../../lib/2d/utilitairesGeometriques'
import {
  milieu,
  pointAdistance,
  pointIntersectionCC,
} from '../../../lib/2d/utilitairesPoint'
import { texteEnCouleur, miseEnEvidence } from '../../../lib/outils/embellissements'
import { creerNomDePolygone } from '../../../lib/outils/outilString'
import { stringNombre, texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer le périmètre d’une figure'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'

/**
 * @author Gilles Mora
 * Créé pendant l'été 2021

 */
export const uuid = 'e52ba'

export const refs = {
  'fr-fr': ['can6M1-02', 'CM1M1H-flash2'],
  'fr-ch': [],
}
export default class Perimetre extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const nom = creerNomDePolygone(4, ['QD'])
    const a = this.quotaRandint('a', 3, 6) //
    const c = (randint(3, 5) * 10 + randint(3, 9)) / 10
    const A = pointAbstrait(0, 0, nom[0])
    const B = pointAdistance(A, c, 0, nom[1])
    const C = pointAdistance(B, a, randint(7, 11) * 10, nom[2])
    const l = Math.ceil(longueur(A, C) + 1)
    const b = Math.floor(l / 2)
    const d = l - b - c + Math.floor(c)
    const c1 = cercle(C, d)
    const c2 = cercle(A, b)
    const D = pointIntersectionCC(c1, c2, nom[3], 1)
    const objets = []
    const xmin = Math.min(A.x, B.x, C.x, D.x) - 1.5
    const ymin = Math.min(A.y, B.y, C.y, D.y) - 1.5
    const xmax = Math.max(A.x, B.x, C.x, D.x) + 1.5
    const ymax = Math.max(A.y, B.y, C.y, D.y) + 1.5
    const pol = polygoneAvecNom(A, B, C, D) // polygoneAvecNom s'occupe du placement des noms des sommets
    const reponse = new Decimal(a).add(b).add(c).add(d)
    objets.push(pol[0], pol[1], tracePoint(A, B, C, D)) // pol[0], c'est le tracé et pol[1] ce sont les labels
    objets.push(
      texteParPosition(
        `${stringNombre(b)} m`,
        milieu(A, D).x - 0.8,
        milieu(A, D).y,
      ),
      texteParPosition(
        `${stringNombre(a)} m`,
        milieu(B, C).x + 0.8,
        milieu(B, C).y,
      ),
      texteParPosition(
        `${stringNombre(c)} m`,
        milieu(A, B).x,
        milieu(A, B).y - 0.6,
      ),
      texteParPosition(
        `${stringNombre(d)} m`,
        milieu(C, D).x,
        milieu(C, D).y + 0.5,
      ),
    )

    this.question =
      `Quel est le périmètre du quadrilatère $${nom}$ ?<br>

    ` +
      mathalea2d(
        {
          xmin,
          ymin,
          xmax,
          ymax,
          pixelsParCm: 20,
          mainlevee: true,
          amplitude: 0.5,
          scale: 0.6,
          center: !context.isHtml,
        },
        objets,
      )
    this.reponse = reponse
    this.correction = ` Le périmètre est : $${miseEnEvidence(texNombre(reponse, 1))}\\text{ m}$. `
    this.optionsChampTexte = { texteApres: '$\\text{ m}$' }
    this.correction += texteEnCouleur(`<br> Mentalement : <br>
   On doit calculer la somme des valeurs. On regroupe pour faciliter le calcul : <br>
   $\\underbrace{${texNombre(a, 1)}+${texNombre(b, 1)}}_{${texNombre(a + b, 1)}}+\\underbrace{${texNombre(c, 1)}+${texNombre(d, 1)}}_{${texNombre(new Decimal(c).add(d), 1)}}=${texNombre(reponse, 1)}\\text{ m}$.`, bleuMathalea)

    this.canReponseACompleter = ' $\\dots\\text{ m}$'
  }
}
