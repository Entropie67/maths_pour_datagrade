import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { remplisLesBlancs } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import { rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import { texNombre } from '../../lib/outils/texNombre'
import { fraction } from '../../modules/fractions'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Résolution d'équations du type $a^x = b$ avec un logarithme"
export const dateDePublication = '28/07/2024'
export const dateDeModifImportante = '28/07/2024'
export const uuid = '00ec8'
export const interactifReady = true

export const refs = {
  'fr-fr': ['TTE-5'],
  'fr-ch': ['2mLogExp-2'],
}

/**
 *  : Résolution d'équations du type a^x = b
 * @author Claire Rousset

 */
export default class EquationsLog extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 5
    if (this.nbQuestions === 1) {
      this.consigne = "Résoudre dans $\\R$ l'équation suivante."
    } else {
      this.consigne = 'Résoudre dans $\\R$ les équations suivantes.'
    }
    this.spacingCorr = 3
    this.sup = '4'
    this.besoinFormulaireTexte = [
      'Type de question ',
      'Nombres séparés par des tirets  :\n1 : Borne rationnelle\n2 : Borne entière\n3 : Borne irrationnelle\n4 : Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Type de logarithme ',
      2,
      '1 : Logarithme décimal\n2 : Logarithme népérien',
    ]
    this.sup2 = 1
    this.correctionDetailleeDisponible = true
  }

  estRationnelLogFraction(
    a: number,
    b: number,
    tolerance: number = 1e-5,
  ): number | [number, number] | null {
    const logA = Math.log(a)
    const logB = Math.log(b)
    const ratio = logB / logA
    const maxDenominator = 100 // Précision
    let bestNumerator = 0
    let bestDenominator = 1
    let minError = Math.abs(ratio - bestNumerator / bestDenominator)
    for (let denominator = 1; denominator <= maxDenominator; denominator++) {
      const numerator = Math.round(ratio * denominator)
      const currentError = Math.abs(ratio - numerator / denominator)
      if (currentError < minError) {
        bestNumerator = numerator
        bestDenominator = denominator
        minError = currentError
      }
      if (currentError < tolerance) {
        break
      }
    }
    if (minError < tolerance) {
      // Simplifie la fraction
      const commonDivisor = pgcd(bestNumerator, bestDenominator)
      if (bestDenominator === 1) {
        return bestNumerator // Retourne le numérateur si le dénominateur est 1
      } else {
        return [bestNumerator / commonDivisor, bestDenominator / commonDivisor]
      }
    }
    return null // N'est pas une fraction selon la tolérance
  }

  nouvelleVersion() {
    const logString = this.sup2 === 1 ? '\\log' : '\\ln'
    const listeCouples = [
      [0.03125, 2],
      [0.0625, 2],
      [0.08, 5],
      [0.125, 2],
      [0.125, 64],
      [0.2, 0.008],
      [0.2, 5],
      [0.2, 12],
      [0.2, 25],
      [0.2, 125],
      [0.25, 2],
      [0.25, 4],
      [0.25, 5],
      [0.25, 15],
      [0.25, 32],
      [0.25, 64],
      [0.4, 0.16],
      [0.4, 8],
      [0.5, 0.25],
      [0.5, 1.25],
      [0.5, 2],
      [0.5, 4],
      [0.5, 8],
      [0.5, 32],
      [0.6, 12],
      [0.625, 1.25],
      [0.6, 4],
      [0.75, 3],
      [0.35, 0.1225],
      [0.2, 0.04],
      [0.3, 0.09],
      [0.09, 0.3],
      [0.008, 0.2],
      [0.25, 0.5],
      [0.04, 0.2],
      [0.8, 0.64],
      [0.64, 0.8],
      [0.8, 0.512],
      [1.02, 2],
      [1.06, 2],
      [1.125, 27],
      [1.25, 5],
      [1.4, 2.8],
      [1.5, 3],
      [1.6, 8],
      [1.75, 3.5],
      [2, 4],
      [2, 8],
      [2, 9],
      [2, 16],
      [2, 25],
      [2, 32],
      [2, 64],
      [2, 128],
      [2, 256],
      [2, 512],
      [2, 1024],
      [2, 2048],
      [2, 4096],
      [2, 16384],
      [2, 65536],
      [2.25, 4],
      [2.25, 5],
      [2.5, 12.5],
      [2.5, 15],
      [3, 6],
      [3, 9],
      [3, 27],
      [3, 81],
      [3, 243],
      [3, 729],
      [3, 2187],
      [3, 6561],
      [3, 19683],
      [3, 59049],
      [3, 177147],
      [3, 531441],
      [3.25, 13],
      [3.5, 7],
      [3.75, 15],
      [4, 2],
      [4, 8],
      [4, 16],
      [4, 256],
      [4, 625],
      [4, 16384],
      [4, 65536],
      [5, 25],
      [5, 125],
      [11, 121],
      [6, 32],
      [7, 343],
      [8, 2],
      [8, 4],
      [9, 81],
      [11, 121],
      [12, 5],
      [27, 2],
      [27, 3],
      [27, 9],
      [32, 2],
      [32, 6],
      [64, 4],
      [81, 3],
      [243, 81],
      [243, 3],
      [256, 4],
      [1024, 2],
      [2048, 2],
      [2187, 3],
    ]

    const listeTypeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      nbQuestions: this.nbQuestions,
    })

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let a: number
      let b: number
      let quotient: number | [number, number] | null
      let base: number | null
      switch (listeTypeQuestions[i]) {
        case 1: // rationnel
          do {
            ;[a, b] = choice(listeCouples)
            quotient = this.estRationnelLogFraction(a, b)
          } while (quotient === null || typeof quotient === 'number')
          if (typeof quotient === 'number') {
            base = 10 ** (Math.log10(b) / quotient)
          } else {
            base = 10 ** (Math.log10(b) / quotient[0])
          }
          break
        case 2: // entier
          do {
            ;[a, b] = choice(listeCouples)
            quotient = this.estRationnelLogFraction(a, b)
          } while (quotient === null || Array.isArray(quotient))
          if (typeof quotient === 'number') {
            base = 10 ** (Math.log10(b) / quotient)
          } else {
            base = 10 ** (Math.log10(b) / quotient[0])
          }
          break
        default: // irrationnel
          do {
            ;[a, b] = choice(listeCouples)
            quotient = this.estRationnelLogFraction(a, b)
          } while (quotient !== null)
          base = null
      }
      const stringA = texNombre(a, 5) // Pour que a soit écrit correctement : virgule au lieu de point et séparation des classes
      const stringB = texNombre(b, 5)
      let resultat = ''
      if (quotient !== null) {
        if (Array.isArray(quotient)) {
          // Pour vérifier si quotient est un tableau
          // Pour que le - d'une fraction soit devant celle-ci
          const frac = fraction(quotient[0], quotient[1])
          resultat = frac.texFSD
        } else {
          resultat = `${texNombre(quotient, 5)}`
        }
      } else {
        resultat = `\\dfrac{${logString}(${stringB})}{${logString}(${stringA})}` // dfrac pour avoir fraction de taille normale
      }

      const answer = resultat
      texte = `$${texNombre(a, 5)}^x = ${stringB}$`
      texteCorr = `On sait que pour tous réels $a$ et $b$ strictement positifs $a = b$ si, et seulement si, $${logString}(a) = ${logString}(b)$. D'où :`
      texteCorr += `<br>$${texNombre(a, 5)}^x = ${stringB}$`
      texteCorr += `<br>$ \\iff ${logString}{(${stringA}^x)} = ${logString}{(${stringB})}$`
      texteCorr += `<br>$ \\iff x${logString}{(${stringA})} = ${logString}{(${stringB})}$`
      texteCorr += `<br>$ \\iff x = \\dfrac{${logString}(${stringB})}{${logString}(${stringA})}$`
      if (quotient !== null && base !== null) {
        texteCorr += this.correctionDetaillee
          ? typeof quotient === 'number'
            ? `<br>Or, $${logString}(${stringB})=${logString}(${texNombre(base, 5)}^{${quotient}})=${rienSi1(quotient)}${logString}(${texNombre(base, 5)})$ donc $\\dfrac{${logString}(${stringB})}{${logString}(${stringA})}=\\dfrac{${rienSi1(quotient)}${logString}(${texNombre(base, 5)})}{${logString}(${texNombre(base, 5)})}=${resultat}$. `
            : quotient[0] === 1
              ? `<br>Or, $${logString}(${stringA})=${logString}(${texNombre(base, 5)}^{${quotient[1]}})=${quotient[1]}${logString}(${texNombre(base, 5)})$ donc $\\dfrac{${logString}(${stringB})}{${logString}(${stringA})}=\\dfrac{${logString}(${stringB})}{${quotient[1]}${logString}(${texNombre(base, 5)})}=\\dfrac{${quotient[0]}}{${quotient[1]}}$. `
              : `<br>Or, $${logString}(${stringB})=${logString}(${texNombre(base, 5)}^{${quotient[0]}})=${rienSi1(quotient[0])}${logString}(${texNombre(base, 5)})$ et $${logString}(${stringA})=${logString}(${texNombre(base, 5)}^{${quotient[1]}})=${quotient[1]}${logString}(${texNombre(base, 5)})$ donc $\\dfrac{${logString}(${stringB})}{${logString}(${stringA})}=\\dfrac{${rienSi1(quotient[0])}${logString}(${texNombre(base, 5)})}{${quotient[1]}${logString}(${texNombre(base, 5)})}= ${resultat}$. `
          : `<br>Or, $\\dfrac{${logString}(${stringB})}{${logString}(${stringA})}= ${resultat}$.  `
      }
      texteCorr += `<br>Ainsi, $S=\\left\\{${miseEnEvidence(answer)}\\right\\}$`
      if (this.interactif) {
        handleAnswers(this, i, {
          champ1: { value: answer },
        })
        texte += '<br>'
        texte += remplisLesBlancs(
          this,
          i,
          'S=\\{%{champ1}\\}',
          KeyboardType.clavierFonctionsTerminales,
        )
      }
      if (this.questionJamaisPosee(i, a, b)) {
        // <- laisser le i et ajouter toutes les variables qui rendent les exercices différents (par exemple a, b, c et d)
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
