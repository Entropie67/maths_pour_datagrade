import { createList } from '../../lib/format/lists'
import { isEqual, seq } from '../../lib/interactif/checks'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { ajouteChampTexteMathLive } from '../../lib/interactif/questionMathLive'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf0,
  ecritureParentheseSiNegatif,
} from '../../lib/outils/ecritures'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import FractionEtendue from '../../modules/FractionEtendue'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'
import { texNombre } from '../../lib/outils/texNombre'

export const interactifReady = true

export const titre =
  'Sujet de synthèse sur le produit scalaire en géométrie repérée'

export const dateDePublication = '22/5/2026'

export const uuid = 'f533c'
export const refs = {
  'fr-fr': ['1G11-1'],
  'fr-ch': [],
}

/**
 * @author Rémi Angot
 * Scénario : E3C 2020 sujet21 Ex 3
 */
export default class ProduitScalaireRepere extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 4
    this.nbQuestionsModifiable = false
  }

  nouvelleVersion() {
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50;) {
      const xA = randint(-5, 5, 0)
      const yA = randint(-5, 5, 0)
      const xB = randint(-5, 5, [xA, 0])
      const yB = randint(-5, 5, [yA, 0])
      let xC: number, yC: number
      do {
        xC = randint(-5, 5, [xA, xB, 0])
        yC = randint(-5, 5, [yA, yB, 0])
      } while (
        (xC - xA) * (yB - yA) === (yC - yA) * (xB - xA) || // points non colinéaires
        (xB - xA) * (xC - xA) + (yB - yA) * (yC - yA) <= 0 // produit scalaire > 0
      )

      const abX = xB - xA
      const abY = yB - yA
      const acX = xC - xA
      const acY = yC - yA
      const dotProduct = abX * acX + abY * acY
      const ab2 = abX ** 2 + abY ** 2
      const ac2 = acX ** 2 + acY ** 2
      const crossAbs = Math.abs(abX * acY - abY * acX)

      const abSqrt = Math.round(Math.sqrt(ab2))
      const abIsInteger = abSqrt * abSqrt === ab2
      const abTex = abIsInteger ? `${abSqrt}` : `\\sqrt{${ab2}}`

      let adTex: string
      let cdTex: string
      if (abIsInteger) {
        adTex = new FractionEtendue(dotProduct, abSqrt).simplifie()
          .texFractionSimplifiee
        cdTex = new FractionEtendue(crossAbs, abSqrt).simplifie()
          .texFractionSimplifiee
      } else {
        adTex = `\\dfrac{${dotProduct}}{\\sqrt{${ab2}}}`
        cdTex = `\\dfrac{${crossAbs}}{\\sqrt{${ab2}}}`
      }

      // CD montré avec le dénominateur abTex pour la dérivation dans la correction 4
      const cdFracTex = `\\dfrac{${crossAbs}}{${abTex}}`
      // AD² = dotProduct²/ab2 (simplifié)
      const ad2Tex = new FractionEtendue(dotProduct ** 2, ab2).simplifie()
        .texFractionSimplifiee
      // Aire = crossAbs / 2
      const reponse4 = new FractionEtendue(crossAbs, 2).simplifie()
        .texFractionSimplifiee

      const question1 =
        'Calculer le produit scalaire $\\overrightarrow{AB} \\cdot \\overrightarrow{AC}$.' +
        ajouteChampTexteMathLive(this, 0, KeyboardType.lyceeClassique, {
          texteAvant:
            '<br>$\\overrightarrow{AB} \\cdot \\overrightarrow{AC} = $',
        })

      const question2a =
        'Justifier que $\\overrightarrow{AB} \\cdot \\overrightarrow{AD} = \\overrightarrow{AB} \\cdot \\overrightarrow{AC}$.'
      const question2b =
        'En déduire la longueur $AD$.' +
        ajouteChampTexteMathLive(this, 1, KeyboardType.lyceeClassique, {
          texteAvant: '<br>$AD = $',
        })
      const question2 =
        'Soit $D$ le projeté orthogonal du point $C$ sur la droite $(AB)$.' +
        createList({ items: [question2a, question2b], style: 'alpha' })

      const question3 =
        'Déterminer la hauteur du triangle $ABC$ issue de $C$.' +
        ajouteChampTexteMathLive(this, 2, KeyboardType.lyceeClassique, {
          texteAvant: '<br>Hauteur issue de $C$ : ',
        })

      const question4 =
        "Calculer l'aire du triangle $ABC$." +
        ajouteChampTexteMathLive(this, 3, KeyboardType.lyceeClassique, {
          texteAvant: '<br>$\\mathcal{A}(ABC) = $',
        })

      const produit1 = abX * acX
      const produit2 = abY * acY

      const correction1 =
        `$\\overrightarrow{AB}\\begin{pmatrix} ${xB}${ecritureAlgebriqueSauf0(-xA)} \\\\ ${yB}${ecritureAlgebriqueSauf0(-yA)} \\end{pmatrix}$` +
        `, soit $\\overrightarrow{AB}\\begin{pmatrix} ${abX} \\\\ ${abY} \\end{pmatrix}$ ` +
        `et $\\overrightarrow{AC}\\begin{pmatrix} ${xC}${ecritureAlgebriqueSauf0(-xA)} \\\\ ${yC}${ecritureAlgebriqueSauf0(-yA)} \\end{pmatrix}$` +
        `, soit $\\overrightarrow{AC}\\begin{pmatrix} ${acX} \\\\ ${acY} \\end{pmatrix}$.<br>` +
        `$\\overrightarrow{AB} \\cdot \\overrightarrow{AC} = ${ecritureParentheseSiNegatif(abX)} \\times ${ecritureParentheseSiNegatif(acX)} + ${ecritureParentheseSiNegatif(abY)} \\times ${ecritureParentheseSiNegatif(acY)}` +
        ` = ${produit1} ${ecritureAlgebrique(produit2)} = ${miseEnEvidence(String(dotProduct))}$`

      const correction2a =
        `$D$ est le projeté orthogonal de $C$ sur $(AB)$, donc $\\overrightarrow{AB} \\perp \\overrightarrow{CD}$, c'est-à-dire $\\overrightarrow{AB} \\cdot \\overrightarrow{CD} = 0$.<br>` +
        `Comme $\\overrightarrow{AD} = \\overrightarrow{AC} + \\overrightarrow{CD}$, on a :<br>` +
        `$\\overrightarrow{AB} \\cdot \\overrightarrow{AD} = \\overrightarrow{AB} \\cdot (\\overrightarrow{AC} + \\overrightarrow{CD}) = \\overrightarrow{AB} \\cdot \\overrightarrow{AC} + \\underbrace{\\overrightarrow{AB} \\cdot \\overrightarrow{CD}}_{=0} = \\overrightarrow{AB} \\cdot \\overrightarrow{AC}$.`
      const correction2b =
        `D'après la question $1$, $\\overrightarrow{AB} \\cdot \\overrightarrow{AC} = ${dotProduct}$.<br>` +
        `$D$ est sur la droite $(AB)$ dans le sens de $B$ depuis $A$ (le produit scalaire est positif), donc $\\overrightarrow{AB} \\cdot \\overrightarrow{AD} = AB \\times AD$.<br>` +
        `Ainsi $AB \\times AD = ${dotProduct}$, d'où $AD = \\dfrac{${dotProduct}}{AB}$.<br>` +
        `Or $AB^2 = ${ecritureParentheseSiNegatif(abX)}^2 + ${ecritureParentheseSiNegatif(abY)}^2 = ${ab2}$, donc $AB = ${abTex}$.<br>` +
        `Ainsi $AD = ${miseEnEvidence(adTex)}$.`
      const correction2 = createList({
        items: [correction2a, correction2b],
        style: 'alpha',
      })

      const correction3 =
        `Le point $D$ est le pied de la hauteur du triangle $ABC$ issue de $C$.<br>` +
        `Dans le triangle $ACD$ rectangle en $D$, le théorème de Pythagore donne :<br>` +
        `$CD^2 + AD^2 = AC^2$<br>` +
        `$CD^2 + \\left(${adTex}\\right)^2 = ${ecritureParentheseSiNegatif(acX)}^2 + ${ecritureParentheseSiNegatif(acY)}^2 = ${ac2}$<br>` +
        `$CD^2 = ${ac2} - ${ad2Tex} = \\dfrac{${texNombre(ac2 * ab2)} - ${texNombre(dotProduct ** 2)}}{${ab2}} = \\dfrac{${crossAbs ** 2}}{${ab2}}$.<br>` +
        `Donc $CD = ${miseEnEvidence(cdTex)}$.`

      const correction4 = `$\\mathcal{A}(ABC) = \\dfrac{AB \\times CD}{2} = \\dfrac{${abTex} \\times ${cdFracTex}}{2} = \\dfrac{${crossAbs}}{2} = ${miseEnEvidence(reponse4)}$.`

      if (this.questionJamaisPosee(i, dotProduct)) {
        this.introduction =
          `Dans un repère orthonormé $(O;\\,\\vec{\\imath} ;\\,\\vec{\\jmath})$, on considère les points ` +
          `$A(${xA} ;\\, ${yA})$, $B(${xB} ;\\, ${yB})$ et $C(${xC} ;\\, ${yC})$.<br>`

        handleAnswers(this, 0, {
          reponse: { value: `${dotProduct}`, compare: seq([isEqual()]) },
        })
        handleAnswers(this, 1, {
          reponse: { value: adTex, compare: seq([isEqual()]) },
        })
        handleAnswers(this, 2, {
          reponse: { value: cdTex, compare: seq([isEqual()]) },
        })
        handleAnswers(this, 3, {
          reponse: { value: reponse4, compare: seq([isEqual()]) },
        })

        this.listeQuestions = [question1, question2, question3, question4]
        this.listeCorrections = [
          correction1,
          correction2,
          correction3,
          correction4,
        ]
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
