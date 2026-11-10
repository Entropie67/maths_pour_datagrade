// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 6df3d continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import { choice } from '../../lib/outils/arrayOutils'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
  reduirePolynomeDegre3,
  rienSi1,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { randint } from '../../modules/outils'
import ExerciceQcmA from '../ExerciceQcmA'
export const dateDePublication = '20/02/2026'
export const uuid = '6df3d'
// @Author Gilles Mora
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Réduire une expression littérale avec une parenthèse'
export default class PuissancesOld extends ExerciceQcmA {
  private appliquerLesValeurs(
    a: number,
    b: number,
    c: number,
    d: number,
    e: number,
    choixLettre: string,
  ): void {
    // Résultats corrects : -cx² + (a-d)x + (b-e)
    const reponse1 = -c
    const reponse2 = a - d
    const reponse3 = b - e

    // Énoncé
    this.enonce = `Soit $A= (${rienSi1(a)}${choixLettre}${ecritureAlgebrique(b)}) - (${rienSi1(c)}${choixLettre}^2${ecritureAlgebriqueSauf1(d)}${choixLettre}${ecritureAlgebrique(e)})$.<br>
    Une écriture simplifiée de $A$ est : `

    // Bonne réponse
    const bonneReponse = `$A=${reduirePolynomeDegre3(0, reponse1, reponse2, reponse3, choixLettre)}$`

    // Distracteurs basés sur des erreurs typiques
    // Erreur 1 : oubli de changer le signe du 2nd membre → c au lieu de -c
    const dist1 = `$A=${reduirePolynomeDegre3(0, c, a + d, b + e, choixLettre)}$`
    // Erreur 2 : oubli de changer le signe seulement sur x² → -c mais addition sur le reste
    const dist2 = `$A=${reduirePolynomeDegre3(0, -c, a + d, b + e, choixLettre)}$`
    // Erreur 3 : erreur de signe sur les termes en x et constant mais pas sur x²
    const dist3 = `$A=${reduirePolynomeDegre3(0, c, a - d, b - e, choixLettre)}$`

    this.reponses = [bonneReponse, dist1, dist2, dist3]

    // Correction détaillée
    this.correction = `On supprime les parenthèses en changeant les signes dans la deuxième parenthèse (précédée du signe $-$) :<br>`
    this.correction += `$A= ${rienSi1(a)}${choixLettre}${ecritureAlgebrique(b)} ${ecritureAlgebriqueSauf1(-c)}${choixLettre}^2${ecritureAlgebriqueSauf1(-d)}${choixLettre}${ecritureAlgebrique(-e)}$<br>`
    this.correction += `On réduit :<br>`
    this.correction += `$A=${miseEnEvidence(reduirePolynomeDegre3(0, reponse1, reponse2, reponse3, choixLettre))}$`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(3, 5, 2, -4, 7, 'x')
  }

  versionAleatoire: () => void = () => {
    const a = randint(-9, 9, [0, -1, 1])
    const b = randint(-9, 9, 0)
    const c = randint(-9, 9, [0, -1, 1])
    const d = randint(-9, 9, [0, -1, 1])
    const e = randint(-9, 9, 0)
    const choixLettre = choice(['a', 'b', 'c', 'x', 'y', 'z'])
    this.appliquerLesValeurs(a, b, c, d, e, choixLettre)
  }

  constructor() {
    super()
  }
}
