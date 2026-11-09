import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { aLeBonNombreDePropsDifferentes } from '../../../lib/interactif/qcm'
import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  reduireAxPlusB,
  rienSi1,
} from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

export const titre = 'Déterminer un seuil avec une fonction affine'
export const interactifReady = true

export const dateDePublication = '03/05/2024'
export const uuid = '127d3'
export const refs = {
  'fr-fr': ['can2F3-02', '2F31-flash1'],
  'fr-ch': ['1mF2-19'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class seuilFctAff extends ExerciceSimple {
  constructor() {
    super()

    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.versionQcmDisponible = true
    this.formatChampTexte = KeyboardType.clavierNumbers
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    let compteur = 0
    do {
      const nom = ['f', 'g', 'h']
      const nomF = choice(nom)
      switch (this.versionQcm ? randint(1, 2) : randint(1, 1)) {
        case 1:
          {
            const m = randint(1, 10)
            const k = randint(-10, -2)
            const p = k * m + randint(1, m)
            const choix = choice([true, false])
            this.reponse = Number.isInteger(-p / m)
              ? choix
                ? Math.ceil(-p / m) + 1
                : Math.ceil(-p / m) - 1
              : choix
                ? Math.ceil(-p / m)
                : Math.floor(-p / m)

            this.question = `Soit la fonction $${nomF}$ 
    définie par $${nomF}(x)=${reduireAxPlusB(m, p)}$.<br>`
            if (this.versionQcm) {
              this.question += `
   Le plus ${choix ? 'petit ' : 'grand'} entier naturel $n$ ${context.isDiaporama ? '<br>' : ''} tel que 
    $${nomF}(n)$ soit strictement ${choix ? 'positif' : 'négatif'} est : 
    `
            } else {
              this.question += `
    Déterminer le plus ${choix ? 'petit ' : 'grand'} entier naturel $n$ ${context.isDiaporama ? '<br>' : ''} tel que 
    $${nomF}(n)$ soit strictement ${choix ? 'positif.' : 'négatif.'}
    `
            }
            this.correction = `On cherche le plus ${choix ? 'petit ' : 'grand'} entier naturel $n$ vérifiant ${choix ? `$${nomF}(n)>0$` : `$${nomF}(n)<0$`}
    .<br>`
            if (Number.isInteger(-p / m)) {
              this.correction += `Comme ${choix ? `$${rienSi1(m)}n${ecritureAlgebrique(p)}>0$` : `$${rienSi1(m)}n${ecritureAlgebrique(p)}<0$`} équivaut à 
      ${choix ? `$n>${Math.ceil(-p / m)}$` : `$n<${Math.ceil(-p / m)}$`} , le plus ${choix ? 'petit ' : 'grand'} entier naturel $n$ est donc $${miseEnEvidence(this.reponse)}$.`
            } else {
              this.correction += `Comme ${choix ? `$${rienSi1(m)}n${ecritureAlgebrique(p)}>0$` : `$${rienSi1(m)}n${ecritureAlgebrique(p)}<0$`} équivaut à 
      ${choix ? `$n>\\dfrac{${-p}}{${m}}$` : `$n<\\dfrac{${-p}}{${m}}$`}, le plus ${choix ? 'petit ' : 'grand'} entier naturel $n$ est donc $${miseEnEvidence(this.reponse)}$.`
            }
            if (Number.isInteger(-p / m)) {
              this.distracteurs = choix
                ? [
                    `$${Math.ceil(-p / m)}$`,
                    `$${Math.ceil(-p / m) + 2}$`,
                    `$${Math.ceil(-p / m) - 1}$`,
                  ]
                : [
                    `$${Math.ceil(-p / m)}$`,
                    `$${Math.ceil(-p / m) - 2}$`,
                    `$${Math.ceil(-p / m) + 1}$`,
                  ]
            } else {
              this.distracteurs = choix
                ? [
                    `$${Math.ceil(-p / m) + 1}$`,
                    `$${Math.ceil(-p / m) - 1}$`,
                    `$${Math.ceil(-p / m) + 2}$`,
                  ]
                : [
                    `$${Math.floor(-p / m) + 1}$`,
                    `$${Math.floor(-p / m) - 1}$`,
                    `$${Math.floor(-p / m) + 2}$`,
                  ]
            }
          }
          break

        case 2:
          {
            const m = randint(-10, -1)
            const k = randint(-10, -2)
            const p = k * m + randint(1, m)
            const choix = choice([true, false])
            this.reponse = Number.isInteger(-p / m)
              ? choix
                ? Math.ceil(-p / m) + 1
                : Math.ceil(-p / m) - 1
              : choix
                ? Math.ceil(-p / m)
                : Math.floor(-p / m)

            this.question = `Soit la fonction $${nomF}$ 
    définie par $${nomF}(x)=${reduireAxPlusB(m, p)}$.<br>
   Le plus ${choix ? 'petit ' : 'grand'} entier naturel $n$ ${context.isDiaporama ? '<br>' : ''} tel que 
    $${nomF}(n)$ soit strictement ${choix ? 'négatif' : 'positif'} est :
    `
            this.correction = `On cherche le plus ${choix ? 'petit ' : 'grand'} entier naturel $n$ vérifiant ${choix ? `$${nomF}(n)<0$` : `$${nomF}(n)>0$`}
    .<br>`
            if (Number.isInteger(-p / m)) {
              this.correction += `Comme ${choix ? `$${rienSi1(m)}n${ecritureAlgebrique(p)}<0$` : `$${rienSi1(m)}n${ecritureAlgebrique(p)}>0$`} équivaut à 
      ${choix ? `$n>${Math.ceil(-p / m)}$` : `$n<${Math.ceil(-p / m)}$`} , le plus ${choix ? 'petit ' : 'grand'} entier naturel $n$ est donc $${miseEnEvidence(this.reponse)}$.`
            } else {
              this.correction += `Comme ${choix ? `$${rienSi1(m)}n${ecritureAlgebrique(p)}<0$` : `$${rienSi1(m)}n${ecritureAlgebrique(p)}>0$`} équivaut à 
      ${choix ? `$n>\\dfrac{${p}}{${-m}}$` : `$n<\\dfrac{${p}}{${-m}}$`}, le plus ${choix ? 'petit ' : 'grand'} entier naturel $n$ est donc $${miseEnEvidence(this.reponse)}$.`
            }
            if (Number.isInteger(-p / m)) {
              this.distracteurs = choix
                ? [
                    `$${Math.ceil(-p / m)}$`,
                    `$${Math.ceil(-p / m) + 2}$`,
                    `$${Math.ceil(-p / m) - 1}$`,
                  ]
                : [
                    `$${Math.ceil(-p / m)}$`,
                    `$${Math.ceil(-p / m) - 2}$`,
                    `$${Math.ceil(-p / m) + 1}$`,
                  ]
            } else {
              this.distracteurs = choix
                ? [
                    `$${Math.ceil(-p / m) + 1}$`,
                    `$${Math.ceil(-p / m) - 1}$`,
                    `$${Math.ceil(-p / m) + 2}$`,
                  ]
                : [
                    `$${Math.floor(-p / m) + 1}$`,
                    `$${Math.floor(-p / m) - 1}$`,
                    `$${Math.floor(-p / m) + 2}$`,
                  ]
            }
          }
          break
      }
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true)) // On s'assure d'avoir 4 réponses différentes, sinon on régénère
  }
}
