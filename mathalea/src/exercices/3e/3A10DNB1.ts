import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { point3d } from '../../lib/3d/3dProjectionMathalea2d/elementsEtTransformations3d'
import { pave3d } from '../../lib/3d/3dProjectionMathalea2d/PaveEtPaveLPH3dPerspectiveCavaliere'
import { createList } from '../../lib/format/lists'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { egalOuApprox } from '../../lib/outils/ecritures'
import {
  texteEnCouleurEtGras,
  texteItalique,
  miseEnEvidence,
} from '../../lib/outils/embellissements'
import {
  listeDesDiviseurs,
  pgcd,
  texCalculDecomposition,
  texFactorisation,
} from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import FractionEtendue from '../../modules/FractionEtendue'
import { fraction } from '../../modules/fractions'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceBrevetA from '../ExerciceBrevetA'
import { sp } from '../../lib/outils/outilString'

export const dateDeModifImportante = '23/10/2026'
export const uuid = '61217'
export const refs = {
  'fr-fr': ['3A10DNB1', '3Z1DNB-06', 'BP1AUTO092'],
  'fr-ch': ['10CTGM2C-2', '10LCGM2C-2', '10LSGM2C-2', '10CTNO1B-14', '11CTGM1E-2', '11LCGM1E-2', '11LSGM1E-2'],
}
export const titre = 'Se préparer au DNB : arithmétique, volume, fraction'
export const dateDePublication = '28/11/2024'

/**
 * @Author Jean-claude Lhote
 * Cet exerice exploite la nouvelle classe d'exercice que j'ai conçue pour les sujets de brevet
 * Il s'agit d'un exercice de type Brevet Aléatoirisé
 * La méthode privée appliquerLesValeurs permet de générer les valeurs aléatoires et de construire l'énoncé et la correction
 * La méthode versionOriginale permet de générer les valeurs de l'exercice telles qu'elles sont dans le sujet original
 * La méthode versionAleatoire permet de générer des valeurs aléatoires pour l'exercice
 */
export default class Exercice3A10DNB0 extends ExerciceBrevetA {
  constructor() {
    super()

    this.spacingCorr = 2
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false

    this.versionAleatoire()
    this.introduction = texteItalique(
      "D'après l'exercice $5$ du brevet Métropole 2024.",
    )
  }

  private appliquerLesValeurs(
    autocollants: number,
    drapeaux: number,
    sachets: number,
    hauteur: number,
    largeur: number,
    longueur: number,
    num: number,
    den: number,
    prixM3: number,
  ) {
    const pave = pave3d(
      point3d(0, 0, 0),
      point3d(6, 0, 0),
      point3d(0, 10, 0),
      point3d(0, 0, -2),
    )
    const segH = segment(pointAbstrait(-0.3, 0), pointAbstrait(-0.3, -2))
    const segL = segment(pointAbstrait(0, -2.3), pointAbstrait(6, -2.3))
    const segP = segment(pointAbstrait(6.3, -2.2), pointAbstrait(10.3, 0.1))
    segP.styleExtremites = '<->'
    segL.styleExtremites = '<->'
    segH.styleExtremites = '<->'
    const h = latex2d(`${texNombre(hauteur, 1)}\\,\\text{m}`, -1.4, -1, {})
    const l = latex2d(`${largeur}\\,\\text{m}`, 3, -2.8, {})
    const p = latex2d(`${longueur}\\,\\text{m}`, 9.5, -1.3, {})
    const objets = [pave.c2d, segH, segL, segP, h, l, p]
    const fracR = new FractionEtendue(num, den)
    const volume = longueur * largeur * hauteur

    const prixFinal = fracR
      .produitFraction(volume)
      .produitFraction(prixM3).valeurDecimale
    const enonce = `Un club de natation propose un après-midi découverte pour les enfants.<br>
La présidente du club veut offrir des petits sachets cadeaux tous identiques contenant des autocollants et des drapeaux avec le logo du club.<br>
 Elle a acheté $${autocollants}$ autocollants et $${drapeaux}$ drapeaux et veut tous les utiliser.<br>
 Elle veut que, dans chaque sachet, il y ait exactement le même nombre d'autocollants et que, dans chaque sachet, il y ait exactement le même nombre de drapeaux.<br><br>
  ${createList({
    items: [
      `Pourquoi n'est-il pas possible de faire $${sachets}$ sachets${sp()}?`,
      createList({
        items: [
          `Décomposer $${autocollants}$ et $${drapeaux}$ en produits de facteurs premiers.`,
          'En déduire le plus grand nombre de sachets que la présidente pourra réaliser.',
          `Dans ce cas, combien mettra-t-elle d'autocollants et de drapeaux dans chaque sachet${sp()}?`,
        ],
        style: 'alpha',
      }),
    ],
    style: 'nombres',
  })}<br><br>
  La piscine a la forme d'un pavé droit représenté ci-dessous.<br><br>
