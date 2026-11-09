import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteGras } from '../../lib/outils/embellissements'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '97723'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer un pourcentage de $150$'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ2FMns2026 extends ExerciceQcmACourt {
  // p : le pourcentage (10, 20, 30...)
  // dist : les trois distracteurs propres à ce cas.
  private appliquerLesValeurs(p: number, dist: number[]): void {
    const reponse = p * 1.5
    const moitieP = p / 2
    const k = p / 10

    this.enonce = `$${p}\\,\\%$ de $150$ est égal à :`

    // Construction de la Méthode 1 (Passage par 10%)
    let methode1 = ''
    if (p === 10) {
      methode1 = `${texteGras('Méthode $1$ :')}<br>
Prendre $10\\,\\%$ de $150$ revient à diviser $150$ par $10$, ce qui donne $${miseEnEvidence('15')}$.`
    } else {
      methode1 = `${texteGras('Méthode $1$ :')}<br>
Prendre $10\\,\\%$ de $150$ revient à diviser $150$ par $10$, ce qui donne $15$.<br>
Pour obtenir $${p}\\,\\%$ de $150$, on multiplie ce résultat par $${k}$ :<br>
$${k} \\times 15 = ${miseEnEvidence(String(reponse))}$.`
    }

    // Construction de la Méthode 2 (Décomposition 100 + 50)
    const methode2 = `${texteGras('Méthode $2$ :')}<br>
Pour calculer $${p}\\,\\%$ de $150$, on peut décomposer $150$ en $100 + 50$.<br>
$\\bullet$ $${p}\\,\\%$ de $100$ est égal à $${p}$.<br>
$\\bullet$ $50$ représentant la moitié de $100$, $${p}\\,\\%$ de $50$ correspond à la moitié de $${p}$, soit $${moitieP}$.<br>
Il suffit ensuite d'additionner ces deux résultats : $${p} + ${moitieP} = ${miseEnEvidence(String(reponse))}$.`

    // Assemblage de la correction finale
    this.correction = `Il y a plusieurs façons de calculer ce pourcentage :<br><br>
${methode1}<br><br>
${methode2}`

    // Correct en premier (le moteur mélange les propositions).
    this.reponses = [
      `$${reponse}$`,
      `$${dist[0]}$`,
      `$${dist[1]}$`,
      `$${dist[2]}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // 30 % de 150 = 45 ; distracteurs originaux de l'image : 15, 30, 60.
    this.appliquerLesValeurs(30, [15, 30, 60])
  }

  versionAleatoire: () => void = () => {
    // Pont avec le mécanisme Can : « sujet officiel » => version originale figée.
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    // [pourcentage, [distracteurs]]
    // Les distracteurs sont choisis pour être cohérents avec des erreurs courantes.
    const donnees: [number, number[]][] = [
      [10, [5, 10, 30]], // Rép: 15
      [20, [15, 20, 45]], // Rép: 30
      [30, [15, 30, 60]], // Rép: 45
      [40, [30, 40, 75]], // Rép: 60
      [60, [60, 75, 105]], // Rép: 90
      [70, [70, 90, 120]], // Rép: 105
      [80, [80, 105, 135]], // Rép: 120
      [90, [90, 120, 150]], // Rép: 135
    ]

    let compteur = 0
    do {
      const [p, dist] = choice(donnees)
      this.appliquerLesValeurs(p, dist)
      compteur++
    } while (compteur < 100 && !aLeBonNombreDePropsDifferentes(this, 4, true))
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(/^(.*) est égal à :\s*$/, (_, groupe: string) =>
        this.interactif ? `${groupe} est égal à ` : `Calculer ${groupe}.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
