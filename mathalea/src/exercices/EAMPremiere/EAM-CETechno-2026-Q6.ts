import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'

import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = '643a5'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Déterminer la médiane à partir d'un tableau de données"
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '08/11/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ6ANt2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(notes: number[], effectifs: number[]): void {
    // Calcul de l'effectif total et des effectifs cumulés croissants (ECC)
    const ecc: number[] = []
    let sum = 0
    for (const eff of effectifs) {
      sum += eff
      ecc.push(sum)
    }
    const N = ecc[ecc.length - 1]

    // Rangs de la médiane (on sait que N est pair grâce au filtre de la version aléatoire)
    const rang1 = N / 2
    const rang2 = N / 2 + 1

    // On trouve l'indice de la note médiane grâce aux ECC
    const indexMediane = ecc.findIndex((val) => val >= rang2)
    const mediane = notes[indexMediane]

    // Calcul des distracteurs calqués sur les erreurs classiques
    const mean = notes.reduce((acc, val, i) => acc + val * effectifs[i], 0) / N
    const distMoyenne = texNombre(mean, 2) // Erreur : calcule la moyenne pondérée
    const distMilieuNotes = texNombre((notes[1] + notes[2]) / 2, 1) // Erreur : moyenne des 2 notes centrales du tableau
    const distMilieuEff = texNombre((effectifs[1] + effectifs[2]) / 2, 1) // Erreur : moyenne des 2 effectifs centraux

    // Construction du tableau de l'énoncé en LaTeX
    const tableauTex = `$\\def\\arraystretch{1.5}\\begin{array}{|c|c|c|c|c|}
    \\hline
    \\text{Note} & ${notes[0]} & ${notes[1]} & ${notes[2]} & ${notes[3]} \\\\
    \\hline
    \\text{Nombre d'élèves} & ${effectifs[0]} & ${effectifs[1]} & ${effectifs[2]} & ${effectifs[3]} \\\\
    \\hline
    \\end{array}$`

    // Construction du tableau de la correction avec la ligne ECC
    const tableauCorrTex = `$\\def\\arraystretch{1.5}\\begin{array}{|c|c|c|c|c|}
    \\hline
    \\text{Note} & ${notes[0]} & ${notes[1]} & ${notes[2]} & ${notes[3]} \\\\
    \\hline
    \\text{Nombre d'élèves} & ${effectifs[0]} & ${effectifs[1]} & ${effectifs[2]} & ${effectifs[3]} \\\\
    \\hline
    \\text{Effectifs cumulés croissants} & ${ecc[0]} & ${ecc[1]} & ${ecc[2]} & ${ecc[3]} \\\\
    \\hline
    \\end{array}$`

    this.enonce = `Voici les notes obtenues dans une classe lors d'un contrôle en mathématiques.<br><br>`
    this.enonce += `${tableauTex}<br><br>`
    this.enonce += `La note médiane de ce contrôle est :`

    // Correction ultra-simplifiée
    this.correction = `Pour déterminer la médiane, il est très utile de rajouter une ligne avec les effectifs cumulés croissants (E.C.C.) au tableau :<br><br>`
    this.correction += `${tableauCorrTex}<br><br>`
    this.correction += `L'effectif total est  $N = ${N}$ élèves.<br>`
    this.correction += `Ce nombre étant pair, une médiane est la moyenne entre la $${rang1}^{\\text{e}}$ et la $${rang2}^{\\text{e}}$ note.<br>`
    this.correction += `En lisant la ligne des effectifs cumulés croissants, on observe que la $${rang1}^{\\text{e}}$ et la $${rang2}^{\\text{e}}$ note valent toutes les deux $${mediane}$.<br>`
    this.correction += `La médiane est donc $${miseEnEvidence(texNombre(mediane, 1))}$.`

    this.reponses = [
      `$${texNombre(mediane, 1)}$`,
      `$${distMilieuNotes}$`,
      `$${distMoyenne}$`,
      `$${distMilieuEff}$`,
    ]
  }

  versionOriginale: () => void = () => {
    // Les valeurs exactes du tableau de l'image (N = 30, médiane = 12)
    this.appliquerLesValeurs([7, 10, 12, 14], [5, 7, 8, 10])
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
      // Génération de 4 notes croissantes distinctes
      const notes: number[] = []
      let currentNote = randint(4, 8)
      for (let i = 0; i < 4; i++) {
        notes.push(currentNote)
        currentNote += randint(1, 4)
      }

      // On décide aléatoirement si la médiane tombera dans la 2ème ou la 3ème colonne
      const cibleColonne = choice([1, 2])

      let effectifs: number[] = []
      if (cibleColonne === 1) {
        // Pour que la médiane soit dans la 2e colonne, on charge un peu plus le début du tableau
        effectifs = [
          randint(5, 10),
          randint(6, 12),
          randint(2, 7),
          randint(2, 6),
        ]
      } else {
        // Pour que la médiane soit dans la 3e colonne, on charge un peu plus la fin du tableau
        effectifs = [
          randint(2, 7),
          randint(4, 9),
          randint(6, 12),
          randint(3, 8),
        ]
      }

      // Filtrage strict : on vérifie que N est pair ET que les deux valeurs centrales sont bien dans la colonne ciblée
      const N = effectifs.reduce((acc, val) => acc + val, 0)
      if (N % 2 === 0) {
        let sum = 0
        const ecc = effectifs.map((eff) => {
          sum += eff
          return sum
        })
        const index1 = ecc.findIndex((val) => val >= N / 2)
        const index2 = ecc.findIndex((val) => val >= N / 2 + 1)

        if (index1 === index2 && index1 === cibleColonne) {
          this.appliquerLesValeurs(notes, effectifs)
          compteur++
        }
      }
    } while (
      compteur < 100 &&
      numEssais < 1000 &&
      !aLeBonNombreDePropsDifferentes(this, 4, true)
    )
  }

  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Seule, la question reste un QCM : c'est la composition qui choisit la saisie libre.
    this.sup3 = true
    this.enonceCourt = () =>
      this.enonce.replace(
        /La note médiane de ce contrôle est :\s*$/,
        this.interactif
          ? 'La note médiane de ce contrôle est '
          : 'Déterminer la note médiane de ce contrôle.',
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = '.'
  }
}
