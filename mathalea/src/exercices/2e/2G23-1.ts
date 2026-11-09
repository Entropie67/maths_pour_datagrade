import { pointAbstrait } from '../../lib/2d/PointAbstrait'
import { tracePoint } from '../../lib/2d/TracePoint'
import { polygoneAvecNom } from '../../lib/2d/polygones'
import { latexParPoint } from '../../lib/2d/textes'
import {
  homothetie,
  similitude,
  translation,
} from '../../lib/2d/transformations'
import { longueur } from '../../lib/2d/utilitairesGeometriques'
import { pointAdistance } from '../../lib/2d/utilitairesPoint'
import { choice, combinaisonListes } from '../../lib/outils/arrayOutils'
import { translationAnimee } from '../../modules/2dAnimation'
import Alea2iep from '../../modules/Alea2iep'
import { context } from '../../modules/context'

import { vecteur } from '../../lib/2d/Vecteur'
import { colorToLatexOrHTML } from '../../lib/2d/colorToLatexOrHtml'
import { fixeBordures } from '../../lib/2d/fixeBordures'
import {
  representant,
  representantNomme,
} from '../../lib/2d/representantVecteur'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import type { NestedObjetMathalea2dArray } from '../../types/2d'
import Exercice from '../Exercice'
import { bleuMathalea } from '../../lib/colors'
export const titre = "Construire un point à partir d'une égalité vectorielle"
export const dateDeModifImportante = '29/01/2023'

/**
 * @author Jean-claude Lhote
 */
export const uuid = '2b8bf'

