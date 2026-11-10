import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Simplifier des expressions numériques avec des valeurs absolues'
export const dateDePublication = '06/10/2026'
export const dateDeModifImportante = '06/10/2026'

export const uuid = '1075f'
export const refs = {
  'fr-fr': ['2N13-4'],
  'fr-ch': [],
}
export const interactifReady = true

/**
 * Calculs simples à effectuer à la main avec des valeurs absolues.
 * @author Stéphane Guyon
 */
export default class CalculsAvecValeursAbsolues extends Exercice {
  constructor() {
    super()
    this.consigne = 'Sans calculatrice, simplifier les expressions suivantes.'
    this.nbQuestions = 4
    this.nbCols = 2
    this.nbColsCorr = 2
    this.spacingCorr = 2
    this.sup = '1-2-3-4'
    this.besoinFormulaireTexte = [
      'Types de calculs',
      'Nombres séparés par des tirets :\n1 : Calculs avec des entiers\n2 : Calculs avec des décimaux\n3 : Calculs avec un quotient\n4 : Calculs avec deux écarts\n5 : Mélange',
    ]
  }

  nouvelleVersion() {
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      defaut: 5,
      melange: 5,
      shuffle: true,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = types[i]
      const lettre = lettreDepuisChiffre(i + 1)
      let expression: string
      let etapes: string
      let resultat: number
      switch (type) {
        case 1: {
          const a = -randint(1, 9)
          const b = -randint(1, 9)
          const operation = choice(['+', '-', '\\times'])
          const forme = choice([1, 2, 3])
          if (forme === 1) {
            expression = `\\lvert ${a}\\rvert${operation}\\lvert ${b}\\rvert`
            etapes = `${Math.abs(a)}${operation}${Math.abs(b)}`
            resultat =
              operation === '+'
                ? Math.abs(a) + Math.abs(b)
                : operation === '-'
                  ? Math.abs(a) - Math.abs(b)
                  : Math.abs(a) * Math.abs(b)
          } else if (forme === 2) {
            expression = `\\lvert ${a}-${ecritureParentheseSiNegatif(b)}\\rvert`
            etapes = `\\lvert ${a}+${-b}\\rvert=\\lvert ${a - b}\\rvert`
            resultat = Math.abs(a - b)
          } else {
            expression = `-\\lvert ${a}\\rvert+\\lvert ${b}\\rvert`
            etapes = `-${Math.abs(a)}+${Math.abs(b)}`
            resultat = -Math.abs(a) + Math.abs(b)
          }
          break
        }
        case 2: {
          // Les dixièmes sont tirés comme des entiers pour éviter les arrondis.
          const a = -randint(1, 29, [10, 20])
          const b = -(choice([true, false])
            ? Math.abs(a)
            : randint(1, 29, [10, 20, Math.abs(a)]))
          const signe = choice([1, -1])
          const operation = signe === 1 ? '+' : '-'
          if (choice([true, false])) {
            expression = `\\lvert ${texNombre(a / 10, 1)}\\rvert${operation}\\lvert ${texNombre(b / 10, 1)}\\rvert`
            etapes = `${texNombre(Math.abs(a) / 10, 1)}${operation}${texNombre(Math.abs(b) / 10, 1)}`
            resultat = (Math.abs(a) + signe * Math.abs(b)) / 10
          } else {
            expression = `\\lvert ${texNombre(a / 10, 1)}-${ecritureParentheseSiNegatif(b / 10)}\\rvert`
            etapes = `\\lvert ${texNombre(a / 10, 1)}+${texNombre(-b / 10, 1)}\\rvert=\\lvert ${texNombre((a - b) / 10, 1)}\\rvert`
            resultat = Math.abs(a - b) / 10
          }
          break
        }
        case 3: {
          const petit = randint(1, 9)
          const ecart = randint(2, 12)
          const negatif = choice([true, false])
          const a = negatif ? petit : petit + ecart
          const b = negatif ? petit + ecart : petit
          const c = randint(1, 9)
          const d = choice([2, 5])
          const signe = choice([1, -1])
          const terme = ecritureAlgebrique(signe * c)
          const difference = `${a}${ecritureAlgebrique(-b)}`
          switch (choice([1, 2, 3])) {
            case 1:
              expression = `\\dfrac{\\lvert ${difference}\\rvert${terme}}{${d}}`
              etapes = `\\dfrac{\\lvert ${a - b}\\rvert${terme}}{${d}}=\\dfrac{${ecart}${terme}}{${d}}=\\dfrac{${ecart + signe * c}}{${d}}`
              resultat = (ecart + signe * c) / d
              break
            case 2:
              expression = `\\dfrac{\\lvert ${difference}\\rvert}{${d}}${terme}`
              etapes = `\\dfrac{\\lvert ${a - b}\\rvert}{${d}}${terme}=\\dfrac{${ecart}}{${d}}${terme}=${texNombre(ecart / d, 1)}${terme}`
              resultat = (ecart + signe * c * d) / d
              break
            default:
              expression = `\\left\\lvert \\dfrac{${difference}}{${d}}\\right\\rvert`
              etapes = `\\left\\lvert \\dfrac{${a - b}}{${d}}\\right\\rvert=\\lvert ${texNombre((a - b) / d, 1)}\\rvert`
              resultat = ecart / d
          }
          break
        }
        case 4:
        default: {
          const a = randint(1, 20)
          const b = randint(1, 20, a)
          const c = randint(1, 9)
          const d = randint(1, 9, c)
          const signe = choice([1, -1])
          const operation = signe === 1 ? '+' : '-'
          if (choice([true, false])) {
            expression = `\\lvert ${a}-${b}\\rvert${operation}\\lvert ${c}-${d}\\rvert`
            etapes = `\\lvert ${a - b}\\rvert${operation}\\lvert ${c - d}\\rvert=${Math.abs(a - b)}${operation}${Math.abs(c - d)}`
            resultat = Math.abs(a - b) + signe * Math.abs(c - d)
          } else {
            expression = `\\left\\lvert \\lvert ${a}-${b}\\rvert-\\lvert ${c}-${d}\\rvert\\right\\rvert`
            etapes = `\\left\\lvert \\lvert ${a - b}\\rvert-\\lvert ${c - d}\\rvert\\right\\rvert=\\left\\lvert ${Math.abs(a - b)}-${Math.abs(c - d)}\\right\\rvert=\\lvert ${Math.abs(a - b) - Math.abs(c - d)}\\rvert`
            resultat = Math.abs(Math.abs(a - b) - Math.abs(c - d))
          }
          break
        }
      }
      if (this.questionJamaisPosee(i, type, expression)) {
        let texte = `$${lettre}=${expression}$`
        if (this.interactif) {
          texte += ajouteChampTexteMathLive(
            this,
            i,
            KeyboardType.clavierDeBaseAvecFraction,
            { texteAvant: `<br>$${lettre}=$` },
          )
        }
        // Un seul champ : chaque question vaut toujours un point.
        handleAnswers(this, i, { reponse: { value: String(resultat) } })
        this.listeQuestions[i] = texte
        const lignes = [
          expression,
          ...etapes.split('='),
          miseEnEvidence(texNombre(resultat, 1)),
        ]
        this.listeCorrections[i] =
          `$\\begin{aligned}${lettre}&=${lignes.join('\\\\&=')}\\end{aligned}$`
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
