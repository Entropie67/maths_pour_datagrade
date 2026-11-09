import { miseEnEvidence } from '../../../lib/outils/embellissements'
import { Courbe, courbe } from '../../../lib/2d/Courbe'
import { fixeBordures } from '../../../lib/2d/fixeBordures'
import { IntegraleComptable } from '../../../lib/2d/IntegraleComptable'
import RepereBuilder from '../../../lib/2d/RepereBuilder'
import { bleuMathalea } from '../../../lib/colors'
import { KeyboardType } from '../../../lib/interactif/claviers/keyboard'
import { propositionsQcm } from '../../../lib/interactif/qcm'
import { interpolationDeLagrange } from '../../../lib/mathFonctions/outilsMaths'
import { range } from '../../../lib/outils/nombres'
import { texNombre } from '../../../lib/outils/texNombre'
import { mathalea2d } from '../../../modules/mathalea2d'
import { randint } from '../../../modules/outils'
import ExerciceSimple from '../../ExerciceSimple'
export const titre = 'Encadrer une intégrale'
export const interactifReady = true

export const dateDePublication = '26/04/2025'

export const dateDeModifImportante = '31/10/2026'
export const uuid = '667d9'
export const refs = {
  'fr-fr': [],
  'fr-ch': [],
}

/**
 * Exercice test
 * @author Jean-claude Lhote

*/
export default class IntegraleSurface extends ExerciceSimple {
  constructor() {
    super()
    this.typeExercice = 'simple'
    this.formatInteractif = 'qcm'
    this.nbQuestions = 1
    this.nbQuestionsModifiable = false
    this.besoinFormulaireNumerique = [
      'Unité de quadrillage',
      2,
      "1 : unité graphique\n2 : quart de l'unité graphique",
    ]
    this.sup = 1
    this.formatChampTexte = KeyboardType.clavierCompareAvecNombres
  }

  nouvelleVersion() {
    const pas = 1 / this.sup
    let cF: Courbe
    do {
      const a = randint(1, 8)
      const b = randint(0, 8, a)
      const c = randint(0, 8, [a, b])
      const d = randint(1, 8, [a, b, c])
      const f = interpolationDeLagrange([
        { x: 0, y: a / 2 },
        { x: 2.5, y: b / 2 },
        { x: 4, y: c / 2 },
        { x: 5, y: d / 2 },
      ]).fonction
      const yMax =
        Math.max(
          ...range(10)
            .map((n) => n / 2)
            .map((x) => f(x)),
        ) + 1
      const integrale = new IntegraleComptable(f, {
        xMin: 0,
        xMax: 5,
        pas,
        sup: false,
        colorPositif: 'red',
        colorNegatif: bleuMathalea,
      })
      const integrale2 = new IntegraleComptable(f, {
        xMin: 0,
        xMax: 5,
        pas,
        sup: true,
        colorPositif: 'red',
        colorNegatif: bleuMathalea,
      })
      const repere = new RepereBuilder({ xMin: 0, xMax: 5, yMin: 0, yMax })
        .setThickX({ xMin: 0, xMax: 5.5, dx: 1 })
        .setThickY({ yMin: 0, yMax, dy: 1 })
        .setLabelX({ xMin: 0, xMax: 5.5, dx: 1 })
        .setLabelY({ yMin: 0, yMax, dy: 1 })
        .setGrille({
          grilleX: { dx: pas, xMin: 0, xMax: 5 },
          grilleY: { dy: pas, yMin: 0, yMax },
        })
        .buildStandard()
      cF = courbe(f, {
        repere,
        color: bleuMathalea,
        epaisseur: 1,
        xMin: 0,
        xMax: 5,
        step: 0.1,
      })
      const objets1 = [repere, integrale, cF]
      const objets2 = [repere, integrale2, cF]
      const fig = mathalea2d(
        Object.assign(
          { pixelsParCm: 30, scale: 0.7 },
          fixeBordures([repere, cF]),
        ),
        repere,
        cF,
      )
      const figCorr1 = mathalea2d(
        Object.assign(
          { pixelsParCm: 30, scale: 0.7, display: 'inline-block' } as const,
          fixeBordures(objets1),
        ),
        objets1,
      )
      const figCorr2 = mathalea2d(
        Object.assign(
          { pixelsParCm: 30, scale: 0.7, display: 'inline-block' } as const,
          fixeBordures(objets2),
        ),
        objets2,
      )
      this.reponse = '0'
      this.question = `On a représenté ci-dessous graphiquement la fonction $f$ définie sur $[0;5]$.<br>
      Quels sont les encadrements qui conviennent pour $\\mathcal{A}=\\int_{0}^{5}f(x)\\,\\mathrm{d}x$ ?<br>
      
      ${fig}`
      const integrale3 = new IntegraleComptable(f, {
        xMin: 0,
        xMax: 5,
        pas: 0.1,
        sup: false,
        colorPositif: 'red',
        colorNegatif: bleuMathalea,
      })
      const integrale4 = new IntegraleComptable(f, {
        xMin: 0,
        xMax: 5,
        pas: 0.1,
        sup: true,
        colorPositif: 'red',
        colorNegatif: bleuMathalea,
      })
      const aireFine = Math.round(
        (integrale3.aire.positive + integrale4.aire.positive) / 2,
      ) // Number(integrale3.objets?.map(p => p.aire * (p.color[0] === 'red' ? 1 : -1)).reduce((a, b) => a + b))
      const aireSup = integrale2.aire.positive // Number(integrale2.objets?.map(p => p.aire * (p.color[0] === 'red' ? 1 : -1)).reduce((a, b) => a + b))
      const aireInf = integrale.aire.positive // Number(integrale.objets?.map(p => p.aire * (p.color[0] === 'red' ? 1 : -1)).reduce((a, b) => a + b))
      this.correction = `Un encadrement par deux entiers de $\\int_{0}^{5}f(x)\\,\\mathrm{d}x$ est donné par les aires des zones colorées.<br>
      Sous la courbe, on a $${Math.round(aireInf / pas / pas)}$ carreaux et au-dessus de la courbe, on a $${aireSup / pas / pas}$ carreaux.<br>
      ${
        pas === 1
          ? "Comme l'unité d'aire est de $1$ carreau"
          : "Comme l'unité d'aire est de $4$ carreaux"
      }
 on obtient $${miseEnEvidence(texNombre(Math.floor(aireInf), 0))}<\\int_{0}^{5}f(x)\\,\\mathrm{d}x<${miseEnEvidence(texNombre(Math.ceil(aireSup), 0))}$<br>
     
      ${figCorr1} ${figCorr2}`
      this.autoCorrection[0] = {
        propositions: [
          {
            texte: `$${aireFine + 2}<\\mathcal{A}<${aireFine + 7}$`,
            statut: false,
          },
          {
            texte: `$${texNombre(aireInf, 0)}<\\mathcal{A}<${texNombre(aireSup, 0)}$`,
            statut: true,
          },
          {
            texte: `$${texNombre(aireInf - 2, 0)}<\\mathcal{A}<${texNombre(aireSup + 2, 0)}$`,
            statut: true,
          },
          {
            texte: `$${Math.max(0, aireFine - 7)}<\\mathcal{A}<${aireFine - 2}$`,
            statut: false,
          },
        ],
      }
      this.question += propositionsQcm(this, 0).texte
    } while (
      cF.objets == null ||
      Math.min(...cF.objets.map((p) => p.bordures[1])) < 0
    )
  }
}
