import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'
export const dateDePublication = '20/02/2026'
export const dateDeModifImportante = '03/10/2026'

export const uuid = '3751f'
// @Author Gilles Mora
export const refs = {
  'fr-fr': ['1A-C09-9', '2A-C1-4'],
  'fr-ch': ['1mQCM-20', '11LCFA3E-7', '11LSFA3E-7', '11CTQCMFA4-3', '11LCQCMFA4-1', '11LSQCMFA4-4'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Réduire une expression littérale avec une parenthèse'
export default class Puissances extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecVariable
    this.optionsDeComparaison = { expressionsForcementReduites: true }
    this.optionsChampTexte = { texteAvant: '<br>$A=$' }
    this.versionQcmDisponible = true
    this.versionQcm = false
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    const a = randint(-9, 9, [0, -1, 1])
    const b = randint(-9, 9, 0)
    const c = randint(-9, 9, [0, -1, 1])
    const d = randint(-9, 9, [0, -1, 1])
    const e = randint(-9, 9, 0)
    const choixLettre = choice(['a', 'b', 'c', 'x', 'y', 'z'])

    // Résultat correct : -cx² + (a-d)x + (b-e)
    const bonneReponse = reduirePolynomeDegre3(0, -c, a - d, b - e, choixLettre)
    const definitionA = `$A= (${rienSi1(a)}${choixLettre}${ecritureAlgebrique(b)}) - (${rienSi1(c)}${choixLettre}^2${ecritureAlgebriqueSauf1(d)}${choixLettre}${ecritureAlgebrique(e)})$`

    // Correction détaillée
    this.correction = `On supprime les parenthèses en changeant les signes dans la deuxième parenthèse (précédée du signe $-$) :<br>`
    this.correction += `$A= ${rienSi1(a)}${choixLettre}${ecritureAlgebrique(b)} ${ecritureAlgebriqueSauf1(-c)}${choixLettre}^2${ecritureAlgebriqueSauf1(-d)}${choixLettre}${ecritureAlgebrique(-e)}$<br>`
    this.correction += `On réduit :<br>`
    this.correction += `$A=${miseEnEvidence(bonneReponse)}$`

    if (this.versionQcm) {
      this.question = `Soit ${definitionA}.<br>
    Une écriture simplifiée de $A$ est : `
      this.reponse = `$A=${bonneReponse}$`
      // Distracteurs basés sur des erreurs typiques
      this.distracteurs = [
        // Erreur 1 : oubli de changer le signe du 2nd membre → c au lieu de -c
        `$A=${reduirePolynomeDegre3(0, c, a + d, b + e, choixLettre)}$`,
        // Erreur 2 : oubli de changer le signe seulement sur x² → -c mais addition sur le reste
        `$A=${reduirePolynomeDegre3(0, -c, a + d, b + e, choixLettre)}$`,
        // Erreur 3 : erreur de signe sur les termes en x et constant mais pas sur x²
        `$A=${reduirePolynomeDegre3(0, c, a - d, b - e, choixLettre)}$`,
      ]
    } else {
      this.question = `Soit ${definitionA}.<br>Donner une expression simplifiée et réduite de $A$.`
      this.reponse = bonneReponse
    }
  }
}
