// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid b12a0 continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'

export const titre = 'Comparer deux réels positifs à partir de leur rapport'
export const dateDePublication = '17/07/2026'
export const uuid = 'b12a0'

export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'

/**
 * Comparer deux réels strictement positifs à partir de la valeur de leur rapport.
 * @author Stéphane Guyon
 */
export default class ComparerAvecUnRapportOld extends ExerciceQcmA {
  private appliquerLesValeurs(
    valeurRapport: number,
    rapport: 'aSurB' | 'bSurA',
  ): void {
    const valeur = texNombre(valeurRapport, 1)
    const numerateur = rapport === 'aSurB' ? 'a' : 'b'
    const denominateur = rapport === 'aSurB' ? 'b' : 'a'
    const aSuperieurAB =
      (rapport === 'aSurB' && valeurRapport > 1) ||
      (rapport === 'bSurA' && valeurRapport < 1)
    const comparaison = aSuperieurAB ? 'a > b' : 'a < b'
    const comparaisonFausse = aSuperieurAB ? 'a < b' : 'a > b'
    const comparaisonLargeFausse = aSuperieurAB
      ? 'a\\leqslant b'
      : 'a\\geqslant b'
    const comparaisonRapport = valeurRapport > 1 ? '>1' : '<1'
    const ordreMots = valeurRapport > 1 ? 'supérieur au' : 'inférieur au'

    this.enonce = `$a$ et $b$ sont des réels strictement positifs.<br>
      On sait que $\\dfrac{${numerateur}}{${denominateur}}=${valeur}$.<br>
      On peut en déduire que :`

    this.reponses = [
      `$${comparaison}$`,
      '$a = b$',
      `$${comparaisonFausse}$`,
      `$${comparaisonLargeFausse}$`,
    ]

    this.correction = `Comme $\\dfrac{${numerateur}}{${denominateur}}=${valeur}${comparaisonRapport}$ et que $${denominateur}>0$, le numérateur $${numerateur}$ est ${ordreMots} dénominateur $${denominateur}$.<br><br>
      On en déduit que $${miseEnEvidence(comparaison)}$.`
  }

  versionAleatoire = (): void => {
    const valeurRapport = randint(4, 16, [5, 10]) / 10
    this.appliquerLesValeurs(valeurRapport, choice(['aSurB', 'bSurA']))
  }

  constructor() {
    super()
    this.besoinFormulaireCaseACocher = false
    this.options.vertical = true
    this.versionAleatoire()
  }
}
