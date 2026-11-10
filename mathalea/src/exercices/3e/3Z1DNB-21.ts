import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { createList } from '../../lib/format/lists'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteGras,
  texteItalique,
} from '../../lib/outils/embellissements'
import { prenomPronom } from '../../lib/outils/Personne'
import { premierMultipleInferieur } from '../../lib/outils/primalite'
import { mathalea2d } from '../../modules/mathalea2d'
import ExerciceBrevetA from '../ExerciceBrevetA'
// import { texteParPosition } from '../../lib/2d/textes'
import { codageSegments } from '../../lib/2d/CodageSegment'
import { placeLatexSurSegment } from '../../lib/2d/placeLatexSurSegment'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { queDevant, sp } from '../../lib/outils/outilString'

export const uuid = '8abca'
export const refs = {
  'fr-fr': ['3Z1DNB-21'],
  'fr-ch': [],
}
export const titre = "Se préparer au DNB : aires, prise d'initiative, volumes"
export const dateDePublication = '15/04/2025'

/**
 * @Author Olivier Mimeau
 * Cet exerice exploite la nouvelle classe d'exercice que j'ai conçue pour les sujets de brevet
 * Il s'agit d'un exercice de type Brevet Aléatoirisé
 * La méthode privée appliquerLesValeurs permet de générer les valeurs aléatoires et de construire l'énoncé et la correction
 * La méthode versionOriginale permet de générer les valeurs de l'exercice telles qu'elles sont dans le sujet original
 * La méthode versionAleatoire permet de générer des valeurs aléatoires pour l'exercice
 */
export default class ExercicePolynesie592015 extends ExerciceBrevetA {
  constructor() {
    super()
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false
    this.introduction =
      texteItalique(
        "D'après l'exercice $5$ du brevet Polynésie Septembre 2015.",
      ) + '<br>'

    this.versionAleatoire()
  }

