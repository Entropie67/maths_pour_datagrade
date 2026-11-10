import { miseEnEvidence } from '../../lib/outils/embellissements'
import { arc } from '../../lib/2d/Arc'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { texteParPoint } from '../../lib/2d/textes'
import { rotation, similitude } from '../../lib/2d/transformations'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { shuffle } from '../../lib/outils/arrayOutils'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'cfaaa'
export const refs = {
  'fr-fr': ['3AutoS01-3'],
  'fr-ch': [],
}
export const interactifReady = true
export const titre = 'Calculer une probabilité (quotient de cardinal)'
export const dateDePublication = '11/08/2026'

const listeObjets = [
  'des stylos',
  'des porte-clés',
  'des casques audios',
  'des ventilateurs de poche',
  'des t-shirts',
  'des bracelets',
  'des sacs',
]

const roue = (listeObj: string[]) => {
  const O = pointAbstrait(0, 0)
  let A = pointAbstrait(0, 5)
  const objets = []
  for (let i = 0; i < 10; i++) {
    objets.push(arc(A, O, rotation(A, O, 36), true))
    objets.push(
      texteParPoint(
        listeObj[i].split(' ')[1],
        similitude(A, O, 18, 0.7),
        0,
        'black',
        0.6,
        'milieu',
      ),
    )
    A = rotation(A, O, 36)
  }
  return mathalea2d(Object.assign({}, fixeBordures(objets)), objets)
}
/**
 * DNB Asie juin 2026 - Question 6
 * @author Jean-Claude Lhote
 */
export default class AutoQ6Asiebrevet2026 extends ExerciceCan {
  constructor() {
    super()
  }

  enonce(objets?: string[], numObjets?: (number | undefined)[]) {
    let indexChoisi = 2
    if (numObjets == null || objets == null) {
      indexChoisi = randint(0, 2)
      objets = shuffle(listeObjets).slice(0, 3).concat(['un smartphone'])
      numObjets = shuffle([
        0,
        1,
        2,
        3,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
        undefined,
      ])
      let i = 0
      while (i < 10) {
        const index = randint(0, 2)
        if (numObjets[i] === undefined) numObjets[i] = index
        i++
      }
    }
    const colonne1 = `Une roue de la fortune est utilisée pour faire gagner des cadeaux. La
roue est divisée en $10$ secteurs de tailles égales, avec les gains suivants :
${objets?.join(', ') || 'des stylos, des porte-clés, des casques audios ou un smartphone'}.
Un joueur tourne la roue une seule fois.
Quelle est la probabilité que le joueur gagne ${objets?.[indexChoisi] || 'un casque audio'} ?`
    const colonne2 = roue(numObjets.map((n) => objets?.[n!] || ''))
    this.question = deuxColonnesResp(colonne1, colonne2, {
      largeur1: 80,
      widthmincol1: '400px',
      widthmincol2: '200px',
    })

    this.optionsDeComparaison = { fractionEgale: true }
    this.formatChampTexte = KeyboardType.clavierDeBaseAvecFraction
    const cardinalObjetChoisi = numObjets.filter(
      (n) => n === indexChoisi,
    ).length
    this.reponse = `\\dfrac{${cardinalObjetChoisi}}{10}`
    this.correction = `La probabilité de gagner ${objets?.[indexChoisi] || 'un casque audio'} est le quotient du cardinal de l'événement par le cardinal de l'univers.<br>
Le cardinal de l'événement est le nombre de secteurs donnant ${objets?.[indexChoisi] || 'un casque audio'}, soit $${cardinalObjetChoisi}$.<br>
Le cardinal de l'univers est le nombre total de secteurs, soit $10$.<br>
Donc la probabilité est :<br>
$P(\\text{gagner un ${objets?.[indexChoisi].split(' ')[1].slice(0, -1) || 'un casque audio'}})=${miseEnEvidence(`\\dfrac{${cardinalObjetChoisi}}{10}`)}$`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) {
      this.enonce(
        ['des stylos', 'des porte-clés', 'des casques audios', 'un smartphone'],
        [0, 0, 1, 2, 0, 0, 1, 3, 1, 2],
      )
    } else {
      this.enonce()
    }
  }
}
