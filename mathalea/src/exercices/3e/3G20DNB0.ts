import { cercle } from '../../lib/2d/cercle'
import { Droite, droite, droiteParPointEtParallele } from '../../lib/2d/droites'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint, latex2d } from '../../lib/2d/textes'
import {
  pointIntersectionCC,
  pointIntersectionDD,
} from '../../lib/2d/utilitairesPoint'
import { createList } from '../../lib/format/lists'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice } from '../../lib/outils/arrayOutils'
import { texteItalique, miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceBrevetA from '../ExerciceBrevetA'
import { sp } from '../../lib/outils/outilString'

export const uuid = '4beb8'
export const refs = {
  'fr-fr': ['3G20DNB0', '3Z1DNB-02'],
  'fr-ch': ['1mG4-1', '11LCGM3B-9', '11LSGM3B-9'],
}
export const titre = 'Se préparer au DNB : Thalès, Pythagore, aire'
export const dateDePublication = '26/11/2024'

/**
 * @Author Jean-claude Lhote
 * Cet exerice exploite la nouvelle classe d'exercice que j'ai conçue pour les sujets de brevet
 * Il s'agit d'un exercice de type Brevet Aléatoirisé (à partir des sources Latex de l'APMEP)
 * La méthode privée appliquerLesValeurs permet de générer les valeurs aléatoires et de construire l'énoncé et la correction
 * La méthode versionOriginale permet de générer les valeurs de l'exercice telles qu'elles sont dans le sujet original
 * La méthode versionAleatoire permet de générer des valeurs aléatoires pour l'exercice
 */
export default class Exercice3G2DNB0 extends ExerciceBrevetA {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false

    this.versionAleatoire()
    this.introduction = texteItalique(
      "D'après l'exercice $3$ du brevet Métropole 2024.",
    )
  }

  private appliquerLesValeurs(
    listeNomsPoints: string[],
    triplet: [number, number, number],
    rayon: number,
    ratio: number,
  ): void {
    const diametre = rayon * 2
    if (!this.sup) {
      if (choice([true, false])) {
        const zap = triplet[1]
        triplet[1] = triplet[2]
        triplet[2] = zap
      }
    }
    const [O, A, B, D, E, F] = listeNomsPoints
    const [AB, BD, DA] = triplet.map((e) => (e * diametre) / triplet[0])
    const aireTriangle = (BD * DA) / 2
    const EF = diametre * ratio
    const AF = DA * ratio
    const rayonFrac = new FractionEtendue(rayon * 10, 10).simplifie()
    const rayonFracCarre = rayonFrac.produitFraction(rayonFrac)
    const aireDisque = rayon ** 2 * Math.PI
    const pointO = pointAbstrait(0, 0, O, 'below')
    const pointB = pointAbstrait(-rayon, 0, B, 'left')
    const pointA = pointAbstrait(rayon, 0, A, 'right')
    const C = cercle(pointO, rayon)
    const pointE = pointAbstrait(rayon - rayon * 2 * ratio, 0, E, 'below')
    const C2 = cercle(pointB, BD)
    const pointD = pointIntersectionCC(C, C2, D, 1)
    if (!pointD) {
      throw new Error('Les cercles ne se coupent pas')
    }
    const ABD = polygone([pointA, pointB, pointD])

    const nomCercle = latex2d(
      '\\mathscr{C}',
      rayon / 2,
      Math.sqrt((rayon + 0.5) ** 2 - (rayon / 2) ** 2),
      {},
    )
    const droiteAD = droite(pointA, pointD)
    const droiteBD = droite(pointB, pointD)
    const droiteEF: unknown = droiteParPointEtParallele(pointE, droiteBD)
    const pointF = pointIntersectionDD(
      droiteAD,
      droiteEF as Droite,
      F,
      'above right',
    )
    const segEF = segment(pointE, pointF)
    const labels = labelPoint(pointO, pointA, pointB, pointD, pointE, pointF)
    const objets = [labels, C, nomCercle, ABD, segEF]
    const ppcm = (40 * 4.5) / rayon
    const sc = 4.5 / rayon
    const figure = mathalea2d(
      Object.assign({ pixelsParCm: ppcm, scale: sc }, fixeBordures(objets)),
      objets,
    )
    // enoncé
    const enonce = `Sur la figure ci-dessous, on a${sp()}:<br>
  ${createList({
    items: [
      `$(\\mathscr{C})$ est un cercle de centre $${O}$ et de rayon $${texNombre(rayon, 2)}\\text{ cm}$ ;`,
      `$[${A}${B}]$ est un diamètre de ce cercle et $${D}$ est un point du cercle ;`,
      `les points $${B}$, $${E}$, $${A}$ sont alignés, ainsi que les points $${D}$, $${F}$, $${A}$ ;`,
      `les droites $(${B}${D})$ et $(${E}${F})$ sont parallèles ;`,
      `$${B}${D} = ${texNombre(BD, 2)}\\text{ cm}$ ; $${D}${A} = ${texNombre(DA, 2)}\\text{ cm}$ et $${A}${E} = ${texNombre(EF, 2)}\\text{ cm}$.`,
    ],
    style: 'fleches',
  })}`

    const listePrincipale = createList({
      items: [
        `Justifier que le diamètre [${A}${B}] mesure $${texNombre(diametre, 2)}\\text{ cm}$.`,
        `Démontrer que le triangle $${A}${B}${D}$ est rectangle en $${D}$.`,
        `Calculer $${A}${F}$.`,
        createList({
          items: [
            `Justifier que l'aire du triangle $${A}${B}${D}$ est égale à $${texNombre(aireTriangle, 4)}\\text{ cm}^2$.`,
            `Calculer l'aire du disque, arrondie au centième.<br>${texteItalique('Rappel')}${sp()}: l'aire du disque est égale à $\\pi \\times R^2$, où $R$ est le rayon du disque.`,
          ],
          style: 'alpha',
        }),
        `Quel pourcentage de l'aire du disque représente l'aire du triangle $${A}${B}${D}$${sp()}?`,
      ],
      style: 'nombres',
    })
    const listePrincipaleCorrection = createList({
      items: [
        `On a $${A}${B} = 2R = 2 \\times ${texNombre(rayon, 2)} = ${miseEnEvidence(texNombre(diametre, 2))}\\text{ cm}$.`,
        `On a $${A}${D}^2 = ${texNombre(DA, 2)}^2$ et $${D}${B}^2 = ${texNombre(BD, 2)}^2$, d'où<br>
         $\\begin{aligned}${A}${D}^2 + ${D}${B}^2 &= ${texNombre(DA, 2)}^2 + ${texNombre(BD, 2)}^2\\\\
          &= ${texNombre(DA * DA, 4)} + ${texNombre(BD * BD, 4)}\\\\
           &= ${texNombre(AB * AB, 4)}
           \\end{aligned}$<br>
           Or, $${A}${B}^2 = ${texNombre(AB, 2)}^2= ${texNombre(AB * AB, 4)}$.<br>
         Donc $${A}${D}^2+${D}${B}^2 = $${A}${B}$^2$${sp()}: d'après la réciproque du théorème de Pythagore le triangle $${A}${B}${D}$ ${texteEnCouleurEtGras('est rectangle')} en $${D}$.<br>
         $[${A}${B}]$ est l'hypoténuse.`,
        `Comme les points $${B}$, $${E}$, $${A}$ sont alignés, ainsi que les points $${D}$, $${F}$, $${A}$ et que les droites $(${B}${D})$ et $(${E}${F})$ sont parallèles on est dans une situation de Thalès et on a donc les égalités${sp()}:<br>
        $\\dfrac{${A}${E}}{${A}${B}} = \\dfrac{${A}${F}}{${A}${D}} = \\dfrac{${E}${F}}{${B}${D}}$.<br><br>
        En particulier $\\dfrac{${A}${E}}{${A}${B}} = \\dfrac{${A}${F}}{${A}${D}}$<br><br>
        ou $\\dfrac{${texNombre(EF, 2)}}{${texNombre(diametre, 2)}} = \\dfrac{${A}${F}}{${texNombre(DA, 2)}}$<br><br>
        soit $${texNombre(ratio, 1)} = \\dfrac{${A}${F}}{${texNombre(DA, 2)}}$, d'où $${A}${F} = ${texNombre(ratio, 1)} \\times ${texNombre(DA, 2)} = ${miseEnEvidence(texNombre(AF, 3))}\\text{ cm}$.`,
        createList({
          items: [
            `Si $\\mathscr{A}$ est l'aire du triangle $${A}${B}${D}$, on sait que $\\mathscr{A} = \\dfrac{${D}${B} \\times ${A}${D}}{2} = \\dfrac{${texNombre(BD, 2)} \\times ${texNombre(DA, 2)}}{2} = \\dfrac{${texNombre(DA * BD, 4)}}{2}= ${miseEnEvidence(texNombre(aireTriangle, 4))}\\text{ cm}^2$.`,
            `L'aire du disque est égale à $\\pi \\times R^2 = \\pi \\times ${texNombre(rayon, 1)}^2 = \\left(${rayonFrac.texFraction}\\right)^2 \\times \\pi = ${rayonFracCarre.texFraction}\\pi \\approx ${texNombre(aireDisque, 3)}\\text{ cm}^2$, soit $${miseEnEvidence(texNombre(aireDisque, 2))}$ au centième de $\\text{cm}^2$.`,
          ],
          style: 'alpha',
        }),
        `L'aire du triangle $${A}${B}${D}$ représente pour l'aire du disque un pourcentage égal à environ${sp()}: $\\dfrac{${texNombre(aireTriangle, 4)}}{${texNombre(aireDisque, 2)}} \\times 100$ soit environ $${miseEnEvidence(texNombre((100 * aireTriangle) / aireDisque, 1))}\\,\\%$.`,
      ],
      style: 'nombres',
    })

    this.enonce = enonce + figure + listePrincipale
    this.correction = listePrincipaleCorrection
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(
      ['O', 'A', 'B', 'D', 'E', 'F'],
      [5, 3, 4],
      4.5,
      0.3,
    )
  }

  versionAleatoire: () => void = () => {
    const listeNomsPoints = choisitLettresDifferentes(6)
    const triplet = choice([
      [5, 3, 4],
      [5, 4, 3],
      [10, 8, 6],
      [15, 12, 9],
      [20, 16, 12],
      [25, 20, 15],
    ]) as [number, number, number]
    const hypo = triplet[0]
    const ratio = randint(2, 7, [5]) / 10
    let rapportPythagore: number
    switch (hypo) {
      case 5:
        rapportPythagore = randint(21, 25) / 5
        break
      case 10:
        rapportPythagore = randint(10, 12) / 5
        break

      case 15:
        rapportPythagore = randint(7, 9) / 5
        break
      case 20:
        rapportPythagore = randint(5, 7) / 5
        break
      case 25:
        rapportPythagore = randint(4, 6) / 5
        break
      default:
        rapportPythagore = randint(5, 7) / 5
        break
    }

    const rayon = Math.round(5 * hypo * rapportPythagore) / 10
    this.appliquerLesValeurs(
      listeNomsPoints,
      triplet.map((el) => Math.round(el * rapportPythagore * 10) / 10) as [
        number,
        number,
        number,
      ],
      rayon,
      ratio,
    )
  }
}
