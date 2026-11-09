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

export const uuid = 'e1892'
export const refs = {
  'fr-fr': ['1A-S03-3', '2A-S3-3', 'BP1AUTO032'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const titre = "Lire la médiane d'une série sur une boîte à moustaches"
export const dateDePublication = '01/01/2026'
/**
 * @author Jean-claude Lhote
 */

export default class LireMedianeBoiteMoustachesQCM extends ExerciceQcmACourt {
  // Ceci est la fonction qui s'occupe d'écrire l'énoncé, la correction et les réponses
  // Elle factorise le code qui serait dupliqué dans versionAleatoire et versionOriginale
  private appliquerLesValeurs(serie: number[]): void {
    const maSerie = new Stat(serie)
    const moustache = maSerie.traceBoiteAMoustache({
      size: 10,
      height: 4,
      legendeOn: false,
      valeursOn: true,
      echelle: 1,
    })

    // Réorganiser les réponses pour mettre la bonne en premier
    this.reponses = [
      texNombre(maSerie.mediane(), 1),
      texNombre((maSerie.q1 + maSerie.q3) / 2, 1),
      texNombre(maSerie.q1, 0),
      texNombre(maSerie.q3, 0),
    ].map((r) => `$${r}$`)
    this.enonce = `Une série statistique est résumée par le diagramme en boîte ci-dessous.<br>Déterminer la valeur de la médiane de cette série.<br><br>
      ${moustache}`

    // Correction : explication simple, claire
    this.correction = `La médiane est la valeur qui partage la série statistique en deux parties égales.<br>
      D'après le diagramme en boîte, on a $Q_1=${texNombre(maSerie.q1, 1)}$ et $Q_3=${texNombre(maSerie.q3, 1)}$. La médiane se trouve au niveau du trait intermédiaire.<br>
      La médiane de la série est donc : $${miseEnEvidence(
        texNombre(maSerie.mediane(), 1),
      )}$.`
  }

  versionOriginale: () => void = () => {
    const maSerie = creerSerieDeQuartiles({
      q1: 30,
      mediane: 40,
      q3: 55,
      min: 10,
      max: 60,
      n: 40,
    })
    this.appliquerLesValeurs(maSerie)
  }

  versionAleatoire: () => void = () => {
    const n = 4 // Nombre de réponses différentes souhaitées
    do {
      const min = randint(1, 4) * 5
      const q1 = min + randint(1, 4) * 5
      const tot = randint(5, 8)
      const a = randint(2, 4)
      const b = tot / 2 !== a ? tot - a : tot - a + 1
      const mediane = q1 + a * 5
      const q3 = mediane + b * 5
      const max = Math.round(randint(q3 + 5, 100) / 5) * 5
      const maSerie = creerSerieDeQuartiles({
        q1,
        mediane,
        q3,
        min,
        max,
        n: 40,
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
