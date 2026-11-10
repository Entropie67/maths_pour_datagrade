import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '13c79'
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
export default class AutoQ2FMt2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    total: number,
    p: number,
    distracteurNul: string,
  ): void {
    this.enonce = `Un lycée compte $${total}$ élèves. L'effectif augmente de $${p}\\,\\%$ l'année suivante.<br>`
    this.enonce += `Le nombre d'élèves est donc multiplié par :`

    const coeff = `1,0${p}` // ex : 1,05 (bonne réponse)
    const d1 = `${p}` // le pourcentage pris tel quel
    const d2 = `0,0${p}` // le taux écrit en décimal
    const d3 = distracteurNul // troisième distracteur (variable selon la version)

    this.reponses = [`$${coeff}$`, `$${d1}$`, `$${d2}$`, `$${d3}$`]

    this.correction = `Augmenter un effectif de $${p}\\,\\%$ revient à le multiplier par un coefficient multiplicateur égal à : <br>`
    this.correction += `$1 + \\dfrac{${p}}{100} = 1 + ${texNombre(p / 100, 2)} = ${miseEnEvidence(coeff)}$.`
  }

  versionOriginale: () => void = () => {
    // Valeurs strictes du sujet de l'image : 500 élèves, +5 %  => 1,05 (distracteur 25)
    this.appliquerLesValeurs(500, 5, '25')
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      // Pourcentage à un chiffre (coefficient du type 1,0p, comme l'image)
      const p = randint(2, 9)
      const total = choice([400, 500, 600, 700, 800])

      // Distracteur "1,p" : erreur 1 + p/10 au lieu de 1 + p/100 (ex : 1,4 pour 4 %)
      this.appliquerLesValeurs(total, p, `1,${p}`)
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
      this.enonce.replace(
        /Le nombre d'élèves est donc multiplié par :\s*$/,
        this.interactif
          ? "Le nombre d'élèves est donc multiplié par "
          : 'Déterminer le coefficient multiplicateur associé à cette augmentation.',
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
