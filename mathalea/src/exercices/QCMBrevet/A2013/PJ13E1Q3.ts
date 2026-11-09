import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '67e18'
export const refs = {
  'fr-fr': ['3G2QCM-1'],
  'fr-ch': ['11LCGM3A-6', '11LSGM3A-6', 'PRQES05A-7'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = 'Agrandissement volume (2013 Polynésie)'
export const dateDePublication = '30/10/2024'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */
export default class olynesieJuin13Exo1Q3 extends ExerciceQcmA {
  private appliquerLesValeurs(a: string, b: string, c: number): void {
    const verbe = c === 2 ? 'double' : c === 3 ? 'triple' : 'quadruple'
    this.reponses = [
      `$${String(c ** 3)}$`,
      `$${String(c)}$`,
      `$${String(c ** 2)}$`,
    ]
    this.enonce = `Si on ${verbe} ${a} d'un${b === 'sphère' ? 'e' : ''} ${b} alors par combien est multiplié le volume ${b === 'sphère' ? 'de la' : 'du'} ${b}?`
    this.correction =
      'Dans un agrandissement, si les longueurs sont multipliées par un nombre $k$, alors les aires le sont par $k^2$ et les volumes par $k^3$.<br>'
    this.correction += ` Donc, si on ${verbe} ${a} d'un${b === 'sphère' ? 'e' : ''} ${b}, alors le volume ${b === 'sphère' ? 'de la' : 'du'} ${b} est multiplié par $${c}^3$ soit $${miseEnEvidence(`${c ** 3}`)}$.`
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs("l'arête", 'cube', 3)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const b = choice(['cube', 'sphère'])
      const a =
        b === 'cube'
          ? choice(["l'arête", 'la hauteur', "la diagonale d'une face"])
          : choice(['le rayon', 'le diamètre'])
      const c = choice([2, 3, 4])
      this.appliquerLesValeurs(a, b, c)
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
