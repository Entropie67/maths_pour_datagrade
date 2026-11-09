import { aLeBonNombreDePropsDifferentes } from '../../lib/interactif/qcm'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import ExerciceQcmACourt from '../ExerciceQcmACourt'
import { fonctionComparaison } from '../../lib/interactif/comparisonFunctions'

export const uuid = 'b2fb3'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Déterminer une distance'
export const dateDePublication = '02/06/2026'
export const dateDeModifImportante = '22/10/2026'
// Ceci est un exemple de QCM avec version originale et version aléatoire
/**
 *
 * @author Gilles Mora
 *
 */
export default class AutoQ9FMt2026 extends ExerciceQcmACourt {
  private appliquerLesValeurs(n: number, l: number): void {
    const totalM = n * l
    const totalKm = totalM / 1000

    this.enonce = `Une course automobile consiste à parcourir $${n}$ tours d'une piste de $${texNombre(l)}$ mètres.<br>`
    this.enonce += `La distance totale de la course est :`

    this.correction = `La distance totale est égale au nombre de tours multiplié par la longueur d'un tour :<br>`
    this.correction += `$${n} \\times ${texNombre(l)} = ${texNombre(totalM)}$ m.<br>`
    this.correction += `On convertit en kilomètres en divisant par $1\\,000$ :<br>`
    this.correction += `$${texNombre(totalM)} \\text{ m} = ${miseEnEvidence(texNombre(totalKm))} \\text{ km}$.`

    this.reponses = [
      `$${texNombre(totalKm)}$ km`,
      `$${texNombre(totalM / 10)}$ m`, // un zéro oublié dans la multiplication
      `$${texNombre(totalKm / 10)}$ km`, // même valeur que le précédent (piège de conversion)
      `$${texNombre(totalKm / 2)}$ km`, // moitié des tours
    ]
  }

  versionOriginale: () => void = () => {
    // Sujet de l'image : 20 tours de 4500 m => 90 km
    this.appliquerLesValeurs(20, 4500)
  }

  versionAleatoire: () => void = () => {
    if (this.canOfficielle) {
      this.versionOriginale()
      return
    }

    // [n, l] : n × l / 1000 est un nombre entier de km, multiple de 10 (distracteurs propres)
    const donnees: [number, number][] = [
      [20, 4500], // 90 km (image)
      [30, 2000], // 60 km
      [25, 2400], // 60 km
      [40, 2000], // 80 km
      [20, 3500], // 70 km
      [30, 3000], // 90 km
      [25, 4000], // 100 km
      [15, 4000], // 60 km
      [20, 4000], // 80 km
      [20, 2500], // 50 km
      [50, 2000], // 100 km
      [40, 2500], // 100 km
    ]

    let compteur = 0
    do {
      const [n, l] = choice(donnees)
      this.appliquerLesValeurs(n, l)
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
        /La distance totale de la course est :\s*$/,
        this.interactif
          ? 'La distance totale de la course est '
          : 'Calculer la distance totale de la course, en kilomètres.',
      )
    // La bonne réponse du QCM est de la forme « $90$ km » : on ne garde que le nombre
    this.reponseCourte = () =>
      this.reponses[0].replace(/^\$([^$]*)\$.*$/, (_, nombre: string) =>
        nombre.replace(/\\,/g, ''),
      )
    this.clavierReponseCourte = KeyboardType.clavierNumbers
    this.champReponseCourteEnLigne = true
    this.texteApresReponseCourte = ' km.'
  }
}
