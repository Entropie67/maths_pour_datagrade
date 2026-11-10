import { choice } from '../../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
  rienSi1,
} from '../../../lib/outils/ecritures'
import ExerciceSimple from '../../ExerciceSimple'

import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
export const titre = "Exprimer une variable en fonction d'une autre"
export const interactifReady = true

export const dateDePublication = '12/01/2023'
export const dateDeModifImportante = '08/06/2024'
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora (distracteurs avec ia)
 */

export const uuid = 'b5c9c'

export const refs = {
  'fr-fr': ['can2L12-01', '2L14-flash3'],
  'fr-ch': ['NR'],
}
export default class ExprimerVariable extends ExerciceSimple {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.typeExercice = 'simple'
    this.versionQcmDisponible = true
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    {
      const a = this.quotaRandint('a', -9, 9, [0, 1, -1])
      // On impose |b| >= 2 (comme pour a) : si b vaut ±1, isoler la variable de
      // coefficient b ne demande aucune division et la bonne réponse s'écrit
      // alors \dfrac{...}{1}, ce qui la rend identique au distracteur « oubli de
      // diviser par le coefficient » dans la version QCM.
      let b = a * choice([-1, 1]) + choice([-1, 1])
      while (Math.abs(b) < 2) {
        b = a * choice([-1, 1]) + choice([-1, 1])
      }
      const c = this.quotaRandint('c', 1, 10)
      const var1 = choice(['x', 'z', 'a'])
      const var2 = choice(['b', 'c', 'y'])
      const corr1 = `De la relation $${rienSi1(a)}${var1}${ecritureAlgebriqueSauf1(b)}${var2}=${c}$, on déduit en ajoutant $${rienSi1(-b)}${var2}$ dans chaque membre :
          $${rienSi1(a)}${var1}=${c}${ecritureAlgebrique(-b)}${var2}$.`
      const corr2 = ` Puis, en divisant par $${a}$, on obtient : $${var1}=\\dfrac{${c}${ecritureAlgebriqueSauf1(-b)}${var2}}{${a}}$`
      const corr3 = `De la relation $${rienSi1(a)}${var1}${ecritureAlgebriqueSauf1(b)}${var2}=${c}$, on déduit en ajoutant $${rienSi1(-a)}${var1}$ dans chaque membre :
          $${rienSi1(b)}${var2}=${c}${ecritureAlgebriqueSauf1(-a)}${var1}$.`
      const corr4 = ` Puis, en divisant par $${b}$, on obtient : $${var2}=\\dfrac{${c}${ecritureAlgebriqueSauf1(-a)}${var1}}{${b}}$`

      if (this.quotaChoice('ordre', [true, false])) {
        this.question = ` On donne la relation  : $${rienSi1(a)}${var1}${ecritureAlgebriqueSauf1(b)}${var2}=${c}$.<br>
      ${this.versionQcm ? `On cherche à isoler $${var1}$. On a : ` : `Exprimer $${var1}$ en fonction de $${var2}$. ${this.interactif ? `<br>$${var1}=$` : ''}`}  `
        if (a === 1) {
          this.correction = `${corr1}`
        } else if (a > 0) {
          this.correction = `${corr1}<br>`
          this.correction += `${corr2}`
        } else {
          this.correction = `${corr1}<br>`
          this.correction += `${corr2}<br>`
          this.correction += ` que l'on peut écrire également : $${var1}=`
          this.correction +=
            a === -1
              ? `${-c}${ecritureAlgebriqueSauf1(b)}${var2}$.`
              : `\\dfrac{${-c}${ecritureAlgebriqueSauf1(b)}${var2}}{${-a}}$`
        }
        // 08/06/2024 : customCanonical empêche actuellement d'accepter (3x+5)/6 pour (-3x-5)/(-6). Qd ce sera fait, on enlevera un des deux cas ci-dessous (qui seront équivalents).
        if (this.versionQcm) {
          this.reponse =
            a < 0
              ? `$${var1}=\\dfrac{${reduireAxPlusB(b, -c, var2)}}{${-a}}$`
              : `$${var1}=\\dfrac{${reduireAxPlusB(-b, c, var2)}}{${a}}$`
        } else {
          this.reponse = [
            `\\dfrac{${reduireAxPlusB(b, -c, var2)}}{${-a}}`,
            `\\dfrac{${reduireAxPlusB(-b, c, var2)}}{${a}}`,
          ]
        }
        this.distracteurs = [
          // Erreur : oubli de diviser par le coefficient
          a < 0
            ? `$${var1}=${reduireAxPlusB(b, -c, var2)}$`
            : `$${var1}=${reduireAxPlusB(-b, c, var2)}$`,

          // Erreur de signe dans le numérateur
          a < 0
            ? `$${var1}=\\dfrac{${reduireAxPlusB(-b, c, var2)}}{${-a}}$`
            : `$${var1}=\\dfrac{${reduireAxPlusB(b, -c, var2)}}{${a}}$`,

          // Erreur : inversion complète (comme si on isolait var2)
          a < 0
            ? `$${var1}=-\\dfrac{${c}}{${-a}}${ecritureAlgebriqueSauf1(-b)}${var2}$`
            : `$${var1}=\\dfrac{${c}}{${a}}${ecritureAlgebriqueSauf1(-b)}${var2}$`,
        ]
      } else {
        this.question = ` On donne la relation  : $${rienSi1(a)}${var1}${ecritureAlgebriqueSauf1(b)}${var2}=${c}$.<br>
        
         ${this.versionQcm ? `On cherche à isoler $${var2}$. On a : ` : ` Exprimer $${var2}$ en fonction de $${var1}$.${this.interactif ? `<br>$${var2}=$` : ''}`}  `

        if (b === 1) {
          this.correction = `${corr3}`
        } else if (b > 0) {
          this.correction = `${corr3}<br>`
          this.correction += `${corr4}`
        } else {
          this.correction = `${corr3}<br>`
          this.correction += `${corr4}`
          this.correction += ` que l'on peut écrire également : $${var2}=`
          this.correction +=
            a === -1
              ? `${-c}${ecritureAlgebriqueSauf1(a)}${var1}$.`
              : `\\dfrac{${-c}${ecritureAlgebriqueSauf1(a)}${var1}}{${-b}}$`
        }
        // 08/06/2024 : customCanonical empêche actuellement d'accepter (3x+5)/6 pour (-3x-5)/(-6). Qd ce sera fait, on enlevera un des deux cas ci-dessous (qui seront équivalents).
        if (this.versionQcm) {
          this.reponse =
            b < 0
              ? `$${var2}=\\dfrac{${reduireAxPlusB(a, -c, var1)}}{${-b}}$`
              : `$${var2}=\\dfrac{${reduireAxPlusB(-a, c, var1)}}{${b}}$`
        } else {
          this.reponse = [
            `\\dfrac{${reduireAxPlusB(a, -c, var1)}}{${-b}}`,
            `\\dfrac{${reduireAxPlusB(-a, c, var1)}}{${b}}`,
          ]
        }
        this.distracteurs = [
          // Erreur : oubli de diviser par le coefficient
          b < 0
            ? `$${var2}=${reduireAxPlusB(a, -c, var1)}$`
            : `$${var2}=${reduireAxPlusB(-a, c, var1)}$`,

          // Erreur de signe dans le numérateur
          b < 0
            ? `$${var2}=\\dfrac{${reduireAxPlusB(-a, c, var1)}}{${-b}}$`
            : `$${var2}=\\dfrac{${reduireAxPlusB(a, -c, var1)}}{${b}}$`,

          // Erreur : inversion complète (comme si on isolait var2)
          a < 0
            ? `$${var2}=-\\dfrac{${c}}{${-a}}${ecritureAlgebriqueSauf1(-b)}${var1}$`
            : `$${var2}=\\dfrac{${c}}{${a}}${ecritureAlgebriqueSauf1(-b)}${var1}$`,
        ]
      }
    }
    // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
    const textCorrSplit = this.correction.split(':')
    let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
    aRemplacer = aRemplacer.replaceAll('$', '')

    this.correction = ''
    for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
      this.correction += textCorrSplit[ee] + ':'
    }
    // Hors QCM, « X = » reste hors de la mise en évidence : seule l'expression saisie est en orange
    const [membreGauche, ...membreDroit] = aRemplacer.split('=')
    this.correction +=
      membreDroit.length > 0 && !this.versionQcm
        ? ` $${membreGauche}=${miseEnEvidence(membreDroit.join('=').trim())}$`
        : ` $${miseEnEvidence(aRemplacer)}$`
    // Fin de cette uniformisation
    this.correction += '.'

    this.canEnonce = this.question // 'Compléter'
    this.canReponseACompleter = ''
  }
}
