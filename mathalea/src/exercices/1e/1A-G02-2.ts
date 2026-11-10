import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
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
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const titre = "Calculer l'aire d'un quadrilatère codé"
export const dateDePublication = '19/06/2026'

export const dateDeModifImportante = '29/10/2026'

export const uuid = 'b71d6'

export const refs = {
  'fr-fr': ['1A-G02-2', '2A-G3-2'],
  'fr-ch': ['9R1GM2C-2', '9R2GM2C-2', '9R3GM2C-2'],
}

export const interactifReady = true

export const amcReady = true

/**
 * Calculer l'aire d'un rectangle identifié grâce aux codages.
 * @author Stéphane Guyon
 */
export default class AireQuadrilatereCodeQcm extends ExerciceQcmACourt {
  // En saisie libre, la question est portée par la phrase placée avant le champ
  private enonceFigure = ''
  private reponseSaisie = ''
  clavierReponseCourte = KeyboardType.clavierEntierementPersonnalisable
  texteAvantReponseCourte = "L'aire du quadrilatère $ABCD$ vaut "
  texteApresReponseCourte = ". (Préciser l'unité.)"
  enonceCourt = () =>
    this.enonceFigure +
    (this.interactif ? '' : "<br>Calculer l'aire du quadrilatère $ABCD$.")
  reponseCourte = () => this.reponseSaisie
  compareReponseCourte = compareGrandeur

  private appliquerLesValeurs(longueurEnCm: number, largeurEnMm: number) {
    const largeurEnCm = largeurEnMm / 10
    const aireEnCm2 = longueurEnCm * largeurEnCm
    const perimetreEnCm = 2 * (longueurEnCm + largeurEnCm)

    const A = pointAbstrait(0, 0, 'A', 'below left')
    const B = pointAbstrait(5, 0, 'B', 'below right')
    const C = pointAbstrait(5, 3, 'C', 'above right')
    const D = pointAbstrait(0, 3, 'D', 'above left')
    const quadrilatere = polygone([A, B, C, D])
    quadrilatere.epaisseur = 2

    const objets = [
      quadrilatere,
      labelPoint(A, B, C, D),
      codageAngleDroit(B, A, D),
      codageSegments('//', 'black', A, B, C, D),
      codageSegments('X', 'black', B, C, D, A),
      texteSurSegment(`$${longueurEnCm}\\text{ cm}$`, B, A, 'black', 0.7),
      texteSurSegment(`$${largeurEnMm}\\text{ mm}$`, C, B, 'black', 0.7),
    ]

    const figure = mathalea2d(
      Object.assign(
        { pixelsParCm: 25, scale: 0.8, center: !context.isHtml },
        fixeBordures(objets, {
          rxmin: -0.6,
          rxmax: 0.6,
          rymin: -0.15,
          rymax: 0.45,
        }),
      ),
      objets,
    )

    this.enonceFigure = `Le quadrilatère $ABCD$ ci-dessous n'est pas représenté en vraie grandeur.<br>${figure}`
    this.enonce = `Le quadrilatère $ABCD$ ci-dessous n'est pas représenté en vraie grandeur.<br>
Calculer son aire.<br>
${figure}`
    this.reponseSaisie = reponseGrandeur(aireEnCm2, 'cm^2')
    this.optionsChampReponseCourte = optionsClavierGrandeur({
      unitesEnonce: ['mm', 'cm'],
      dimension: 2,
      unitePrincipale: 'cm',
    })

    this.reponses = [
      `$${aireEnCm2}\\text{ cm}^2$`,
      `$${perimetreEnCm}\\text{ cm}$`,
      `$${perimetreEnCm}\\text{ cm}^2$`,
      `$${aireEnCm2}\\text{ cm}$`,
    ]

    this.correction = `Les côtés opposés de $ABCD$ ont la même longueur et l'un de ses angles est droit : $ABCD$ est donc un rectangle.<br>
On convertit d'abord la largeur en centimètres : $${largeurEnMm}\\text{ mm}=${largeurEnCm}\\text{ cm}$.<br>
L'aire de ce rectangle est :<br>
$\\mathcal{A}=AB\\times BC=${longueurEnCm}\\text{ cm}\\times ${largeurEnCm}\\text{ cm}=${miseEnEvidence(aireEnCm2)}$ ${texteEnCouleurEtGras('cm$^2$')}.`
  }

  versionOriginale = () => {
    this.appliquerLesValeurs(6, 40)
  }

  versionAleatoire = () => {
    let longueurEnCm: number
    let largeurEnCm: number
    do {
      longueurEnCm = randint(2, 9)
      largeurEnCm = randint(2, 9, longueurEnCm)
    } while (longueurEnCm * largeurEnCm === 2 * (longueurEnCm + largeurEnCm))
    this.appliquerLesValeurs(longueurEnCm, 10 * largeurEnCm)
  }

  constructor() {
    super()

    this.nbQuestions = 1
    this.versionAleatoire()
  }
}