${deuxColonnesResp(
  `Elle est remplie aux $${fracR.texFractionSimplifiee}$ du volume.<br>
 $1\\text{ m}^3$ d'eau coûte $${texNombre(prixM3, 2, true)}$ €.<br>
  Combien coûte le remplissage de la piscine${sp()}?`,
  mathalea2d(Object.assign({ scale: 0.5 }, fixeBordures(objets)), objets),
  {
    largeur1: 50,
    widthmincol1: '150px',
    widthmincol2: '150px',
    eleId: '',
  },
)}`
    const pgcdAutocollantsDrapeaux = pgcd(autocollants, drapeaux)
    const autocollantsParSachet = new FractionEtendue(autocollants, sachets)
    const drapeauxParSachet = new FractionEtendue(drapeaux, sachets)
    const autocollantsParSachetFinal = autocollants / pgcdAutocollantsDrapeaux
    const drapeauxParSachetFinal = drapeaux / pgcdAutocollantsDrapeaux

    const correction = `${texteEnCouleurEtGras('PARTIE A', 'black')}<br>
  ${createList({
    items: [
      `On a $${autocollantsParSachet.texFraction} ${egalOuApprox(autocollants / sachets, 2)} ${texNombre(autocollants / sachets, 2)}$ qui ${autocollantsParSachet.estEntiere ? 'est' : "n'est pas"} entier, et on a $${drapeauxParSachet.texFraction} ${egalOuApprox(drapeaux / sachets, 2)} ${texNombre(drapeaux / sachets, 2)}$ qui ${drapeauxParSachet.estEntiere ? 'est' : "n'est pas"} entier.<br>
      On ${texteEnCouleurEtGras('ne peut donc pas')} faire $${sachets}$ sachets car $${autocollantsParSachet.estEntiere ? drapeaux : autocollants}$ n'est pas un multiple de $${sachets}$.`,
      createList({
        items: [
          `${texCalculDecomposition(autocollants)}<br>${texCalculDecomposition(drapeaux)}<br>
          Les facteurs communs à $${autocollants}$ et à $${drapeaux}$ les plus nombreux sont${sp()}: $${texFactorisation(pgcdAutocollantsDrapeaux)}=${pgcdAutocollantsDrapeaux}$.<br>
          Autrement dit le plus grand diviseur de $${autocollants}$ et de $${drapeaux}$ est $${pgcdAutocollantsDrapeaux}$.<br>
          La présidente pourra donc réaliser $${miseEnEvidence(pgcdAutocollantsDrapeaux)}$ sachets identiques.<br>`,
          `On a $${autocollants} = ${pgcdAutocollantsDrapeaux}\\times ${autocollants / pgcdAutocollantsDrapeaux}$ et $${drapeaux} = ${pgcdAutocollantsDrapeaux}\\times ${drapeaux / pgcdAutocollantsDrapeaux}$.<br>
          Chaque sachet contiendra $${miseEnEvidence(autocollantsParSachetFinal)}$ autocollants et $${miseEnEvidence(drapeauxParSachetFinal)}$ drapeaux.`,
        ],
        style: 'alpha',
      }),
    ],
    style: 'nombres',
  })}
  ${texteEnCouleurEtGras('PARTIE B', 'black')}<br>
  Le volume de la piscine est en $\\text{m}^3$${sp()}: $${longueur} \\times ${largeur} \\times ${texNombre(hauteur, 1)} =${texNombre(volume, 1)}$, soit $${texNombre(volume, 1)}\\,\\text{m}^3$.<br>
  Le prix d'un remplissage total de ce volume d'eau est${sp()}:$${texNombre(volume, 1)}\\times ${texNombre(prixM3, 2, true)}=${texNombre(volume * prixM3, 2, true)}$ €.<br>
  La question ayant été jugée ambigue, voici trois réponses possibles (la première est celle envisagée initialement par l'auteur du sujet)${sp()}:<br>
  ${createList({
    items: [
      `Si on considère que la question porte sur le coût de remplissage de $${fracR.texFractionSimplifiee}$ du volume total de la piscine, alors le prix du remplissage est${sp()}: $${fracR.texFractionSimplifiee}\\times ${texNombre(volume * prixM3, 2, true)}=${miseEnEvidence(texNombre(prixFinal, 2, true))}$ €.`,
      `Si on considère que la piscine est déjà remplie de $${fracR.texFractionSimplifiee}$ du volume total et qu'on veut la remplir totalement, alors il reste $${fraction(1, 1).differenceFraction(fracR).texFractionSimplifiee}$ du volume à remplir.<br>
      Le prix du remplissage est alors${sp()}: $${fraction(1, 1).differenceFraction(fracR).texFractionSimplifiee}\\times ${texNombre(volume * prixM3, 2, true)}=${texNombre(volume * prixM3 - prixFinal, 2, true)}$ €.`,
      `Si on considère que la question porte sur le remplissage complet de la piscine, alors le prix du remplissage est${sp()}: $${texNombre(volume * prixM3, 2, true)}$ €.`,
    ],
    style: 'fleches',
  })}`

    this.enonce = enonce
    this.correction = correction
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(330, 132, 15, 2, 15, 25, 9, 10, 4.14)
  }

  versionAleatoire: () => void = () => {
    const den = choice([5, 10, 16, 20])
    const num = randint(Math.ceil(den / 2) + 1, den - 1)
    const [unPremier, unSecond] = choice([
      [4, 7],
      [5, 7],
      [3, 4],
      [7, 8],
      [5, 11],
    ])
    const facteurs1 = combinaisonListes([2, 2, 3, 3, 5, 7], 5).slice(0, 3)
    const nb1 = facteurs1.reduce((acc, val) => acc * val, unPremier)
    const nb2 = facteurs1.reduce((acc, val) => acc * val, unSecond)
    let trouve = false
    let unDiviseur: number
    let cpt = 0
    do {
      const listDiv1 = listeDesDiviseurs(nb1)
      const listDiv2 = listeDesDiviseurs(nb2)
      const choix = choice([true, false])
      unDiviseur = choix ? choice(listDiv1) : choice(listDiv2)
      trouve = choix
        ? !listDiv2.includes(unDiviseur) && unDiviseur !== nb1
        : !listDiv1.includes(unDiviseur) && unDiviseur !== nb2
      cpt++
    } while (!trouve && cpt < 1000)

    const sachets = unDiviseur
    const prixM3 = randint(151, 249, [400]) / 50
    const hauteur = choice([2, 3, 2.5, 1.8, 2.2])
    const largeur = choice([10, 15, 20, 25])
    const longueur = randint(largeur / 5 + 1, largeur / 5 + 6) * 5
    this.appliquerLesValeurs(
      nb1,
      nb2,
      sachets,
      hauteur,
      largeur,
      longueur,
      num,
      den,
      prixM3,
    )
  }
}
