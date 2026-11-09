import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Diviser avec des décimaux'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDeModifImportante = '05/01/2026'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora
 * Créé pendant l'été 2021

 * Date de publication
*/
export const uuid = '4fc0e'

export const refs = {
  'fr-fr': ['can5C3-01', '5N1C-flash1'],
  'fr-ch': ['NR'],
}
export default class DivisionAvecDecimaux extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.versionQcmDisponible = true
    this.spacingCorr = 2
    this.optionsChampTexte = { texteAvant: '<br>' }
  }

  nouvelleVersion() {
    let a: number
    let b: number
    if (context.isAmc) this.versionQcm = false
    switch (
      this.quotaChoice('typeDeQuestions', ['a', 'b', 'c', 'd', 'e']) //
    ) {
      case 'a':
        a = randint(3, 9, 5) / 10
        b = randint(2, 9)
        this.question = this.versionQcm
          ? ` $\\dfrac{${texNombre(a * b)}}{${texNombre(a)}}$ est égal à :`
          : `Calculer sous forme décimale $\\dfrac{${texNombre(a * b)}}{${texNombre(a)}}$.`
        this.correction = `
        On multiplie par $10$ le numérateur et le dénominateur pour avoir des nombres entiers.<br>
        $\\dfrac{${texNombre(a * b)}}{${texNombre(a)}}=\\dfrac{${texNombre(a * b)}\\times 10}{${texNombre(a)}\\times 10}=\\dfrac{${texNombre(a * b * 10)}}{${texNombre(a * 10)}}=${miseEnEvidence(texNombre((a * b) / a))}$
         `

        this.reponse = b

        if (this.versionQcm) {
          this.distracteurs = [
            `$${texNombre((a * b * 10) / a, 3)}$`,
            `$${texNombre((a * b) / (a * 10), 3)}$`,
            `$${texNombre((a * b) / (a * 100), 3)}$`,
          ]
        }

        break
      case 'b':
        a = randint(3, 9) / 100
        b = randint(2, 9)
        this.question = this.versionQcm
          ? ` $\\dfrac{${texNombre(a * b)}}{${texNombre(a)}}$ est égal à :`
          : `Calculer sous forme décimale $\\dfrac{${texNombre(a * b)}}{${texNombre(a)}}$.`

        this.correction = `
        On multiplie par $100$ le numérateur et le dénominateur pour avoir des nombres entiers.<br>
        $\\dfrac{${texNombre(a * b)}}{${texNombre(a)}}
        =\\dfrac{${texNombre(a * b)}\\times 100}{${texNombre(a)}\\times 100}
        =\\dfrac{${texNombre(a * b * 100)}}{${texNombre(a * 100)}}
        =${miseEnEvidence(texNombre((a * b) / a))}$ `
        this.reponse = b
        if (this.versionQcm) {
          this.distracteurs = [
            `$${texNombre((a * b * 10) / a, 3)}$`,
            `$${texNombre((a * b) / (a * 10), 3)}$`,
            `$${texNombre((a * b) / (a * 100), 3)}$`,
          ]
        }
        break

      case 'c':
        a = randint(3, 9) / 100
        b = randint(2, 9)

        this.question = this.versionQcm
          ? ` $\\dfrac{${texNombre(a * b)}}{${texNombre(a * 10)}}$ est égal à :`
          : `Calculer sous forme décimale  $\\dfrac{${texNombre(a * b)}}{${texNombre(a * 10)}}$.`
        this.correction = `
        $\\bullet$ On multiplie par $100$ le numérateur et le dénominateur pour avoir des nombres entiers :<br>
        $\\dfrac{${texNombre(a * b)}}{${texNombre(a * 10)}}=\\dfrac{${texNombre(a * b)}\\times 100}{${texNombre(a * 10)}\\times 100}
        =\\dfrac{${texNombre(a * b * 100)}}{${texNombre(a * 1000)}}$<br>
        $\\bullet$ On décompose $\\dfrac{${texNombre(a * b * 100)}}{${texNombre(a * 1000)}}$ en un produit plus simple à calculer :<br>
        $\\dfrac{1}{10}\\times\\dfrac{${texNombre(a * b * 100)}}{${texNombre(a * 100)}}=
        0,1\\times${texNombre((a * b * 100) / (a * 100))}=
        ${miseEnEvidence(texNombre((a * b) / (10 * a)))}$  `
        this.reponse = b / 10
        if (this.versionQcm) {
          this.distracteurs = [
            `$${texNombre(b, 3)}$`,
            `$${texNombre(b / 100, 3)}$`,
            `$${texNombre(b * 10, 3)}$`,
          ]
        }
        break
      case 'd':
        a = randint(3, 9) / 10
        b = choice([1, 3, 7, 9])

        this.question = this.versionQcm
          ? ` $\\dfrac{${texNombre(a * b)}}{${texNombre(a * 10)}}$ est égal à :`
          : `Calculer sous forme décimale  $\\dfrac{${texNombre(a * b)}}{${texNombre(a * 10)}}$.`

        this.correction = `
        $\\bullet$ On multiplie par $10$ le numérateur et le dénominateur pour avoir des nombres entiers.<br>
        $\\dfrac{${texNombre(a * b)}}{${texNombre(a * 10)}}=\\dfrac{${texNombre(a * b)}\\times 10}{${texNombre(a * 10)}\\times 10}=\\dfrac{${texNombre(a * b * 10)}}{${texNombre(a * 100)}}$
        <br>$\\bullet$ On décompose $\\dfrac{${texNombre(a * b * 10)}}{${texNombre(a * 100)}}$ en un produit plus simple à calculer :<br>
        $\\dfrac{1}{10}\\times\\dfrac{${texNombre(a * b * 10)}}{${texNombre(a * 10)}}=
        0,1\\times${texNombre((a * b * 10) / (a * 10))}=
        ${miseEnEvidence(texNombre((a * b) / (10 * a)))}$ `
        this.reponse = b / 10
        if (this.versionQcm) {
          this.distracteurs = [
            `$${texNombre(b, 3)}$`,
            `$${texNombre(b / 100, 3)}$`,
            `$${texNombre(b * 10, 3)}$`,
          ]
        }
        break
      case 'e':
        b = choice([2, 3, 4, 6, 7, 8, 9]) * 10 // 20, 30, 40, 60, 70, 80, 90
        a = randint(2, 9) / 10

        this.question = this.versionQcm
          ? ` $\\dfrac{${texNombre(a * b)}}{${texNombre(a)}}$ est égal à :`
          : `Calculer sous forme décimale $\\dfrac{${texNombre(a * b)}}{${texNombre(a)}}$.`

        this.correction = `
  On multiplie par $10$ le numérateur et le dénominateur pour avoir des nombres entiers.<br>
  $\\dfrac{${texNombre(a * b)}}{${texNombre(a)}}=\\dfrac{${texNombre(a * b)}\\times 10}{${texNombre(a)}\\times 10}=\\dfrac{${texNombre(a * b * 10)}}{${texNombre(a * 10)}}=${miseEnEvidence(texNombre((a * b) / a))}$
   `

        this.reponse = b

        if (this.versionQcm) {
          this.distracteurs = [
            `$${texNombre(b / 10, 3)}$`,
            `$${texNombre(b * 10, 3)}$`,
            `$${texNombre(b / 100, 3)}$`,
          ]
        }
        break
    }
  }
}
