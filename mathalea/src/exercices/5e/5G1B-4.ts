import { fixeBordures } from '../../lib/2d/fixeBordures'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import RepereBuilder from '../../lib/2d/RepereBuilder'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { vecteur, type Vecteur } from '../../lib/2d/Vecteur'
import { orangeMathalea } from '../../lib/colors'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  egal,
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre =
  'Déterminer les coordonnées des sommets d’un parallélogramme'
export const dateDePublication = '25/05/2025'
export const interactifReady = true

/**
 * Trouver les coordonnees du 4e sommet d'un parallélogramme à partir de 3 sommets donnés.
 * @author Jean-claude Lhote
 */
export const uuid = '37e38'

export const refs = {
  'fr-fr': ['5G1B-4'],
  'fr-2016': ['5G42-2'],
  'fr-ch': ['9R1ES5A-4', '9R2ES5A-4', '9R3ES5A-4', 'PRQPF02A-4'],
}
const couplesVecteursEntiers = [
  [
    [5, -2],
    [-1, 3],
  ],
  [
    [-3, 4],
    [2, -1],
  ],
  [
    [1, 2],
    [3, -4],
  ],
  [
    [-2, -3],
    [4, 1],
  ],
  [
    [2, -1],
    [-1, 3],
  ],
  [
    [-1, -4],
    [3, 2],
  ],
  [
    [4, 3],
    [-2, 1],
  ],
  [
    [-3, -2],
    [1, 4],
  ],
]
const couplesVecteursRationnels = [
  [
    [3.5, -2],
    [1, 2.5],
  ],
  [
    [-2.5, 4],
    [1.5, 2.5],
  ],
  [
    [4.5, 1],
    [1.5, -2],
  ],
  [
    [4, -1.25],
    [-2.5, 3.75],
  ],
  [
    [-1.5, -2.5],
    [3, 1.5],
  ],
  [
    [2.5, -1],
    [-1.5, 3],
  ],
  [
    [-2, 3.5],
    [4, -1.5],
  ],
  [
    [1.5, -3],
    [2, 2.5],
  ],
]