export const refs = {
  'fr-fr': ['2G23-1'],
  'fr-ch': ['3G91-2'],
}
export default class SommeDeVecteurs extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Situations différentes ',
      2,
      '1 :Avec un point origine\n2 : Cas général\n3 : Mélange',
    ]

    this.nbQuestions = 2
    this.nbCols = 2
    this.nbColsCorr = 2
    this.sup = 3 //
  }

  nouvelleVersion(numeroExercice: number) {
    let choix = 1
    let u, v, A, B, C, xU, yU, xV, yV, p, U, V, M, N, UU, VV, posLabelA
    let questionsDisponibles = [1, 2]
    if (this.sup === 1) {
      questionsDisponibles = [1]
    } else if (this.sup === 2) {
      questionsDisponibles = [2]
    }
    const typesDeQuestions = combinaisonListes(
      questionsDisponibles,
      this.nbQuestions,
    )
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      let texte = ''
      let texteCorr = ''
      choix = typesDeQuestions[i]
      const anim = new Alea2iep()
      do {
        xU = randint(0, 8) * 0.5
        yU =
          randint(Math.round(4 - xU), 8, Math.round(xU)) * choice([-0.5, 0.5])
        xV = randint(-8, -1) * 0.5
        yV = randint(Math.round(4 + xV), 8) * choice([-0.5, 0.5])
        u = vecteur(xU, yU)
        v = vecteur(xV, yV)
        A = pointAbstrait(0, 0, 'A', 'center')
        B = translation(A, u, 'B')
        C = translation(B, v, 'C')
      } while (A.x === C.x && A.y === C.y)
      posLabelA = homothetie(C, A, -1 / longueur(A, C))
      posLabelA.positionLabel = 'center'
      p = polygoneAvecNom(B, C)
      if (choix === 1) {
        M = pointAdistance(A, 0)
        N = pointAdistance(A, 0)
      } else {
        M = pointAdistance(A, randint(2, 3), randint(20, 45))
        N = similitude(M, A, randint(-90, -45), randint(2, 5) / 2)
      }
      U = representantNomme(u, M, 'u', 1, bleuMathalea)
      UU = representant(u, M)
      UU.color = colorToLatexOrHTML(bleuMathalea)
      V = representantNomme(v, N, 'v', 1, 'green')
      VV = representant(v, N)
      VV.color = colorToLatexOrHTML('green')
      texte =
        'Construire le point $C$ tel que $\\overrightarrow{AC} = \\vec{u} + \\vec{v}$.<br>'
      texte += mathalea2d(
        {
          xmin: Math.min(0, B.x, C.x, M.x, M.x + xU, N.x, N.x + xV) - 2,
          ymin: Math.min(0, B.y, C.y, M.y, M.y + yU, N.y, N.y + yV) - 2,
          xmax: Math.max(0, B.x, C.x, M.x, M.x + xU, N.x, N.x + xV) + 2,
          ymax: Math.max(0, B.y, C.y, M.y, M.y + yU, N.y, N.y + yV) + 2,
          scale: 0.7,
        },
        U,
        V,
        UU,
        VV,
        tracePoint(A, 'red'),
        latexParPoint('A', posLabelA, 'red', 12, 6, ''),
      )
      texteCorr =
        'Construisons le point $B$ tel que $\\overrightarrow{AB} = \\vec{u}$ puis le point $C$ tel que $\\overrightarrow{BC} = \\vec{v}$.<br>'
      anim.couleur = 'black'
      anim.xMin = Math.min(0, B.x, C.x, M.x, M.x + xU, N.x, N.x + xV) - 1
      anim.yMin = Math.min(0, B.y, C.y, M.y, M.y + yU, N.y, N.y + yV) - 1
      anim.xMax = Math.max(0, B.x, C.x, M.x, M.x + xU, N.x, N.x + xV) + 2
      anim.yMax = Math.max(0, B.y, C.y, M.y, M.y + yU, N.y, N.y + yV) + 2
      anim.recadre(anim.xMin, anim.yMax)
      anim.crayonMontrer(M)
      anim.tracer(translation(M, u), { vecteur: true, couleur: bleuMathalea })
      anim.crayonDeplacer(N)
      anim.tracer(translation(N, v), { vecteur: true, couleur: 'green' })
      anim.crayonMasquer()
      anim.pointCreer(A)
      if (choix === 2) {
        anim.compasMontrer(M)
        anim.compasEcarter2Points(M, translation(M, u))
        anim.compasDeplacer(A)
        anim.compasTracerArcCentrePoint(A, B)
        anim.compasDeplacer(M)
        anim.compasEcarter2Points(M, A)
        anim.compasDeplacer(translation(M, u))
        anim.compasTracerArcCentrePoint(translation(M, u), B)
        anim.crayonMontrer(B)
        anim.tracer(translation(M, u), {
          couleur: bleuMathalea,
          pointilles: true,
        })
        anim.crayonDeplacer(M)
        anim.tracer(A, { couleur: bleuMathalea, pointilles: true })
        anim.tracer(B, { vecteur: true, couleur: bleuMathalea })
        anim.crayonMasquer()
      }
      anim.compasDeplacer(N)
      anim.compasEcarter2Points(N, translation(N, v))
      anim.compasDeplacer(B)
      anim.compasTracerArcCentrePoint(B, C)
      anim.compasDeplacer(N)
      anim.compasEcarter2Points(N, B)
      anim.compasDeplacer(translation(N, v))
      anim.compasTracerArcCentrePoint(translation(N, v), C)
      anim.crayonMontrer(C)
      anim.tracer(translation(N, v), { couleur: 'green', pointilles: true })
      anim.crayonDeplacer(N)
      anim.tracer(B, { couleur: 'green', pointilles: true })
      anim.tracer(C, { vecteur: true, couleur: 'green' })
      anim.crayonMasquer()
      anim.compasMasquer()
      anim.pointCreer(C)
      const objets: NestedObjetMathalea2dArray = [
        U,
        V,
        p[1],
        tracePoint(A, 'red'),
        UU,
        VV,
        representant(u, A),
        representant(v, B),
        latexParPoint('A', posLabelA, 'red', 12, 12, ''),
      ]
      if (context.isHtml)
        objets.push(
          translationAnimee([UU], vecteur(M, A)),
          translationAnimee([VV], vecteur(N, B)),
        )
      texteCorr += mathalea2d(
        Object.assign({ scale: 0.7 }, fixeBordures(objets)),
        objets,
      ) // translationAnimee n'a pas de bordure
      texteCorr +=
        "Remarque : comme $\\overrightarrow{AB} = \\vec{u}$ et $\\overrightarrow{BC} = \\vec{v}$, alors $\\vec{u}+\\vec{v}=\\overrightarrow{AB}+\\overrightarrow{BC}=\\overrightarrow{AC}$ d'après la relation de Chasles."
      texteCorr += anim.htmlBouton(numeroExercice ?? 0, i)
      if (this.questionJamaisPosee(i, xU, yU, xV, yV)) {
        // Si la question n'a jamais été posée, on en créé une autre
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
