import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { miseEnEvidence, texteGras } from '../../../lib/outils/embellissements'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'

import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { reduireAxPlusB, rienSi1 } from '../../../lib/outils/ecritures'
export const titre = 'Factoriser avec une identité remarquable'
export const interactifReady = true

export const dateDePublication = '04/04/2024'
export const uuid = 'a1cb3'
export const refs = {
  'fr-fr': ['can2L11-06', '2L12-flash2'],
  'fr-ch': ['1mCL2-3'],
}
/**
 * Modèle d'exercice très simple pour la course aux nombres
 * @author Gilles Mora

*/
export default class FatorisationEgR extends ExerciceSimple {
  // Précise dans la consigne la forme attendue (produit de deux facteurs du premier degré)
  consigneProduit = false

  constructor() {
    super()
    this.canOfficielle = false
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.versionQcmDisponible = true
    this.versionQcm = false
    this.optionsDeComparaison = { factorisation: true }
  }

  nouvelleVersion() {
    this.optionsDeComparaison = this.consigneProduit
      ? { facteursPremierDegre: true }
      : { factorisation: true }
    let expression = ''
    switch (this.quotaChoice('type', [1, 2, 3])) {
      case 1: // (ax+b)^2
        {
          const a = randint(1, 2)
          const b = randint(1, 6)
          const choix = choice([true, false])
          this.reponse = `(${reduireAxPlusB(a, b)})^2`
          if (this.versionQcm) this.reponse = '$' + this.reponse + '$'
          const fausseFactorisation = `$x(${reduireAxPlusB(a ** 2, 2 * a * b)})+${b ** 2}$`
          let tableau = [
            `$(${reduireAxPlusB(a, -b)})^2$`,
            `$(${reduireAxPlusB(a, b)})(${reduireAxPlusB(a, -b)})$`,
            fausseFactorisation,
            `$(${reduireAxPlusB(a, b / 2)})^2$`,
          ]
          tableau = shuffle(tableau)
          this.distracteurs = [tableau[0], tableau[1], tableau[2]]
          expression = choix
            ? `${rienSi1(a ** 2)}x^2+${reduireAxPlusB(2 * a * b, b ** 2)}`
            : `${reduireAxPlusB(2 * a * b, b ** 2)}+${rienSi1(a ** 2)}x^2`
          if (this.versionQcm) {
            this.question = `Une factorisation de $${expression}$ est :`
          } else {
            this.question = `Factoriser $${expression}$${this.consigneProduit ? " sous la forme d'un produit (ou d'un carré) de deux facteurs" : ''}.`
          }
          this.correction = `On reconnaît le développement de l'identité remarquable : <br>
          $(a+b)^2=a^2+2ab+b^2$ avec $a=${rienSi1(a)}x$ et $b=${b}$.<br>
          On a donc :
    
      ${
        choix
          ? `$${rienSi1(a ** 2)}x^2+${reduireAxPlusB(2 * a * b, b ** 2)}=${miseEnEvidence(`(${reduireAxPlusB(a, b)})^2`)}$`
          : `$${reduireAxPlusB(2 * a * b, b ** 2)}+${rienSi1(a ** 2)}x^2=${miseEnEvidence(`(${reduireAxPlusB(a, b)})^2`)}$`
      }`
          if (
            this.versionQcm &&
            this.distracteurs.includes(fausseFactorisation)
          ) {
            this.correction += `<br><br>${texteGras('Remarque :')} la proposition ${fausseFactorisation} redonne bien $${rienSi1(a ** 2)}x^2+${reduireAxPlusB(2 * a * b, b ** 2)}$ après développement, mais ce n'est pas une expression factorisée (c'est une somme et non un produit).<br>`
          }
        }
        break
      case 2: // (a-b)^2
        {
          const a = randint(1, 2)
          const b = randint(1, 6)
          const choix = choice([true, false])
          const reponses = [
            `(${reduireAxPlusB(a, -b)})^2`,
            `(${reduireAxPlusB(-a, b)})^2`,
          ]
          if (this.versionQcm) {
            this.reponse = '$' + choice(reponses) + '$'
          } else {
            this.reponse = reponses
          }
          const fausseFactorisation = `$x(${reduireAxPlusB(a ** 2, -2 * a * b)})+${b ** 2}$`
          let tableau = [
            `$(${reduireAxPlusB(a, b)})^2$`,
            `$(${reduireAxPlusB(a, b)})(${reduireAxPlusB(a, -b)})$`,
            fausseFactorisation,
            `$(${reduireAxPlusB(a, -b / 2)})^2$`,
          ]
          tableau = shuffle(tableau)
          this.distracteurs = [tableau[0], tableau[1], tableau[2]]
          expression = choix
            ? `${rienSi1(a ** 2)}x^2-${reduireAxPlusB(2 * a * b, b ** 2)}`
            : `${reduireAxPlusB(-2 * a * b, b ** 2)}+${rienSi1(a ** 2)}x^2`
          if (this.versionQcm) {
            this.question = `Une factorisation de $${expression}$ est :`
          } else {
            this.question = `Factoriser $${expression}$${this.consigneProduit ? " sous la forme d'un produit (ou d'un carré) de deux facteurs" : ''}.`
          }
          this.correction = `On reconnaît le développement de l'identité remarquable : <br>
        $(a-b)^2=a^2-2ab+b^2$ avec $a=${rienSi1(a)}x$ et $b=${b}$.<br>
        On a donc :
   
    ${
      choix
        ? `$${rienSi1(a ** 2)}x^2${reduireAxPlusB(-2 * a * b, b ** 2)}=${miseEnEvidence(`(${reduireAxPlusB(a, -b)})^2`)}$`
        : `$${reduireAxPlusB(-2 * a * b, b ** 2)}+${rienSi1(a ** 2)}x^2=${miseEnEvidence(`(${reduireAxPlusB(a, -b)})^2`)}$`
    }<br>
    On peut aussi écrire $(${reduireAxPlusB(a, -b)})^2=(${reduireAxPlusB(-a, b)})^2$, car $${reduireAxPlusB(-a, b)}=-(${reduireAxPlusB(a, -b)}).$`
          if (
            this.versionQcm &&
            this.distracteurs.includes(fausseFactorisation)
          ) {
            this.correction += `<br><br>${texteGras('Remarque :')} la proposition ${fausseFactorisation} redonne bien $${rienSi1(a ** 2)}x^2${reduireAxPlusB(-2 * a * b, b ** 2)}$ après développement, mais ce n'est pas une expression factorisée (c'est une somme et non un produit).<br>`
          }
        }
        break
      case 3: // a^2-b^2
        {
          const a = randint(2, 3)
          const b = randint(2, 10)
          const choix = choice([true, false])
          this.reponse = choix
            ? `(${reduireAxPlusB(a, -b)})(${reduireAxPlusB(a, b)})`
            : `(${reduireAxPlusB(a, b)})(${reduireAxPlusB(-a, b)})`
          if (this.versionQcm) this.reponse = '$' + this.reponse + '$'
          this.distracteurs = [
            `$(${reduireAxPlusB(a, -b)})^2$`,
            `$(${reduireAxPlusB(a ** 2, b ** 2)})(${reduireAxPlusB(a ** 2, -b * b)})$`,
            `$(${reduireAxPlusB(a ** 2, b)})(${reduireAxPlusB(a ** 2, -b)})$`,
          ]
          expression = choix
            ? `${rienSi1(a ** 2)}x^2-${b ** 2}`
            : `${b ** 2}-${rienSi1(a ** 2)}x^2`
          if (this.versionQcm) {
            this.question = `Une factorisation de $${expression}$ est :`
          } else {
            this.question = `Factoriser $${expression}$${this.consigneProduit ? " sous la forme d'un produit (ou d'un carré) de deux facteurs" : ''}.`
          }
          this.correction = `On reconnaît le développement de l'identité remarquable : <br>
          $(a+b)(a-b)=a^2-b^2$ avec $a=${choix ? `${rienSi1(a)}x` : `${b}`}$ et $b=${choix ? `${b}` : `${rienSi1(a)}x`}$.<br>
          On a donc :
      ${
        choix
          ? `$${rienSi1(a ** 2)}x^2-${b ** 2}=${miseEnEvidence(`(${reduireAxPlusB(a, -b)})(${reduireAxPlusB(a, b)})`)}$`
          : `$${b ** 2}-${rienSi1(a ** 2)}x^2=${miseEnEvidence(`(${b}+${rienSi1(a)}x)(${b}-${rienSi1(a)}x)`)}$`
      }`
        }
        break
    }
    if (!this.versionQcm) {
      this.optionsChampTexte = { texteAvant: `<br>$${expression}=$` }
    }
    this.canEnonce = this.question // 'Compléter'
    this.canReponseACompleter = ''
  }
}
