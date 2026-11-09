import { choice, shuffle } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { nombreEnLettres } from '../../../modules/nombreEnLettres'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '481c6'
export const refs = {
  'fr-fr': ['3S1QCM-1'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calcul de médiane (2024 Métropole)'
export const dateDePublication = '28/10/2024'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */

export default class MetropoleJuin24Exo4Q5 extends ExerciceQcmA {
  private appliquerLesValeurs(liste: number[]): void {
    const newList = Array.from(new Set(liste))
    let finalList
    if (newList.length % 2 === 0) {
      finalList = Array.from(new Set(newList.slice(0, newList.length - 1)))
    } else {
      finalList = newList
    }
    const nbEleves = finalList.length
    const listeValeurs = finalList.map((el) => texNombre(el, 2)).join('~;~')
    const listOrd = finalList.slice().sort((a, b) => a - b)
    const index = Math.floor(finalList.length / 2)
    const mediane = texNombre(listOrd[index], 2)
    this.reponses = [
      `$${mediane}$`,
      `$${texNombre(finalList[index], 2)}$`,
      `$${texNombre(listOrd[index - 1], 2)}$`,
    ]
    this.enonce = `On a mesuré les tailles, en $\\text{ m}$, de ${nombreEnLettres(nbEleves)} élèves :<br>$${listeValeurs}$<br>Quelle est la médiane, en $\\text{ m}$, de ces tailles ?`
    this.correction = `On a dans l'ordre croissant : $${listOrd.map((el) => texNombre(el, 2)).join('~\\leqslant~')}$.<br>
    Il y a autant de tailles inférieures à $${mediane}$m que de tailles supérieures à $${mediane}$m, donc $${miseEnEvidence(`${mediane}`)}$ est la médiane.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs([1.46, 1.65, 1.6, 1.72, 1.7, 1.67, 1.75])
  }

  versionAleatoire: () => void = () => {
    const n = 3
    const nbTailles = choice([7, 9, 11]) // On choisit un nombre  de valeurs impaires
    const mediane = randint(150, 170) // On choisit la médiane
    const liste: number[] = []
    for (let i = 0; i < nbTailles - 1; i++) {
      liste.push(randint(145, 180, [mediane, ...liste])) // On crée une liste complémentaire de n-1 valeurs différentes de la médiane et des valeurs précédentes
    }
    const index = randint(0, nbTailles - 2, [Math.floor(nbTailles / 2)]) // On choisit l'index de la médiane (pas au milieu)
    const newList: number[] = []
    for (let i = 0, ii = 0; i < nbTailles;) {
      // On refait la liste en insérant la médiane à l'index choisi
      if (i === index) newList.push(mediane)
      else newList.push(liste[ii++])
      i++
    }
    let k = 0
    do {
      this.appliquerLesValeurs(shuffle(newList.map((el) => el / 100))) // On applique la division par 100 à chaque élément pour avoir les tailles en $\\text{ m}$.
      k++
    } while (nombreElementsDifferents(this.reponses) < n && k < 100)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
