import { point } from '../../lib/2d/PointAbstrait'
import { droite } from '../../lib/2d/droites'
import { repere } from '../../lib/2d/reperes'
import { labelPoint } from '../../lib/2d/textes'
import { tracePoint } from '../../lib/2d/TracePoint'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { Complexe } from '../../lib/mathFonctions/Complexe'
import { combinaisonListes } from '../../lib/outils/arrayOutils'
import { texFractionReduite } from '../../lib/outils/deprecatedFractions'
import { miseEnEvidence, texteEnCouleurEtGras } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const interactifReady = true
export const titre = 'Déterminer si trois points sont alignés avec les affixes'
export const dateDePublication = '28/10/2026'
export const uuid = '98377'
export const refs = { 'fr-fr': ['TEC2-13'], 'fr-ch': [] }

/**
 * Calculer les affixes des vecteurs AB et AC, puis déterminer si A, B et C sont alignés.
 * @author Stéphane Guyon
 */
export default class PointsAlignesComplexes extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.spacingCorr = 2
  }

  nouvelleVersion(): void {
    // Moitié de points alignés, moitié non alignés
    const listeAlignes = combinaisonListes([true, false], this.nbQuestions)
    for (let i = 0, cpt = 0; i < this.nbQuestions && cpt < 200; ) {
      cpt++
      const aligne = listeAlignes[i]
      const xA = randint(-4, 4)
      const yA = randint(-4, 4)
      let p: number
      let q: number
      let r: number
      let s: number
      if (aligne) {
        // AB = m(u, v) et AC = n(u, v)
        const u = randint(-2, 2, [0])
        const v = randint(-2, 2, [0])
        const m = randint(-3, 3, [0])
        const n = randint(-3, 3, [0, m])
        p = m * u
        q = m * v
        r = n * u
        s = n * v
      } else {
        p = randint(-6, 6, [0])
        q = randint(-6, 6, [0])
        r = randint(-6, 6, [0])
        s = randint(-6, 6, [0])
        if (p * s - q * r === 0) continue
        // Évite des points quasi alignés ou trop proches
        if (Math.abs(p * s - q * r) < 4) continue
      }
      const xB = xA + p
      const yB = yA + q
      const xC = xA + r
      const yC = yA + s
      if (Math.min(xA, xB, xC, yA, yB, yC) < -8 || Math.max(xA, xB, xC, yA, yB, yC) > 8) continue
      if (xB === xC && yB === yC) continue

      const zA = new Complexe(xA, yA)
      const zB = new Complexe(xB, yB)
      const zC = new Complexe(xC, yC)
      const zAB = new Complexe(p, q)
      const zAC = new Complexe(r, s)

      const A = point(xA, yA, 'A', 'above left')
      const B = point(xB, yB, 'B', 'below right')
      const C = point(xC, yC, 'C', 'above right')
      const xs = [xA, xB, xC, 0]
      const ys = [yA, yB, yC, 0]
      const xMin = Math.min(...xs) - 1
      const xMax = Math.max(...xs) + 1
      const yMin = Math.min(...ys) - 1
      const yMax = Math.max(...ys) + 1
      const objets = [
        repere({
          xMin,
          xMax,
          yMin,
          yMax,
          xUnite: 1,
          yUnite: 1,
          grille: true,
          grilleDistance: 1,
          grilleCouleur: 'gray',
          grilleOpacite: 0.4,
          xThickDistance: 1,
          yThickDistance: 1,
          xLegende: '',
          yLegende: '',
          axeXStyle: '->',
          axeYStyle: '->',
        }),
        tracePoint(A, B, C),
        labelPoint(A, B, C),
      ]
      const figure = mathalea2d(
        {
          xmin: xMin - 0.5,
          xmax: xMax + 0.5,
          ymin: yMin - 0.5,
          ymax: yMax + 0.5,
          pixelsParCm: 30,
          scale: 0.6,
        },
        ...objets,
        ...(aligne ? [droite(A, B)] : []),
      )

      const enonceAffixes = `Dans le plan complexe, on considère les points $A$, $B$ et $C$ d’affixes respectives $z_A=${zA.tex()}$, $z_B=${zB.tex()}$ et $z_C=${zC.tex()}$.`

      const calculs = `${enonceAffixes}<br>Calculer les affixes des vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$.`
      const enonce = `${calculs} Les points $A$, $B$ et $C$ sont-ils alignés ?`
      if (this.interactif && context.isHtml && !context.isTypst) {
        this.listeQuestions[i] = addMultiMathfield(this, i, {
          dataTemplate: `${calculs}<br>
            $z_{\\overrightarrow{AB}}=$ %{field0}<br>
            $z_{\\overrightarrow{AC}}=$ %{field1}<br>
            Les points $A$, $B$ et $C$ %{field2}.`,
          dataOptions: {
            field0: { keyboard: KeyboardType.complexes },
            field1: { keyboard: KeyboardType.complexes },
            field2: {
              choices: [
                { label: 'Choisir', value: '' },
                { label: 'sont alignés', value: 'alignes' },
                { label: 'ne sont pas alignés', value: 'non alignes' },
              ],
            },
          },
        })
        handleAnswers(
          this,
          i,
          {
            field0: { value: zAB.tex() },
            field1: { value: zAC.tex() },
            field2: { value: aligne ? 'alignes' : 'non alignes' },
            bareme: toutAUnPoint,
          },
          { formatInteractif: 'multi-mathfield' },
        )
      } else {
        this.listeQuestions[i] = enonce
      }
      const calculsCorr = `$z_{\\overrightarrow{AB}}=z_B-z_A=(${zB.tex()})-(${zA.tex()})=${zAB.tex()}$ ;<br>
        $z_{\\overrightarrow{AC}}=z_C-z_A=(${zC.tex()})-(${zA.tex()})=${zAC.tex()}$.<br>`
      // p et q sont non nuls : k est le quotient des parties réelles
      const k = texFractionReduite(r, p)
      const kq = texFractionReduite(r * q, p)
      // k z_AB = r + (kq)i
      const produit = `${r}${kq.startsWith('-') ? '' : '+'}${kq}i`
      const debut = `${calculsCorr}Le quotient des parties réelles est $\\dfrac{${r}}{${p}}=${k}$.<br>`
      if (aligne) {
        this.listeCorrections[i] =
          `${debut}On observe que $${k}\\times (${zAB.tex()})=${produit}=${zAC.tex()}$,<br>` +
          `donc $z_{\\overrightarrow{AC}}=${k}\\,z_{\\overrightarrow{AB}}$ : les vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ sont colinéaires.<br>` +
          `${texteEnCouleurEtGras('Les points $A$, $B$ et $C$ sont alignés')}.`
      } else {
        this.listeCorrections[i] =
          `${debut}On observe que $${k}\\times (${zAB.tex()})=${produit}\\neq ${zAC.tex()}$,<br>` +
          `donc il n'existe pas de réel $k$ tel que $z_{\\overrightarrow{AC}}=k\\,z_{\\overrightarrow{AB}}$ : les vecteurs $\\overrightarrow{AB}$ et $\\overrightarrow{AC}$ ne sont pas colinéaires.<br>` +
          `${texteEnCouleurEtGras('Les points $A$, $B$ et $C$ ne sont pas alignés')}.`
      }
      this.listeCorrections[i] += `<br>${figure}`
      i++
    }
    listeQuestionsToContenu(this)
  }
}
