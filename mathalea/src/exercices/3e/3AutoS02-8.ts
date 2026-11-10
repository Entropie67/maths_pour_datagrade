import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import { nombreElementsDifferents } from '../ExerciceBrevet'
import ExerciceQcmA from '../ExerciceQcmA'

export const uuid = '47e33'
export const refs = {
  'fr-fr': ['3AutoS02-8', 'BP1AUTO041'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Calculer une moyenne de $4$ notes'
export const dateDePublication = '24/12/2025'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */

export default class AsieJuin21Exo1Q2 extends ExerciceQcmA {
  private appliquerLesValeurs(
    notes: [number, number, number, number],
    detrompeurs: [number, number, number],
  ): void {
    const moyenne = (notes[0] + notes[1] + notes[2] + notes[3]) / 4

    this.reponses = [
      `$${texNombre(moyenne, 2)}$`,
      `$${texNombre(detrompeurs[0], 2)}$`,
      `$${texNombre(detrompeurs[1], 2)}$`,
      `$${texNombre(detrompeurs[2], 2)}$`,
    ]
    this.enonce = `Voici une série de $4$ notes : $${notes.map((n) => texNombre(n, 2)).join(', ')}$.<br>Quelle est la moyenne de cette série de notes ?`
    this.correction = `La moyenne de cette série de notes est : $\\dfrac{${texNombre(notes[0], 0)}+${texNombre(notes[1], 0)}+${texNombre(notes[2], 0)}+${texNombre(notes[3], 0)}}{4}=\\dfrac{${texNombre(notes[0] + notes[1] + notes[2] + notes[3], 0)}}{4}=${texNombre(moyenne, 2)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs([8, 10, 11, 11], [9.5, 10.5, 11])
  }

  versionAleatoire: () => void = () => {
    const n = 4
    do {
      const notes: number[] = []
      for (; notes.length < 4;) {
        const note = randint(4, 14)
        if (!notes.includes(note)) {
          notes.push(note)
        }
      }
      const somme = notes[0] + notes[1] + notes[2] + notes[3]
      if (somme % 4 === 3 || somme % 4 === 1) {
        notes[randint(0, 3)] += 1
      }
      const detrompeurs: number[] = []
      const moyenne = (notes[0] + notes[1] + notes[2] + notes[3]) / 4
      while (detrompeurs.length < 3) {
        const ecart = (Math.floor(Math.random() * 5) + 1) / 2
        const signe = Math.random() < 0.5 ? -1 : 1
        const detrompeur = moyenne + signe * ecart
        if (
          detrompeur >= 0 &&
          detrompeur <= 20 &&
          !detrompeurs.includes(detrompeur)
        ) {
          detrompeurs.push(detrompeur)
        }
      }
      this.appliquerLesValeurs(
        notes as [number, number, number, number],
        detrompeurs as [number, number, number],
      )
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
