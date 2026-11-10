import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureParentheseSiNegatif } from '../../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../../lib/outils/embellissements'
import { lettreMinusculeDepuisChiffre } from '../../../lib/outils/outilString'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Calculer la norme d’un vecteur'
export const interactifReady = true

export const dateDePublication = '6/12/2021'
export const dateDeModifImportante = '18/05/2025'

/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Florence Tapiero

 * Date de publication décembre 2021
*/
export const uuid = '3a0e1'

export const refs = {
  'fr-fr': ['can2G21-02', '2G25-flash4'],
  'fr-ch': ['3G94-1'],
}
export default class NormeVecteur extends ExerciceSimple {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierFullOperations
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierFullOperations
  }

  nouvelleVersion() {
    let a, b, nom
    switch (choice(['a'])) {
      case 'a':
        a = this.quotaRandint('a', -9, 9)
        b = randint(-6, 6, a)
        nom = lettreMinusculeDepuisChiffre(randint(11, 26, [15, 24, 25]))
        if (
          a ** 2 + b ** 2 === 1 ||
          a ** 2 + b ** 2 === 4 ||
          a ** 2 + b ** 2 === 9 ||
          a ** 2 + b ** 2 === 16 ||
          a ** 2 + b ** 2 === 25 ||
          a ** 2 + b ** 2 === 36 ||
          a ** 2 + b ** 2 === 49 ||
          a ** 2 + b ** 2 === 64 ||
          a ** 2 + b ** 2 === 81 ||
          a ** 2 + b ** 2 === 100
        ) {
          this.question = `Dans un repère orthonormé du plan, on donne $\\overrightarrow{${nom}}(${a};${b})$.<br>

        Déterminer la norme du vecteur $\\overrightarrow{${nom}}$.<br>
        
        Donner le résultat sous la forme $\\sqrt{a}$ ou d'un nombre entier le cas échéant.`
          this.optionsChampTexte = { texteAvant: '<br>' }
          this.correction = `D'après le cours, si $\\overrightarrow{u}(x;y)$ alors $\\| \\overrightarrow{u} \\|=\\sqrt{x^2+y^2}$. On a donc : <br><br>
          $ \\| \\overrightarrow{${nom}} \\|=
          \\sqrt{${ecritureParentheseSiNegatif(a)}^2+${ecritureParentheseSiNegatif(b)}^2}=
          \\sqrt{${a ** 2}+ ${b ** 2}}=
          \\sqrt{${a ** 2 + b ** 2}}=
          ${miseEnEvidence(`${Math.sqrt(a ** 2 + b ** 2)}`)}$.<br><br>`
          this.correction += texteEnCouleur(
            `Comme $${a ** 2 + b ** 2}$ est un carré parfait, on simplifie la racine carrée.`,
            bleuMathalea,
          )
          this.reponse = Math.sqrt(a ** 2 + b ** 2)
        } else {
          this.question = `Dans un repère orthonormé du plan, on donne $\\overrightarrow{${nom}}(${a};${b})$.<br>
          Déterminer la norme du vecteur $\\overrightarrow{${nom}}$.<br>
          (donner le résultat sous la forme $\\sqrt{a}$ ou d'un nombre entier le cas échéant)`
          this.optionsChampTexte = { texteAvant: '<br>' }
          this.correction = `D'après le cours, si $\\overrightarrow{u}(x;y)$ alors $\\| \\overrightarrow{u} \\|=\\sqrt{x^2+y^2}$.<br><br>
          On a donc ici :<br><br>
          $\\| \\overrightarrow{${nom}} \\| =
          \\sqrt{${ecritureParentheseSiNegatif(a)}^2+${ecritureParentheseSiNegatif(b)}^2}=
          \\sqrt{${a ** 2} + ${b ** 2}}=
          ${miseEnEvidence(`\\sqrt{${a ** 2 + b ** 2}}`)}$<br><br>`
          this.correction += texteEnCouleur(
            `Comme $${a ** 2 + b ** 2}$ n'est pas un carré parfait, on ne simplifie pas (la réponse doit être sous la forme $\\sqrt{a}$ ou d'un entier).<br>`,
            bleuMathalea,
          )
          this.reponse = [
            `\\sqrt{${a ** 2 + b ** 2}}`,
            `${Math.sqrt(a ** 2 + b ** 2)}`,
          ]
        }
        break
    }
  }
}
