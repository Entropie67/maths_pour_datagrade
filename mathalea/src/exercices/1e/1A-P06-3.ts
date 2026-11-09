import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import type { ObjetMathalea2D } from '../../lib/2d/ObjetMathalea2D'
import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { ellipse } from '../../lib/2d/projections3d'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { texteParPosition } from '../../lib/2d/textes'
import {
  coopmathsAction,
  coopmathsActionDark,
  coopmathsCorpus,
  coopmathsStruct,
  coopmathsStructDark,
} from '../../lib/colors'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../lib/interactif/createQuestion'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { pgcd } from '../../lib/outils/primalite'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Calculer une probabilité conditionnelle ou une intersection à partir d’un diagramme'
export const dateDePublication = '23/10/2026'
export const interactifReady = true
export const interactifType = 'mathLive'

export const uuid = '29e45'
export const refs = {
  'fr-fr': ['1A-P06-3'],
  'fr-ch': [],
}

/**
 * Lire les effectifs d'un diagramme de Venn pour calculer P(A∩B)
 * ou P_A(B), ou P_B(A).
 * @author Stéphane Guyon
 */
export default class IntersectionEtConditionnellesDiagramme extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacingCorr = 2
  }

  /** Diagramme de Venn : ellipse Ω et deux ellipses qui se coupent. */
  private diagramme(
    [a, b]: string[],
    effectifs: { seulA: number; inter: number; seulB: number; hors: number },
  ): string {
    const objets: ObjetMathalea2D[] = []
    const cadre = ellipse(pointAbstrait(4.5, 2.6), 5, 3, coopmathsCorpus)
    cadre.epaisseur = 2
    cadre.couleurDeRemplissage = colorToLatexOrHTML('white')
    cadre.opaciteDeRemplissage = 1
    objets.push(cadre)

    // Ellipses translucides aux couleurs de MathALÉA : l'intersection se mélange.
    const ellipseA = ellipse(pointAbstrait(3.4, 2.8), 2.4, 1.3, coopmathsStruct)
    ellipseA.epaisseur = 3
    ellipseA.couleurDeRemplissage = colorToLatexOrHTML(coopmathsStruct)
    ellipseA.opaciteDeRemplissage = 0.25
    const ellipseB = ellipse(pointAbstrait(5.6, 2.8), 2.4, 1.3, coopmathsAction)
    ellipseB.epaisseur = 3
    ellipseB.couleurDeRemplissage = colorToLatexOrHTML(coopmathsAction)
    ellipseB.opaciteDeRemplissage = 0.25
    // Traits reliant chaque nom d'événement au bord de son ellipse.
    const traitA = segment(1.75, 4.2, 2.02, 3.86, coopmathsStructDark)
    const traitB = segment(7.25, 4.2, 6.98, 3.86, coopmathsActionDark)
    const traitOmega = segment(9.05, 0.05, 8.33, 0.67, 'black')
    traitA.epaisseur = 1.5
    traitB.epaisseur = 1.5
    traitOmega.epaisseur = 1.5
    objets.push(
      ellipseA,
      ellipseB,
      traitA,
      traitB,
      traitOmega,
      texteParPosition(`$${a}$`, 1.6, 4.5, 0, coopmathsStructDark, 1.3),
      texteParPosition(`$${b}$`, 7.4, 4.5, 0, coopmathsActionDark, 1.3),
      texteParPosition(`${effectifs.seulA}`, 2.6, 2.8, 0, 'black', 1.2),
      texteParPosition(`${effectifs.inter}`, 4.5, 2.8, 0, 'black', 1.2),
      texteParPosition(`${effectifs.seulB}`, 6.4, 2.8, 0, 'black', 1.2),
      texteParPosition(`${effectifs.hors}`, 4.5, 0.5, 0, 'black', 1.2),
      texteParPosition('$\\Omega$', 9.3, -0.2, 0, 'black', 1.2),
    )
    return mathalea2d(
      {
        xmin: -1,
        xmax: 10,
        ymin: -0.8,
        ymax: 6,
        pixelsParCm: 30,
        scale: 0.8,
        center: !context.isHtml,
      },
      objets,
    )
  }

  nouvelleVersion() {
    const types = combinaisonListes(
      ['intersection', 'conditionnelleAB', 'conditionnelleBA'],
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const [a, b] = choice([
        ['A', 'B'],
        ['E', 'F'],
        ['C', 'D'],
        ['R', 'S'],
      ])
      const total = choice([40, 50, 80, 100])
      const seulA = randint(3, 15)
      const inter = randint(3, 15)
      const seulB = randint(3, 15, [seulA])
      const hors = total - seulA - inter - seulB
      if (hors < 5) continue
      if (!this.questionJamaisPosee(i, types[i], seulA, inter, seulB, total))
        continue

      const nA = seulA + inter
      const nB = seulB + inter
      const enonce = `$${a}$ et $${b}$ sont deux événements d’un univers $\\Omega$. Le nombre d’éléments de chaque partie est indiqué dans le diagramme ci-dessous.<br>
        ${this.diagramme([a, b], { seulA, inter, seulB, hors })}`
      let probabilite: string
      const num = inter
      let den: number
      let calcul: string

      if (types[i] === 'intersection') {
        den = total
        probabilite = `P(${a}\\cap ${b})`
        calcul = `Le nombre d’éléments de $\\Omega$ est : $${seulA}+${inter}+${seulB}+${hors}=${total}$.<br>
        $${a}\\cap ${b}$ contient $${inter}$ éléments.<br>
        $P(${a}\\cap ${b})=`
      } else {
        const [x, y, nX] =
          types[i] === 'conditionnelleAB' ? [a, b, nA] : [b, a, nB]
        den = nX
        probabilite = `P_${x}(${y})`
        calcul = `On se place dans l’événement $${x}$, qui contient $${x === a ? seulA : seulB}+${inter}=${nX}$ éléments.<br>
        Parmi eux, $${inter}$ réalisent aussi $${y}$.<br>
        $P_${x}(${y})=`
      }
      const d = pgcd(num, den)
      const fraction = `\\dfrac{${num / d}}{${den / d}}`
      const correction =
        d === 1
          ? `${calcul}${miseEnEvidence(fraction)}$<br>Cette fraction est irréductible.`
          : `${calcul}\\dfrac{${num}}{${den}}=\\dfrac{${num}\\div ${d}}{${den}\\div ${d}}=${miseEnEvidence(fraction)}$`
      const valeur = fraction

      createQuestion(this, i, {
        question: this.interactif
          ? `${enonce}<br>Donner la réponse sous forme de fraction irréductible.<br>`
          : `${enonce}<br>Calculer $${probabilite}$ sous forme de fraction irréductible.`,
        correction,
        answer: { value: valeur, options: { fractionIrreductible: true } },
        field: {
          keyboard: KeyboardType.clavierDeBaseAvecFraction,
          texteAvant: `$${probabilite}=$`,
        },
      })
      i++
    }
    listeQuestionsToContenu(this)
  }
}
