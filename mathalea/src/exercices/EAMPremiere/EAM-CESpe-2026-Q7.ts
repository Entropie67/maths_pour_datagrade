import { tableauColonneLigne } from '../../lib/2d/tableau'
import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import FractionEtendue from '../../modules/FractionEtendue'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'd376c'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Calculer une probabilité à partir d'une table de fréquences"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '08/11/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ7CEs2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    a: number,
    b: number,
    c: number,
    d: number,
  ): void {
    const total = a + b + c + d
    const totalPlus16 = c + d

    // Tableau de l'énoncé (avec la case vide pour la spécialité Maths > 16 ans)
    const tableauTex = tableauColonneLigne(
      [
        '',
        '\\text{\\textbf{$16$ ans ou moins}}',
        '\\text{\\textbf{Plus de $16$ ans}}',
      ],
      [
        '\\text{\\textbf{Suivent la spé Mathématiques}}',
        '\\text{\\textbf{Ne suivent pas la spé Mathématiques}}',
      ],
      [a.toString(), '', b.toString(), d.toString()],
    )

    // Nouveau tableau complet pour la correction avec les lignes et colonnes Total
    const tableauCorrectionTex = tableauColonneLigne(
      [
        '',
        '\\text{\\textbf{$16$ ans ou moins}}',
        '\\text{\\textbf{Plus de $16$ ans}}',
        '\\text{\\textbf{Total}}',
      ],
      [
        '\\text{\\textbf{Suivent la spé Mathématiques}}',
        '\\text{\\textbf{Ne suivent pas la spé Mathématiques}}',
        '\\text{\\textbf{Total}}',
      ],
      [
        a.toString(),
        c.toString(),
        (a + c).toString(),
        b.toString(),
        d.toString(),
        (b + d).toString(),
        (a + b).toString(),
        (c + d).toString(),
        total.toString(),
      ],
    )

    this.enonce = `Ce tableau donne les résultats partiels d'un sondage dans une classe de première comptant $${total}$ élèves :<br><br>`
    this.enonce += `${tableauTex}<br><br>`
    this.enonce += `On interroge un élève de cette classe au hasard.<br>`
    this.enonce += `La probabilité que ce soit un élève qui suive la spécialité Mathématiques sachant qu'il est âgé de plus de $16$ ans est :`

    const fracCorrecte = new FractionEtendue(c, totalPlus16)

    this.correction = `On sait que la classe compte $${total}$ élèves au total.<br>`
    this.correction += `On peut compléter le tableau avec les lignes et colonnes «\u00a0Total\u00a0» :<br><br>`
    this.correction += `${tableauCorrectionTex}<br><br>`

    this.correction += `On cherche la probabilité qu'un élève suive la spécialité Mathématiques sachant qu'il a plus de $16$ ans.<br>`
    this.correction += `L'univers de cette probabilité conditionnelle est restreint aux élèves de plus de $16$ ans (ils sont $${totalPlus16}$).<br>`
    this.correction += `Parmi eux, $${c}$ suivent la spécialité Mathématiques.<br>`
    this.correction += `La probabilité est donc : $\\dfrac{${c}}{${totalPlus16}} = ${miseEnEvidence(fracCorrecte.texFractionSimplifiee)}$.`

    // Génération des distracteurs ciblés sur les erreurs classiques
    const dist1 = new FractionEtendue(c, a + c) // Erreur : proba conditionnelle inversée
    const dist2 = new FractionEtendue(c, total) // Erreur : intersection au lieu de conditionnelle
    const dist3 = c // Erreur : donne juste l'effectif manquant sans faire de fraction

    this.reponses = [
      `$${fracCorrecte.texFractionSimplifiee}$`,
      `$${dist1.texFractionSimplifiee}$`,
      `$${dist2.texFractionSimplifiee}$`,
      `$${dist3}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // Les valeurs du tableau de l'image source (Total=25, a=8, b=7, d=4, d'où c=6)
    // Donne 6/10 qui se simplifie bien en 3/5
    this.appliquerLesValeurs(8, 7, 6, 4)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    let numEssais = 0
    do {
      // Sans tirage valide à cette itération, le test ci-dessous ne doit pas juger les réponses d'un tirage précédent.
      this.reponses = []
      numEssais++
      // Génération aléatoire d'effectifs réalistes
      const a = randint(5, 12)
      const b = randint(5, 12)
      const c = randint(4, 12)
      const d = randint(3, 10)

      // Force de manière stricte le fait qu'il y ait une simplification de fraction sur la bonne réponse
      if (pgcd(c, c + d) > 1) {
        this.appliquerLesValeurs(a, b, c, d)
        compteur++
      }
    } while (
      compteur < 100 &&
      numEssais < 500 &&
      !aLeBonNombreDePropsDifferentes(this, 4, true)
    )
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, {
        fractionEgale: true,
        nombreDecimalSeulement: true,
      })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /^(.*)La probabilité (que ce soit un élève qui suive la spécialité Mathématiques sachant qu'il est âgé de plus de \$16\$ ans) est :\s*$/s,
        (_, debut: string, condition: string) =>
          this.interactif
            ? `${debut}La probabilité ${condition} est `
            : `${debut}Déterminer la probabilité ${condition}.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierDeBaseAvecFraction
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
