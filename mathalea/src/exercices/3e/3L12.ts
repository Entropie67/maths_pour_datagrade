import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { reduireAxPlusB } from '../../lib/outils/ecritures'
import { lettreDepuisChiffre } from '../../lib/outils/outilString'
import { pgcd } from '../../lib/outils/primalite'
import { context } from '../../modules/context'
import { fraction } from '../../modules/fractions'
import {
  listeQuestionsToContenuSansNumero,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { miseEnEvidence } from '../../lib/outils/embellissements'

export const titre = 'Factoriser a²-b²'
export const interactifReady = true

export const dateDeModifImportante = '26/02/2023'

/**
 * Factoriser a²-b²
 * @author Jean-claude Lhote,
 * Ajout Mélange des questions Matthieu Devillers
 */
export const uuid = '81fd2'

export const refs = {
  'fr-fr': ['3L12', 'BP2AutoI23', 'BP1AUTO090'],
  'fr-ch': ['11LSFA3I-2'],
}
export default class FactoriserIdentitesRemarquables3 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Niveau de difficulté',
      4,
      ' 1 : Coefficient de x égal à 1\n 2 : Coefficient de x supérieur à 1\n 3 : Coefficient de x rationnel\n 4 : Mélange des cas précédents',
    ]
    this.besoinFormulaire2CaseACocher = [
      'Présentation des corrections en colonnes',
      false,
    ]
    this.spacingCorr = context.isHtml ? 3 : 2

    this.nbQuestions = 4
    this.sup = 4
    this.sup2 = true
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions > 1
        ? 'Factoriser les expressions suivantes.'
        : "Factoriser l'expression suivante."
    const Fractions = [
      [1, 2],
      [1, 3],
      [2, 3],
      [1, 4],
      [3, 4],
      [1, 5],
      [2, 5],
      [3, 5],
      [4, 5],
      [1, 6],
      [5, 6],
      [1, 7],
      [2, 7],
      [3, 7],
      [4, 7],
      [5, 7],
      [6, 7],
      [1, 8],
      [3, 8],
      [5, 8],
      [7, 8],
      [1, 9],
      [2, 9],
      [3, 10],
      [7, 10],
      [9, 10],
      [4, 9],
      [5, 9],
      [7, 9],
      [8, 9],
      [1, 10],
    ]
    let typesDeQuestionsDisponibles = []
    if (this.sup === 1) {
      typesDeQuestionsDisponibles = [1] // coef de x = 1
    } else if (this.sup === 2) {
      typesDeQuestionsDisponibles = [2] // coef de x > 1
    } else if (this.sup === 3) {
      typesDeQuestionsDisponibles = [3] // coef de x négatif
    } else {
      typesDeQuestionsDisponibles = [1, 2, 3]
    } // mélange des questions
    const listeTypeDeQuestions = combinaisonListes(
      typesDeQuestionsDisponibles,
      this.nbQuestions,
    )
    for (
      let i = 0,
        texte: string,
        texteCorr: string,
        cpt = 0,
        a,
        b,
        ns,
        ds,
        typesDeQuestions;
      i < this.nbQuestions && cpt < 50;
    ) {
      typesDeQuestions = listeTypeDeQuestions[i]
      do {
        a = randint(1, 9)
        b = randint(2, 9)
      } while (pgcd(a, b) !== 1)
      const uneFraction = choice(Fractions)
      ns = uneFraction[0]
      ds = uneFraction[1]
      texteCorr = ''
      switch (typesDeQuestions) {
        case 1:
          texte = `$${lettreDepuisChiffre(i + 1)} = x^2-${a * a}$` // (x-a)(x+a)
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = x^2-${a * a}=x^2-${a}^2=(x-${a})(x+${a})$`
          handleAnswers(this, i, {
            reponse: {
              value: `(${reduireAxPlusB(1, -a)})(${reduireAxPlusB(1, a)})`,
              options: { factorisation: true },
            },
          })
          break
        case 2:
          texte = `$${lettreDepuisChiffre(i + 1)} = ${b * b}x^2-${a * a}$` // b>1
          texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${b * b}x^2-${a * a}=(${b}x)^2-${a}^2=(${b}x-${a})(${b}x+${a})$`
          handleAnswers(this, i, {
            reponse: {
              value: `(${reduireAxPlusB(b, -a)})(${reduireAxPlusB(b, a)})`,
              options: { factorisation: true },
            },
          })
          break
        case 3:
        default:
          {
            const dfrac = fraction(ns, ds).texFraction
            const dfrac2 = fraction(ns * ns, ds * ds).texFraction
            texte = `$${lettreDepuisChiffre(i + 1)} = ${dfrac2}x^2-${a * a}$` // b>1
            texteCorr = `$${lettreDepuisChiffre(i + 1)} = ${dfrac2}x^2-${a * a}=\\left(${dfrac}x\\right)^2-${a}^2=\\left(${dfrac}x-${a}\\right)\\left(${dfrac}x+${a}\\right)$`
            handleAnswers(this, i, {
              reponse: {
                value: `(${dfrac}x+${a})(${dfrac}x-${a})`,
                options: { factorisation: true },
              },
            })
          }
          break
      }
      if (this.sup2) {
        // On enlève la première égalité pour ne pas avoir A = A en première ligne
        texteCorr = texteCorr.slice(4)
        // On découpe
        const etapes = texteCorr.split('=')
        texteCorr = ''
        etapes.forEach(function (etape) {
          etape = etape.replace('$', '')
          texteCorr +=
            etape === lettreDepuisChiffre(i + 1)
              ? ''
              : `$${lettreDepuisChiffre(i + 1)} = ${etape}$ <br>`
        })
      }
      texte += ajouteChampTexteMathLive(
        this,
        i,
        KeyboardType.clavierDeBaseAvecVariable,
        { texteAvant: ' $=$' },
      )

      // Uniformisation : Mise en place de la réponse attendue en interactif en orange et gras
      const textCorrSplit = texteCorr.split('=')
      let aRemplacer = textCorrSplit[textCorrSplit.length - 1]
      aRemplacer = aRemplacer.replace('$', '')
      aRemplacer = aRemplacer.replace('<br>', '')

      texteCorr = ''
      for (let ee = 0; ee < textCorrSplit.length - 1; ee++) {
        texteCorr += textCorrSplit[ee] + '='
      }
      texteCorr += `$ $${miseEnEvidence(aRemplacer)}$`
      // Fin de cette uniformisation

      if (this.questionJamaisPosee(i, a, typesDeQuestions)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenuSansNumero(this)
  }
}