  private appliquerLesValeurs(
    productionLait: number,
    densiteChevre: number,
    grandeLongueur: number,
    petiteLongueur: number,
    contenanceA: number,
    diametreB: number,
    hauteurB: number,
    prenom1: string,
    ilElle: string,
  ): void {
    const aireTotale =
      grandeLongueur * petiteLongueur + petiteLongueur * petiteLongueur
    const nombreChevre = Math.floor((aireTotale / 10000) * densiteChevre)
    const productionLaitTotale = nombreChevre * productionLait
    const volumeB = (Math.PI * (diametreB / 2) ** 2 * hauteurB) / 1000
    const majIlElle = ilElle === 'il' ? 'Il' : 'Elle'
    // const volumeA= contenanceA / 1000
    const listeQuestions = createList({
      items: [
        `Prouver ${queDevant(prenom1)} peut posséder au maximum $${nombreChevre}$ chèvres.`,
        `Dans ces conditions, combien de litres de lait peut-${ilElle} espérer produire par jour en moyenne${sp()}?`,
      ],
      style: 'nombres',
    })
    const deuxPetiteLongueur = 2 * petiteLongueur
    const differenceLongueur = grandeLongueur - petiteLongueur

    let correction1 = `On peut partager la surface de pâturage en deux rectangles, l'un de $${petiteLongueur}$ (m) sur $2 \\times ${petiteLongueur} = ${deuxPetiteLongueur}$ (m) et l'autre de $${petiteLongueur}$ (m) sur $${grandeLongueur} - ${petiteLongueur} = ${differenceLongueur}$ (m).<br>`
    correction1 += `L'aire totale est égale à $${petiteLongueur} \\times ${deuxPetiteLongueur} + ${differenceLongueur} \\times ${petiteLongueur} = ${texNombre(aireTotale)}\\text{ m}^2$, soit $${texNombre(aireTotale / 10000, 2)}$ ha ; donc on peut y faire paître au maximum${sp()}:` // <br>`
    correction1 += `$${texNombre(aireTotale / 10000, 2)} \\times ${densiteChevre} = ${miseEnEvidence(texNombre((aireTotale / 10000) * densiteChevre, 2))}$, soit un maximum de $${nombreChevre}$ chèvres.<br>`
    correction1 += `${texteItalique('Remarque')}${sp()}: Autre méthode${sp()}: on peut décomposer la surface du pâturage en un rectangle de longueur $${grandeLongueur}$ m et de largeur $${petiteLongueur}$ m et un carré de côté $${petiteLongueur}$ m.<br>`
    correction1 += `Aire totale${sp()}: $${grandeLongueur} \\times ${petiteLongueur} + ${petiteLongueur}^2 = ${miseEnEvidence(texNombre(aireTotale))}\\text{ m}^2$.`
    const correction2 = `Les $${nombreChevre}$ chèvres donneront en moyenne par jour${sp()}: $${nombreChevre} \\times ${texNombre(productionLait, 1)} = ${miseEnEvidence(texNombre(productionLaitTotale, 1))}$ litres de lait.`

    const listeCorrections = createList({
      items: [correction1, correction2],
      style: 'nombres',
    })
    const listeCuves = createList({
      items: [
        `cuve A${sp()}: contenance $${texNombre(contenanceA)}$ litres`,
        `cuve B${sp()}: diamètre $${diametreB}$ cm, hauteur $${hauteurB}$ cm`,
      ],
      style: 'fleches',
    })
    const petitL = 5
    const grandL = 12
    const A = pointAbstrait(0, 0)
    const B = pointAbstrait(petitL, 0)
    const C = pointAbstrait(petitL, petitL)
    const D = pointAbstrait(grandL, petitL)
    const E = pointAbstrait(grandL, 2 * petitL)
    const F = pointAbstrait(0, 2 * petitL)
    const segmentAB = segment(A, B)
    const segmentBC = segment(B, C)
    const segmentCD = segment(C, D)
    const segmentDE = segment(D, E)
    const segmentEF = segment(E, F)
    const segmentFA = segment(F, A)
    const codes = codageSegments(
      '|',
      'black',
      segmentAB,
      segmentBC,
      segmentDE,
      0.8,
    )
    const longAB = placeLatexSurSegment(
      `${texNombre(petiteLongueur, 0)}\\text{~m}`,
      B,
      A,
      { distance: 0.8 },
    )
    const longEF = placeLatexSurSegment(
      `${texNombre(grandeLongueur, 0)}\\text{~m}`,
      F,
      E,
      {},
    )
    const objets = [
      segmentAB,
      segmentBC,
      segmentCD,
      segmentDE,
      segmentEF,
      segmentFA,
      codes,
      longAB,
      longEF,
    ]
    const figure = mathalea2d(
      Object.assign({ pixelsParCm: 20, scale: 0.5 }, fixeBordures(objets)),
      objets,
    )

    this.enonce = `${prenom1} s'installe comme éleveur de chèvres pour produire du lait afin de fabriquer des fromages.<br><br>`
    this.enonce += `${texteGras(`PARTIE 1${sp()}: La production de lait`)} <br><br>`
    this.enonce += `${texteGras('Document $\\mathbf{1}$')}${sp()}: `
    this.enonce += `${texteGras(`Chèvre de race alpine${sp()}:`)} <br>`
    this.enonce += `${texteGras(`Production de lait${sp()}:`)} $${texNombre(productionLait)}$ ${productionLait >= 2 ? 'litres' : 'litre'} de lait par jour et par chèvre en moyenne <br>`
    this.enonce += `${texteGras(`Pâturage${sp()}:`)} $${densiteChevre}$ chèvres maximum par hectare <br><br>`
    this.enonce += `${texteGras('Document $\\mathbf{2}$')}${sp()}: `
    this.enonce += `${texteGras('Plan simplifié des surfaces de pâturage.')} <br>`
    this.enonce += `${figure} `
    this.enonce += `${texteGras('Document $\\mathbf{3}$')} <br>`
    this.enonce += `$1$ hectare = $${texNombre(10000)}\\text{ m}^2$` //
    this.enonce += listeQuestions + '<br><br>'
    // this.enonce += '<br>'
    this.enonce += `${texteGras(`PARTIE 2${sp()}: Le stockage du lait`)} <br>`
    this.enonce += `${prenom1} veut acheter une cuve cylindrique pour stocker le lait de ses chèvres.<br>`
    this.enonce += `${majIlElle} a le choix entre $2$ modèles${sp()}:`
    this.enonce += listeCuves
    this.enonce +=
      `Formule du volume du cylindre${sp()}: $V = \\pi \\times r^2 \\times h$ <br>`
    this.enonce += `Conversion${sp()}: $1\\text{ dm}^3 = 1\\text{ L}$ <br><br>`
    this.enonce += `${majIlElle} choisit la cuve ayant la plus grande contenance. Laquelle va-t-${ilElle} acheter${sp()}? <br>`
    this.correction = `${texteGras(`PARTIE 1${sp()}: La production de lait`)}`
    this.correction += listeCorrections
    this.correction += `${texteGras(`PARTIE 2${sp()}: Le stockage du lait`)} <br>`
    this.correction += `${`Volume de la cuve B${sp()}:`} $V_{\\text{B}} = \\pi \\times ${texNombre(diametreB / 20, 1)}^2 \\times ${texNombre(hauteurB / 10, 1)} = ${texNombre((diametreB * diametreB * hauteurB) / 4000, 3)} \\pi \\approx ${texNombre(volumeB, 1)}\\text{ dm}^3$, `
    this.correction += `et $${texNombre(volumeB, 1)}$ litres ${volumeB > contenanceA ? '>' : '<'} $${texNombre(contenanceA)}$ litres.<br>`
    this.correction += `${majIlElle} va donc acheter une cuve ${volumeB > contenanceA ? 'B' : 'A'}.<br>`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(1.8, 12, 620, 240, 585, 100, 76, 'Laurent', 'il')
  }

