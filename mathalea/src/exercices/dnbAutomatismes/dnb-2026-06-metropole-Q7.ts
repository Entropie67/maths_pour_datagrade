import { arc } from '../../lib/2d/Arc'
import { codageAngleDroit } from '../../lib/2d/CodageAngleDroit'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { texteParPoint } from '../../lib/2d/textes'
import { rotation, similitude } from '../../lib/2d/transformations'
import { deuxColonnesResp } from '../../lib/format/miseEnPage'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import ExerciceCan from '../ExerciceCan'

export const uuid = 'acbb6'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['9R1FA2B-12', '9R2FA2B-12', '9R3FA2B-12', 'PRQST01B-2', 'PRQPF01A-6'],
}
export const interactifReady = true
export const titre =
  'Utiliser un diagramme circulaire pour calculer un effectif'
export const dateDePublication = '12/08/2026'

function nombresDontLaSommeEst(somme: number, n: number): number[] {
  if (n === 1) {
    return [somme]
  }
  const nombres: number[] = []
  do {
    nombres.length = 0
    let reste = somme

    for (let i = 0; i < n - 1; i++) {
      const nombre = randint(3, reste - (n - i - 1))
      nombres.push(nombre)
      reste -= nombre
    }
    nombres.push(reste)
  } while (nombres.some((nombre: number) => nombre >= somme / 2))
  return nombres
}

function diagrammeCirculaire(
  effectifA: number,
  effectifB: number,
  effectifC: number,
  effectifD: number,
): string {
  const total = effectifA + effectifB + effectifC + effectifD
  const angleA = (effectifA / total) * 360
  const angleB = (effectifB / total) * 360
  const angleC = (effectifC / total) * 360
  const angleD = (effectifD / total) * 360
  const objets: NestedObjetMathalea2dArray = []
  const O = pointAbstrait(0, 0)
  let A = pointAbstrait(5, 0)
  for (let i = 0; i < 4; i++) {
    const angle = [angleA, angleB, angleC, angleD][i]
    const B = rotation(A, O, angle)
    objets.push(
      angle > 180 ? arc(B, O, A, true) : arc(A, O, B, true),
      texteParPoint(
        `Réponse ${String.fromCharCode(65 + i)}`,
        similitude(A, O, angle / 2, 0.6),
        0,
        'black',
        0.8,
        'milieu',
      ),
    )
    if (angle === 90) {
      objets.push(codageAngleDroit(A, O, B))
    }
    A = B
  }
  return mathalea2d(Object.assign({}, fixeBordures(objets)), objets)
}

/**
 * DNB Métropole juin 2026 - Question 7
 * @author Jean-Claude Lhote
 */
export default class AutoQ7MetropoleBrevet2026 extends ExerciceCan {
  constructor() {
    super()
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  enonce(
    effectifA?: number,
    effectifB?: number,
    effectifC?: number,
    effectifD?: number,
  ) {
    if (
      effectifA == null ||
      effectifB == null ||
      effectifC == null ||
      effectifD == null
    ) {
      const effectifTotal = choice([20, 24, 28])
      const effectifs = [effectifTotal / 4]
      effectifs.push(...nombresDontLaSommeEst(effectifTotal - effectifs[0], 3))
      ;[effectifA, effectifB, effectifC, effectifD] = shuffle(effectifs)
    }
    const effectifTotal = effectifA + effectifB + effectifC + effectifD
    const question = [effectifA, effectifB, effectifC, effectifD].indexOf(
      effectifTotal / 4,
    )
    this.question = deuxColonnesResp(
      `Le diagramme circulaire ci-contre donne la répartition des
réponses de $${effectifTotal}$ élèves à une question à choix multiple.
Quel est le nombre d’élèves ayant choisi la réponse ${String.fromCharCode(65 + question)} ?`,
      diagrammeCirculaire(effectifA, effectifB, effectifC, effectifD),
      { largeur1: 60, widthmincol1: '300px', widthmincol2: '200px' },
    )
    this.reponse = texNombre(effectifTotal / 4, 0)
    this.correction = `Les élèves qui ont choisi la réponse ${String.fromCharCode(65 + question)} représentent un quart du diagramme.<br>
    Comme il y a $${effectifTotal}$ élèves au total, un quart du diagramme représente $${miseEnEvidence(String(effectifTotal / 4))}$ élèves.`
  }

  nouvelleVersion() {
    if (this.canOfficielle || this.sup) {
      this.enonce(7, 6, 5, 6)
    } else {
      this.enonce()
    }
  }
}
