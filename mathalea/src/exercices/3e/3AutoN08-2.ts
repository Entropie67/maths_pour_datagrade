import { bleuMathalea } from '../../lib/colors'
import { choice } from '../../lib/outils/arrayOutils'
import {
  miseEnEvidence,
  texteEnCouleur,
} from '../../lib/outils/embellissements'
import { round } from '../../lib/outils/nombres'
import { texNombre } from '../../lib/outils/texNombre'
import { randint } from '../../modules/outils'
import ExerciceSimple from '../ExerciceSimple'

export const titre = 'Connaître les carrés de nombres décimaux'
export const dateDePublication = '23/08/2026'

export const interactifReady = true

export const uuid = '2d311'
export const refs = {
  'fr-fr': ['3AutoN08-2'],
  'fr-ch': ['9R1NO5B-3', '9R2NO5B-3', '9R3NO5B-3', 'PRQNO07B-1'],
}

/**
 * Variante de 3AutoN08-1 : le carré demandé porte sur un nombre décimal
 * obtenu en décalant la virgule d'un carré de 1 à 15 (par exemple 0,05²
 * ou 600²), pour repérer que décaler la virgule du nombre de k rangs
 * décale la virgule de son carré de 2k rangs.
 * @author Rémi Angot
 */

// décalages possibles sur le nombre a (k > 0 : a est multiplié par 10^k ;
// k < 0 : a est divisé par 10^|k|)
const decalages = [-3, -2, -1, 1, 2, 3]

// nom du rang atteint par le chiffre des unités du carré quand on le
// multiplie (rang positif) ou qu'on le divise (rang négatif) par 10^|rang|
const nomsDesRangs: Record<number, string> = {
  1: 'dizaines',
  2: 'centaines',
  3: 'milliers',
  4: 'dizaines de milliers',
  5: 'centaines de milliers',
  6: 'millions',
  '-1': 'dixièmes',
  '-2': 'centièmes',
  '-3': 'millièmes',
  '-4': 'dix-millièmes',
  '-5': 'cent-millièmes',
  '-6': 'millionièmes',
}

export default class NomExercice extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.nbQuestions = 1
    this.spacing = 1.5
    this.spacingCorr = 1.5
  }

  nouvelleVersion() {
    const a = randint(1, 15)
    const k = choice(decalages)

    const precisionNombre = Math.max(0, -k)
    const nombre = round(a * 10 ** k, precisionNombre)

    const carreA = a * a
    const rangTotal = 2 * k
    const precisionReponse = Math.max(0, -rangTotal)
    this.reponse = round(carreA * 10 ** rangTotal, precisionReponse)

    const nombreTex = texNombre(nombre, precisionNombre)
    const reponseTex = texNombre(this.reponse, precisionReponse)
    const puissanceTotaleTex = texNombre(10 ** Math.abs(rangTotal))

    this.question = `Quel est le carré de $${nombreTex}$ ?`
    this.correction = `Le carré d'un nombre est ce nombre multiplié par lui-même : $${nombreTex} \\times ${nombreTex} = ${miseEnEvidence(reponseTex)}$`

    const phraseRang =
      rangTotal > 0
        ? `quand on multiplie par $${puissanceTotaleTex}$, le chiffre des unités devient le chiffre des ${nomsDesRangs[rangTotal]}`
        : `quand on divise par $${puissanceTotaleTex}$, le chiffre des unités devient celui des ${nomsDesRangs[rangTotal]}`

    this.correction += texteEnCouleur(
      `<br> Mentalement : <br>
Comme $${a}^2 = ${carreA}$, on a $${nombreTex} \\times ${nombreTex} = ${carreA} ${rangTotal > 0 ? '\\times' : '\\div'} ${puissanceTotaleTex}$.<br>
Or ${phraseRang} : on obtient $${reponseTex}$.
  `,
      bleuMathalea,
    )
  }
}
