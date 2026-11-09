import { colorToLatexOrHTML } from '../../../lib/2d/colorToLatexOrHtml'
import { Courbe } from '../../../lib/2d/Courbe'
import { repere } from '../../../lib/2d/reperes'
import { texteParPosition } from '../../../lib/2d/textes'
import PolynomeFactorisable from '../../../lib/mathFonctions/PolynomeFactorisableDegMax4'
import PolynomePlusieursVariables from '../../../lib/mathFonctions/PolynomePlusieursVariables'
import { miseEnEvidence } from '../../../lib/outils/embellissements'
import FractionEtendue from '../../../modules/FractionEtendue'
import { mathalea2d } from '../../../modules/mathalea2d'
import {
    gestionnaireFormulaireTexte,
    listeQuestionsToContenu,
    randint,
} from '../../../modules/outils'
import Exercice from '../../Exercice'

export const titre =
  "Déterminer l'expression factorisée d'une fonction polynomiale à partir de sa représentation graphique"
export const dateDePublication = '09/10/2025'
export const interactifReady = false
export const uuid = '25430'
export const refs = {
  'fr-fr': [],
  'fr-ch': ['2mFctPoly1-3'],
}

/**
 * Déterminer l'expression factorisée d'une fonction polynomiale à partir de sa représentation graphique. bug: nZkz
 * @author Nathan Scheinmann
 */

export default class ExerciceFactorisePoly extends Exercice {
  constructor() {
    super()
    this.besoinFormulaireNumerique = [
      'Coefficient dominant',
      4,
      '1: Égal à 1\n2: Entier relatif\n3: Fractionnaire\n4: Mélange',
    ]
    this.besoinFormulaire2Numerique = [
      'Degré du polynôme',
      4,
      '1: 3\n2: 4\n3: Mélange',
    ]
    this.sup = 4
    this.sup2 = 5
    this.nbQuestions = 3
    this.correctionDetailleeDisponible = true
  }

