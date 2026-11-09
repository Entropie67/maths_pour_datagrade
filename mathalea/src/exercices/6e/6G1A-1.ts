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

export const titre =
  "Déterminer s'il est possible de placer un point à des distances données de deux points"
export const dateDePublication = '11/10/2026'
export const interactifReady = true

/**
 * Déterminer s'il est possible de placer un point à des distances données de deux points
 * en traçant le segment joignant les deux points puis deux arcs de cercle.
 * @author Rémi Angot
 */
export const uuid = '6c1d0'

export const refs = {
  'fr-fr': ['6G1A-1'],
  'fr-2016': [],
  'fr-ch': ['PRQES02C-8', '9R1ES7B-3', '9R2ES7B-3', '9R3ES7B-3'],
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
 * Tire trois distances entières (en cm) : KL est la plus grande des trois et elle est
 * strictement plus petite (possible = true) ou strictement plus grande (possible = false)
 * que la somme des deux autres.
 */
function tireDistances(possible: boolean): [number, number, number] {
  if (possible) {
    const a = randint(3, 9)
    const b = randint(3, 9)
    const kl = randint(Math.max(a, b), a + b - 2)
    return [kl, a, b]
  }
  const a = randint(2, 7)
  const b = randint(2, 7)
  const kl = a + b + randint(2, 4)
  return [kl, a, b]
}

export default class DeterminerSiPointPlacable extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 3
    this.besoinFormulaireTexte = [
      'Type de questions',
      [
        'Nombres séparés par des tirets :',
        '1 : Point qui peut être placé',
        '2 : Point qui ne peut pas être placé',
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
    const listeDeNomsDePoints: string[] = []

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const possible = listeTypesDeQuestions[i] === 1
      const nom = creerNomDePolygone(3, listeDeNomsDePoints)
      const [K, L, J] = nom.split('')
      const [dKL, dKJ, dLJ] = tireDistances(possible)
      const cm = (n: number) => `$${texNombre(n)}${sp()}\\text{cm}$`

      let texte = `On place deux points $${K}$ et $${L}$ tels que $${K + L}=${texNombre(dKL)}${sp()}\\text{cm}$.<br>Est-il possible de placer un point $${J}$ tel que $${K + J}=${texNombre(dKJ)}${sp()}\\text{cm}$ et $${L + J}=${texNombre(dLJ)}${sp()}\\text{cm}$ ?`

      // Figure de la correction : le segment [KL] puis deux arcs de cercle
      const pointK = pointAbstrait(0, 0, K, 'left')
      const pointL = pointAbstrait(dKL, 0, L, 'right')
      const longueurAffichee = afficheLongueurSegment(
        pointL,
        pointK,
        'black',
        0.5,
        'cm',
        true,
      )
      const objets: NestedObjetMathalea2dArray = [
        segment(pointK, pointL),
        longueurAffichee,
        tracePoint(pointK, pointL),
      ]
      let texteCorr = `Pour placer le point $${J}$, on commence par tracer le segment $[${K + L}]$ de longueur ${cm(dKL)}. Le point $${J}$ doit être à ${cm(dKJ)} du point $${K}$ : on trace donc un arc de cercle de centre $${K}$ et de rayon ${cm(dKJ)}. Il doit aussi être à ${cm(dLJ)} du point $${L}$ : on trace donc un arc de cercle de centre $${L}$ et de rayon ${cm(dLJ)}. Le point $${J}$ doit se trouver à l'intersection de ces deux arcs.<br>`
      let conclusion: string
      let remarque: string
      // Arcs de cercle (angles en degrés) : [début, fin] autour de K et autour de L
      let anglesArcK: [number, number]
      let anglesArcL: [number, number]
      if (possible) {
        const x = (dKL * dKL + dKJ * dKJ - dLJ * dLJ) / (2 * dKL)
        const y = Math.sqrt(dKJ * dKJ - x * x)
        const angleK = Math.atan2(y, x) / degresVersRadians
        const angleL = Math.atan2(y, x - dKL) / degresVersRadians
        anglesArcK = [0, angleK + depassementArc]
        anglesArcL = [angleL - depassementArc, 180]
        objets.push(
          tracePoint(pointAbstrait(x, y)),
          labelPoint(pointK, pointL, pointAbstrait(x, y, J, 'above')),
        )
        conclusion = `Les deux arcs de cercle ont un point d'intersection, donc il est possible de placer le point $${J}$.<br>La réponse est ${texteEnCouleurEtGras('Oui')}.`
        remarque = `Ici, $${K + L}\\lt ${K + J}+${L + J}$ car $${texNombre(dKL)}${sp()}\\text{cm}\\lt ${texNombre(dKJ)}${sp()}\\text{cm}+${texNombre(dLJ)}${sp()}\\text{cm}$, donc le point $${J}$ peut être placé.`
      } else {
        anglesArcK = [0, 70]
        anglesArcL = [110, 180]
        objets.push(labelPoint(pointK, pointL))
        conclusion = `Les deux arcs de cercle n'ont pas de point d'intersection, donc il n'est pas possible de placer le point $${J}$.<br>La réponse est ${texteEnCouleurEtGras('Non')}.`
        remarque = `Ici, $${K + L}>${K + J}+${L + J}$ car $${texNombre(dKL)}${sp()}\\text{cm}>${texNombre(dKJ)}${sp()}\\text{cm}+${texNombre(dLJ)}${sp()}\\text{cm}$, donc le point $${J}$ ne peut pas être placé.`
      }
      objets.push(
        arcDeCercle(pointK, dKJ, ...anglesArcK),
        arcDeCercle(pointL, dLJ, ...anglesArcL),
      )
      const parametresFigure = {
        xmin: -1.5,
        xmax: dKL + 1.5,
        ymin: -1.5,
        ymax:
          Math.max(
            hauteurArc(dKJ, ...anglesArcK),
            hauteurArc(dLJ, ...anglesArcL),
          ) + 1.5,
        pixelsParCm: 20,
        scale: Math.min(1, 12 / dKL),
      }
      texteCorr += mathalea2d(parametresFigure, objets)
      texteCorr += `<br>${conclusion}`
      texteCorr += `<br><br>${texteEnCouleur(`Remarque : il suffit de comparer la distance $${K + L}$ à la somme des deux autres distances $${K + J}$ et $${L + J}$. Si $${K + L}$ est plus petite que cette somme, le point $${J}$ peut être placé. ${remarque}`, bleuMathalea)}`

      if (this.questionJamaisPosee(i, dKL, dKJ, dLJ)) {
        listeDeNomsDePoints.push(nom)
        const propositions = [
          { texte: 'Oui', statut: possible },
          { texte: 'Non', statut: !possible },
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
