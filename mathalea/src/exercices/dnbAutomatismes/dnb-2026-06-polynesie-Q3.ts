import { miseEnEvidence } from '../../lib/outils/embellissements'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import { rotation } from '../../lib/2d/transformations'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import { creerNomDePolygone } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'cea14'
export const refs = {
  'fr-fr': ['3AutoM06-2'],
  'fr-ch': ['9R1GM2B-10', '9R2GM2B-10', '9R3GM2B-10'],
}
export const interactifReady = true
export const titre = "Calculer l'aire d'un triangle rectangle"
export const dateDePublication = '11/08/2026'
export const dateDeModifImportante = '30/10/2026'

const triangleJlk = (
  nom: string,
  angleRot: number,
  longueurs: [number, number, number],
) => {
  const [sommet1, sommetRectangle, sommetAngle] = nom
  const B = pointAbstrait(0, 0, sommetRectangle, 'above')
  const C = rotation(
    pointAbstrait(3.5, 0),
    B,
    angleRot,
    sommetAngle,
    'below right',
  )
  const A = rotation(pointAbstrait(0, -2.6), B, angleRot, sommet1, 'below left')
  const objets = [
    polygoneAvecNom(A, C, B),
    codageAngleDroit(C, B, A),
    placeLatexSurSegment(`${texNombre(longueurs[0], 0)}\\text{ cm}`, A, B, {}),
    placeLatexSurSegment(`${texNombre(longueurs[1], 0)}\\text{ cm}`, B, C, {}),
    placeLatexSurSegment(`${texNombre(longueurs[2], 0)}\\text{ cm}`, C, A, {}),
  ]
  return mathalea2d(
    { ...fixeBordures(objets), scale: 0.65, pixelsParCm: 25 },
    objets,
  )
}

const longueursTriangle = (nom: string): [string, string, string] => [
  `${nom[0]}${nom[1]}`,
  `${nom[0]}${nom[2]}`,
  `${nom[1]}${nom[2]}`,
]

/**
 * DNB Centres étrangers juin 2026 - Question 4
 * @author Jean-Claude Lhote
 */
export default class AutoQ4CentresEtrangersBrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
    this.optionsDeComparaison = { texteSansCasse: true }
    this.optionsChampTexte = { texteApres: '$\\text{ cm}^2$', texteAvant: ' ' }
  }

  enonce(
    nom?: string,
    angleRot?: number,
    longueurs?: [number, number, number],
  ) {
    if (nom == null || angleRot == null || longueurs == null) {
      nom = creerNomDePolygone(3, 'Q')
      angleRot = randint(0, 360)
      const factor = choice([2, 3, 4, 5, 10, 20])
      longueurs = [3, 4, 5].map((l) => l * factor) as [number, number, number]
    }
    const angle = `${nom[1]}${nom[2]}${nom[0]}`
    this.reponse = texNombre((longueurs[0] * longueurs[1]) / 2, 0)

    const colonne1 = `Calculer l'aire, en $\\text{cm}^2$, du triangle ci-contre :`
    this.question = deuxColonnesResp(
      colonne1,
      triangleJlk(nom, angleRot, longueurs),
      {
        largeur1: 65,
        widthmincol1: '320px',
        widthmincol2: '180px',
      },
    )

    this.correction = `L'aire d'un triangle rectangle est égale à la moitié du produit des longueurs de ses côtés de l'angle droit. Ici, les côtés de l'angle droit sont $${longueurs.slice(0, 2).join('\\text{ cm }$ et $')}\\text{ cm }$. Donc l'aire du triangle est égale à :<br>
    $\\dfrac{${longueurs[0]}\\text{ cm}\\times ${longueurs[1]}\\text{ cm}}{2} = ${miseEnEvidence(String(this.reponse))}\\text{ cm}^2$.`
  }
  nouvelleVersion() {
    if (this.canOfficielle || this.sup) {
      this.enonce('ABC', 130, [6, 8, 10])
    } else {
      this.enonce()
    }
  }
}
