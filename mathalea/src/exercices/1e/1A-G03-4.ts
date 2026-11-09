import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { homothetie } from '../../lib/2d/transformations'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
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

export const titre = 'Calculer une longueur avec le théorème de Thalès'
export const dateDePublication = '20/06/2026'

export const dateDeModifImportante = '22/10/2026'

export const uuid = 'de083'

export const refs = {
  'fr-fr': ['1A-G03-4', '2A-G4-1'],
  'fr-ch': ['11LCGM3B-5', '11LSGM3B-5'],
}

export const interactifReady = true

export const amcReady = true

type Cote = 'BD' | 'BC' | 'HD' | 'AC'

/**
 * Calculer une longueur dans une configuration de Thalès.
 * @author Stéphane Guyon
 */
export default class LongueurAvecThalesQcm extends ExerciceQcmACourt {
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

  private appliquerLesValeurs(
    bd: number,
    bc: number,
    hd: number,
    ac: number,
    coteCherche: Cote,
  ) {
    const [nomA, nomH, nomB, nomD, nomC] = choisitLettresDifferentes(5)
    const nomsCotes: Record<Cote, string> = {
      BD: `${nomB}${nomD}`,
      BC: `${nomB}${nomC}`,
      HD: `${nomH}${nomD}`,
      AC: `${nomA}${nomC}`,
    }
    const longueurs: Record<Cote, number> = { BD: bd, BC: bc, HD: hd, AC: ac }
    const formules: Record<
      Cote,
      [premierFacteur: Cote, secondFacteur: Cote, diviseur: Cote]
    > = {
      BD: ['BC', 'HD', 'AC'],
      BC: ['BD', 'AC', 'HD'],
      HD: ['BD', 'AC', 'BC'],
      AC: ['BC', 'HD', 'BD'],
    }
    const [premierFacteur, secondFacteur, diviseur] = formules[coteCherche]
    const valeurCorrecte = longueurs[coteCherche]
    const candidatsDistracteurs = shuffle([
      (longueurs[premierFacteur] * longueurs[diviseur]) /
        longueurs[secondFacteur],
      (longueurs[secondFacteur] * longueurs[diviseur]) /
        longueurs[premierFacteur],
      longueurs[premierFacteur] * longueurs[secondFacteur],
      valeurCorrecte + 1,
      valeurCorrecte + 2,
      valeurCorrecte + 3,
    ])
    const valeursDejaUtilisees = new Set([texNombre(valeurCorrecte, 2)])
    const distracteurs = candidatsDistracteurs.filter((valeur) => {
      const valeurTex = texNombre(valeur, 2)
      if (valeur <= 0 || valeursDejaUtilisees.has(valeurTex)) return false
      valeursDejaUtilisees.add(valeurTex)
      return true
    })

    this.texteAvantReponseCourte = `$${nomsCotes[coteCherche]}=$`
    this.reponses = [valeurCorrecte, ...distracteurs.slice(0, 3)].map(
      (valeur) => `$${texNombre(valeur, 2)}\\text{ cm}$`,
    )

    const pointB = pointAbstrait(0, 0, nomB, 'below left')
    const pointC = pointAbstrait(5, 0, nomC, 'below right')
    const pointA = pointAbstrait(4, 3, nomA, 'above right')
    const pointH = homothetie(pointA, pointB, bd / bc, nomH)
    const pointD = homothetie(pointC, pointB, bd / bc, nomD)
    pointH.positionLabel = 'above'
    pointD.positionLabel = 'below'
    const polygoneThales = polygone([pointA, pointH, pointB, pointD, pointC])
    const segmentHD = segment(pointH, pointD)
    const objets = [
      polygoneThales,
      segmentHD,
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
    const donnees = (['BD', 'BC', 'HD', 'AC'] as Cote[])
      .filter((cote) => cote !== coteCherche)
      .map((cote) => `$${nomsCotes[cote]}=${longueurs[cote]}\\text{ cm}$`)
      .join(' ; ')

    this.enonce = `La figure suivante n'est pas à l'échelle.<br>${figure}
$${nomB}$, $${nomH}$ et $${nomA}$ sont alignés.<br>
$${nomB}$, $${nomD}$ et $${nomC}$ sont alignés.<br>
Les droites $(${nomH}${nomD})$ et $(${nomA}${nomC})$ sont parallèles.<br>
On donne ${donnees}.<br>
Quelle est la longueur du segment $[${nomsCotes[coteCherche]}]$ ?`

    const nomBH = `${nomB}${nomH}`
    const nomBA = `${nomB}${nomA}`
    const afficheCote = (cote: Cote) =>
      cote === coteCherche ? nomsCotes[cote] : String(longueurs[cote])
    const egaliteUtile = `\\dfrac{${afficheCote('BD')}}{${afficheCote('BC')}}=\\dfrac{${afficheCote('HD')}}{${afficheCote('AC')}}`

    this.correction = `Les points $${nomB}$, $${nomH}$ et $${nomA}$ sont alignés, ainsi que les points $${nomB}$, $${nomD}$ et $${nomC}$. Les droites $(${nomH}${nomD})$ et $(${nomA}${nomC})$ sont parallèles.<br>
D'après le théorème de Thalès :<br><br>
$\\dfrac{${nomBH}}{${nomBA}}=\\dfrac{${nomsCotes.BD}}{${nomsCotes.BC}}=\\dfrac{${nomsCotes.HD}}{${nomsCotes.AC}}$<br><br>
On remplace par les valeurs connues :<br><br>
$\\dfrac{${nomBH}}{${nomBA}}=${egaliteUtile}$<br><br>
On utilise l'égalité $${egaliteUtile}$.<br><br>
Les produits en croix sont égaux, donc $${afficheCote('BD')}\\times ${afficheCote('AC')}=${afficheCote('BC')}\\times ${afficheCote('HD')}$.<br><br>
On divise les deux membres par $${longueurs[diviseur]}$ :<br><br>
$${nomsCotes[coteCherche]}=\\dfrac{${longueurs[premierFacteur]}\\times ${longueurs[secondFacteur]}}{${longueurs[diviseur]}}=${miseEnEvidence(`${texNombre(valeurCorrecte, 2)}${this.sup3 ? '\\text{ cm}' : ''}`)}${this.sup3 ? '' : '\\text{ cm}'}$.`
  }

  versionAleatoire = () => {
    const rapport = choice([2, 3, 4])
    const bd = randint(2, 5)
    let hd: number
    do {
      hd = randint(2, 6)
    } while (hd === bd)
    this.appliquerLesValeurs(
      bd,
      rapport * bd,
      hd,
      rapport * hd,
      choice<Cote>(['BD', 'BC', 'HD', 'AC']),
    )
  }

  constructor() {
    super()

    this.nbQuestions = 1
    this.versionAleatoire()
  }
}
