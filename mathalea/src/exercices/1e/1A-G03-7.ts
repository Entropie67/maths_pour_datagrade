import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { labelPoint } from '../../lib/2d/textes'
import { homothetie } from '../../lib/2d/transformations'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice } from '../../lib/outils/arrayOutils'
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
  'Calculer un côté parallèle avec le théorème de Thalès en configuration papillon'
export const dateDePublication = '21/06/2026'

export const dateDeModifImportante = '22/10/2026'

export const uuid = '00cfb'

export const refs = {
  'fr-fr': ['1A-G03-7', '2A-G4-4'],
  'fr-ch': [],
}

export const interactifReady = true

export const amcReady = true

type CoteParallele = 'petit' | 'grand'
type Diagonale = 'HBA' | 'DBC'
type Fraction = [numerateur: number, denominateur: number]

/**
 * Calculer un côté parallèle après avoir déterminé une demi-diagonale
 * par différence dans une configuration de Thalès en papillon.
 * @author Stéphane Guyon
 */
export default class CoteParalleleThalesPapillonQcm extends ExerciceQcmACourt {
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
    coefficient: number,
    petiteDemiDiagonale: number,
    petitCoteParallele: number,
    coteCherche: CoteParallele,
    diagonale: Diagonale,
  ) {
    const [nomA, nomH, nomB, nomD, nomC] = choisitLettresDifferentes(5)
    const grandeDemiDiagonale = coefficient * petiteDemiDiagonale
    const diagonaleComplete = petiteDemiDiagonale + grandeDemiDiagonale
    const grandCoteParallele = coefficient * petitCoteParallele
    const nomPetitCoteParallele = `${nomH}${nomD}`
    const nomGrandCoteParallele = `${nomA}${nomC}`
    const nomCoteCherche =
      coteCherche === 'petit' ? nomPetitCoteParallele : nomGrandCoteParallele
    const nomCoteParalleleDonne =
      coteCherche === 'petit' ? nomGrandCoteParallele : nomPetitCoteParallele
    const coteParalleleDonne =
      coteCherche === 'petit' ? grandCoteParallele : petitCoteParallele
    const valeurCorrecte =
      coteCherche === 'petit' ? petitCoteParallele : grandCoteParallele
    const nomPetiteDemiDiagonale =
      diagonale === 'HBA' ? `${nomB}${nomH}` : `${nomB}${nomD}`
    const nomGrandeDemiDiagonale =
      diagonale === 'HBA' ? `${nomB}${nomA}` : `${nomB}${nomC}`
    const nomDiagonaleComplete =
      diagonale === 'HBA' ? `${nomH}${nomA}` : `${nomD}${nomC}`
    const nomDemiDiagonaleDonnee =
      coteCherche === 'petit' ? nomPetiteDemiDiagonale : nomGrandeDemiDiagonale
    const demiDiagonaleDonnee =
      coteCherche === 'petit' ? petiteDemiDiagonale : grandeDemiDiagonale
    const nomDemiDiagonaleCalculee =
      coteCherche === 'petit' ? nomGrandeDemiDiagonale : nomPetiteDemiDiagonale
    const demiDiagonaleCalculee =
      coteCherche === 'petit' ? grandeDemiDiagonale : petiteDemiDiagonale

    const bonneReponse: Fraction = [
      coteParalleleDonne * demiDiagonaleDonnee,
      demiDiagonaleCalculee,
    ]
    const reponses: Fraction[] = [
      bonneReponse,
      [coteParalleleDonne * demiDiagonaleDonnee, diagonaleComplete],
      [coteParalleleDonne * demiDiagonaleCalculee, demiDiagonaleDonnee],
      [coteParalleleDonne * diagonaleComplete, demiDiagonaleDonnee],
    ]
    this.texteAvantReponseCourte = `$${nomCoteCherche}=$`
    this.reponses = reponses.map(
      (reponse) => `$${this.fractionTex(reponse)}\\text{ cm}$`,
    )

    const pointB = pointAbstrait(0, 0, nomB, 'above')
    const pointC = pointAbstrait(5, 0, nomC, 'below right')
    const pointA = pointAbstrait(4, 3, nomA, 'above right')
    const rapportHomothetie = -1 / coefficient
    const pointH = homothetie(pointA, pointB, rapportHomothetie, nomH)
    const pointD = homothetie(pointC, pointB, rapportHomothetie, nomD)
    pointH.positionLabel = 'below left'
    pointD.positionLabel = 'above left'
    const grandTriangle = polygone([pointA, pointB, pointC])
    const petitTriangle = polygone([pointH, pointB, pointD])
    const objets = [
      grandTriangle,
      petitTriangle,
      labelPoint(pointA, pointH, pointB, pointD, pointC),
    ]
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

    this.enonce = `La figure suivante n'est pas à l'échelle.${figure}
$${nomH}$, $${nomB}$ et $${nomA}$ sont alignés.<br>
$${nomD}$, $${nomB}$ et $${nomC}$ sont alignés.<br>
Les droites $(${nomH}${nomD})$ et $(${nomA}${nomC})$ sont parallèles.<br>
On donne $${nomCoteParalleleDonne}=${coteParalleleDonne}\\text{ cm}$, $${nomDemiDiagonaleDonnee}=${demiDiagonaleDonnee}\\text{ cm}$ et $${nomDiagonaleComplete}=${diagonaleComplete}\\text{ cm}$.<br>
Quelle est la longueur du segment $[${nomCoteCherche}]$ ?`

    const relationThales = `\\dfrac{${nomPetitCoteParallele}}{${nomGrandCoteParallele}}=\\dfrac{${nomPetiteDemiDiagonale}}{${nomGrandeDemiDiagonale}}`
    this.correction = `Le point $${nomB}$ appartient au segment $[${nomDiagonaleComplete}]$. On calcule d'abord la longueur manquante :<br>
$${nomDemiDiagonaleCalculee}=${nomDiagonaleComplete}-${nomDemiDiagonaleDonnee}=${diagonaleComplete}-${demiDiagonaleDonnee}=${demiDiagonaleCalculee}\\text{ cm}$.<br>
Le point $${nomB}$ appartient au segment $[${nomD}${nomC}]$.<br>
Les droites $(${nomH}${nomD})$ et $(${nomA}${nomC})$ sont parallèles. D'après le théorème de Thalès :<br>
$${relationThales}$.<br>
On en déduit que $${nomCoteCherche}=\\dfrac{${nomCoteParalleleDonne}\\times ${nomDemiDiagonaleDonnee}}{${nomDemiDiagonaleCalculee}}=\\dfrac{${coteParalleleDonne}\\times ${demiDiagonaleDonnee}}{${demiDiagonaleCalculee}}=${miseEnEvidence(`${valeurCorrecte}${this.sup3 ? '\\text{ cm}' : ''}`)}${this.sup3 ? '' : '\\text{ cm}'}$.`
  }

  versionAleatoire = () => {
    const coefficient = choice([2, 3, 4])
    const petiteDemiDiagonale = randint(2, 5)
    const petitCoteParallele = randint(2, 6)
    this.appliquerLesValeurs(
      coefficient,
      petiteDemiDiagonale,
      petitCoteParallele,
      choice<CoteParallele>(['petit', 'grand']),
      choice<Diagonale>(['HBA', 'DBC']),
    )
  }

  constructor() {
    super()

    this.nbQuestions = 1
    this.versionAleatoire()
  }
}