  versionAleatoire: () => void = () => {
    let productionLait: number
    let densiteChevre: number
    let grandeLongueur: number
    let petiteLongueur: number
    let contenanceA: number
    let diametreB: number
    let hauteurB: number
    let volumeB: number
    let productionLaitTotale: number
    do {
      const petiteLongueurMin = 15
      productionLait = randint(11, 30) / 10 // réalité 2 à 3 litres
      densiteChevre = randint(8, 16) // réalité on pourrait monter plus haut
      grandeLongueur = randint(55, 75)
      // diminuer la taille de la petite longueur pour que ça ne fasse pas une trop grande supperficie
      petiteLongueur =
        randint(
          petiteLongueurMin,
          40 - Math.floor((petiteLongueurMin * grandeLongueur) / 75),
        ) * 10
      grandeLongueur *= 10
      const aireTotale =
        grandeLongueur * petiteLongueur + petiteLongueur * petiteLongueur
      const nombreChevre = Math.floor((aireTotale / 10000) * densiteChevre)
      productionLaitTotale = nombreChevre * productionLait
      contenanceA = premierMultipleInferieur(
        5,
        (productionLaitTotale * randint(13, 22)) / 10,
      ) // en litres /dm^3
      volumeB = (contenanceA + choice([-1, 1]) * randint(30, 100)) * 1000 // en cm^3
      diametreB = randint(7, 15) * 10 // en cm
      hauteurB = volumeB / (Math.PI * (diametreB / 2) ** 2)
      hauteurB = Math.floor(hauteurB) // en cm
      // hauteurB = Math.floor(hauteurB / 10) * 10 // en cm
      // hauteurB =randint(70, 150, diametreB)
      // volumeB = Math.PI * hauteurB * (diametreB / 2) ** 2
      // contenanceA = premierMultipleInferieur(5, volumeB / 1000 + choice([-1, 1]) * randint(10, 50))
    } while (volumeB < productionLaitTotale * 1000 || hauteurB < diametreB) // volumeB < productionLaitTotale * 1000
    const { prenom: prenom1, pronom: ilElle } = prenomPronom()

    this.appliquerLesValeurs(
      productionLait,
      densiteChevre,
      grandeLongueur,
      petiteLongueur,
      contenanceA,
      diametreB,
      hauteurB,
      prenom1,
      ilElle,
    )
  }
}
