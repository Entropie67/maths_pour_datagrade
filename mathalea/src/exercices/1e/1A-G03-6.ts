import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { homothetie } from '../../lib/2d/transformations'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import {
  all,
  isEqual,
  isReduced,
  onlyDecimalNumbers,
} from '../../lib/interactif/checks'
import ExerciceQcmACourt from '../ExerciceQcmACourt'

export const titre =
  'Calculer une longueur dans une configuration de Thalès avec une différence'
export const dateDePublication = '20/06/2026'

export const dateDeModifImportante = '22/10/2026'

export const uuid = 'c1def'

export const refs = {
  'fr-fr': ['1A-G03-6', '2A-G4-3'],
  'fr-ch': ['11LCGM3B-7', '11LSGM3B-7'],
}

export const interactifReady = true

export const amcReady = true

type Fraction = [numerateur: number, denominateur: number]

/**
 * Calculer ZO dans une configuration de Thalès en résolvant une équation.
 * @author Stéphane Guyon
 */
export default class LongueurThalesAvecDifferenceQcm extends ExerciceQcmACourt {
  // Question ouverte par défaut (QCM en option) : la longueur s'écrit avant « cm »
  clavierReponseCourte = KeyboardType.lyceeClassique
  // Seul un nombre entier ou décimal est accepté (pas de fraction ni de calcul)
  compareReponseCourte = all([
    isEqual(),
    onlyDecimalNumbers(),
    isReduced({ allowReducibleFractions: true }),
  ])
  texteApresReponseCourte = ' cm'
  enonceCourt = () =>
    `${this.enonce}<br>Le résultat doit être écrit sous la forme d'un nombre entier ou décimal.`

  private fractionIrreductible([numerateur, denominateur]: Fraction): Fraction {
    const diviseur = pgcd(Math.abs(numerateur), Math.abs(denominateur))
    return [numerateur / diviseur, denominateur / diviseur]
  }

  private fractionTex(fraction: Fraction) {
    const [numerateur, denominateur] = this.fractionIrreductible(fraction)
    return denominateur === 1
      ? `${numerateur}`
      : `\\dfrac{${numerateur}}{${denominateur}}`
  }

  private appliquerLesValeurs(
    longueurOR: number,
    longueurCP: number,
    longueurOC: number,
    longueurZO: number,
  ) {
    const candidatsDistracteurs = shuffle<Fraction>([
      [longueurOC * longueurCP, longueurCP - longueurOR],
      [longueurOC * longueurCP, longueurOR],
      [longueurOC * longueurOR, longueurCP],
      [longueurZO + 1, 1],
      [longueurZO + 2, 1],
      [longueurZO + 3, 1],
    ])
    const valeursDejaUtilisees = new Set([`${longueurZO}/1`])
    const distracteurs = candidatsDistracteurs.filter((fraction) => {
      const fractionReduite = this.fractionIrreductible(fraction)
      const cle = fractionReduite.join('/')
      if (fractionReduite[0] <= 0 || valeursDejaUtilisees.has(cle)) return false
      valeursDejaUtilisees.add(cle)
      return true
    })

    this.texteAvantReponseCourte = '$ZO=$'
    this.reponses = [
      [longueurZO, 1] as Fraction,
      ...distracteurs.slice(0, 3),
    ].map((fraction) => `$${this.fractionTex(fraction)}\\text{ cm}$`)

    const Z = pointAbstrait(0, 0, 'Z', 'below left')
    const P = pointAbstrait(6, 0, 'P', 'below right')
    const C = pointAbstrait(4.8, 3.8, 'C', 'above')
    const rapportReduction = longueurOR / longueurCP
    const O = homothetie(C, Z, rapportReduction, 'O')
    const R = homothetie(P, Z, rapportReduction, 'R')
    O.positionLabel = 'above left'
    R.positionLabel = 'below'
    const grandTriangle = polygone([Z, C, P])
    const segmentOR = segment(O, R)
    const objets = [grandTriangle, segmentOR, labelPoint(Z, O, R, C, P)]
    const figure = mathalea2d(
      Object.assign(
        { scale: 0.7 },
        fixeBordures(objets, {
          rxmin: -0.6,
          rxmax: 0.6,
          rymin: -0.15,
          rymax: 0.45,
        }),
      ),
      objets,
    )

    this.enonce = `La figure suivante n'est pas à l'échelle.<br>${figure}
Les points $Z$, $O$ et $C$ sont alignés.<br>
Les points $Z$, $R$ et $P$ sont alignés.<br>
Les droites $(OR)$ et $(CP)$ sont parallèles.<br>
On donne $OR=${longueurOR}\\text{ cm}$, $CP=${longueurCP}\\text{ cm}$ et $OC=${longueurOC}\\text{ cm}$.<br>
Quelle est la longueur du segment $[ZO]$ ?`

    this.correction = `Dans les triangles $ZOR$ et $ZCP$, les points $Z$, $O$ et $C$ sont alignés, ainsi que les points $Z$, $R$ et $P$. Les droites $(OR)$ et $(CP)$ sont parallèles.<br>
D'après le théorème de Thalès :
$\\dfrac{ZO}{ZC}=\\dfrac{OR}{CP}$.<br>
On pose $ZO=x$. Comme $OC=${longueurOC}\\text{ cm}$, on a $ZC=x+${longueurOC}$.<br>
On obtient donc l'équation :
$\\dfrac{x}{x+${longueurOC}}=\\dfrac{${longueurOR}}{${longueurCP}}$.<br>
Par produit en croix :<br>
$${longueurCP}x=${longueurOR}(x+${longueurOC})$<br>
$${longueurCP}x=${longueurOR}x+${longueurOR * longueurOC}$<br>
$${longueurCP - longueurOR}x=${longueurOR * longueurOC}$<br>
$x=\\dfrac{${longueurOR * longueurOC}}{${longueurCP - longueurOR}}=${longueurZO}$.<br>
Ainsi, $ZO=${miseEnEvidence(`${longueurZO}${this.sup3 ? '\\text{ cm}' : ''}`)}${this.sup3 ? '' : '\\text{ cm}'}$.`
  }

  versionAleatoire = () => {
    const coefficient = choice([2, 3, 4])
    const longueurOR = randint(2, 5)
    let longueurZO: number
    do {
      longueurZO = randint(2, 6)
    } while (longueurZO === longueurOR)
    this.appliquerLesValeurs(
      longueurOR,
      coefficient * longueurOR,
      (coefficient - 1) * longueurZO,
      longueurZO,
    )
  }

  constructor() {
    super()

    this.nbQuestions = 1
    this.versionAleatoire()
  }
}
