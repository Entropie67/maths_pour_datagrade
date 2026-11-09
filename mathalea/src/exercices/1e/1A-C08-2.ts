import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
// import ExerciceQcmA from '../../ExerciceQcmA'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '8b272'
export const refs = {
  'fr-fr': ['1A-C08-2'],
  'fr-ch': ['9R1QCMFA-1', '9R2QCMFA-1', '9R3QCMFA-1'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Écrire le calcul correspondant à une phrase avec produit et somme'
export const dateDePublication = '29/11/2025'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoC8b extends ExerciceQcmA {
  private appliquerLesValeurs(
    a: number,
    variable: string,
    b: number,
    cas: number,
  ): void {
    if (cas === 1) {
      // Cas 1 : Le produit de a par la somme de variable et de b
      this.enonce = `Le produit de $${a}$ par la somme de $${variable}$ et de $${b}$ est égal à : `

      const bonnesReponses = [
        `$${a}(${variable}+${b})$`,
        `$${a}${variable}+${a * b}$`,
        `$${a}\\times ${b}+${a}${variable}$`,
        `$(${variable}+${b})\\times ${a}$`,
        `$${a}${variable}+${a}\\times ${b}$`,
      ]

      const mauvaisesReponses = [
        `$${a}${variable}+${b}$`,
        `$${a}+${b}${variable}$`,
        `$${a}${variable}\\times ${b}$`,
        `$${a}\\times ${b}+${variable}$`,
        `$${a}(${variable}\\times ${b})$`,
      ]

      const bonneReponse = choice(bonnesReponses)
      const mauvaisesList = shuffle(mauvaisesReponses).slice(0, 3)

      // Correction adaptée
      const formeFactorisee = `$${a}(${variable}+${b})$`
      const formeDeveloppee1 = `$${a}${variable}+${a * b}$`
      const formeDeveloppee2 = `$${a}\\times ${b}+${a}${variable}$`
      const formeDeveloppee3 = `$${a}${variable}+${a}\\times ${b}$`
      const formeCommutative = `$(${variable}+${b})\\times ${a}$`

      let explication = `Le produit de $${a}$ par la somme de $${variable}$ et de $${b}$ s'écrit : ${formeFactorisee}`

      if (
        bonneReponse === formeDeveloppee1 ||
        bonneReponse === formeDeveloppee2 ||
        bonneReponse === formeDeveloppee3
      ) {
        explication += `, qui se développe en $${miseEnEvidence(bonneReponse.slice(1, -1))}$.`
      } else if (bonneReponse === formeCommutative) {
        explication = `Le produit de $${a}$ par la somme de $${variable}$ et de $${b}$ s'écrit : $${miseEnEvidence(formeCommutative.slice(1, -1))}$.`
      } else {
        explication = `Le produit de $${a}$ par la somme de $${variable}$ et de $${b}$ s'écrit : $${miseEnEvidence(formeFactorisee.slice(1, -1))}$.`
      }

      this.correction = explication
      this.reponses = [
        bonneReponse,
        mauvaisesList[0],
        mauvaisesList[1],
        mauvaisesList[2],
      ]
    } else {
      // Cas 2 : Le produit de variable par la somme de a et de b
      this.enonce = `Le produit de $${variable}$ par la somme de $${a}$ et de $${b}$ est égal à : `

      const bonnesReponses = [
        `$${variable}(${a}+${b})$`,
        `$${a}${variable}+${b}${variable}$`,
        `$${variable}\\times ${a}+${b}${variable}$`,
        `$(${a}+${b})\\times ${variable}$`,
        `$${b}${variable}+${variable}\\times ${a}$`,
      ]

      const mauvaisesReponses = [
        `$${a}${variable}+${b}$`,
        `$${variable}+${a}${b}$`,
        `$${a}${variable}\\times ${b}$`,
        `$${variable}\\times ${a}+${b}$`,
        `$${variable}(${a}\\times ${b})$`,
      ]

      const bonneReponse = choice(bonnesReponses)
      const mauvaisesList = shuffle(mauvaisesReponses).slice(0, 3)

      // Correction adaptée
      const formeFactorisee = `$${variable}(${a}+${b})$`
      const formeDeveloppee1 = `$${a}${variable}+${b}${variable}$`
      const formeDeveloppee2 = `$${variable}\\times ${a}+${b}${variable}$`
      const formeDeveloppee3 = `$${b}${variable}+${variable}\\times ${a}$`
      const formeCommutative = `$(${a}+${b})\\times ${variable}$`

      let explication = `Le produit de $${variable}$ par la somme de $${a}$ et de $${b}$ s'écrit : ${formeFactorisee}`

      if (
        bonneReponse === formeDeveloppee1 ||
        bonneReponse === formeDeveloppee2 ||
        bonneReponse === formeDeveloppee3
      ) {
        explication += `, qui se développe en $${miseEnEvidence(bonneReponse.slice(1, -1))}$.`
      } else if (bonneReponse === formeCommutative) {
        explication = `Le produit de $${variable}$ par la somme de $${a}$ et de $${b}$ s'écrit : $${miseEnEvidence(formeCommutative.slice(1, -1))}$.`
      } else {
        explication = `Le produit de $${variable}$ par la somme de $${a}$ et de $${b}$ s'écrit : $${miseEnEvidence(formeFactorisee.slice(1, -1))}$.`
      }
      explication += '.'

      this.correction = explication
      this.reponses = [
        bonneReponse,
        mauvaisesList[0],
        mauvaisesList[1],
        mauvaisesList[2],
      ]
    }
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(4, 'y', 7, 1)
  }

  versionAleatoire: () => void = () => {
    let compteur = 0
    do {
      const cas = randint(1, 2)
      const variable = choice(['x', 'y', 'a', 'z', 'b'])
      const a = randint(2, 10)
      const b = randint(2, 10, a)

      this.appliquerLesValeurs(a, variable, b, cas)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true)) // On s'assure d'avoir 4 réponses différentes, sinon on régénère
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
