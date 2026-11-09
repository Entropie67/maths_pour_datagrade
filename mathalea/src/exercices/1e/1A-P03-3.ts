import { texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { estPremier } from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '02/01/2026'
export const uuid = '69f3c'

export const refs = {
  'fr-fr': ['1A-P03-3', '2A-P3-3'],
  'fr-ch': [''],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Comparer des probabilités'
export default class auto1AP3c extends ExerciceQcmA {
  private appliquerLesValeurs(
    urneA: number[],
    urneB: number[],
    bonneReponse: number, // 1=≥15, 2=impair, 3=mult3, 4=premier
  ): void {
    const nbA = urneA.length
    const nbB = urneB.length

    // Description des urnes
    const descriptionUrnes = `On dispose d'une urne E contenant $${nbA}$ boules numérotées : $${urneA.join(' ; ')}$ et d'une urne F contenant $${nbB}$ boules numérotées : $${urneB.join(' ; ')}$.<br>
    Les boules sont indiscernables au toucher.`

    const texteQuestion =
      'Parmi les affirmations suivantes, laquelle est vraie ?'

    // Calculer les probabilités pour chaque événement dans chaque urne
    const calcProba = (urne: number[], critere: string): FractionEtendue => {
      let nbFavorables = 0
      for (const num of urne) {
        if (critere === 'sup15' && num >= 15) nbFavorables++
        if (critere === 'impair' && num % 2 === 1) nbFavorables++
        if (critere === 'mult3' && num % 3 === 0) nbFavorables++
        if (critere === 'premier' && estPremier(num)) nbFavorables++
      }
      return new FractionEtendue(nbFavorables, urne.length)
    }

    const pSup15A = calcProba(urneA, 'sup15')
    const pSup15B = calcProba(urneB, 'sup15')
    const pImpairA = calcProba(urneA, 'impair')
    const pImpairB = calcProba(urneB, 'impair')
    const pMult3A = calcProba(urneA, 'mult3')
    const pMult3B = calcProba(urneB, 'mult3')
    const pPremierA = calcProba(urneA, 'premier')
    const pPremierB = calcProba(urneB, 'premier')

    // Déterminer le texte de la bonne réponse
    let texteBonneReponse = ''
    let probaACorrect: FractionEtendue
    let probaBCorrect: FractionEtendue

    if (bonneReponse === 1) {
      texteBonneReponse =
        "La probabilité d'obtenir une boule portant un numéro supérieur ou égal à $15$ est plus grande en choisissant l'urne E."
      probaACorrect = pSup15A
      probaBCorrect = pSup15B
    } else if (bonneReponse === 2) {
      texteBonneReponse =
        "La probabilité d'obtenir une boule portant un numéro impair est plus grande en choisissant l'urne E."
      probaACorrect = pImpairA
      probaBCorrect = pImpairB
    } else if (bonneReponse === 3) {
      texteBonneReponse =
        "La probabilité d'obtenir une boule portant un multiple de $3$ est plus grande en choisissant l'urne E."
      probaACorrect = pMult3A
      probaBCorrect = pMult3B
    } else {
      texteBonneReponse =
        "La probabilité d'obtenir une boule portant un nombre premier est plus grande en choisissant l'urne E."
      probaACorrect = pPremierA
      probaBCorrect = pPremierB
    }

    // Correction
    let correction = `En testant chacune des affirmations, on constate que seule l'affirmation correcte est : <br>
    ${texteBonneReponse}<br>
    En effet :<br>`

    // Compter les cas favorables
    let nbFavA = 0
    let nbFavB = 0
    const issuesFavA: string[] = []
    const issuesFavB: string[] = []

    for (const num of urneA) {
      let estFavorable = false
      if (bonneReponse === 1 && num >= 15) estFavorable = true
      if (bonneReponse === 2 && num % 2 === 1) estFavorable = true
      if (bonneReponse === 3 && num % 3 === 0) estFavorable = true
      if (bonneReponse === 4 && estPremier(num)) estFavorable = true

      if (estFavorable) {
        nbFavA++
        issuesFavA.push(`${num}`)
      }
    }

    for (const num of urneB) {
      let estFavorable = false
      if (bonneReponse === 1 && num >= 15) estFavorable = true
      if (bonneReponse === 2 && num % 2 === 1) estFavorable = true
      if (bonneReponse === 3 && num % 3 === 0) estFavorable = true
      if (bonneReponse === 4 && estPremier(num)) estFavorable = true

      if (estFavorable) {
        nbFavB++
        issuesFavB.push(`${num}`)
      }
    }

    if (nbFavA === 1) {
      correction += `Dans l'urne E, il n'y a qu'une seule issue favorable : $${issuesFavA[0]}$.<br>`
    } else {
      correction += `Dans l'urne E, les issues favorables sont : $${issuesFavA.join(', ')}$.<br>`
    }
    correction += `$P_E = \\dfrac{${nbFavA}}{${nbA}}${probaACorrect.d !== nbA ? ` = ${probaACorrect.texFractionSimplifiee}` : ''}$<br>`

    if (nbFavB === 1) {
      correction += `Dans l'urne F, il n'y a qu'une seule issue favorable : $${issuesFavB[0]}$.<br>`
    } else {
      correction += `Dans l'urne F, les issues favorables sont : $${issuesFavB.join(', ')}$.<br>`
    }
    correction += `$P_F = \\dfrac{${nbFavB}}{${nbB}}${probaBCorrect.d !== nbB ? ` = ${probaBCorrect.texFractionSimplifiee}` : ''}$<br>`

    // Comparer les fractions
    correction += `On a `

    // Mettre au même dénominateur pour comparer
    const denCommun = probaACorrect.d * probaBCorrect.d
    const numA = probaACorrect.n * probaBCorrect.d
    const numB = probaBCorrect.n * probaACorrect.d

    if (probaACorrect.d !== probaBCorrect.d) {
      correction += `$${probaACorrect.texFractionSimplifiee} = \\dfrac{${numA}}{${denCommun}}$ et $${probaBCorrect.texFractionSimplifiee} = \\dfrac{${numB}}{${denCommun}}$ et comme `
    }

    correction += `$${probaACorrect.texFractionSimplifiee} > ${probaBCorrect.texFractionSimplifiee}$, donc :<br>`
    correction += `${texteEnCouleurEtGras(texteBonneReponse)}`

    this.enonce = `${descriptionUrnes}<br>${texteQuestion}`
    this.correction = correction

    // Les 4 propositions
    this.reponses = [
      "La probabilité d'obtenir une boule portant un numéro supérieur ou égal à $15$ est plus grande en choisissant l'urne E plutôt que l'urne F.",
      "La probabilité d'obtenir une boule portant un numéro impair est plus grande en choisissant l'urne E plutôt que l'urne F.",
      "La probabilité d'obtenir une boule portant un multiple de $3$ est plus grande en choisissant l'urne E plutôt que l'urne F.",
      "La probabilité d'obtenir une boule portant un nombre premier est plus grande en choisissant l'urne E plutôt que l'urne F.",
    ]

    // Mettre la bonne réponse en premier
    const temp = this.reponses[0]
    this.reponses[0] = this.reponses[bonneReponse - 1]
    this.reponses[bonneReponse - 1] = temp
  }

  versionOriginale: () => void = () => {
    const urneA = [2, 4, 15, 26, 30]
    const urneB = [3, 6, 17, 24]
    this.appliquerLesValeurs(urneA, urneB, 1) // ≥15 plus grand dans A
  }

  versionAleatoire: () => void = () => {
    // 15 cas avec bonne réponse variée - TOUS VÉRIFIÉS
    // CONTRAINTE : UNE SEULE des 4 propositions doit être vraie
    // Tailles variées : 4-6 boules par urne, total 8-12 boules
    // Répartition : 4 ≥15, 4 IMPAIR, 4 MULT3, 3 PREMIER
    const cas = [
      { urneA: [2, 4, 15, 26, 30], urneB: [3, 6, 17, 24], bonneReponse: 1 }, // ≥15 (5/4)
      { urneA: [6, 14, 16, 19, 26], urneB: [2, 3, 7, 20], bonneReponse: 1 }, // ≥15 (5/4)
      {
        urneA: [5, 10, 18, 21, 28],
        urneB: [3, 13, 14, 16, 24],
        bonneReponse: 1,
      }, // ≥15 (5/5)
      {
        urneA: [11, 20, 21, 24, 26, 30],
        urneB: [2, 9, 13, 15],
        bonneReponse: 1,
      }, // ≥15 (6/4)
      {
        urneA: [4, 7, 14, 21, 25],
        urneB: [6, 15, 19, 26, 30],
        bonneReponse: 2,
      }, // IMPAIR (5/5)
      {
        urneA: [9, 13, 19, 20, 25],
        urneB: [3, 7, 17, 24, 28],
        bonneReponse: 2,
      }, // IMPAIR (5/5)
      {
        urneA: [3, 9, 10, 11, 22, 28],
        urneB: [5, 12, 20, 24, 29],
        bonneReponse: 2,
      }, // IMPAIR (6/5)
      {
        urneA: [9, 10, 13, 16, 19],
        urneB: [2, 6, 17, 20, 29],
        bonneReponse: 2,
      }, // IMPAIR (5/5)
      {
        urneA: [10, 12, 14, 18, 23, 26],
        urneB: [7, 8, 25, 27],
        bonneReponse: 3,
      }, // MULT3 (6/4)
      {
        urneA: [6, 7, 9, 10, 15, 16],
        urneB: [5, 12, 23, 25, 29],
        bonneReponse: 3,
      }, // MULT3 (6/5)
      { urneA: [2, 3, 9, 16], urneB: [5, 6, 7, 13, 18, 23], bonneReponse: 3 }, // MULT3 (4/6)
      {
        urneA: [6, 7, 14, 18, 30],
        urneB: [4, 19, 21, 22, 27],
        bonneReponse: 3,
      }, // MULT3 (5/5)
      {
        urneA: [2, 4, 11, 14, 22, 24],
        urneB: [12, 23, 25, 27],
        bonneReponse: 4,
      }, // PREMIER (6/4)
      {
        urneA: [4, 5, 8, 12, 23],
        urneB: [11, 15, 24, 25, 30],
        bonneReponse: 4,
      }, // PREMIER (5/5)
      {
        urneA: [2, 13, 26, 30],
        urneB: [6, 15, 17, 19, 20, 27],
        bonneReponse: 4,
      }, // PREMIER (4/6)
    ]

    const casChoisi = cas[randint(0, cas.length - 1)]
    this.appliquerLesValeurs(
      casChoisi.urneA,
      casChoisi.urneB,
      casChoisi.bonneReponse,
    )
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.options.vertical = true
    this.spacing = 1.5
    this.spacingCorr = 2
  }
}
