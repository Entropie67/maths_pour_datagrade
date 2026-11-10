import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { reduireAxPlusB } from '../../../lib/outils/ecritures'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { context } from '../../../modules/context'
import FractionEtendue from '../../../modules/FractionEtendue'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const dateDePublication = '04/10/2026'

export const uuid = '1a978'

export const refs = {
  'fr-fr': ['can2L2-07', '1A-C13-3'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = true
export const amcType = 'qcmMono'
export const titre = 'Résoudre une équation produit nul'

/**
 * Résoudre (ax+b)(cx+d)=0, dont les deux solutions sont distinctes.
 * @author Gilles Mora
 */
export default class EquationProduitNul extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    // Clavier allégé : on ajoute les accolades et le point-virgule
    this.optionsChampTexte = {
      dataKeys: ['\\{#0\\}', ';'],
    }
    this.optionsDeComparaison = { ensembleDeNombres: true }
    this.versionQcmDisponible = true
    this.versionQcm = false
  }

  nouvelleVersion() {
    if (context.isAmc) this.versionQcm = true

    const a = randint(-5, 5, [0])
    const b = randint(-9, 9, [0])
    let c = randint(-5, 5, [0])
    let d = randint(-9, 9, [0])
    // Les deux solutions doivent être différentes et non opposées
    while (c * b === a * d || c * b === -a * d) {
      c = randint(-5, 5, [0])
      d = randint(-9, 9, [0])
    }
    const sol1 = new FractionEtendue(-b, a).simplifie()
    const sol2 = new FractionEtendue(-d, c).simplifie()
    const [petite, grande] =
      sol1.valeurDecimale < sol2.valeurDecimale ? [sol1, sol2] : [sol2, sol1]

    const equation = `$(${reduireAxPlusB(a, b)})(${reduireAxPlusB(c, d)})=0$`
    // Ensemble de solutions rangées dans l'ordre croissant.
    // Affiché (correction, QCM) : accolades à la hauteur des fractions et séparateur aéré
    const ensemble = (valeurs: FractionEtendue[], affiche = true) => {
      const contenu = [...valeurs]
        .sort((u, v) => u.valeurDecimale - v.valeurDecimale)
        .map((f) => f.texFractionSimplifiee)
      return affiche
        ? `\\left\\{${contenu.join('\\,;\\,')}\\right\\}`
        : `\\{${contenu.join(';')}\\}`
    }

    // Une solution de px+q=0, écrite x=…
    const solution = (p: number, q: number) =>
      `x=${new FractionEtendue(-q, p).simplifie().texFractionSimplifiee}`

    this.correction = `On reconnaît une équation produit nul.<br>
    ${equation}<br>
    $\\begin{array}{rcl}
    ${reduireAxPlusB(a, b)}=0 & \\text{ ou } & ${reduireAxPlusB(c, d)}=0\\\\[0.5em]
    ${solution(a, b)} & \\text{ ou } & ${solution(c, d)}
    \\end{array}$<br>
    Ainsi, $S=${miseEnEvidence(ensemble([petite, grande]))}$.`

    this.canEnonce = `Donner l'ensemble $S$ des solutions de l'équation ${equation}.`
    this.canReponseACompleter = '$S=\\ldots$'

    if (this.versionQcm) {
      this.question = `L'équation ${equation} a pour ensemble de solutions :`
      const bonne = ensemble([petite, grande])
      // Erreurs classiques ; on écarte les doublons et la bonne réponse
      const candidats = [
        ensemble([petite.oppose(), grande.oppose()]),
        // Inverses des solutions
        ensemble([sol1.inverse(), sol2.inverse()]),
        // Une solution correcte et l'opposé de l'autre solution
        ensemble([sol1, sol2.oppose()]),
        ensemble([petite.oppose(), grande]),
        ensemble([petite, grande.oppose()]),
      ]
      this.reponse = `$${bonne}$`
      this.distracteurs = [...new Set(candidats)]
        .filter((d) => d !== bonne)
        .slice(0, 3)
        .map((d) => `$${d}$`)
    } else {
      // En interactif, S= à la ligne devant le champ ; sur papier (PDF), consigne classique
      this.question = this.interactif
        ? `L'équation ${equation} a pour ensemble de solutions :<br>$S=$`
        : `Résoudre, dans $\\mathbb{R}$, l'équation ${equation}.`
      this.reponse = ensemble([petite, grande], false)
    }
  }
}
