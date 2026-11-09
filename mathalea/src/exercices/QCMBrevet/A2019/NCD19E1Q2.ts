import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'
export const uuid = '7b974'
export const refs = {
  'fr-fr': ['4P1QCM-01', 'BP2AutoU3'],
  'fr-ch': [],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre =
  'Proportionnalité et ordre de grandeur (12/2019 Nouvelle-Calédonie)'
export const dateDePublication = '12/11/2024'

/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class NelleCaledoniep19Ex1Q3 extends ExerciceQcmA {
  private appliquerLesValeurs(
    sec: number,
    nbPages: number,
    choix: number,
  ): void {
    const nbSec = (60 + sec) * nbPages
    const nbHeures = nbSec / 3600
    this.reponses =
      choix === 0
        ? [
            `Environ $${Math.round(nbHeures)}$ heures`,
            `Environ $${Math.round(nbHeures) + 1}$ heures`,
            `Environ $${Math.round(nbHeures) + 2}$ heures`,
          ]
        : choix === 1
          ? [
              `Environ $${Math.round(nbHeures)}$ heures`,
              `Environ $${Math.round(nbHeures) - 1}$ heures`,
              `Environ $${Math.round(nbHeures) + 1}$ heures`,
            ]
          : [
              `Environ $${Math.round(nbHeures)}$ heures`,
              `Environ $${Math.round(nbHeures) - 1}$ heures`,
              `Environ $${Math.round(nbHeures) - 2}$ heures`,
            ]
    this.enonce = `Une page d'un roman se lit en moyenne en $1$ minute et $${sec}$ secondes. Quel temps de lecture faudrait-il pour un roman de $${texNombre(nbPages, 0)}$ pages ?`
    this.correction = `$1$ minute et $${sec}$ secondes équivalent à $${String(60 + sec)}$ secondes.<br>
    Un roman de $${texNombre(nbPages, 0)}$ pages se lit en $${texNombre(nbPages, 0)}\\times ${String(60 + sec)}$ secondes soit $${texNombre(nbSec, 0)}$ secondes.<br>
    $${texNombre(nbSec)}\\text{ s}= \\dfrac{${texNombre(nbSec)}}{${texNombre(3600)}}\\text{ h} \\approx ${miseEnEvidence(String(Math.round(nbHeures)))}\\text{ h}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs(15, 290, 1)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const sec = randint(3, 10) * 5
      const nbPages = randint(1, 30) * 10 + 200
      const choix = randint(0, 2)

      this.appliquerLesValeurs(sec, nbPages, choix)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
