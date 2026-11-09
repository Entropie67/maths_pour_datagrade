import { arc } from '../../lib/2d/Arc'
import { afficheLongueurSegment } from '../../lib/2d/afficheLongueurSegment'
import { pointAbstrait, type PointAbstrait } from '../../lib/2d/PointAbstrait'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { addMathaleaQcm } from '../../lib/customElements/MathaleaQcm'
import { bleuMathalea } from '../../lib/colors'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { propositionsQcm } from '../../lib/interactif/qcm'
import { shuffle } from '../../lib/outils/arrayOutils'
import {
  texteEnCouleur,
  texteEnCouleurEtGras,
} from '../../lib/outils/embellissements'
import { creerNomDePolygone, sp } from '../../lib/outils/outilString'
import { texNombre } from '../../lib/outils/texNombre'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import {
  gestionnaireFormulaireTexte,
  listeQuestionsToContenu,
  randint,
} from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'

export const titre = 'Déterminer si un triangle est constructible'
export const dateDePublication = '11/10/2026'
export const interactifReady = true

/**
 * Déterminer si on peut construire un triangle dont on connaît les trois longueurs
 * en traçant le plus grand côté puis deux arcs de cercle.
 * @author Rémi Angot
 */
export const uuid = '45750'

export const refs = {
  'fr-fr': ['6G6A-9'],
  'fr-2016': [],
  'fr-ch': ['9R1ES2C-3', '9R2ES2C-3', '9R3ES2C-3'],
}

const degresVersRadians = Math.PI / 180
// Les arcs dépassent de cet angle (en degrés) de part et d'autre du point d'intersection
const depassementArc = 20

/** Arc de cercle de centre `centre` et de rayon `rayon` (en cm) entre deux angles en degrés. */
function arcDeCercle(
  centre: PointAbstrait,
  rayon: number,
  angleDebut: number,
  angleFin: number,
) {
  const debut = pointAbstrait(
    centre.x + rayon * Math.cos(angleDebut * degresVersRadians),
    centre.y + rayon * Math.sin(angleDebut * degresVersRadians),
  )
  return arc(debut, centre, angleFin - angleDebut)
}

/** Ordonnée maximale d'un arc de centre sur l'axe des abscisses. */
function hauteurArc(rayon: number, angleDebut: number, angleFin: number) {
  if (angleDebut <= 90 && angleFin >= 90) return rayon
  return (
    rayon *
    Math.max(
      Math.sin(angleDebut * degresVersRadians),
      Math.sin(angleFin * degresVersRadians),
    )
  )
}

/**
 * Tire trois longueurs entières (en cm) dont la plus grande est strictement plus grande
 * (constructible = false) ou strictement plus petite (constructible = true) que la somme des deux autres.
 */
function tireLongueurs(constructible: boolean): [number, number, number] {
  if (constructible) {
    const a = randint(3, 9)
    const b = randint(3, 9)
    const c = randint(Math.abs(a - b) + 2, a + b - 2)
    return [a, b, c]
  }
  const a = randint(2, 7)
  const b = randint(2, 7)
  const c = a + b + randint(2, 4)
  return [a, b, c]
}

