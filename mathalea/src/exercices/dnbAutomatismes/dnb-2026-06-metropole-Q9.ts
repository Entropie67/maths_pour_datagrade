import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { pgcd } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'c9ba3'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['9R1GM1A-8', '9R2GM1A-8', '9R3GM1A-8', 'PRQMG01B-13'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Calculer le périmètre d'un rectangle"
export const dateDePublication = '12/08/2026'
const triangleJlk = (nom: string, longueurs: [number, number, number]) => {
  const [sommetRectangle, sommetAngle, sommet1] = Array.from(nom)
  const B = pointAbstrait(0, 0, sommet1, 'left')
  const C = pointAbstrait(8, 0, sommetRectangle, 'right')
  const A = pointAbstrait(8, 6, sommetAngle, 'above')

  const objets = [
    polygoneAvecNom(A, C, B),
    codageAngleDroit(B, C, A),
    placeLatexSurSegment(`${texNombre(longueurs[1], 0)}\\text{ cm}`, A, C, {
      horizontal: true,
      distance: 1,
    }),
    placeLatexSurSegment(`${texNombre(longueurs[0], 0)}\\text{ cm}`, C, B, {
      horizontal: true,
      distance: 1,
    }),
    placeLatexSurSegment(`${texNombre(longueurs[2], 0)}\\text{ cm}`, B, A, {
      horizontal: true,
      distance: 1,
    }),
  ]
  return mathalea2d(
    { ...fixeBordures(objets), scale: 0.65, pixelsParCm: 25 },
    objets,
  )
}
/**
 * DNB Métropole juin 2026 - Question 8
 * Calculer le périmètre d'un rectangle
 * @author Jean-Claude Lhote
 */
export default class AutoQ8Metropole2026 extends ExerciceQcmA {
  private appliquerLesValeurs(
    nom: string,
    longueurs: [number, number, number],
    fonctionTrigo: 'cos' | 'sin' | 'tan',
  ): void {
    this.enonce =
      `Parmi les propositions suivantes, laquelle donne ${
        fonctionTrigo === 'tan'
          ? 'la tangente'
          : fonctionTrigo === 'sin'
            ? 'le sinus'
            : 'le cosinus'
      } de l’angle $\\widehat{${nom}}$ dans le triangle rectangle
ci-dessous ?<br>` + triangleJlk(nom, longueurs)
    const p = pgcd(longueurs[0], longueurs[1], longueurs[2])
    const [a, b, c] = longueurs.map((l) => l / p)

    const num = fonctionTrigo === 'cos' ? b : fonctionTrigo === 'sin' ? a : a
    const denom = fonctionTrigo === 'tan' ? b : c
    this.reponses = [
      `$\\dfrac{${num}}{${denom}}$`,
      `$\\dfrac{${denom}}{${num}}$`,
      `$\\dfrac{${choice([a, b, c], [num, denom])}}{${num}}$`,
      `$\\dfrac{${choice([a, b, c], [num, denom])}}{${denom}}$`,
    ]

    this.correction = ``
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs('EDF', [8, 6, 10], 'cos')
  }

  versionAleatoire = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    const factor = choice([2, 3, 4, 5])
    const triplet = [4, 3, 5].map((n) => n * factor)
    const nom = creerNomDePolygone(3)
    do {
      this.appliquerLesValeurs(
        nom,
        triplet as [number, number, number],
        choice(['cos', 'sin', 'tan']),
      )
    } while (aLeBonNombreDePropsDifferentes(this, 4) === false)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
