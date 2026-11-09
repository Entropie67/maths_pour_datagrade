import { orangeMathalea } from '../../../lib/colors'
import { texPrix } from '../../../lib/format/style'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
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
export const uuid = 'c3a01'

export const refs = {
  'fr-fr': ['can5P1-03', '5P1C-flash2'],
  'fr-ch': ['9R1FA1D-6', '9R2FA1D-6', '9R3FA1D-6'],
}
export default class Proportionnalite3 extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
  }

  nouvelleVersion() {
    let prix1, prix2, fruits, fruits2, poids1, poids2, frac, choix
    const listefruits1 = [
      ['poires'],
      ['melons'],
      ['tomates'],
      ['pommes'],
      ['framboises'],
      ['fraises'],
      ['citrons'],
      ['bananes'],
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
        choix = choice(['a', 'b'])
        if (choix === 'a') {
          prix1 = randint(7, 14, 10) // prix de 5 kg
          prix2 = prix1 - randint(1, 3) // prix pour masse cherchée
          fruits = choice(listefruits1)
          frac = new FractionEtendue(5 * prix2, prix1)
          this.question = `$5$ kg de ${fruits[0]} coûtent $${texPrix(prix1)}$ €.<br>

        Quelle masse de ${fruits[0]} faut-il acheter pour payer $${texPrix(prix2)}$ € ?<br>
        
        Donner la valeur exacte de cette masse.`
          if (this.interactif) {
            this.optionsChampTexte = { texteApres: ' kg' }
          }
          this.correction = `La masse que l'on peut acheter avec $1$ € est $\\dfrac{5}{${prix1}}$ kg. <br>
        Ainsi, pour payer $${texPrix(prix2)}$ €, il faut acheter $\\dfrac{5\\times ${prix2}}{${prix1}}=${miseEnEvidence(`\\dfrac{ ${5 * prix2}}{${prix1}}`)}${frac.texSimplificationAvecEtapes(true, orangeMathalea)}$ kg.
       
        `
        } else {
          prix1 = randint(5, 14, [6, 9, 12]) // prix de 3 kg
          prix2 = prix1 - randint(1, 3) // prix pour masse cherchée
          fruits = choice(listefruits1)
          frac = new FractionEtendue(3 * prix2, prix1)
          this.question = `$3$ kg de ${fruits[0]} coûtent $${texPrix(prix1)}$ €.<br>
        Quelle masse de ${fruits[0]} faut-il acheter pour payer $${texPrix(prix2)}$ € ?<br>
        Donner la valeur exacte de cette masse.`
          if (this.interactif) {
            this.optionsChampTexte = { texteAvant: '<br>', texteApres: 'kg' }
          }
          this.correction = `La masse que l'on peut acheter avec $1$ € est $\\dfrac{3}{${prix1}}$ kg. <br>
        Ainsi, pour payer $${texPrix(prix2)}$ €, il faut acheter $\\dfrac{3\\times ${prix2}}{${prix1}}=${miseEnEvidence(`\\dfrac{ ${3 * prix2}}{${prix1}}`)}${frac.texSimplificationAvecEtapes(true, orangeMathalea)}$ kg.
       
        `
        }
        this.reponse = frac

        this.canReponseACompleter = '$\\ldots$ kg'
        break
      case 2: // proportionnalité avec nombre de pastèques / melons
        choix = choice(['a', 'b', 'c']) //, 'b', 'c'
        if (choix === 'a') {
          poids1 = randint(5, 14, [6, 9, 12]) // masse de 3 fruits
          poids2 = poids1 - randint(1, 2) // 2ième masse
          fruits2 = choice(listefruits2)
          frac = new FractionEtendue(3 * poids2, poids1)
          this.question = `$3$ ${fruits2[0]} (identiques) ont une masse $${poids1}$ kg.<br>

      Combien faut-il acheter de ces mêmes ${fruits2[0]} pour totaliser une masse de $${poids2}$ kg ? <br>

      Donner la valeur exacte de ce nombre.`
          if (this.interactif) {
            this.optionsChampTexte = {
              texteAvant: '<br>',
              texteApres: ` de ${fruits2[0]}.`,
            }
          }
          this.correction = `La quantité de ${fruits2[0]} par kg est $\\dfrac{3}{${poids1}}$ de ${fruits2[1]}. <br>
      Ainsi, pour obtenir une masse de $${texPrix(poids2)}$ kg, il faut acheter $\\dfrac{3\\times ${poids2}}{${poids1}}=${miseEnEvidence(`\\dfrac{ ${3 * poids2}}{${poids1}}`)}${frac.texSimplificationAvecEtapes(true, orangeMathalea)}$ de ${fruits2[0]}.
      `
        } else if (choix === 'b') {
          poids1 = randint(3, 7) // masse de 2 fruits
          poids2 = poids1 - 1 // 2ième masse
          fruits2 = choice(listefruits2)
          frac = new FractionEtendue(2 * poids2, poids1)
          this.question = `$2$ ${fruits2[0]} (identiques) ont une masse de $${poids1}$ kg.<br>
        Combien faut-il acheter de ces mêmes ${fruits2[0]} pour totaliser une masse de $${poids2}$ kg ? <br>
        Donner la valeur exacte de ce nombre.`
          if (this.interactif) {
            this.optionsChampTexte = {
              texteAvant: '<br>',
              texteApres: ` de ${fruits2[0]}.`,
            }
          }
          this.correction = `La quantité de ${fruits2[0]} par kg est $\\dfrac{2}{${poids1}}$ de ${fruits2[1]}. <br>
        Ainsi, pour obtenir une masse de $${texPrix(poids2)}$ kg, il faut acheter $\\dfrac{2\\times ${poids2}}{${poids1}}=${miseEnEvidence(`\\dfrac{ ${2 * poids2}}{${poids1}}`)}${frac.texSimplificationAvecEtapes(true, orangeMathalea)}$ de ${fruits2[0]}.
        `
        } else {
          poids1 = randint(9, 14, 10) // masse de 5 fruit
          poids2 = poids1 - randint(1, 4) // 2ième masse
          fruits2 = choice(listefruits2)
          frac = new FractionEtendue(5 * poids2, poids1)
          this.question = `$5$ ${fruits2[0]} (identiques) ont une masse de $${poids1}$ kg.<br>
            Combien faut-il acheter de ces mêmes ${fruits2[0]} pour totaliser une masse de $${poids2}$ kg ? <br>
            Donner la valeur exacte de ce nombre.`
          if (this.interactif) {
            this.optionsChampTexte = {
              texteAvant: '<br>',
              texteApres: ` de ${fruits2[0]}.`,
            }
          }
          this.correction = `La quantité de ${fruits2[0]} par kg est $\\dfrac{5}{${poids1}}$ de ${fruits2[1]}. <br>
            Ainsi, pour obtenir une masse de $${texPrix(poids2)}$ kg, il faut acheter $\\dfrac{5\\times ${poids2}}{${poids1}}=${miseEnEvidence(`\\dfrac{ ${5 * poids2}}{${poids1}}`)}${frac.texSimplificationAvecEtapes(true, orangeMathalea)}$ de ${fruits2[0]}.
            `
        }
        this.reponse = frac

        this.canReponseACompleter = `$\\ldots$ de ${fruits2[0]}`
        break
    }
  }
}
