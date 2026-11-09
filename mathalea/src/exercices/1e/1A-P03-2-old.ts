// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 35408 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { estPremier } from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '02/01/2026'
export const uuid = '35408'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Calculer une probabilité (avec probabilité conditionnelle)'
export default class auto1AP3bOld extends ExerciceQcmA {
  private appliquerLesValeurs(
    urneA: number[],
    urneB: number[],
    typeQuestion: number,
  ): void {
    const nbA = urneA.length
    const nbB = urneB.length
    const nbTotal = nbA + nbB

    // Description des urnes
    const descriptionUrnes = `On dispose d'une urne A contenant $${nbA}$ boules numérotées : $${urneA.join(' ; ')}$ et d'une urne B contenant $${nbB}$ boules numérotées : $${urneB.join(' ; ')}$.<br>
    Les boules sont indiscernables au toucher.<br>
    On choisit une urne au hasard, puis on tire au hasard une boule dans cette urne.`

    let texteQuestion = ''
    let correction = ''
    let nomEvenement = ''
    let texteEvenement = ''

    // Compter les cas favorables dans chaque urne
    let nbFavorablesA = 0
    let nbFavorablesB = 0
    const issuesFavorablesA: string[] = []
    const issuesFavorablesB: string[] = []

    // Question 1 : numéro pair
    if (typeQuestion === 1) {
      texteQuestion =
        'Quelle est la probabilité que le numéro de la boule tirée soit pair ?'
      nomEvenement = 'M'
      texteEvenement = 'obtenir un numéro pair'

      for (const num of urneA) {
        if (num % 2 === 0) {
          nbFavorablesA++
          issuesFavorablesA.push(`${num}`)
        }
      }
      for (const num of urneB) {
        if (num % 2 === 0) {
          nbFavorablesB++
          issuesFavorablesB.push(`${num}`)
        }
      }
    }

    // Question 2 : numéro impair
    if (typeQuestion === 2) {
      texteQuestion =
        'Quelle est la probabilité que le numéro de la boule tirée soit impair ?'
      nomEvenement = 'M'
      texteEvenement = 'obtenir un numéro impair'

      for (const num of urneA) {
        if (num % 2 === 1) {
          nbFavorablesA++
          issuesFavorablesA.push(`${num}`)
        }
      }
      for (const num of urneB) {
        if (num % 2 === 1) {
          nbFavorablesB++
          issuesFavorablesB.push(`${num}`)
        }
      }
    }

    // Question 3 : multiple de 3
    if (typeQuestion === 3) {
      texteQuestion =
        'Quelle est la probabilité que le numéro de la boule tirée soit un multiple de 3 ?'
      nomEvenement = 'M'
      texteEvenement = 'obtenir un multiple de 3'

      for (const num of urneA) {
        if (num % 3 === 0) {
          nbFavorablesA++
          issuesFavorablesA.push(`${num}`)
        }
      }
      for (const num of urneB) {
        if (num % 3 === 0) {
          nbFavorablesB++
          issuesFavorablesB.push(`${num}`)
        }
      }
    }

    // Question 4 : nombre premier
    if (typeQuestion === 4) {
      texteQuestion =
        'Quelle est la probabilité que le numéro de la boule tirée soit un nombre premier ?'
      nomEvenement = 'M'
      texteEvenement = 'obtenir un nombre premier'

      for (const num of urneA) {
        if (estPremier(num)) {
          nbFavorablesA++
          issuesFavorablesA.push(`${num}`)
        }
      }
      for (const num of urneB) {
        if (estPremier(num)) {
          nbFavorablesB++
          issuesFavorablesB.push(`${num}`)
        }
      }
    }

    // Calcul des probabilités
    const pA = new FractionEtendue(1, 2) // P(A) = 1/2
    const pB = new FractionEtendue(1, 2) // P(B) = 1/2
    const pMA = new FractionEtendue(nbFavorablesA, nbA) // P(M|A)
    const pMB = new FractionEtendue(nbFavorablesB, nbB) // P(M|B)

    // P(M) = P(A) × P(M|A) + P(B) × P(M|B)
    const terme1 = pA.produitFraction(pMA) // 1/2 × nbFavorablesA/nbA
    const terme2 = pB.produitFraction(pMB) // 1/2 × nbFavorablesB/nbB
    const pM = terme1.sommeFraction(terme2)

    // Probabilité incorrecte (en supposant l'équiprobabilité)
    const pIncorrecte = new FractionEtendue(
      nbFavorablesA + nbFavorablesB,
      nbTotal,
    )

    // Correction
    correction = `On note $A$ l'événement « choisir l'urne A » et $B$ l'événement « choisir l'urne B ».<br>
    On note $${nomEvenement}$ l'événement « ${texteEvenement} ».<br>
   
    On a : $P(A) = ${pA.texFractionSimplifiee}$ et $P(B) = ${pB.texFractionSimplifiee}$ (les deux urnes sont choisies de manière équiprobable). <br>
    Dans l'urne A, il y a $${nbFavorablesA}$ issue${nbFavorablesA > 1 ? 's' : ''} favorable${nbFavorablesA > 1 ? 's' : ''} : $${issuesFavorablesA.join(', ')}$.<br>
    Dans l'urne B, il y a $${nbFavorablesB}$ issue${nbFavorablesB > 1 ? 's' : ''} favorable${nbFavorablesB > 1 ? 's' : ''} : $${issuesFavorablesB.join(', ')}$.<br>
    Donc on a :
    $P_{A}(${nomEvenement}) = \\dfrac{${nbFavorablesA}}{${nbA}}${pMA.d !== nbA ? ` = ${pMA.texFractionSimplifiee}` : ''}$ et $P_{B}(${nomEvenement}) = \\dfrac{${nbFavorablesB}}{${nbB}}${pMB.d !== nbB ? ` = ${pMB.texFractionSimplifiee}` : ''}$. <br>
    
   $A$ et $B$ forment une partition de l'univers, d'après la formule des probabilités totales  :<br>
    $P(${nomEvenement}) = P(A) \\times P_{A}(${nomEvenement}) + P(B) \\times P_{B}(${nomEvenement})$<br>
    $P(${nomEvenement}) = ${pA.texFractionSimplifiee} \\times ${pMA.texFractionSimplifiee} + ${pB.texFractionSimplifiee} \\times ${pMB.texFractionSimplifiee}$<br>
    $P(${nomEvenement}) = ${terme1.texFractionSimplifiee} + ${terme2.texFractionSimplifiee}$<br>
    $P(${nomEvenement}) = ${miseEnEvidence(pM.texFractionSimplifiee)}$`

    this.enonce = `${descriptionUrnes}<br>${texteQuestion}`
    this.correction = correction

    // Distracteurs
    const distracteurs: string[] = []

    // Distracteur 1 : probabilité en supposant l'équiprobabilité (erreur classique) - TOUJOURS inclus
    if (pIncorrecte.texFractionSimplifiee !== pM.texFractionSimplifiee) {
      distracteurs.push(pIncorrecte.texFractionSimplifiee)
    }

    // Distracteur 2 : erreur proche - on modifie légèrement le numérateur de la bonne réponse
    // P(M) calculé correctement, puis on ajoute ou enlève une petite valeur
    const numCorrect = pM.n
    const denCorrect = pM.d

    // Essayer numCorrect + 1
    if (numCorrect + 1 < denCorrect) {
      const distProche1 = new FractionEtendue(numCorrect + 1, denCorrect)
      if (distProche1.texFractionSimplifiee !== pM.texFractionSimplifiee) {
        distracteurs.push(distProche1.texFractionSimplifiee)
      }
    }

    // Essayer numCorrect - 1
    if (numCorrect > 1) {
      const distProche2 = new FractionEtendue(numCorrect - 1, denCorrect)
      if (distProche2.texFractionSimplifiee !== pM.texFractionSimplifiee) {
        distracteurs.push(distProche2.texFractionSimplifiee)
      }
    }

    // Distracteur 3 : erreur en inversant les termes (P(A) × P(M|B) + P(B) × P(M|A))
    const terme1Inverse = pA.produitFraction(pMB)
    const terme2Inverse = pB.produitFraction(pMA)
    const pMInverse = terme1Inverse.sommeFraction(terme2Inverse)
    if (pMInverse.texFractionSimplifiee !== pM.texFractionSimplifiee) {
      distracteurs.push(pMInverse.texFractionSimplifiee)
    }

    // Distracteur 4 : P(M|A) seul (si différent)
    if (
      pMA.texFractionSimplifiee !== pM.texFractionSimplifiee &&
      distracteurs.length < 5
    ) {
      distracteurs.push(pMA.texFractionSimplifiee)
    }

    // Distracteur 5 : P(M|B) seul (si différent)
    if (
      pMB.texFractionSimplifiee !== pM.texFractionSimplifiee &&
      distracteurs.length < 5
    ) {
      distracteurs.push(pMB.texFractionSimplifiee)
    }

    // S'assurer qu'on a 3 distracteurs différents
    const distracteursUniques = [...new Set(distracteurs)].filter(
      (d) => d !== pM.texFractionSimplifiee,
    )
    while (distracteursUniques.length < 3) {
      const f = new FractionEtendue(randint(1, 10), randint(11, 20))
      if (
        f.texFractionSimplifiee !== pM.texFractionSimplifiee &&
        !distracteursUniques.includes(f.texFractionSimplifiee)
      ) {
        distracteursUniques.push(f.texFractionSimplifiee)
      }
    }

    this.reponses = [
      `$${pM.texFractionSimplifiee}$`,
      `$${distracteursUniques[0]}$`,
      `$${distracteursUniques[1]}$`,
      `$${distracteursUniques[2]}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // Cas 1
    const urneA = [2, 5, 7, 11, 13]
    const urneB = [3, 6, 8, 12, 15, 17, 19]
    this.appliquerLesValeurs(urneA, urneB, 1) // pair
  }

  versionAleatoire: () => void = () => {
    // 15 cas prédéfinis avec 4 questions par cas
    // CONTRAINTE : pour chaque événement (pair, impair, mult3, premier), il y a AU MOINS 1 cas favorable dans chaque urne
    // Nombres de boules : 4, 5, 6 ou 8 (éviter 7 pour simplifier les calculs)
    const cas = [
      // Cas 1 : 6 boules dans A, 8 dans B
      { urneA: [2, 5, 7, 9, 11, 13], urneB: [3, 6, 8, 12, 15, 17, 19, 23] },
      // pair: 1 dans A, 3 dans B | impair: 5 dans A, 5 dans B | mult3: 1 dans A, 2 dans B | premier: 4 dans A, 5 dans B

      // Cas 2 : 5 boules dans A, 8 dans B
      { urneA: [3, 6, 9, 14, 21], urneB: [2, 5, 7, 10, 15, 19, 23, 25] },
      // pair: 2 dans A, 2 dans B | impair: 3 dans A, 5 dans B | mult3: 4 dans A, 1 dans B | premier: 1 dans A, 4 dans B

      // Cas 3 : 6 boules dans A, 8 dans B
      { urneA: [4, 9, 11, 15, 18, 21], urneB: [2, 3, 5, 7, 24, 27, 29, 30] },
      // pair: 2 dans A, 3 dans B | impair: 4 dans A, 5 dans B | mult3: 4 dans A, 2 dans B | premier: 1 dans A, 5 dans B

      // Cas 4 : 5 boules dans A, 8 dans B
      { urneA: [2, 3, 6, 11, 13], urneB: [5, 8, 9, 17, 19, 22, 24, 29] },
      // pair: 2 dans A, 3 dans B | impair: 3 dans A, 5 dans B | mult3: 2 dans A, 1 dans B | premier: 4 dans A, 4 dans B

      // Cas 5 : 8 boules dans A, 6 dans B
      { urneA: [3, 4, 8, 9, 12, 14, 19, 21], urneB: [2, 6, 7, 11, 13, 15] },
      // pair: 4 dans A, 2 dans B | impair: 4 dans A, 4 dans B | mult3: 3 dans A, 2 dans B | premier: 2 dans A, 4 dans B

      // Cas 6 : 5 boules dans A, 8 dans B
      { urneA: [6, 7, 9, 11, 12], urneB: [2, 3, 5, 13, 15, 19, 21, 23] },
      // pair: 2 dans A, 1 dans B | impair: 3 dans A, 7 dans B | mult3: 3 dans A, 2 dans B | premier: 2 dans A, 5 dans B

      // Cas 7 : 6 boules dans A, 8 dans B
      { urneA: [2, 6, 9, 11, 15, 21], urneB: [3, 5, 7, 12, 18, 27, 29, 30] },
      // pair: 2 dans A, 3 dans B | impair: 4 dans A, 5 dans B | mult3: 3 dans A, 3 dans B | premier: 2 dans A, 4 dans B

      // Cas 8 : 6 boules dans A, 8 dans B
      { urneA: [2, 4, 5, 7, 9, 13], urneB: [3, 6, 17, 19, 23, 25, 26, 29] },
      // pair: 2 dans A, 2 dans B | impair: 4 dans A, 6 dans B | mult3: 1 dans A, 2 dans B | premier: 4 dans A, 5 dans B

      // Cas 9 : 5 boules dans A, 8 dans B
      { urneA: [3, 6, 10, 12, 18], urneB: [5, 7, 9, 14, 16, 20, 22, 28] },
      // pair: 4 dans A, 5 dans B | impair: 1 dans A, 3 dans B | mult3: 4 dans A, 1 dans B | premier: 1 dans A, 2 dans B

      // Cas 10 : 8 boules dans A, 6 dans B
      { urneA: [2, 3, 5, 9, 11, 15, 18, 21], urneB: [6, 8, 13, 17, 19, 23] },
      // pair: 2 dans A, 2 dans B | impair: 6 dans A, 4 dans B | mult3: 3 dans A, 1 dans B | premier: 4 dans A, 4 dans B

      // Cas 11 : 6 boules dans A, 8 dans B
      { urneA: [4, 6, 9, 11, 15, 27], urneB: [2, 3, 5, 7, 12, 21, 24, 30] },
      // pair: 2 dans A, 4 dans B | impair: 4 dans A, 4 dans B | mult3: 3 dans A, 3 dans B | premier: 1 dans A, 4 dans B

      // Cas 12 : 5 boules dans A, 8 dans B
      { urneA: [2, 3, 5, 9, 11], urneB: [6, 13, 15, 17, 19, 22, 23, 29] },
      // pair: 2 dans A, 2 dans B | impair: 4 dans A, 6 dans B | mult3: 2 dans A, 1 dans B | premier: 4 dans A, 5 dans B

      // Cas 13 : 8 boules dans A, 6 dans B
      { urneA: [2, 4, 8, 9, 14, 15, 19, 21], urneB: [3, 6, 11, 12, 18, 24] },
      // pair: 4 dans A, 4 dans B | impair: 4 dans A, 2 dans B | mult3: 2 dans A, 4 dans B | premier: 2 dans A, 2 dans B

      // Cas 14 : 6 boules dans A, 8 dans B
      { urneA: [3, 4, 7, 9, 15, 21], urneB: [2, 5, 6, 11, 13, 17, 19, 23] },
      // pair: 1 dans A, 2 dans B | impair: 5 dans A, 6 dans B | mult3: 4 dans A, 1 dans B | premier: 1 dans A, 5 dans B

      // Cas 15 : 8 boules dans A, 6 dans B
      { urneA: [6, 9, 11, 15, 18, 21, 24, 27], urneB: [2, 3, 7, 12, 25, 30] },
      // pair: 4 dans A, 3 dans B | impair: 4 dans A, 3 dans B | mult3: 6 dans A, 2 dans B | premier: 1 dans A, 3 dans B
    ]

    const casChoisi = cas[randint(0, cas.length - 1)]
    const questionChoisie = randint(1, 4)

    this.appliquerLesValeurs(casChoisi.urneA, casChoisi.urneB, questionChoisie)
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.spacingCorr = 2
    this.spacing = 2
  }
}
