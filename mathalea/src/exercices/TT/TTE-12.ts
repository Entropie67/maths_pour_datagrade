import { courbe } from '../../lib/2d/Courbe'
import { repere } from '../../lib/2d/reperes'
import { latex2d } from '../../lib/2d/textes'
import { bleuMathalea, vertMathalea } from '../../lib/colors'
import { addMultiMathfield } from '../../lib/customElements/MultiMathfield'
import { KeyboardType } from '../../lib/interactif/claviers/keyboard'
import { toutAUnPoint } from '../../lib/interactif/fonctionsBaremes'
import { handleAnswers } from '../../lib/interactif/gestionInteractif'
import { choice, shuffle } from '../../lib/outils/arrayOutils'
import { miseEnEvidence } from '../../lib/outils/embellissements'
import { texNombre } from '../../lib/outils/texNombre'
import { mathalea2d } from '../../modules/mathalea2d'
import { listeQuestionsToContenu } from '../../modules/outils'
import Exercice from '../Exercice'

export const titre = 'Associer des fonctions exponentielles à leurs courbes'
export const dateDePublication = '10/10/2026'
export const uuid = '92930'
export const interactifReady = true
export const refs = {
  'fr-fr': ['TTE-12'],
  'fr-ch': [],
}

export default class AssocierExponentielles extends Exercice {
  constructor() {
    super()
    this.nbQuestions = 1
    this.sup = 3
    this.besoinFormulaireNumerique = [
      'Type de fonctions',
      3,
      '1 : Croissantes\n2 : Décroissantes\n3 : Croissantes et décroissantes',
    ]
    this.consigne =
      'Associer chaque fonction à sa courbe en indiquant le numéro de la courbe.'
    this.spacingCorr = 2
  }

  nouvelleVersion() {
    for (
      let i = 0, attempts = 0;
      i < this.nbQuestions && attempts < 50;
      attempts++
    ) {
      // Des plages disjointes assurent des bases distinctes et des courbes lisibles.
      const increasing = [
        choice([1.2, 1.3]),
        choice([1.6, 1.7]),
        choice([2.5, 2.8]),
        choice([4, 5]),
      ]
      const decreasing = [
        choice([0.2, 0.25]),
        choice([0.35, 0.4]),
        choice([0.55, 0.6]),
        choice([0.75, 0.8]),
      ]
      const bases = shuffle(
        Number(this.sup) === 1
          ? increasing
          : Number(this.sup) === 2
            ? decreasing
            : [decreasing[0], decreasing[2], increasing[1], increasing[3]],
      )
      const curveBases = shuffle(bases)
      if (!this.questionJamaisPosee(i, ...bases, ...curveBases)) continue

      const r = repere({
        xMin: -3.5,
        xMax: 3.5,
        yMin: -0.5,
        yMax: 5.5,
        grille: false,
        xLabelListe: [-3, -2, -1, 1, 2, 3],
        yLabelListe: [1, 2, 3, 4, 5],
      })
      const colors = [bleuMathalea, '#b02030', vertMathalea, '#763ca6']
      const curves = curveBases.map((base, index) =>
        courbe((x) => base ** x, {
          repere: r,
          color: colors[index],
          epaisseur: 2,
          step: 0.025,
        }),
      )
      const labels = curveBases.map((base, index) => {
        // Placer le numéro près de l'extrémité haute, loin du point commun (0 ; 1).
        const x = Math.max(-3, Math.min(3, Math.log(4.5) / Math.log(base)))
        return latex2d(
          `\\mathcal{C}_{${index + 1}}`,
          x + (base > 1 ? -0.25 : 0.25),
          base ** x + 0.35,
          {
            color: colors[index],
            letterSize: 'small',
          },
        )
      })
      let text = 'Les quatre fonctions suivantes sont définies sur $\\R$.<br>'
      text += bases
        .map((base, index) => `$f_{${index + 1}}(x)={${texNombre(base)}}^x$`)
        .join('$\\qquad$')
      text +=
        '<br>' +
        mathalea2d(
          {
            xmin: -4,
            xmax: 4,
            ymin: -0.8,
            ymax: 5.8,
            pixelsParCm: 35,
            scale: 0.8,
          },
          r,
          ...curves,
          ...labels,
        )
      text += addMultiMathfield(this, i, {
        dataTemplate: bases
          .map(
            (_, index) =>
              `Pour $f_{${index + 1}}$, numéro de la courbe : %{champ${index + 1}}.`,
          )
          .join('<br>'),
        dataOptions: {
          champ1: { keyboard: KeyboardType.clavierDeBase, ldots: true },
          champ2: { keyboard: KeyboardType.clavierDeBase, ldots: true },
          champ3: { keyboard: KeyboardType.clavierDeBase, ldots: true },
          champ4: { keyboard: KeyboardType.clavierDeBase, ldots: true },
        },
      })
      const answers = bases.map((base) => curveBases.indexOf(base) + 1)
      handleAnswers(
        this,
        i,
        {
          bareme: toutAUnPoint,
          champ1: { value: answers[0] },
          champ2: { value: answers[1] },
          champ3: { value: answers[2] },
          champ4: { value: answers[3] },
        },
        { formatInteractif: 'multi-mathfield' },
      )

      let correction =
        'Pour $a>1$, la fonction $x\\mapsto a^x$ est strictement croissante sur $\\R$.<br>'
      correction +=
        'Pour $0\\lt a\\lt 1$, elle est strictement décroissante sur $\\R$.<br>'
      correction +=
        'Si $0\\lt a\\lt b$, alors $a^x\\lt b^x$ pour $x>0$ et $a^x>b^x$ pour $x\\lt 0$. Toutes ces courbes passent par le point $(0;1)$.<br>'
      const orderedBases = [...bases].sort((a, b) => a - b)
      correction += `Les bases sont ordonnées ainsi : $${orderedBases.map((base) => texNombre(base)).join('\\lt ')}$.<br>`
      correction += `Pour les abscisses strictement positives, les courbes sont donc, de bas en haut : $${orderedBases.map((base) => `\\mathcal{C}_{${curveBases.indexOf(base) + 1}}`).join(',\\;')}$. Pour les abscisses strictement négatives, cet ordre est inversé.<br>`
      correction += bases
        .map(
          (base, index) =>
            `La fonction $f_{${index + 1}}$ est strictement ${base > 1 ? 'croissante' : 'décroissante'} car $${base > 1 ? `${texNombre(base)}>1` : `0\\lt ${texNombre(base)}\\lt 1`}$. Sa courbe est $\\mathcal{C}_{${answers[index]}}$ : le numéro attendu est $${miseEnEvidence(answers[index])}$.`,
        )
        .join('<br>')
      this.listeQuestions[i] = text
      this.listeCorrections[i] = correction
      i++
    }
    listeQuestionsToContenu(this)
  }
}
