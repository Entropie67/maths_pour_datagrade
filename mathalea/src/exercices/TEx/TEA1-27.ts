import { arc } from '../../lib/2d/Arc'
import { cercle } from '../../lib/2d/cercle'
import { point } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../lib/2d/textes'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../lib/interactif/createQuestion'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer le sommet atteint après un parcours sur un cercle'
export const dateDePublication = '11/10/2026'
export const uuid = 'd4458'
export const interactifReady = true
export const refs = { 'fr-fr': ['TEA1-27'], 'fr-ch': [] }

/** @author Stéphane Guyon */
export default class ParcoursPolygoneRegulier extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = '7'
    this.besoinFormulaireTexte = [
      'Polygones',
      'Nombres séparés par des tirets\n1 : Triangle équilatéral\n2 : Carré\n3 : Pentagone régulier\n4 : Hexagone régulier\n5 : Heptagone régulier\n6 : Octogone régulier\n7 : Mélange',
    ]
  }

  nouvelleVersion(): void {
    const types = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 6,
      melange: 7,
      defaut: 7,
      nbQuestions: this.nbQuestions,
    })
    const names = [
      'triangle équilatéral',
      'carré',
      'pentagone régulier',
      'hexagone régulier',
      'heptagone régulier',
      'octogone régulier',
    ]
    for (
      let i = 0, attempts = 0;
      i < this.nbQuestions && attempts < 50;
      attempts++
    ) {
      const sides = Number(types[i]) + 2
      const start = randint(0, sides - 1)
      const steps = randint(20, 999)
      const direction = randint(0, 1) === 0 ? 1 : -1
      if (!this.questionJamaisPosee(i, sides, start, steps, direction)) continue
      const letters = 'ABCDEFGH'.slice(0, sides)
      const center = point(0, 0)
      const vertices = Array.from({ length: sides }, (_, j) => {
        const angle = -Math.PI / 2 - Math.PI / sides + (j * 2 * Math.PI) / sides
        return point(3 * Math.cos(angle), 3 * Math.sin(angle), letters[j])
      })
      const labels = vertices.map((p) =>
        texteParPosition(p.nom, p.x * 1.15, p.y * 1.15),
      )
      // La flèche suit la tangente à la fin de l'arc, dans le sens tiré.
      const startAngle = Math.atan2(vertices[start].y, vertices[start].x)
      const arrowRadius = 3.85
      const arrowStart = startAngle - (direction * Math.PI) / (2 * sides)
      const arrowAngle = startAngle + (direction * Math.PI) / (2 * sides)
      const arrow = arc(
        point(
          arrowRadius * Math.cos(arrowStart),
          arrowRadius * Math.sin(arrowStart),
        ),
        center,
        (direction * 180) / sides,
        false,
        'none',
        'red',
      )
      const tip = point(
        arrowRadius * Math.cos(arrowAngle),
        arrowRadius * Math.sin(arrowAngle),
      )
      const tail = point(
        tip.x + direction * 0.25 * Math.sin(arrowAngle),
        tip.y - direction * 0.25 * Math.cos(arrowAngle),
      )
      const arrowHead = segment(tail, tip, 'red')
      arrowHead.styleExtremites = '->'
      arrow.epaisseur = 2
      arrowHead.epaisseur = 2
      const figure = mathalea2d(
        {
          xmin: -4.5,
          xmax: 4.5,
          ymin: -4.5,
          ymax: 4.5,
          pixelsParCm: 25,
          scale: 0.7,
        },
        cercle(center, 3, 'red'),
        polygone(vertices),
        labels,
        arrow,
        arrowHead,
      )
      const remainder = steps % sides
      const turns = Math.floor(steps / sides)
      createQuestion(this, i, {
        question: `${sides >= 6 ? 'L’' : 'Le '}${names[sides - 3]} $${letters}$ est inscrit dans le cercle $\\mathcal{C}$. Ses sommets découpent le cercle en $${sides}$ arcs identiques. Un point mobile $M$ parcourt le cercle en partant du sommet $${letters[start]}$.<br>${figure}<br>Déterminer le sommet d'arrivée de $M$ après avoir parcouru $${texNombre(steps)}$ arcs consécutifs.`,
        correction: `Un tour complet correspond à $${sides}$ arcs et ramène $M$ à son sommet de départ. On effectue la division euclidienne de $${texNombre(steps)}$ par $${sides}$ :<br>$${texNombre(steps)}=${sides}\\times ${texNombre(turns)}+${remainder}$<br>Après $${texNombre(turns)}$ tours complets, il reste donc $${remainder}$ arc${remainder > 1 ? 's' : ''} à parcourir depuis $${letters[start]}$.`,
        subQuestions: [
          { label: 'Dans le sens de la flèche.', sign: direction },
          { label: 'Dans le sens inverse de la flèche.', sign: -direction },
        ].map(({ label, sign }) => {
          const destination =
            letters[(start + sign * remainder + sides) % sides]
          const path = Array.from(
            { length: remainder + 1 },
            (_, k) => letters[(start + sign * k + sides) % sides],
          ).join('\\longrightarrow ')
          return {
            question: label,
            answer: { value: destination, options: { texteSansCasse: true } },
            field: { keyboard: KeyboardType.clavierMajuscules },
            correction: `${remainder === 0 ? 'Aucun arc supplémentaire à parcourir' : `$${path}$`}. Le sommet d'arrivée est $${miseEnEvidence(destination)}$.`,
          }
        }),
      })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
