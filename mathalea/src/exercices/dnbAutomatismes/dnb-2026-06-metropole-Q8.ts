import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = 'c9aa3'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['9R1GM1A-7', '9R2GM1A-7', '9R3GM1A-7', 'PRQMG01B-12'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Calculer le périmètre d'un rectangle"
export const dateDePublication = '12/08/2026'
function rectangle(longueur: number, largeur: number): string {
  const A = pointAbstrait(0, 0)
  const B = pointAbstrait(7, 0)
  const C = pointAbstrait(7, 3)
  const D = pointAbstrait(0, 3)
  const pol = polygone(A, B, C, D)
  const l = placeLatexSurSegment(`${longueur}\\text{ mm}`, D, C, {
    horizontal: true,
  })
  const L = placeLatexSurSegment(`${largeur}\\text{ mm}`, C, B, {
    horizontal: true,
    distance: 1.2,
  })
  const objets: NestedObjetMathalea2dArray = [
    pol,
    l,
    L,
    codageAngleDroit(A, B, C),
    codageAngleDroit(B, C, D),
    codageAngleDroit(C, D, A),
    codageAngleDroit(D, A, B),
  ]
  return mathalea2d(Object.assign({}, fixeBordures(objets)), objets)
}
/**
 * DNB Métropole juin 2026 - Question 8
 * Calculer le périmètre d'un rectangle
 * @author Jean-Claude Lhote
 */
export default class AutoQ8Metropole2026 extends ExerciceQcmA {
  private appliquerLesValeurs(longueur: number, largeur: number): void {
    this.enonce =
      `Parmi les propositions suivantes, laquelle est le périmètre de la figure ci-dessous ?<br>` +
      rectangle(longueur, largeur)
    this.reponses = [
      `$${texNombre(longueur * 2 + largeur * 2, 0)}\\text { mm}$`,
      `$${texNombre(longueur * 2 + largeur * 2, 0)}\\text { mm}^2$`,
      `$${texNombre(longueur * largeur, 0)}\\text { mm}$`,
      `$${texNombre(longueur * largeur, 0)}\\text { mm}^2$`,
    ]

    this.correction = ``
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(10, 5)
  }

  versionAleatoire = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    let longueur: number, largeur: number
    do {
      longueur = randint(4, 6) * 2
      largeur = randint(4, longueur - 1)
    } while (longueur * 2 + largeur * 2 === longueur * largeur)

    this.appliquerLesValeurs(longueur, largeur)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
