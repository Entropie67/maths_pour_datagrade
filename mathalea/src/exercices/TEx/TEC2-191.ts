import { point } from '../../lib/2d/PointAbstrait'
import { repere } from '../../lib/2d/reperes'
import { segment } from '../../lib/2d/segmentsVecteurs'
import { latex2d, labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { bleuMathalea } from '../../lib/colors'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { createQuestion } from '../../lib/interactif/createQuestion'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { Complexe } from '../../lib/mathFonctions/Complexe'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import {
  ecritureAlgebrique,
  ecritureAlgebriqueSauf1,
} from '../../lib/outils/ecritures'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer un lieu géométrique avec un quotient réel ou imaginaire pur'
export const interactifReady = true
export const dateDePublication = '29/10/2026'
export const uuid = '10214'
export const refs = {
  'fr-fr': ['TEC2-16'],
  'fr-ch': [],
}

/**
 * Déterminer l'ensemble des points M d'affixe z tels que 1/(z+w) ou i/(z+w)
 * soit un nombre réel ou un imaginaire pur.
 * @author Stéphane Guyon
 */
export default class LieuQuotientReelImaginaire extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    const listeTypes = combinaisonListes([1, 2], this.nbQuestions)
    const listeNumerateurs = combinaisonListes([true, false], this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const reel = listeTypes[i] === 1
      const numeriteI = listeNumerateurs[i]
      const a = randint(-4, 4, [0])
      const b = randint(-3, 3)
      if (!this.questionJamaisPosee(i, listeTypes[i], Number(numeriteI), a, b))
        continue

      const numerateur = numeriteI ? '\\mathrm{i}' : '1'
      const denominateur = `z${ecritureAlgebrique(a)}${
        b === 0 ? '' : `${ecritureAlgebriqueSauf1(b)}\\mathrm{i}`
      }`
      const quotient = `\\dfrac{${numerateur}}{${denominateur}}`
      const nature = reel ? 'un nombre réel' : 'un imaginaire pur'
      const exclu = new Complexe(-a, -b)

      // Re(quotient) ou Im(quotient) doit s'annuler selon le cas
      // 1/(u+iv) = (u-iv)/D : réel <=> v=0, imaginaire pur <=> u=0
      // i/(u+iv) = (v+iu)/D : réel <=> u=0, imaginaire pur <=> v=0
      const conditionSurV = reel === !numeriteI
      const equation = conditionSurV ? `y=${-b}` : `x=${-a}`
      const facteurU = `x${ecritureAlgebrique(a)}`
      const facteurV = b === 0 ? 'y' : `y${ecritureAlgebrique(b)}`
      const denom = `(${facteurU})^2+(${facteurV})^2`
      const numRe = numeriteI ? facteurV : facteurU
      const numIm = numeriteI ? facteurU : `-(${facteurV})`
      const fonction = reel ? '\\operatorname{Im}' : '\\operatorname{Re}'
      const numAnnule = reel ? numIm : numRe
      const formeAlgebrique = `\\dfrac{${numRe}}{${denom}}+\\dfrac{${numIm}}{${denom}}\\,\\mathrm{i}`

      const reponseTexte = `la droite d'équation $${miseEnEvidence(equation)}$ privée du point $${miseEnEvidence('\\Omega')}$`

      const enonce = `Dans le plan complexe muni d'un repère orthonormé $(O\\,;\\,\\vec u,\\vec v)$, déterminer l'ensemble $\\mathcal E$ des points $M$ d'affixe $z=x+\\mathrm{i}y$ ($x$ et $y$ réels) tels que $${quotient}$ soit ${nature}.`
      const zPlusW = `(${facteurU})+(${facteurV})\\mathrm{i}`
      const zPlusWConj = `(${facteurU})-(${facteurV})\\mathrm{i}`
      const numDeveloppe = numeriteI
        ? `\\mathrm{i}\\left(${zPlusWConj}\\right)`
        : zPlusWConj
      const correction = `Notons $\\Omega$ le point d'affixe $${exclu.tex()}$. Le quotient existe si et seulement si $M\\neq\\Omega$, c'est-à-dire $z\\neq ${exclu.tex()}$.<br>
        Posons $z=x+\\mathrm{i}y$ avec $x$ et $y$ réels, et $Z=${quotient}$.<br>
        On met $Z$ sous forme algébrique en multipliant par la quantité conjuguée du dénominateur :
        <br>$\\begin{aligned}
        Z&=\\dfrac{${numerateur}}{${zPlusW}}\\\\
        &=\\dfrac{${numerateur}\\times\\left(${zPlusWConj}\\right)}{\\left(${zPlusW}\\right)\\left(${zPlusWConj}\\right)}\\\\
        &=\\dfrac{${numDeveloppe}}{${denom}}\\\\
        &=\\dfrac{${numRe}+(${numIm})\\mathrm{i}}{${denom}}\\\\
        &=${formeAlgebrique}
        \\end{aligned}$<br>
        $Z$ est ${nature} si et seulement si $${fonction}(Z)=0$.<br>
        Le dénominateur $${denom}$ est strictement positif, donc :
        <br>$\\begin{aligned}
        ${fonction}(Z)=0&\\iff \\dfrac{${numAnnule}}{${denom}}=0\\\\
        &\\iff ${numAnnule}=0\\\\
        &\\iff ${equation}
        \\end{aligned}$<br>
        En excluant le point $\\Omega$, qui appartient à cette droite, on obtient :<br>
        $\\mathcal E$ est ${reponseTexte}.`

      const limite = 5
      const A = point(-a, -b, '')
      const figure = mathalea2d(
        {
          xmin: -limite - 1,
          xmax: limite + 1,
          ymin: -limite - 1,
          ymax: limite + 1,
          scale: 0.5,
        },
        repere({
          xMin: -limite,
          xMax: limite,
          yMin: -limite,
          yMax: limite,
          grille: true,
          grilleDistance: 1,
          grilleCouleur: bleuMathalea,
          grilleOpacite: 0.3,
        }),
        conditionSurV
          ? segment(point(-limite, -b), point(limite, -b), 'red')
          : segment(point(-a, -limite), point(-a, limite), 'red'),
        tracePoint(A),
        labelPoint(point(-a, -b, '$\\Omega$', 'above right')),
        latex2d(
          equation,
          conditionSurV ? limite - 1 : -a + 0.9,
          conditionSurV ? -b + 0.5 : limite - 0.5,
          { color: 'red' },
        ),
      )

      if (this.interactif) {
        this.listeQuestions[i] = addMultiMathfield(this, i, {
          dataTemplate: `${enonce}<br>$\\mathcal E$ est %{field0} d'équation %{field1}, privé(e) du point $\\Omega$ d'affixe %{field2}.`,
          dataOptions: {
            field0: {
              choices: [
                { label: 'Choisir…', value: '' },
                { label: 'une droite', value: 'droite' },
                { label: 'un cercle', value: 'cercle' },
                { label: 'une demi-droite', value: 'demi-droite' },
              ],
            },
            field1: {
              keyboard: KeyboardType.clavierEntierementPersonnalisable,
              dataKeys: [
                ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0'],
                ['+', '-', '\\times', '\\frac{#@}{#0}', 'SQ', '='],
                ['x', 'y'],
              ],
            },
            field2: { keyboard: KeyboardType.complexes },
          },
        })
        this.listeCorrections[i] = `${correction}<br>${figure}`
        handleAnswers(
          this,
          i,
          {
            field0: { value: 'droite' },
            field1: { value: equation, options: { egaliteExpression: true } },
            field2: { value: exclu.tex() },
            bareme: toutAUnPoint,
          },
          { formatInteractif: 'multi-mathfield' },
        )
      } else {
        createQuestion(this, i, {
          question: enonce,
          correction: `${correction}<br>${figure}`,
        })
      }
      i++
    }
    listeQuestionsToContenu(this)
  }
}
