import { cercle } from '../../../lib/2d/cercle'
import { symboleParallele } from '../../../lib/outils/notationsGeometrie'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygoneAvecNom } from '../../../lib/2d/polygones'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { homothetie } from '../../../lib/2d/transformations'
import { pointIntersectionCC } from '../../../lib/2d/utilitairesPoint'
import { choisitLettresDifferentes } from '../../../lib/outils/aleatoires'
import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
import { sp } from '../../../lib/outils/outilString'

export const uuid = 'be991'
export const refs = {
  'fr-fr': ['3G2QCM-2'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'QCM Brevet Amérique du Sud 2024 : Thalès'
export const dateDePublication = '05/12/2024'
/**
 * Ceci est un exo construit à partir d'une question de qcm de Bac.
 * Il utilise la classe ExerciceQcm qui définit les contours de l'exo (sans version aléatoire)
 * Ce moule à exo dispose d'une méthode qcmCamExport qui permet de récupérer le JSON de la question et de la reponse pour qcmCam.
 * Il est interactif et dispose d'un export AMC d'office
 * @author Jean-claude Lhote
 */
export default class AmeriqueSud1224Ex1Q3 extends ExerciceQcmA {
  private appliquerLesValeurs(BD: number, BC: number, AC: number): void {
    const labels = choisitLettresDifferentes(5)
    const HD = (AC * BD) / BC
    const HD1 = HD - 0.8
    const HD2 = HD + 0.8
    const HD3 = HD + 1.2
    const HD4 = HD - 1.2
    const choix = shuffle([HD1, HD2, HD3, HD4].filter((x) => x > 0))
    this.reponses = [
      `$${texNombre(HD, 2)}\\text{ cm}$`,
      `$${texNombre(choix[0], 1)}\\text{ cm}$`,
      `$${texNombre(choix[1], 1)}\\text{ cm}$`,
    ]
    const objets = []
    const B = pointAbstrait(0, 0, labels[2])
    const D = pointAbstrait(BD, 0, labels[3])
    const C = pointAbstrait(BC, 0, labels[4])
    const r = randint(AC - BC + 1, AC + BC - 1)
    const C1 = cercle(B, r)
    const C2 = cercle(C, AC)
    const A = pointIntersectionCC(C1, C2, labels[0], choice([1, 2]))
    const H = homothetie(A, B, BD / BC, labels[1])
    const poly = polygoneAvecNom(A, H, B, D, C, 0.8)
    const segHD = segment(H, D)
    objets.push(poly, segHD)
    const figure = mathalea2d(
      Object.assign({ scale: 0.5 }, fixeBordures(objets)),
      objets,
    )
    this.enonce = `${figure}${context.isHtml ? '' : '\n\n'}
    $${labels[2]}$, $${labels[1]}$ et $${labels[0]}$ sont alignés.<br>
    $${labels[2]}$, $${labels[3]}$ et $${labels[4]}$ sont alignés.<br>
    $${labels[2]}${labels[3]} = ${BD}\\text{ cm}$ ; $${labels[2]}${labels[4]} = ${BC}\\text{ cm}$ ; $${labels[0]}${labels[4]} = ${AC}\\text{ cm}$.<br>
    $(${labels[3]}${labels[1]})${symboleParallele()}(${labels[4]}${labels[0]})$.<br>
    Quelle est la longueur du segment $${labels[1]}${labels[3]}$${sp()}?`
    this.correction = `Cette figure est une configuration de Thalès. On a $\\dfrac{${labels[2]}${labels[4]}}{${labels[2]}${labels[3]}}=\\dfrac{${labels[0]}${labels[4]}}{${labels[1]}${labels[3]}}$.<br>
    Donc $\\dfrac{${BC}}{${BD}}=\\dfrac{${AC}}{${labels[1]}${labels[3]}}$, soit  : $${labels[1]}${labels[3]}=\\dfrac{${BD}\\times${AC}}{${BC}}=${texNombre(HD, 2)}\\text{ cm}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(2, 10, 16)
  }

  versionAleatoire: () => void = () => {
    const nbReponses = 1
    do {
      const BD = randint(2, 3)
      const c = choice([2, 4, 5])
      const BC = c * BD
      const AC = randint(BC + 1, BC + 5)

      this.appliquerLesValeurs(BD, BC, AC)
    } while (nombreElementsDifferents(this.reponses) < nbReponses)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
