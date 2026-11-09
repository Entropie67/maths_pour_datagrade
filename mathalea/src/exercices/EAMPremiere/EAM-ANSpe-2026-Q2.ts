import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '046ba'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer avec un pourcentage'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ2ANs2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    volumeVisible: number,
    pourcentage: number,
  ): void {
    const coeff = 100 / pourcentage // 100/p : 20, 10 ou 5 (multiplicateur mental)
    const volumeTotal = volumeVisible * coeff // réponse correcte

    // Distracteurs (entiers garantis car volumeVisible est multiple de 20)
    const dist1 = (volumeVisible * pourcentage) / 100 // p % de la partie visible (mauvaise quantité)
    const dist2 = volumeTotal - volumeVisible // volume immergé (total − visible), confondu avec le total
    const dist3 = (volumeVisible * (100 - pourcentage)) / 100 // (100−p) % de la partie visible

    this.enonce = `Le volume de la partie visible d'un iceberg est d'environ $${pourcentage}\\,\\%$ de son volume total. <br>
    Si la partie visible d'un iceberg est de $${volumeVisible}\\,\\text{km}^3$, quel sera le volume total de cet iceberg ?`

    this.correction = `La partie visible représente $${pourcentage}\\,\\%$ du volume total.<br>
Pour obtenir $100\\,\\%$, on multiplie le volume visible par $${coeff}$, car $${coeff}\\times ${pourcentage}\\,\\% = 100\\,\\%$ :<br>
$\\begin{aligned}
V_{\\text{total}}&=${volumeVisible}\\times ${coeff}\\\\
&=${miseEnEvidence(`${texNombre(volumeTotal)}`)}\\,\\text{km}^3
\\end{aligned}$`

    this.reponses = [
      `$${texNombre(volumeTotal)}\\,\\text{km}^3$`,
      `$${texNombre(dist2)}\\,\\text{km}^3$`,
      `$${texNombre(dist1)}\\,\\text{km}^3$`,
      `$${texNombre(dist3)}\\,\\text{km}^3$`,
    ]
  }

  versionOriginale: () => void = () => {
    // Iceberg : 10 % du total, partie visible de 150 km³ → 1500 km³
    this.appliquerLesValeurs(150, 10)
  }

  versionAleatoire = () => {
    // Pont avec le mécanisme Can : si le méta a coché « sujet officiel »,
    // on produit la version originale figée au lieu d'un tirage aléatoire.
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }
    // Pas de do...while : les 4 propositions sont toujours distinctes et entières
    // pour pourcentage ∈ {5, 10, 20} et volumeVisible multiple de 20.
    const pourcentage = choice([5, 10, 20])
    const volumeVisible = choice([100, 120, 140, 160, 180, 200, 220, 240])
    this.appliquerLesValeurs(volumeVisible, pourcentage)
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /, quel sera le volume total de cet iceberg \?\s*$/,
        ', calculer le volume total de cet iceberg.',
      )
    // La bonne réponse du QCM est de la forme « $1\,000\,\text{km}^3$ » : on ne garde que le nombre
    this.reponseCourte = () =>
      this.reponses[0].replace(
        /^\$(.*?)\\,\\text\{km\}\^3\$$/,
        (_, volume: string) => volume.replace(/\\,/g, ''),
      )
    this.texteApresReponseCourte = ' $\\text{km}^3$'
    this.clavierReponseCourte = KeyboardType.clavierNumbers
  }
}
