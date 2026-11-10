// Version archivée : conservée pour que les liens (sujets et corrigés)
// déjà partagés avec l'uuid 0ca7a continuent d'afficher les mêmes
// valeurs. Ne plus la modifier : toute correction va dans la version courante.
import Stat from '../../lib/mathFonctions/Stat'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { creerSerieDeQuartiles } from '../../modules/outilsStat'
import { nombreElementsDifferents } from '../ExerciceQcm'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '0ca7a'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['NR'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  "Lire un écart interquartile d'une série en boîte à moustaches"
export const dateDePublication = '31/12/2025'
/**
 * @author Jean-claude Lhote
 */

export default class LireEcartTypeBoiteMoustachesQCMOld extends ExerciceQcmA {
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
      texNombre(maSerie.ecartInterQuartile(), 0),
      texNombre(maSerie.etendue(), 0),
      texNombre(maSerie.max() - maSerie.quartiles().q1, 0),
      texNombre(maSerie.mediane() - maSerie.quartiles().q1, 0),
    ].map((r) => `$${r}$`)
    this.enonce = `Une série statistique est résumée par le diagramme en boîte ci-dessous, l'utiliser pour donner la valeur de l'écart interquartile de cette série.<br>
      ${moustache}`

    // Correction : explication simple, claire
    this.correction = `L'écart interquartile est la différence entre le troisième quartile et le premier quartile.<br>
      D'après le diagramme en boîte, on a $Q_3 = ${maSerie.quartiles().q3}$ et $Q_1 = ${maSerie.quartiles().q1}$.<br>
      Donc l'écart interquartile est $Q_3 - Q_1 = ${maSerie.quartiles().q3} - ${maSerie.quartiles().q1} = ${miseEnEvidence(maSerie.ecartInterQuartile())}$.`
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
    this.versionAleatoire()
  }
}
