import { orangeMathalea } from '../../../lib/colors'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Résoudre un problème de proportionnalité'
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '19/07/2022'

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

 * Date de publication
*/
export const uuid = 'afbda'

export const refs = {
  'fr-fr': ['can5P1-02', '5P1C-flash1'],
  'fr-ch': ['9R1FA1D-5', '9R2FA1D-5', '9R3FA1D-5'],
}
export default class Proportionnalite2 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    let a, b, fruits, fruits2, poids1, frac, choix
    const listefruits1 = [
      ['abricot'],
      ['melon'],
      ['tomate'],
      ['pomme'],
      ['fraise'],
      ['citron'],
      ['banane'],
    ]
    const listefruits2 = [
      ['pastèques', 'pastèque'],
      ['melons', 'melon'],
      ['potimarrons', 'potimarron'],
      ['citrouilles', 'citrouille'],
    ]
    switch (
      this.quotaChoice('typeDeQuestions', [1, 2]) //
    ) {
      case 1: // proportionnalité avec fruits
        choix = choice(['a', 'b', 'c'])
        if (choix === 'a') {
          a = randint(4, 7) // kg pour 9 €
          b = a - 1
          fruits = choice(listefruits1)
          frac = new FractionEtendue(9 * b, a)
          if (choice([true, false])) {
            this.question = `On paie  $9$ € pour $${a}$ kg de ${fruits[0]}s.<br>
       Quel est le prix de $${b}$ kg de ${fruits[0]}s ?<br>
        Donner la valeur exacte de ce prix.`
          } else {
            this.question = ` $${a}$ kg de ${fruits[0]}s coûtent $9$ €.<br>
        Quel est le prix de $${b}$ kg de ${fruits[0]}s ?<br>
         Donner la valeur exacte de ce prix.`
          }
          if (this.interactif) {
            this.optionsChampTexte = { texteApres: ' €' }
          }
          this.correction = `Un kg de ${fruits[0]} coûte $\\dfrac{9}{${a}}$ €.<br>
          On en déduit que $${b}$ kg de ${fruits[0]}s coûtent $\\dfrac{9\\times${b}}{${a}}=${frac.estIrreductible ? miseEnEvidence(`\\dfrac{${9 * b}}{${a}}`) : `\\dfrac{${9 * b}}{${a}}${frac.texSimplificationAvecEtapes(false, orangeMathalea)}`}$ €.
       
        `
        } else if (choix === 'b') {
          a = randint(3, 5) // kg pour 7 €
          b = a - 1
          fruits = choice(listefruits1)
          frac = new FractionEtendue(7 * b, a)
          if (choice([true, false])) {
            this.question = `On paie  $7$ € pour $${a}$ kg de ${fruits[0]}s.<br>

          Quel est le prix de $${b}$ kg de ${fruits[0]}s ?<br>

           Donner la valeur exacte de ce prix.`
          } else {
            this.question = ` $${a}$ kg de ${fruits[0]}s coûtent $7$ €.<br>

           Quel est le prix de $${b}$ kg de ${fruits[0]}s ?<br>

            Donner la valeur exacte de ce prix.`
          }
          if (this.interactif) {
            this.optionsChampTexte = { texteApres: ' €' }
          }
          this.correction = `Un kg de ${fruits[0]} coûte $\\dfrac{7}{${a}}$ €.<br>
             On en déduit que $${b}$ kg de ${fruits[0]}s coûtent $\\dfrac{7\\times${b}}{${a}}=${frac.estIrreductible ? miseEnEvidence(`\\dfrac{${7 * b}}{${a}}`) : `\\dfrac{${7 * b}}{${a}}${frac.texSimplificationAvecEtapes(false, orangeMathalea)}`}$ €.
          
           `
        } else {
          // choix === 'c'
          a = randint(5, 8) // kg pour 11 €
          b = a - randint(1, 2)
          fruits = choice(listefruits1)
          frac = new FractionEtendue(11 * b, a)
          if (choice([true, false])) {
            this.question = `On paie  $11$ € pour $${a}$ kg de ${fruits[0]}s.<br>

          Quel est le prix de $${b}$ kg de ${fruits[0]}s ?<br>

           Donner la valeur exacte de ce prix.`
          } else {
            this.question = ` $${a}$ kg de ${fruits[0]}s coûtent $11$ €.<br>

           Quel est le prix de $${b}$ kg de ${fruits[0]}s ?<br>

            Donner la valeur exacte de ce prix.`
          }
          if (this.interactif) {
            this.optionsChampTexte = { texteApres: ' €' }
          }
          this.correction = `Un kg de ${fruits[0]} coûte $\\dfrac{11}{${a}}$ €.<br>
             On en déduit que $${b}$ kg de ${fruits[0]}s coûtent $\\dfrac{11\\times${b}}{${a}}=${frac.estIrreductible ? miseEnEvidence(`\\dfrac{${11 * b}}{${a}}`) : `\\dfrac{${11 * b}}{${a}}${frac.texSimplificationAvecEtapes(false, orangeMathalea)}`}$ €.
          
           `
        }

        this.canReponseACompleter = '$\\ldots$ €'
        break
      case 2: // proportionnalité avec nombre de pastèques / melons
        choix = choice(['a', 'b']) //, 'b', 'c'
        if (choix === 'a') {
          poids1 = randint(5, 10, [6, 9]) // masse de 3 fruits
          a = randint(4, 10) // 2ième nombre de fruits
          fruits2 = choice(listefruits2)
          frac = new FractionEtendue(a * poids1, 3)
          this.question = `$3$ ${fruits2[0]} (identiques) ont une masse $${poids1}$ kg.<br>

      Quelle est la masse de  $${a}$  de ces mêmes ${fruits2[0]} ? <br>

      Donner la valeur exacte de ce nombre.`
          if (this.interactif) {
            this.optionsChampTexte = { texteApres: '  kg' }
          }
          this.correction = `La masse de $1$ ${fruits2[1]} est : $\\dfrac{${poids1}}{3}$ kg.<br>
          On en déduit que $${a}$ ${fruits2[0]} ont une masse de $\\dfrac{${a}\\times${poids1}}{3}=${frac.estIrreductible ? miseEnEvidence(`\\dfrac{${a * poids1}}{3}`) : `\\dfrac{${a * poids1}}{3}${frac.texSimplificationAvecEtapes(false, orangeMathalea)}`}$ kg.
      `
        }
        if (choix === 'b') {
          poids1 = randint(5, 11, [6, 8, 10]) // masse de 4 fruits
          a = randint(5, 11, 8) // 2ième nombre de fruits
          fruits2 = choice(listefruits2)
          frac = new FractionEtendue(a * poids1, 4)
          this.question = `$4$ ${fruits2[0]} (identiques) ont une masse $${poids1}$ kg.<br>

    Quelle est la masse de  $${a}$  de ces mêmes ${fruits2[0]} ? <br>
    
    Donner la valeur exacte de ce nombre.`
          if (this.interactif) {
            this.optionsChampTexte = { texteApres: '  kg' }
          }
          this.correction = `La masse de $1$ ${fruits2[1]} est : $\\dfrac{${poids1}}{4}$ kg.<br>
        On en déduit que $${a}$ ${fruits2[0]} ont une masse de $\\dfrac{${a}\\times${poids1}}{4}=${frac.estIrreductible ? miseEnEvidence(`\\dfrac{${a * poids1}}{4}`) : `\\dfrac{${a * poids1}}{4}${frac.texSimplificationAvecEtapes(false, orangeMathalea)}`}$ kg.
    `
        }

        this.canReponseACompleter = '$\\ldots$ kg'
        break
    }
    this.reponse = frac
  }
}
