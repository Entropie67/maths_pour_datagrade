import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
// import ExerciceQcmA from '../../ExerciceQcmA'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '118c2'
export const refs = {
  'fr-fr': ['1A-E02-4', '2A-E2-4'],
  'fr-ch': ['autres-9'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Exprimer la valeur finale en fonction de la valeur initiale'
export const dateDePublication = '02/08/2025'
//
/**
 *
 * @author Gilles Mora
 *
 */
export default class Auto1AE2c extends ExerciceQcmA {
  // S'occupe de passser les données originales à la fonction appliquerLesValeurs

  versionOriginale: () => void = () => {
    this.enonce = `Le volume d'un glacier diminue de $3\\,\\%$ chaque année.<br>
    Si $V(n)$ désigne le volume du glacier pour l'année $n$ on a :`

    this.correction = `Le volume diminue de $3\\,\\%$ chaque année, le coefficient multiplicateur est $1-0,03=0,97$.<br>
    Donc $V(n + 1) = 0,97 \\times V(n)$.`

    this.reponses = [
      '$V(n + 1) = 0,97 \\times V(n)$',
      '$V(n + 1) = V(n) - 0,03$',
      '$V(n + 1) = 0,03 \\times V(n)$',
      '$V(n + 1) = V(n) - 0,97$',
    ]
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      //switch (choice([1, 2, 3, 4])) {
      switch (choice([4])) {
        case 1: {
          // Case 1: glacier qui diminue de 1 à 7%
          const taux = randint(1, 7)
          const coeffMultiplicateur = texNombre((100 - taux) / 100, 2)
          const tauxDecimal = texNombre(taux / 100, 2)

          this.enonce = `Le volume d'un glacier diminue de $${taux}\\,\\%$ chaque année.<br>
        Si $V(n)$ désigne le volume du glacier pour l'année $n$ on a :`

          const bonneReponse1 = `V(n + 1) = ${coeffMultiplicateur} \\times V(n)`
          const bonneReponse2 = `V(n + 1) = V(n)-${tauxDecimal}\\times V(n)`
          const bonneReponse3 = `V(n + 1) = V(n)-\\dfrac{${taux}\\times V(n)}{100}`
          const mauvaiseReponse1 = `$V(n + 1) = V(n) - \\dfrac{${taux}}{100}$`
          const mauvaiseReponse2 = `$V(n + 1) = V(n) - ${texNombre(taux / 10, 2)}\\times V(n)$`
          const bonneReponseRetenue = choice([
            bonneReponse1,
            bonneReponse2,
            bonneReponse3,
          ])
          const mauvaiseReponseRetenue = choice([
            mauvaiseReponse1,
            mauvaiseReponse2,
          ])
          if (
            bonneReponseRetenue ===
            `V(n + 1) = ${coeffMultiplicateur} \\times V(n)`
          ) {
            this.correction = `Pour diminuer de $${taux}\\,\\%$, on applique un coefficient multiplicateur de  $1 - ${tauxDecimal}= ${coeffMultiplicateur}$.<br>
        On a donc : $${miseEnEvidence(bonneReponseRetenue)}$.`
          } else {
            this.correction = `On obtient $V(n+1)$ en diminuant  $V(n)$  de $${taux}\\,\\%$ de $V(n)$.<br>
        On a donc : $${miseEnEvidence(bonneReponseRetenue)}$.`
          }
          this.reponses = [
            `$${bonneReponseRetenue}$`,
            `$V(n + 1) = V(n) - ${tauxDecimal}$`,
            `$V(n + 1) = ${tauxDecimal} \\times V(n)$`,
            mauvaiseReponseRetenue,
          ]
          break
        }

        case 2: {
          // Case 2: population d'une ville qui augmente ou diminue de 1 à 10%
          const taux = randint(1, 10)
          const augmentation = choice([true, false])
          const coeffMultiplicateur = augmentation
            ? texNombre((100 + taux) / 100, 2)
            : texNombre((100 - taux) / 100, 2)
          const tauxDecimal = texNombre(taux / 100, 2)
          const verbe = augmentation
            ? ['augmenter', 'augmentant', 'augmente']
            : ['diminuer', 'diminuant', 'diminue']
          const signe = augmentation ? '+' : '-'
          const signeOppose = augmentation ? '-' : '+'
          const operateur = augmentation ? '1 + ' : '1 - '

          this.enonce = `La population d'une ville ${verbe[2]} de $${taux}\\,\\%$ chaque année.<br>
        Si $P(n)$ désigne la population de la ville pour l'année $n$ on a :`

          const bonneReponse1 = `P(n + 1) = ${coeffMultiplicateur} \\times P(n)`
          const bonneReponse2 = `P(n + 1) = P(n)${signe}${tauxDecimal}\\times P(n)`
          const bonneReponse3 = `P(n + 1) = P(n)${signe}\\dfrac{${taux}\\times P(n)}{100}`
          const mauvaiseReponse1 = `$P(n + 1) = P(n) ${signe} \\dfrac{${taux}}{100}$`
          const mauvaiseReponse2 = `$P(n + 1) = P(n) ${signeOppose} ${texNombre(taux / 10, 2)}\\times P(n)$`
          const bonneReponseRetenue = choice([
            bonneReponse1,
            bonneReponse2,
            bonneReponse3,
          ])
          const mauvaiseReponseRetenue = choice([
            mauvaiseReponse1,
            mauvaiseReponse2,
          ])
          if (
            bonneReponseRetenue ===
            `P(n + 1) = ${coeffMultiplicateur} \\times P(n)`
          ) {
            this.correction = `Pour ${verbe[0]} de $${taux}\\,\\%$, on applique un coefficient multiplicateur de $${operateur}${tauxDecimal} = ${coeffMultiplicateur}$.<br>
        Donc $${miseEnEvidence(bonneReponseRetenue)}$.`
          } else {
            this.correction = `On obtient $P(n+1)$ en ${verbe[1]}  $P(n)$  de $${taux}\\,\\%$ de $P(n)$.<br>
        On a donc : $${miseEnEvidence(bonneReponseRetenue)}$.`
          }
          this.reponses = [
            `$${bonneReponseRetenue}$`,
            `$P(n + 1) = P(n) ${signe} ${tauxDecimal}$`,
            `$P(n + 1) = ${tauxDecimal} \\times P(n)$`,
            mauvaiseReponseRetenue,
          ]
          break
        }

        case 3: {
          // Case 3: le prix d'un article qui augmente ou diminue de 2 à 20%
          const taux = randint(2, 20)
          const augmentation = choice([true, false])
          const coeffMultiplicateur = augmentation
            ? texNombre((100 + taux) / 100, 2)
            : texNombre((100 - taux) / 100, 2)
          const tauxDecimal = texNombre(taux / 100, 2)
          const verbe = augmentation
            ? ['augmenter', 'augmentant', 'augmente']
            : ['diminuer', 'diminuant', 'diminue']
          const signe = augmentation ? '+' : '-'
          const signeOppose = augmentation ? '-' : '+'
          const operateur = augmentation ? '1 + ' : '1 - '

          this.enonce = `Le prix d'un article ${verbe[2]} de $${taux}\\,\\%$ chaque année.<br>
        Si $P(n)$ désigne le prix de l'article pour l'année $n$ on a :`

          const bonneReponse1 = `P(n + 1) = ${coeffMultiplicateur} \\times P(n)`
          const bonneReponse2 = `P(n + 1) = P(n)${signe}${tauxDecimal}\\times P(n)`
          const bonneReponse3 = `P(n + 1) = P(n)${signe}\\dfrac{${taux}\\times P(n)}{100}`
          const mauvaiseReponse1 = `$P(n + 1) = P(n) ${signe} \\dfrac{${taux}}{100}$`
          const mauvaiseReponse2 = `$P(n + 1) = P(n) ${signeOppose} ${texNombre(taux / 10, 2)}\\times P(n)$`
          const bonneReponseRetenue = choice([
            bonneReponse1,
            bonneReponse2,
            bonneReponse3,
          ])
          const mauvaiseReponseRetenue = choice([
            mauvaiseReponse1,
            mauvaiseReponse2,
          ])

          if (
            bonneReponseRetenue ===
            `P(n + 1) = ${coeffMultiplicateur} \\times P(n)`
          ) {
            this.correction = `Pour ${verbe[0]} de $${taux}\\,\\%$, on applique un coefficient multiplicateur de $${operateur}${tauxDecimal} = ${coeffMultiplicateur}$.<br>
        Donc $${miseEnEvidence(bonneReponseRetenue)}$.`
          } else {
            this.correction = `On obtient $P(n+1)$ en ${verbe[1]}  $P(n)$  de $${taux}\\,\\%$ de $P(n)$.<br>
        On a donc : $${miseEnEvidence(bonneReponseRetenue)}$.`
          }
          this.reponses = [
            `$${bonneReponseRetenue}$`,
            `$P(n + 1) = P(n) ${signe} ${tauxDecimal}$`,
            `$P(n + 1) = ${tauxDecimal} \\times P(n)$`,
            mauvaiseReponseRetenue,
          ]
          break
        }

        case 4:
        default: {
          // Case 4: le nombre d'adhérents à un club qui augmente ou diminue
          const taux = randint(3, 25)
          const augmentation = choice([true, false])
          const coeffMultiplicateur = augmentation
            ? texNombre((100 + taux) / 100, 2)
            : texNombre((100 - taux) / 100, 2)
          const tauxDecimal = texNombre(taux / 100, 2)
          const verbe = augmentation
            ? ['augmenter', 'augmentant', 'augmente']
            : ['diminuer', 'diminuant', 'diminue']
          const signe = augmentation ? '+' : '-'
          const signeOppose = augmentation ? '-' : '+'
          const operateur = augmentation ? '1 + ' : '1 - '
          const typeClub = choice([
            'club de sport',
            'association',
            'club de lecture',
            "club d'échecs",
          ])
          const lettreEOuPas = typeClub === 'association' ? 'e' : ''
          const duOuPas = typeClub !== 'association' ? 'du ' : "de l'"
          this.enonce = `Le nombre d'adhérents d'un${lettreEOuPas} ${typeClub} ${verbe[2]} de $${taux}\\,\\%$ chaque année.<br>
        Si $N(n)$ désigne le nombre d'adhérents ${duOuPas}${typeClub} pour l'année $n$, on a :`

          const bonneReponse1 = `N(n + 1) = ${coeffMultiplicateur} \\times N(n)`
          const bonneReponse2 = `N(n + 1) = N(n)${signe}${tauxDecimal}\\times N(n)`
          const bonneReponse3 = `N(n + 1) = N(n)${signe}\\dfrac{${taux}\\times N(n)}{100}`
          const mauvaiseReponse1 = `$N(n + 1) = N(n) ${signe} \\dfrac{${taux}}{100}$`
          const mauvaiseReponse2 = `$N(n + 1) = N(n) ${signeOppose} ${texNombre(taux / 10, 2)}\\times N(n)$`
          const bonneReponseRetenue = choice([
            bonneReponse1,
            bonneReponse2,
            bonneReponse3,
          ])
          const mauvaiseReponseRetenue = choice([
            mauvaiseReponse1,
            mauvaiseReponse2,
          ])

          if (
            bonneReponseRetenue ===
            `N(n + 1) = ${coeffMultiplicateur} \\times N(n)`
          ) {
            this.correction = `Pour ${verbe[0]} de $${taux}\\,\\%$, on applique un coefficient multiplicateur de $${operateur}${tauxDecimal} = ${coeffMultiplicateur}$.<br>
        Donc $${miseEnEvidence(bonneReponseRetenue)}$.`
          } else {
            this.correction = `On obtient $N(n+1)$ en ${verbe[1]}  $N(n)$  de $${taux}\\,\\%$ de $N(n)$.<br>
        On a donc : $${miseEnEvidence(bonneReponseRetenue)}$.`
          }
          this.reponses = [
            `$${bonneReponseRetenue}$`,
            `$N(n + 1) = N(n) ${signe} ${tauxDecimal}$`,
            `$N(n + 1) = ${tauxDecimal} \\times N(n)$`,
            mauvaiseReponseRetenue,
          ]
          break
        }
      }
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true)) // On s'assure d'avoir 4 réponses différentes, sinon on régénère
  }

  constructor() {
    super()
    this.versionAleatoire()
    this.options.vertical = true
  }
}