export default class ConstructionsParallelogrammesParticuliersV2 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 : 4e sommet\n2 : 3e sommet\n3 : 2e sommet\n4 : 1er sommet\n5 : Mélange',
    ]
    this.sup = '1'
    this.besoinFormulaire2CaseACocher = ['Avec des fractions', false]
    this.sup2 = false
    this.besoinFormulaire3CaseACocher = ['Avec des relatifs', false]
    this.sup3 = false
    this.besoinFormulaire4CaseACocher = ['Avec les côtés tracés', false]
    this.sup4 = false
    this.nbQuestions = 2

    this.correctionDetaillee = true
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    const listeTypeDeQuestion = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 4,
      melange: 5,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''

      // On prépare la figure...
      const noms = choisitLettresDifferentes(5, 'QOX', true) // on choisit 5 lettres, les 4 premières sont les sommets, la 5e est le centre
      const nom = noms[0] + noms[1] + noms[2] + noms[3]
      const objetsEnonce: NestedObjetMathalea2dArray = []
      const objetsCorrection: NestedObjetMathalea2dArray = []
      const withFractions = this.sup2
      const withRelatifs = this.sup3
      const withSides = this.sup4
      const choix = listeTypeDeQuestion[i] // 1, 2, 3, 4 ou 5
      const sommets: {
        x: number
        y: number
        nom: string
        visible: boolean
        p: PointAbstrait | null
      }[] = []
      let v1: Vecteur
      let v2: Vecteur
      let den: number
      do {
        const couplesVecteurs = choice(
          withFractions ? couplesVecteursRationnels : couplesVecteursEntiers,
        )
        const swap = randint(0, 1)
        const swap2 = randint(0, 1)
        v1 = vecteur(
          couplesVecteurs[swap][swap2],
          couplesVecteurs[swap][1 - swap2],
        )
        v2 = vecteur(
          couplesVecteurs[1 - swap][swap2],
          couplesVecteurs[1 - swap][1 - swap2],
        )
        if (withFractions) {
          if (
            Number.isInteger(v1.x * 2) &&
            Number.isInteger(v1.y * 2) &&
            Number.isInteger(v2.x * 2) &&
            Number.isInteger(v2.y * 2)
          ) {
            den = 2
          } else {
            den = 4
          }
        } else {
          den = 1
        }
      } while (egal(v1.x * v2.y - v1.y * v2.x, 0, 0.0000001)) // On s'assure que les vecteurs ne sont pas colinéaires
      sommets.push({ x: 0, y: 0, nom: noms[0], visible: choix !== 4, p: null })
      sommets.push({
        x: v1.x,
        y: v1.y,
        nom: noms[1],
        visible: choix !== 3,
        p: null,
      })
      sommets.push({
        x: v1.x + v2.x,
        y: v1.y + v2.y,
        nom: noms[2],
        visible: choix !== 2,
        p: null,
      })
      sommets.push({
        x: v2.x,
        y: v2.y,
        nom: noms[3],
        visible: choix !== 1,
        p: null,
      })

      let xMin: number
      let yMin: number
      let xMax: number
      let yMax: number
      xMin = Math.min(...sommets.map((s) => s.x))
      yMin = Math.min(...sommets.map((s) => s.y))
      xMax = Math.max(...sommets.map((s) => s.x))
      yMax = Math.max(...sommets.map((s) => s.y))

      if (withRelatifs) {
        const deltaX = randint(-2 * den, 2 * den, 0) / den
        const deltaY = randint(-2 * den, 2 * den, 0) / den
        sommets.forEach((s) => {
          s.x += deltaX
          s.y += deltaY
        })
        xMin += deltaX
        yMin += deltaY
        xMax += deltaX
        yMax += deltaY
      } else {
        const deltaX = xMin <= 0 ? -xMin + randint(0, 2 * den) / den : 0
        const deltaY = yMin <= 0 ? -yMin + randint(0, 2 * den) / den : 0
        sommets.forEach((s) => {
          s.x += deltaX
          s.y += deltaY
        })
        xMin += deltaX
        yMin += deltaY
        xMax += deltaX
        yMax += deltaY
      }
      for (let j = 0; j < 4; j++) {
        sommets[j].p = pointAbstrait(sommets[j].x, sommets[j].y, sommets[j].nom)
      }
      const repbuilder = new RepereBuilder({
        xMin: Math.min(Math.floor(xMin - 1), 0),
        yMin: Math.min(Math.floor(yMin - 1), 0),
        xMax: Math.max(Math.ceil(xMax + 1) + 0.5, 1.5),
        yMax: Math.max(Math.ceil(yMax + 1) + 0.5, 1.5),
      })
        .setThickX({
          xMin: withRelatifs ? xMin - 1.1 : 0,
          xMax: xMax + 1.1,
          dx: 1,
        })
        .setThickY({
          yMin: withRelatifs ? yMin - 1.1 : 0,
          yMax: yMax + 1.1,
          dy: 1,
        })
        .setGrille({
          grilleX: {
            xMin: withRelatifs ? Math.floor(xMin - 1) : 0,
            xMax: Math.ceil(xMax + 1),
            dx: 1,
          },
          grilleY: {
            yMin: withRelatifs ? Math.floor(yMin - 1) : 0,
            yMax: Math.ceil(yMax + 1),
            dy: 1,
          },
        })
      if (withFractions) {
        repbuilder.setGrilleSecondaire({
          grilleX: {
            xMin: withRelatifs ? Math.floor(xMin - 1) : 0,
            xMax: Math.ceil(xMax + 1),
            dx: 1 / den,
          },
          grilleY: {
            yMin: withRelatifs ? Math.floor(yMin - 1) : 0,
            yMax: Math.ceil(yMax + 1),
            dy: 1 / den,
          },
        })
      }
      const rep = repbuilder.buildCustom()
      objetsEnonce.push(rep)
      objetsCorrection.push(rep)
      if (withSides) {
        for (let c = 0; c < 4; c++) {
          if (sommets[c % 4].visible && sommets[(c + 1) % 4].visible) {
            const p1 = sommets[c].p
            const p2 = sommets[(c + 1) % 4].p
            if (p1 != null && p2 != null) {
              objetsEnonce.push(segment(p1, p2))
            }
          }
        }
      }
      const points = sommets.map((s) => s.p).filter((p) => p !== null)
      const pointsVisibles = points
        .map((p, index) => (sommets[index].visible ? p : null))
        .filter((p) => p !== null)
      const pointInvisible = points.find((p, index) => !sommets[index].visible)
      const poly = polygone(...points)
      const trace = tracePoint(...pointsVisibles)
      trace.epaisseur = 2
      const centre = {
        x: (sommets[0].x + sommets[2].x) / 2,
        y: (sommets[0].y + sommets[2].y) / 2,
      }
      const labels = pointsVisibles.map((p) => {
        return latex2d(
          p.nom,
          p.x + 0.3 * (p.x > centre.x ? 1 : -1),
          p.y + 0.3 * (p.y > centre.y ? 1 : -1),
          { color: 'black', letterSize: 'small' },
        )
      })
      objetsEnonce.push(trace, labels)
      objetsCorrection.push(trace, labels, poly)
      if (pointInvisible) {
        const trace = tracePoint(pointInvisible, orangeMathalea)
        trace.epaisseur = 2

        objetsCorrection.push(
          trace,
          latex2d(
            pointInvisible.nom,
            pointInvisible.x + 0.3 * (pointInvisible.x > centre.x ? 1 : -1),
            pointInvisible.y + 0.3 * (pointInvisible.y > centre.y ? 1 : -1),
            { color: orangeMathalea, letterSize: 'small' },
          ),
        )
      }
      texte += `Dans le repère ci-dessous, donner les coordonnées du sommet $${noms[4 - choix]}$ du parallélogramme $${nom}$.`
      if (pointInvisible) {
        texte += ajouteQuestionMathlive({
          exercice: this,
          question: i,
          typeInteractivite: 'fillInTheBlank',
          reponseParams: { formatInteractif: 'fill-in-the-blank' },
          content: `${pointInvisible.nom}(%{champ1}~;~%{champ2})`,
          objetReponse: {
            champ1: { value: pointInvisible.x },
            champ2: { value: pointInvisible.y },
          },
          texteAvant: '<br>',
        })
        texte += mathalea2d(
          Object.assign({ pixelsParCm: 30 }, fixeBordures(objetsEnonce)),
          objetsEnonce,
        )
        texteCorr += mathalea2d(
          Object.assign({ pixelsParCm: 30 }, fixeBordures(objetsCorrection)),
          objetsCorrection,
        )
        if (this.correctionDetaillee) {
          let dx: number
          let dy: number
          let plurielX = ''
          let plurielY = ''
          let sensX = ''
          let sensY = ''
          switch (choix) {
            case 1:
              dx = sommets[2].x - sommets[1].x
              dy = sommets[2].y - sommets[1].y
              sensX = dx > 0 ? 'droite' : 'gauche'
              sensY = dy > 0 ? 'haut' : 'bas'
              plurielX = Math.abs(dx) > 1 ? 's' : ''
              plurielY = Math.abs(dy) > 1 ? 's' : ''
              texteCorr += `Les segments $[${noms[0]}${noms[3]}]$ et $[${noms[1]}${noms[2]}]$ sont parallèles, de même longueur et $${nom}$ est un quadrilatère non croisé.<br>
              On peut donc compter les déplacements horizontaux et verticaux à partir de $${noms[1]}$ jusqu'à $${noms[2]}$, puis reproduire les mêmes déplacements à partir de $${noms[0]}$.<br>
              On se déplace de $${texNombre(Math.abs(dx), 2)}$ unité${plurielX} vers la ${sensX}, et de $${texNombre(Math.abs(dy), 2)}$ unité${plurielY} vers le ${sensY}.<br>`
              break
            case 2:
              dx = sommets[3].x - sommets[0].x
              dy = sommets[3].y - sommets[0].y
              sensX = dx > 0 ? 'droite' : 'gauche'
              sensY = dy > 0 ? 'haut' : 'bas'
              plurielX = Math.abs(dx) > 1 ? 's' : ''
              plurielY = Math.abs(dy) > 1 ? 's' : ''
              texteCorr += `Les segments $[${noms[0]}${noms[1]}]$ et $[${noms[2]}${noms[3]}]$ sont parallèles, de même longueur et $${nom}$ est un quadrilatère non croisé.<br>
              On peut donc compter les déplacements horizontaux et verticaux à partir de $${noms[0]}$ jusqu'à $${noms[1]}$, puis reproduire les mêmes déplacements à partir de $${noms[2]}$.<br>
              On se déplace de $${texNombre(Math.abs(dx), 2)}$ unité${plurielX} vers la ${sensX}, et de $${texNombre(Math.abs(dy), 2)}$ unité${plurielY} vers le ${sensY}.<br>`
              break
            case 3:
              dx = sommets[1].x - sommets[0].x
              dy = sommets[1].y - sommets[0].y
              sensX = dx > 0 ? 'droite' : 'gauche'
              sensY = dy > 0 ? 'haut' : 'bas'
              plurielX = Math.abs(dx) > 1 ? 's' : ''
              plurielY = Math.abs(dy) > 1 ? 's' : ''
              texteCorr += `Les segments $[${noms[0]}${noms[2]}]$ et $[${noms[1]}${noms[3]}]$ sont parallèles, de même longueur et $${nom}$ est un quadrilatère non croisé.<br>
              On peut donc compter les déplacements horizontaux et verticaux à partir de $${noms[0]}$ jusqu'à $${noms[2]}$, puis reproduire les mêmes déplacements à partir de $${noms[1]}$.<br>
              On se déplace de $${texNombre(Math.abs(dx), 2)}$ unité${plurielX} vers la ${sensX}, et de $${texNombre(Math.abs(dy), 2)}$ unité${plurielY} vers le ${sensY}.<br>`
              break
            case 4:
              dx = sommets[3].x - sommets[2].x
              dy = sommets[3].y - sommets[2].y
              sensX = dx > 0 ? 'droite' : 'gauche'
              sensY = dy > 0 ? 'haut' : 'bas'
              plurielX = Math.abs(dx) > 1 ? 's' : ''
              plurielY = Math.abs(dy) > 1 ? 's' : ''
              texteCorr += `Les segments $[${noms[0]}${noms[3]}]$ et $[${noms[1]}${noms[2]}]$ sont parallèles, de même longueur et $${nom}$ est un quadrilatère non croisé.<br>
              On peut donc compter les déplacements horizontaux et verticaux à partir de $${noms[0]}$ jusqu'à $${noms[3]}$, puis reproduire les mêmes déplacements à partir de $${noms[1]}$.<br>
              On se déplace de $${texNombre(Math.abs(dx), 2)}$ unité${plurielX} vers la ${sensX}, et de $${texNombre(Math.abs(dy), 2)}$ unité${plurielY} vers le ${sensY}.<br>`
              break
          }
        }
        texteCorr += `Les coordonnées du sommet $${noms[4 - choix]}$ sont : $${miseEnEvidence(`(~${texNombre(pointInvisible.x, 2)}~;~${texNombre(pointInvisible.y, 2)}~)`)}$.`
      }
      if (this.questionJamaisPosee(i, nom)) {
        this.listeQuestions.push(texte)
        this.listeCorrections.push(texteCorr)
        i++
      }
      cpt++
      listeQuestionsToContenu(this)
    }
  }
}
