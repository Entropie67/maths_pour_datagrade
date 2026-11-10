import { fixeBordures } from '../../lib/2d/fixeBordures'
import { PointAbstrait, pointAbstrait } from '../../lib/2d/PointAbstrait'
import { polygone } from '../../lib/2d/polygones'
import RepereBuilder from '../../lib/2d/RepereBuilder'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { vecteur, type Vecteur } from '../../lib/2d/Vecteur'
import { orangeMathalea } from '../../lib/colors'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { ajouteQuestionMathlive } from '../../lib/interactif/questionMathLive'
import { choisitLettresDifferentes } from '../../lib/outils/aleatoires'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
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
  "Déterminer les coordonnées du centre ou de sommets d'un parallélogramme"
export const dateDePublication = '25/05/2025'
export const interactifReady = true

/**
 * @author Jean-claude Lhote
 */
export const uuid = '37e39'

export const refs = {
  'fr-fr': ['5G1B-5'],
  'fr-2016': ['5G42-3'],
  'fr-ch': ['9R1ES5A-5', '9R2ES5A-5', '9R3ES5A-5', 'PRQPF02A-5'],
}
const couplesVecteursEntiers = [
  [
    [5, -2],
    [1, 3],
  ],
  [
    [-3, 4],
    [1, 2],
  ],
  [
    [2, 3],
    [4, -1],
  ],
  [
    [-2, -3],
    [4, 2],
  ],
  [
    [3, -1],
    [-1, 4],
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
    [-3, 2],
    [2, 4],
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
    [4, -1.5],
    [-2.5, 3.5],
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
    [2.5, -3],
    [2, 2.5],
  ],
]

