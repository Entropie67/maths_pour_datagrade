// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 70513 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { shuffle } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureParentheseSiNegatif,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre = 'Factoriser une expression de la forme $ax^2+bx$'
export const dateDePublication = '24/08/2026'
export const uuid = '70513'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

/**
 * Factoriser une expression de la forme ax²+bx en mettant x en facteur.
 * @author Stéphane Guyon
 */
export default class FactoriserXCommunOld extends ExerciceQcmA {
  versionAleatoire = () => {
    let compteur = 0
    do {
      const a = randint(-7, 7, [0, 1])
      const b = randint(-9, 9, [0, a, -a])

      const expression = new Polynome({
        rand: false,
        coeffs: [0, b, a],
      }).toLatex()
      const facteurRestant = reduireAxPlusB(a, b)
      const bonneReponse = `x\\left(${facteurRestant}\\right)`

      const distracteurs = shuffle([
        // Le signe du terme constant est changé lors de la mise en facteur.
        `x\\left(${reduireAxPlusB(a, -b)}\\right)`,
        // L'élève met x² en facteur alors que bx n'est divisible que par x.
        `x^2\\left(${facteurRestant}\\right)`,
        // Les coefficients a et b sont intervertis.
        `x\\left(${reduireAxPlusB(b, a)}\\right)`,
        // L'élève met ax en facteur sans diviser b par a.
        `\\left(${reduireAxPlusB(a, 0)}\\right)\\left(${reduireAxPlusB(1, b)}\\right)`,
        // La mise en facteur n'est effectuée que sur le premier terme.
        `x\\left(${reduireAxPlusB(a, 0)}\\right)${ecritureAlgebrique(b)}`,
        // Le facteur commun x est oublié dans le résultat.
        `\\left(${facteurRestant}\\right)`,
        // L'expression est laissée sous sa forme développée.
        expression,
      ]).slice(0, 3)

      this.enonce = 'Soit $x$ un réel.<br>'
      this.enonce += `Parmi ces $4$ expressions, quelle expression est une forme factorisée de $${expression}$ ?`

      this.correction = `Les deux termes de $${expression}$ contiennent le facteur commun $x$.<br>
      $\\begin{aligned}
      ${expression}
      &=x\\times\\left(${reduireAxPlusB(a, 0)}\\right)+x\\times ${ecritureParentheseSiNegatif(b)}\\\\
      &=x\\left(${facteurRestant}\\right).
      \\end{aligned}$<br>
      Une forme factorisée de $${expression}$ est donc $${miseEnEvidence(bonneReponse)}$.`

      this.reponses = [
        `$${bonneReponse}$`,
        ...distracteurs.map((reponse) => `$${reponse}$`),
      ]
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.besoinFormulaireCaseACocher = false
    this.versionAleatoire()
  }
}
