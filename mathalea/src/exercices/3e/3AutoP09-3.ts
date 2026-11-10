import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { courbe } from '../../lib/2d/Courbe'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { lectureAntecedent } from '../../lib/2d/LectureAntecedent'
import { lectureImage } from '../../lib/2d/LectureImage'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { repere } from '../../lib/2d/reperes'
import { labelPoint } from '../../lib/2d/textes'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arrondi } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import ExerciceSimple from '../ExerciceSimple'

export const titre = "Trouver une grandeur en fonction d'une autre"

export const interactifReady = true

export const dateDePublication = '3/01/2026'
export const dateDeModifImportante = '31/10/2026'

export const uuid = '5bc80'

export const refs = {
  'fr-fr': ['3AutoP04-3'],
  'fr-ch': ['PRQPF04C-2'],
}

/**
 * @author Jean-claude Lhote
 */
export default class LongueurEtAire extends ExerciceSimple {
  constructor() {
    super()
    this.nbQuestions = 1
    this.optionsDeComparaison = { estDansIntervalle: true }
    this.formatChampTexte = KeyboardType.clavierNumbers
  }

  nouvelleVersion(): void {
    const coteTriangle = randint(8, 14)
    const f = (x: number) => x * (coteTriangle - x)

    const largeur = randint(2, coteTriangle - 1)
    const aireMax = f(coteTriangle / 2)
    const aire = randint(1, Math.floor(aireMax / 10)) * 10
    const choix = choice([true, false])
    const A = pointAbstrait(0, 0, 'A', 'below left')
    const B = pointAbstrait(8, 0, 'B', 'below right')
    const C = pointAbstrait(0, 8, 'C', 'above left')
    const tri = polygone(A, B, C)
    const D = pointAbstrait(6, 0, 'D', 'below')
    const F = pointAbstrait(0, 2, 'F', 'left')
    const E = pointAbstrait(D.x, F.y, 'E', 'above right')
    const rect = polygone(A, D, E, F)
    const labels = labelPoint(A, B, C, D, E, F)
    const ad = codageAngleDroit(B, A, C)
    const x = placeLatexSurSegment('x', D, A, {})
    const objets2 = [tri, rect, labels, ad, x]
    const figure = mathalea2d(
      Object.assign(
        { scale: 0.7, display: 'inline-block' } as const,
        fixeBordures(objets2, { rxmin: -2, rymin: -2 }),
      ),
      objets2,
    )

    const rep = repere({
      xMin: 0,
      xMax: choix ? coteTriangle / 2 : coteTriangle,
      yMin: 0,
      yMax: aireMax + 15,
      xUnite: 1,
      yUnite: 0.2,
      yThickDistance: 10,
      yLabelDistance: 10,
      grilleSecondaireY: true,
      grilleSecondaireYDistance: 0.2,
      grilleSecondaireX: true,
      grilleSecondaireXDistance: 0.2,
      xLegende: '$AD\\text{ (cm)}$',
      xLegendePosition: [
        choix ? (coteTriangle - 1) / 2 + 2.5 : coteTriangle + 2,
        -0.5,
      ],
      yLegende: '$\\text{Aire de } ADEF \\text{ (cm}^2\\text{)}$',
      yLegendePosition: [6, (aireMax + 15) / 5 + 0.5],
    })
    const cF = courbe(f, {
      repere: rep,
      xMin: 0,
      xMax: choix ? coteTriangle / 2 : coteTriangle,
    })
    const objets: NestedObjetMathalea2dArray = [rep, cF]
    const objetsCorr: NestedObjetMathalea2dArray = [
      ...objets,
      choix
        ? lectureAntecedent(
            (coteTriangle - Math.sqrt(coteTriangle ** 2 - 4 * aire)) / 2,
            aire,
            1,
            5,
            'red',
            '',
            '',
          )
        : lectureImage(largeur, f(largeur), 1, 5, 'red', '', ''),
    ]
    const graphique = mathalea2d(
      Object.assign(
        { scale: 0.7, display: 'inline-block', pixelsParCm: 30 } as const,
        fixeBordures(objets),
      ),
      objets,
    )
    const graphiqueCorr = mathalea2d(
      Object.assign(
        { scale: 0.7, display: 'inline-block', pixelsParCm: 30 } as const,
        fixeBordures(objetsCorr),
      ),
      objetsCorr,
    )
    this.correction = graphiqueCorr + '<br><br>'
    this.question = `${graphique}${figure}<br><br>
    Sur le graphique ci-dessus, on a représenté la relation entre la longueur $AD$ et l'aire du rectangle $ADEF$.<br>`
    if (choix) {
      this.question += `Quelle est la longueur $AD$ lorsque l'aire du rectangle $ADEF$ vaut $${aire}\\text{ cm}^2$ ?`
      const reponseNumerique =
        (coteTriangle - Math.sqrt(coteTriangle ** 2 - 4 * aire)) / 2

      this.reponse = `[${arrondi(reponseNumerique - 0.25, 1)};${arrondi(reponseNumerique + 0.25, 1)}]`
      this.optionsChampTexte = { texteApres: ' $\\text{ cm}$' }
      this.correction += `On cherche $AD$ tel que $\\text{Aire}_{ADEF} = ${aire}\\text{ cm}^2$.<br>
      On trouve $AD=${miseEnEvidence(texNombre(reponseNumerique, 1))}\\text{ cm}$.`
    } else {
      this.question += `Quelle est l'aire du rectangle $ADEF$ lorsque la longueur $AD$ vaut $${largeur}\\text{ cm}$ ?`
      this.reponse = `[${Math.floor(f(largeur)) - 2};${Math.ceil(f(largeur)) + 2}]`
      this.optionsChampTexte = { texteApres: ' $\\text{ cm}^2$' }
      this.correction += `On cherche $\\text{Aire}_{ADEF}$ lorsque $AD = ${largeur}\\text{ cm}$.<br>`
      this.correction += `On trouve $\\text{Aire}_{ADEF}=${miseEnEvidence(f(largeur).toFixed(0))}\\text{ cm}^2$.`
    }
  }
}
