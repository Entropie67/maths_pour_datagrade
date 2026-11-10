import { codageSegments } from '../../../lib/2d/CodageSegment'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { polygone } from '../../../lib/2d/polygones'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../../lib/2d/textes'
import { tracePoint } from '../../../lib/2d/TracePoint'
import { choisitLettresDifferentes } from '../../../lib/outils/aleatoires'
import { choice } from '../../../lib/outils/arrayOutils'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../../lib/outils/embellissements'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import { nombreElementsDifferents } from '../../ExerciceQcm'
import ExerciceQcmA from '../../ExerciceQcmA'

export const uuid = '41a13'
export const refs = {
  'fr-fr': ['3G1QCM-2'],
  'fr-ch': ['11LCES3A-7', '11LSES3A-7'],
}
export const interactifReady = true

export const amcReady = 'true'
export const amcType = 'qcmMono'
export const titre = "Rapport d'homothétie (2023 Métropole)"
export const dateDePublication = '28/10/2024'
/**
 *
 * @author Jean-Claude LHOTE
 * jean-claude.lhote@ac-nancy-metz.fr
 */

export default class NCDecembre23Exo1Q5 extends ExerciceQcmA {
  private appliquerLesValeurs(
    noms: string,
    rapport: number,
    abscisseB: number,
    ordonneeB: number,
    choix: number,
    choix2: number,
  ): void {
    this.enonce = `$${noms.substring(0, 4)}$ est un parallélogramme de centre $${noms[4]}$.<br>`
    const nuage = [
      pointAbstrait(0, 0, noms[0], ordonneeB > 0 ? 'below left' : 'above left'),
      pointAbstrait(
        6,
        0,
        noms[1],
        ordonneeB > 0 ? 'below right' : 'above right',
      ),
      pointAbstrait(
        6 + abscisseB,
        ordonneeB,
        noms[2],
        ordonneeB > 0 ? 'above right' : 'below right',
      ),
      pointAbstrait(
        abscisseB,
        ordonneeB,
        noms[3],
        ordonneeB > 0 ? 'above left' : 'below left',
      ),
      pointAbstrait(
        (6 + abscisseB) / 2,
        ordonneeB / 2,
        noms[4],
        ordonneeB > 0 ? 'above' : 'below',
      ),
      pointAbstrait(abscisseB / 2, ordonneeB / 2, noms[5], 'left'),
      pointAbstrait(3, 0, noms[6], ordonneeB > 0 ? 'below' : 'above'),
    ]
    const parallelo = polygone(nuage[0], nuage[1], nuage[2], nuage[3])
    const diag1 = segment(nuage[1], nuage[3])
    const diag2 = segment(nuage[0], nuage[2])
    const tracesPoints = tracePoint(nuage[5], nuage[6])
    tracesPoints.style = '.'
    tracesPoints.taille = 2
    const labels = labelPoint(...nuage)
    const marques1 = codageSegments(
      'o',
      'black',
      nuage[0],
      nuage[5],
      nuage[5],
      nuage[3],
    )
    const marques2 = codageSegments(
      '||',
      'black',
      nuage[0],
      nuage[6],
      nuage[6],
      nuage[1],
    )
    const objets = [
      parallelo,
      diag1,
      diag2,
      labels,
      tracesPoints,
      marques1,
      marques2,
    ]
    this.enonce += mathalea2d(
      Object.assign({ pixelsParCm: 30, scale: 1.5 }, fixeBordures(objets)),
      objets,
    )
    this.enonce += `L'homothétie de centre $${noms[0]}$ qui transforme `

    switch (choix) {
      case 2:
        this.enonce +=
          rapport === 0.5
            ? `$${noms[1]}$ en $${noms[6]}$`
            : `$${noms[6]}$ en $${noms[1]}$`
        switch (choix2) {
          case 2:
            this.reponses =
              rapport === 0.5
                ? [
                    'a pour rapport $0,5$.',
                    `transforme $${noms[5]}$ en $${noms[3]}$.`,
                    `transforme $${noms[4]}$ en $${noms[2]}$.`,
                  ]
                : [
                    'a pour rapport $2$.',
                    `transforme $${noms[3]}$ en $${noms[5]}$.`,
                    `transforme $${noms[2]}$ en $${noms[4]}$.`,
                  ]
            this.correction =
              rapport === 0.5
                ? `$${noms[6]}$ est le milieu de $[${noms[0] + noms[1]}]$ par conséquent cette homothétie ${texteEnCouleurEtGras('a pour rapport')} $${miseEnEvidence('0,5')}$.`
                : `$${noms[6]}$ est le milieu de $[${noms[0] + noms[1]}]$ par conséquent cette homothétie ${texteEnCouleurEtGras('a pour rapport')} $${miseEnEvidence('2')}$.`
            break
          case 3:
            this.reponses =
              rapport === 0.5
                ? [
                    `transforme $${noms[3]}$ en $${noms[5]}$.`,
                    `transforme $${noms[4]}$ en $${noms[2]}$.`,
                    'a pour rapport $2$.',
                  ]
                : [
                    `transforme $${noms[5]}$ en $${noms[3]}$.`,
                    `transforme $${noms[2]}$ en $${noms[4]}$.`,
                    'a pour rapport $0,5$.',
                  ]
            this.correction =
              rapport === 0.5
                ? `$${noms[6]}$ est le milieu de $[${noms[0] + noms[1]}]$ par conséquent cette homothétie ${texteEnCouleurEtGras('transforme')} $${miseEnEvidence(noms[3])}$ ${texteEnCouleurEtGras('en')} $${miseEnEvidence(noms[5])}$, le milieu de $[${noms[0] + noms[3]}]$.`
                : `$${noms[6]}$ est le milieu de $[${noms[0] + noms[1]}]$ par conséquent cette homothétie ${texteEnCouleurEtGras('transforme')} $${miseEnEvidence(noms[5])}$ ${texteEnCouleurEtGras('en')} $${miseEnEvidence(noms[3])}$ car $${noms[5]}$ est le milieu de $[${noms[0] + noms[3]}]$.`

            break
          default:
            this.reponses =
              rapport === 0.5
                ? [
                    `transforme $${noms[2]}$ en $${noms[4]}$.`,
                    'a pour rapport $2$.',
                    `transforme $${noms[5]}$ en $${noms[3]}$.`,
                  ]
                : [
                    `transforme $${noms[4]}$ en $${noms[2]}$.`,
                    'a pour rapport $0,5$.',
                    `transforme $${noms[3]}$ en $${noms[5]}$.`,
                  ]
            this.correction =
              rapport === 0.5
                ? `$${noms[6]}$ est le milieu de $[${noms[0] + noms[1]}]$ par conséquent cette homothétie ${texteEnCouleurEtGras('transforme')} $${miseEnEvidence(noms[2])}$ ${texteEnCouleurEtGras('en')} $${miseEnEvidence(noms[4])}$, le milieu de $[${noms[0] + noms[2]}]$.`
                : `$${noms[6]}$ est le milieu de $[${noms[0] + noms[1]}]$ par conséquent cette homothétie ${texteEnCouleurEtGras('transforme')} $${miseEnEvidence(noms[4])}$ ${texteEnCouleurEtGras('en')} $${miseEnEvidence(noms[2])}$ car $${noms[4]}$ est le milieu de $[${noms[0] + noms[2]}]$.`
        }
        break
      case 3:
        this.enonce +=
          rapport === 0.5
            ? `$${noms[2]}$ en $${noms[4]}$`
            : `$${noms[4]}$ en $${noms[2]}$`
        switch (choix2) {
          case 2:
            this.reponses =
              rapport === 0.5
                ? [
                    'a pour rapport $0,5$.',
                    `transforme $${noms[5]}$ en $${noms[3]}$.`,
                    `transforme $${noms[6]}$ en $${noms[1]}$.`,
                  ]
                : [
                    'a pour rapport $2$.',
                    `transforme $${noms[3]}$ en $${noms[5]}$.`,
                    `transforme $${noms[1]}$ en $${noms[6]}$.`,
                  ]
            this.correction =
              rapport === 0.5
                ? `$${noms[4]}$ est le milieu de $[${noms[0] + noms[2]}]$ par conséquent cette homothétie ${texteEnCouleurEtGras('a pour rapport')} $${miseEnEvidence('0,5')}$.`
                : `$${noms[4]}$ est le milieu de $[${noms[0] + noms[2]}]$ par conséquent cette homothétie ${texteEnCouleurEtGras('a pour rapport')} $${miseEnEvidence('2')}$.`

            break
          case 3:
            this.reponses =
              rapport === 0.5
                ? [
                    `transforme $${noms[1]}$ en $${noms[6]}$.`,
                    `transforme $${noms[5]}$ en $${noms[3]}$.`,
                    'a pour rapport $2$.',
                  ]
                : [
                    `transforme $${noms[6]}$ en $${noms[1]}$.`,
                    `transforme $${noms[3]}$ en $${noms[5]}$.`,
                    'a pour rapport $0,5$.',
                  ]
            this.correction =
              rapport === 0.5
                ? `$${noms[4]}$ est le milieu de $[${noms[0] + noms[2]}]$ par conséquent cette homothétie ${texteEnCouleurEtGras('transforme')} $${miseEnEvidence(noms[1])}$ ${texteEnCouleurEtGras('en')} $${miseEnEvidence(noms[6])}$, le milieu de $[${noms[0] + noms[1]}]$.`
                : `$${noms[4]}$ est le milieu de $[${noms[0] + noms[2]}]$ par conséquent cette homothétie ${texteEnCouleurEtGras('transforme')} $${miseEnEvidence(noms[6])}$ ${texteEnCouleurEtGras('en')} $${miseEnEvidence(noms[1])}$ car $${noms[6]}$ est le milieu de $[${noms[0] + noms[1]}]$.`

            break
          default:
            this.reponses =
              rapport === 0.5
                ? [
                    `transforme $${noms[3]}$ en $${noms[5]}$.`,
                    'a pour rapport $2$.',
                    `transforme $${noms[6]}$ en $${noms[1]}$.`,
                  ]
                : [
                    `transforme $${noms[5]}$ en $${noms[3]}$.`,
                    'a pour rapport $0,5$.',
                    `transforme $${noms[1]}$ en $${noms[6]}$.`,
                  ]
            this.correction =
              rapport === 0.5
                ? `$${noms[4]}$ est le milieu de $[${noms[0] + noms[2]}]$ par conséquent cette homothétie ${texteEnCouleurEtGras('transforme')} $${miseEnEvidence(noms[3])}$ ${texteEnCouleurEtGras('en')} $${miseEnEvidence(noms[5])}$, le milieu de $[${noms[0] + noms[3]}]$.`
                : `$${noms[4]}$ est le milieu de $[${noms[0] + noms[2]}]$ par conséquent cette homothétie ${texteEnCouleurEtGras('transforme')} $${miseEnEvidence(noms[5])}$ ${texteEnCouleurEtGras('en')} $${miseEnEvidence(noms[3])}$ car $${noms[5]}$ est le milieu de $[${noms[0] + noms[3]}]$.`
        }
        break
      default:
        this.enonce +=
          rapport === 0.5
            ? `$${noms[3]}$ en $${noms[5]}$`
            : `$${noms[5]}$ en $${noms[3]}$`
        switch (choix2) {
          case 2:
            this.reponses =
              rapport === 0.5
                ? [
                    'a pour rapport $0,5$.',
                    `transforme $${noms[4]}$ en $${noms[2]}$.`,
                    `transforme $${noms[6]}$ en $${noms[1]}$.`,
                  ]
                : [
                    'a pour rapport $2$.',
                    `transforme $${noms[2]}$ en $${noms[4]}$.`,
                    `transforme $${noms[1]}$ en $${noms[6]}$.`,
                  ]
            this.correction =
              rapport === 0.5
                ? `$${noms[5]}$ est le milieu de $[${noms[0] + noms[3]}]$ par conséquent cette homothétie ${texteEnCouleurEtGras('a pour rapport')} $${miseEnEvidence('0,5')}$.`
                : `$${noms[5]}$ est le milieu de $[${noms[0] + noms[3]}]$ par conséquent cette homothétie ${texteEnCouleurEtGras('a pour rapport')} $${miseEnEvidence('2')}$.`

            break
          case 3:
            this.reponses =
              rapport === 0.5
                ? [
                    `transforme $${noms[1]}$ en $${noms[6]}$.`,
                    `transforme $${noms[4]}$ en $${noms[2]}$.`,
                    'a pour rapport $2$.',
                  ]
                : [
                    `transforme $${noms[6]}$ en $${noms[1]}$.`,
                    `transforme $${noms[2]}$ en $${noms[4]}$.`,
                    'a pour rapport $0,5$.',
                  ]
            this.correction =
              rapport === 0.5
                ? `$${noms[5]}$ est le milieu de $[${noms[0] + noms[3]}]$ par conséquent cette homothétie ${texteEnCouleurEtGras('transforme')} $${miseEnEvidence(noms[1])}$ ${texteEnCouleurEtGras('en')} $${miseEnEvidence(noms[6])}$, le milieu de $[${noms[0] + noms[1]}]$.`
                : `$${noms[5]}$ est le milieu de $[${noms[0] + noms[3]}]$ par conséquent cette homothétie ${texteEnCouleurEtGras('transforme')} $${miseEnEvidence(noms[6])}$ ${texteEnCouleurEtGras('en')} $${miseEnEvidence(noms[1])}$ car $${noms[6]}$ est le milieu de $[${noms[0] + noms[1]}]$.`

            break
          default:
            this.reponses =
              rapport === 0.5
                ? [
                    `transforme $${noms[2]}$ en $${noms[4]}$.`,
                    'a pour rapport $2$.',
                    `transforme $${noms[6]}$ en $${noms[1]}$.`,
                  ]
                : [
                    `transforme $${noms[4]}$ en $${noms[2]}$.`,
                    'a pour rapport $0,5$.',
                    `transforme $${noms[1]}$ en $${noms[6]}$.`,
                  ]
            this.correction =
              rapport === 0.5
                ? `$${noms[5]}$ est le milieu de $[${noms[0] + noms[3]}]$ par conséquent cette homothétie ${texteEnCouleurEtGras('transforme')} $${miseEnEvidence(noms[2])}$ ${texteEnCouleurEtGras('en')} $${miseEnEvidence(noms[4])}$, le milieu de $[${noms[0] + noms[2]}]$.`
                : `$${noms[5]}$ est le milieu de $[${noms[0] + noms[3]}]$ par conséquent cette homothétie ${texteEnCouleurEtGras('transforme')} $${miseEnEvidence(noms[4])}$ ${texteEnCouleurEtGras('en')} $${miseEnEvidence(noms[2])}$ car $${noms[4]}$ est le milieu de $[${noms[0] + noms[2]}]$.`
        }
        break
    }
  }

  versionOriginale: () => void = () => {
    this.appliquerLesValeurs('ADCBEFG', 0.5, 1.75, 3, 1, 1)
  }

  versionAleatoire: () => void = () => {
    const n = 3
    do {
      const abscisseB = (choice([-1, 1]) * randint(15, 30)) / 10
      const ordonneeB = choice([-3, 3])
      const noms = choisitLettresDifferentes(7, 'PQ', true).join('')
      const rapport = choice([0.5, 2])
      const choix1 = randint(1, 3)
      const choix2 = randint(1, 3)
      this.appliquerLesValeurs(
        noms,
        rapport,
        abscisseB,
        ordonneeB,
        choix1,
        choix2,
      )
    } while (nombreElementsDifferents(this.reponses) < n)
  }

  constructor() {
    super()
    this.versionAleatoire()
  }
}
