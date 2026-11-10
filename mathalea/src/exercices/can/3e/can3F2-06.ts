import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { distracteursDistincts } from '../../../lib/interactif/qcmDistractors'
import { choice } from '../../../lib/outils/arrayOutils'
import { ecritureAlgebrique } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = "Calculer l'image d'une fraction par une fonction affine"
export const interactifReady = true

export const amcReady = true
export const amcType = 'AMCNum'
export const dateDePublication = '23/07/2025'
/**
 * @author Gilles Mora + ia (claude)
  *

*/
export const uuid = 'adb5c'

export const refs = {
  'fr-fr': ['can3F2-06', 'can2F11-05'],
  'fr-ch': ['NR'],
}
export default class CalculImageParFonctionAffineFraction extends ExerciceSimple {
  constructor() {
    super()
    this.optionsDeComparaison = {
      fractionEgale: true,
      nombreDecimalSeulement: true,
    }
    this.nbQuestions = 1
    this.versionQcmDisponible = true
    this.typeExercice = 'simple'
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    this.optionsChampTexte = { texteAvant: '<br> ' }
  }

  nouvelleVersion() {
    // Coefficient directeur a (entier non nul)
    const a = this.quotaRandint('a', -6, 6, [0])

    // Ordonnée à l'origine b (entier)
    const b = this.quotaRandint('b', -8, 8, [0])

    // Nom de la fonction
    const nomF = choice(['f', 'g', 'h', 'u', 'v', 'w', 'p', 'm', 't', 'k'])

    // Choix de la fraction x parmi les fractions simples
    const fractionsSimples = [
      [1, 3],
      [2, 3],
      [3, 4],
      [1, 4],
      [2, 5],
      [3, 5],
      [4, 5],
      [5, 4],
      [5, 3],
      [4, 3],
      [3, 2],
      [5, 2],
      [7, 3],
      [7, 4],
      [1, 7],
    ]

    const [num, den] = this.quotaChoice('fraction', fractionsSimples)
    const signe = this.quotaChoice('signe', [-1, 1])

    // Création de la fraction x
    const fractionX = new FractionEtendue(signe * num, den)

    // Calcul du résultat : f(x) = ax + b
    // f(fractionX) = a * fractionX + b
    const aFoisX = new FractionEtendue(a * signe * num, den)
    const resultat = aFoisX.ajouteEntier(b)

    // Construction de la question
    this.question = `Soit $${nomF}$ la fonction définie par : $${nomF}(x)=${a === 1 ? '' : a === -1 ? '-' : a}x${ecritureAlgebrique(b)}$.<br>`

    if (this.versionQcm) {
      this.question += `L'image de $${fractionX.texFractionSimplifiee}$ par la fonction $${nomF}$ est :`
    } else {
      this.question += `Quelle est l'image de $${fractionX.texFractionSimplifiee}$ par la fonction $${nomF}$ ?`
    }

    // Construction de la correction
    this.correction = `Comme $${nomF}(x)=${a === 1 ? '' : a === -1 ? '-' : a}x${ecritureAlgebrique(b)}$, on a :<br>`
    this.correction += '$\\begin{aligned}'
    this.correction += `${nomF}\\left(${fractionX.texFractionSimplifiee}\\right)`
    this.correction += `&=${a === 1 ? '' : a === -1 ? '-' : `${a}\\times`} ${fractionX.ecritureParentheseSiNegatif}${ecritureAlgebrique(b)}\\\\`

    // Étape intermédiaire : calcul de a × fraction
    if (a === 1) {
      this.correction += `&=${fractionX.texFractionSimplifiee}${ecritureAlgebrique(b)}\\\\`
    } else if (a === -1) {
      this.correction += `&=${fractionX.oppose().texFractionSimplifiee}${ecritureAlgebrique(b)}\\\\`
    } else {
      this.correction += `&=${aFoisX.texFractionSimplifiee}${ecritureAlgebrique(b)}\\\\`
    }

    // Résultat final
    this.correction += `&=${miseEnEvidence(resultat.texFractionSimplifiee)}`
    this.correction += '\\end{aligned}$'

    this.reponse = resultat.texFractionSimplifiee

    // Réponse selon le format
    if (this.versionQcm) {
      this.reponse = '$' + this.reponse + '$'

      // Création des distracteurs
      const distracteur1 = new FractionEtendue(
        signe * num,
        den * a,
      ).ajouteEntier(b) // Erreur : x/(a×den) + b
      const distracteur2 = new FractionEtendue(
        a * signe * num,
        den,
      ).ajouteEntier(-b) // Erreur : ax - b au lieu de ax + b
      const distracteur3 = new FractionEtendue(signe * num + a * den, den) // Erreur : (x + a)/den au lieu de ax + b

      // Un distracteur peut valoir la bonne réponse (a = 1, par exemple) ou un autre distracteur :
      // il est alors remplacé, sans tirage aléatoire supplémentaire.
      this.distracteurs = distracteursDistincts(
        String(this.reponse),
        [
          `$${distracteur1.texFractionSimplifiee}$`,
          `$${distracteur2.texFractionSimplifiee}$`,
          `$${distracteur3.texFractionSimplifiee}$`,
        ],
        [
          `$${resultat.ajouteEntier(1).texFractionSimplifiee}$`,
          `$${resultat.ajouteEntier(-1).texFractionSimplifiee}$`,
          `$${resultat.oppose().texFractionSimplifiee}$`,
        ],
      )
    }
  }
}
