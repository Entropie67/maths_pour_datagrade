// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 4ba2a continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import Stat from '../../lib/mathFonctions/Stat'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { creerSerieDeMoyenneEtEtendue } from '../../modules/outilsStat'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '4ba2a'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Calculer le pourcentage d'élèves à partir d'un diagramme en barres"
export const dateDePublication = '31/12/2025'
/**
 * @author Jean-claude Lhote
 */

export default class CalculPourcentageEtMoyenneQCMOld extends ExerciceQcmA {
  // Ceci est la fonction qui s'occupe d'écrire l'énoncé, la correction et les réponses
  // Elle factorise le code qui serait dupliqué dans versionAleatoire et versionOriginale
  private appliquerLesValeurs(
    serie: [number, number][] | number[],
    noteMax: number,
  ): void {
    const valeurCible = noteMax / 2
    const maSerie = new Stat(serie)
    const histogramme = maSerie.diagramme({
      cumul: false,
      barres: true,
      valuesOn: true,
      titre: 'Notes obtenues par la classe de première',
      labelHorizontal: `Notes sur $${noteMax}$`,
      labelVertical: "Nombre d'élèves",
    })
    const effectifCible = maSerie.serieTableau
      .filter(([note]) => Number(note) >= valeurCible)
      .reduce((acc, [, effectif]) => acc + effectif, 0)
    const n = maSerie.serie.length

    const pourCent = Math.round((effectifCible / n) * 100)
    const distracteur1 = choice(
      [pourCent - 10, pourCent + 10, pourCent - 15, pourCent + 15].filter(
        (v) => v > 0 && v < 100,
      ),
      pourCent,
    )
    const distracteur2 = choice(
      [pourCent - 5, pourCent + 5, pourCent - 20, pourCent + 20].filter(
        (v) => v > 0 && v < 100,
      ),
      [pourCent, distracteur1],
    )
    const distracteur3 = choice(
      [
        pourCent - 10,
        pourCent + 10,
        pourCent - 15,
        pourCent + 15,
        pourCent - 5,
        pourCent + 5,
        pourCent - 20,
        pourCent + 20,
      ].filter((v) => v > 0 && v < 100),
      [pourCent, distracteur1, distracteur2],
    )

    this.reponses = [
      `${texNombre(pourCent, 0)}~\\%`,
      `${texNombre(distracteur1, 0)}~\\%`,
      `${texNombre(distracteur2, 0)}~\\%`,
      `${texNombre(distracteur3, 0)}~\\%`,
    ].map((r) => `$${r}$`)
    this.enonce = `Voici la répartition des notes sur $${noteMax}$ d'une classe de première.<br>
      ${histogramme}<br><br>
      Quel est le pourcentage d'élèves ayant obtenu la moyenne ?`

    // Correction : explication simple, claire
    this.correction = `Le pourcentage d'élèves ayant obtenu la moyenne est calculé en divisant l'effectif des élèves ayant obtenu une note supérieure ou égale à la moyenne par l'effectif total, puis en multipliant par $100$.<br>
      L'effectif total est le nombre de notes représentées dans le diagramme en barres.<br>
      Ici, on trouve un effectif total de $${n}$ élèves.<br>
      L'effectif des élèves ayant obtenu une note supérieure ou égale à la moyenne est de $${effectifCible}$.<br>
      $\\dfrac{${effectifCible}}{${n}} \\times 100 = ${pourCent}$.<br>
      Donc le pourcentage est de $${miseEnEvidence(pourCent + `~\\%`)}$.`
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
        n: choice([20, 25, 10]),
        isInteger: true,
        gaussian: true,
      })
      this.appliquerLesValeurs(maSerie, noteMax)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.versionAleatoire()
  }
}
