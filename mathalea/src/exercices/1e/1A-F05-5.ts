import { courbe } from '../../lib/2d/Courbe'
import { repere } from '../../lib/2d/reperes'
import { texteParPosition } from '../../lib/2d/textes'
import { bleuMathalea, orangeMathalea } from '../../lib/colors'
import {
  addTableauSignesVariations,
  creerTableauSignesVariations,
} from '../../lib/customElements/TableauSignesVariationsElement'
import { configCorrige } from '../../lib/interactif/tableauSignesVariations/helpers'
import type {
  CelluleSigne,
  TableauSVConfig,
} from '../../lib/interactif/tableauSignesVariations/types'
import { choice } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { context } from '../../modules/context'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu, randint } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = "Déterminer graphiquement le signe d'une fonction affine"
export const dateDePublication = '06/10/2026'
/**
 * @author Rémi Angot
 */
export const uuid = '35376'
export const refs = { 'fr-fr': ['1A-F05-5'], 'fr-ch': [] }
export const interactifReady = true

/** Lecture directe du signe, sans expression algébrique à étudier. */
export default class ReadCurveSign extends Exercice {
  protected quadratic = false

  constructor() {
    super()
    this.nbQuestions = 1
  }

  nouvelleVersion() {
    for (
      let i = 0, attempts = 0;
      i < this.nbQuestions && attempts < 50;
      attempts++
    ) {
      const roots = this.quadratic
        ? [randint(-3, -1), randint(1, 3)]
        : [randint(-3, 3)]
      const orientation = choice([-1, 1])
      const xMin = this.quadratic ? roots[0] - 1 : -5
      const xMax = this.quadratic ? roots[1] + 1 : 5
      const boundaries = [xMin, ...roots, xMax]
      const f = (x: number) =>
        this.quadratic
          ? (orientation * (x - roots[0]) * (x - roots[1])) / 4
          : (orientation * (x - roots[0])) / 2
      const signs = boundaries
        .slice(0, -1)
        .map<'+' | '-'>((left, index) =>
          f((left + boundaries[index + 1]) / 2) > 0 ? '+' : '-',
        )
      const cells: CelluleSigne[] = [{ symbole: '' }]
      signs.forEach((sign, index) => {
        cells.push(
          { symbole: '', editable: true, expected: sign },
          { symbole: index < roots.length ? '|0' : '' },
        )
      })
      const config: TableauSVConfig = {
        variableName: 'x',
        colonnes: [
          { valeur: String(xMin) },
          ...roots.map((root) => ({
            valeur: '',
            editable: true,
            expected: String(root),
          })),
          { valeur: String(xMax) },
        ],
        lignes: [{ type: 'signe', label: 'f(x)', cellules: cells }],
      }
      const correctedConfig = configCorrige(config, { enEvidence: true })
      const correctTable = creerTableauSignesVariations(correctedConfig, {
        readonly: true,
        numeroExercice: this.numeroExercice,
        numeroQuestion: i,
      })
      // Réponse courte (correction minimale) : le tableau complété, tout en orange
      const shortAnswer = creerTableauSignesVariations(
        { ...correctedConfig, couleur: orangeMathalea },
        {
          readonly: true,
          id: `tableauSignesReponseCourteEx${this.numeroExercice}Q${i}`,
        },
      )
      const axes = repere({
        xMin: xMin - 0.5,
        xMax: xMax + 0.5,
        yMin: -4.5,
        yMax: 4.5,
        grilleX: false,
        grilleY: false,
        grilleSecondaire: true,
        grilleSecondaireXDistance: 1,
        grilleSecondaireYDistance: 1,
      })
      const figure = mathalea2d(
        {
          xmin: xMin - 0.7,
          xmax: xMax + 0.7,
          ymin: -4.7,
          ymax: 4.7,
          pixelsParCm: 30,
          scale: 0.6,
          center: !context.isHtml,
        },
        axes,
        courbe(f, {
          repere: axes,
          xMin,
          xMax,
          step: 0.05,
          color: bleuMathalea,
        }),
        texteParPosition('O', -0.3, -0.3, 0, 'black', 1),
      )
      let text = `On donne la représentation graphique d'une fonction $f$ définie sur $[${xMin};${xMax}]$.<br>${figure}<br>Compléter le tableau de signes de $f$.`
      const zerosText = roots
        .map((root) => `$x=${miseEnEvidence(root)}$`)
        .join(' et ')
      const intervalsText = signs
        .map((sign, index) => {
          const leftBracket = index === 0 ? '[' : ']'
          const rightBracket = index === signs.length - 1 ? ']' : '['
          return `La courbe est ${sign === '+' ? 'au-dessus' : 'au-dessous'} de l'axe des abscisses sur $${leftBracket}${boundaries[index]};${boundaries[index + 1]}${rightBracket}$, donc $f(x)${miseEnEvidence(sign === '+' ? '>0' : '<0')}$.`
        })
        .join('<br>')
      const correction = `La courbe coupe l'axe des abscisses pour ${zerosText} : la fonction s'annule en ces abscisses.<br>${intervalsText}<br>On obtient le tableau de signes suivant :<br>${correctTable}`
      if (this.questionJamaisPosee(i, ...roots, orientation)) {
        text += `<br>${addTableauSignesVariations(this, i, {
          config,
          bareme: 1,
          interactivityOn: this.interactif,
        })}`
        this.listeQuestions[i] = text
        this.listeCorrections[i] = correction
        this.listeReponsesCourtes[i] = shortAnswer
        i++
      }
    }
    listeQuestionsToContenu(this)
  }
}