export default class ConstructionsParallelogrammesParticuliersV3 extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireTexte = [
      'Choix des questions',
      'Nombres séparés par des tirets :\n1 : Coordonnées du centre (4 sommets)\n2 : Coordonnées du centre (3 sommets)\n3 : Coordonnées de 2 points (centre donné)\n4 Mélange',
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
      max: 3,
      melange: 4,
      defaut: 1,
      nbQuestions: this.nbQuestions,
    }).map(Number)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''

      // On prépare la figure...
      const noms = choisitLettresDifferentes(5, 'QOX', true) // on choisit 5 lettres, les 4 premières sont les sommets, la 5e est le centre
      const nom = noms.slice(0, 4).join('')
      const objetsEnonce: NestedObjetMathalea2dArray = []
      const objetsCorrection: NestedObjetMathalea2dArray = []
      const withFractions = this.sup2
      const withRelatifs = this.sup3
      const withSides = this.sup4
      const choix = listeTypeDeQuestion[i] // 1, 2, ou 3
      const sommets: {
        x: number
        y: number
        nom: string
        visible: boolean
        p?: PointAbstrait
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
        let entier: boolean = true
        do {
          v1 = vecteur(
            couplesVecteurs[swap][swap2],
            couplesVecteurs[swap][1 - swap2],
          )
          v2 = vecteur(
            couplesVecteurs[1 - swap][swap2],
            couplesVecteurs[1 - swap][1 - swap2],
          )
          entier = !withFractions
        } while (
          entier &&
          !(Number.isInteger(v1.x + v2.x) && Number.isInteger(v1.y + v2.y))
        )
        if (withFractions) den = 2
        else den = 1
      } while (egal(v1.x * v2.y - v1.y * v2.x, 0, 0.0000001)) // On s'assure que les vecteurs ne sont pas colinéaires
      const choixSommetsVisibles =
        choix === 1
          ? [0, 1, 2, 3]
          : choix === 2
            ? choice([
                [0, 1, 2],
                [1, 2, 3],
                [0, 2, 3],
              ])
            : choice([
                [0, 1],
                [1, 2],
                [2, 3],
                [3, 0],
              ])
      sommets.push({ x: 0, y: 0, nom: noms[0], visible: choix !== 4 })
      sommets.push({ x: v1.x, y: v1.y, nom: noms[1], visible: choix !== 3 })
      sommets.push({
        x: v1.x + v2.x,
        y: v1.y + v2.y,
        nom: noms[2],
        visible: choix !== 2,
      })
      sommets.push({ x: v2.x, y: v2.y, nom: noms[3], visible: choix !== 1 })
      sommets.forEach((s, index) => {
        s.visible = choixSommetsVisibles.includes(index)
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
      repbuilder.setGrilleSecondaire({
        grilleX: {
          xMin: withRelatifs ? Math.floor(xMin - 1) : 0,
          xMax: Math.ceil(xMax + 1),
          dx: 1 / 2,
        },
        grilleY: {
          yMin: withRelatifs ? Math.floor(yMin - 1) : 0,
          yMax: Math.ceil(yMax + 1),
          dy: 1 / 2,
        },
      })
      const rep = repbuilder.buildCustom()
      objetsEnonce.push(rep)
      objetsCorrection.push(rep)
      const centre: PointAbstrait = pointAbstrait(
        (sommets[0].x + sommets[2].x) / 2,
        (sommets[0].y + sommets[2].y) / 2,
        noms[4],
      )
      sommets.push({
        x: centre.x,
        y: centre.y,
        nom: noms[4],
        visible: choix === 3,
        p: centre,
      })
      const traceCentre = tracePoint(centre, orangeMathalea)
      traceCentre.epaisseur = 2
      traceCentre.taille = 4
      objetsCorrection.push(centre)
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
      const sommetsPara = sommets
        .slice(0, 4)
        .map((s) => pointAbstrait(s.x, s.y, s.nom))
      objetsCorrection.push(polygone(...sommetsPara))
      const diag1 = segment(sommetsPara[0], sommetsPara[2], 'green')
      const diag2 = segment(sommetsPara[1], sommetsPara[3], 'green')
      diag1.epaisseur = 2
      diag2.epaisseur = 2
      diag1.pointilles = 4
      diag2.pointilles = 4
      objetsCorrection.push(diag1, diag2)
      const pointsVisibles: PointAbstrait[] = []
      for (let j = 0; j < sommets.length; j++) {
        if (sommets[j].visible) {
          const p = sommets[j].p
          if (p != null) pointsVisibles.push(p)
        }
      }
      const pointsInvisibles: PointAbstrait[] = []
      for (let j = 0; j < sommets.length; j++) {
        if (!sommets[j].visible) {
          const p = sommets[j].p
          if (p != null) pointsInvisibles.push(p)
        }
      }
      if (pointsInvisibles.length > 0 && pointsVisibles.length > 0) {
        const trace = tracePoint(...pointsVisibles)
        trace.epaisseur = 2
        trace.taille = 4
        const labels = pointsVisibles.map((p) => {
          return latex2d(
            p.nom,
            p.x + 0.3 * (p.x > centre.x ? 1 : -1),
            p.y + 0.3 * (p.y > centre.y ? 1 : -1),
            { color: 'black', letterSize: 'small' },
          )
        })
        objetsEnonce.push(trace, labels)
        objetsCorrection.push(trace, labels)
        const trace2 = tracePoint(...pointsInvisibles, orangeMathalea)
        const labels2 = pointsInvisibles.map((p) => {
          return latex2d(
            p.nom,
            p.x + 0.3 * (p.x > centre.x ? 1 : -1),
            p.y + 0.3 * (p.y > centre.y ? 1 : -1),
            { color: orangeMathalea, letterSize: 'small' },
          )
        })
        trace2.epaisseur = 2
        trace2.taille = 4
        objetsCorrection.push(trace2, labels2)
      }
      texte +=
        choix === 1 || choix === 2
          ? `Dans le repère ci-dessous, donner les coordonnées du centre $${noms[4]}$ du parallélogramme $${nom}$${choix === 2 ? ' dont on a placé $3$ sommets' : ''}.<br>`
          : `Dans le repère ci-dessous, donner les coordonnées des points manquants pour que $${nom}$ soit un parallélogramme de centre $${noms[4]}$.<br>`
      if (pointsInvisibles) {
        if (choix === 3) {
          texte += ajouteQuestionMathlive({
            exercice: this,
            question: i,
            typeInteractivite: 'fillInTheBlank',
            reponseParams: { formatInteractif: 'fill-in-the-blank' },
            content: `${pointsInvisibles.map((el, index) => `${el.nom} : (~%{champ${index * 2 + 1}}~;~%{champ${index * 2 + 2}}~)`).join('~~et~~')}`,
            objetReponse: {
              champ1: { value: pointsInvisibles[0].x },
              champ2: { value: pointsInvisibles[0].y },
              champ3: { value: pointsInvisibles[1].x },
              champ4: { value: pointsInvisibles[1].y },
              bareme: (listePoints: number[]) => {
                return [
                  Math.min(listePoints[0], listePoints[1]) +
                    Math.min(listePoints[2], listePoints[3]),
                  2,
                ]
              },
            },
          })
        } else {
          texte += ajouteQuestionMathlive({
            exercice: this,
            question: i,
            typeInteractivite: 'fillInTheBlank',
            reponseParams: { formatInteractif: 'fill-in-the-blank' },
            content: `\\text{Coordonnées du centre } ${noms[4]}:~(~%{champ1}~;~%{champ2}~)`,
            objetReponse: {
              champ1: { value: centre.x },
              champ2: { value: centre.y },
              bareme: toutAUnPoint,
            },
          })
        }
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
          let sensX: string
          let sensY: string
          let plurielX: string
          let plurielY: string
          let plurielX2: string
          let plurielY2: string
          let indicesSommetsVisibles: [number, number] = [0, 0]
          switch (choix) {
            case 1:
              dx = sommets[2].x - sommets[0].x
              dy = sommets[2].y - sommets[0].y
              sensX = dx > 0 ? 'droite' : 'gauche'
              sensY = dy > 0 ? 'haut' : 'bas'
              plurielX = Math.abs(dx) > 1 ? 's' : ''
              plurielY = Math.abs(dy) > 1 ? 's' : ''
              plurielX2 = Math.abs(dx / 2) > 1 ? 's' : ''
              plurielY2 = Math.abs(dy / 2) > 1 ? 's' : ''
              texteCorr += `Comme le centre du parallélogramme $${nom}$ est le milieu de ses diagonales, il suffit de chercher les coordonnées du milieu de $[${sommets[0].nom}${sommets[2].nom}]$.<br>
              On effectue la moitié des déplacements horizontaux et verticaux de $${sommets[0].nom}$ à $${sommets[2].nom}$, on trouve ainsi ce milieu.<br>
              Comme on se déplace de $${texNombre(Math.abs(dx), 2)}$ unité${plurielX} vers la ${sensX}, et de $${texNombre(Math.abs(dy), 2)}$ unité${plurielY} vers le ${sensY} pour aller de $${sommets[0].nom}$ à $${sommets[2].nom}$,
              on doit se déplacer de $${texNombre(Math.abs(dx / 2), 2)}$ unité${plurielX2} vers la ${sensX}, et de $${texNombre(Math.abs(dy / 2), 2)}$ unité${plurielY2} vers le ${sensY} pour aller de $${sommets[0].nom}$ à $${sommets[4].nom}$.<br>`
              break
            case 2:
              for (let j = 0; j < choixSommetsVisibles.length; j++) {
                if (
                  choixSommetsVisibles.includes(
                    choixSommetsVisibles[j] + (2 % 4),
                  )
                ) {
                  indicesSommetsVisibles = [
                    choixSommetsVisibles[j],
                    (choixSommetsVisibles[j] + 2) % 4,
                  ]
                  break
                }
              }
              if (indicesSommetsVisibles.length !== 2) {
                throw new Error('Indices des sommets visibles incorrects')
              }
              dx =
                sommets[indicesSommetsVisibles[1]].x -
                sommets[indicesSommetsVisibles[0]].x
              dy =
                sommets[indicesSommetsVisibles[1]].y -
                sommets[indicesSommetsVisibles[0]].y
              sensX = dx > 0 ? 'droite' : 'gauche'
              sensY = dy > 0 ? 'haut' : 'bas'
              plurielX = Math.abs(dx) > 1 ? 's' : ''
              plurielY = Math.abs(dy) > 1 ? 's' : ''
              plurielX2 = Math.abs(dx / 2) > 1 ? 's' : ''
              plurielY2 = Math.abs(dy / 2) > 1 ? 's' : ''
              texteCorr += `Comme le centre du parallélogramme $${nom}$ est le milieu de ses diagonales, il suffit de chercher les coordonnées du milieu de $[${sommets[indicesSommetsVisibles[0]].nom}${sommets[indicesSommetsVisibles[1]].nom}]$.<br>
              On effectue la moitié des déplacements horizontaux et verticaux de $${sommets[indicesSommetsVisibles[0]].nom}$ à $${sommets[indicesSommetsVisibles[1]].nom}$, on trouve ainsi ce milieu.<br>
              Comme on se déplace de $${texNombre(Math.abs(dx), 2)}$ unité${plurielX} vers la ${sensX}, et de $${texNombre(Math.abs(dy), 2)}$ unité${plurielY} vers le ${sensY} pour aller de $${sommets[indicesSommetsVisibles[0]].nom}$ à $${sommets[indicesSommetsVisibles[1]].nom}$,
              on doit se déplacer de $${texNombre(Math.abs(dx / 2), 2)}$ unité${plurielX2} vers la ${sensX}, et de $${texNombre(Math.abs(dy / 2), 2)}$ unité${plurielY2} vers le ${sensY} pour aller de $${sommets[indicesSommetsVisibles[0]].nom}$ à $${sommets[4].nom}$.<br>`
              break
            case 3:
              dx = sommets[4].x - sommets[indicesSommetsVisibles[0]].x
              dy = sommets[4].y - sommets[indicesSommetsVisibles[0]].y
              sensX = dx > 0 ? 'droite' : 'gauche'
              sensY = dy > 0 ? 'haut' : 'bas'
              plurielX = Math.abs(dx) > 1 ? 's' : ''
              plurielY = Math.abs(dy) > 1 ? 's' : ''
              texteCorr += `Pour trouver les sommets manquants, il suffit d'appliquer la symétrie centrale de centre $${noms[4]}$ aux points $${sommets[choixSommetsVisibles[0]].nom}$ et $${sommets[choixSommetsVisibles[1]].nom}$.<br>
              On effectue le double des déplacements horizontaux et verticaux des points $${sommets[choixSommetsVisibles[0]].nom}$ et $${sommets[choixSommetsVisibles[1]].nom}$ jusqu'à $${noms[4]}$, on trouve ainsi les points $${sommets[(choixSommetsVisibles[0] + 2) % 4].nom}$ et $${sommets[(choixSommetsVisibles[1] + 2) % 4].nom}$.<br>
             Par exemple, comme on se déplace de $${texNombre(Math.abs(dx), 2)}$ unité${plurielX} vers la ${sensX}, et de $${texNombre(Math.abs(dy), 2)}$ unité${plurielY} vers le ${sensY} pour aller de $${sommets[indicesSommetsVisibles[0]].nom}$ à $${sommets[4].nom}$,
              on doit se déplacer aussi de $${texNombre(Math.abs(dx), 2)}$ unité${plurielX} vers la ${sensX}, et de $${texNombre(Math.abs(dy), 2)}$ unité${plurielY} vers le ${sensY} pour aller de $${sommets[4].nom}$ à $${sommets[(indicesSommetsVisibles[0] + 2) % 4].nom}$.<br>`
              break
          }
        }
        texteCorr +=
          choix === 3
            ? `Les coordonnées des points manquants sont ${pointsInvisibles.map((p) => `$${miseEnEvidence(`${p.nom}(${texNombre(p.x)}, ${texNombre(p.y)})`)}$`).join(` ${texteEnCouleurEtGras('et')} `)}.`
            : `Les coordonnées du centre $${noms[4]}$ du parallélogramme $${nom}$ sont : $${miseEnEvidence(`(~${texNombre(centre.x, 2)}~;~${texNombre(centre.y, 2)})`)}$.`
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
