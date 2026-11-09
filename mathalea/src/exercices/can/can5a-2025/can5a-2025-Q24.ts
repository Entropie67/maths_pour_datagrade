import { codageSegments } from '../../../lib/2d/CodageSegment'
import { droite } from '../../../lib/2d/droites'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { placeLatexSurSegment } from '../../../lib/2d/placeLatexSurSegment'
import { PointAbstrait, pointAbstrait } from '../../../lib/2d/PointAbstrait'
import { segment } from '../../../lib/2d/segmentsVecteurs'
import { labelPoint } from '../../../lib/2d/textes'
import { tracePointSurDroite } from '../../../lib/2d/TracePointSurDroite'
import { translation } from '../../../lib/2d/transformations'
import { vecteur } from '../../../lib/2d/Vecteur'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { texNombre } from '../../../lib/outils/texNombre'
import { context } from '../../../modules/context'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../../types/2d'
import ExerciceCan from '../../ExerciceCan'

export const titre = "Partage d'un segment"
export const interactifReady = true

export const uuid = 'y343x'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['PR-7'],
}

/**
 * @author Jean-claude Lhote

*/
export default class Can2025N5Q18 extends ExerciceCan {
  enonce(a?: number, b?: number, c?: number) {
    if (a == null || b == null || c == null) {
      b = randint(3, 6, 5)
      a = randint(1, b - 1)
      c = (randint(4, 9) * b) / 10
      do {
        b = randint(3, 6, 5)
        a = randint(1, b - 1)
        c = (randint(4, 9) * b) / 10
      } while (b === 2 * a)
    }
    const A = pointAbstrait(0, 0, 'A', 'above')
    const B = pointAbstrait((7 * a) / b, 0, 'B', 'above')
    const C = pointAbstrait(7, 0)
    const s = segment(A, C)
    s.styleExtremites = '|-|'
    s.tailleExtremites = 7
    const s2 = translation(s, vecteur(0, -0.5))
    s2.styleExtremites = '<->'
    const l = placeLatexSurSegment(`${texNombre(c, 1)}\\text{ cm}`, A, C, {
      distance: -0.9,
      letterSize: 'footnotesize',
    })
    const ps: NestedObjetMathalea2dArray = []
    const pts = [A]
    const d = droite(A, C)
    let p: PointAbstrait
    for (let i = 0; i < b - 1; i++) {
      p = pointAbstrait(((i + 1) * 7) / b, 0)
      pts.push(p)
      pts.push(p)
      const pSurS = tracePointSurDroite(p, d)
      pSurS.epaisseur = 2
      pSurS.taille = 0.15
      ps.push(pSurS)
    }
    pts.push(C)
    const codages = codageSegments('//', 'black', ...pts)
    codages.echelle = 0.6
    const labels = labelPoint(A, B)
    this.reponse = texNombre((a * c) / b, 2)
    this.question = `${mathalea2d(Object.assign({ pixelsParCm: 30 }, fixeBordures([s, s2, codages, ps, labels, l], { rymin: 0 })), [s, s2, codages, ps, labels, l])}`
    this.correction = `Le segment $[AB]$ mesure $\\dfrac{${a}}{${b}}$ de $${texNombre(c, 1)}\\text{ cm}$.<br>`
    if (a === 1) {
      this.correction += `$\\begin{aligned}
   AB&= \\dfrac{${a}}{${b}}\\times ${texNombre(c, 1)}\\\\
   &=\\dfrac{${texNombre(c, 1)}}{${b}}\\\\
    &=${texNombre(c, 1)}\\div ${b}\\\\
    &=${miseEnEvidence(texNombre((a * c) / b, 1))} \\text{ cm}
    \\end{aligned}$`
    } else {
      this.correction += `$\\begin{aligned}
      AB&=\\dfrac{${a}}{${b}}\\times ${texNombre(c, 1)}\\\\
      &=${a}\\times\\dfrac{${texNombre(c, 1)}}{${b}}\\\\
      &=${a}\\times ${texNombre(c / b, 1)}\\\\
      &=${miseEnEvidence(texNombre((a * c) / b, 1))} \\text{ cm}
      \\end{aligned}$`
    }

    this.canReponseACompleter = '$AB=\\ldots\\text{ cm}$'
    this.optionsChampTexte = { texteApres: ' $\\text{cm}$' }
    if (this.interactif) {
      this.question += '<br>$AB=$'
    } else if (context.isHtml) {
      this.question += '<br>$AB=\\ldots\\text{ cm}$'
    }
  }

  nouvelleVersion() {
    if (this.canOfficielle) this.enonce(1, 3, 2.1)
    else this.enonce()
  }
}