export default class DeterminerSiTriangleConstructible extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Type de triangles',
      [
        'Nombres séparés par des tirets :',
        '1 : Triangle constructible',
        '2 : Triangle non constructible',
        '3 : Mélange',
      ].join('\n'),
    ]
    this.sup = '3'
  }

  nouvelleVersion() {
    const listeTypesDeQuestions = gestionnaireFormulaireTexte({
      min: 1,
      max: 2,
      defaut: 3,
      melange: 3,
      nbQuestions: this.nbQuestions,
      saisie: this.sup,
    }).map(Number)
    const listeDeNomsDePolygones: string[] = []

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const constructible = listeTypesDeQuestions[i] === 1
      const nom = creerNomDePolygone(3, listeDeNomsDePolygones)
      const [s0, s1, s2] = nom.split('')
      // Longueurs de [s0s1], [s0s2] et [s1s2] dans un ordre aléatoire
      const [l01, l02, l12] = shuffle(tireLongueurs(constructible))
      const cotes = [
        { sommets: [s0, s1], longueur: l01, oppose: s2 },
        { sommets: [s0, s2], longueur: l02, oppose: s1 },
        { sommets: [s1, s2], longueur: l12, oppose: s0 },
      ]
      cotes.sort((c1, c2) => c2.longueur - c1.longueur)
      const plusGrandCote = cotes[0]
      const [U, V] = plusGrandCote.sommets
      const W = plusGrandCote.oppose
      const nomDuCote = (sommets: string[]) => `${sommets[0]}${sommets[1]}`
      const longueurDuCote = (p: string, q: string) =>
        cotes.find((c) => c.sommets.includes(p) && c.sommets.includes(q))
          ?.longueur as number
      const L = plusGrandCote.longueur
      const rU = longueurDuCote(U, W)
      const rV = longueurDuCote(V, W)
      const cm = (n: number) => `$${texNombre(n)}${sp()}\\text{cm}$`

      let texte = `Est-il possible de construire un triangle $${nom}$ tel que $${s0 + s1}=${texNombre(l01)}${sp()}\\text{cm}$, $${s0 + s2}=${texNombre(l02)}${sp()}\\text{cm}$ et $${s1 + s2}=${texNombre(l12)}${sp()}\\text{cm}$ ?`

      // Figure de la correction : le plus grand côté puis deux arcs de cercle
      const pointU = pointAbstrait(0, 0, U, 'left')
      const pointV = pointAbstrait(L, 0, V, 'right')
      const plusGrandSegment = segment(pointU, pointV)
      const longueurAffichee = afficheLongueurSegment(
        pointV,
        pointU,
        'black',
        0.5,
        'cm',
        true,
      )
      const objets: NestedObjetMathalea2dArray = [
        plusGrandSegment,
        longueurAffichee,
        tracePoint(pointU, pointV),
      ]
      let texteCorr = `Pour construire le triangle $${nom}$, on commence par tracer le plus grand côté $[${nomDuCote([U, V])}]$ de longueur ${cm(L)}. Ensuite, on trace un arc de cercle de centre $${U}$ et de rayon ${cm(rU)}, puis un arc de cercle de centre $${V}$ et de rayon ${cm(rV)}. Le point $${W}$ doit se trouver à l'intersection de ces deux arcs.<br>`
      let conclusion: string
      let remarque: string
      // Arcs de cercle (angles en degrés) : [début, fin] autour de U et autour de V
      let anglesArcU: [number, number]
      let anglesArcV: [number, number]
      if (constructible) {
        const x = (L * L + rU * rU - rV * rV) / (2 * L)
        const y = Math.sqrt(rU * rU - x * x)
        const angleU = Math.atan2(y, x) / degresVersRadians
        const angleV = Math.atan2(y, x - L) / degresVersRadians
        anglesArcU = [0, angleU + depassementArc]
        anglesArcV = [angleV - depassementArc, 180]
        objets.push(
          tracePoint(pointAbstrait(x, y)),
          labelPoint(pointU, pointV, pointAbstrait(x, y, W, 'above')),
        )
        conclusion = `Les deux arcs de cercle ont bien un point d'intersection, donc ${texteEnCouleurEtGras('le triangle est constructible')}.`
        remarque = `Ici, $${nomDuCote([U, V])}\\lt ${nomDuCote([U, W])}+${nomDuCote([V, W])}$ car $${texNombre(L)}${sp()}\\text{cm}\\lt ${texNombre(rU)}${sp()}\\text{cm}+${texNombre(rV)}${sp()}\\text{cm}$, donc le triangle peut être tracé.`
      } else {
        anglesArcU = [0, 70]
        anglesArcV = [110, 180]
        objets.push(labelPoint(pointU, pointV))
        conclusion = `Les deux arcs de cercle n'ont pas de point d'intersection, donc ${texteEnCouleurEtGras("le triangle n'est pas constructible")}.`
        remarque = `Ici, $${nomDuCote([U, V])}>${nomDuCote([U, W])}+${nomDuCote([V, W])}$ car $${texNombre(L)}${sp()}\\text{cm}>${texNombre(rU)}${sp()}\\text{cm}+${texNombre(rV)}${sp()}\\text{cm}$, donc il est impossible de tracer ce triangle.`
      }
      objets.push(
        arcDeCercle(pointU, rU, ...anglesArcU),
        arcDeCercle(pointV, rV, ...anglesArcV),
      )
      const parametresFigure = {
        xmin: -1.5,
        xmax: L + 1.5,
        ymin: -1.5,
        ymax:
          Math.max(
            hauteurArc(rU, ...anglesArcU),
            hauteurArc(rV, ...anglesArcV),
          ) + 1.5,
        pixelsParCm: 20,
        scale: Math.min(1, 12 / L),
      }
      texteCorr += mathalea2d(parametresFigure, objets)
      texteCorr += `<br>${conclusion}`
      texteCorr += `<br><br>${texteEnCouleur(`Remarque : il suffit de comparer la longueur du plus grand côté à la somme des longueurs des deux autres. Si la longueur du plus grand côté est plus petite que cette somme, le triangle peut être tracé. ${remarque}`, bleuMathalea)}`

      if (this.questionJamaisPosee(i, l01, l02, l12)) {
        listeDeNomsDePolygones.push(nom)
        const propositions = [
          { texte: 'Oui', statut: constructible },
          { texte: 'Non', statut: !constructible },
        ]
        const qcmOptions = { radio: true, vertical: false }
        handleAnswers(
          this,
          i,
          {
            qcm: {
              enonce: texte,
              propositions,
              correction: texteCorr,
              options: qcmOptions,
            },
          },
          { formatInteractif: 'mathalea-qcm' },
        )
        if (context.isHtml) {
          texte += addMathaleaQcm(this, i, {
            ...qcmOptions,
            interactivityOn: this.interactif,
          })
        } else if (!context.isAmc) {
          const qcmLatex = propositionsQcm(this, i)
          texte += qcmLatex.texte
          texteCorr += qcmLatex.texteCorr
        }
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
