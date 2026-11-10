import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '6eaf5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Déterminer un pourcentage de pourcentage'
export const dateDePublication = '29/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Jean-Claude Lhote
 *
 */
export default class AutoQ2AGt2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(
    lieu: string,
    pourcentage1: number,
    pourcentage2: number,
    categorie1: string,
    categorie2: string,
    lieu2: string,
  ): void {
    const sol = (pourcentage1 * pourcentage2) / 10000
    const dist1 = (pourcentage1 * pourcentage2) / 1000
    const dist2 = pourcentage2 / 100 // ne pas prendre un prix Apres = à la remise
    const dist3 = (pourcentage1 - pourcentage2) / 100

    this.enonce = `Dans ${lieu}, il y a $${pourcentage1}\\,\\%$ de personnes qui ${categorie1} dont $${pourcentage2}\\,\\%$ ${categorie2}.<br>
    Quelle est la proportion de ${categorie2.split('sont ')[1]} dans ${lieu2} ?`

    this.correction = `Prendre $${pourcentage1}\\,\\%$ des personnes, c'est multiplier leur nombre par $\\dfrac{${texNombre(pourcentage1, 2)}}{100} = ${texNombre(pourcentage1 / 100, 2)}$.<br>
    $${texNombre(pourcentage2, 2)}\\,\\%$ de ces personnes ${categorie2}, soit $${texNombre(pourcentage2 / 100, 2)}$ fois le nombre des personnes qui ${categorie1}.<br>
    La proportion de ${categorie2.split('sont ')[1]} dans ${lieu2} est donc égale à  : $${texNombre(pourcentage1 / 100, 2)}\\times${texNombre(pourcentage2 / 100, 2)}= ${miseEnEvidence(texNombre(sol, 2))}$.`

    this.reponses = [
      `$${texNombre(sol, 2)}$`,
      `$${texNombre(dist1, 2)}$`,
      `$${texNombre(dist2, 2)}$`,
      `$${texNombre(dist3, 2)}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // Version de l'image : 500 élèves, 20 %  => 100
    this.appliquerLesValeurs(
      'une salle de cinéma',
      60,
      10,
      'ont moins de $25$ ans',
      'sont mineurs',
      'la salle',
    )
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    let compteur = 0
    do {
      const lieu = choice(['un cinéma', 'un stade', 'un parc d’attractions'])
      const pourcentage1 = choice([40, 50, 60, 70, 80])
      const pourcentage2 = choice([10, 20, 30])
      const categorie1 = choice([
        'ont moins de $25$ ans',
        'ont moins de $30$ ans',
        'ont moins de $35$ ans',
      ])
      const categorie2 = choice(['sont mineurs', 'sont étudiants'])
      this.appliquerLesValeurs(
        lieu,
        pourcentage1,
        pourcentage2,
        categorie1,
        categorie2,
        lieu.replace('un', 'le'),
      )
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
        /Quelle est la proportion de (.*) dans (.*) \?\s*$/,
        (_, categorie: string, lieu: string) =>
          this.interactif
            ? `La proportion de ${categorie} dans ${lieu}, sous forme décimale, est `
            : `Calculer, sous forme décimale, la proportion de ${categorie} dans ${lieu}.`,
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
