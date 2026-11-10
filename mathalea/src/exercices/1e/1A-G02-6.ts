import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { texteSurSegment } from '../../lib/2d/texteSurSegment'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  compareGrandeur,
  optionsClavierGrandeur,
  reponseGrandeur,
} from '../../lib/interactif/saisieGrandeur'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const titre = "Calculer l'aire d'un triangle quelconque"
export const dateDePublication = '24/06/2026'

export const dateDeModifImportante = '30/10/2026'

export const uuid = 'd8a41'

export const refs = {
  'fr-fr': ['1A-G02-6', '2A-G3-6'],
  'fr-ch': ['9R1GM2B-7', '9R2GM2B-7', '9R3GM2B-7'],
}

export const interactifReady = true

export const amcReady = true

/**
 * Calculer l'aire d'un triangle à partir d'une base et de la hauteur relative.
 * @author Stéphane Guyon
 */
export default class AireTriangleQuelconqueQcm extends ExerciceQcmACourt {
  // En saisie libre, la question est portée par la phrase placée avant le champ
  private enonceFigure = ''
  private reponseSaisie = ''
  clavierReponseCourte = KeyboardType.clavierEntierementPersonnalisable
  texteAvantReponseCourte = "L'aire du triangle $ABC$ vaut "
  texteApresReponseCourte = ". (Préciser l'unité.)"
  enonceCourt = () =>
    this.enonceFigure +
    (this.interactif ? '' : "<br>Calculer l'aire du triangle $ABC$.")
  reponseCourte = () => this.reponseSaisie
  compareReponseCourte = compareGrandeur

  private appliquerLesValeurs(base: number, hauteur: number) {
    const produit = base * hauteur
    const aire = produit / 2

    const A = pointAbstrait(0, 0, 'A', 'below left')
    const B = pointAbstrait(6.5, 0, 'B', 'below right')
    const H = pointAbstrait(4.2, 0, 'H', 'below')
    const C = pointAbstrait(4.2, 3.4, 'C', 'above')
    const coteBaseDepart = pointAbstrait(0, -1)
    const coteBaseArrivee = pointAbstrait(6.5, -1)
    const triangle = polygone([A, B, C])
    triangle.epaisseur = 2
    const hauteurTracee = segment(C, H)
    hauteurTracee.pointilles = 5
    hauteurTracee.epaisseur = 1.5
    const coteBase = segment(coteBaseDepart, coteBaseArrivee)
    coteBase.pointilles = 5
    coteBase.styleExtremites = '<->'
    coteBase.epaisseur = 1.5

    const objets = [
      triangle,
      hauteurTracee,
      coteBase,
      codageAngleDroit(C, H, B),
      labelPoint(A, B, C, H),
      texteSurSegment(
        `$${base}\\text{ cm}$`,
        coteBaseArrivee,
        coteBaseDepart,
        'black',
        0.35,
      ),
      texteSurSegment(`$${hauteur}\\text{ cm}$`, C, H, 'black', 0.35),
    ]

    const figure = mathalea2d(
      Object.assign(
        { pixelsParCm: 25, scale: 0.8, style: 'margin: auto' },
        fixeBordures(objets, {
          rxmin: -0.6,
          rxmax: 0.6,
          rymin: -0.25,
          rymax: 0.45,
        }),
      ),
      objets,
    )

    this.enonceFigure = `Le triangle $ABC$ ci-dessous n'est pas représenté à l'échelle.<br>
 ${figure}`
    this.enonce = `${this.enonceFigure}Son aire est :`
    this.reponseSaisie = reponseGrandeur(aire, 'cm^2')
    this.optionsChampReponseCourte = optionsClavierGrandeur({
      unitesEnonce: ['cm'],
      dimension: 2,
      unitePrincipale: 'cm',
    })

    this.reponses = [
      `$${texNombre(aire)}\\text{ cm}^2$`,
      `$${texNombre(produit)}\\text{ cm}^2$`,
      `$${texNombre(produit / 3)}\\text{ cm}^2$`,
      `$${texNombre(2 * produit)}\\text{ cm}^2$`,
    ]

    this.correction = `L'aire d'un triangle est donnée par la formule :<br>
$\\mathcal{A}=\\dfrac{\\text{base}\\times\\text{hauteur}}{2}$.<br>
Ici, la base mesure $${base}\\text{ cm}$ et la hauteur relative à cette base mesure $${hauteur}\\text{ cm}$.<br>
$\\mathcal{A}=\\dfrac{${base}\\text{ cm}\\times ${hauteur}\\text{ cm}}{2}=\\dfrac{${produit}\\text{ cm}^2}{2}=${miseEnEvidence(texNombre(aire))}$ ${texteEnCouleurEtGras('cm$^2$')}.`
  }

  versionOriginale = () => {
    this.appliquerLesValeurs(8, 6)
  }

  versionAleatoire = () => {
    let base: number
    let hauteur: number
    do {
      base = randint(4, 12)
      hauteur = randint(3, 10)
    } while ((base * hauteur) % 6 !== 0)
    this.appliquerLesValeurs(base, hauteur)
  }

  constructor() {
    super()

    this.nbQuestions = 1
    this.versionAleatoire()
  }
}
