import { fixeBordures } from '../../lib/2d/fixeBordures'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { mathalea2d } from '../../modules/mathalea2d'

import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

import { tracePoint } from '../../lib/2d/TracePoint'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif' // fonction qui va préparer l'analyse de la saisie
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'

export const titre =
  'Déterminer des coordonnées de points dans un repère défini à partir d’un cube'

export const dateDePublication = '07/02/2026'

export const uuid = 'b4e87'

export const refs = {
  'fr-fr': ['TSG2-10'],
  'fr-ch': ['3G90-8'],
}
export const interactifReady = true // pour définir qu'exercice peut s'afficher en mode interactif.

function bareme(listePoints: number[]): [number, number] {
  let points = 0
  for (let i = 0; i < 4; i++) {
    const indexBase = i * 3
    const x = listePoints[indexBase]
    const y = listePoints[indexBase + 1]
    const z = listePoints[indexBase + 2]
    points += x * y * z
  }
  return [points, 4]
}
/**
 * Exercice dans un cube, calculs de coordonnées,
 *
 * @author Stéphane Guyon
 */
export default class NomExercice extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.formatChampTexte = KeyboardType.clavierDeBase
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 20;) {
      let texte = ''
      let texteCorr = ''

      // Points pour la figure
      const A = pointAbstrait(0, 0, 'A', 'below left')
      const B = pointAbstrait(4, 0, 'B', 'below')
      const C = pointAbstrait(6, 1.6, 'C', 'below')
      const D = pointAbstrait(2, 1.6, 'D', 'above left')

      const E = pointAbstrait(A.x, A.y + 4, 'E', 'above left')
      const F = pointAbstrait(B.x, B.y + 4, 'F', 'above')
      const G = pointAbstrait(C.x, C.y + 4, 'G', 'above')
      const H = pointAbstrait(D.x, D.y + 4, 'H', 'above left')

      const facesVisibles = [
        polygone([A, E, H, G, F, E], 'black'),
        polygone([B, C, G, F, E, A], 'black'),
        segment(B, F, 'black'),
      ]
      const traceA = tracePoint(A)
      const traceB = tracePoint(B)
      const traceC = tracePoint(C)
      const traceD = tracePoint(D)
      const traceE = tracePoint(E)
      const traceF = tracePoint(F)
      const traceG = tracePoint(G)
      const traceH = tracePoint(H)

      const aretesCachees = [segment(A, D), segment(C, D), segment(D, H)]
      aretesCachees.forEach((s) => (s.pointilles = 3))

      const objets = [
        ...facesVisibles,
        ...aretesCachees,
        labelPoint(A, B, C, D, E, F, G, H),
      ]
      const k = randint(1, 4) // pour faire varier le repère choisi
      let rep = ''

      let Point1 = ''
      let Point2 = ''
      let Point3 = ''
      let Point4 = ''
      // Coordonnées des points du cube dans repère (A, AB, AD, AE)
      const coordCan = {
        A: [0, 0, 0],
        B: [1, 0, 0],
        C: [1, 1, 0],
        D: [0, 1, 0],
        E: [0, 0, 1],
        F: [1, 0, 1],
        G: [1, 1, 1],
        H: [0, 1, 1],
      }

      // Retourne les coordonnées d'un point dans le repère choisi (k)
      const coordsDansRep = (nomPoint: keyof typeof coordCan) => {
        const [x, y, z] = coordCan[nomPoint]
        switch (k) {
          case 1:
            // Repère (A, AB, AD, AE)
            return [x, y, z]
          case 2:
            // Repère (B, BC, BA, BF)
            return [y, 1 - x, z]
          case 3:
            // Repère (H, HE, HG, HD)
            return [1 - y, x, 1 - z]
          default:
            // Repère (E, EA, EF, EH)
            return [1 - z, x, y]
        }
      }
      if (k === 1) {
        // Repère (A, AB, AD, AE)
        rep =
          '$(A,\\overrightarrow{AB},\\overrightarrow{AD},\\overrightarrow{AE})$'
        Point1 = choice(['B', 'C', 'D', 'E', 'F', 'G', 'H'])
        Point2 = choice(['B', 'C', 'D', 'E', 'F', 'G', 'H'], [`${Point1}`])
        Point3 = choice(
          ['B', 'C', 'D', 'E', 'F', 'G', 'H'],
          [`${Point1}`, `${Point2}`],
        )
        Point4 = choice(
          ['B', 'C', 'D', 'E', 'F', 'G', 'H'],
          [`${Point1}`, `${Point2}`, `${Point3}`],
        )
      } else if (k === 2) {
        // Repère (B, BC, BA, BF)
        rep =
          '$(B,\\overrightarrow{BC},\\overrightarrow{BA},\\overrightarrow{BF})$'
        Point1 = choice(['A', 'C', 'D', 'E', 'F', 'G', 'H'])
        Point2 = choice(['A', 'C', 'D', 'E', 'F', 'G', 'H'], [`${Point1}`])
        Point3 = choice(
          ['A', 'C', 'D', 'E', 'F', 'G', 'H'],
          [`${Point1}`, `${Point2}`],
        )
        Point4 = choice(
          ['A', 'C', 'D', 'E', 'F', 'G', 'H'],
          [`${Point1}`, `${Point2}`, `${Point3}`],
        )
      } else if (k === 3) {
        // Repère (H, HE, HG, HD)
        rep =
          '$(H,\\overrightarrow{HE},\\overrightarrow{HG},\\overrightarrow{HD})$'
        Point1 = choice(['A', 'B', 'C', 'D', 'E', 'F', 'G'])
        Point2 = choice(['A', 'B', 'C', 'D', 'E', 'F', 'G'], [`${Point1}`])
        Point3 = choice(
          ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
          [`${Point1}`, `${Point2}`],
        )
        Point4 = choice(
          ['A', 'B', 'C', 'D', 'E', 'F', 'G'],
          [`${Point1}`, `${Point2}`, `${Point3}`],
        )
      } else {
        // Repère (E, EA, EF, EH)
        rep =
          '$(E,\\overrightarrow{EA},\\overrightarrow{EF},\\overrightarrow{EH})$'
        Point1 = choice(['A', 'B', 'C', 'D', 'F', 'G', 'H'])
        Point2 = choice(['A', 'B', 'C', 'D', 'F', 'G', 'H'], [`${Point1}`])
        Point3 = choice(
          ['A', 'B', 'C', 'D', 'F', 'G', 'H'],
          [`${Point1}`, `${Point2}`],
        )
        Point4 = choice(
          ['A', 'B', 'C', 'D', 'F', 'G', 'H'],
          [`${Point1}`, `${Point2}`, `${Point3}`],
        )
      }
      const pointsChoisis = [Point1, Point2, Point3, Point4]
      const coordsChoisies = pointsChoisis.map((p) =>
        coordsDansRep(p as keyof typeof coordCan),
      ) // Calcule les coord dans nouveau repère pour les points choisis
      const [p1, p2, p3, p4] = coordsChoisies
      const [x1, y1, z1] = p1 // Coordonnées du point 1 dans le repère choisi
      const [x2, y2, z2] = p2 // Coordonnées du point 2 dans le repère choisi
      const [x3, y3, z3] = p3 // Coordonnées du point 3 dans le repère choisi
      const [x4, y4, z4] = p4 // Coordonnées du point 4 dans le repère choisi

      texte =
        `On considère un cube $ABCDEFGH$.` +
        '<br>' +
        mathalea2d(
          Object.assign(
            { scale: 0.6, display: 'inline' } as const,
            fixeBordures(objets),
          ),
          objets,
          traceA,
          traceB,
          traceC,
          traceD,
          traceE,
          traceF,
          traceG,
          traceH,
        ) +
        '<br>' +
        `Donner les coordonnées des points $${Point1}$, $${Point2}$, $${Point3}$ et $${Point4}$ dans le repère ${rep}.<br>`

      if (this.interactif) {
        texte +=
          ' <br>' +
          addMultiMathfield(this, i, {
            dataTemplate: `$${Point1}($%{champ1}$~;~$%{champ2}$~;~$%{champ3}$)$, $${Point2}($%{champ4}$~;~$%{champ5}$~;~$%{champ6}$)$\n $${Point3}($%{champ7}$~;~$%{champ8}$~;~$%{champ9}$)$, $${Point4}($%{champ10}$~;~$%{champ11}$~;~$%{champ12}$)$`,
            dataOptions: {},
          })

        handleAnswers(
          this,
          i,
          {
            bareme,
            champ1: { value: texNombre(x1) },
            champ2: { value: texNombre(y1) },
            champ3: { value: texNombre(z1) },
            champ4: { value: texNombre(x2) },
            champ5: { value: texNombre(y2) },
            champ6: { value: texNombre(z2) },
            // @ts-ignore
            champ7: { value: texNombre(x3) },
            champ8: { value: texNombre(y3) },
            champ9: { value: texNombre(z3) },
            champ10: { value: texNombre(x4) },
            champ11: { value: texNombre(y4) },
            champ12: { value: texNombre(z4) },
          },
          { formatInteractif: 'multi-mathfield' },
        )
      }

      texteCorr =
        `Les coordonnées dans le repère ${rep} sont :<br>` +
        ` $${Point1}(${miseEnEvidence(`${texNombre(x1)}~`)};~${miseEnEvidence(`${texNombre(y1)}~`)};~${miseEnEvidence(`${texNombre(z1)}`)})$, ` +
        ` $${Point2}(${miseEnEvidence(`${texNombre(x2)}~`)};~${miseEnEvidence(`${texNombre(y2)}~`)};~${miseEnEvidence(`${texNombre(z2)}`)})$, ` +
        ` $${Point3}(${miseEnEvidence(`${texNombre(x3)}~`)};~${miseEnEvidence(`${texNombre(y3)}~`)};~${miseEnEvidence(`${texNombre(z3)}`)})$, ` +
        ` $${Point4}(${miseEnEvidence(`${texNombre(x4)}~`)};~${miseEnEvidence(`${texNombre(y4)}~`)};~${miseEnEvidence(`${texNombre(z4)}`)})$.`

      this.listeQuestions[i] = texte
      this.listeCorrections[i] = texteCorr
      i++
      cpt++
    }

    listeQuestionsToContenu(this)
  }
}