  nouvelleVersion() {
    const listeTypeDeQuestions = gestionnaireFormulaireTexte({
      saisie: this.sup,
      min: 1,
      max: 3,
      melange: 4,
      defaut: 4,
      listeOfCase: ['1', 'relatif', 'fractionnaire'],
      shuffle: true,
      nbQuestions: this.nbQuestions,
    })
    const listeTypeDeQuestions2 = gestionnaireFormulaireTexte({
      saisie: this.sup2,
      min: 1,
      max: 2,
      melange: 3,
      defaut: 3,
      listeOfCase: [3, 4],
      shuffle: true,
      nbQuestions: this.nbQuestions,
    })
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; ) {
      let texte = ''
      let texteCorr = ''
      let deg: number
      let lMult: number[]
      let lRoots: FractionEtendue[]
      let coeffDom: FractionEtendue

      // Déterminer le degré selon le paramètre sup2
      deg = listeTypeDeQuestions2[i] as number

      // Générer une liste de multiplicités qui somme à deg
      lMult = []
      let sommeMult = 0

      // Déterminer combien de racines distinctes (entre 1 et deg)
      const nbRacines = randint(Math.round(deg / 2), Math.min(deg, 3))

      lMult = Array(nbRacines).fill(1)
      sommeMult = nbRacines
      while (sommeMult < deg) {
        const idx = randint(0, nbRacines - 1)
        if (lMult[idx] < 2) {
          // Limiter la multiplicité à 2 pour éviter les cas trop plats
          lMult[idx]++
          sommeMult++
        }
      }

      // Générer des racines distinctes
      lRoots = []
      for (let j = 0; j < deg; j++) {
        // Exclure les racines existantes et leurs voisins ±1
        const exclusions = lRoots.flatMap((r) => [r.num - 1, r.num])
        const racine = new FractionEtendue(randint(-3, 3, exclusions), 1)
        for (let k = 0; k < lMult[j]; k++) {
          lRoots.push(racine)
        }
      }
      coeffDom = new FractionEtendue(1, 1)
      // Déterminer le coefficient dominant selon le paramètre sup
      const typeCoeff = listeTypeDeQuestions[i] as string
      if (typeCoeff === '1') {
        coeffDom = new FractionEtendue(1, 1)
      } else if (typeCoeff === 'relatif') {
        coeffDom = new FractionEtendue(randint(-2, 2, [0]), 1)
      } else if (typeCoeff === 'fractionnaire') {
        do {
          coeffDom = new FractionEtendue(
            randint(-4, 4, [0]),
            randint(1, 4),
          ).simplifie()
        } while (coeffDom.estEntiere)
      }
      const polynome = PolynomePlusieursVariables.createPolynomeFromRoots(
        lRoots,
        coeffDom,
      )

      // Créer une fonction à partir du polynôme pour la courbe
      const f = (x: number) =>
        polynome.evaluer({ x: new FractionEtendue(x, 1) }).valeurDecimale

      const r = repere({
        xMin: -6,
        xMax: 6,
        yMin: -8,
        yMax: 8,
        yLabelEcart: 0.8,
        yLabelDistance: 2,
        xLabelDistance: 2,
        grilleX: false,
        grilleY: false,
        grilleSecondaire: true,
        grilleSecondaireYDistance: 1,
        grilleSecondaireXDistance: 1,
        grilleSecondaireYMin: -8,
        grilleSecondaireYMax: 8,
        grilleSecondaireXMin: -8,
        grilleSecondaireXMax: 8,
      })

      const courbe = new Courbe(f, {
        repere: r,
        step: 0.1,
        xMin: -6,
        xMax: 6,
        yMin: -1000,
        yMax: 1000,
        usePgfplots: true,
        fLatex: polynome.toPgfplots(), // Use the polynomial's pgfplots expression
      })
      courbe.color = colorToLatexOrHTML('red')
      courbe.epaisseur = 2

      const o = texteParPosition('O', -0.5, -0.5, 0, 'black', 1)
      let Px = new FractionEtendue(0, 1)
      let Py = polynome.evaluer({ x: Px })
      while (Py.num === 0) {
        Px = new FractionEtendue(randint(-3, 3), 1)
        Py = polynome.evaluer({ x: Px })
      }
      texte += `Déterminer l'expression algébrique factorisée de la fonction polynomiale de degré minimal ayant la représentation ci-dessous et passant par le point $P\\left(${Px.texFractionSimplifiee}\\,;\\,${Py.texFractionSimplifiee}\\right)$.<br><br>`
      texte += mathalea2d(
        {
          xmin: -8,
          ymin: -8,
          xmax: 8,
          ymax: 8,
          scale: 1,
          usePgfplots: true,
          centerLatex: true,
        },
        r,
        o,
        courbe,
      )
      const polynomeFact = new PolynomeFactorisable(lRoots, coeffDom)
      const polynomeFactSansCoeff = new PolynomeFactorisable(
        lRoots,
        new FractionEtendue(1, 1),
      )

      if (this.correctionDetaillee) {
        texteCorr += `On commence par identifier les racines de la fonction polynomiale à partir de son graphique. On trouve les racines suivantes :`
        const racinesGraph = Array.from(
          new Set(lRoots.map((r) => r.texFractionSimplifiee)),
        )
          .sort((a, b) => parseFloat(a) - parseFloat(b))
          .join(';\\, ')
        texteCorr += `$${racinesGraph}$.<br> Pour chaque racine, on détermine la multiplicité en observant le comportement de la courbe au voisinage de la racine : si la courbe coupe l'axe des abscisses, la multiplicité est impaire et si la courbe est tangente à l'axe des abscisses, la multiplicité est paire.<br> On recherche le polynôme de degré minimal, donc on choisit la plus petite multiplicité possible pour chaque racine. On a ainsi que l'expression de la fonction est de la forme<br>\\[f(x)=a${polynomeFactSansCoeff.toLatex(true)}.\\] 
        On évalue dans le point $P$ pour déterminer le coefficient $a$ :<br>
        $\\begin{aligned}
        f(${Px.texFractionSimplifiee})&=${Py.texFractionSimplifiee}\\\\
        &=a${polynomeFactSansCoeff.toLatexFactoriseSubstitue(Px)}\\\\
        &=${polynomeFactSansCoeff.polynome.evaluer({ x: Px }).simplifie().texFractionSaufUn}a
        \\end{aligned}$<br>
        d'où $a=${coeffDom.texFractionSimplifiee}$.<br>`
      }
      texteCorr += `La forme factorisée de la fonction polynomiale est :<br>
      $f(x) = ${miseEnEvidence(polynomeFact.toLatex(true))}$.`

      if (this.questionJamaisPosee(i, texte)) {
        this.listeQuestions[i] = texte
        this.listeCorrections[i] = texteCorr
        i++
      }
      cpt++
    }
    listeQuestionsToContenu(this)
  }
}
