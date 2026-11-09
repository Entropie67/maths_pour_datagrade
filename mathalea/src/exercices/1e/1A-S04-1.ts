import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import Stat from '../../lib/mathFonctions/Stat'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { creerSerieDeMoyenneEtEtendue } from '../../modules/outilsStat'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const dateDeModifImportante = '22/10/2026'

export const uuid = 'c02fd'
export const refs = {
  'fr-fr': ['1A-S04-1', '2A-S4-1', 'BP1AUTO024'],
  'fr-ch': ['9R1FA2B-5', '9R2FA2B-5', '9R3FA2B-5'],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre =
  "Calculer un effectif total à partir d'un diagramme en barres"
export const dateDePublication = '31/12/2025'
/**
 * @author Jean-claude Lhote
 */

export default class CalculEffectifQCM extends ExerciceQcmACourt {
  // Ceci est la fonction qui s'occupe d'écrire l'énoncé, la correction et les réponses
  // Elle factorise le code qui serait dupliqué dans versionAleatoire et versionOriginale
  private appliquerLesValeurs(
    serie: [number, number][] | number[],
    noteMax: number,
  ): void {
    const maSerie = new Stat(serie)
    const histogramme = maSerie.diagramme({
      cumul: false,
      barres: true,
      valuesOn: true,
      effectifsOn: false,
      titre: 'Notes obtenues par la classe de première',
      labelHorizontal: `Notes sur $${noteMax}$`,
      labelVertical: "Nombre d'élèves",
    })

    const n = maSerie.serie.length
    const listeTableau = maSerie.serieTableau

    const distracteur1 =
      Math.round(maSerie.serie.length / 4) * 4 !== n
        ? Math.round(maSerie.serie.length / 4) * 4
        : Math.round(maSerie.serie.length / 5) * 5 !== n
          ? Math.round(maSerie.serie.length / 5) * 5
          : n - 1
    const distracteur2 = listeTableau.length
    const distracteur3 = listeTableau
      .map(([note]) => Number(note))
      .reduce((a, b) => a + b)

    this.reponses = [
      `${texNombre(n, 0)}`,
      `${texNombre(distracteur1, 0)}`,
      `${texNombre(distracteur2, 0)}`,
      `${texNombre(distracteur3, 0)}`,
    ].map((r) => `$${r}$`)
    this.enonce = `Voici la répartition des notes sur $${noteMax}$ d'une classe de première.<br>
      ${histogramme}<br><br>
      Quel est l'effectif total de cette classe ?`

    // Correction : explication simple, claire
    this.correction = `L'effectif total est le nombre de notes représentées dans le diagramme en barres.<br>
      On peut le calculer en additionnant les effectifs de chaque barre.<br>
      Les effectifs sont : <br>${maSerie.serieTableau
        .map(([note, effectif]) => `$${effectif}$ pour la note $${note}$`)
        .join(',<br>')}.<br>
      Ici, on trouve un effectif total de $${maSerie.serieTableau
        .map(([_note, effectif]) => effectif)
        .join('+')}=${miseEnEvidence(n)}$ élèves.`
  }

  versionOriginale: () => void = () => {
    const maSerie: [number, number][] = [
      [1, 4],
      [2, 8],
      [3, 7],
      [4, 5],
      [5, 1],
    ]
    this.appliquerLesValeurs(maSerie, 5)
  }

  versionAleatoire: () => void = () => {
    const n = 4 // Nombre de réponses différentes souhaitées
    do {
      const noteMax = choice([10, 20])
      const maSerie = creerSerieDeMoyenneEtEtendue({
        mean: noteMax / 2,
        range: noteMax / 2,
        n: randint(24, 30),
        isInteger: true,
        gaussian: true,
      })
      this.appliquerLesValeurs(maSerie, noteMax)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.versionAleatoire()
  }
}
