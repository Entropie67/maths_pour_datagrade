import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import Stat from '../../lib/mathFonctions/Stat'
import { choisitNombresEntreMetN } from '../../lib/outils/aleatoires'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const dateDeModifImportante = '22/10/2026'

export const uuid = '3a18e'
export const refs = {
  'fr-fr': ['1A-S04-5', '2A-S4-5', 'BP1AUTO040'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre = "Calculer une moyenne à partir d'un diagramme en barres"
export const dateDePublication = '01/01/2026'
/**
 * @author Jean-claude Lhote
 */

export default class CalculMoyenneHistogrammeQCM extends ExerciceQcmACourt {
  // Correction de la saisie libre : la moyenne n'y est pas arrondie au millième
  private correctionSaisie = ''
  private reponseSaisie = ''

  // Ceci est la fonction qui s'occupe d'écrire l'énoncé, la correction et les réponses
  // Elle factorise le code qui serait dupliqué dans versionAleatoire et versionOriginale
  private appliquerLesValeurs(serie: [number, number][]): void {
    const maSerieQ = new Stat(serie, true, false)
    const maSerie = new Stat(serie)
    const n = maSerie.serie.length
    const values = maSerie.serieTriee()
    const histogramme = maSerieQ.diagramme({
      cumul: false,
      barres: true,
      valuesOn: true,
      titre: 'Diagramme de la série statistique étudiée',
      labelHorizontal: 'Valeurs de la série',
    })
    const moyenne = maSerie.moyenne()
    const q1 = maSerie.q1
    const q3 = maSerie.q3
    const mediane = maSerie.mediane()
    const somme = values.reduce((a, b) => a + b, 0)

    this.reponseSaisie = texNombre(moyenne, 4)
    this.reponses = [
      `${texNombre(moyenne, 3)}`,
      `${texNombre(q1, 3)}`,
      `${texNombre(mediane, 3)}`,
      `${texNombre(q3, 3)}`,
    ].map((r) => `$${r}$`)
    this.enonce = `${histogramme}<br><br>Quelle est la moyenne de la série statistique étudiée sur ce diagramme en barres ?`

    // Correction : explication simple, claire
    const corrige = (
      moyenneMise: string,
    ) => `La moyenne est la somme des valeurs divisée par le nombre de valeurs.<br>
    Il y a un total de $${n}$ valeurs.<br>
    En regardant le diagramme, on obtient la somme suivante des valeurs :<br>
    $${maSerie.serieTableau.map(([v, e]) => `${e} \\times ${v}`).join('+')}=${texNombre(somme, 0)}$.<br>
    Donc la moyenne est : $\\dfrac{${somme}}{${n}}=${miseEnEvidence(moyenneMise)}$.`
    this.correction = corrige(texNombre(moyenne, 3))
    this.correctionSaisie = corrige(texNombre(moyenne, 4))
  }

  versionOriginale: () => void = () => {
    const maSerie: [number, number][] = [
      [3, 2],
      [8, 8],
      [13, 7],
      [18, 4],
    ]
    this.appliquerLesValeurs(maSerie)
  }

  versionAleatoire: () => void = () => {
    const n = 4 // Nombre de réponses différentes souhaitées
    do {
      const nbNombres = choice([8, 10, 16, 20])
      const nombres = choisitNombresEntreMetN(2, 6, 4).sort((a, b) => a - b)
      const maSerie = nombres.map((val) => [val, 0] as [number, number])
      for (let i = 0; i < nbNombres; i++) {
        maSerie[choice([0, 1, 2, 3])][1]++
      }
      this.appliquerLesValeurs(maSerie)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  // Ici il n'y a rien à faire, on appelle juste la version aleatoire (pour un qcm aleatoirisé, c'est le fonctionnement par défaut)
  constructor() {
    super()
    this.compareReponseCourte = (saisie, reponse) =>
      fonctionComparaison(saisie, reponse, { nombreDecimalSeulement: true })
    // Les tirages ont au plus 4 décimales : la saisie attend la valeur exacte
    this.reponseCourte = () => this.reponseSaisie
    this.correctionCourte = () => this.correctionSaisie
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.versionAleatoire()
  }
}
