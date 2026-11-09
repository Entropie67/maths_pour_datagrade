// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 604af continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { Polynome } from '../../lib/mathFonctions/Polynome'
import { shuffle } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  reduireAxPlusB,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre = 'Factoriser une expression avec un facteur commun'
export const dateDePublication = '25/08/2026'
export const uuid = '604af'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}

export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

/**
 * Factoriser une expression de la forme (ax+b)^2-(ax+b)(cx+d).
 * @author Stéphane Guyon
 */
export default class FactoriserFacteurCommunOld extends ExerciceQcmA {
  versionAleatoire = () => {
    let compteur = 0
    do {
      const a = randint(-6, 6, 0)
      const b = randint(-9, 9, 0)
      const c = randint(-6, 6, [0, a])
      const d = randint(-9, 9, [0, b, -b])

      const facteurCommun = reduireAxPlusB(a, b)
      const secondFacteur = reduireAxPlusB(c, d)
      const differenceCorrecte = reduireAxPlusB(a - c, b - d)
      const differenceAvecErreurImposee = reduireAxPlusB(a - c, b + d)

      const bonneReponse = `\\left(${facteurCommun}\\right)\\left(${differenceCorrecte}\\right)`
      // Ce distracteur doit toujours être proposé : le signe « -d » devient « +d ».
      const distracteurImpose = `\\left(${facteurCommun}\\right)\\left(${differenceAvecErreurImposee}\\right)`

      const expressionDeveloppee = new Polynome({
        rand: false,
        coeffs: [b * b - b * d, 2 * a * b - a * d - b * c, a * a - a * c],
      }).toLatex()

      const autresDistracteurs = shuffle([
        // Erreur de signe sur le coefficient de x dans la différence.
        `\\left(${facteurCommun}\\right)\\left(${reduireAxPlusB(a + c, b - d)}\\right)`,
        // Deux erreurs de signe dans la différence.
        `\\left(${facteurCommun}\\right)\\left(${reduireAxPlusB(a + c, b + d)}\\right)`,
        // Le carré du facteur commun est conservé au lieu d'être mis en facteur.
        `\\left(${facteurCommun}\\right)^2-\\left(${secondFacteur}\\right)`,
        // L'expression est développée au lieu d'être factorisée.
        expressionDeveloppee,
        // Le mauvais facteur est mis en facteur.
        `\\left(${secondFacteur}\\right)\\left(${differenceCorrecte}\\right)`,
      ]).slice(0, 2)
      const expressionInitiale = `$\\left(${facteurCommun}\\right)^2-\\left(${facteurCommun}\\right)\\left(${secondFacteur}\\right)$`
      this.enonce = 'Soit $x$ un réel.<br>'
      this.enonce += `Parmi ces $4$ expressions, quelle expression est une forme factorisée de ${expressionInitiale} ?`

      this.correction = `On reconnaît le facteur commun $\\left(${facteurCommun}\\right)$.<br>
      $\\begin{aligned}
      \\left(${facteurCommun}\\right)^2-\\left(${facteurCommun}\\right)\\left(${secondFacteur}\\right)
      &=\\left(${facteurCommun}\\right)\\left(${facteurCommun}\\right)-\\left(${facteurCommun}\\right)\\left(${secondFacteur}\\right)\\\\
      &=\\left(${facteurCommun}\\right)\\left[\\left(${facteurCommun}\\right)-\\left(${secondFacteur}\\right)\\right]\\\\
      &=\\left(${facteurCommun}\\right)\\left[${facteurCommun}${ecritureAlgebriqueSauf1(-c)}x${ecritureAlgebrique(-d)}\\right]\\\\
      &=\\left(${facteurCommun}\\right)\\left(${differenceCorrecte}\\right).
      \\end{aligned}$<br>`
      // this.correction += `Le signe $-$ placé devant la parenthèse change le signe de chacun de ses termes.<br>`
      this.correction += `Une forme factorisée de ${expressionInitiale} est donc $${miseEnEvidence(bonneReponse)}$.`

      this.reponses = [
        `$${bonneReponse}$`,
        `$${distracteurImpose}$`,
        ...autresDistracteurs.map((reponse) => `$${reponse}$`),
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
