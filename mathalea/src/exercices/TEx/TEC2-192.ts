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
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { ecritureAlgebrique } from '../../lib/outils/ecritures'
import { Complexe } from '../../lib/mathFonctions/Complexe'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre =
  'Déterminer un lieu géométrique avec le carré d’un nombre complexe réel ou imaginaire pur'
export const interactifReady = true
export const dateDePublication = '29/10/2026'
export const uuid = '0d758'
export const refs = {
  'fr-fr': ['TEC2-17'],
  'fr-ch': [],
}

/**
 * Déterminer l'ensemble des points M d'affixe z tels que z² ou (z-w)²
 * soit un nombre réel ou un imaginaire pur.
 * @author Stéphane Guyon
 */
export default class LieuCarreReelImaginaire extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    // 1 : z² réel, 2 : z² imaginaire pur, 3 : (z-w)² réel, 4 : (z-w)² imaginaire pur
    const listeTypes = combinaisonListes([1, 2, 3, 4], this.nbQuestions)

    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 50; cpt++) {
      const reel = listeTypes[i] % 2 === 1
      const decale = listeTypes[i] > 2
      const p = decale ? randint(-2, 2) : 0
      const q = decale ? randint(-2, 2, p === 0 ? [0] : []) : 0
      if (!this.questionJamaisPosee(i, listeTypes[i], p, q)) continue

      const nature = reel ? 'un nombre réel' : 'un imaginaire pur'
      const w = new Complexe(p, q)
      const expression = decale ? `(z-(${w.tex()}))^2` : 'z^2'
      const facteurX = p === 0 ? 'x' : `x${ecritureAlgebrique(-p)}`
      const facteurY = q === 0 ? 'y' : `y${ecritureAlgebrique(-q)}`
      const carreX = p === 0 ? 'x^2' : `(${facteurX})^2`
      const carreY = q === 0 ? 'y^2' : `(${facteurY})^2`
      const produit = `(${facteurX})(${facteurY})`
      const terme = (v: string, s: number) => (s === 0 ? v : `(${v})`)

      // y = x + c et y = -x + s (cas imaginaire pur)
      const c = q - p
      const s = p + q
      const eqDiag1 = `y=x${c === 0 ? '' : ecritureAlgebrique(c)}`
      const eqDiag2 = `y=-x${s === 0 ? '' : ecritureAlgebrique(s)}`
      const eqVert = `x=${p}`
      const eqHori = `y=${q}`

      const enonce = `Dans le plan complexe muni d'un repère orthonormé $(O\\,;\\,\\vec u,\\vec v)$, déterminer l'ensemble $\\mathcal E$ des points $M$ d'affixe $z=x+\\mathrm{i}y$ ($x$ et $y$ réels) tels que $${expression}$ soit ${nature}.`

      const introduction = decale
        ? `Posons $z=x+\\mathrm{i}y$ avec $x$ et $y$ réels. Alors $z-(${w.tex()})=(${facteurX})+(${facteurY})\\mathrm{i}$.<br>`
        : `Posons $z=x+\\mathrm{i}y$ avec $x$ et $y$ réels.<br>`
      const base = decale
        ? `\\left((${facteurX})+(${facteurY})\\mathrm{i}\\right)^2`
        : '(x+\\mathrm{i}y)^2'
      const developpement = `$\\begin{aligned}
        ${expression}&=${base}\\\\
        &=${carreX}+2${produit}\\mathrm{i}+${carreY}\\mathrm{i}^2\\\\
        &=\\left(${carreX}-${carreY}\\right)+2${produit}\\,\\mathrm{i}
        \\end{aligned}$<br>`
      const partieReelle = `${carreX}-${carreY}`
      const partieImag = `2${produit}`
      const conclusion = reel
        ? `$${expression}$ est un nombre réel si et seulement si sa partie imaginaire est nulle :<br>
        $\\begin{aligned}
        z\\in\\mathcal E&\\iff\\operatorname{Im}\\left(${expression}\\right)=0\\\\
        &\\iff ${partieImag}=0\\\\
        &\\iff ${facteurX}=0\\ \\text{ ou }\\ ${facteurY}=0\\\\
        &\\iff ${miseEnEvidence(eqVert)}\\ \\text{ ou }\\ ${miseEnEvidence(eqHori)}
        \\end{aligned}$<br>
        $\\mathcal E$ est la réunion de deux droites perpendiculaires : ${decale ? `les droites d'équations $${miseEnEvidence(eqVert)}$ et $${miseEnEvidence(eqHori)}$, parallèles aux axes et sécantes en $\\Omega(${p}\\,;\\,${q})$` : `l'axe des ordonnées $(${miseEnEvidence(eqVert)})$ et l'axe des abscisses $(${miseEnEvidence(eqHori)})$`}.`
        : `$${expression}$ est un imaginaire pur si et seulement si sa partie réelle est nulle :<br>
        $\\begin{aligned}
        z\\in\\mathcal E&\\iff\\operatorname{Re}\\left(${expression}\\right)=0\\\\
        &\\iff ${partieReelle}=0\\\\
        &\\iff \\left(${facteurX}-${terme(facteurY, q)}\\right)\\left(${facteurX}+${terme(facteurY, q)}\\right)=0\\\\
        &\\iff ${facteurX}=${facteurY}\\ \\text{ ou }\\ ${facteurX}=-${terme(facteurY, q)}\\\\
        &\\iff ${miseEnEvidence(eqDiag1)}\\ \\text{ ou }\\ ${miseEnEvidence(eqDiag2)}
        \\end{aligned}$<br>
        $\\mathcal E$ est la réunion des deux droites d'équations $${miseEnEvidence(eqDiag1)}$ et $${miseEnEvidence(eqDiag2)}$, ${decale ? `perpendiculaires et sécantes en $\\Omega(${p}\\,;\\,${q})$` : "c'est-à-dire les bissectrices des axes du repère"}.`
      const remarque = `<br>Le point ${decale ? '$\\Omega$' : '$O$'} appartient à $\\mathcal E$ (il correspond à ${expression === 'z^2' ? '$z=0$' : '$z=' + w.tex() + '$'}, pour lequel le carré est nul).`

      const L = 6
      const trait = (x1: number, y1: number, x2: number, y2: number) =>
        segment(point(x1, y1), point(x2, y2), 'red')
      // Les diagonales sont tronquées au repère [-L ; L]^2
      const xa = Math.max(-L, -L - c)
      const xb = Math.min(L, L - c)
      const xc = Math.max(-L, s - L)
      const xd = Math.min(L, s + L)
      const objets = reel
        ? [trait(p, -L, p, L), trait(-L, q, L, q)]
        : [trait(xa, xa + c, xb, xb + c), trait(xc, -xc + s, xd, -xd + s)]
      // Étiquettes placées hors des zones de graduation des axes : on cherche
      // sur chaque droite un point dont l'étiquette reste à plus de 1,5 unité
      // des deux axes et dans le cadre.
      const positionEtiquette = (
        candidats: number[],
        ordonnee: (x: number) => number,
      ) => {
        const x0 = candidats.find((x) => {
          const y = ordonnee(x)
          return Math.abs(x) >= 1.5 && Math.abs(y) >= 1.5 && Math.abs(y) <= 5
        })
        const x = x0 ?? candidats[0]
        return { x, y: ordonnee(x) }
      }
      const abscisses = (debut: number, fin: number) => {
        const pas = debut < fin ? 0.5 : -0.5
        const liste: number[] = []
        for (let x = debut; pas > 0 ? x <= fin : x >= fin; x += pas)
          liste.push(x)
        return liste
      }
      const etiquette1 = positionEtiquette(
        abscisses(Math.min(xb, 5) - 0.5, xa + 0.5),
        (x) => x + c - 0.8,
      )
      const etiquette2 = positionEtiquette(
        abscisses(Math.max(xc, -5) + 0.5, xd - 0.5),
        (x) => -x + s + 0.8,
      )
      const etiquettes = reel
        ? [
            latex2d(eqVert, p < 0 ? p - 1.3 : p + 1.3, L - 1.5, {
              color: 'red',
            }),
            latex2d(eqHori, L - 1.5, q < 0 ? q - 0.7 : q + 0.7, {
              color: 'red',
            }),
          ]
        : [
            latex2d(eqDiag1, etiquette1.x, etiquette1.y, { color: 'red' }),
            latex2d(eqDiag2, etiquette2.x, etiquette2.y, { color: 'red' }),
          ]
      const figure = mathalea2d(
        {
          xmin: -L - 1,
          xmax: L + 1,
          ymin: -L - 1,
          ymax: L + 1,
          scale: 0.5,
        },
        repere({
          xMin: -L,
          xMax: L,
          yMin: -L,
          yMax: L,
          grille: true,
          grilleDistance: 1,
          grilleCouleur: bleuMathalea,
          grilleOpacite: 0.3,
        }),
        ...objets,
        ...etiquettes,
        tracePoint(point(p, q, '')),
        labelPoint(point(p, q, decale ? '$\\Omega$' : '$O$', 'above right')),
      )

      const correctionComplete = `${introduction}${developpement}${conclusion}${remarque}<br>${figure}`
      if (this.interactif) {
        const [eq1, eq2] = reel ? [eqVert, eqHori] : [eqDiag1, eqDiag2]
        const ordre = reel
          ? "l'équation de la droite verticale, puis celle de la droite horizontale"
          : "l'équation de la droite de coefficient directeur $1$, puis celle de la droite de coefficient directeur $-1$"
        const clavierEquation = {
          keyboard: KeyboardType.clavierEntierementPersonnalisable,
          dataKeys: [
            ['7', '8', '9', '4', '5', '6', '1', '2', '3', '0'],
            ['+', '-', '\\times', '='],
            ['x', 'y', 'z', '\\mathrm{i}'],
          ],
        }
        this.listeQuestions[i] = addMultiMathfield(this, i, {
          dataTemplate: `${enonce}<br>$\\mathcal E$ est %{field0} des %{field1} d'équations %{field2} et %{field3}.<br>Donner d'abord ${ordre}.`,
          dataOptions: {
            field0: {
              choices: [
                { label: 'Choisir…', value: '' },
                { label: "l'union", value: 'union' },
                { label: "l'intersection", value: 'intersection' },
              ],
            },
            field1: {
              choices: [
                { label: 'Choisir…', value: '' },
                { label: 'droites', value: 'droites' },
                { label: 'cercles', value: 'cercles' },
                { label: 'demi-droites', value: 'demi-droites' },
              ],
            },
            field2: clavierEquation,
            field3: clavierEquation,
          },
        })
        this.listeCorrections[i] = correctionComplete
        handleAnswers(
          this,
          i,
          {
            field0: { value: 'union' },
            field1: { value: 'droites' },
            field2: { value: eq1, options: { egaliteExpression: true } },
            field3: { value: eq2, options: { egaliteExpression: true } },
            bareme: toutAUnPoint,
          },
          { formatInteractif: 'multi-mathfield' },
        )
      } else {
        createQuestion(this, i, {
          question: enonce,
          correction: correctionComplete,
        })
      }
      i++
    }
    listeQuestionsToContenu(this)
  }
}
