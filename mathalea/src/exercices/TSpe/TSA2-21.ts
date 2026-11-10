import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { rienSi1 } from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  "Déterminer des limites en l'infini de fonctions de référence"
export const dateDePublication = '08/08/2026'
export const interactifReady = true

export const uuid = '79c37'
export const refs = {
  'fr-fr': ['TSA2-21', 'TCA2-21'],
  'fr-ch': [],
}

type TypeQuestion =
  | 'puissancePaire'
  | 'puissanceImpaire'
  | 'inverse'
  | 'inverseCarre'
  | 'exponentielle'

type SensLimite = '+' | '-'

type DonneesQuestion = {
  domaine: '\\mathbb R' | '\\mathbb R^*'
  expression: string
  reponse: string
  correction: string
}

function termePuissance(coefficient: number, exposant: number): string {
  const coefficientTexte =
    coefficient === 1 ? '' : coefficient === -1 ? '-' : `${coefficient}`
  return `${coefficientTexte}x${exposant === 1 ? '' : `^{${exposant}}`}`
}

function infiniTex(sens: SensLimite): string {
  return `${sens}\\infty`
}

/**
 * Limites de fonctions de référence en plus ou moins l'infini.
 * @author Stéphane Guyon
 */
export default class LimitesFonctionsDeReference extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
  }

  nouvelleVersion() {
    this.consigne =
      this.nbQuestions === 1
        ? 'Déterminer la limite suivante.'
        : 'Déterminer les limites suivantes.'

    const typesDeQuestions = combinaisonListes<TypeQuestion>(
      [
        'puissancePaire',
        'puissanceImpaire',
        'inverse',
        'inverseCarre',
        'exponentielle',
      ],
      this.nbQuestions,
    )
    const sensDesLimites = combinaisonListes<SensLimite>(
      ['+', '-'],
      this.nbQuestions,
    )

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const type = typesDeQuestions[i]
      const sensLimite = sensDesLimites[i]
      const coefficient = choice([-1, 1]) * randint(2, 6)
      const limiteX = infiniTex(sensLimite)
      let donnees: DonneesQuestion

      switch (type) {
        case 'puissancePaire': {
          const exposant = choice([2, 4])
          const expression = termePuissance(coefficient, exposant)
          const reponse = coefficient > 0 ? '+\\infty' : '-\\infty'
          donnees = {
            domaine: '\\mathbb R',
            expression,
            reponse,
            correction: `On sait que $\\displaystyle \\lim_{x\\to${limiteX}}x^{${exposant}}=+\\infty$.<br>
            ${coefficient < 0 ? `Comme $${coefficient}<0$, alors` : 'Donc'} $\\displaystyle \\lim_{x\\to${limiteX}}${expression}=${miseEnEvidence(reponse)}$.`,
          }
          break
        }
        case 'puissanceImpaire': {
          const exposant = choice([1, 3, 5])
          const expression = termePuissance(coefficient, exposant)
          const puissanceReference = exposant === 1 ? 'x' : `x^{${exposant}}`
          const limiteReference = sensLimite === '+' ? '+\\infty' : '-\\infty'
          const reponse =
            coefficient > 0
              ? limiteReference
              : limiteReference === '+\\infty'
                ? '-\\infty'
                : '+\\infty'
          donnees = {
            domaine: '\\mathbb R',
            expression,
            reponse,
            correction: `On sait que $\\displaystyle \\lim_{x\\to${limiteX}}${puissanceReference}=${limiteReference}$.<br>
            ${coefficient < 0 ? `Comme $${coefficient}<0$, alors` : 'Donc'} $\\displaystyle \\lim_{x\\to${limiteX}}${expression}=${miseEnEvidence(reponse)}$.`,
          }
          break
        }
        case 'inverse':
          donnees = {
            domaine: '\\mathbb R^*',
            expression: `\\dfrac{${coefficient}}{x}`,
            reponse: '0',
            correction: `On sait que $\\displaystyle \\lim_{x\\to${limiteX}}\\dfrac{1}{x}=0$.<br>
            Donc $\\displaystyle \\lim_{x\\to${limiteX}}\\dfrac{${coefficient}}{x}=${miseEnEvidence('0')}$.`,
          }
          break
        case 'inverseCarre':
          donnees = {
            domaine: '\\mathbb R^*',
            expression: `\\dfrac{${coefficient}}{x^2}`,
            reponse: '0',
            correction: `On sait que $\\displaystyle \\lim_{x\\to${limiteX}}\\dfrac{1}{x^2}=0$.<br>
            Donc $\\displaystyle \\lim_{x\\to${limiteX}}\\dfrac{${coefficient}}{x^2}=${miseEnEvidence('0')}$.`,
          }
          break
        case 'exponentielle': {
          const coefficientExposant = choice([-1, 1]) * randint(2, 5)
          const sensArgument =
            coefficientExposant * (sensLimite === '+' ? 1 : -1) > 0 ? '+' : '-'
          const reponse = sensArgument === '+' ? '+\\infty' : '0'
          const exposant = `${coefficientExposant < 0 ? '-' : ''}${rienSi1(Math.abs(coefficientExposant))}x`
          donnees = {
            domaine: '\\mathbb R',
            expression: `\\mathrm{e}^{${exposant}}`,
            reponse,
            correction: `$\\displaystyle \\lim_{x\\to${limiteX}}${exposant}=${sensArgument}\\infty$.<br>
            On sait que $\\displaystyle \\lim_{X\\to${sensArgument}\\infty}\\mathrm{e}^{X}=${reponse}$. Donc $\\displaystyle \\lim_{x\\to${limiteX}}f(x)=${miseEnEvidence(reponse)}$.`,
          }
          break
        }
      }

      let texte = `Soit $f$ la fonction définie sur $${donnees.domaine}$ par :
      $f(x)=${donnees.expression}$.`
      if (this.interactif) {
        texte +=
          `<br>$\\displaystyle \\lim_{x\\to${limiteX}}f(x)=$` +
          ajouteChampTexteMathLive(this, i, KeyboardType.clavierLimitesSimple)
      } else {
        texte += `<br>$\\displaystyle \\lim_{x\\to${limiteX}}f(x)$`
      }

      if (
        this.questionJamaisPosee(
          i,
          donnees.expression,
          sensLimite,
          donnees.reponse,
        )
      ) {
        handleAnswers(this, i, { reponse: { value: donnees.reponse } })
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = donnees.correction
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
