import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { rienSi1 } from '../../lib/outils/ecritures'
import {
  miseEnEvidence,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import type { Valeur } from '../../lib/types'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Résoudre une équation du second degré à l'aide de la racine carrée"
export const dateDePublication = '14/05/2024'
export const interactifReady = true
export const inteeractifReady = 'mathLive'
export const uuid = '0f844'
export const refs = {
  'fr-fr': ['3L15-2'],
  'fr-ch': ['1mCL4-1', '11LSFA4E-7'],
}

export const dateDeModifImportante = '31/10/2026'

/**
 *
 * @author Nathan Scheinmann
 */

export default class nomExercice extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Types de solution',
      4,
      '1 : Entier\n2 : Fraction\n3 : Racine\n4 : Mélange',
    ]
    this.sup = 4
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    const lycee = this.id === '1mCL4-1'
    if (this.nbQuestions === 1) {
      this.consigne = "Résoudre l'équation suivante."
    } else {
      this.consigne = 'Résoudre les équations suivantes.'
    }
    if (this.interactif) {
      this.consigne += lycee
        ? " Entrer les solutions sous forme d'un ensemble en séparant chaque élément par un point-virgule. Si une équation n'a pas de solution entrer l'ensemble vide."
        : " Entrer les solutions sous forme d'une liste en séparant chaque valeur par un point-virgule. Si une équation n'a pas de solution entrer $\\emptyset$."
    }
    let typeQuestionsDisponibles = []
    if (this.sup === 1) {
      typeQuestionsDisponibles = ['entier', 'entierPasDeSol']
    } else if (this.sup === 2) {
      typeQuestionsDisponibles = ['fraction', 'fractionPasDeSol']
    } else if (this.sup === 3) {
      typeQuestionsDisponibles = ['racine', 'racinePasDeSol']
    } else {
      typeQuestionsDisponibles = [
        'entier',
        'entierPasDeSol',
        'fraction',
        'fractionPasDeSol',
        'racine',
        'racinePasDeSol',
      ]
    }

    const listeTypeQuestions = combinaisonListes(
      typeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      let coeffX = choice([1, -1, 2, -2, 3, -3])
      let coeffConstant = new FractionEtendue(0, 1)
      let expReduite = ''
      let sol = ''
      let reponse: Valeur

      switch (listeTypeQuestions[i]) {
        case 'entier':
          do {
            coeffConstant = new FractionEtendue(
              choice([1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144]),
              1,
            )
            if (coeffX > 0) {
              coeffConstant = coeffConstant.multiplieEntier(-1)
            }
          } while (
            coeffConstant.num === 0 ||
            Math.abs(coeffX * coeffConstant.num) > 144
          )
          reponse = {
            reponse: {
              value: lycee
                ? `\\left\\{-${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).texRacineCarree(false)};${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).texRacineCarree(false)}\\right\\}`
                : `-${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).texRacineCarree(false)};${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).texRacineCarree(false)}`,
              options: lycee
                ? { ensembleDeNombres: true }
                : { suiteDeNombres: true },
            },
          }
          break
        case 'entierPasDeSol':
          do {
            coeffConstant = new FractionEtendue(
              choice([1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144]),
              1,
            )
            if (coeffX < 0) {
              coeffConstant = coeffConstant.multiplieEntier(-1)
            }
          } while (
            coeffConstant.num === 0 ||
            Math.abs(coeffX * coeffConstant.num) > 144
          )
          reponse = {
            reponse: {
              value: '\\emptyset',
              options: lycee
                ? { ensembleDeNombres: true }
                : { suiteDeNombres: true },
            },
          }
          break
        case 'fraction':
          {
            coeffX = choice([1, -1])
            const num = choice([1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144])
            const den = choice(
              [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144],
              [num],
            )
            coeffConstant = new FractionEtendue(num, den)
            if (coeffX > 0) {
              coeffConstant = coeffConstant.multiplieEntier(-1)
            }
            reponse = {
              reponse: {
                value: lycee
                  ? `\\left\\{-${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).texRacineCarree(false)};${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).texRacineCarree(false)}\\right\\}`
                  : `-${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).texRacineCarree(false)};${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).texRacineCarree(false)}`,
                options: lycee
                  ? { ensembleDeNombres: true }
                  : { suiteDeNombres: true },
              },
            }
          }
          break
        case 'fractionPasDeSol':
          {
            coeffX = choice([1, -1])
            const num = choice([1, 4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144])
            const den = choice(
              [4, 9, 16, 25, 36, 49, 64, 81, 100, 121, 144],
              [num],
            )
            coeffConstant = new FractionEtendue(num, den)
            if (coeffX < 0) {
              coeffConstant = coeffConstant.multiplieEntier(-1)
            }
            reponse = {
              reponse: {
                value: '\\emptyset',
                options: lycee
                  ? { ensembleDeNombres: true }
                  : { suiteDeNombres: true },
              },
            }
          }
          break
        case 'racine':
          {
            coeffX = choice([1, -1])
            const num = randint(1, 100, [1, 4, 9, 16, 25, 36, 49, 64, 81, 100])
            const den = randint(1, 100, [
              1,
              4,
              9,
              16,
              25,
              36,
              49,
              64,
              81,
              100,
              num,
            ])
            coeffConstant = new FractionEtendue(num, den)
            if (coeffX > 0) {
              coeffConstant = coeffConstant.multiplieEntier(-1)
            }
            reponse = {
              reponse: {
                value: lycee
                  ? `\\left\\{-\\sqrt{${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).texFractionSimplifiee}};\\sqrt{${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).texFractionSimplifiee}}\\right\\}`
                  : `-\\sqrt{${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).texFractionSimplifiee}};\\sqrt{${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).texFractionSimplifiee}}`,
                options: lycee
                  ? { ensembleDeNombres: true }
                  : { suiteDeNombres: true },
              },
            }
          }
          break
        case 'racinePasDeSol':
        default:
          {
            coeffX = choice([1, -1])
            const num = randint(1, 100, [1, 4, 9, 16, 25, 36, 49, 64, 81, 100])
            const den = randint(1, 100, [
              1,
              4,
              9,
              16,
              25,
              36,
              49,
              64,
              81,
              100,
              num,
            ])
            coeffConstant = new FractionEtendue(num, den)
            if (coeffX < 0) {
              coeffConstant = coeffConstant.multiplieEntier(-1)
            }
            reponse = {
              reponse: {
                value: '\\emptyset',
                options: lycee
                  ? { ensembleDeNombres: true }
                  : { suiteDeNombres: true },
              },
            }
          }
          break
      }
      expReduite = `$${rienSi1(coeffX)}x^2  ${coeffConstant.texFractionSignee}=0$`
      texte = `${expReduite}.`
      texteCorr = `On commence par isoler le terme en $x^2$ : \\[${rienSi1(coeffX)}x^2=${coeffConstant.multiplieEntier(-1).texFSD}.\\]<br>`
      if (!(coeffX === 1)) {
        texteCorr += `On divise par $${texNombre(coeffX)}$ et on s'assure que la fraction est irréductible pour obtenir $x^2=${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).texFractionSimplifiee}$.<br>`
      } else if (!coeffConstant.estIrreductible) {
        texteCorr += ` On réduit pour obtenir $x^2=${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).texFractionSimplifiee}$.<br>`
      }
      if (coeffConstant.multiplieEntier(-1).entierDivise(coeffX).signe === -1) {
        texteCorr += ` On en déduit que l'équation ${texteEnCouleurEtGras("n'a pas de solution")} ${lycee ? 'réelle' : 'car un carré est toujours positif'}.`
        if (!lycee && this.interactif) {
          texteCorr += ` Saisir $${miseEnEvidence('\\emptyset')}$.`
        }
      } else {
        texteCorr += lycee
          ? ` On en déduit que $x=\\pm\\sqrt{${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).texFractionSimplifiee}}`
          : coeffConstant.multiplieEntier(-1).entierDivise(coeffX).estParfaite
            ? ` On en déduit que les solutions sont $${miseEnEvidence(`-${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).simplifie().texRacineCarree(false)};${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).simplifie().texRacineCarree(false)}`)}$.<br>`
            : ` On en déduit que les solutions sont $${miseEnEvidence(`-\\sqrt{${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).texFractionSimplifiee}};\\sqrt{${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).texFractionSimplifiee}}`)}$.<br>`
      }
      if (
        !(listeTypeQuestions[i] === 'racine') &&
        !listeTypeQuestions[i].includes('PasDeSol')
      ) {
        texteCorr += lycee
          ? `=\\pm${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).texRacineCarree(false)}$.`
          : ''
      } else if (listeTypeQuestions[i] === 'racine') {
        if (lycee) texteCorr += '$.<br>'
        else texteCorr += '<br>'
      }
      if (listeTypeQuestions[i].includes('PasDeSol')) {
        sol = '\\emptyset$.'
      } else if (listeTypeQuestions[i] === 'racine') {
        sol = `\\left\\{-\\sqrt{${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).texFractionSimplifiee}};\\sqrt{${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).texFractionSimplifiee}}\\right\\}$.`
      } else {
        sol = `\\left\\{-${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).texRacineCarree(false)};${coeffConstant.multiplieEntier(-1).entierDivise(coeffX).texRacineCarree(false)}\\right\\}$.`
      }
      texteCorr += lycee
        ? ` L'ensemble de solutions est $S=${miseEnEvidence(sol.replace(/\$\.$/, ''))}$.`
        : ''
      if (this.questionJamaisPosee(i, coeffConstant, coeffX)) {
        this.listeQuestions[i] =
          texte +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierEnsemble, {
            texteAvant: lycee ? '<br>$S=$' : '<br>Les solutions sont : ',
          })
        if (this.interactif) {
          handleAnswers(this, i, reponse)
        }
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
