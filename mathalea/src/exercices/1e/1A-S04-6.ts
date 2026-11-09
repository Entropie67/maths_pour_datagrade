import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import Stat from '../../lib/mathFonctions/Stat'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { creerSerieDeQuartiles } from '../../modules/outilsStat'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const dateDeModifImportante = '22/10/2026'

export const uuid = '26f17'
export const refs = {
  'fr-fr': ['1A-S04-6', '2A-S4-6'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre =
  "Lire une fréquence à partir d'un diagramme des fréquences cumulées croissantes"
export const dateDePublication = '01/01/2026'
/**
 * @author Jean-claude Lhote
 */

export default class LireFrequenceHistogrammeQCM extends ExerciceQcmACourt {
  // Ceci est la fonction qui s'occupe d'écrire l'énoncé, la correction et les réponses
  // Elle factorise le code qui serait dupliqué dans versionAleatoire et versionOriginale
  private appliquerLesValeurs(serie: number[]): void {
    const maSerie = new Stat(serie)
    const histogramme = maSerie.diagramme({
      cumul: true,
      barres: true,
      valuesOn: true,
      effectifsOn: false,
      percentVsEffectifs: true,
      titre: 'Diagramme des fréquences cumulées croissantes',
      labelHorizontal: 'Valeurs de la série',
    })
    const q1 = maSerie.q1
    const q3 = maSerie.q3
    const mediane = maSerie.mediane()
    const max = maSerie.max()

    this.reponses = [
      `${texNombre(q3, 0)}`,
      `${texNombre(q1, 0)}`,
      `${texNombre(mediane, 0)}`,
      `${texNombre(max, 0)}`,
    ].map((r) => `$${r}$`)
    this.enonce = `${histogramme}<br><br>Quelle est la valeur du $3$e quartile de la série statistique étudiée sur ce diagramme des fréquences cumulées croissantes ?`

    // Correction : explication simple, claire
    this.correction = `Le troisième quartile $Q_3$ est la plus petite valeur de la série statistique pour laquelle au moins $75\\,\\%$ des valeurs sont inférieures ou égales à $Q_3$.<br>
     Sur ce diagramme des fréquences cumulées croissantes, on lit que la fréquence cumulée atteint $75\\,\\%$ pour la valeur $${miseEnEvidence(texNombre(q3, 0))}$.<br>`
  }

  versionOriginale: () => void = () => {
    const maSerie: number[] = [1, 1, 2, 2, 3, 4, 5, 5, 5, 6, 6, 7, 8]
    this.appliquerLesValeurs(maSerie)
  }

  versionAleatoire: () => void = () => {
    const n = 4 // Nombre de réponses différentes souhaitées
    do {
      const min = randint(0, 1)
      const q1 = min + randint(1, 3) / 2
      const tot = randint(3, 6) / 2
      const a = randint(1, 3) / 2
      const b = tot / 2 !== a ? tot - a : tot - a + 1
      const mediane = q1 + a
      const q3 = mediane + b
      const max = randint(Math.ceil(q3), 8)
      const maSerie = creerSerieDeQuartiles({
        q1,
        mediane,
        q3,
        min,
        max,
        n: 12,
        isInteger: true,
      })
      this.appliquerLesValeurs(maSerie)
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
