import { orangeMathalea } from '../../lib/colors'
import { createList } from '../../lib/format/lists'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import {
  texteItalique,
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import {
  listeDesDiviseurs,
  pgcd,
  texCalculDecomposition,
  texFactorisation,
} from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import ExerciceBrevetA from '../ExerciceBrevetA'
import { texNombre } from '../../lib/outils/texNombre'
import { sp } from '../../lib/outils/outilString'

export const dateDeModifImportante = '23/10/2026'
export const uuid = '9a8e7'
export const refs = {
  'fr-fr': ['3A10DNB0', '3Z1DNB-17'],
  'fr-ch': ['9R2NO1H-5', '9R3NO1H-5', '10CTNO1B-5'],
}
export const titre = 'Résoudre un problème de partage'
export const dateDePublication = '15/11/2024'
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
    this.besoinFormulaireCaseACocher = ['Sujet original', false]
    this.sup = false

    this.versionAleatoire()
    this.introduction = texteItalique(
      "D'après l'exercice $1$ du brevet Antilles-Guyane 2024.",
    )
  }

  private appliquerLesValeurs(
    roses: number,
    blanches: number,
    ballotins: number,
    couleur: string = 'blanche',
  ) {
    const sousListe2 = createList({
      items: [
        `Combien Anne et Jean ont acheté de dragées au total${sp()}?`,
        `Anne prend au hasard une dragée dans le sachet. Quelle est la probabilité qu'elle obtienne une dragée ${couleur}${sp()}?`,
      ],
      style: 'alpha',
    })
    const couleurChoisie = couleur === 'blanche' ? blanches : roses
    const nbTotal = roses + blanches
    const proba = new FractionEtendue(couleurChoisie, nbTotal)
    const pgcdRoseBlanche = pgcd(roses, blanches)
    const decompo = texFactorisation(pgcdRoseBlanche)
    const sousListe2Correction = createList({
      items: [
        `Anne et Jean
ont acheté en tout $${roses} + ${blanches} = ${miseEnEvidence(texNombre(nbTotal))}$ dragées.`,
        `Il y a $${couleurChoisie}$ dragées ${couleur}s parmi les $${texNombre(nbTotal)}$ dragées ; la probabilité est donc égale à${sp()}: 
        $${proba.estIrreductible ? miseEnEvidence(proba.texFraction) : proba.texFraction + proba.texSimplificationAvecEtapes(false, orangeMathalea)}$.`,
      ],
      style: 'alpha',
    })

    const sousListe3 = createList({
      items: [
        `Peuvent-ils réaliser $${ballotins}$ ballotins${sp()}?`,
        `Décomposer $${roses}$ et $${blanches}$ en produits de facteurs premiers.`,
        "En déduire le nombre maximum de ballotins qu'Anne et Jean pourront réaliser. Donner alors la composition de chaque ballotin.",
      ],
      style: 'alpha',
    })
    const rosesParBallotin = new FractionEtendue(roses, ballotins)
    const blanchesParBallotin = new FractionEtendue(blanches, ballotins)
    const rosesParBallotinFinal = roses / pgcdRoseBlanche
    const blanchesParBallotinFinal = blanches / pgcdRoseBlanche
    const sousListe3Correction = createList({
      items: [
        `Avec $${ballotins}$ ballotins, on aurait $${rosesParBallotin.texFraction}${rosesParBallotin.texSimplificationAvecEtapes()}$ dragées roses par ballotin
        ${
          !rosesParBallotin.estEntiere
            ? ` qui n'est pas un nombre entier.<br>Ils ${texteEnCouleurEtGras('ne peuvent pas')} réaliser $${ballotins}$ ballotins identiques.`
            : ` et $${blanchesParBallotin.texFraction}${blanchesParBallotin.texSimplificationAvecEtapes()}$ dragées blanches par ballotin
        ${
          !blanchesParBallotin.estEntiere
            ? ` qui n'est pas un nombre entier.<br>Ils ${texteEnCouleurEtGras('ne peuvent pas')} réaliser $${ballotins}$ ballotins identiques.`
            : `.<br>Ils ${texteEnCouleurEtGras('peuvent')} donc réaliser $${ballotins}$ ballotins identiques.`
        }`
        }`,
        `${texCalculDecomposition(roses)}<br>${texCalculDecomposition(blanches)}<br>
       Les facteurs communs à $${roses}$ et $${blanches}$ les plus nombreux sont${sp()}: $${decompo}$.<br>
       Autrement dit le plus grand diviseur de $${roses}$ et de $${blanches}$ est $${decompo}=${pgcdRoseBlanche}$.<br>
       On a $${roses} = ${pgcdRoseBlanche}\\times ${rosesParBallotinFinal}$ et $${blanches} = ${pgcdRoseBlanche}\\times ${blanchesParBallotinFinal}$.<br>
       Conclusion${sp()}: Anne et Jean pourront faire $${miseEnEvidence(pgcdRoseBlanche)}$ ballotins identiques de $${miseEnEvidence(rosesParBallotinFinal)}$ dragées roses et $${miseEnEvidence(blanchesParBallotinFinal)}$ dragées blanches.`,
      ],
      style: 'alpha',
    })

    const sousListe4 = createList({
      items: [
        'le nombre de dragées roses est le même dans chaque ballotin',
        'le nombre de dragées blanches est le même dans chaque ballotin',
        'toutes les dragées soient utilisées',
      ],
      style: 'fleches',
    })

    const listePrincipale = createList({
      items: [
        `Anne et Jean ont acheté $${roses}$ dragées roses et $${blanches}$ dragées blanches qu'ils ont mises dans
    un sachet.<br>On suppose que les dragées sont indiscernables au toucher.` +
          sousListe2,
        `Avec ces dragées, ils réalisent des ballotins pour leur mariage de sorte que${sp()}:` +
          sousListe4 +
          sousListe3,
      ],
      style: 'nombres',
    })
    const listePrincipaleCorrection = createList({
      items: [
        sousListe2Correction,
        `Avec ces dragées, ils réalisent des ballotins pour leur mariage de sorte que${sp()}:` +
          sousListe4 +
          sousListe3Correction,
      ],
      style: 'nombres',
    })

    this.enonce = listePrincipale
    this.correction = listePrincipaleCorrection
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(630, 810, 21, 'blanche')
  }

  versionAleatoire: () => void = () => {
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

    const ballotins = unDiviseur

    this.appliquerLesValeurs(nb1, nb2, ballotins, choice(['rose', 'blanche']))
  }
}
